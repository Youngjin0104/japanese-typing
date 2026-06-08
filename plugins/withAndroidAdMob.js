/**
 * plugins/withAndroidAdMob.js
 *
 * google-services.json 없이 AdMob App ID를
 * AndroidManifest.xml 에 직접 주입하는 커스텀 플러그인
 *
 * ⚠️ ADMOB_APP_ID_ANDROID 를 실제 AdMob 앱 ID로 교체하세요
 *    형태: ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX  (틸다 포함)
 *    발급: https://apps.admob.com
 */

// ── 여기만 수정 ──────────────────────────────
const ADMOB_APP_ID_ANDROID = "ca-app-pub-2409213088406992~7418278448";
// ────────────────────────────────────────────

const { withAndroidManifest } = require("@expo/config-plugins");

const withAndroidAdMob = (config) => {
  return withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults;

    // <application> 태그 찾기
    const app = manifest.manifest.application?.[0];
    if (!app) return mod;

    // 기존 meta-data 배열 가져오기 (없으면 빈 배열)
    if (!app["meta-data"]) app["meta-data"] = [];

    // 이미 등록된 경우 제거 후 재등록 (중복 방지)
    app["meta-data"] = app["meta-data"].filter(
      (m) => m.$?.["android:name"] !== "com.google.android.gms.ads.APPLICATION_ID"
    );

    // AdMob App ID 주입
    app["meta-data"].push({
      $: {
        "android:name":  "com.google.android.gms.ads.APPLICATION_ID",
        "android:value": ADMOB_APP_ID_ANDROID,
      },
    });

    return mod;
  });
};

module.exports = withAndroidAdMob;
