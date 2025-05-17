import { App, TFolder, requestUrl } from 'obsidian';
import { filterStringData, parseChapters, parseISODuration, parseVideoId } from 'src/utils/parser';
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
import { getAvailablePath, getFilenameExtension, isFolderExists } from 'src/utils/file';

const baseUrlForVideos = 'https://www.googleapis.com/youtube/v3/videos?';
const baseUrlForChannels = 'https://www.googleapis.com/youtube/v3/channels?';

export async function getVideoData(videoUrl: string, settings: YouTubeTemplatePluginSettings): Promise<VideoData> {
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

		const thumbnailUrl = getBestThumbnailUrl(Object.values(videoResponse.items[0].snippet.thumbnails));

		return {
			id: videoResponse.items[0].id,
			title: filterStringData(videoResponse.items[0].snippet.title),
			channelName: filterStringData(videoResponse.items[0].snippet.channelTitle),
			subscribers: parseInt(channelsResponse.items[0].statistics.subscriberCount),
			length: parseISODuration(videoResponse.items[0].contentDetails.duration),
			//@ts-ignore
			publishDate: moment(videoResponse.items[0].snippet.publishedAt).format('YYYY-MM-DD'),
			thumbnail: '',
			thumbnailUrl,
			chapters: parseChapters(videoResponse.items[0].snippet.description).map(
				(chapter) => `${chapter.timestamp} ${filterStringData(chapter.title)}`,
			),
			hashtags: videoResponse.items[0].snippet.tags ?? [],
			description: '',
			//@ts-ignore
			noteCreated: moment().format('YYYY-MM-DD'),
			//@ts-ignore
			noteCreatedDateTime: moment().format('YYYY-MM-DD HH:mm'),
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

function getBestThumbnailUrl(availableThumbnails: Thumbnail[]): string {
	let bestThumbnailIdx = 0;

	for (let i = 1; i < availableThumbnails.length; i++) {
		if (availableThumbnails[i].width > availableThumbnails[bestThumbnailIdx].width) {
			bestThumbnailIdx = i;
		}
	}

	return availableThumbnails[bestThumbnailIdx].url;
}

export async function downloadVideoThumbnail(
	app: App,
	createFolders: boolean,
	imageUrl: string,
	title: string,
	path: string,
): Promise<string | undefined> {
	const attachmentFolderPath = app.vault.getConfig('attachmentFolderPath');
	const filename = `${title}.${getFilenameExtension(imageUrl)}`;
	let fullpath;

	if (attachmentFolderPath.startsWith('./') && attachmentFolderPath.length === 2) {
		fullpath = `${path}/${filename}`;
	} else {
		const abstractFile = this.app.vault.getAbstractFileByPath(attachmentFolderPath);

		if (!(abstractFile instanceof TFolder)) {
			if (createFolders && !isFolderExists(attachmentFolderPath, app)) {
				await app.vault.createFolder(attachmentFolderPath);
			} else {
				throw new Error(
					`Attachment folder '${attachmentFolderPath}' does not exist. Check if the folder path is correct in your Settings → Files and links → Default location for new attachments. Or you can turn on option 'Create folders' in the plugin settings.`,
				);
			}
		}
		fullpath = `${app.vault.getConfig('attachmentFolderPath')}/${filename}`;
	}

	const response = await requestUrl(imageUrl);
	await app.vault.createBinary(getAvailablePath(fullpath, app), response.arrayBuffer);

	return filename;
}
