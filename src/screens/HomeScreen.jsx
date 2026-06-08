import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { C } from "../styles/colors.js";
import { shadow } from "../styles/theme.js";
import { MiniToggle } from "../components/Controls.jsx";
import { useTaleProgress, useShortProgress, useSettings } from "../hooks/useProgress.js";
import { useAdContext } from "../contexts/AdContext.jsx";
import { FOLK_TALES, SHORT_TEXTS } from "../data/content.js";

const MODES = [
  { screen: "LongSelect",  icon: "📖", label: "장문 연습",  sub: "전래동화",  desc: "모모타로·우라시마 타로 등 9편",   accent: C.blue   },
  { screen: "CatSelect",   icon: "💬", label: "단문 연습",  sub: "속담·회화", desc: "속담·명언·일상회화·계절·음식",    accent: C.accent },
  { screen: "WordCard",    icon: "🃏", label: "단어 카드",  sub: "N5~N2",     desc: "JLPT 단어 100개·후리가나 입력",   accent: C.gold   },
];

// 완료 배지 — tale
function TaleBadge({ taleId, total }) {
  const { isCompleted, data } = useTaleProgress(taleId, total);
  if (!isCompleted) return null;
  return (
    <View style={s.badge}>
      <Text style={[s.badgeText, { color: C.correct }]}>✓ {data?.bestCpm}타/분</Text>
    </View>
  );
}

export default function HomeScreen() {
  const nav = useNavigation();
  const { settings, update } = useSettings();
  const { noKanji, showFurigana } = settings;
  const { adRemoved } = useAdContext();

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 헤더 */}
        <View style={s.header}>
          <View style={s.logoBox}>
            <Text style={s.logoText}>日</Text>
          </View>
          <Text style={s.tagline}>Japanese Typing ✨</Text>
          <Text style={s.heroTitle}>일본어 타자 연습</Text>
          <Text style={s.heroSub}>실력에 맞는 모드를 골라보세요 🌸</Text>
        </View>

        {/* 옵션 */}
        <View style={s.optionCard}>
          <Text style={s.optionTitle}>⚙️ 연습 옵션</Text>
          <View style={s.toggleRow}>
            <MiniToggle
              label="ひらがなのみ"
              value={noKanji}
              onChange={v => update({ noKanji: v })}
              activeColor={C.green}
            />
            <MiniToggle
              label="振仮名"
              value={showFurigana}
              onChange={v => update({ showFurigana: v })}
              activeColor={C.gold}
            />
          </View>
          <Text style={s.optionHint}>
            · ひらがなのみ — 한자를 히라가나로 표시 (기본값){"\n"}
            · 振仮名 — 한자 위에 후리가나 표시
          </Text>
        </View>

        {/* 모드 버튼 */}
        {MODES.map(mode => (
          <TouchableOpacity
            key={mode.screen}
            style={s.modeBtn}
            onPress={() => nav.navigate(mode.screen)}
            activeOpacity={0.82}
          >
            <View style={[s.modeIcon, { backgroundColor: `${mode.accent}12`, borderColor: `${mode.accent}28` }]}>
              <Text style={s.modeIconText}>{mode.icon}</Text>
            </View>
            <View style={s.modeInfo}>
              <View style={s.modeTitleRow}>
                <Text style={s.modeLabel}>{mode.label}</Text>
                <View style={[s.subBadge, { backgroundColor: `${mode.accent}14` }]}>
                  <Text style={[s.subBadgeText, { color: mode.accent }]}>{mode.sub}</Text>
                </View>
              </View>
              <Text style={s.modeDesc}>{mode.desc}</Text>
            </View>
            <Text style={s.arrow}>›</Text>
          </TouchableOpacity>
        ))}

        {/* 튜토리얼 */}
        <TouchableOpacity
          style={s.tutorialBtn}
          onPress={() => nav.navigate("Tutorial")}
          activeOpacity={0.82}
        >
          <View style={s.tutorialIcon}>
            <Text style={{ fontSize: 22 }}>📱</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.tutorialTitle}>처음이라면? 입력 튜토리얼</Text>
            <Text style={s.tutorialDesc}>모바일 일본어 키보드 설정·로마자 입력법</Text>
          </View>
          <Text style={[s.arrow, { color: C.green }]}>›</Text>
        </TouchableOpacity>

        {/* 광고 제거 구매 */}
        <TouchableOpacity
          style={[s.storeBtn, adRemoved && s.storeBtnDone]}
          onPress={() => nav.navigate("Store")}
          activeOpacity={0.82}
        >
          <View style={s.storeIcon}>
            <Text style={{ fontSize: 22 }}>{adRemoved ? "✅" : "🚫"}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.storeTitle, adRemoved && { color: C.green }]}>
              {adRemoved ? "광고 제거 완료!" : "광고 제거 — ₩5,000"}
            </Text>
            <Text style={s.storeDesc}>
              {adRemoved ? "광고 없이 쾌적하게 학습 중 🌸" : "모드 완료 전면광고를 영구 제거"}
            </Text>
          </View>
          {!adRemoved && <Text style={[s.arrow, { color: C.gold }]}>›</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 48 },
  // 헤더
  header:    { alignItems: "center", paddingTop: 44, paddingBottom: 28 },
  logoBox:   { width: 76, height: 76, borderRadius: 26, backgroundColor: C.surface, borderWidth: 2.5, borderColor: C.border, alignItems: "center", justifyContent: "center", marginBottom: 18, ...shadow(1) },
  logoText:  { fontFamily: "ZenKakuGothicNew-Black", fontSize: 36, color: C.accent },
  tagline:   { fontFamily: "ZenKakuGothicNew-Regular", fontSize: 12, color: C.dim, letterSpacing: 4, marginBottom: 6 },
  heroTitle: { fontFamily: "NotoSansKR-Bold", fontSize: 28, color: C.text, letterSpacing: 1 },
  heroSub:   { fontFamily: "NotoSansKR-Regular", fontSize: 13, color: C.dim, marginTop: 8 },
  // 옵션
  optionCard:  { backgroundColor: C.card, borderWidth: 2, borderColor: C.border, borderRadius: 18, padding: 16, marginBottom: 16, ...shadow(1) },
  optionTitle: { fontSize: 12, fontWeight: "700", color: C.textMid, marginBottom: 10, fontFamily: "NotoSansKR-Bold" },
  toggleRow:   { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  optionHint:  { fontSize: 11, color: C.dim, lineHeight: 19, fontFamily: "NotoSansKR-Regular" },
  // 모드 버튼
  modeBtn:    { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: C.card, borderWidth: 2, borderColor: C.border, borderRadius: 20, padding: 18, marginBottom: 12, ...shadow(1) },
  modeIcon:   { width: 54, height: 54, borderRadius: 16, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  modeIconText:{ fontSize: 26 },
  modeInfo:   { flex: 1 },
  modeTitleRow:{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  modeLabel:  { fontSize: 17, fontWeight: "700", color: C.text, fontFamily: "NotoSansKR-Bold" },
  subBadge:   { paddingHorizontal: 9, paddingVertical: 2, borderRadius: 99 },
  subBadgeText:{ fontSize: 10, fontFamily: "NotoSansKR-Medium" },
  modeDesc:   { fontSize: 12, color: C.dim, fontFamily: "NotoSansKR-Regular" },
  arrow:      { fontSize: 20, color: C.dimSoft },
  // 진도 배지
  badge:      { flexDirection: "row", alignItems: "center", backgroundColor: C.correctDim, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
  badgeText:  { fontSize: 9, fontFamily: "NotoSansKR-Medium" },
  // 튜토리얼
  tutorialBtn:  { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: `${C.green}08`, borderWidth: 2, borderColor: `${C.green}44`, borderRadius: 18, padding: 16, marginTop: 4, ...shadow(1) },
  tutorialIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: `${C.green}18`, borderWidth: 2, borderColor: `${C.green}30`, alignItems: "center", justifyContent: "center" },
  tutorialTitle:{ fontSize: 16, fontWeight: "700", color: C.green, marginBottom: 3, fontFamily: "NotoSansKR-Bold" },
  tutorialDesc: { fontSize: 12, color: C.dim, fontFamily: "NotoSansKR-Regular" },
  storeBtn:     { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: `${C.gold}08`, borderWidth: 2, borderColor: `${C.gold}44`, borderRadius: 18, padding: 16, marginTop: 10, ...shadow(1) },
  storeBtnDone: { backgroundColor: `${C.green}08`, borderColor: `${C.green}44` },
  storeIcon:    { width: 48, height: 48, borderRadius: 14, backgroundColor: `${C.gold}18`, borderWidth: 2, borderColor: `${C.gold}30`, alignItems: "center", justifyContent: "center" },
  storeTitle:   { fontSize: 16, fontWeight: "700", color: C.gold, marginBottom: 3, fontFamily: "NotoSansKR-Bold" },
  storeDesc:    { fontSize: 12, color: C.dim, fontFamily: "NotoSansKR-Regular" },
});
