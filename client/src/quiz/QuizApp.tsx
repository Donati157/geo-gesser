import { useEffect, useState } from "react";
import "./quiz.css";
import {
  CATEGORIES,
  DIFFICULTIES,
  pickRound,
  questionsByCategory,
  type Difficulty,
  type QuizCategory,
  type QuizQuestion,
} from "./questions";
import { wikiPhoto } from "./wiki";
import SoloGame from "../components/SoloGame";

const ROUND_SIZE = 8;

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

type Screen = "home" | "difficulty" | "playing" | "result" | "solo360";

export default function QuizApp() {
  const [screen, setScreen] = useState<Screen>("home");
  const [cat, setCat] = useState<QuizCategory>("lugares");
  const [catName, setCatName] = useState("");
  const [diff, setDiff] = useState<Difficulty | "misto">("misto");
  const [deck, setDeck] = useState<Prepared[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);

  const chooseCategory = (c: QuizCategory, name: string) => {
    setCat(c);
    setCatName(name);
    setScreen("difficulty");
  };

  const startRound = (d: Difficulty | "misto") => {
    let qs = pickRound(cat, d, ROUND_SIZE);
    if (qs.length === 0) qs = pickRound(cat, "misto", ROUND_SIZE); // sem perguntas nessa dificuldade
    setDiff(d);
    setDeck(qs.map(prepare));
    setIdx(0);
    setScore(0);
    setChosen(null);
    setScreen("playing");
  };

  const answer = (i: number) => {
    if (chosen !== null) return;
    setChosen(i);
    if (i === deck[idx].correct) setScore((s) => s + 1);
  };

  const next = () => {
    if (idx + 1 >= deck.length) setScreen("result");
    else {
      setIdx((n) => n + 1);
      setChosen(null);
    }
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
              <span className="zz-cat-sub">{questionsByCategory(c.id).length} perguntas</span>
            </button>
          ))}
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
          <h2 className="zz-diff-title">{catName}</h2>
          <p className="zz-tag">Escolha a dificuldade:</p>
          <div className="zz-diffs">
            {DIFFICULTIES.map((d) => (
              <button key={d.id} className="zz-diff" onClick={() => startRound(d.id)}>
                <span className="zz-diff-emoji">{d.emoji}</span>
                <span>{d.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---------- RESULTADO ----------
  if (screen === "result") {
    const pct = Math.round((score / deck.length) * 100);
    const msg = pct >= 80 ? "Mandou muito! 🏆" : pct >= 50 ? "Foi bem! 👏" : "Bora treinar! 💪";
    return (
      <div className="zz zz-center">
        <div className="zz-result">
          <div className="zz-result-emoji">{pct >= 80 ? "🏆" : pct >= 50 ? "🎉" : "🧭"}</div>
          <div className="zz-score-big">{score}<span>/{deck.length}</span></div>
          <p className="zz-result-msg">{msg}</p>
          <div className="zz-result-actions">
            <button className="zz-btn primary" onClick={() => startRound(diff)}>Jogar de novo</button>
            <button className="zz-btn ghost" onClick={() => setScreen("home")}>Trocar tema</button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- JOGANDO ----------
  const cur = deck[idx];
  const answered = chosen !== null;
  const diffBadge = diff === "misto" ? DIFF_LABEL[cur.q.difficulty] : DIFF_LABEL[diff as Difficulty];
  return (
    <div className="zz zz-play">
      <div className="zz-top">
        <button className="zz-top-back" onClick={() => setScreen("home")}>‹</button>
        <span className="zz-top-cat">{catName}</span>
        <span className="zz-top-diff">{diffBadge}</span>
        <span className="zz-top-prog">{idx + 1}/{deck.length}</span>
        <span className="zz-top-score">⭐ {score}</span>
      </div>

      {cur.q.wiki || cur.q.image ? <QuestionPhoto q={cur.q} key={cur.q.id} /> : null}

      <h2 className="zz-prompt">{cur.q.prompt}</h2>

      <div className="zz-options">
        {cur.opts.map((opt, i) => {
          let cls = "zz-opt";
          if (answered) {
            if (i === cur.correct) cls += " correct";
            else if (i === chosen) cls += " wrong";
            else cls += " dim";
          }
          return (
            <button key={i} className={cls} disabled={answered} onClick={() => answer(i)}>
              {opt}
              {answered && i === cur.correct && <span className="zz-opt-ic">✓</span>}
              {answered && i === chosen && i !== cur.correct && <span className="zz-opt-ic">✕</span>}
            </button>
          );
        })}
      </div>

      {answered && (
        <>
          <div className="zz-feedback">
            {cur.q.explain && <p className="zz-explain">{cur.q.explain}</p>}
            <p className="zz-tap-hint">Toque em qualquer lugar para continuar ›</p>
          </div>
          {/* captura o toque em qualquer lugar para ir à próxima */}
          <div className="zz-next-catch" onClick={next} />
        </>
      )}
    </div>
  );
}

function QuestionPhoto({ q }: { q: QuizQuestion }) {
  const [src, setSrc] = useState<string | null>(q.image ?? null);
  const [loading, setLoading] = useState(!q.image);

  useEffect(() => {
    if (q.image || !q.wiki) return;
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
    <div className="zz-photo">
      {loading ? <div className="zz-photo-load">Carregando foto…</div> : src ? <img src={src} alt="" /> : <div className="zz-photo-load">📷</div>}
    </div>
  );
}
