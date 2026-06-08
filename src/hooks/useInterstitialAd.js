import { useEffect, useRef, useCallback } from "react";
import { Platform } from "react-native";

// ─────────────────────────────────────────────
// react-native-google-mobile-ads 는 Expo Go 에서
// 동작하지 않으므로 안전하게 require()로 로드
// EAS 프로덕션 빌드에서만 실제 광고가 표시됨
// ─────────────────────────────────────────────
let InterstitialAd, AdEventType, TestIds;
let SDK_AVAILABLE = false;
try {
  const ads      = require("react-native-google-mobile-ads");
  InterstitialAd = ads.InterstitialAd;
  AdEventType    = ads.AdEventType;
  TestIds        = ads.TestIds;
  SDK_AVAILABLE  = true;
} catch {
  // Expo Go 환경 — 광고 SDK 미지원, showAd()는 즉시 resolve
}

// ─────────────────────────────────────────────
// 📢 광고 단위 ID
// ⚠️ 배포 전 AdMob 콘솔에서 발급받은 ID로 교체
//    https://apps.admob.com
// ─────────────────────────────────────────────
function getAdUnitId() {
  if (!SDK_AVAILABLE) return null;
  if (__DEV__) return TestIds.INTERSTITIAL;
  // ⚠️ Android 광고 단위 ID — AdMob 콘솔에서 발급 후 교체
  // https://apps.admob.com → 앱 선택 → 광고 단위 → 전면 광고
  if (Platform.OS === "android") {
    return "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX";  // ← 여기만 교체
  }
  // iOS는 나중에 출시 시 추가
  return TestIds.INTERSTITIAL;
}

// ─────────────────────────────────────────────
// 🎯 useInterstitialAd
// ─────────────────────────────────────────────
export function useInterstitialAd({ adRemoved }) {
  const adRef     = useRef(null);
  const loadedRef = useRef(false);

  const loadAd = useCallback(() => {
    if (adRemoved || !SDK_AVAILABLE) return;
    const adUnitId = getAdUnitId();
    if (!adUnitId) return;
    try {
      const ad = InterstitialAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: false,
        keywords: ["education", "language", "japanese"],
      });
      adRef.current     = ad;
      loadedRef.current = false;

      ad.addAdEventListener(AdEventType.LOADED, () => {
        loadedRef.current = true;
      });
      ad.addAdEventListener(AdEventType.ERROR, () => {
        loadedRef.current = false;
      });
      ad.load();
    } catch (e) {
      console.warn("[Ad] 광고 로드 실패:", e);
    }
  }, [adRemoved]);

  useEffect(() => {
    if (!adRemoved && SDK_AVAILABLE) loadAd();
  }, [adRemoved, loadAd]);

  /** 모드 완료 시 호출 — 광고 없으면 즉시 resolve */
  const showAd = useCallback(() => {
    return new Promise((resolve) => {
      // SDK 없음 / 광고 제거 / 광고 미로드 → 즉시 통과
      if (!SDK_AVAILABLE || adRemoved || !adRef.current || !loadedRef.current) {
        resolve();
        return;
      }
      const ad = adRef.current;

      const closedSub = ad.addAdEventListener(AdEventType.CLOSED, () => {
        closedSub();
        loadedRef.current = false;
        adRef.current     = null;
        loadAd();
        resolve();
      });
      const errorSub = ad.addAdEventListener(AdEventType.ERROR, () => {
        errorSub();
        resolve();
      });

      try {
        ad.show();
      } catch (e) {
        console.warn("[Ad] 광고 표시 실패:", e);
        resolve();
      }
    });
  }, [adRemoved, loadAd]);

  return { showAd, loadAd };
}
