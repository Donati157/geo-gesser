// Recorde do modo solo, salvo localmente no aparelho.
const KEY = "gg_solo_record";

export interface Record {
  score: number;
  streak: number;
}

export function loadRecord(): Record {
  try {
    const r = JSON.parse(localStorage.getItem(KEY) || "null");
    if (r && typeof r.score === "number") return { score: r.score, streak: r.streak || 0 };
  } catch {
    /* ignore */
  }
  return { score: 0, streak: 0 };
}

// Salva o melhor de cada métrica. Retorna o que foi batido.
export function updateRecord(score: number, streak: number) {
  const prev = loadRecord();
  const next: Record = {
    score: Math.max(prev.score, score),
    streak: Math.max(prev.streak, streak),
  };
  localStorage.setItem(KEY, JSON.stringify(next));
  return {
    record: next,
    beatScore: score > prev.score,
    beatStreak: streak > prev.streak,
    prev,
  };
}
