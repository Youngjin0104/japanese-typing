import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { C } from "../styles/colors.js";
import { shadow } from "../styles/theme.js";
import { useShortProgress } from "../hooks/useProgress.js";
import { SHORT_TEXTS } from "../data/content.js";

function CatCard({ catKey, cat }) {
  const nav = useNavigation();
  const { pct, isCompleted } = useShortProgress(catKey, cat.items.length);

  return (
    <TouchableOpacity
      style={s.card}
      onPress={() => nav.navigate("ShortPractice", { catKey })}
      activeOpacity={0.82}
    >
      <View style={[s.iconBox, { backgroundColor: `${cat.color}12`, borderColor: `${cat.color}28` }]}>
        <Text style={s.iconText}>{cat.icon}</Text>
      </View>
      <View style={s.info}>
        <View style={s.titleRow}>
          <Text style={s.label}>{cat.label}</Text>
          <View style={[s.countBadge, { backgroundColor: `${cat.color}14` }]}>
            <Text style={[s.countText, { color: cat.color }]}>{cat.items.length}문장</Text>
          </View>
          {isCompleted && (
            <View style={s.doneBadge}>
              <Text style={s.doneText}>✓ 완료</Text>
            </View>
          )}
        </View>
        <Text style={s.desc}>{cat.desc}</Text>
        {pct > 0 && (
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${pct}%`, backgroundColor: cat.color }]} />
          </View>
        )}
        <View style={s.previewRow}>
          {cat.items.slice(0, 2).map(it => (
            <View key={it.id} style={s.previewChip}>
              <Text style={s.previewText} numberOfLines={1}>{it.text}</Text>
            </View>
          ))}
          <Text style={s.dots}>···</Text>
        </View>
      </View>
      <Text style={s.arrow}>›</Text>
    </TouchableOpacity>
  );
}

export default function CatSelectScreen() {
  const nav  = useNavigation();
  const cats = Object.entries(SHORT_TEXTS);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()} activeOpacity={0.8}>
          <Text style={s.backBtnText}>← 뒤로</Text>
        </TouchableOpacity>
        <View>
          <Text style={s.screenTitle}>단문 연습 💬</Text>
          <Text style={s.screenSub}>카테고리를 선택하세요</Text>
        </View>
      </View>
      <FlatList
        data={cats}
        keyExtractor={([key]) => key}
        renderItem={({ item: [key, cat] }) => <CatCard catKey={key} cat={cat} />}
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
  card:    { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: C.card, borderWidth: 2, borderColor: C.border, borderRadius: 20, padding: 18, ...shadow(1) },
  iconBox: { width: 58, height: 58, borderRadius: 18, borderWidth: 2, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  iconText:{ fontSize: 28 },
  info:    { flex: 1 },
  titleRow:{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" },
  label:   { fontSize: 18, fontWeight: "700", color: C.text, fontFamily: "NotoSansKR-Bold" },
  countBadge:{ paddingHorizontal: 9, paddingVertical: 2, borderRadius: 99 },
  countText: { fontSize: 10, fontFamily: "NotoSansKR-Medium" },
  doneBadge: { backgroundColor: C.correctDim, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
  doneText:  { fontSize: 9, color: C.correct, fontFamily: "NotoSansKR-Medium" },
  desc:    { fontSize: 12, color: C.dim, marginBottom: 8, fontFamily: "NotoSansKR-Regular" },
  progressTrack:{ height: 4, backgroundColor: C.borderSoft, borderRadius: 99, overflow: "hidden", marginBottom: 8 },
  progressFill: { height: "100%", borderRadius: 99 },
  previewRow:{ flexDirection: "row", gap: 5, alignItems: "center" },
  previewChip:{ backgroundColor: C.surface, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  previewText: { fontFamily: "ZenKakuGothicNew-Regular", fontSize: 11, color: C.dimSoft, maxWidth: 80 },
  dots:  { fontSize: 11, color: C.dimSoft },
  arrow: { fontSize: 18, color: C.dimSoft },
});
