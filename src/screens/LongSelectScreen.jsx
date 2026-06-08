import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { C } from "../styles/colors.js";
import { shadow } from "../styles/theme.js";
import { useTaleProgress } from "../hooks/useProgress.js";
import { FOLK_TALES } from "../data/content.js";

const LV_COLOR = { "초급": C.green, "중급": C.gold, "고급": C.accent };

function TaleCard({ tale }) {
  const nav = useNavigation();
  const { isCompleted, data } = useTaleProgress(tale.id, tale.sentences.length);

  return (
    <TouchableOpacity
      style={s.card}
      onPress={() => nav.navigate("LongPractice", { taleId: tale.id })}
      activeOpacity={0.82}
    >
      {isCompleted && (
        <View style={s.completeBadge}>
          <Text style={s.completeBadgeText}>✓ 완료 · 최고 {data?.bestCpm}타/분</Text>
        </View>
      )}
      <View style={s.cardTop}>
        <Text style={s.taleTitle}>{tale.title}</Text>
        <View style={[s.lvBadge, { backgroundColor: `${LV_COLOR[tale.level]}18` }]}>
          <Text style={[s.lvText, { color: LV_COLOR[tale.level] }]}>{tale.level}</Text>
        </View>
        <Text style={s.arrow}>›</Text>
      </View>
      <Text style={s.koTitle}>{tale.titleKo} · {tale.sentences.length}문장</Text>
      <Text style={s.preview} numberOfLines={2}>{tale.sentences[0].ja}</Text>
    </TouchableOpacity>
  );
}

export default function LongSelectScreen() {
  const nav = useNavigation();
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()} activeOpacity={0.8}>
          <Text style={s.backBtnText}>← 뒤로</Text>
        </TouchableOpacity>
        <View>
          <Text style={s.screenTitle}>장문 연습 📖</Text>
          <Text style={s.screenSub}>연습할 전래동화를 선택하세요</Text>
        </View>
      </View>
      <FlatList
        data={FOLK_TALES}
        keyExtractor={t => String(t.id)}
        renderItem={({ item }) => <TaleCard tale={item} />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14 },
  backBtn:     { backgroundColor: C.card, borderWidth: 2, borderColor: C.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, ...shadow(1) },
  backBtnText: { fontSize: 13, color: C.dim, fontFamily: "NotoSansKR-Medium" },
  screenTitle: { fontSize: 15, fontWeight: "700", color: C.text, fontFamily: "NotoSansKR-Bold" },
  screenSub:   { fontSize: 11, color: C.dim, fontFamily: "NotoSansKR-Regular" },
  card:    { backgroundColor: C.card, borderWidth: 2, borderColor: C.border, borderRadius: 20, padding: 18, ...shadow(1) },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  taleTitle: { fontFamily: "ZenKakuGothicNew-Bold", fontSize: 20, color: C.text, flex: 1 },
  lvBadge: { paddingHorizontal: 10, paddingVertical: 2, borderRadius: 99 },
  lvText:  { fontSize: 10, fontFamily: "NotoSansKR-Medium" },
  arrow:   { fontSize: 18, color: C.dimSoft },
  koTitle: { fontSize: 12, color: C.dim, marginBottom: 8, fontFamily: "NotoSansKR-Regular" },
  preview: { fontFamily: "ZenKakuGothicNew-Regular", fontSize: 12, color: C.dimSoft, lineHeight: 20 },
  completeBadge:    { alignSelf: "flex-start", backgroundColor: C.correctDim, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99, marginBottom: 10 },
  completeBadgeText:{ fontSize: 10, color: C.correct, fontFamily: "NotoSansKR-Medium" },
});
