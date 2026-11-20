import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const games = JSON.parse(
  await fs.readFile(path.resolve('src/data/games.json'), 'utf8')
);

// Палитра цветов для каждого жанра
const genrePalette = {
  action: ['#00d2ff', '#001f3f'],
  rpg: ['#3a86ff', '#0b132b'],
  strategy: ['#00b4d8', '#03045e'],
  shooter: ['#4cc9f0', '#1b0a0a'],
  adventure: ['#00f5d4', '#0b2b2b'],
  simulation: ['#48cae4', '#0b2b1b'],
  horror: ['#0077b6', '#0a0a0a'],
  racing: ['#90e0ef', '#1b1400']
};

const outDir = path.resolve('src/assets/covers');
await fs.mkdir(outDir, { recursive: true });

function escapeXml(text) {
  return text.replace(/[<>&'"]/g, (ch) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;'
  })[ch]);
}

// Разбиваем длинное название на строки, чтобы влезло в обложку
function wrapTitle(title, maxChars = 14) {
  const words = title.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length <= maxChars) {
      current = (current + ' ' + word).trim();
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

for (const game of games) {
  const [from, to] = genrePalette[game.genre] ?? ['#444', '#111'];
  const lines = wrapTitle(game.title);
  
  // Рисуем текст на картинке
  const titleSvg = lines
    .map((line, i) => {
      const y = 380 + i * 64;
      return `<text x="300" y="${y}" text-anchor="middle" font-family="Arial, sans-serif" font-size="56" font-weight="700" fill="#ffffff">${escapeXml(line)}</text>`;
    })
    .join('');

  const svg = `
    <svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${from}"/>
          <stop offset="100%" stop-color="${to}"/>
        </linearGradient>
      </defs>
      <rect width="600" height="800" fill="url(#bg)"/>
      <circle cx="480" cy="140" r="90" fill="rgba(255,255,255,0.08)"/>
      <circle cx="120" cy="660" r="140" fill="rgba(0,0,0,0.18)"/>
      ${titleSvg}
      <text x="300" y="${380 + lines.length * 64 + 20}" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" fill="rgba(255,255,255,0.75)">${escapeXml(game.genre.toUpperCase())}</text>
    </svg>
  `;

  const outPath = path.join(outDir, `${game.id}.webp`);
  
  // Конвертируем SVG в WebP и сохраняем
  await sharp(Buffer.from(svg)).webp({ quality: 82 }).toFile(outPath);
  console.log(`готово: ${game.id}.webp`);
}