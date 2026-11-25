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
  'lexicon.mjs', 'facts.mjs', 'fact-card.mjs', 'sw.js', 'assets/icon-192.png', 'assets/icon-512.png', 'assets/rosette.png']);
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

  const random = page.getByRole('button', {name:'Random', exact:true});
  const card = page.getByRole('dialog', {name:/./}).filter({has:page.locator('#fact-title')});
  const title = page.locator('#fact-title');
  await random.click();
  await card.waitFor();
  assert.equal(await page.evaluate(() => document.activeElement.id), 'fact-title');
  const seen = new Set([await title.innerText()]);
  for (let i = 0; i < 6; i++) {
    await card.getByRole('button', {name:'Next', exact:true}).click();
    const name = await title.innerText();
    assert.ok(!seen.has(name));
    seen.add(name);
    assert.equal(await page.locator('#fact-status').textContent(), name);
  }
  await page.keyboard.press('Escape');
  assert.ok(!(await card.isVisible()));
  assert.equal(await page.evaluate(() => document.activeElement.id), 'fact-open');
  await page.goto(url + '#fact=wine-secret');
  await card.getByRole('heading', {name:'Wine and a secret'}).waitFor();
  assert.equal(await card.locator('.fact-proof li').count(), 2);
  await page.screenshot({path:join(screens, 'fact-other.png')});
  await card.getByRole('button', {name:'Close fact'}).click();
  assert.ok(!(await card.isVisible()));

  await page.goto(url + '#fact=genesis-pi');
  await card.getByRole('heading', {name:'Pi in Genesis'}).waitFor();
  assert.match(await card.innerText(), /28 letters · 7 words/);
  assert.match(await card.innerText(), /3\.14155/);
  assert.deepEqual(await card.locator('mark').allTextContents(), ['3.1415', '3.1415']);
  await page.screenshot({path:join(screens, 'fact-pi.png')});
  await card.getByText('Letter-by-letter proof', {exact:true}).click();
  assert.equal(await card.locator('.proof-letter').count(), 28);
  for (const width of [320, 393, 430, 768]) {
    await page.setViewportSize({width, height:852});
    assert.ok(await page.locator('#fact-body').evaluate(el => el.scrollWidth <= el.clientWidth),
      'fact body overflow at ' + width);
    assert.ok(await card.evaluate(el => el.scrollWidth <= el.clientWidth), 'dialog overflow at ' + width);
  }
  await card.getByRole('button', {name:'Load into calculator'}).click();
  assert.ok(!(await card.isVisible()));
  assert.equal(await input.inputValue(), 'בראשית ברא אלהים את השמים ואת הארץ');
  assert.equal(await page.locator('#total').innerText(), '2701');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'phrase');
  await input.fill('שלום');
  await input.blur();

  await page.setViewportSize({width:393, height:852});
  await page.goto(url + '#fact=genesis-pi-digits');
  await card.getByRole('heading', {name:"Pi's digits and the first verse"}).waitFor();
  assert.ok(await card.getByRole('heading', {name:'Two ways to split the first 628 decimals'}).isVisible());
  const digits = card.getByRole('region', {name:'First 628 decimal digits of pi'});
  const split = card.getByLabel('Split order');
  for (const [index, ranges, lengths] of [
    [0, ['Digits 1–17 sum to 82', 'Digits 18–628 sum to 2701'], [17, 611]],
    [1, ['Digits 1–611 sum to 2701', 'Digits 612–628 sum to 82'], [611, 17]],
  ]) {
    await split.selectOption({index});
    for (const range of ranges) assert.ok(await card.getByText(range, {exact:true}).isVisible());
    assert.deepEqual((await digits.locator('span').allTextContents()).map(text => text.length), lengths);
    assert.ok(await digits.evaluate(el => el.scrollWidth <= el.clientWidth));
    assert.ok(await page.locator('#fact-body').evaluate(el => el.scrollWidth <= el.clientWidth));
    if (index === 0) await page.screenshot({path:join(screens, 'fact-pi-digits.png')});
  }
  await card.getByRole('button', {name:'Close fact'}).click();

  for (const width of [320, 430, 768, 1280]) {
    await page.setViewportSize({width, height:852});
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'overflow at ' + width);
  }
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({path:join(screens, 'desktop.png'), fullPage:true});
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload();
  await random.click();
  await card.waitFor();
  await card.getByRole('button', {name:'Close fact'}).click();
  await input.fill('שָׁלוֹם');
  assert.equal(await page.locator('#total').innerText(), '376');
  await input.fill('shalom');
  assert.match(await page.locator('#english').innerText(), /English ordinal · 68/);
  assert.deepEqual(errors, []);
  console.log('Passed mobile values, selection, matching, keyboard, history, fact shuffle, deep links, calculator loading, layout and offline reload. Screenshots in docs/screens/.');
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
