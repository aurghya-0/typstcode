import { $typst } from '@myriaddreamin/typst.ts';

let isInitialized = false;
let initPromise: Promise<void> | null = null;

async function initTypstWasm() {
  if (isInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      $typst.setCompilerInitOptions({
        getModule: () =>
          'https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-web-compiler@0.7.0/pkg/typst_ts_web_compiler_bg.wasm'
      });
      $typst.setRendererInitOptions({
        getModule: () =>
          'https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-renderer@0.7.0/pkg/typst_ts_renderer_bg.wasm'
      });
      isInitialized = true;
    } catch (err) {
      console.error('Failed to initialize Typst WASM modules:', err);
      initPromise = null;
    }
  })();

  return initPromise;
}

export interface CompilationResult {
  success: boolean;
  pages: string[];
  diagnostics: Array<{ line: number; column: number; message: string; hint?: string }>;
  rawError: string;
  timeMs: number;
}

export async function compileTypstWasm(code: string): Promise<CompilationResult> {
  const startTime = Date.now();
  try {
    await initTypstWasm();

    const svgResult = await $typst.svg({ mainContent: code });
    const timeMs = Date.now() - startTime;

    if (!svgResult || svgResult.trim().length === 0) {
      return {
        success: false,
        pages: [],
        diagnostics: [{ line: 1, column: 1, message: 'Compilation returned empty output' }],
        rawError: 'Compilation returned empty output',
        timeMs
      };
    }

    // $typst.svg outputs SVG markup. Split into individual page SVGs if multiple are rendered
    const pages = svgResult
      .split(/(?<=<\/svg>)\s*(?=<svg)/gi)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    return {
      success: true,
      pages: pages.length > 0 ? pages : [svgResult],
      diagnostics: [],
      rawError: '',
      timeMs
    };
  } catch (err: any) {
    const timeMs = Date.now() - startTime;
    const errMsg = err?.message || String(err) || 'WASM Compilation Error';
    
    // Parse line/col from error message if available
    const matchLoc = errMsg.match(/(\d+):(\d+)/);
    const line = matchLoc ? parseInt(matchLoc[1], 10) : 1;
    const column = matchLoc ? parseInt(matchLoc[2], 10) : 1;

    return {
      success: false,
      pages: [],
      diagnostics: [{ line, column, message: errMsg }],
      rawError: errMsg,
      timeMs
    };
  }
}
