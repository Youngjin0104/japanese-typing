import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────
// 💾 AsyncStorage 기반 학습 진도 훅
//
// 키 구조:
//   jta:tale:{id}        → { completedSentences, bestCpm, bestAcc, lastAt }
//   jta:short:{catKey}   → { completedCount, bestCpm, bestAcc, lastAt }
//   jta:word:mastered    → number[]
//   jta:streak           → { count, lastDate }
//   jta:settings         → { noKanji, showFurigana }
//   jta:stats            → { totalSessions, totalChars, totalTimeSec }
// ─────────────────────────────────────────────

const P = "jta:";

async function lsGet(key, fallback = null) {
  try {
    const raw = await AsyncStorage.getItem(P + key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

async function lsSet(key, value) {
  try { await AsyncStorage.setItem(P + key, JSON.stringify(value)); }
  catch (e) { console.warn("[progress] 저장 실패:", key, e); }
}

async function lsDel(key) {
  try { await AsyncStorage.removeItem(P + key); } catch {}
}

async function bumpStreak() {
  const today     = new Date().toISOString().slice(0, 10);
  const prev      = await lsGet("streak", { count: 0, lastDate: null });
  if (prev.lastDate === today) return;
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  await lsSet("streak", {
    count:    prev.lastDate === yesterday ? prev.count + 1 : 1,
    lastDate: today,
  });
}

// ════════════════════════════════════════════
// 📖  장문 (전래동화) 진도
// ════════════════════════════════════════════
export function useTaleProgress(taleId, totalSentences) {
  const key      = `tale:${taleId}`;
  const fallback = { completedSentences: 0, bestCpm: 0, bestAcc: 0, lastAt: null };
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    lsGet(key, fallback).then(d => { setData(d); setLoading(false); });
  }, [key]);

  const recordCompletion = useCallback(async ({ cpm, acc, timeSec = 0 }) => {
    const prev = await lsGet(key, fallback);
    const next = {
      completedSentences: totalSentences,
      bestCpm:  Math.max(prev.bestCpm, cpm),
      bestAcc:  Math.max(prev.bestAcc, acc),
      lastAt:   new Date().toISOString(),
    };
    await lsSet(key, next);
    setData(next);
    await bumpStreak();
  }, [key, totalSentences]);

  const reset = useCallback(async () => {
    await lsDel(key);
    setData(fallback);
  }, [key]);

  return {
    loading,
    data,
    isCompleted: (data?.completedSentences ?? 0) >= totalSentences,
    recordCompletion,
    reset,
  };
}

// ════════════════════════════════════════════
// 💬  단문 카테고리 진도
// ════════════════════════════════════════════
export function useShortProgress(catKey, total) {
  const key      = `short:${catKey}`;
  const fallback = { completedCount: 0, bestCpm: 0, bestAcc: 0, lastAt: null };
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    lsGet(key, fallback).then(d => { setData(d); setLoading(false); });
  }, [key]);

  const recordCompletion = useCallback(async ({ cpm, acc, timeSec = 0 }) => {
    const prev = await lsGet(key, fallback);
    const next = {
      completedCount: total,
      bestCpm:  Math.max(prev.bestCpm, cpm),
      bestAcc:  Math.max(prev.bestAcc, acc),
      lastAt:   new Date().toISOString(),
    };
    await lsSet(key, next);
    setData(next);
    await bumpStreak();
  }, [key, total]);

  const reset = useCallback(async () => {
    await lsDel(key);
    setData(fallback);
  }, [key]);

  const pct = total > 0 ? Math.round(((data?.completedCount ?? 0) / total) * 100) : 0;

  return { loading, data, pct, isCompleted: pct >= 100, recordCompletion, reset };
}

// ════════════════════════════════════════════
// 🃏  단어 숙지 진도
// ════════════════════════════════════════════
export function useWordProgress() {
  const key = "word:mastered";
  const [masteredIds, setMasteredIds] = useState([]);

  useEffect(() => {
    lsGet(key, []).then(setMasteredIds);
  }, []);

  const markMastered = useCallback(async (wordId) => {
    setMasteredIds(prev => {
      if (prev.includes(wordId)) return prev;
      const next = [...prev, wordId];
      lsSet(key, next);
      return next;
    });
  }, []);

  const resetAll = useCallback(async () => {
    await lsDel(key);
    setMasteredIds([]);
  }, []);

  const isMastered = useCallback((wordId) => masteredIds.includes(wordId), [masteredIds]);

  return { masteredIds, isMastered, markMastered, resetAll };
}

// ════════════════════════════════════════════
// ⚙️  설정 (히라가나 모드·후리가나)
// ════════════════════════════════════════════
export function useSettings() {
  const key      = "settings";
  const fallback = { noKanji: true, showFurigana: false };
  const [settings, setSettings] = useState(fallback);

  useEffect(() => {
    lsGet(key, fallback).then(setSettings);
  }, []);

  const update = useCallback((patch) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      lsSet(key, next);
      return next;
    });
  }, []);

  return { settings, update };
}

// ════════════════════════════════════════════
// 🔥  스트릭 / 📊 통계 (읽기 전용)
// ════════════════════════════════════════════
export function useStreak() {
  const [streak, setStreak] = useState({ count: 0, lastDate: null });
  useEffect(() => { lsGet("streak", { count: 0, lastDate: null }).then(setStreak); }, []);
  return streak;
}

export function useLifetimeStats() {
  const [stats, setStats] = useState({ totalSessions: 0, totalChars: 0, totalTimeSec: 0 });
  useEffect(() => {
    lsGet("stats", { totalSessions: 0, totalChars: 0, totalTimeSec: 0 }).then(setStats);
  }, []);
  return stats;
}

export async function resetAllProgress() {
  const keys = await AsyncStorage.getAllKeys();
  const jtaKeys = keys.filter(k => k.startsWith(P));
  await AsyncStorage.multiRemove(jtaKeys);
}
