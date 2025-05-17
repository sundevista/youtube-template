import { App, normalizePath, Notice, Plugin } from 'obsidian';
import { downloadVideoThumbnail, getVideoData } from 'src/apis/youtube';
import YoutubeTemplatePlugin from 'src/main';
import { findTFile, getAvailablePath, isFolderExists, sanitizeFilename } from 'src/utils/file';
import { checkPathTemplate } from 'src/utils/parser';
import { getTemplate, processPathTemplate, processTemplate } from 'src/utils/templater';

export async function insertTemplate(videoUrl: string, app: App, plugin: YoutubeTemplatePlugin) {
	if (videoUrl.length < 11) {
		new Notice('Please use a valid URL (should be at least 11 characters)');
		return;
	}

	// Get the video data from youtube APIs
	const data = await getVideoData(videoUrl, plugin.settings);

	if (!app.vault.getAbstractFileByPath(plugin.settings.folder)) {
		if (plugin.settings.createPaths && !isFolderExists(plugin.settings.folder, app)) {
			await app.vault.createFolder(plugin.settings.folder);
		} else {
			throw new Error(`Folder '${plugin.settings.folder}' does not exist`);
		}
	}

	// Create a new file with the title of the video
	let filepath;
	if (plugin.settings.usePathTemplate) {
		checkPathTemplate(plugin.settings.pathTemplate);
		filepath = normalizePath(processPathTemplate(data, plugin.settings));
	} else {
		filepath = normalizePath(`${plugin.settings.folder}/${sanitizeFilename(data.title)}.md`);
	}

	if (plugin.settings.allowDuplicates) filepath = getAvailablePath(filepath, app);

	// Check if the file already exists
	if (findTFile(filepath, app)) {
		new Notice(`File ${filepath} already exists`);
	} else {
		const folderPath = filepath.substring(0, filepath.lastIndexOf('/'));
		if (plugin.settings.usePathTemplate && !isFolderExists(folderPath, app)) {
			await app.vault.createFolder(folderPath);
		}

		let thumbnailFileLink = '';
		const template = await getTemplate(plugin.settings, app);

		if (template.contains('{{thumbnail}}')) {
			thumbnailFileLink =
				(await downloadVideoThumbnail(
					app,
					plugin.settings.createPaths,
					data.thumbnailUrl,
					sanitizeFilename(data.title),
					filepath.substring(0, filepath.lastIndexOf('/')),
				)) ?? '';
		}

		data.thumbnail = thumbnailFileLink;

		const dataToWrite = await processTemplate(data, plugin.settings, app);

		await app.vault.create(filepath, dataToWrite);

		const abstractFile = findTFile(filepath, app);
		if (abstractFile) {
			app.workspace.getLeaf().openFile(abstractFile);
		} else {
			new Notice(`Failed to create ${filepath}`);
		}
	}
}
