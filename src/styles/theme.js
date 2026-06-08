import { StyleSheet, Platform } from "react-native";
import { C } from "./colors.js";

// ─────────────────────────────────────────────
// 공통 shadow 헬퍼 (iOS shadow + Android elevation)
// ─────────────────────────────────────────────
export function shadow(level = 1) {
  const depths = [
    // level 0
    {},
    // level 1 — card
    Platform.select({
      ios: { shadowColor: "#64461480", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
    // level 2 — modal
    Platform.select({
      ios: { shadowColor: "#64461480", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20 },
      android: { elevation: 8 },
    }),
  ];
  return depths[level] ?? depths[1];
}

// ─────────────────────────────────────────────
// 공통 컴포넌트 스타일
// ─────────────────────────────────────────────
export const T = StyleSheet.create({
  // 카드
  card: {
    backgroundColor: C.card,
    borderWidth: 2,
    borderColor: C.border,
    borderRadius: 20,
    ...shadow(1),
  },
  // 백 버튼
  backBtn: {
    backgroundColor: C.card,
    borderWidth: 2,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    ...shadow(1),
  },
  backBtnText: {
    fontSize: 13,
    color: C.dim,
    fontFamily: "NotoSansKR-Medium",
  },
  // 주 버튼
  primaryBtn: {
    backgroundColor: C.accent,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    ...shadow(1),
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "NotoSansKR-Bold",
  },
  // 보조 버튼
  secondaryBtn: {
    borderWidth: 2,
    borderColor: C.border,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: C.card,
  },
  secondaryBtnText: {
    color: C.textMid,
    fontSize: 14,
    fontFamily: "NotoSansKR-Medium",
  },
  // 통계 칩
  statChip: {
    backgroundColor: C.card,
    borderWidth: 2,
    borderColor: C.border,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    ...shadow(1),
  },
  // 섹션 헤더
  screenHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 18,
    paddingBottom: 14,
  },
  // 진도 바 래퍼
  progressTrack: {
    height: 6,
    backgroundColor: C.borderSoft,
    borderRadius: 99,
    marginBottom: 14,
    overflow: "hidden",
  },
  // 한국어 본문
  koText: {
    fontFamily: "NotoSansKR-Regular",
    color: C.dim,
    lineHeight: 22,
  },
});
