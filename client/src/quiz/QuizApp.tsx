import { useEffect, useRef, useState } from "react";
import "./quiz.css";
import {
  CATEGORIES,
  DIFFICULTIES,
  poolFor,
  type Difficulty,
  type QuizCategory,
  type QuizQuestion,
} from "./questions";
import { wikiPhoto } from "./wiki";
import SoloGame from "../components/SoloGame";

type Mode = QuizCategory | "hard";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Prepared {
  q: QuizQuestion;
  opts: string[];
  correct: number;
}

function prepare(q: QuizQuestion): Prepared {
  const correctText = q.options[q.correct];
  const opts = shuffle(q.options);
  return { q, opts, correct: opts.indexOf(correctText) };
}

const DIFF_LABEL: Record<Difficulty, string> = { facil: "🟢 Fácil", medio: "🟡 Médio", dificil: "🔴 Difícil" };

type Screen = "home" | "difficulty" | "playing" | "solo360";

export default function QuizApp() {
  const [screen, setScreen] = useState<Screen>("home");
  const [mode, setMode] = useState<Mode>("lugares");
  const [modeName, setModeName] = useState("");
  const [diff, setDiff] = useState<Difficulty | "misto">("misto");
  const [current, setCurrent] = useState<Prepared | null>(null);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const recentRef = useRef<string[]>([]);

  const chooseCategory = (c: QuizCategory, name: string) => {
    setMode(c);
    setModeName(name);
    setScreen("difficulty");
  };

  const nextQuestion = (m: Mode, d: Difficulty | "misto") => {
    const pool = poolFor(m, d);
    const keep = Math.max(0, Math.min(pool.length - 1, 12));
    const recent = recentRef.current;
    let candidates = pool.filter((q) => !recent.includes(q.id));
    if (candidates.length === 0) candidates = pool;
    const q = candidates[Math.floor(Math.random() * candidates.length)];
    recent.push(q.id);
    while (recent.length > keep) recent.shift();
    setCurrent(prepare(q));
    setChosen(null);
  };

  const begin = (m: Mode, name: string, d: Difficulty | "misto") => {
    setMode(m);
    setModeName(name);
    setDiff(d);
    setScore(0);
    recentRef.current = [];
    nextQuestion(m, d);
    setScreen("playing");
  };

  const answer = (i: number) => {
    if (chosen !== null || !current) return;
    setChosen(i);
    if (i === current.correct) setScore((s) => s + 1);
  };

  // ---------- 360 ----------
  if (screen === "solo360") return <SoloGame onExit={() => setScreen("home")} />;

  // ---------- HOME ----------
  if (screen === "home") {
    return (
      <div className="zz">
        <div className="zz-hero">
          <h1 className="zz-logo">Zen<span>Zone</span></h1>
          <p className="zz-tag">Relaxe e jogue. Escolha um tema 👇</p>
        </div>
        <div className="zz-cats">
          {CATEGORIES.map((c) => (
            <button key={c.id} className="zz-cat" onClick={() => chooseCategory(c.id, c.name)}>
              <span className="zz-cat-emoji">{c.emoji}</span>
              <span className="zz-cat-name">{c.name}</span>
              <span className="zz-cat-sub">{c.sub}</span>
            </button>
          ))}
          <button className="zz-cat hard" onClick={() => begin("hard", "Hard 🔥", "misto")}>
            <span className="zz-cat-emoji">🔥</span>
            <span className="zz-cat-name">Hard</span>
            <span className="zz-cat-sub">um pouco de tudo</span>
          </button>
          <button className="zz-cat bonus" onClick={() => setScreen("solo360")}>
            <span className="zz-cat-emoji">🌐</span>
            <span className="zz-cat-name">Mundo 360°</span>
            <span className="zz-cat-sub">explore a rua e adivinhe</span>
          </button>
        </div>
        <p className="zz-foot">Quiz de bordo • toque pra responder</p>
      </div>
    );
  }

  // ---------- ESCOLHER DIFICULDADE ----------
  if (screen === "difficulty") {
    return (
      <div className="zz zz-center">
        <div className="zz-diff-box">
          <button className="zz-top-back solo" onClick={() => setScreen("home")}>‹ voltar</button>
          <h2 className="zz-diff-title">{modeName}</h2>
          <p className="zz-tag">Escolha a dificuldade:</p>
          <div className="zz-diffs">
            {DIFFICULTIES.map((d) => (
              <button key={d.id} className="zz-diff" onClick={() => begin(mode, modeName, d.id)}>
                <span className="zz-diff-emoji">{d.emoji}</span>
                <span>{d.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---------- JOGANDO (contínuo) ----------
  if (!current) return null;
  const answered = chosen !== null;
  const diffBadge = diff === "misto" ? DIFF_LABEL[current.q.difficulty] : DIFF_LABEL[diff as Difficulty];
  const hasImg = current.q.wiki || current.q.image || current.q.logo;
  return (
    <div className="zz zz-play">
      <div className="zz-top">
        <button className="zz-top-back" onClick={() => setScreen("home")}>‹</button>
        <span className="zz-top-cat">{modeName}</span>
        <span className="zz-top-diff">{diffBadge}</span>
        <span className="zz-top-score">⭐ {score}</span>
      </div>

      {hasImg ? <QuestionPhoto q={current.q} key={current.q.id} /> : null}

      <h2 className="zz-prompt">{current.q.prompt}</h2>

      <div className="zz-options">
        {current.opts.map((opt, i) => {
          let cls = "zz-opt";
          if (answered) {
            if (i === current.correct) cls += " correct";
            else if (i === chosen) cls += " wrong";
            else cls += " dim";
          }
          return (
            <button key={i} className={cls} disabled={answered} onClick={() => answer(i)}>
              {opt}
              {answered && i === current.correct && <span className="zz-opt-ic">✓</span>}
              {answered && i === chosen && i !== current.correct && <span className="zz-opt-ic">✕</span>}
            </button>
          );
        })}
      </div>

      {answered && (
        <>
          <div className="zz-feedback">
            {current.q.explain && <p className="zz-explain">{current.q.explain}</p>}
            <p className="zz-tap-hint">Toque em qualquer lugar para continuar ›</p>
          </div>
          <div className="zz-next-catch" onClick={() => nextQuestion(mode, diff)} />
        </>
      )}
    </div>
  );
}

function QuestionPhoto({ q }: { q: QuizQuestion }) {
  const logoSrc = q.logo ? `https://cdn.simpleicons.org/${q.logo}` : null;
  const [src, setSrc] = useState<string | null>(q.image ?? logoSrc);
  const [loading, setLoading] = useState(!q.image && !q.logo);

  useEffect(() => {
    if (q.image || q.logo || !q.wiki) return; // logo/image são diretos
    let active = true;
    setLoading(true);
    wikiPhoto(q.wiki).then((url) => {
      if (active) {
        setSrc(url);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [q]);

  return (
    <div className={`zz-photo ${q.logo ? "logo" : ""}`}>
      {loading ? <div className="zz-photo-load">Carregando…</div> : src ? <img src={src} alt="" /> : <div className="zz-photo-load">📷</div>}
    </div>
  );
}
