import { chromium } from 'playwright';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const SCREENSHOT_DIR = path.join(process.cwd(), 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function main() {
  console.log('Starting Vite preview server...');
  const server = spawn('npx', ['vite', 'preview', '--port', '4173'], {
    stdio: 'pipe',
    shell: true
  });

  server.stdout.on('data', (d) => console.log(`[server]: ${d}`));
  server.stderr.on('data', (d) => console.error(`[server err]: ${d}`));

  // Give server time to start
  await new Promise((r) => setTimeout(r, 2500));

  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });

  const page = await context.newPage();

  try {
    console.log('Navigating to http://localhost:4173 ...');
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // 1. Welcome Screen
    console.log('Capturing welcome-screen.png...');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'welcome-screen.png') });

    // 2. Open Templates Modal & Capture
    console.log('Opening Templates Modal...');
    const templateBtn = page.locator('button:has-text("Templates")').first();
    if (await templateBtn.count() > 0) {
      await templateBtn.click();
      await page.waitForTimeout(800);
      console.log('Capturing template-modal.png...');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'template-modal.png') });

      // Select a template (e.g. Modern Project Report or Academic Paper)
      const useTemplateBtn = page.locator('button:has-text("Use Template")').first();
      if (await useTemplateBtn.count() > 0) {
        await useTemplateBtn.click();
      }
    } else {
      await page.locator('button:has-text("New File")').first().click();
    }

    // Wait for WASM compilation & SVG rendering
    console.log('Waiting for document compilation...');
    await page.waitForTimeout(4000);

    // 3. Split View (Editor + Live Preview)
    console.log('Capturing editor-preview-split.png...');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'editor-preview-split.png') });

    // 4. Full Editor View
    console.log('Switching to Editor Mode...');
    const editorModeBtn = page.locator('button[title="Editor Only"]').first();
    if (await editorModeBtn.count() > 0) {
      await editorModeBtn.click();
      await page.waitForTimeout(800);
      console.log('Capturing editor-full-view.png...');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'editor-full-view.png') });
    }

    // 5. Live Preview View
    console.log('Switching to Preview Mode...');
    const previewModeBtn = page.locator('button[title="Preview Only"]').first();
    if (await previewModeBtn.count() > 0) {
      await previewModeBtn.click();
      await page.waitForTimeout(800);
      console.log('Capturing live-preview.png...');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'live-preview.png') });
    }

    console.log('All screenshots generated successfully!');
  } catch (err) {
    console.error('Error generating screenshots:', err);
  } finally {
    await browser.close();
    server.kill();
    process.exit(0);
  }
}

main();
