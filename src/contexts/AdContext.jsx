import { createContext, useContext } from "react";
import { useAdRemoved } from "../hooks/useAdRemoved.js";
import { useInterstitialAd } from "../hooks/useInterstitialAd.js";

// ─────────────────────────────────────────────
// 🌐 AdContext
//
// App.jsx 최상위에서 감싸면 모든 화면에서
//   const { showAd, adRemoved } = useAdContext()
// 로 광고 표시·상태 확인 가능
// ─────────────────────────────────────────────
const AdContext = createContext({ showAd: async () => {}, adRemoved: false, markAdRemoved: () => {} });

export function AdProvider({ children }) {
  const { adRemoved, loading, markAdRemoved } = useAdRemoved();
  const { showAd } = useInterstitialAd({ adRemoved });

  if (loading) return children; // 로딩 중엔 children 그대로 표시

  return (
    <AdContext.Provider value={{ adRemoved, markAdRemoved, showAd }}>
      {children}
    </AdContext.Provider>
  );
}

export function useAdContext() {
  return useContext(AdContext);
}
