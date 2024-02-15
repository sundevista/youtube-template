import { normalizePath, Plugin } from 'obsidian';
import { InsertTemplateModal } from './modals/insert-template';
import { DEFAULT_SETTINGS, YouTubeTemplatePluginSettings, YouTubeTemplatePluginSettingsTab } from './settings';

export default class YoutubeTemplatePlugin extends Plugin {
  settings: YouTubeTemplatePluginSettings;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new YouTubeTemplatePluginSettingsTab(this.app, this));

    this.addCommand({
      id: 'youtube-insert-template',
      name: 'Insert template',
      callback: () => {
        new InsertTemplateModal(this.app, this).open();
      },
    });
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
