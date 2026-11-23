import { mkdir, writeFile, access, readFile } from 'node:fs/promises';
import path from 'node:path';

const OUT_DIR = path.resolve('public/covers');
const FAILED_LIST = path.resolve('scripts/failed-covers.txt');

const API = 'https://www.freetogame.com/api/games';
const CONCURRENCY = 3;          
const ATTEMPTS_PER_SOURCE = 3;  
const TIMEOUT_MS = 15000;       

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const proxyUrl = (src) =>
  `https://images.weserv.nl/?url=${encodeURIComponent(src)}&w=400&fit=cover&output=webp&q=80`;

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (cover-cache script)' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function downloadCover(thumbnail) {
  const original = String(thumbnail).replace(/^http:\/\//i, 'https://');
  const sources = [proxyUrl(original), original];
  let lastError = 'unknown';

  for (const src of sources) {
    for (let attempt = 1; attempt <= ATTEMPTS_PER_SOURCE; attempt++) {
      try {
        return await fetchBuffer(src);
      } catch (e) {
        lastError = e.cause?.code || e.cause?.message || e.message;
        if (attempt < ATTEMPTS_PER_SOURCE) await sleep(600 * attempt);
      }
    }
  }

  throw new Error(lastError);
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const res = await fetch(API, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`API вернул HTTP ${res.status}`);
  const games = await res.json();

  let done = 0;
  let alreadyHave = 0;
  let failed = 0;
  const failedIds = [];

  const queue = [...games];

  async function worker() {
    while (queue.length > 0) {
      const game = queue.shift();
      if (!game) return;

      const file = path.join(OUT_DIR, `${game.id}.webp`);

      if (await exists(file)) {
        alreadyHave++;
        continue;
      }

      try {
        const buf = await downloadCover(game.thumbnail);
        await writeFile(file, buf);
        done++;
        console.log(`ok   ${game.id}  (${done + alreadyHave + failed}/${games.length})`);
      } catch (e) {
        failed++;
        failedIds.push(String(game.id));
        console.warn(`FAIL ${game.id}: ${e.message}`);
      }

      await sleep(120);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  if (failedIds.length > 0) {
    await writeFile(FAILED_LIST, failedIds.join('\n'), 'utf8');
  }

  console.log('---');
  console.log(`скачано сейчас:  ${done}`);
  console.log(`уже было:        ${alreadyHave}`);
  console.log(`не удалось:      ${failed}`);
  if (failed) console.log(`ids ошибок:      ${FAILED_LIST}`);
}

main().catch((e) => {
  console.error('Скрипт упал:', e);
  process.exit(1);
});