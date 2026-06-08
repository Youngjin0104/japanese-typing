import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import ResultModal from "./ResultModal.jsx";
import { C } from "../../styles/colors.js";

// ─────────────────────────────────────────────
// 📖 LongCompleteModal
// ─────────────────────────────────────────────
export function LongCompleteModal({ visible, stats, onRetry, onHome }) {
  if (!stats) return null;
  const { tale, cpm, elapsedSec, sentences = [] } = stats;
  const m = Math.floor(elapsedSec / 60), s = elapsedSec % 60;
  const totalOk    = sentences.reduce((a, b) => a + b.ok, 0);
  const totalChars = sentences.reduce((a, b) => a + b.chars, 0);
  const acc  = totalChars > 0 ? Math.round((totalOk / totalChars) * 100) : 0;
  const ac   = acc >= 90 ? C.correct : acc >= 70 ? C.gold : C.wrong;
  const icon = acc >= 90 && cpm > 100 ? "🏆" : acc >= 75 ? "⭐" : "👍";
  const msg  = acc >= 90 && cpm > 100 ? "완벽 완독!" : acc >= 75 ? "훌륭해요!" : "수고했어요!";

  return (
    <ResultModal visible={visible}>
      <View style={st.center}>
        <Text style={st.icon}>{icon}</Text>
        <Text style={st.title}>{msg}</Text>
        <Text style={st.sub}>{tale.titleKo}（{tale.title}）완독</Text>
      </View>

      <View style={st.statRow}>
        {[
          { l: "전체 정확도", v: acc, u: "%",  c: ac },
          { l: "분당 타수",   v: cpm, u: "타", c: C.gold },
          { l: "총 시간",     v: `${m}:${String(s).padStart(2,"0")}`, u: "", c: C.blue },
        ].map((chip, i) => (
          <View key={i} style={st.chip}>
            <Text style={[st.chipVal, { color: chip.c }]}>{chip.v}<Text style={st.chipUnit}>{chip.u}</Text></Text>
            <Text style={st.chipLabel}>{chip.l}</Text>
          </View>
        ))}
      </View>

      {/* 문장별 정확도 */}
      <View style={st.sentBox}>
        <Text style={st.sentTitle}>📝 문장별 정확도</Text>
        {sentences.map((sent, i) => {
          const a  = sent.chars > 0 ? Math.round((sent.ok / sent.chars) * 100) : 0;
          const bc = a >= 90 ? C.correct : a >= 70 ? C.gold : C.wrong;
          return (
            <View key={i} style={st.sentRow}>
              <View style={[st.sentNum, { backgroundColor: `${bc}20`, borderColor: `${bc}60` }]}>
                <Text style={[st.sentNumText, { color: bc }]}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={st.sentTrack}>
                  <View style={[st.sentFill, { width: `${a}%`, backgroundColor: bc }]} />
                </View>
                <Text style={st.sentDetail}>{sent.ok}자 정확 · {sent.err}자 오타</Text>
              </View>
              <Text style={[st.sentPct, { color: bc }]}>{a}%</Text>
            </View>
          );
        })}
      </View>

      <View style={st.btnGroup}>
        <TouchableOpacity style={st.primaryBtn} onPress={onRetry} activeOpacity={0.85}>
          <Text style={st.primaryBtnText}>🔄 다시 연습</Text>
        </TouchableOpacity>
        <TouchableOpacity style={st.secondaryBtn} onPress={onHome} activeOpacity={0.85}>
          <Text style={st.secondaryBtnText}>🏠 홈으로</Text>
        </TouchableOpacity>
      </View>
    </ResultModal>
  );
}

// ─────────────────────────────────────────────
// 🃏 WordCompleteModal
// ─────────────────────────────────────────────
export function WordCompleteModal({ visible, stats, onRetry, onHome }) {
  if (!stats) return null;
  const { cpm, elapsedSec, words = [], hintCount } = stats;
  const m = Math.floor(elapsedSec / 60), s = elapsedSec % 60;
  const perfect = words.filter(w => w.err === 0 && !w.hintUsed);
  const pct = words.length > 0 ? Math.round((perfect.length / words.length) * 100) : 0;

  return (
    <ResultModal visible={visible}>
      <View style={st.center}>
        <Text style={st.icon}>{pct >= 80 ? "🏆" : pct >= 60 ? "⭐" : "👍"}</Text>
        <Text style={st.title}>단어 카드 완료!</Text>
        <Text style={st.sub}>{words.length}개 단어 연습 완료</Text>
      </View>
      <View style={st.statRow}>
        {[
          { l: "완벽 숙지", v: pct,          u: "%", c: C.correct },
          { l: "분당 타수", v: cpm,          u: "타", c: C.gold },
          { l: "힌트",      v: hintCount||0, u: "회", c: (hintCount||0) === 0 ? C.correct : C.gold },
        ].map((chip, i) => (
          <View key={i} style={st.chip}>
            <Text style={[st.chipVal, { color: chip.c }]}>{chip.v}<Text style={st.chipUnit}>{chip.u}</Text></Text>
            <Text style={st.chipLabel}>{chip.l}</Text>
          </View>
        ))}
      </View>
      <View style={st.btnGroup}>
        <TouchableOpacity style={st.primaryBtn} onPress={onRetry} activeOpacity={0.85}>
          <Text style={st.primaryBtnText}>🔄 다시 연습</Text>
        </TouchableOpacity>
        <TouchableOpacity style={st.secondaryBtn} onPress={onHome} activeOpacity={0.85}>
          <Text style={st.secondaryBtnText}>🏠 홈으로</Text>
        </TouchableOpacity>
      </View>
    </ResultModal>
  );
}

const st = StyleSheet.create({
  center:   { alignItems: "center", marginBottom: 18 },
  icon:     { fontSize: 48, marginBottom: 6 },
  title:    { fontSize: 21, fontWeight: "700", color: C.text, fontFamily: "NotoSansKR-Bold" },
  sub:      { fontSize: 13, color: C.dim, marginTop: 4, fontFamily: "NotoSansKR-Regular" },
  statRow:  { flexDirection: "row", gap: 8, marginBottom: 18 },
  chip:     { flex: 1, backgroundColor: C.surface, borderRadius: 14, padding: 10, alignItems: "center" },
  chipVal:  { fontSize: 20, fontWeight: "800", fontFamily: "NotoSansKR-Bold" },
  chipUnit: { fontSize: 10, fontWeight: "400" },
  chipLabel:{ fontSize: 10, color: C.dim, marginTop: 2, fontFamily: "NotoSansKR-Regular" },
  sentBox:  { backgroundColor: C.surface, borderRadius: 16, padding: 14, marginBottom: 20 },
  sentTitle:{ fontSize: 13, fontWeight: "700", marginBottom: 12, color: C.text },
  sentRow:  { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  sentNum:  { width: 22, height: 22, borderRadius: 99, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  sentNumText: { fontSize: 10, fontWeight: "700" },
  sentTrack:{ height: 7, backgroundColor: C.borderSoft, borderRadius: 99, overflow: "hidden", marginBottom: 3 },
  sentFill: { height: "100%", borderRadius: 99 },
  sentDetail:{ fontSize: 10, color: C.dim, fontFamily: "NotoSansKR-Regular" },
  sentPct:  { fontSize: 11, fontWeight: "700", fontFamily: "NotoSansKR-Bold" },
  btnGroup: { gap: 10 },
  primaryBtn:      { backgroundColor: C.accent, borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  primaryBtnText:  { color: "#fff", fontSize: 15, fontWeight: "700", fontFamily: "NotoSansKR-Bold" },
  secondaryBtn:    { borderWidth: 2, borderColor: C.border, borderRadius: 14, paddingVertical: 14, alignItems: "center", backgroundColor: C.card },
  secondaryBtnText:{ color: C.textMid, fontSize: 14, fontFamily: "NotoSansKR-Medium" },
});
