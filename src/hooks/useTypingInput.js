import { useState, useRef, useCallback } from "react";

// ─────────────────────────────────────────────
// ⌨️  RN TextInput IME 입력 훅
//
// 웹 버전과 달리 React Native 에서는 OS 가 IME 조합을
// 완전히 처리하므로 compositionstart/end 불필요.
// onChangeText 로 수신한 텍스트를 그대로 비교.
//
// 일본어 필터링:
//   히라가나 / 가타카나 / 한자 / 전각문자 / 구두점만 허용
// ─────────────────────────────────────────────

function isKanji(ch) {
  const cp = ch?.codePointAt(0);
  return cp !== undefined && ((cp >= 0x4E00 && cp <= 0x9FFF) || (cp >= 0x3400 && cp <= 0x4DBF));
}

function filterJapanese(str) {
  return [...(str ?? "")].filter(ch => {
    const cp = ch.codePointAt(0);
    return (
      (cp >= 0x3040 && cp <= 0x309F) ||   // 히라가나
      (cp >= 0x30A0 && cp <= 0x30FF) ||   // 가타카나
      (cp >= 0x4E00 && cp <= 0x9FFF) ||   // 한자 CJK
      (cp >= 0x3400 && cp <= 0x4DBF) ||   // 한자 확장 A
      (cp >= 0x3000 && cp <= 0x303F) ||   // 구두점(。、「」…)
      (cp >= 0xFF00 && cp <= 0xFFEF) ||   // 전각 문자
      cp === 0x30FC ||                     // ー 장음
      cp === 0x3099 || cp === 0x309A      // 탁점·반탁점
    );
  }).join("");
}

/**
 * @param {{ target: string, onSuccess: (typed: string) => void }} opts
 */
export function useTypingInput({ target, onSuccess }) {
  const [value,    setValue]  = useState("");
  const firedRef  = useRef(false);

  const reset = useCallback(() => {
    setValue("");
    firedRef.current = false;
  }, []);

  /** TextInput onChangeText 핸들러 */
  const handleChangeText = useCallback((text) => {
    const filtered = filterJapanese(text);
    const clamped  = filtered.slice(0, target.length + 3);
    setValue(clamped);

    if (filtered.length >= target.length && !firedRef.current) {
      const typed = filtered.slice(0, target.length);
      const lastT = target[target.length - 1];
      const lastV = typed[target.length - 1];
      // 마지막 글자가 한자인데 IME 조합 중(히라가나)이면 확정까지 대기
      if (isKanji(lastT) && !isKanji(lastV)) return;
      firedRef.current = true;
      onSuccess(typed);
    }
  }, [target, onSuccess]);

  return { value, reset, handleChangeText };
}

export { filterJapanese };
