import { YouTubeTemplatePluginSettings } from '../settings';
import { VideoData } from '../types/video-data';
import { filterFilename } from './parser';

function replaceAll(str: string, find: string, replace: string): string {
  return str.replace(new RegExp(find, 'g'), replace);
}

function processTemplateKey(key: string, videoData: VideoData, settings: YouTubeTemplatePluginSettings): string {
  switch (key) {
    case 'chapters':
      return videoData.chapters.map((chapter) => replaceAll(settings.chapterFormat, '{{chapter}}', chapter)).join('');
    case 'hashtags':
      return videoData.hashtags.map((hashtag) => replaceAll(settings.hashtagFormat, '{{hashtag}}', hashtag)).join('');
    default:
      return key in videoData ? videoData[key as keyof VideoData].toString() : '';
  }
}

export function processTemplate(videoData: VideoData, settings: YouTubeTemplatePluginSettings, usePathTemplate = false): string {
  let template = usePathTemplate ? settings.pathTemplate : settings.template;

  Object.keys(videoData).forEach((key) => {
    template = replaceAll(
      template,
      `{{${key}}}`,
      usePathTemplate
        ? filterFilename(processTemplateKey(key, videoData, settings))
        : processTemplateKey(key, videoData, settings),
    );
  });

  return template;
}
