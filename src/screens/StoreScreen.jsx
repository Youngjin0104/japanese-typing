import {
  View, Text, TouchableOpacity, ScrollView,
  ActivityIndicator, StyleSheet, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { C } from "../styles/colors.js";
import { shadow } from "../styles/theme.js";
import { useIAP } from "../hooks/useIAP.js";
import { useAdRemoved } from "../hooks/useAdRemoved.js";

// ─────────────────────────────────────────────
// 🛒 StoreScreen — 광고 제거 인앱결제 화면
// ─────────────────────────────────────────────
export default function StoreScreen() {
  const nav = useNavigation();
  const { adRemoved, markAdRemoved } = useAdRemoved();
  const { product, purchasing, restoring, purchase, restore } = useIAP({
    onSuccess: markAdRemoved,
  });

  // 이미 구매한 경우
  if (adRemoved) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()} activeOpacity={0.8}>
            <Text style={s.backBtnText}>← 뒤로</Text>
          </TouchableOpacity>
        </View>
        <View style={s.center}>
          <Text style={s.doneIcon}>🎉</Text>
          <Text style={s.doneTitle}>광고 제거 완료!</Text>
          <Text style={s.doneSub}>이미 광고 제거를 구매하셨습니다.{"\n"}광고 없이 쾌적하게 학습하세요 🌸</Text>
          <View style={s.benefitCard}>
            {BENEFITS.map((b, i) => (
              <View key={i} style={s.benefitRow}>
                <Text style={s.benefitIcon}>✅</Text>
                <Text style={s.benefitText}>{b}</Text>
              </View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()} activeOpacity={0.8}>
          <Text style={s.backBtnText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>광고 제거</Text>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* 히어로 */}
        <View style={s.hero}>
          <Text style={s.heroIcon}>🌸</Text>
          <Text style={s.heroTitle}>광고 없이{"\n"}집중해서 배우세요</Text>
          <Text style={s.heroSub}>단 한 번의 구매로 영구 광고 제거</Text>
        </View>

        {/* 혜택 목록 */}
        <View style={s.benefitCard}>
          <Text style={s.benefitTitle}>구매 혜택</Text>
          {BENEFITS.map((b, i) => (
            <View key={i} style={s.benefitRow}>
              <Text style={s.benefitIcon}>✅</Text>
              <Text style={s.benefitText}>{b}</Text>
            </View>
          ))}
        </View>

        {/* 비교표 */}
        <View style={s.compareCard}>
          <View style={s.compareHeader}>
            <View style={s.compareCol}><Text style={s.compareColLabel}>무료</Text></View>
            <View style={[s.compareCol, s.compareColPaid]}><Text style={[s.compareColLabel, { color: "#fff" }]}>구매 후</Text></View>
          </View>
          {COMPARE.map((row, i) => (
            <View key={i} style={[s.compareRow, i % 2 === 0 && { backgroundColor: C.surface }]}>
              <View style={s.compareCol}><Text style={s.compareFree}>{row.free}</Text></View>
              <View style={[s.compareCol, s.compareColPaid]}><Text style={s.comparePaid}>{row.paid}</Text></View>
            </View>
          ))}
        </View>

        {/* 가격 카드 */}
        <View style={s.priceCard}>
          <View style={s.priceRow}>
            <Text style={s.priceLabel}>광고 제거</Text>
            <View style={s.priceTag}>
              <Text style={s.priceAmount}>
                {product ? product.localizedPrice : "₩5,000"}
              </Text>
              <Text style={s.priceOnce}>1회 결제 · 영구</Text>
            </View>
          </View>
          <Text style={s.priceDesc}>
            동일 Apple ID / Google 계정으로 로그인하면{"\n"}
            기기 변경·앱 재설치 후에도 복원됩니다.
          </Text>
        </View>

        {/* 구매 버튼 */}
        <TouchableOpacity
          style={[s.buyBtn, (purchasing || !product) && s.buyBtnDisabled]}
          onPress={purchase}
          activeOpacity={0.85}
          disabled={purchasing || !product}
        >
          {purchasing
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.buyBtnText}>
                광고 제거 구매 — {product ? product.localizedPrice : "₩5,000"}
              </Text>
          }
        </TouchableOpacity>

        {/* 복원 버튼 */}
        <TouchableOpacity
          style={s.restoreBtn}
          onPress={restore}
          activeOpacity={0.8}
          disabled={restoring}
        >
          {restoring
            ? <ActivityIndicator color={C.dim} size="small" />
            : <Text style={s.restoreBtnText}>이미 구매했어요 — 복원하기</Text>
          }
        </TouchableOpacity>

        {/* 법적 고지 */}
        <Text style={s.legal}>
          · 결제는 구매 확인 시 Apple ID / Google Play 계정에 청구됩니다.{"\n"}
          · 자동 갱신되지 않는 1회성 구매입니다.{"\n"}
          · 구매 복원은 동일 계정 로그인 후 '복원하기'를 누르세요.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
const BENEFITS = [
  "모드 완료 시 전면 광고 없음",
  "학습 흐름 끊김 없이 집중 가능",
  "영구 적용 — 추가 비용 없음",
  "기기 변경 후 복원 가능",
];

const COMPARE = [
  { free: "📢 모드 완료마다 광고", paid: "🚫 광고 없음" },
  { free: "⏳ 광고 대기 시간 발생", paid: "⚡ 즉시 다음 모드로" },
  { free: "🔁 반복 노출",           paid: "✅ 쾌적한 학습 환경" },
];

// ─────────────────────────────────────────────
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14 },
  backBtn:     { backgroundColor: C.card, borderWidth: 2, borderColor: C.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, ...shadow(1) },
  backBtnText: { fontSize: 13, color: C.dim, fontFamily: "NotoSansKR-Medium" },
  headerTitle: { fontSize: 16, fontWeight: "700", color: C.text, fontFamily: "NotoSansKR-Bold" },
  scroll: { paddingHorizontal: 20, paddingBottom: 48 },

  // 히어로
  hero:     { alignItems: "center", paddingVertical: 32 },
  heroIcon: { fontSize: 64, marginBottom: 16 },
  heroTitle:{ fontSize: 26, fontWeight: "800", color: C.text, textAlign: "center", lineHeight: 36, marginBottom: 10, fontFamily: "NotoSansKR-Bold" },
  heroSub:  { fontSize: 14, color: C.dim, fontFamily: "NotoSansKR-Regular" },

  // 혜택
  benefitCard:  { backgroundColor: C.card, borderWidth: 2, borderColor: C.border, borderRadius: 20, padding: 20, marginBottom: 14, ...shadow(1) },
  benefitTitle: { fontSize: 14, fontWeight: "700", color: C.textMid, marginBottom: 14, fontFamily: "NotoSansKR-Bold" },
  benefitRow:   { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  benefitIcon:  { fontSize: 16 },
  benefitText:  { fontSize: 14, color: C.text, fontFamily: "NotoSansKR-Regular", flex: 1 },

  // 비교표
  compareCard:   { borderWidth: 2, borderColor: C.border, borderRadius: 20, overflow: "hidden", marginBottom: 14 },
  compareHeader: { flexDirection: "row" },
  compareCol:    { flex: 1, padding: 10, alignItems: "center" },
  compareColPaid:{ backgroundColor: C.accent },
  compareColLabel:{ fontSize: 12, fontWeight: "700", color: C.dim, fontFamily: "NotoSansKR-Bold" },
  compareRow:    { flexDirection: "row", borderTopWidth: 1, borderTopColor: C.border },
  compareFree:   { fontSize: 12, color: C.dim, textAlign: "center", fontFamily: "NotoSansKR-Regular" },
  comparePaid:   { fontSize: 12, color: "#fff", textAlign: "center", fontFamily: "NotoSansKR-Medium" },

  // 가격 카드
  priceCard: { backgroundColor: C.card, borderWidth: 2.5, borderColor: C.accent, borderRadius: 20, padding: 20, marginBottom: 20, ...shadow(1) },
  priceRow:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  priceLabel:{ fontSize: 16, fontWeight: "700", color: C.text, fontFamily: "NotoSansKR-Bold" },
  priceTag:  { alignItems: "flex-end" },
  priceAmount:{ fontSize: 22, fontWeight: "800", color: C.accent, fontFamily: "NotoSansKR-Bold" },
  priceOnce: { fontSize: 11, color: C.dim, fontFamily: "NotoSansKR-Regular" },
  priceDesc: { fontSize: 12, color: C.dim, lineHeight: 20, fontFamily: "NotoSansKR-Regular" },

  // 버튼
  buyBtn:         { backgroundColor: C.accent, borderRadius: 16, paddingVertical: 17, alignItems: "center", marginBottom: 12, ...shadow(1) },
  buyBtnDisabled: { opacity: 0.6 },
  buyBtnText:     { color: "#fff", fontSize: 16, fontWeight: "700", fontFamily: "NotoSansKR-Bold" },
  restoreBtn:     { borderWidth: 2, borderColor: C.border, borderRadius: 14, paddingVertical: 13, alignItems: "center", backgroundColor: C.card, marginBottom: 20 },
  restoreBtnText: { fontSize: 14, color: C.dim, fontFamily: "NotoSansKR-Medium" },

  // 법적 고지
  legal: { fontSize: 11, color: C.dimSoft, lineHeight: 19, fontFamily: "NotoSansKR-Regular", textAlign: "center" },

  // 완료 화면
  center:    { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, paddingBottom: 60 },
  doneIcon:  { fontSize: 72, marginBottom: 20 },
  doneTitle: { fontSize: 26, fontWeight: "800", color: C.green, marginBottom: 12, fontFamily: "NotoSansKR-Bold" },
  doneSub:   { fontSize: 14, color: C.dim, textAlign: "center", lineHeight: 22, marginBottom: 28, fontFamily: "NotoSansKR-Regular" },
});
