import { App, TAbstractFile, TFile, TFolder } from 'obsidian';

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
