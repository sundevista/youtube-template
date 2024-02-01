import { App, TFolder, requestUrl } from 'obsidian';
import { filterStringData, parseAttachmentFolder, parseChapters, parseISODuration, parseVideoId } from 'src/utils/parser';
import { YouTubeTemplatePluginSettings } from '../settings';
import { VideoData } from '../types/video-data';
import { ChannelListResponse, Thumbnail, VideoListResponse } from '../types/youtube-response';
import {
	NO_CHANNEL_ERROR,
	NO_INTERNET_CATCHING_ERROR,
	NO_INTERNET_ERROR,
	NO_VIDEO_ERROR,
	WRONG_API_KEY_ERROR,
} from '../utils/constants';

const baseUrlForVideos = 'https://www.googleapis.com/youtube/v3/videos?';
const baseUrlForChannels = 'https://www.googleapis.com/youtube/v3/channels?';

export async function getVideoData(
	videoUrl: string,
	settings: YouTubeTemplatePluginSettings,
	downloadThumbnail: boolean,
): Promise<VideoData> {
	let thumbnailLink = '';

	try {
		const videoResponse: VideoListResponse = await requestUrl(
			baseUrlForVideos + `part=snippet,contentDetails&id=${parseVideoId(videoUrl)}&key=${settings.googleCloudApiKey}`,
		).json;

		if (videoResponse.items.length === 0) {
			throw new Error(NO_VIDEO_ERROR);
		}

		const channelsResponse: ChannelListResponse = await requestUrl(
			baseUrlForChannels +
			`part=statistics&id=${videoResponse.items[0].snippet.channelId}&key=${settings.googleCloudApiKey}`,
		).json;

		if (channelsResponse.items.length === 0) {
			throw new Error(NO_CHANNEL_ERROR);
		}

		console.log(videoResponse);
		console.log(channelsResponse);

		if (downloadThumbnail) {
			const thumbnails = videoResponse.items[0].snippet.thumbnails;
			thumbnailLink = (await downloadVideoThumbnail(this.app, Object.values(videoResponse.items[0].snippet.thumbnails))) ?? '';
		}

		return {
			id: videoResponse.items[0].id,
			title: filterStringData(videoResponse.items[0].snippet.title),
			channelName: filterStringData(videoResponse.items[0].snippet.channelTitle),
			subscribers: parseInt(channelsResponse.items[0].statistics.subscriberCount),
			length: parseISODuration(videoResponse.items[0].contentDetails.duration),
			//@ts-ignore
			publishDate: moment(videoResponse.items[0].snippet.publishedAt).format('YYYY-MM-DD'),
			thumbnail: thumbnailLink ?? '',
			chapters: parseChapters(videoResponse.items[0].snippet.description).map(
				(chapter) => `${chapter.timestamp} ${filterStringData(chapter.title)}`,
			),
			hashtags: videoResponse.items[0].snippet.tags ?? [],
			description: '',
			//@ts-ignore
			noteCreated: moment().format('YYYY-MM-DD, HH:mm'),
			youtubeUrl: videoUrl,
		};
	} catch (error) {
		if (error?.message === NO_INTERNET_CATCHING_ERROR) {
			throw new Error(NO_INTERNET_ERROR);
		} else if (error?.status && error.status.toString().startsWith('4')) {
			throw new Error(WRONG_API_KEY_ERROR);
		}

		throw Error(error?.message ? error.message : error);
	}
}

export async function downloadVideoThumbnail(app: App, availableThumbnaisl: Thumbnail[]): Promise<string | undefined> {
	let bestThumbnailIdx = 0;

	for (let i = 1; i < availableThumbnaisl.length; i++) {
		if (availableThumbnaisl[i].width > availableThumbnaisl[bestThumbnailIdx].width) {
			bestThumbnailIdx = i;
		}
	}

	const imageUrl = availableThumbnaisl[bestThumbnailIdx].url;

	const response = await requestUrl(imageUrl);

	const filename = `${new Date().getTime()}.${imageUrl.split('.').pop()}`;
	const abstractFile = this.app.vault.getAbstractFileByPath(parseAttachmentFolder(app.vault.getConfig('attachmentFolderPath')));

	if (!(abstractFile instanceof TFolder)) {
		throw new Error(`Attachment folder '${app.vault.getConfig('attachmentFolderPath')}' does not exist. Check if the folder path is correct in your Settings → Files and links → Default location for new attachments.`);
	}

	await app.vault.createBinary(`${app.vault.getConfig('attachmentFolderPath')}/${filename}`, response.arrayBuffer);

	return filename;
}
