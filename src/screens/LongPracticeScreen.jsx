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
import { useTaleProgress, useSettings } from "../hooks/useProgress.js";
import { useAdContext } from "../contexts/AdContext.jsx";
import { FOLK_TALES } from "../data/content.js";
import JaDisplay from "../components/JaDisplay.jsx";
import { OptionsBar, ProgressBar, StatsBar } from "../components/Controls.jsx";
import { LongCompleteModal } from "../components/modals/CompleteModals.jsx";

export default function LongPracticeScreen() {
  const nav    = useNavigation();
  const route  = useRoute();
  const tale   = FOLK_TALES.find(t => t.id === route.params?.taleId) ?? FOLK_TALES[0];
  const total  = tale.sentences.length;

  const { settings, update } = useSettings();
  const { noKanji, showFurigana } = settings;
  const { showAd } = useAdContext();

  const [si,         setSi]         = useState(0);
  const [isSucc,     setSucc]       = useState(false);
  const [startTime,  setStart]      = useState(null);
  const [elapsed,    setElap]       = useState(0);
  const [sesOk,      setSesOk]      = useState(0);
  const [sesErr,     setSesErr]     = useState(0);
  const [sentLog,    setSentLog]    = useState([]);
  const [modalStats, setModalStats] = useState(null);

  const inputRef      = useRef(null);
  const timerRef      = useRef(null);
  const startRef      = useRef(null);
  const sentStartRef  = useRef(null);
  const startedRef    = useRef(false);

  const sent   = tale.sentences[si];
  const target = computeTarget(sent.segs, noKanji);

  const { recordCompletion } = useTaleProgress(tale.id, total);

  const handleSuccess = useCallback((typed) => {
    clearInterval(timerRef.current);
    setSucc(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const ok    = typed.split("").filter((c, i) => i < target.length && c === target[i]).length;
    const err   = typed.length - ok;
    const timeMs= sentStartRef.current ? Date.now() - sentStartRef.current : 0;
    const entry = { ja: sent.ja, ko: sent.ko, ok, err, chars: target.length, timeMs };
    const nextOk  = sesOk  + ok;
    const nextErr = sesErr + err;
    setSesOk(nextOk); setSesErr(nextErr);

    setSentLog(prev => {
      const updated = [...prev, entry];
      if (si < total - 1) {
        setTimeout(() => {
          setSi(x => x + 1); setSucc(false);
          sentStartRef.current = Date.now();
          timerRef.current = setInterval(() =>
            setElap(Math.floor((Date.now() - startRef.current) / 1000)), 500);
        }, 700);
      } else {
        const elSec = startRef.current ? Math.floor((Date.now() - startRef.current) / 1000) : 0;
        const elMin = Math.max(elSec / 60, 0.001);
        const cpm   = Math.round(nextOk / elMin);
        const acc   = (nextOk + nextErr) > 0 ? Math.round((nextOk / (nextOk + nextErr)) * 100) : 100;
        setTimeout(async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          await showAd();   // ← 전면광고 (광고 제거 구매 시 자동 스킵)
          setModalStats({ tale, cpm, elapsedSec: elSec, sentences: updated });
          recordCompletion({ cpm, acc, timeSec: elSec });
        }, 400);
      }
      return updated;
    });
  }, [target, si, total, sent, sesOk, sesErr, tale, recordCompletion]);

  const { value, reset, handleChangeText } = useTypingInput({ target, onSuccess: handleSuccess });

  useEffect(() => { reset(); setSucc(false); setTimeout(() => inputRef.current?.focus(), 100); }, [si]);
  useEffect(() => { reset(); }, [noKanji]);

  useEffect(() => {
    if (startTime) {
      startRef.current = startTime;
      sentStartRef.current = startTime;
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
  const errR   = (sesOk + sesErr + value.length) > 0
    ? Math.round(((sesErr + value.length - curOk) / (sesOk + sesErr + value.length)) * 100) : 0;
  const prog   = ((si + Math.min(value.length / Math.max(target.length, 1), 1)) / total) * 100;

  const handleRetry = () => {
    setModalStats(null); setSi(0); setSesOk(0); setSesErr(0); setSentLog([]);
    setStart(null); setElap(0); reset(); setSucc(false);
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
          {/* 헤더 */}
          <View style={s.header}>
            <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()} activeOpacity={0.8}>
              <Text style={s.backBtnText}>← 뒤로</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={s.taleTitle} numberOfLines={1}>
                <Text style={{ fontFamily: "ZenKakuGothicNew-Bold" }}>{tale.title}</Text>
                {"  "}
                <Text style={s.koHint}>({tale.titleKo})</Text>
              </Text>
              <Text style={s.sentCount}>문장 {si + 1} / {total}</Text>
            </View>
          </View>

          <OptionsBar
            noKanji={noKanji}       setNoKanji={v => update({ noKanji: v })}
            showFurigana={showFurigana} setShowFurigana={v => update({ showFurigana: v })}
          />
          <ProgressBar progress={prog} color={C.blue} />
          <StatsBar cpm={cpm} errorRate={errR} elapsedSec={elapsed} />

          {/* 문장 카드 */}
          <View style={[s.sentCard, isSucc && s.sentCardDone]}>
            <View style={s.sentMeta}>
              <View style={s.sentNumBadge}>
                <Text style={s.sentNumText}>{si + 1}번 문장</Text>
              </View>
              <Text style={s.charCount}>{target.length}자</Text>
              {isSucc && <Text style={s.doneText}>✓ 완료!</Text>}
            </View>
            <JaDisplay
              segs={sent.segs}
              value={value}
              showFurigana={showFurigana}
              noKanji={noKanji}
              fontSize={18}
            />
            <View style={s.koBox}>
              <View style={s.koTag}><Text style={s.koTagText}>한국어</Text></View>
              <Text style={s.koText}>{sent.ko}</Text>
            </View>
          </View>

          {/* 입력창 */}
          <View style={[s.inputBox, isSucc && s.inputBoxDone]}>
            <TextInput
              ref={inputRef}
              style={s.input}
              value={value}
              onChangeText={onChangeText}
              onKeyPress={handleKeyPress}
              placeholder="위 문장을 한 글자씩 입력하세요..."
              placeholderTextColor={C.dimSoft}
              editable={!isSucc}
              multiline
              autoComplete="off"
              autoCorrect={false}
              autoCapitalize="none"
              spellCheck={false}
              inputMode="text"
              keyboardType="default"
            />
          </View>

          <Text style={[s.hint, isSucc && { color: C.correct }]}>
            {isSucc
              ? si < total - 1 ? "✓ 다음 문장으로..." : "✓ 완료! 결과 확인 중..."
              : "오타가 있어도 끝까지 입력하면 자동으로 넘어가요 ✨"}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <LongCompleteModal
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
  header:    { flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 18, paddingBottom: 10 },
  backBtn:   { backgroundColor: C.card, borderWidth: 2, borderColor: C.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, ...shadow(1) },
  backBtnText:{ fontSize: 13, color: C.dim, fontFamily: "NotoSansKR-Medium" },
  taleTitle: { fontSize: 14, fontWeight: "700", color: C.blue, fontFamily: "NotoSansKR-Bold" },
  koHint:    { fontSize: 12, color: C.dim, fontFamily: "NotoSansKR-Regular" },
  sentCount: { fontSize: 11, color: C.dim, fontFamily: "NotoSansKR-Regular" },
  sentCard:   { backgroundColor: C.card, borderWidth: 2.5, borderColor: C.border, borderRadius: 20, marginBottom: 14, ...shadow(1) },
  sentCardDone:{ backgroundColor: "#EDF7F2", borderColor: C.correct },
  sentMeta:   { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 18, paddingTop: 14 },
  sentNumBadge:{ backgroundColor: C.blueDim, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 3 },
  sentNumText: { fontSize: 11, fontWeight: "700", color: C.blue, fontFamily: "NotoSansKR-Bold" },
  charCount:   { fontSize: 10, color: C.dim, fontFamily: "NotoSansKR-Regular" },
  doneText:    { marginLeft: "auto", fontSize: 12, fontWeight: "700", color: C.correct, fontFamily: "NotoSansKR-Bold" },
  koBox:  { flexDirection: "row", alignItems: "flex-start", gap: 8, paddingHorizontal: 18, paddingBottom: 16, paddingTop: 12, borderTopWidth: 1.5, borderTopColor: C.borderSoft, borderStyle: "dashed" },
  koTag:  { backgroundColor: C.goldDim, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 },
  koTagText:{ fontSize: 10, fontWeight: "700", color: C.gold, fontFamily: "NotoSansKR-Bold" },
  koText: { flex: 1, fontSize: 13, color: C.dim, lineHeight: 20, fontFamily: "NotoSansKR-Regular" },
  inputBox:   { backgroundColor: C.card, borderWidth: 2, borderColor: C.border, borderRadius: 16, padding: 4, marginBottom: 10, ...shadow(1) },
  inputBoxDone:{ borderColor: C.correct },
  input: {
    fontFamily: "ZenKakuGothicNew-Regular",
    fontSize: 18,
    letterSpacing: 1,
    color: C.text,
    padding: 14,
    minHeight: 70,
    lineHeight: 28,
  },
  hint: { fontSize: 12, color: C.dim, textAlign: "center", fontFamily: "NotoSansKR-Regular" },
});
