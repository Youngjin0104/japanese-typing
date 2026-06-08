# 일본어 타자 연습 🌸 — 앱스토어 출시 가이드

---

## ⚡ 처음 한 번만 실행 (전체 셋업)

```bash
npm run setup
# = npm install + 폰트 다운로드 + 에셋 생성
```

---

## 📋 출시 전 체크리스트

### ① 폰트 · ② 아이콘/스플래시 → 자동 생성
```bash
node scripts/download-fonts.js    # assets/fonts/*.ttf 7개
node scripts/generate-assets.js   # icon.png / splash.png / adaptive-icon.png
```

### ③ 개발자 계정 등록 (수동)
| 플랫폼 | URL | 비용 | 처리 시간 |
|---|---|---|---|
| Apple Developer | https://developer.apple.com/programs | $99/년 | 1~2일 |
| Google Play Console | https://play.google.com/console | $25 일회 | 즉시 |

### ④ 개인정보처리방침 호스팅 (수동)
`public/privacy-policy.html` 을 아래 중 하나로 호스팅:
```bash
# GitHub Pages (무료)
# 저장소 Settings → Pages → main/docs 로 설정
# → https://yourname.github.io/japanese-typing-app/privacy-policy.html

# Vercel (무료, 가장 빠름)
npx vercel public/
```
그 후 `store/metadata.json` 의 `privacy_policy` URL 업데이트.

### ⑤ app.json 수정
```json
"ios":     { "bundleIdentifier": "com.yourname.japanesetyping" }
"android": { "package":          "com.yourname.japanesetyping" }
```

### ⑥ eas.json 수정
```json
"appleId":     "your@apple.com"
"ascAppId":    "1234567890"
"appleTeamId": "XXXXXXXXXX"
```

---

## 🏗️ EAS 빌드 & 제출

```bash
# 초기 설정 (1회)
npm install -g eas-cli
eas login && eas init

# 테스터 배포용 프리뷰
npm run build:preview

# 프로덕션 빌드
npm run build:ios       # App Store용 .ipa
npm run build:android   # Google Play용 .aab

# 스토어 제출
npm run submit:all
```

---

## 📱 App Store Connect 등록 순서

1. App Store Connect → 나의 앱 → (+) 새 앱
2. 이름: `일본어 타자 연습`, 번들 ID: `com.yourname.japanesetyping`
3. **앱 정보** → 카테고리: 교육 → 개인정보처리방침 URL 입력
4. **가격 및 배포** → 무료
5. **1.0.0 준비** → 스크린샷 (6.5인치 3장 이상), 설명·키워드 입력
6. `npm run submit:ios` → 제출

---

## 📁 파일 구조

```
expo-app/
├── App.jsx
├── app.json              ⚠️ bundleIdentifier 수정
├── eas.json              ⚠️ appleId 등 수정
├── package.json
│
├── assets/
│   ├── source/           ← 아이콘·스플래시 SVG 소스
│   ├── fonts/            ← npm run fonts 로 자동 생성
│   ├── icon.png          ← npm run assets 로 자동 생성
│   ├── splash.png
│   └── adaptive-icon.png
│
├── public/
│   └── privacy-policy.html  ⚠️ 호스팅 필요
│
├── store/
│   ├── metadata.json     ⚠️ privacy_policy URL 수정
│   └── screenshots/
│
├── scripts/
│   ├── download-fonts.js
│   └── generate-assets.js
│
└── src/                  ← 앱 소스 (변경 불필요)
```

---

## ⚠️ 심사 거절 주요 원인 & 대처

| 원인 | 대처 |
|---|---|
| 개인정보처리방침 URL 미등록 | `public/privacy-policy.html` 호스팅 후 URL 입력 |
| 스크린샷 미흡 | 실기기/시뮬레이터 실제 화면 최소 3장 |
| 앱 크래시 | `npm run build:preview` 로 실기기 테스트 선행 |
| 연락처 미등록 | `privacy-policy.html` 이메일 실제 주소로 교체 |
