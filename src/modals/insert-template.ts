import { App, Modal, Notice, Setting, TextComponent, normalizePath } from 'obsidian';
import { findTFile, getAvailablePath, isFolderExists, sanitizeFilename } from 'src/utils/file';
import { checkPathTemplate } from 'src/utils/parser';
import { getVideoData, downloadVideoThumbnail } from '../apis/youtube';
import YoutubeTemplatePlugin from '../main';
import { NO_CHANNEL_ERROR, NO_INTERNET_ERROR, NO_VIDEO_ERROR, WRONG_API_KEY_ERROR } from '../utils/constants';
import { getTemplate, processPathTemplate, processTemplate } from '../utils/templater';
import { insertTemplate } from 'src/actions/insert-action';

const errorContainerId = 'insert-template-modal__error';

export class InsertTemplateModal extends Modal {
	private videoUrl = '';
	private plugin: YoutubeTemplatePlugin;

	constructor(app: App, plugin: YoutubeTemplatePlugin) {
		super(app);
		this.plugin = plugin;
	}

	onSubmitClick = async () => {
		if (this.videoUrl.length < 11) {
			this.setErrorMessage(this.contentEl, 'Please enter a valid URL (should be at least 11 characters)');
			return;
		}

		try {
			await insertTemplate(this.videoUrl, this.app, this.plugin);
			this.close();
		} catch (error) {
			if (this.plugin.settings.debugMode) console.error(error, error?.message);

			switch (error?.message) {
				case NO_VIDEO_ERROR:
					this.setErrorMessage(this.contentEl, 'No video found with the given URL');
					break;
				case NO_CHANNEL_ERROR:
					this.setErrorMessage(this.contentEl, 'No channel was found with the provided video URL');
					break;
				case NO_INTERNET_ERROR:
					this.setErrorMessage(this.contentEl, 'Please check your internet connection');
					break;
				case WRONG_API_KEY_ERROR:
					this.setErrorMessage(this.contentEl, 'Please check the API key in the settings');
					break;
				default:
					this.setErrorMessage(this.contentEl, `Unexpected error: ${error?.message} `);
					break;
			}
		}
	};

	onEnterKeyPressing = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			this.onSubmitClick();
		}
	};

	setErrorMessage = (contentEl: HTMLElement, message: string) => {
		const errorContainer = contentEl.querySelector(`#${errorContainerId} `);
		if (errorContainer) {
			errorContainer.textContent = message;
		}
	};

	onOpen() {
		const { contentEl } = this;
		contentEl.classList.add('youtube-template-plugin');

		contentEl.createEl('h1', { text: '🔗 Insert Template' });
		contentEl.addEventListener('keydown', this.onEnterKeyPressing);

		contentEl.createDiv({ cls: 'insert-template-modal__input' }, (settingItem) => {
			new TextComponent(settingItem)
				.setValue(this.videoUrl)
				.setPlaceholder('URL of the video')
				.onChange((value) => (this.videoUrl = value));
		});

		const buttonContainer = contentEl.createDiv({ cls: 'insert-template-modal__button-container' });
		contentEl.appendChild(buttonContainer);

		new Setting(buttonContainer).addButton((btn) =>
			btn.setButtonText('Insert (or press Enter)').setCta().onClick(this.onSubmitClick),
		);

		const errorContainer = contentEl.createDiv({
			cls: 'insert-template-modal__error-container',
			attr: { id: errorContainerId },
		});
		contentEl.appendChild(errorContainer);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.removeEventListener('keydown', this.onEnterKeyPressing);
		contentEl.empty();
	}
}
