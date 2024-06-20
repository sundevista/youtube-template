import { App, PluginSettingTab, Setting, TFolder } from 'obsidian';
import YoutubeTemplatePlugin from './main';
import { DEFAULT_CHAPTER_FORMAT, DEFAULT_HASHTAG_FORMAT, DEFAULT_TEMPLATE, ROOT_FOLDER } from './utils/constants';
import { getAllTFolders } from './utils/file';

export interface YouTubeTemplatePluginSettings {
  googleCloudApiKey: string;
  folder: string;
  chapterFormat: string;
  hashtagFormat: string;
  template: string;
  createPaths: boolean;
  usePathTemplate: boolean;
  pathTemplate: string;
  useTemplateFile: boolean;
  templateFile: string;
}

export const DEFAULT_SETTINGS: YouTubeTemplatePluginSettings = {
  googleCloudApiKey: '',
  folder: ROOT_FOLDER,
  chapterFormat: DEFAULT_CHAPTER_FORMAT,
  hashtagFormat: DEFAULT_HASHTAG_FORMAT,
  template: DEFAULT_TEMPLATE,
  createPaths: true,
  usePathTemplate: false,
  pathTemplate: '',
  useTemplateFile: false,
  templateFile: '',
};

export class YouTubeTemplatePluginSettingsTab extends PluginSettingTab {
  plugin: YoutubeTemplatePlugin;

  constructor(app: App, plugin: YoutubeTemplatePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();
    
    containerEl.createEl('h1', { text: 'YouTube Template Plugin Settings' });
    
    new Setting(containerEl)
      .setName('Google Cloud API Key')
      .setDesc(createFragment(doc => {
        doc.createEl('span', { text: 'It\'s a secret API key that you can get from ' });
        doc.createEl('a', { href: 'https://console.cloud.google.com/apis/credentials', text: 'Google Cloud Console' }).setAttr('target', '_blank');
      }))
      .addText((text) =>
        text
          .setPlaceholder('Enter your API key')
          .setValue(this.plugin.settings.googleCloudApiKey)
          .onChange(async (value) => {
            this.plugin.settings.googleCloudApiKey = value;
            await this.plugin.saveSettings();
          }),
      )
      .setClass('youtube-template-plugin__wide-input');

    const rootFolder = this.app.vault.getAbstractFileByPath('/') as TFolder;
    const folders = getAllTFolders(rootFolder);
    const folderOptions = Object.fromEntries(folders.map((folder) => [folder.path, folder.path]));

    new Setting(containerEl)
      .setName('Folder to save the notes')
      .setDesc('Choose the folder where you want to save the notes. The default value is the root folder of your vault.')
      .addDropdown((dropdown) =>
        dropdown
          .addOptions(folderOptions)
          .setValue(this.plugin.settings.folder)
          .onChange(async (value) => {
            this.plugin.settings.folder = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName('Use path template')
      .setDesc('Turn on if you want to use a template for the path where you want to save the notes.')
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.usePathTemplate).onChange(async (value) => {
          this.plugin.settings.usePathTemplate = value;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName('Path template')
      .setDesc(
        "Choose the path where you want to save the notes. You can use all keywords that are available in the template (like {{title}}, {{channelName}} etc) and make something like 'YouTube/{{channelName}}/{{title}}.md'.",
      )
      .addText((text) =>
        text.setValue(this.plugin.settings.pathTemplate).onChange(async (value) => {
          this.plugin.settings.pathTemplate = value;
          await this.plugin.saveSettings();
        }),
      )
      .setClass('youtube-template-plugin__wide-input');

    new Setting(containerEl)
      .setName('Create folders')
      .setDesc('Turn on if you want to create the folders for the templates and attachments if they do not exist.')
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.createPaths).onChange(async (value) => {
          this.plugin.settings.createPaths = value;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName('Chapter format')
      .setDesc('Make the template that will be used to insert chapters. You can use the following variables: {{chapter}}.')
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_CHAPTER_FORMAT)
          .setValue(this.plugin.settings.chapterFormat)
          .onChange(async (value) => {
            this.plugin.settings.chapterFormat = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName('Hashtag format')
      .setDesc('Make the template that will be used to insert hashtags. You can use the following variables: {{hashtag}}.')
      .addTextArea((text) =>
        text
          .setPlaceholder(DEFAULT_HASHTAG_FORMAT)
          .setValue(this.plugin.settings.hashtagFormat)
          .onChange(async (value) => {
            this.plugin.settings.hashtagFormat = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName('Template')
      .setDesc(
        'Make the template that will be used to create the note. You can use the following variables: {{title}}, ' +
          '{{channelName}}, {{subscribers}}, {{length}}, {{publishDate}}, {{thumbnail}} (to download thumbnail, ' +
          'file name will be returned), {{thumbnailUrl}} {{chapters}}, {{hashtags}}, ' +
          '{{description}}, {{noteCreated}}, {{noteCreatedDateTime}}, {{youtubeUrl}}.',
      )
      .addTextArea((text) =>
        text.setValue(this.plugin.settings.template).onChange(async (value) => {
          this.plugin.settings.template = value;
          await this.plugin.saveSettings();
        }),
      )
      .setClass('youtube-template-plugin__template-textarea');

    new Setting(containerEl)
      .setName('Use template file')
      .setDesc('Turn on if you want to use a file with a template to create the note instead of textarea above.')
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.useTemplateFile).onChange(async (value) => {
          this.plugin.settings.useTemplateFile = value;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName('Template file')
      .setDesc(
        'File with template that will be used to create the note. You can use the following You can use the following variables: {{title}}, ' +
          '{{channelName}}, {{subscribers}}, {{length}}, {{publishDate}}, {{thumbnail}} (to download thumbnail, ' +
          'file name will be returned), {{thumbnailUrl}} {{chapters}}, {{hashtags}}, ' +
          '{{description}}, {{noteCreated}}, {{noteCreatedDateTime}}, {{youtubeUrl}}.',
      )
      .addText((text) =>
        text.setValue(this.plugin.settings.templateFile).onChange(async (value) => {
          this.plugin.settings.templateFile = value;
          await this.plugin.saveSettings();
        }),
      )
      .setClass('youtube-template-plugin__wide-input');
  }
}
