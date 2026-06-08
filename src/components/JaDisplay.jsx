import { View, Text, StyleSheet } from "react-native";
import { C } from "../styles/colors.js";

// ─────────────────────────────────────────────
// 🔤 JaDisplay — RN 일본어 커서·정오 색상 렌더러
//   showFurigana ON → 한자 위에 작은 Text(루비)
// ─────────────────────────────────────────────
export default function JaDisplay({
  segs,
  value = "",
  showFurigana,
  noKanji,
  fontSize = 19,
}) {
  let ci = 0;

  const elements = segs.map((seg, si) => {
    const display  = (noKanji && seg.r) ? seg.r : seg.t;
    const showRuby = showFurigana && seg.r && !noKanji;

    // 각 문자에 색상 적용
    const coloredChars = display.split("").map((c, j) => {
      const ai  = ci + j;
      const ok  = ai < value.length && value[ai] === c;
      const bad = ai < value.length && value[ai] !== c;
      const cur = ai === value.length;

      return (
        <Text
          key={j}
          style={[
            s.char,
            { fontSize },
            ok  && s.correct,
            bad && s.wrong,
            cur && s.cursor,
            !ok && !bad && !cur && s.dim,
          ]}
        >
          {c}
        </Text>
      );
    });
    ci += display.length;

    if (showRuby) {
      return (
        // 후리가나: 위(루비) + 아래(한자) 세로 정렬
        <View key={si} style={s.rubyGroup}>
          <Text style={s.ruby} numberOfLines={1}>{seg.r}</Text>
          <Text style={{ fontSize }}>{coloredChars}</Text>
        </View>
      );
    }

    return (
      <Text key={si} style={{ fontSize, lineHeight: fontSize * 1.9, fontFamily: "ZenKakuGothicNew-Regular" }}>
        {coloredChars}
      </Text>
    );
  });

  const lineH = showFurigana && !noKanji ? fontSize * 2.6 : fontSize * 1.9;

  return (
    <View style={[s.container, { minHeight: lineH + 24 }]}>
      <Text style={{ fontFamily: "ZenKakuGothicNew-Regular", letterSpacing: 0.5 }}>
        {/* flexWrap 처리: Text 안에 View를 섞을 수 없으므로
            후리가나 없을 때만 Text wrapping, 있을 때는 Row wrap */}
        {!showFurigana || noKanji
          ? elements
          : null}
      </Text>
      {(showFurigana && !noKanji) && (
        <View style={s.rubyRow}>
          {elements}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  // 후리가나 가로 배열
  rubyRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-end",
  },
  rubyGroup: {
    alignItems: "center",
    marginBottom: 4,
  },
  ruby: {
    fontFamily: "ZenKakuGothicNew-Regular",
    fontSize: 9,
    color: C.gold,
    lineHeight: 12,
    textAlign: "center",
  },
  char: {
    fontFamily: "ZenKakuGothicNew-Regular",
  },
  correct: { color: C.correct },
  wrong:   { color: C.wrong, backgroundColor: C.wrongDim },
  cursor:  { color: C.cursor, backgroundColor: "rgba(184,120,24,.13)" },
  dim:     { color: C.dimSoft },
});
