import { App } from 'obsidian';
import { YouTubeTemplatePluginSettings } from '../settings';
import { VideoData } from '../types/video-data';
import { findTFile } from './file';
import { sanitizeFilename } from './parser';

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

export function processPathTemplate(videoData: VideoData, settings: YouTubeTemplatePluginSettings): string {
  let template = settings.pathTemplate;

  Object.keys(videoData).forEach((key) => {
    template = replaceAll(template, `{{${key}}}`, sanitizeFilename(processTemplateKey(key, videoData, settings)));
  });

  return template;
}

export async function processTemplate(videoData: VideoData, settings: YouTubeTemplatePluginSettings, app: App): Promise<string> {
  let template: string;

  if (settings.useTemplateFile) {
    const file = findTFile(settings.templateFile, app);

    if (!file) throw new Error(`File '${settings.templateFile}' does not exist`);

    template = await app.vault.read(file);
  } else {
    template = settings.template;
  }

  Object.keys(videoData).forEach((key) => {
    template = replaceAll(template, `{{${key}}}`, processTemplateKey(key, videoData, settings));
  });

  return template;
}
