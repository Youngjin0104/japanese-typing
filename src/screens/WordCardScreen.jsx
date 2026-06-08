import { useState, useRef, useCallback, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, ScrollView, Platform, StyleSheet, Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { C } from "../styles/colors.js";
import { shadow } from "../styles/theme.js";
import { useTypingInput } from "../hooks/useTypingInput.js";
import { useWordProgress, useSettings } from "../hooks/useProgress.js";
import { useAdContext } from "../contexts/AdContext.jsx";
import { WORDS } from "../data/content.js";
import { ProgressBar, StatsBar } from "../components/Controls.jsx";
import { WordCompleteModal } from "../components/modals/CompleteModals.jsx";

export default function WordCardScreen() {
  const nav = useNavigation();
  const { settings } = useSettings();
  const { noKanji } = settings;
  const { showAd } = useAdContext();

  const [idx,        setIdx]      = useState(0);
  const [revealed,   setRevd]     = useState(false);
  const [isSucc,     setSucc]     = useState(false);
  const [startTime,  setStart]    = useState(null);
  const [elapsed,    setElap]     = useState(0);
  const [sesOk,      setSesOk]    = useState(0);
  const [wordLog,    setWordLog]  = useState([]);
  const [hintCnt,    setHint]     = useState(0);
  const [cardHint,   setCardH]    = useState(false);
  const [modalStats, setModal]    = useState(null);

  const inputRef    = useRef(null);
  const timerRef    = useRef(null);
  const startRef    = useRef(null);
  const sentStartRef= useRef(null);
  const startedRef  = useRef(false);
  const cardAnim    = useRef(new Animated.Value(1)).current;

  const word   = WORDS[idx];
  const target = word.reading;

  const { markMastered } = useWordProgress();

  const handleSuccess = useCallback((typed) => {
    clearInterval(timerRef.current);
    setSucc(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const ok  = typed.split("").filter((c, i) => i < target.length && c === target[i]).length;
    const err = typed.length - ok;
    if (err === 0 && !cardHint) markMastered(word.id);

    const entry = { word: word.word, reading: word.reading, meaning: word.meaning, level: word.level, ok, err, hintUsed: cardHint };
    const nextOk = sesOk + ok;
    setSesOk(nextOk);

    setWordLog(prev => {
      const updated = [...prev, entry];
      setTimeout(() => {
        if (idx < WORDS.length - 1) {
          // 카드 플립 애니메이션
          Animated.sequence([
            Animated.timing(cardAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
            Animated.timing(cardAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
          ]).start(() => {
            setIdx(i => i + 1); setSucc(false); reset();
            setRevd(false); setCardH(false);
            sentStartRef.current = Date.now();
            timerRef.current = setInterval(() =>
              setElap(Math.floor((Date.now() - startRef.current) / 1000)), 500);
          });
        } else {
          const elSec = startRef.current ? Math.floor((Date.now() - startRef.current) / 1000) : 0;
          const elMin = Math.max(elSec / 60, 0.001);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          const elSec2 = startRef.current ? Math.floor((Date.now() - startRef.current) / 1000) : 0;
          const elMin2 = Math.max(elSec2 / 60, 0.001);
          await showAd();   // ← 전면광고
          setModal({ cpm: Math.round(nextOk / elMin2), elapsedSec: elSec2, words: updated, hintCount: hintCnt });
        }
      }, 900);
      return updated;
    });
  }, [target, idx, word, sesOk, hintCnt, cardHint, markMastered]);

  const { value, reset, handleChangeText } = useTypingInput({ target, onSuccess: handleSuccess });

  useEffect(() => {
    reset(); setSucc(false); setRevd(false); setCardH(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [idx]);

  useEffect(() => {
    if (startTime) {
      startRef.current = startTime; sentStartRef.current = startTime;
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

  const curOk  = value.split("").filter((c, i) => i < target.length && c === target[i]).length;
  const elMin  = Math.max(elapsed / 60, 0.001);
  const cpm    = Math.round((sesOk + curOk) / elMin);
  const errR   = value.length > 0 ? Math.round(((value.length - curOk) / value.length) * 100) : 0;
  const prog   = ((idx + Math.min(value.length / Math.max(target.length, 1), 1)) / WORDS.length) * 100;

  const handleRetry = () => {
    setModal(null); setIdx(0); setSesOk(0); setWordLog([]); setHint(0);
    setStart(null); setElap(0); reset(); setSucc(false); setRevd(false); setCardH(false);
    startedRef.current = false;
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
            <View>
              <Text style={s.screenTitle}>단어 카드 🃏</Text>
              <Text style={s.progress}>{idx + 1} / {WORDS.length}</Text>
            </View>
          </View>

          <ProgressBar progress={prog} color={C.gold} />
          <StatsBar cpm={cpm} errorRate={errR} elapsedSec={elapsed} />

          {/* 카드 */}
          <Animated.View style={[s.card, isSucc && s.cardDone, { opacity: cardAnim }]}>
            <View style={s.cardTopRow}>
              <View style={[s.lvBadge, { backgroundColor: C.goldDim }]}>
                <Text style={s.lvText}>JLPT {word.level}</Text>
              </View>
              {hintCnt > 0 && !isSucc && (
                <View style={s.hintBadge}>
                  <Text style={s.hintText}>힌트 {hintCnt}회</Text>
                </View>
              )}
            </View>

            {/* 후리가나 힌트 */}
            <View style={s.rubyRow}>
              {revealed && !isSucc
                ? <Text style={s.rubyText}>{target}</Text>
                : !isSucc && (
                  <TouchableOpacity onPress={() => { setRevd(true); setHint(h => h + 1); setCardH(true); }} activeOpacity={0.8} style={s.hintBtn}>
                    <Text style={s.hintBtnText}>👆 탭하면 후리가나 확인</Text>
                  </TouchableOpacity>
                )
              }
            </View>

            {/* 한자 */}
            <Text style={[s.kanjiText, isSucc && { color: C.correct }]}>
              {noKanji ? target : word.word}
            </Text>
            <Text style={s.meaningText}>{word.meaning}</Text>
            {isSucc && <Text style={s.doneText}>✓ 정확합니다!</Text>}
          </Animated.View>

          {/* 입력 미리보기 */}
          <View style={[s.previewBox, { borderBottomColor: isSucc ? C.correct : C.border }]}>
            {value.length === 0
              ? <Text style={s.previewPlaceholder}>읽기(히라가나)를 입력하세요</Text>
              : <Text style={s.previewText}>
                  {target.split("").map((c, i) => {
                    const ok  = i < value.length && value[i] === c;
                    const bad = i < value.length && value[i] !== c;
                    const cur = i === value.length;
                    return <Text key={i} style={{ color: ok ? C.correct : bad ? C.wrong : cur ? C.cursor : C.dimSoft }}>{c}</Text>;
                  })}
                </Text>
            }
          </View>

          {/* 입력창 */}
          <View style={[s.inputBox, isSucc && s.inputBoxDone]}>
            <TextInput
              ref={inputRef}
              style={s.input}
              value={value}
              onChangeText={onChangeText}
              onKeyPress={handleKeyPress}
              placeholder="히라가나로 읽기를 입력..."
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
            {isSucc ? "✓ 다음 카드로 이동 중..." : "일본어 키보드로 히라가나 읽기를 입력하세요 ✨"}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <WordCompleteModal
        visible={!!modalStats}
        stats={modalStats}
        onRetry={handleRetry}
        onHome={() => nav.navigate("Home")}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 48 },
  header:    { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 18, paddingBottom: 14 },
  backBtn:   { backgroundColor: C.card, borderWidth: 2, borderColor: C.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, ...shadow(1) },
  backBtnText:{ fontSize: 13, color: C.dim, fontFamily: "NotoSansKR-Medium" },
  screenTitle:{ fontSize: 15, fontWeight: "700", color: C.text, fontFamily: "NotoSansKR-Bold" },
  progress:   { fontSize: 11, color: C.dim, fontFamily: "NotoSansKR-Regular" },
  card:       { backgroundColor: C.card, borderWidth: 2.5, borderColor: C.border, borderRadius: 24, padding: 24, alignItems: "center", minHeight: 240, marginBottom: 16, ...shadow(2) },
  cardDone:   { backgroundColor: "#EDF7F2", borderColor: C.correct },
  cardTopRow: { flexDirection: "row", alignSelf: "stretch", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  lvBadge:    { paddingHorizontal: 11, paddingVertical: 3, borderRadius: 99 },
  lvText:     { fontSize: 10, fontWeight: "700", color: C.gold, fontFamily: "NotoSansKR-Bold" },
  hintBadge:  { backgroundColor: C.surface, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99 },
  hintText:   { fontSize: 10, color: C.dim, fontFamily: "NotoSansKR-Regular" },
  rubyRow:    { height: 32, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  rubyText:   { fontFamily: "ZenKakuGothicNew-Regular", fontSize: 18, color: C.gold, letterSpacing: 5 },
  hintBtn:    { flexDirection: "row", alignItems: "center" },
  hintBtnText:{ fontSize: 12, color: C.dimSoft, fontFamily: "NotoSansKR-Regular" },
  kanjiText:  { fontFamily: "ZenKakuGothicNew-Black", fontSize: 52, fontWeight: "700", lineHeight: 62, color: C.text, letterSpacing: 4, marginBottom: 12 },
  meaningText:{ fontSize: 15, color: C.dim, marginBottom: 8, fontFamily: "NotoSansKR-Regular" },
  doneText:   { fontSize: 14, fontWeight: "700", color: C.correct, fontFamily: "NotoSansKR-Bold" },
  previewBox: { borderBottomWidth: 2.5, borderBottomColor: C.border, paddingVertical: 10, alignItems: "center", marginBottom: 12 },
  previewPlaceholder:{ fontSize: 13, color: C.dimSoft, fontFamily: "NotoSansKR-Regular" },
  previewText:{ fontFamily: "ZenKakuGothicNew-Regular", fontSize: 26, letterSpacing: 5 },
  inputBox:     { backgroundColor: C.card, borderWidth: 2, borderColor: C.border, borderRadius: 16, padding: 4, marginBottom: 10, ...shadow(1) },
  inputBoxDone: { borderColor: C.correct },
  input: { fontFamily: "ZenKakuGothicNew-Regular", fontSize: 18, letterSpacing: 1, color: C.text, padding: 14, minHeight: 70, lineHeight: 28 },
  hint: { fontSize: 12, color: C.dim, textAlign: "center", fontFamily: "NotoSansKR-Regular" },
});
