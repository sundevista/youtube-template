import 'obsidian';

declare module 'obsidian' {
  interface Vault {
    getAvailablePathForAttachments: (fileName: string, extension?: string, currentFile?: TFile) => Promise<string>;
    getConfig(name: string): string;
  }
}
