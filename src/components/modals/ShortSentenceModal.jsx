import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import ResultModal from "./ResultModal.jsx";
import { C } from "../../styles/colors.js";

export default function ShortSentenceModal({ visible, result, onNext, onRetry, isLast }) {
  if (!result) return null;
  const { item, typed, ok, err, cpm, elapsedSec, catColor } = result;
  const acc  = typed.length > 0 ? Math.round((ok / typed.length) * 100) : 100;
  const ac   = acc >= 90 ? C.correct : acc >= 70 ? C.gold : C.wrong;
  const icon = acc >= 95 && cpm > 80 ? "🌟" : acc >= 80 ? "⭐" : "💪";
  const msg  = acc >= 95 && cpm > 80 ? "완벽해요!" : acc >= 80 ? "잘했어요!" : "다시 도전!";
  const m = Math.floor(elapsedSec / 60), s = elapsedSec % 60;
  const color = catColor ?? C.accent;

  return (
    <ResultModal visible={visible}>
      <View style={st.center}>
        <Text style={st.icon}>{icon}</Text>
        <Text style={st.title}>{msg}</Text>
      </View>

      {/* 통계 3칸 */}
      <View style={st.statRow}>
        {[
          { l: "정확도",   v: acc, u: "%",  c: ac },
          { l: "타수/분",  v: cpm, u: "타", c: C.gold },
          { l: "소요시간", v: `${m}:${String(s).padStart(2,"0")}`, u: "", c: C.blue },
        ].map((chip, i) => (
          <View key={i} style={st.chip}>
            <Text style={[st.chipVal, { color: chip.c }]}>{chip.v}<Text style={st.chipUnit}>{chip.u}</Text></Text>
            <Text style={st.chipLabel}>{chip.l}</Text>
          </View>
        ))}
      </View>

      {/* 정답 / 내 입력 비교 */}
      <View style={st.compareBox}>
        <View style={st.compareRow}>
          <Text style={[st.tag, { color: C.correct, backgroundColor: C.correctDim }]}>정답</Text>
          <Text style={st.jaText}>{item.text}</Text>
        </View>
        <View style={[st.compareRow, { marginTop: 10, paddingTop: 10, borderTopWidth: 1.5, borderTopColor: C.borderSoft, borderStyle: "dashed" }]}>
          <Text style={[st.tag, { color: color, backgroundColor: `${color}18` }]}>입력</Text>
          <Text style={st.jaText}>
            {item.text.split("").map((c, i) => {
              const my = typed[i];
              const ok = my === c, miss = my === undefined;
              return <Text key={i} style={{ color: miss ? C.dimSoft : ok ? C.correct : C.wrong }}>{miss ? "_" : my}</Text>;
            })}
            {typed.length > item.text.length && <Text style={{ color: C.wrong }}>{typed.slice(item.text.length)}</Text>}
          </Text>
        </View>
      </View>

      {/* 정확도 바 */}
      <View style={st.accRow}>
        <Text style={[st.accPct, { color: ac }]}>{acc}%</Text>
      </View>
      <View style={st.accTrack}>
        <View style={[st.accFill, { width: `${acc}%`, backgroundColor: ac }]} />
      </View>

      <View style={st.btnGroup}>
        <TouchableOpacity
          style={[st.primaryBtn, { backgroundColor: isLast ? C.green : color }]}
          onPress={onNext} activeOpacity={0.85}
        >
          <Text style={st.primaryBtnText}>{isLast ? "🎉 완료!" : "다음 문장 →"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={st.secondaryBtn} onPress={onRetry} activeOpacity={0.85}>
          <Text style={st.secondaryBtnText}>🔄 다시 하기</Text>
        </TouchableOpacity>
      </View>
    </ResultModal>
  );
}

const st = StyleSheet.create({
  center:    { alignItems: "center", marginBottom: 18 },
  icon:      { fontSize: 44, marginBottom: 6 },
  title:     { fontSize: 22, fontWeight: "700", color: C.text, fontFamily: "NotoSansKR-Bold" },
  statRow:   { flexDirection: "row", gap: 8, marginBottom: 16 },
  chip:      { flex: 1, backgroundColor: C.surface, borderRadius: 14, padding: 10, alignItems: "center" },
  chipVal:   { fontSize: 20, fontWeight: "800", fontFamily: "NotoSansKR-Bold" },
  chipUnit:  { fontSize: 10, fontWeight: "400" },
  chipLabel: { fontSize: 10, color: C.dim, marginTop: 2, fontFamily: "NotoSansKR-Regular" },
  compareBox:{ backgroundColor: C.surface, borderRadius: 16, padding: 14, marginBottom: 16 },
  compareRow:{ flexDirection: "row", alignItems: "flex-start", gap: 8 },
  tag:       { fontSize: 10, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99, overflow: "hidden", marginTop: 2, fontFamily: "NotoSansKR-Bold" },
  jaText:    { flex: 1, fontFamily: "ZenKakuGothicNew-Regular", fontSize: 15, lineHeight: 26, letterSpacing: 0.5 },
  accRow:    { flexDirection: "row", justifyContent: "flex-end", marginBottom: 6 },
  accPct:    { fontSize: 13, fontWeight: "700", fontFamily: "NotoSansKR-Bold" },
  accTrack:  { height: 8, backgroundColor: C.borderSoft, borderRadius: 99, overflow: "hidden", marginBottom: 20 },
  accFill:   { height: "100%", borderRadius: 99 },
  btnGroup:  { gap: 10 },
  primaryBtn:     { borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "700", fontFamily: "NotoSansKR-Bold" },
  secondaryBtn:     { borderWidth: 2, borderColor: C.border, borderRadius: 14, paddingVertical: 14, alignItems: "center", backgroundColor: C.card },
  secondaryBtnText: { color: C.textMid, fontSize: 14, fontFamily: "NotoSansKR-Medium" },
});
