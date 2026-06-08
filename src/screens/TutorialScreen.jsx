import { useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { C } from "../styles/colors.js";
import { shadow } from "../styles/theme.js";

const TABS = [
  { id: "ios",     label: "🍎 iOS" },
  { id: "android", label: "🤖 Android" },
  { id: "flick",   label: "👆 플릭" },
];

function Card({ children }) {
  return <View style={s.card}>{children}</View>;
}

function Step({ n, text }) {
  return (
    <View style={s.stepRow}>
      <View style={s.stepNum}><Text style={s.stepNumText}>{n}</Text></View>
      <Text style={s.stepText}>{text}</Text>
    </View>
  );
}

function Tip({ text }) {
  return (
    <View style={s.tip}>
      <Text style={s.tipIcon}>💡</Text>
      <Text style={s.tipText}>{text}</Text>
    </View>
  );
}


const FLICK_DATA = [
  { c:"あ",u:"い",r:"う",d:"え",l:"お" },
  { c:"か",u:"き",r:"く",d:"け",l:"こ" },
  { c:"さ",u:"し",r:"す",d:"せ",l:"そ" },
  { c:"た",u:"ち",r:"つ",d:"て",l:"と" },
  { c:"な",u:"に",r:"ぬ",d:"ね",l:"の" },
  { c:"は",u:"ひ",r:"ふ",d:"へ",l:"ほ" },
  { c:"ら",u:"り",r:"る",d:"れ",l:"ろ" },
  { c:"わ",u:"",  r:"ん",d:"",  l:"を" },
];

function IosTab() {
  return (
    <Card>
      <Text style={s.cardTitle}>⚙️ 설정 앱에서 키보드 추가</Text>
      {["설정 앱 열기",
        "일반 → 키보드 → 키보드 탭",
        "새로운 키보드 추가",
        "日本語(Japanese) 선택",
        "로마자(Romaji) 또는 かな 선택",
        "🌐 버튼으로 키보드 전환",
      ].map((t, i) => <Step key={i} n={i+1} text={t} />)}
      <Tip text="🌐(지구본) 아이콘을 길게 누르면 전체 키보드 목록이 표시됩니다." />
    </Card>
  );
}

function AndroidTab() {
  return (
    <Card>
      <Text style={s.cardTitle}>⚙️ Gboard에서 일본어 추가</Text>
      {["Gboard 앱 설치 (Play 스토어)",
        "설정 → 일반 관리 → 언어 및 입력",
        "화면 키보드 → Gboard → 언어",
        "키보드 추가 → 日本語 선택",
        "로마자 / 플릭 / 12키 중 선택",
        "스페이스바 길게 눌러 언어 전환",
      ].map((t, i) => <Step key={i} n={i+1} text={t} />)}
      <Tip text="삼성 갤럭시는 삼성 키보드 설정 → 언어 및 타이핑에서도 일본어를 추가할 수 있습니다." />
    </Card>
  );
}


function FlickTab() {
  return (
    <Card>
      <Text style={s.cardTitle}>👆 플릭 방향</Text>
      <View style={s.flickGrid}>
        {FLICK_DATA.map((row, ri) => (
          <View key={ri} style={s.flickCard}>
            <Text style={s.flickLabel}>{row.c}행</Text>
            <View style={s.flickCross}>
              <View style={s.flickRow}>
                <View style={s.flickCell}/>
                <View style={[s.flickCell, s.flickCenter]}>
                  <Text style={s.flickUp}>{row.u||"·"}</Text>
                </View>
                <View style={s.flickCell}/>
              </View>
              <View style={s.flickRow}>
                <View style={[s.flickCell, s.flickSide]}>
                  <Text style={s.flickDir}>{row.l||"·"}</Text>
                </View>
                <View style={[s.flickCell, s.flickMain]}>
                  <Text style={s.flickMainText}>{row.c}</Text>
                </View>
                <View style={[s.flickCell, s.flickSide]}>
                  <Text style={s.flickDir}>{row.r||"·"}</Text>
                </View>
              </View>
              <View style={s.flickRow}>
                <View style={s.flickCell}/>
                <View style={[s.flickCell, s.flickCenter]}>
                  <Text style={s.flickDown}>{row.d||"·"}</Text>
                </View>
                <View style={s.flickCell}/>
              </View>
            </View>
          </View>
        ))}
      </View>
      <Tip text="중앙 탭 → 첫 글자, 위/아래/좌/우 스와이프 → 나머지 글자가 입력됩니다." />
    </Card>
  );
}

export default function TutorialScreen() {
  const nav = useNavigation();
  const [tab, setTab] = useState("ios");

  return (
    <SafeAreaView style={s.safe}>
      {/* 스티키 헤더 + 탭 */}
      <View style={s.stickyHeader}>
        <View style={s.headerRow}>
          <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()} activeOpacity={0.8}>
            <Text style={s.backBtnText}>← 뒤로</Text>
          </TouchableOpacity>
          <View>
            <Text style={s.screenTitle}>📱 입력 튜토리얼</Text>
            <Text style={s.screenSub}>모바일 일본어 키보드 설정 가이드</Text>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabBar} contentContainerStyle={{ gap: 6, paddingHorizontal: 20 }}>
          {TABS.map(t => (
            <TouchableOpacity key={t.id} onPress={() => setTab(t.id)} style={[s.tabBtn, tab === t.id && s.tabBtnActive]} activeOpacity={0.8}>
              <Text style={[s.tabText, tab === t.id && s.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {tab === "ios"     && <IosTab />}
        {tab === "android" && <AndroidTab />}
        {tab === "flick"   && <FlickTab />}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.bg },
  stickyHeader: { backgroundColor: C.bg, borderBottomWidth: 1, borderBottomColor: C.border },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12 },
  backBtn:   { backgroundColor: C.card, borderWidth: 2, borderColor: C.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, ...shadow(1) },
  backBtnText:{ fontSize: 13, color: C.dim, fontFamily: "NotoSansKR-Medium" },
  screenTitle:{ fontSize: 15, fontWeight: "700", color: C.text, fontFamily: "NotoSansKR-Bold" },
  screenSub:  { fontSize: 11, color: C.dim, fontFamily: "NotoSansKR-Regular" },
  tabBar: { paddingBottom: 10 },
  tabBtn:   { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.card },
  tabBtnActive:{ backgroundColor: C.accent, borderColor: C.accent },
  tabText:  { fontSize: 13, color: C.dim, fontFamily: "NotoSansKR-Medium" },
  tabTextActive:{ color: "#fff", fontWeight: "700" },
  scroll: { padding: 20, paddingBottom: 48 },
  card:   { backgroundColor: C.card, borderWidth: 2, borderColor: C.border, borderRadius: 18, padding: 18, marginBottom: 14, ...shadow(1) },
  cardTitle:{ fontSize: 14, fontWeight: "700", color: C.text, marginBottom: 14, fontFamily: "NotoSansKR-Bold" },
  stepRow:  { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  stepNum:  { width: 22, height: 22, borderRadius: 99, backgroundColor: C.accent, alignItems: "center", justifyContent: "center" },
  stepNumText:{ color: "#fff", fontSize: 11, fontWeight: "700" },
  stepText: { flex: 1, fontSize: 13, color: C.textMid, lineHeight: 20, fontFamily: "NotoSansKR-Regular" },
  tip:  { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: C.goldDim, borderRadius: 12, padding: 12, marginTop: 8 },
  tipIcon:{ fontSize: 14 },
  tipText:{ flex: 1, fontSize: 12, color: C.dim, lineHeight: 19, fontFamily: "NotoSansKR-Regular" },
  // flick
  flickGrid:{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 },
  flickCard:{ alignItems: "center" },
  flickLabel:{ fontSize: 9, color: C.dim, marginBottom: 3, fontFamily: "NotoSansKR-Regular" },
  flickCross:{ width: 66, height: 66, backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.border, borderRadius: 10, overflow: "hidden" },
  flickRow:  { flexDirection: "row", flex: 1 },
  flickCell: { flex: 1, alignItems: "center", justifyContent: "center" },
  flickCenter:{ flex: 1 },
  flickMain: { flex: 1, backgroundColor: C.card, alignItems: "center", justifyContent: "center" },
  flickMainText:{ fontFamily: "ZenKakuGothicNew-Bold", fontSize: 15, color: C.text },
  flickSide: { flex: 1 },
  flickUp:   { fontFamily: "ZenKakuGothicNew-Regular", fontSize: 10, color: C.accent },
  flickDown: { fontFamily: "ZenKakuGothicNew-Regular", fontSize: 10, color: C.accent },
  flickDir:  { fontFamily: "ZenKakuGothicNew-Regular", fontSize: 10, color: C.accent },
});
