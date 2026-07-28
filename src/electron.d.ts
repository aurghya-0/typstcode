export {};

declare global {
  interface Window {
    electronAPI?: {
      compileTypst: (code: string, rootDir?: string) => Promise<{
        success: boolean;
        pages: string[];
        diagnostics: Array<{ line: number; column: number; message: string; hint?: string }>;
        rawError: string;
        timeMs: number;
      }>;
      openFile: () => Promise<{ filePath: string; content: string } | null>;
      openFolder: () => Promise<{ dirPath: string } | null>;
      saveFile: (filePath: string | null, content: string) => Promise<{ filePath: string } | null>;
      exportPdf: (code: string, suggestedName?: string) => Promise<{ success: boolean; filePath?: string; error?: string } | null>;
      exportPng: (code: string, ppi?: number) => Promise<{ success: boolean; filePath?: string; error?: string } | null>;
      readDir: (dirPath?: string) => Promise<{ success: boolean; dirPath: string; items: Array<{ name: string; isDirectory: boolean; path: string }> }>;
      readFileByPath: (filePath: string) => Promise<{ success: boolean; filePath: string; content: string; error?: string }>;
      getAppVersion: () => Promise<string>;
    };
  }
}
