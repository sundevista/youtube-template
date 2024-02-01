interface Snippet {
	publishedAt: string;
	channelId: string;
	title: string;
	description: string;
	thumbnails: {
		default: Thumbnail;
		medium: Thumbnail;
		high: Thumbnail;
		standard: Thumbnail;
		maxres: Thumbnail;
	};
	channelTitle: string;
	tags: string[];
	categoryId: string;
	liveBroadcastContent: string;
	defaultLanguage: string;
	localized: {
		title: string;
		description: string;
	};
	defaultAudioLanguage: string;
}

export interface Thumbnail {
	url: string;
	width: number;
	height: number;
}

interface ContentDetails {
	duration: string;
	dimension: string;
	definition: string;
	caption: boolean;
	licensedContent: boolean;
	regionRestriction: RegionRestriction;
}

interface RegionRestriction {
	blocked: string[];
}

interface VideoItem {
	kind: string;
	etag: string;
	id: string;
	snippet: Snippet;
	contentDetails: ContentDetails;
}

export interface VideoListResponse {
	kind: string;
	etag: string;
	items: VideoItem[];
	pageInfo: {
		totalResults: number;
		resultsPerPage: number;
	};
}

interface Statistics {
	viewCount: string;
	subscriberCount: string;
	hiddenSubscriberCount: boolean;
	videoCount: string;
}

interface ChannelItem {
	kind: string;
	etag: string;
	id: string;
	statistics: Statistics;
}

export interface ChannelListResponse {
	kind: string;
	etag: string;
	pageInfo: {
		totalResults: number;
		resultsPerPage: number;
	};
	items: ChannelItem[];
}
