#!/usr/bin/env node
/**
 * scripts/generate-assets.js
 *
 * SVG 소스 → 모든 앱 에셋 자동 생성
 *
 * 사전 준비:
 *   npm install -D sharp
 *
 * 실행:
 *   node scripts/generate-assets.js
 *
 * 생성 파일:
 *   assets/icon.png              1024×1024  (iOS + Android)
 *   assets/adaptive-icon.png     1024×1024  (Android Adaptive 전경)
 *   assets/splash.png            1284×2778  (iOS iPhone 14 Pro Max)
 *   assets/favicon.png           196×196    (Expo Web)
 *   store/screenshots/preview.png  390×844  (App Store 스크린샷 템플릿)
 */

import sharp from "sharp";
import { readFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = resolve(__dirname, "..");

function path(...parts) { return resolve(ROOT, ...parts); }

mkdirSync(path("assets"),            { recursive: true });
mkdirSync(path("store/screenshots"), { recursive: true });

// ─────────────────────────────────────────────
// 소스 SVG 로드
// ─────────────────────────────────────────────
const iconSvg   = readFileSync(path("assets/source/icon.svg"));
const splashSvg = readFileSync(path("assets/source/splash.svg"));

// ─────────────────────────────────────────────
// 생성 작업 목록
// ─────────────────────────────────────────────
const TASKS = [
  // 앱 아이콘
  { src: iconSvg,   dest: "assets/icon.png",          w: 1024, h: 1024, desc: "앱 아이콘" },
  { src: iconSvg,   dest: "assets/adaptive-icon.png", w: 1024, h: 1024, desc: "Android Adaptive 아이콘" },
  { src: iconSvg,   dest: "assets/favicon.png",       w: 196,  h: 196,  desc: "웹 파비콘" },

  // 스플래시
  { src: splashSvg, dest: "assets/splash.png",        w: 1284, h: 2778, desc: "스플래시 (iPhone 14 Pro Max)" },

  // App Store 스크린샷 템플릿 (6.5인치 = 1284×2778, 5.5인치 = 1242×2208)
  { src: splashSvg, dest: "store/screenshots/6.5inch.png", w: 1284, h: 2778, desc: "App Store 6.5인치 스크린샷" },
  { src: splashSvg, dest: "store/screenshots/5.5inch.png", w: 1242, h: 2208, desc: "App Store 5.5인치 스크린샷" },
];

// ─────────────────────────────────────────────
// 실행
// ─────────────────────────────────────────────
console.log("\n🎨  앱 에셋 생성 시작...\n");

let ok = 0, fail = 0;

for (const task of TASKS) {
  const dest = path(task.dest);
  try {
    await sharp(task.src, { density: 300 })
      .resize(task.w, task.h, { fit: "cover", background: { r: 250, g: 246, b: 239, alpha: 1 } })
      .png({ quality: 100, compressionLevel: 6 })
      .toFile(dest);
    console.log(`  ✅  ${task.desc.padEnd(32)} → ${task.dest}`);
    ok++;
  } catch (e) {
    console.error(`  ❌  ${task.desc}: ${e.message}`);
    fail++;
  }
}

console.log(`\n${"─".repeat(56)}`);
console.log(`  완료: ${ok}개  실패: ${fail}개`);

if (ok > 0) {
  console.log(`
📋  다음 단계:
  1. assets/icon.png    — app.json 의 "icon" 필드 확인
  2. assets/splash.png  — app.json 의 "splash.image" 필드 확인
  3. 실제 앱 스크린샷은 Expo Go 또는 시뮬레이터에서 직접 캡처 권장
`);
}
