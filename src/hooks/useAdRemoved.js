import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────
// 💾 광고 제거 상태 (AsyncStorage)
//
//   jta:ad_removed  →  "1" (구매 완료) | null (미구매)
//
// IAP 구매 완료 후 markAdRemoved() 호출 → 영구 저장
// 복원(Restore) 후에도 동일하게 호출
// ─────────────────────────────────────────────

const KEY = "jta:ad_removed";

export function useAdRemoved() {
  const [adRemoved, setAdRemoved] = useState(false);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then(v => { setAdRemoved(v === "1"); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  /** IAP 구매 · 복원 성공 후 호출 */
  const markAdRemoved = useCallback(async () => {
    await AsyncStorage.setItem(KEY, "1");
    setAdRemoved(true);
  }, []);

  /** 디버그/환불용 초기화 */
  const resetAdRemoved = useCallback(async () => {
    await AsyncStorage.removeItem(KEY);
    setAdRemoved(false);
  }, []);

  return { adRemoved, loading, markAdRemoved, resetAdRemoved };
}
