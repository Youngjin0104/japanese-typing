export function computeTarget(segs, noKanji) {
  return segs.map(s => (noKanji && s.r) ? s.r : s.t).join("");
}
