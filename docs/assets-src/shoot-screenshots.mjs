// Drive headless Chrome over the DevTools protocol to capture README screenshots.
// Usage: node shoot.mjs <outDir> <baseUrl>
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [outDir, base] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9333;
const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--hide-scrollbars',
  `--user-data-dir=${join(process.env.TEMP, 'cpl-shots', 'profile-cdp')}`, `--remote-debugging-port=${PORT}`, 'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let k = 0; k < 40 && !target; k++) {
  try { target = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page'); } catch { /* not up yet */ }
  if (!target) await sleep(250);
}
if (!target) throw new Error('Chrome DevTools endpoint not reachable');

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0;
const pending = new Map();
ws.addEventListener('message', (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const n = ++id; pending.set(n, (m) => (m.error ? reject(new Error(`${method}: ${m.error.message}`)) : resolve(m.result)));
  ws.send(JSON.stringify({ id: n, method, params }));
});
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result.value;

await send('Page.enable');
await send('Runtime.enable');

async function shot(name, { path, width, height, dpr = 1, mobile = false, script = '', wait = 1500 }) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile });
  await send('Page.navigate', { url: base + path });
  await sleep(2500);
  await evaluate('document.fonts.ready.then(() => true)');
  if (script) await evaluate(`(async () => { ${script} })()`);
  await sleep(wait);
  const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  writeFileSync(join(outDir, `${name}.png`), Buffer.from(data, 'base64'));
  console.log('saved', name);
}

const step = (n) => `for (let k = 0; k < ${n}; k++) document.getElementById('next-step-button').click(); await new Promise(r => setTimeout(r, 300));`;
const scrollTo = (sel, offset = 0) => `const el = document.querySelector('${sel}'); window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - ${offset}); await new Promise(r => setTimeout(r, 300));`;

await shot('home-desktop', { path: '/', width: 1440, height: 900, wait: 2600 });
await shot('simulator-desktop', { path: '/patterns/number-triangle', width: 1440, height: 1000, script: step(12) + scrollTo('[data-testid="step-explanation"]', 84) });
await shot('creator-desktop', { path: '/creator', width: 1440, height: 900, wait: 2000 });
await shot('home-mobile', { path: '/', width: 390, height: 844, dpr: 2, mobile: true });
await shot('simulator-mobile', { path: '/patterns/star-triangle', width: 390, height: 844, dpr: 2, mobile: true, script: step(7) + scrollTo('[data-testid="step-explanation"]', 76) });

ws.close();
chrome.kill();
process.exit(0);
