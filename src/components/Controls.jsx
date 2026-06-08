import { View, Text, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { useRef, useEffect } from "react";
import { C } from "../styles/colors.js";
import { shadow } from "../styles/theme.js";

// ─────────────────────────────────────────────
// 🎛️ MiniToggle
// ─────────────────────────────────────────────
export function MiniToggle({ label, value, onChange, activeColor }) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const trackColor = anim.interpolate({ inputRange: [0, 1], outputRange: [C.border, activeColor] });
  const thumbLeft  = anim.interpolate({ inputRange: [0, 1], outputRange: [2, 14] });

  return (
    <TouchableOpacity
      onPress={() => onChange(!value)}
      activeOpacity={0.82}
      style={[s.toggle, { borderColor: value ? activeColor : C.border, backgroundColor: value ? `${activeColor}10` : C.card }]}
    >
      {/* 트랙 */}
      <View style={s.trackWrap}>
        <Animated.View style={[s.track, { backgroundColor: trackColor }]}>
          <Animated.View style={[s.thumb, { left: thumbLeft }]} />
        </Animated.View>
      </View>
      <Text style={[s.toggleLabel, { color: value ? activeColor : C.dim }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────
// ⚙️ OptionsBar
// ─────────────────────────────────────────────
export function OptionsBar({ noKanji, setNoKanji, showFurigana, setShowFurigana }) {
  return (
    <View style={s.optionsBar}>
      <MiniToggle label="ひらがなのみ" value={noKanji}      onChange={setNoKanji}      activeColor={C.green} />
      <MiniToggle label="振仮名"       value={showFurigana} onChange={setShowFurigana} activeColor={C.gold}  />
    </View>
  );
}

// ─────────────────────────────────────────────
// 📊 ProgressBar
// ─────────────────────────────────────────────
export function ProgressBar({ progress, color }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: Math.min(progress / 100, 1),
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const accent = color ?? C.accent;

  return (
    <View style={s.progressTrack}>
      <Animated.View
        style={[
          s.progressFill,
          {
            flex: anim,
            backgroundColor: accent,
          },
        ]}
      />
    </View>
  );
}

// ─────────────────────────────────────────────
// 📈 StatsBar
// ─────────────────────────────────────────────
export function StatsBar({ cpm, errorRate, elapsedSec }) {
  const m  = Math.floor(elapsedSec / 60);
  const s2 = elapsedSec % 60;
  const ec = errorRate === 0 ? C.correct : errorRate < 10 ? C.gold : C.wrong;

  const chips = [
    { l: "타수/분", v: cpm,                                           u: "타", c: C.gold },
    { l: "오타율",  v: errorRate,                                      u: "%",  c: ec    },
    { l: "경과",    v: `${m}:${String(s2).padStart(2, "0")}`,         u: "",   c: C.dim  },
  ];

  return (
    <View style={s.statsBar}>
      {chips.map((chip, i) => (
        <View key={i} style={s.chip}>
          <Text style={[s.chipValue, { color: chip.c }]}>
            {chip.v}<Text style={s.chipUnit}>{chip.u}</Text>
          </Text>
          <Text style={s.chipLabel}>{chip.l}</Text>
        </View>
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────
const s = StyleSheet.create({
  // toggle
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 2,
  },
  trackWrap: { width: 32, height: 18 },
  track: {
    width: 32, height: 18, borderRadius: 9,
    position: "relative",
  },
  thumb: {
    position: "absolute",
    top: 2, width: 14, height: 14,
    borderRadius: 7, backgroundColor: "#fff",
    ...shadow(1),
  },
  toggleLabel: { fontSize: 12, fontWeight: "700", fontFamily: "NotoSansKR-Medium" },
  // optionsBar
  optionsBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  // progressBar
  progressTrack: {
    height: 6,
    backgroundColor: C.borderSoft,
    borderRadius: 99,
    marginBottom: 14,
    flexDirection: "row",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 99,
  },
  // statsBar
  statsBar: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    flex: 1,
    backgroundColor: C.card,
    borderWidth: 2,
    borderColor: C.border,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    ...shadow(1),
  },
  chipValue: {
    fontSize: 21, fontWeight: "800", lineHeight: 25,
    fontFamily: "NotoSansKR-Bold",
  },
  chipUnit:  { fontSize: 10, fontWeight: "400" },
  chipLabel: { fontSize: 10, color: C.dim, marginTop: 3, fontFamily: "NotoSansKR-Regular" },
});
