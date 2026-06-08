#!/usr/bin/env node
/**
 * scripts/download-fonts.js
 * 
 * Google Fonts에서 폰트 자동 다운로드 → assets/fonts/
 * 
 * 실행: node scripts/download-fonts.js
 */

import { createWriteStream, mkdirSync } from "fs";
import { pipeline } from "stream/promises";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../assets/fonts");
mkdirSync(OUT, { recursive: true });

const FONTS = [
  // Zen Kaku Gothic New (OFL 라이선스)
  { name: "ZenKakuGothicNew-Regular.ttf", url: "https://fonts.gstatic.com/s/zenkakugothicnew/v14/gNMVW2drQpDt0GtZstq9hlkMn2YuAJ2TqXFenBMl.ttf" },
  { name: "ZenKakuGothicNew-Medium.ttf",  url: "https://fonts.gstatic.com/s/zenkakugothicnew/v14/gNMQW2drQpDt0GtZstq9hlkMn2YuAJ2TqVX5svnB.ttf" },
  { name: "ZenKakuGothicNew-Bold.ttf",    url: "https://fonts.gstatic.com/s/zenkakugothicnew/v14/gNMQW2drQpDt0GtZstq9hlkMn2YuAJ2TqX35sPnB.ttf" },
  { name: "ZenKakuGothicNew-Black.ttf",   url: "https://fonts.gstatic.com/s/zenkakugothicnew/v14/gNMQW2drQpDt0GtZstq9hlkMn2YuAJ2TqWX-sPnB.ttf" },
  // Noto Sans KR (OFL 라이선스)
  { name: "NotoSansKR-Regular.ttf", url: "https://fonts.gstatic.com/s/notosanskr/v36/PbykFmXiEBPT4ITbgNA5Cgm20xz64px_1hVWr0wuPNGmlQNMEfD4.ttf" },
  { name: "NotoSansKR-Medium.ttf",  url: "https://fonts.gstatic.com/s/notosanskr/v36/PbykFmXiEBPT4ITbgNA5Cgm20xz64px_1hVWr0wuPNGmlQNMEfD4.ttf" },
  { name: "NotoSansKR-Bold.ttf",    url: "https://fonts.gstatic.com/s/notosanskr/v36/PbykFmXiEBPT4ITbgNA5Cgm20xz64px_1hVWr0wuPNGmlQNMEfD4.ttf" },
];

console.log("📥  폰트 다운로드 시작...\n");

for (const font of FONTS) {
  const dest = resolve(OUT, font.name);
  try {
    const res = await fetch(font.url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await pipeline(res.body, createWriteStream(dest));
    console.log(`  ✅  ${font.name}`);
  } catch (e) {
    console.error(`  ❌  ${font.name}: ${e.message}`);
    console.error(`     수동 다운로드: ${font.url}`);
  }
}

console.log("\n🎉  완료! assets/fonts/ 폴더를 확인하세요.");
console.log("⚠️   NotoSansKR weight별 URL은 실제 weight URL로 교체 필요.");
console.log("     https://fonts.google.com/noto/specimen/Noto+Sans+KR 에서 직접 다운로드 권장.\n");
