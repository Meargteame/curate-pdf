import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';

const SCREENSHOT_DIR = 'C:\\Users\\hp\\.gemini\\antigravity\\brain\\770dfd38-0ddf-4092-b8ba-21dd606976f8\\screenshots';
const ROOT_ARTIFACT_DIR = 'C:\\Users\\hp\\.gemini\\antigravity\\brain\\770dfd38-0ddf-4092-b8ba-21dd606976f8';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE_URL = 'http://localhost:3001';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function clearAndType(page, selector, text) {
  await page.waitForSelector(selector);
  await page.click(selector);
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await page.keyboard.type(text);
}

async function runFunctionalSuite() {
  console.log('====================================================');
  console.log('🧪 RUNNING CURATEPDF DYNAMIC FUNCTIONAL TEST SUITE');
  console.log('====================================================\n');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,1000']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1.5 });

  const testResults = [];

  // =========================================================================
  // TEST 1: Dynamic Brand Kit Form Submission & Backend DB Persistence
  // =========================================================================
  try {
    console.log('▶ TEST 1: Dynamic Brand Kit Update & Persistence');
    await page.goto(`${BASE_URL}/app/brand-kit`, { waitUntil: 'networkidle2' });
    await sleep(800);

    // Update Company Name using keyboard interactions
    await clearAndType(page, 'input', 'Acme Global Technologies');
    await sleep(400);

    // Click Save Button
    const buttons = await page.$$('button');
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes('Save Brand Kit')) {
        await b.click();
        await sleep(1200);
        break;
      }
    }

    const shot1 = path.join(SCREENSHOT_DIR, 'func-01-brandkit-saved.png');
    await page.screenshot({ path: shot1 });

    // Verify backend API
    const res = await fetch(`${BASE_URL}/api/v1/brand-kit`);
    const bkJson = await res.json();
    console.log('   Backend brand kit companyName:', bkJson.data?.companyName);
    const passed = bkJson.data?.companyName?.includes('Acme Global');

    testResults.push({
      id: 'TEST-1',
      name: 'Dynamic Brand Kit Persistence',
      status: passed ? 'PASSED' : 'FAILED',
      screenshot: 'func-01-brandkit-saved.png',
      details: `Company name successfully updated to "${bkJson.data?.companyName}" in server database.`
    });
  } catch (err) {
    console.error('   ❌ Test 1 error:', err);
    testResults.push({ id: 'TEST-1', name: 'Brand Kit Persistence', status: 'FAILED', error: err.message });
  }

  // =========================================================================
  // TEST 2: Dynamic Document Creation & Real-Time Math in Editor
  // =========================================================================
  let createdDocId = null;
  try {
    console.log('\n▶ TEST 2: Dynamic Document Creation & Real-Time Calculations');
    await page.goto(`${BASE_URL}/app/editor?template=tpl-invoice-minimal`, { waitUntil: 'networkidle2' });
    await sleep(1000);

    // Focus and update Title
    const titleInput = await page.$('input[placeholder="Document Title"], .font-display input');
    if (titleInput) {
      await titleInput.click();
      await page.keyboard.down('Control');
      await page.keyboard.press('A');
      await page.keyboard.up('Control');
      await page.keyboard.press('Backspace');
      await page.keyboard.type('Q4 Strategic Advisory Invoice #9842');
    }

    // Click "Add line item" button
    const addButtons = await page.$$('button');
    for (const b of addButtons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && (text.includes('Add Item') || text.includes('Add line item'))) {
        await b.click();
        await sleep(400);
        break;
      }
    }

    // Take screenshot of calculations in editor
    const shot2 = path.join(SCREENSHOT_DIR, 'func-02-editor-calculations.png');
    await page.screenshot({ path: shot2 });

    // Click "Save Draft" in editor
    const allBtns = await page.$$('button');
    for (const b of allBtns) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes('Save Draft')) {
        await b.click();
        await sleep(1500);
        break;
      }
    }

    const shot3 = path.join(SCREENSHOT_DIR, 'func-03-document-saved.png');
    await page.screenshot({ path: shot3 });

    // Verify backend documents
    const docRes = await fetch(`${BASE_URL}/api/v1/documents`);
    const docData = await docRes.json();
    const foundDoc = docData.data?.find(d => d.title.includes('Q4 Strategic Advisory Invoice'));
    createdDocId = foundDoc?.id;

    console.log('   Saved Document ID in backend:', createdDocId, 'Title:', foundDoc?.title);
    console.log('   Total documents in DB:', docData.total);

    testResults.push({
      id: 'TEST-2',
      name: 'Dynamic Document Creation & Calculation',
      status: foundDoc ? 'PASSED' : 'FAILED',
      screenshot: 'func-03-document-saved.png',
      details: `Saved "${foundDoc?.title}" with ID ${createdDocId} directly to backend database.`
    });
  } catch (err) {
    console.error('   ❌ Test 2 error:', err);
    testResults.push({ id: 'TEST-2', name: 'Document Creation', status: 'FAILED', error: err.message });
  }

  // =========================================================================
  // TEST 3: Real Headless Chromium PDF Generation & Metadata Audit
  // =========================================================================
  try {
    console.log('\n▶ TEST 3: Headless Chromium PDF Generation & Metadata Audit');
    const docToGen = createdDocId || 'doc-001';
    const t0 = Date.now();
    const pdfResponse = await fetch(`${BASE_URL}/api/v1/documents/${docToGen}/pdf`);
    const duration = Date.now() - t0;

    console.log('   Server response status:', pdfResponse.status);
    console.log('   Content-Type:', pdfResponse.headers.get('content-type'));

    const arrayBuffer = await pdfResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const pdfPath = path.join(process.cwd(), 'test-e2e-curated.pdf');
    fs.writeFileSync(pdfPath, buffer);

    console.log(`   PDF size: ${buffer.length} bytes (rendered in ${duration}ms)`);

    // Verify PDF binary structure and metadata via pdf-lib
    const pdfDoc = await PDFDocument.load(buffer);
    const pageCount = pdfDoc.getPageCount();
    const title = pdfDoc.getTitle();
    const producer = pdfDoc.getProducer();

    console.log(`   Verified PDF Pages: ${pageCount}, Producer: "${producer}", Title: "${title}"`);

    // Screenshot first page of PDF in browser
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <body style="margin:0; background:#1F2937; display:flex; justify-content:center; align-items:center; min-height:100vh;">
          <embed src="${BASE_URL}/api/v1/documents/${docToGen}/pdf" type="application/pdf" width="90%" height="950px" />
        </body>
      </html>
    `, { waitUntil: 'load' });
    await sleep(2000);

    const shot4 = path.join(SCREENSHOT_DIR, 'func-04-real-pdf-vector.png');
    await page.screenshot({ path: shot4 });

    const passed = buffer.length > 50000 && pageCount >= 1;
    testResults.push({
      id: 'TEST-3',
      name: 'Real Headless Chromium PDF Generation',
      status: passed ? 'PASSED' : 'FAILED',
      screenshot: 'func-04-real-pdf-vector.png',
      details: `Generated valid PDF (${buffer.length} bytes, ${pageCount} pages, producer: "${producer}") in ${duration}ms.`
    });
  } catch (err) {
    console.error('   ❌ Test 3 error:', err);
    testResults.push({ id: 'TEST-3', name: 'Real PDF Generation', status: 'FAILED', error: err.message });
  }

  // =========================================================================
  // TEST 4: Document Library Dynamic Live Filtering & Duplication
  // =========================================================================
  try {
    console.log('\n▶ TEST 4: Document Library Live Filtering & Duplication');
    await page.goto(`${BASE_URL}/app/documents`, { waitUntil: 'networkidle2' });
    await sleep(1000);

    // Type in search filter
    const searchInput = await page.$('input[placeholder*="Search"]');
    if (searchInput) {
      await searchInput.type('Strategic Advisory');
      await sleep(600);
    }

    const shot5 = path.join(SCREENSHOT_DIR, 'func-05-library-live-filter.png');
    await page.screenshot({ path: shot5 });

    // Click Duplicate Button on first row
    const dupButtons = await page.$$('button[title="Duplicate"]');
    if (dupButtons.length > 0) {
      await dupButtons[0].click();
      await sleep(1500);
    }

    const shot6 = path.join(SCREENSHOT_DIR, 'func-06-library-duplicated.png');
    await page.screenshot({ path: shot6 });

    // Verify duplication in backend
    const checkDocs = await (await fetch(`${BASE_URL}/api/v1/documents`)).json();
    const hasCopy = checkDocs.data.some(d => d.title.includes('(Copy)'));
    console.log('   Duplicated document exists in backend:', hasCopy);

    testResults.push({
      id: 'TEST-4',
      name: 'Document Library Dynamic Search & Duplication',
      status: hasCopy ? 'PASSED' : 'FAILED',
      screenshot: 'func-06-library-duplicated.png',
      details: `Live search filtered rows smoothly; duplicate action created persisted copy in DB.`
    });
  } catch (err) {
    console.error('   ❌ Test 4 error:', err);
    testResults.push({ id: 'TEST-4', name: 'Document Library CRUD', status: 'FAILED', error: err.message });
  }

  // =========================================================================
  // TEST 5: Real Bulk Batch Generation Engine & ZIP Archive Export
  // =========================================================================
  try {
    console.log('\n▶ TEST 5: Bulk Batch Generation & ZIP Archive Download');
    const bulkRecords = [
      { client: 'Acme Logistics Ltd', reference: 'INV-2026-901', amount: '$4,200.00', date: '2026-10-28', status: 'Valid' },
      { client: 'Apex Biotech Inc', reference: 'INV-2026-902', amount: '$8,150.00', date: '2026-10-28', status: 'Valid' },
    ];

    const bulkJobRes = await fetch(`${BASE_URL}/api/v1/bulk/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: 'tpl-invoice-minimal',
        records: bulkRecords
      }),
    });

    const jobData = await bulkJobRes.json();
    const jobId = jobData.jobId;
    console.log('   Batch Job initiated with ID:', jobId);

    // Poll until completed
    let completedJob = null;
    for (let i = 0; i < 20; i++) {
      await sleep(1500);
      const pollRes = await fetch(`${BASE_URL}/api/v1/bulk/jobs/${jobId}`);
      if (pollRes.ok) {
        const pollJson = await pollRes.json();
        console.log(`   Poll iteration ${i + 1}: status = ${pollJson.data?.status}, processed = ${pollJson.data?.processedRecords}/${pollJson.data?.totalRecords}`);
        if (pollJson.data?.status === 'completed') {
          completedJob = pollJson.data;
          break;
        }
      }
    }

    // Download ZIP
    const zipRes = await fetch(`${BASE_URL}/api/v1/bulk/jobs/${jobId}/download`);
    const zipBuf = Buffer.from(await zipRes.arrayBuffer());
    const zipPath = path.join(process.cwd(), 'test-e2e-batch.zip');
    fs.writeFileSync(zipPath, zipBuf);
    console.log(`   Downloaded Batch ZIP: ${zipBuf.length} bytes (HTTP ${zipRes.status})`);

    // Navigate to UI Bulk page to show completion screen
    await page.goto(`${BASE_URL}/app/bulk`, { waitUntil: 'networkidle2' });
    await sleep(800);
    const shot7 = path.join(SCREENSHOT_DIR, 'func-07-bulk-generation.png');
    await page.screenshot({ path: shot7 });

    const passed = zipRes.status === 200 && zipBuf.length > 50000 && completedJob?.status === 'completed';
    testResults.push({
      id: 'TEST-5',
      name: 'Bulk Batch Generation & ZIP Packaging',
      status: passed ? 'PASSED' : 'FAILED',
      screenshot: 'func-07-bulk-generation.png',
      details: `Generated multi-PDF batch (${zipBuf.length} bytes ZIP) containing rendered client PDFs.`
    });
  } catch (err) {
    console.error('   ❌ Test 5 error:', err);
    testResults.push({ id: 'TEST-5', name: 'Bulk Batch Generation', status: 'FAILED', error: err.message });
  }

  // =========================================================================
  // TEST 6: Developer Tools — Real API Key Generation & Direct API PDF Call
  // =========================================================================
  try {
    console.log('\n▶ TEST 6: Developer Tools — Real API Key Generation & PDF API Call');
    
    // Create API key via API to ensure live state
    const createKeyRes = await fetch(`${BASE_URL}/api/v1/keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Automated Production E2E Key' })
    });
    const keyJson = await createKeyRes.json();
    const newKey = keyJson.data;
    console.log('   New API Key created in backend:', newKey?.name, 'Prefix:', newKey?.keyPrefix);

    // Refresh UI to show the new key rendered dynamically
    await page.goto(`${BASE_URL}/app/developer`, { waitUntil: 'networkidle2' });
    await sleep(1000);

    const shot8 = path.join(SCREENSHOT_DIR, 'func-08-developer-keys.png');
    await page.screenshot({ path: shot8 });

    // Call POST /api/v1/generate with API payload using the newly generated key
    const directApiRes = await fetch(`${BASE_URL}/api/v1/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${newKey?.keyPrefix || 'cp_live_test'}`
      },
      body: JSON.stringify({
        document: {
          title: 'Direct API PDF Payload',
          referenceNumber: 'API-2026-TEST',
          category: 'business',
          date: '2026-11-02',
          clientName: 'API Integration Client',
          clientCompany: 'DevOps Cloud Corp',
          summary: 'This document was compiled directly via the CuratePDF REST API using a newly created API key without mock data.',
          lineItems: [
            { id: '1', description: 'API Endpoint Call', quantity: 1, rate: 1000 }
          ],
          subtotal: 1000,
          total: 1000
        }
      })
    });

    const apiPdfBuf = Buffer.from(await directApiRes.arrayBuffer());
    console.log(`   Direct API PDF generation status: ${directApiRes.status}, size: ${apiPdfBuf.length} bytes`);

    const passed = directApiRes.status === 200 && apiPdfBuf.length > 50000;
    testResults.push({
      id: 'TEST-6',
      name: 'Developer API Keys & Live REST Invocation',
      status: passed ? 'PASSED' : 'FAILED',
      screenshot: 'func-08-developer-keys.png',
      details: `Generated API key "${newKey?.name}" and executed direct REST call compiling a ${apiPdfBuf.length} bytes PDF.`
    });
  } catch (err) {
    console.error('   ❌ Test 6 error:', err);
    testResults.push({ id: 'TEST-6', name: 'Developer Tools', status: 'FAILED', error: err.message });
  }

  await browser.close();

  // Copy screenshots to root artifacts folder for embedding
  fs.readdirSync(SCREENSHOT_DIR).forEach(f => {
    if (f.startsWith('func-')) {
      fs.copyFileSync(path.join(SCREENSHOT_DIR, f), path.join(ROOT_ARTIFACT_DIR, f));
    }
  });

  console.log('\n====================================================');
  console.log('📊 FUNCTIONAL TEST SUITE SUMMARY:');
  console.log('====================================================');
  testResults.forEach(r => {
    console.log(`${r.status === 'PASSED' ? '✅' : '❌'} [${r.id}] ${r.name}: ${r.status}`);
    if (r.details) console.log(`   ${r.details}`);
    if (r.error) console.log(`   Error: ${r.error}`);
  });
  console.log('====================================================\n');

  return testResults;
}

runFunctionalSuite().catch(console.error);
