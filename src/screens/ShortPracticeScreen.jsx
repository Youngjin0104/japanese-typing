import { useState, useRef, useCallback, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, ScrollView, Platform, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { C } from "../styles/colors.js";
import { shadow } from "../styles/theme.js";
import { computeTarget } from "../utils/japanese.js";
import { useTypingInput } from "../hooks/useTypingInput.js";
import { useShortProgress, useSettings } from "../hooks/useProgress.js";
import { useAdContext } from "../contexts/AdContext.jsx";
import { SHORT_TEXTS } from "../data/content.js";
import JaDisplay from "../components/JaDisplay.jsx";
import { OptionsBar, ProgressBar, StatsBar } from "../components/Controls.jsx";
import ShortSentenceModal from "../components/modals/ShortSentenceModal.jsx";

export default function ShortPracticeScreen() {
  const nav    = useNavigation();
  const route  = useRoute();
  const catKey = route.params?.catKey ?? "proverbs";
  const cat    = SHORT_TEXTS[catKey];
  const items  = cat.items;

  const { settings, update } = useSettings();
  const { noKanji, showFurigana } = settings;
  const { showAd } = useAdContext();

  const [idx,       setIdx]      = useState(0);
  const [isSucc,    setSucc]     = useState(false);
  const [startTime, setStart]    = useState(null);
  const [elapsed,   setElap]     = useState(0);
  const [modalData, setModalData]= useState(null);

  const inputRef     = useRef(null);
  const timerRef     = useRef(null);
  const startRef     = useRef(null);
  const startedRef   = useRef(false);

  const item   = items[idx];
  const segs   = item.segs ?? [{ t: item.text }];
  const target = computeTarget(segs, noKanji);

  const { recordCompletion } = useShortProgress(catKey, items.length);

  const handleSuccess = useCallback((typed) => {
    clearInterval(timerRef.current);
    setSucc(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const ok    = typed.split("").filter((c, i) => i < target.length && c === target[i]).length;
    const err   = typed.length - ok;
    const elSec = startRef.current ? Math.floor((Date.now() - startRef.current) / 1000) : 0;
    const elMin = Math.max(elSec / 60, 0.001);
    const cpm   = Math.round(ok / elMin);

    if (idx === items.length - 1) {
      recordCompletion({ cpm, acc: typed.length > 0 ? Math.round((ok / typed.length) * 100) : 100, timeSec: elSec });
      // 카테고리 마지막 문장 완료 → 전면광고
      setTimeout(async () => {
        await showAd();
        setModalData({ item, typed, ok, err, cpm, elapsedSec: elSec, catColor: cat.color });
      }, 350);
    } else {
      setTimeout(() => setModalData({ item, typed, ok, err, cpm, elapsedSec: elSec, catColor: cat.color }), 350);
    }
  }, [target, item, items, idx, cat, recordCompletion]);

  const { value, reset, handleChangeText } = useTypingInput({ target, onSuccess: handleSuccess });

  useEffect(() => {
    startedRef.current = false;
    reset(); setSucc(false); setStart(null); setElap(0);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [idx]);
  useEffect(() => { reset(); }, [noKanji]);

  useEffect(() => {
    if (startTime) {
      startRef.current = startTime;
      timerRef.current = setInterval(() =>
        setElap(Math.floor((Date.now() - startRef.current) / 1000)), 500);
    }
    return () => clearInterval(timerRef.current);
  }, [startTime]);

  const handleKeyPress = useCallback(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      setStart(Date.now());
    }
  }, []);

  const onChangeText = (text) => {
    if (!startedRef.current && text.length > 0) {
      startedRef.current = true;
      setStart(Date.now());
    }
    handleChangeText(text);
  };

  const curOk = value.split("").filter((c, i) => i < target.length && c === target[i]).length;
  const elMin = Math.max(elapsed / 60, 0.001);
  const cpm   = Math.round(curOk / elMin);
  const errR  = value.length > 0 ? Math.round(((value.length - curOk) / value.length) * 100) : 0;

  const handleNext = () => {
    setModalData(null);
    if (idx < items.length - 1) setIdx(i => i + 1);
    else nav.goBack();
  };
  const handleRetry = () => {
    setModalData(null); reset(); setSucc(false); setStart(null); setElap(0);
    startedRef.current = false;
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.header}>
            <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()} activeOpacity={0.8}>
              <Text style={s.backBtnText}>← 뒤로</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={[s.catLabel, { color: cat.color }]} numberOfLines={1}>{cat.label}</Text>
              <Text style={s.progress}>{idx + 1} / {items.length}</Text>
            </View>
          </View>

          <OptionsBar
            noKanji={noKanji}       setNoKanji={v => update({ noKanji: v })}
            showFurigana={showFurigana} setShowFurigana={v => update({ showFurigana: v })}
          />
          <ProgressBar progress={(idx / items.length) * 100} color={cat.color} />
          <StatsBar cpm={cpm} errorRate={errR} elapsedSec={elapsed} />

          {/* 의미 */}
          <View style={s.meaningBox}>
            <View style={[s.meaningTag, { backgroundColor: `${cat.color}14` }]}>
              <Text style={[s.meaningTagText, { color: cat.color }]}>의미</Text>
            </View>
            <Text style={s.meaningText}>{item.meaning}</Text>
          </View>

          {/* 문장 */}
          <View style={[s.sentCard, isSucc && s.sentCardDone]}>
            <JaDisplay
              segs={segs}
              value={value}
              showFurigana={showFurigana}
              noKanji={noKanji}
              fontSize={20}
            />
          </View>

          {/* 입력창 */}
          <View style={[s.inputBox, isSucc && s.inputBoxDone]}>
            <TextInput
              ref={inputRef}
              style={s.input}
              value={value}
              onChangeText={onChangeText}
              onKeyPress={handleKeyPress}
              placeholder="여기에 일본어를 입력하세요..."
              placeholderTextColor={C.dimSoft}
              editable={!isSucc}
              multiline
              autoComplete="off"
              autoCorrect={false}
              autoCapitalize="none"
              spellCheck={false}
              inputMode="text"
            />
          </View>
          <Text style={[s.hint, isSucc && { color: C.correct }]}>
            {isSucc ? "✓ 결과 확인 중..." : "오타가 있어도 끝까지 입력하면 자동으로 완료돼요 ✨"}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <ShortSentenceModal
        visible={!!modalData}
        result={modalData}
        onNext={handleNext}
        onRetry={handleRetry}
        isLast={idx >= items.length - 1}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 48 },
  header:   { flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 18, paddingBottom: 10 },
  backBtn:  { backgroundColor: C.card, borderWidth: 2, borderColor: C.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, ...shadow(1) },
  backBtnText:{ fontSize: 13, color: C.dim, fontFamily: "NotoSansKR-Medium" },
  catLabel: { fontSize: 14, fontWeight: "700", fontFamily: "NotoSansKR-Bold" },
  progress: { fontSize: 11, color: C.dim, fontFamily: "NotoSansKR-Regular" },
  meaningBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: C.card, borderWidth: 2, borderColor: C.border, borderRadius: 14, padding: 12, marginBottom: 12, ...shadow(1) },
  meaningTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
  meaningTagText:{ fontSize: 10, fontWeight: "700", fontFamily: "NotoSansKR-Bold" },
  meaningText:   { flex: 1, fontSize: 13, color: C.dim, lineHeight: 20, fontFamily: "NotoSansKR-Regular" },
  sentCard:     { backgroundColor: C.card, borderWidth: 2.5, borderColor: C.border, borderRadius: 16, marginBottom: 12, minHeight: 80, justifyContent: "center", ...shadow(1) },
  sentCardDone: { backgroundColor: "#EDF7F2", borderColor: C.correct },
  inputBox:     { backgroundColor: C.card, borderWidth: 2, borderColor: C.border, borderRadius: 16, padding: 4, marginBottom: 10, ...shadow(1) },
  inputBoxDone: { borderColor: C.correct },
  input: {
    fontFamily: "ZenKakuGothicNew-Regular",
    fontSize: 18, letterSpacing: 1,
    color: C.text, padding: 14,
    minHeight: 70, lineHeight: 28,
  },
  hint: { fontSize: 12, color: C.dim, textAlign: "center", fontFamily: "NotoSansKR-Regular" },
});
