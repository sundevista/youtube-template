import { TAbstractFile, TFile, TFolder } from 'obsidian';

export function findTFile(filepath: string): TFile | null {
	const abstractFile = this.app.vault.getAbstractFileByPath(filepath);

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
