import { App, TAbstractFile, TFile, TFolder } from 'obsidian';

const illegalRe = /[\/\?<>\\:\*\|"]/g;
const controlRe = /[\x00-\x1f\x80-\x9f]/g;
const reservedRe = /^\.+$/;
const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
const windowsTrailingRe = /[\. ]+$/;

function truncate(sanitized: string, length: number): string {
	const uint8Array = new TextEncoder().encode(sanitized);
	const truncated = uint8Array.slice(0, length);
	return new TextDecoder().decode(truncated);
}

function sanitize(input: string, replacement: string): string {
	const sanitized = input
		.replace(illegalRe, replacement)
		.replace(controlRe, replacement)
		.replace(reservedRe, replacement)
		.replace(windowsReservedRe, replacement)
		.replace(windowsTrailingRe, replacement);
	return truncate(sanitized, 255);
}

export function sanitizeFilename(text: string, options?: { replacement: string }): string {
	const replacement = options?.replacement || '';
	const output = sanitize(text, replacement);

	return replacement === '' ? output : sanitize(output, '');
}

export function findTFile(filepath: string, app: App): TFile | null {
	const abstractFile = app.vault.getAbstractFileByPath(filepath);

	return abstractFile instanceof TFile ? abstractFile : null;
}

// Define a recursive function to get all TFolders
export function getAllTFolders(element: TAbstractFile): TFolder[] {
	let folders: TFolder[] = [];

	if (element instanceof TFolder) {
		folders.push(element);

		for (const child of element.children) {
			folders = folders.concat(getAllTFolders(child));
		}
	}

	return folders;
}

export function isFolderExists(folder: string, app: App): boolean {
	return !!app.vault.getAbstractFileByPath(folder);
}

export function getFilenameExtension(filename: string): string {
	const lastDotIndex = filename.lastIndexOf('.');
	return lastDotIndex !== -1 ? filename.slice(lastDotIndex + 1) : '';
}

export function getAvailablePath(path: string, app: App): string {
	function buildPath(path: string, extenstion: string, hasSlash: boolean, modifier: number): string {
		return `${path}${modifier !== 0 ? ` ${modifier}` : ''}${extenstion ? `.${extenstion}` : ''}${hasSlash ? '/' : ''}`;
	}

	const hasSlash = path.endsWith('/');
	if (hasSlash) path = path.slice(0, -1);

	const extenstion = getFilenameExtension(path);
	if (extenstion) path = path.slice(0, path.lastIndexOf('.'));

	let modifier = 0;

	while (app.vault.getAbstractFileByPath(buildPath(path, extenstion, hasSlash, modifier))) {
		modifier++;
	}

	return buildPath(path, extenstion, hasSlash, modifier);
}
