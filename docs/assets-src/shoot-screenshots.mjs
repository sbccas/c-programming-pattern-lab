// Capture README screenshots from a running site with headless Chrome (DevTools protocol).
// Usage: node docs/assets-src/shoot-screenshots.mjs <outDir> <baseUrl>
// Example: node docs/assets-src/shoot-screenshots.mjs "%TEMP%\cpl-shots\out" https://c-programming-pattern-lab.vercel.app
// Then convert the PNGs to WebP (quality ~86) into docs/screenshots/.
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [outDir, base] = process.argv.slice(2);
if (!outDir || !base) throw new Error('Usage: node shoot-screenshots.mjs <outDir> <baseUrl>');
mkdirSync(outDir, { recursive: true });

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9333;
// A separate profile, so the user's own Chrome is never touched.
const chrome = spawn(
  CHROME,
  [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--hide-scrollbars',
    `--user-data-dir=${join(process.env.TEMP ?? '.', 'cpl-shots', 'profile-cdp')}`, `--remote-debugging-port=${PORT}`, 'about:blank',
  ],
  { stdio: 'ignore' },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let k = 0; k < 40 && !target; k++) {
  try {
    target = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page');
  } catch {
    /* Chrome not up yet */
  }
  if (!target) await sleep(250);
}
if (!target) throw new Error('Chrome DevTools endpoint not reachable');

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0;
const pending = new Map();
ws.addEventListener('message', (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
});
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const n = ++id;
    pending.set(n, (m) => (m.error ? reject(new Error(`${method}: ${m.error.message}`)) : resolve(m.result)));
    ws.send(JSON.stringify({ id: n, method, params }));
  });
const evaluate = async (expression) => {
  const res = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (res.exceptionDetails) throw new Error(`Page script failed: ${res.exceptionDetails.text}`);
  return res.result.value;
};

await send('Page.enable');
await send('Runtime.enable');

async function shot(name, { path, width, height, dpr = 1, mobile = false, script = '', wait = 1500 }) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile });
  await send('Page.navigate', { url: base + path });
  await sleep(2500);
  await evaluate('document.fonts.ready.then(() => true)');
  const info = script ? await evaluate(`(async () => { ${script} })()`) : '';
  await sleep(wait);
  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(outDir, `${name}.png`), Buffer.from(data, 'base64'));
  console.log('saved', name, info ?? '');
}

// Page helpers (run inside the page).
const stepUntil = (needle, max = 400) => `
  const btn = document.getElementById('next-step-button');
  const text = () => document.querySelector('[data-testid="step-explanation"]')?.textContent ?? '';
  let n = 0;
  while (!text().includes(${JSON.stringify(needle)}) && !btn.disabled && n < ${max}) { btn.click(); n++; await new Promise(r => setTimeout(r, 2)); }
  if (!text().includes(${JSON.stringify(needle)})) throw new Error('step not found: ' + ${JSON.stringify(needle)});
  await new Promise(r => setTimeout(r, 300));`;
const scrollTo = (selector, offset = 0) => `
  const el = document.querySelector('${selector}');
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - ${offset});
  await new Promise(r => setTimeout(r, 300));`;
const clickTab = (tabId) => `document.getElementById('${tabId}')?.click(); await new Promise(r => setTimeout(r, 300));`;
const progress = `return document.querySelector('[data-testid="progress-text"]')?.textContent.trim();`;

await shot('home-desktop', { path: '/', width: 1440, height: 900, wait: 2600 });
await shot('diamond-desktop', {
  path: '/patterns/diamond',
  width: 1440,
  height: 1180,
  script: stepUntil('Start lower half loop') + scrollTo('[data-testid="step-explanation"]', 84) + progress,
});
await shot('pyramid-mobile', {
  path: '/patterns/odd-star-pyramid',
  width: 390,
  height: 844,
  dpr: 2,
  mobile: true,
  script: stepUntil('here 2 * i - 1 = 5') + clickTab('tab-variables') + scrollTo('[data-testid="step-explanation"]', 76) + progress,
});
await shot('library-pyramids', {
  path: '/patterns?category=Pyramids+%26+diamonds',
  width: 1440,
  height: 1000,
  script: scrollTo('h1', 90),
});
await shot('creator-desktop', { path: '/creator', width: 1440, height: 900, wait: 2000 });

ws.close();
chrome.kill();
process.exit(0);
