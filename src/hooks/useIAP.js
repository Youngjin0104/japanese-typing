import { useState, useEffect, useCallback } from "react";
import { Platform, Alert } from "react-native";

// react-native-iap 은 Expo Go 미지원, EAS 빌드에서만 동작
let iap = null;
let IAP_AVAILABLE = false;
try {
  iap = require("react-native-iap");
  IAP_AVAILABLE = true;
} catch {}

// ⚠️ Google Play Console → 수익 창출 → 인앱 상품 → 제품 ID 와 일치해야 함
export const PRODUCT_ID = Platform.select({
  android: "remove_ads",             // ← Google Play에 등록한 제품 ID
  ios:     "com.yourname.japanesetyping.removeads",  // iOS는 나중에
});

export function useIAP({ onSuccess }) {
  const [product,    setProduct]    = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring,  setRestoring]  = useState(false);
  const [error,      setError]      = useState(null);

  useEffect(() => {
    if (!IAP_AVAILABLE) return;
    let purchaseUpdateSub, purchaseErrorSub;

    async function setup() {
      try {
        await iap.initConnection();
        const products = await iap.getProducts({ skus: [PRODUCT_ID] });
        if (products.length > 0) setProduct(products[0]);

        purchaseUpdateSub = iap.purchaseUpdatedListener(async (purchase) => {
          if (purchase.transactionReceipt) {
            try {
              await iap.finishTransaction({ purchase, isConsumable: false });
              setPurchasing(false);
              setRestoring(false);
              onSuccess?.();
            } catch (e) { console.warn("[IAP] finishTransaction:", e); }
          }
        });

        purchaseErrorSub = iap.purchaseErrorListener((e) => {
          setPurchasing(false);
          setRestoring(false);
          if (e.code !== "E_USER_CANCELLED") {
            setError(e.message);
            Alert.alert("구매 오류", e.message);
          }
        });
      } catch (e) {
        console.warn("[IAP] 초기화 실패:", e);
        setError(e.message);
      }
    }

    setup();
    return () => {
      purchaseUpdateSub?.remove();
      purchaseErrorSub?.remove();
      iap.endConnection();
    };
  }, []);

  const purchase = useCallback(async () => {
    if (!IAP_AVAILABLE) {
      Alert.alert("알림", "Expo Go에서는 결제를 지원하지 않습니다.\nEAS 빌드 후 테스트해 주세요.");
      return;
    }
    if (!product || purchasing) return;
    setPurchasing(true);
    setError(null);
    try {
      await iap.requestPurchase({ sku: PRODUCT_ID });
    } catch (e) {
      setPurchasing(false);
      if (e.code !== "E_USER_CANCELLED") {
        setError(e.message);
        Alert.alert("구매 실패", "잠시 후 다시 시도해 주세요.");
      }
    }
  }, [product, purchasing]);

  const restore = useCallback(async () => {
    if (!IAP_AVAILABLE) {
      Alert.alert("알림", "Expo Go에서는 복원을 지원하지 않습니다.");
      return;
    }
    if (restoring) return;
    setRestoring(true);
    setError(null);
    try {
      const purchases = await iap.getAvailablePurchases();
      const found = purchases.some(p => p.productId === PRODUCT_ID);
      if (found) {
        onSuccess?.();
        Alert.alert("복원 완료", "광고 제거가 복원되었습니다! 🎉");
      } else {
        Alert.alert("복원할 내역 없음", "이 계정으로 구매한 내역이 없습니다.");
      }
    } catch (e) {
      setError(e.message);
      Alert.alert("복원 실패", "잠시 후 다시 시도해 주세요.");
    } finally {
      setRestoring(false);
    }
  }, [restoring, onSuccess]);

  return { product, purchasing, restoring, error, purchase, restore };
}
