import { App, Modal, Notice, Setting, TextComponent, normalizePath } from 'obsidian';
import { findTFile, getAvailablePath, isFolderExists, sanitizeFilename } from 'src/utils/file';
import { checkPathTemplate } from 'src/utils/parser';
import { getVideoData, downloadVideoThumbnail } from '../apis/youtube';
import YoutubeTemplatePlugin from '../main';
import { NO_CHANNEL_ERROR, NO_INTERNET_ERROR, NO_VIDEO_ERROR, WRONG_API_KEY_ERROR } from '../utils/constants';
import { getTemplate, processPathTemplate, processTemplate } from '../utils/templater';

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

		// Get the video data from youtube APIs
		try {
			const data = await getVideoData(this.videoUrl, this.plugin.settings);

			if (!this.app.vault.getAbstractFileByPath(this.plugin.settings.folder)) {
				if (this.plugin.settings.createPaths && !isFolderExists(this.plugin.settings.folder, this.app)) {
					await this.app.vault.createFolder(this.plugin.settings.folder);
				} else {
					throw new Error(`Folder '${this.plugin.settings.folder}' does not exist`);
				}
			}

			// Create a new file with the title of the video
			let filepath;
			if (this.plugin.settings.usePathTemplate) {
				checkPathTemplate(this.plugin.settings.pathTemplate);
				filepath = normalizePath(processPathTemplate(data, this.plugin.settings));
			} else {
				filepath = normalizePath(`${this.plugin.settings.folder}/${sanitizeFilename(data.title)}.md`);
			}

			if (this.plugin.settings.allowDuplicates) filepath = getAvailablePath(filepath, this.app);

			// Check if the file already exists
			if (findTFile(filepath, this.app)) {
				new Notice(`File ${filepath} already exists`);
			} else {
				const folderPath = filepath.substring(0, filepath.lastIndexOf('/'));
				if (this.plugin.settings.usePathTemplate && !isFolderExists(folderPath, this.app)) {
					await this.app.vault.createFolder(folderPath);
				}

				let thumbnailFileLink = '';
				const template = await getTemplate(this.plugin.settings, this.app);

				if (template.contains('{{thumbnail}}')) {
					thumbnailFileLink =
						(await downloadVideoThumbnail(
							this.app,
							this.plugin.settings.createPaths,
							data.thumbnailUrl,
							sanitizeFilename(data.title),
							filepath.substring(0, filepath.lastIndexOf('/')),
						)) ?? '';
				}

				data.thumbnail = thumbnailFileLink;

				const dataToWrite = await processTemplate(data, this.plugin.settings, this.app);

				await this.app.vault.create(filepath, dataToWrite);

				const abstractFile = findTFile(filepath, this.app);
				if (abstractFile) {
					this.app.workspace.getLeaf().openFile(abstractFile);
				} else {
					new Notice(`Failed to create ${filepath}`);
				}
			}

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
