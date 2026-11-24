// Run explicitly with node tests/e2e.mjs. Only the app shell is served.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, readFile, rm } from 'node:fs/promises';
import { homedir } from 'node:os';
import { extname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const screens = join(root, 'docs', 'screens');
const scratch = await mkdtemp('/tmp/gematria-e2e-');
process.env.TMPDIR = scratch;
const playwrightPath = join(homedir(), 'dev/build-kids-apps/node_modules/playwright/index.mjs');
const executablePath = join(homedir(), 'Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell');
const shell = new Set(['index.html', 'manifest.webmanifest', 'styles.css', 'app.mjs', 'gematria.mjs',
  'lexicon.mjs', 'sw.js', 'assets/icon-192.png', 'assets/icon-512.png', 'assets/rosette.png']);
const types = { '.html':'text/html', '.css':'text/css', '.mjs':'text/javascript', '.js':'text/javascript',
  '.png':'image/png', '.webmanifest':'application/manifest+json' };
const server = createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  const file = path.slice('/gematria/'.length) || 'index.html';
  if (!path.startsWith('/gematria/') || !shell.has(file)) {
    res.writeHead(404).end();
    return;
  }
  try {
    const data = await readFile(join(root, file));
    res.writeHead(200, { 'Content-Type':types[extname(file)], 'Cache-Control':'no-store' }).end(data);
  } catch {
    res.writeHead(500).end();
  }
});
let browser;
try {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const url = 'http://127.0.0.1:' + server.address().port + '/gematria/';
  const { chromium } = await import(pathToFileURL(playwrightPath));
  browser = await chromium.launch({ headless:true, executablePath, downloadsPath:scratch });
  const context = await browser.newContext({ viewport:{width:393,height:852}, isMobile:true,
    hasTouch:true, deviceScaleFactor:2, colorScheme:'light' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(url);
  const input = page.locator('#phrase');
  await page.locator('#clear').click();
  for (const letter of 'שלום') await page.keyboard.insertText(letter);
  assert.equal(await page.locator('#total').innerText(), '376');
  for (const [method, value] of Object.entries({standard:376, gadol:936, katan:16, ordinal:52, atbash:112})) {
    const row = page.locator('[data-method="' + method + '"] .method-value');
    assert.ok(await row.isVisible());
    assert.equal(await row.innerText(), String(value));
  }
  assert.equal(await page.locator('#atbash-word').innerText(), 'בכפי');
  await input.blur();
  await mkdir(screens, { recursive:true });
  await page.screenshot({path:join(screens, 'iphone-light.png'), fullPage:true});
  await page.emulateMedia({colorScheme:'dark'});
  await page.screenshot({path:join(screens, 'iphone-dark.png'), fullPage:true});
  await page.emulateMedia({colorScheme:'light'});

  await page.locator('[data-method="gadol"]').click();
  assert.equal(await page.locator('#total').innerText(), '936');
  assert.deepEqual(await page.locator('.tile small').allTextContents(), ['300','30','6','600']);
  await page.locator('[data-method="standard"]').click();
  await page.getByRole('button', {name:'אהבה', exact:true}).click();
  assert.equal(await page.locator('#total').innerText(), '13');
  assert.ok(await page.locator('#matches').getByText('אחד', {exact:true}).isVisible());
  await page.locator('#clear').click();
  await page.locator('#keyboard-toggle').click();
  for (const key of ['ח','י','Space','א','Backspace','ם']) {
    await page.locator('#keyboard').getByRole('button', {name:key, exact:true}).click();
  }
  assert.equal(await input.inputValue(), 'חי ם');
  assert.equal(await page.locator('#total').innerText(), '58');
  assert.equal(await page.locator('.word-row').count(), 2);
  await page.locator('#history-open').click();
  await page.locator('#history-list').getByRole('button', {name:/שלום/}).click();
  assert.equal(await input.inputValue(), 'שלום');
  await page.locator('#keyboard-toggle').click();

  for (const width of [320, 430, 768, 1280]) {
    await page.setViewportSize({width, height:852});
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'overflow at ' + width);
  }
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({path:join(screens, 'desktop.png'), fullPage:true});
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload();
  await input.fill('שָׁלוֹם');
  assert.equal(await page.locator('#total').innerText(), '376');
  await input.fill('shalom');
  assert.match(await page.locator('#english').innerText(), /English ordinal · 68/);
  assert.deepEqual(errors, []);
  console.log('Passed mobile values, selection, matching, keyboard, history, layout and offline reload. Screenshots in docs/screens/.');
} finally {
  try { await browser?.close(); }
  finally {
    if (server.listening) {
      server.closeAllConnections();
      await new Promise(resolve => server.close(resolve));
    }
    await rm(scratch, {recursive:true, force:true});
  }
}
