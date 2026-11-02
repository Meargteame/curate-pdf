import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = 'C:\\Users\\hp\\.gemini\\antigravity\\brain\\770dfd38-0ddf-4092-b8ba-21dd606976f8\\screenshots';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log('🚀 Launching headless browser from:', EDGE_PATH);
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,1000']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1.5 });

  const tasks = [
    {
      name: '01-marketing-home.png',
      url: 'http://localhost:3001/',
      action: async () => {
        await page.waitForSelector('h1', { timeout: 8000 });
        await new Promise((r) => setTimeout(r, 1200));
      }
    },
    {
      name: '02-public-templates.png',
      url: 'http://localhost:3001/templates',
      action: async () => {
        await page.waitForSelector('h1', { timeout: 8000 });
        await new Promise((r) => setTimeout(r, 1000));
      }
    },
    {
      name: '03-workspace-overview.png',
      url: 'http://localhost:3001/app',
      action: async () => {
        await page.waitForSelector('h1', { timeout: 8000 });
        await new Promise((r) => setTimeout(r, 1000));
      }
    },
    {
      name: '04-template-gallery-modal.png',
      url: 'http://localhost:3001/app/templates',
      action: async () => {
        await page.waitForSelector('button', { timeout: 8000 });
        const buttons = await page.$$('button');
        for (const btn of buttons) {
          const text = await page.evaluate(el => el.textContent, btn);
          if (text && text.includes('Inspect Template')) {
            await btn.click();
            break;
          }
        }
        await new Promise((r) => setTimeout(r, 1200));
      }
    },
    {
      name: '05-document-library.png',
      url: 'http://localhost:3001/app/documents',
      action: async () => {
        await page.waitForSelector('table, [role="table"], h1', { timeout: 8000 });
        await new Promise((r) => setTimeout(r, 1000));
      }
    },
    {
      name: '06-document-editor.png',
      url: 'http://localhost:3001/app/editor?id=doc-001',
      action: async () => {
        await page.waitForSelector('input, textarea, [data-testid="canvas-preview"]', { timeout: 8000 });
        await new Promise((r) => setTimeout(r, 2000));
      }
    },
    {
      name: '07-brand-kit.png',
      url: 'http://localhost:3001/app/brand-kit',
      action: async () => {
        await page.waitForSelector('input', { timeout: 8000 });
        await new Promise((r) => setTimeout(r, 1500));
      }
    },
    {
      name: '08-bulk-csv-generator.png',
      url: 'http://localhost:3001/app/bulk',
      action: async () => {
        await page.waitForSelector('h1', { timeout: 8000 });
        const buttons = await page.$$('button');
        for (const btn of buttons) {
          const text = await page.evaluate(el => el.textContent, btn);
          if (text && (text.includes('Sample') || text.includes('Load Sample'))) {
            await btn.click();
            break;
          }
        }
        await new Promise((r) => setTimeout(r, 1200));
      }
    },
    {
      name: '09-developer-api-keys.png',
      url: 'http://localhost:3001/app/developer',
      action: async () => {
        await page.waitForSelector('h1', { timeout: 8000 });
        await new Promise((r) => setTimeout(r, 1000));
      }
    },
    {
      name: '10-pricing-plans.png',
      url: 'http://localhost:3001/pricing',
      action: async () => {
        await page.waitForSelector('h1', { timeout: 8000 });
        await new Promise((r) => setTimeout(r, 1000));
      }
    },
    {
      name: '11-settings-workspace.png',
      url: 'http://localhost:3001/app/settings',
      action: async () => {
        await page.waitForSelector('h1', { timeout: 8000 });
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  ];

  for (const t of tasks) {
    try {
      console.log(`📸 Capturing: ${t.name} from ${t.url}`);
      await page.goto(t.url, { waitUntil: 'networkidle2', timeout: 15000 });
      if (t.action) {
        await t.action();
      }
      const dest = path.join(SCREENSHOT_DIR, t.name);
      await page.screenshot({ path: dest, fullPage: false });
      console.log(`✅ Saved: ${dest} (${fs.statSync(dest).size} bytes)`);
    } catch (err) {
      console.error(`❌ Failed capturing ${t.name}:`, err.message);
    }
  }

  await browser.close();
  console.log('\n🎉 All test screenshots captured successfully!');
}

run().catch(console.error);
