"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import {
  ArrowLeft,
  Check,
  Clock,
  Crown,
  Eraser,
  Loader2,
  Lock,
  RotateCw,
  Sparkles,
  Star,
  Trophy,
  X,
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ProtectedPage } from "@/components/ProtectedPage";
import { supabase } from "@/lib/supabase";

type QuestionLevel = "easy" | "medium" | "hard";
type UiLanguage = "bm" | "en";
type GameMode = "card" | "vertical" | "wheel";
type Status = "idle" | "correct" | "wrong" | "timeup";

type SifirCard = {
  id: string;
  language?: string | null;
  question: string;
  answer: string;
  difficulty?: QuestionLevel | null;
  level?: QuestionLevel | null;
  table_no?: number | null;
};

type ProfileAccess = {
  package_type?: string | null;
  flashcard_modul_unlocked?: boolean | null;
  sifir_deck_unlocked?: boolean | null;
  subscription_end?: string | null;
};

const QUESTION_FONT_STYLE: CSSProperties = {
  fontFamily:
    '"KG Miss Kindergarten", "KG Miss Kindergarten Sketch", "Comic Sans MS", cursive',
};

const sifirOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const text = {
  bm: {
    chooseTitle: "Premium Sifir Deck",
    chooseSubtitle: "Latih sifir 1 hingga 12 dengan kad, vertical mode dan spin wheel.",
    back: "Balik",
    level: "Tahap",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    cardMode: "Card Mode",
    verticalMode: "Vertical Mode",
    wheelMode: "Spin Wheel",
    loading: "Memuatkan sifir premium...",
    emptyDesc: "Soalan belum tersedia untuk pilihan ini.",
    noQuestion: "Tiada soalan untuk sifir",
    question: "Soalan Sifir",
    typeAnswer: "Taip jawapan",
    enterHint: "Tekan Enter untuk semak jawapan.",
    correct: "Betul! Excellent!",
    wrong: "Cuba lagi 💪",
    timeUp: "Masa Tamat!",
    clear: "Padam",
    check: "Semak",
    previous: "Sebelum",
    next: "Seterusnya",
    spin: "Spin",
    result: "Keputusan",
    correctCount: "Betul",
    wrongCount: "Salah",
    score: "Markah",
    playAgain: "Main Lagi",
    chooseOther: "Pilih Sifir Lain",
    lockedTitle: "Sifir Deck Premium",
    lockedDesc:
      "Fungsi ini khas untuk ahli Premium FD Arcadia. Dapatkan akses kepada semua sifir, tahap dan spin wheel.",
    upgrade: "Upgrade Premium",
  },
  en: {
    chooseTitle: "Premium Times Table Deck",
    chooseSubtitle: "Practise times tables 1 to 12 with cards, vertical mode and spin wheel.",
    back: "Back",
    level: "Level",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    cardMode: "Card Mode",
    verticalMode: "Vertical Mode",
    wheelMode: "Spin Wheel",
    loading: "Loading premium deck...",
    emptyDesc: "Questions are not available for this selection.",
    noQuestion: "No question for times table",
    question: "Multiplication Question",
    typeAnswer: "Type answer",
    enterHint: "Press Enter to check answer.",
    correct: "Correct! Excellent!",
    wrong: "Try again 💪",
    timeUp: "Time's Up!",
    clear: "Clear",
    check: "Check",
    previous: "Previous",
    next: "Next",
    spin: "Spin",
    result: "Result",
    correctCount: "Correct",
    wrongCount: "Wrong",
    score: "Score",
    playAgain: "Play Again",
    chooseOther: "Choose Other Table",
    lockedTitle: "Premium Sifir Deck",
    lockedDesc:
      "This feature is for FD Arcadia Premium members. Unlock all tables, levels and spin wheel mode.",
    upgrade: "Upgrade Premium",
  },
};

export default function SifirDeckPage() {
  return (
    <ProtectedPage>
      {(user) => (
        <>
          <Navbar />
          <SifirDeckGame userId={user.id} />
        </>
      )}
    </ProtectedPage>
  );
}

function SifirDeckGame({ userId }: { userId: string }) {
  const [accessLoading, setAccessLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  const [allCards, setAllCards] = useState<SifirCard[]>([]);
  const [cards, setCards] = useState<SifirCard[]>([]);
  const [selectedSifir, setSelectedSifir] = useState<number | null>(null);
  const [index, setIndex] = useState(0);
  const [uiLanguage, setUiLanguage] = useState<UiLanguage>("bm");
  const [mode, setMode] = useState<GameMode>("card");
  const [difficulty, setDifficulty] = useState<QuestionLevel>("easy");
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [loading, setLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelLimit, setWheelLimit] = useState(20);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [timeLeft, setTimeLeft] = useState(30);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [answeredCurrent, setAnsweredCurrent] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const current = cards[index];
  const t = text[uiLanguage];

  useEffect(() => {
    const browserLanguage = navigator.language.toLowerCase();
    setUiLanguage(browserLanguage.includes("ms") ? "bm" : "en");
    checkAccess();
  }, []);

  useEffect(() => {
    if (hasAccess) loadCards();
  }, [hasAccess]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [index, mode, selectedSifir]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!current || !selectedSifir || isSpinning || showResult) return;

      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        pressNumber(event.key);
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        setInput((prev) => prev.slice(0, -1));
        setStatus("idle");
      }

      if (event.key === "Enter") {
        event.preventDefault();
        checkAnswer();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  useEffect(() => {
    if (
      mode !== "wheel" ||
      !selectedSifir ||
      !current ||
      isSpinning ||
      showResult ||
      answeredCurrent
    ) {
      return;
    }

    if (timeLeft <= 0) {
      setStatus("timeup");
      setWrongCount((prev) => prev + 1);
      setAnsweredCurrent(true);

      const timeout = setTimeout(() => {
        moveToNextWheelQuestion();
      }, 1000);

      return () => clearTimeout(timeout);
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [
    mode,
    selectedSifir,
    current,
    isSpinning,
    showResult,
    answeredCurrent,
    timeLeft,
  ]);

  async function checkAccess() {
    setAccessLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "package_type, flashcard_modul_unlocked, sifir_deck_unlocked, subscription_end"
      )
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error(error);
      setHasAccess(false);
      setAccessLoading(false);
      return;
    }

    const profile = data as ProfileAccess | null;
    const packageType = String(profile?.package_type || "").toLowerCase();
    const isPremium =
      packageType === "premium" ||
      packageType === "full" ||
      profile?.flashcard_modul_unlocked === true ||
      profile?.sifir_deck_unlocked === true;

    const isExpired =
      profile?.subscription_end &&
      new Date(profile.subscription_end).getTime() < new Date().getTime();

    setHasAccess(Boolean(isPremium && !isExpired));
    setAccessLoading(false);
  }

  async function loadCards() {
    setLoading(true);
    setInput("");
    setStatus("idle");
    setIndex(0);

    const autoCards = generateAutoSifirCards();
    let adminCards: SifirCard[] = [];

    const { data, error } = await supabase
      .from("sifir_deck_questions")
      .select("id,language,question,answer,difficulty,table_no,created_at")
      .order("created_at", { ascending: false });

    if (!error) {
      adminCards = ((data || []) as SifirCard[]).map((card) => ({
        ...card,
        difficulty: normalizeDifficulty(card.difficulty),
        table_no:
          typeof card.table_no === "number"
            ? card.table_no
            : getTableNoFromQuestion(card.question),
      }));
    }

    const combinedCards = mergeCardsWithoutDuplicate(autoCards, adminCards);
    setAllCards(combinedCards);

    const { data: settings } = await supabase
      .from("sifir_deck_settings")
      .select("wheel_question_limit,timer_seconds")
      .eq("id", "global")
      .maybeSingle();

    if (settings) {
      const limit = Number(settings.wheel_question_limit || 20);
      const timer = Number(settings.timer_seconds || 30);
      setWheelLimit(limit);
      setTimerSeconds(timer);
      setTimeLeft(timer);
    }

    setLoading(false);
  }

  function chooseSifir(num: number) {
    const filtered = allCards.filter((card) => {
      const cardDifficulty = getCardDifficulty(card);
      if (cardDifficulty !== difficulty) return false;

      if (difficulty === "easy") {
        const parsed = parseQuestion(card.question);
        const firstNumber = Number(parsed.first);
        return card.language === "auto" && firstNumber === num;
      }

      if (!isRealAdminCard(card)) return false;

      const tableNo =
        typeof card.table_no === "number"
          ? card.table_no
          : getTableNoFromQuestion(card.question);

      return tableNo === num;
    });

    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    const maxQuestions = difficulty === "easy" ? 12 : wheelLimit;

    setSelectedSifir(num);
    setCards(shuffled.slice(0, maxQuestions));
    setIndex(0);
    setInput("");
    setStatus("idle");
    setCorrectCount(0);
    setWrongCount(0);
    setShowResult(false);
    setAnsweredCurrent(false);
    setTimeLeft(timerSeconds);
  }

  function backToChoose() {
    setSelectedSifir(null);
    setCards([]);
    setIndex(0);
    setInput("");
    setStatus("idle");
    setCorrectCount(0);
    setWrongCount(0);
    setShowResult(false);
    setAnsweredCurrent(false);
    setTimeLeft(timerSeconds);
  }

  function restartRound() {
    if (!selectedSifir) return;
    chooseSifir(selectedSifir);
  }

  function pressNumber(num: string) {
    if (status === "correct" || isSpinning) return;
    setInput((prev) => `${prev}${num}`.replace(/[^0-9]/g, "").slice(0, 4));
    setStatus("idle");
  }

  function handleInputChange(value: string) {
    if (isSpinning) return;
    setInput(value.replace(/[^0-9]/g, "").slice(0, 4));
    setStatus("idle");
  }

  function clearInput() {
    if (isSpinning) return;
    setInput("");
    setStatus("idle");
    inputRef.current?.focus();
  }

  function checkAnswer() {
    if (!current || !input || isSpinning) return;

    const isCorrect = input.trim() === String(current.answer || "").trim();
    setStatus(isCorrect ? "correct" : "wrong");

    if (mode === "wheel") {
      setAnsweredCurrent(true);

      if (isCorrect) {
        setCorrectCount((prev) => prev + 1);
        setTimeout(() => autoSpinNextQuestion(), 1000);
      } else {
        setWrongCount((prev) => prev + 1);
      }

      return;
    }

    inputRef.current?.focus();
  }

  function autoSpinNextQuestion() {
    if (cards.length === 0) return;

    if (index + 1 >= cards.length) {
      setShowResult(true);
      return;
    }

    setIsSpinning(true);
    setInput("");
    setStatus("idle");
    setWheelRotation((prev) => prev + 1800 + Math.floor(Math.random() * 1080));

    setTimeout(() => {
      setIndex((prev) => prev + 1);
      setAnsweredCurrent(false);
      setTimeLeft(timerSeconds);
      setIsSpinning(false);
      inputRef.current?.focus();
    }, 2200);
  }

  function nextCard() {
    if (cards.length === 0) return;
    setIndex(index + 1 >= cards.length ? 0 : index + 1);
    setInput("");
    setStatus("idle");
  }

  function previousCard() {
    if (cards.length === 0) return;
    setIndex(index - 1 < 0 ? cards.length - 1 : index - 1);
    setInput("");
    setStatus("idle");
  }

  function spinWheel() {
    if (cards.length === 0 || isSpinning || showResult) return;

    setIsSpinning(true);
    setStatus("idle");
    setInput("");
    setAnsweredCurrent(false);
    setTimeLeft(timerSeconds);
    setWheelRotation((prev) => prev + 1800 + Math.floor(Math.random() * 1080));

    setTimeout(() => {
      setIndex(Math.floor(Math.random() * cards.length));
      setTimeLeft(timerSeconds);
      setIsSpinning(false);
      inputRef.current?.focus();
    }, 2200);
  }

  function moveToNextWheelQuestion() {
    if (cards.length === 0) return;

    if (index + 1 >= cards.length) {
      setShowResult(true);
      return;
    }

    setIndex(index + 1);
    setInput("");
    setStatus("idle");
    setAnsweredCurrent(false);
    setTimeLeft(timerSeconds);
  }

  const questionParts = useMemo(() => {
    if (!current) return { first: "?", second: "?" };
    return parseQuestion(current.question);
  }, [current]);

  const scorePercent =
    cards.length > 0 ? Math.round((correctCount / cards.length) * 100) : 0;

  if (accessLoading) {
    return (
      <main className="min-h-screen bg-[#fbfaf7] px-4 py-10 text-slate-900">
        <div className="mx-auto flex max-w-5xl items-center justify-center py-32">
          <Loader2 className="mr-3 animate-spin" />
          Checking premium access...
        </div>
      </main>
    );
  }

  if (!hasAccess) {
    return <PremiumLocked t={t} setUiLanguage={setUiLanguage} uiLanguage={uiLanguage} />;
  }

  if (!selectedSifir) {
    return (
      <main className="min-h-screen bg-[#fbfaf7] text-slate-900">
        <div className="mx-auto max-w-6xl">
          <TopBar uiLanguage={uiLanguage} setUiLanguage={setUiLanguage} />

          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-full border border-indigo-100 bg-white px-5 py-3 font-bold text-slate-700 shadow-sm transition hover:bg-indigo-50"
          >
            <ArrowLeft className="mr-2" size={18} />
            {t.back}
          </Link>

          <section className="mt-10 overflow-hidden rounded-[2.5rem] border border-indigo-100 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-8 text-white shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center rounded-full bg-yellow-300 px-4 py-2 text-sm font-black text-slate-950">
                  <Crown className="mr-2" size={18} />
                  PREMIUM ACCESS
                </div>

                <h1
                  className="mt-5 text-5xl font-black leading-tight sm:text-7xl"
                  style={QUESTION_FONT_STYLE}
                >
                  {t.chooseTitle}
                </h1>

                <p className="mt-4 max-w-2xl text-lg font-semibold text-indigo-100 sm:text-xl">
                  {t.chooseSubtitle}
                </p>
              </div>

              <div className="rounded-[2rem] border border-white/20 bg-white/15 p-5 text-center backdrop-blur">
                <Sparkles className="mx-auto text-yellow-300" size={42} />
                <p className="mt-3 text-sm font-bold uppercase tracking-[0.2em] text-indigo-100">
                  Spin Wheel
                </p>
                <p className="mt-1 text-3xl font-black text-white">
                  {wheelLimit} Q • {timerSeconds}s
                </p>
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-[2rem] border border-indigo-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-300">
              {t.level}
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {(["easy", "medium", "hard"] as QuestionLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={`rounded-2xl px-5 py-4 font-black uppercase transition ${
                    difficulty === level
                      ? getLevelActiveClass(level)
                      : "bg-indigo-50 text-slate-500 hover:bg-indigo-100"
                  }`}
                >
                  {level === "easy"
                    ? `⭐ ${t.easy}`
                    : level === "medium"
                    ? `⭐⭐ ${t.medium}`
                    : `⭐⭐⭐ ${t.hard}`}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {sifirOptions.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => chooseSifir(num)}
                className="group aspect-square rounded-[2rem] border border-indigo-100 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:bg-indigo-50 hover:shadow-lg"
              >
                <span className="block text-xs font-black uppercase tracking-[0.25em] text-yellow-300">
                  SIFIR
                </span>

                <span
                  className="mt-3 block text-6xl font-black text-indigo-700 sm:text-7xl"
                  style={QUESTION_FONT_STYLE}
                >
                  {num}
                </span>

                <span className="mt-3 inline-flex rounded-full bg-yellow-300 px-3 py-1 text-xs font-black text-slate-950">
                  Start
                </span>
              </button>
            ))}
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <TopBar uiLanguage={uiLanguage} setUiLanguage={setUiLanguage} />

        <section className="rounded-[2.5rem] border border-indigo-100 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-7 text-white shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="text-sm font-black tracking-[0.25em] text-yellow-200">
                FD ARCADIA PREMIUM
              </p>

              <h1
                className="mt-2 text-5xl font-black sm:text-6xl"
                style={QUESTION_FONT_STYLE}
              >
                Sifir {selectedSifir}
              </h1>

              <p className="mt-2 font-semibold text-indigo-100">
                {difficulty.toUpperCase()} • {cards.length} questions
              </p>
            </div>

            <button
              type="button"
              onClick={backToChoose}
              className="rounded-full bg-white px-5 py-3 font-black text-indigo-700 shadow"
            >
              <ArrowLeft className="mr-2 inline" size={18} />
              {t.back}
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-indigo-100 bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-3">
            {(["card", "vertical", "wheel"] as GameMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setTimeLeft(timerSeconds);
                  setStatus("idle");
                  setInput("");
                }}
                className={`rounded-2xl px-5 py-4 font-black transition ${
                  mode === m
                    ? "bg-yellow-300 text-slate-950"
                    : "bg-indigo-50 text-slate-600 hover:bg-indigo-100"
                }`}
              >
                {m === "card"
                  ? t.cardMode
                  : m === "vertical"
                  ? t.verticalMode
                  : `🎡 ${t.wheelMode}`}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <div className="mt-8 rounded-[2rem] border border-indigo-100 bg-white p-10 text-center font-bold text-slate-600 shadow-sm">
            {t.loading}
          </div>
        ) : cards.length === 0 ? (
          <div className="mt-8 rounded-[2rem] border border-indigo-100 bg-white p-10 text-center shadow-sm">
            <h2 className="text-3xl font-black">{t.noQuestion} {selectedSifir}.</h2>
            <p className="mt-2 text-slate-500">{t.emptyDesc}</p>
          </div>
        ) : showResult ? (
          <ResultScreen
            t={t}
            correctCount={correctCount}
            wrongCount={wrongCount}
            scorePercent={scorePercent}
            onPlayAgain={restartRound}
            onChooseOther={backToChoose}
          />
        ) : (
          <section className="mt-8 rounded-[2.5rem] border border-indigo-100 bg-white p-6 shadow-xl">
            {mode !== "wheel" ? (
              <div className="mb-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={previousCard}
                  className="rounded-2xl bg-indigo-50 px-5 py-3 font-bold text-indigo-700 hover:bg-indigo-100"
                >
                  {t.previous}
                </button>

                <p className="font-black text-yellow-300">
                  {index + 1} / {cards.length}
                </p>

                <button
                  type="button"
                  onClick={nextCard}
                  className="rounded-2xl bg-yellow-300 px-5 py-3 font-black text-slate-950"
                >
                  {t.next}
                </button>
              </div>
            ) : (
              <WheelStats
                timeLeft={timeLeft}
                timerSeconds={timerSeconds}
                currentIndex={index}
                total={cards.length}
                correctCount={correctCount}
                wrongCount={wrongCount}
              />
            )}

            {mode === "card" && (
              <CardQuestion current={current} status={status} label={t.question} />
            )}

            {mode === "vertical" && (
              <VerticalQuestion
                first={questionParts.first}
                second={questionParts.second}
                input={input}
                status={status}
              />
            )}

            {mode === "wheel" && (
              <WheelQuestion
                current={current}
                spinning={isSpinning}
                rotation={wheelRotation}
                spinText={t.spin}
                cardLabel={`${index + 1} / ${cards.length}`}
                onSpin={spinWheel}
              />
            )}

            <AnswerInput
              inputRef={inputRef}
              input={input}
              status={status}
              placeholder={t.typeAnswer}
              hint={t.enterHint}
              onChange={handleInputChange}
              onSubmit={checkAnswer}
              disabled={isSpinning}
            />

            <NumberPad
              status={status}
              onPress={pressNumber}
              onClear={clearInput}
              onSubmit={checkAnswer}
              clearText={t.clear}
              checkText={t.check}
            />

            {status === "correct" && (
              <StatusBox type="correct" message={t.correct} />
            )}

            {(status === "wrong" || status === "timeup") && (
              <StatusBox
                type="wrong"
                message={status === "timeup" ? t.timeUp : t.wrong}
              />
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function generateAutoSifirCards(): SifirCard[] {
  const generatedCards: SifirCard[] = [];

  for (let sifir = 1; sifir <= 12; sifir += 1) {
    for (let multiplier = 1; multiplier <= 12; multiplier += 1) {
      generatedCards.push({
        id: `easy-${sifir}-${multiplier}`,
        language: "auto",
        question: `${sifir} × ${multiplier}`,
        answer: String(sifir * multiplier),
        difficulty: "easy",
        table_no: sifir,
      });
    }
  }

  return generatedCards;
}

function normalizeDifficulty(value: unknown): QuestionLevel {
  if (value === "medium") return "medium";
  if (value === "hard") return "hard";
  return "easy";
}

function getCardDifficulty(card: SifirCard): QuestionLevel {
  return normalizeDifficulty(card.difficulty || card.level);
}

function parseQuestion(question: string) {
  const cleaned = question.replace("=", "").replace("?", "").trim();

  if (cleaned.includes("×")) {
    const [first, second] = cleaned.split("×").map((x) => x.trim());
    return { first, second };
  }

  if (cleaned.includes("x")) {
    const [first, second] = cleaned.split("x").map((x) => x.trim());
    return { first, second };
  }

  if (cleaned.includes("*")) {
    const [first, second] = cleaned.split("*").map((x) => x.trim());
    return { first, second };
  }

  return { first: question, second: "" };
}

function getTableNoFromQuestion(question: string): number | null {
  const parsed = parseQuestion(question);
  const secondNumber = Number(parsed.second);
  const firstNumber = Number(parsed.first);

  if (Number.isFinite(secondNumber) && secondNumber >= 1 && secondNumber <= 12) {
    return secondNumber;
  }

  if (Number.isFinite(firstNumber) && firstNumber >= 1 && firstNumber <= 12) {
    return firstNumber;
  }

  return null;
}

function isRealAdminCard(card: SifirCard) {
  const language = String(card.language || "").toLowerCase();
  const id = String(card.id || "").toLowerCase();

  if (language === "auto") return false;
  if (id.startsWith("medium-") || id.startsWith("hard-") || id.startsWith("easy-")) {
    return false;
  }

  return true;
}

function mergeCardsWithoutDuplicate(autoCards: SifirCard[], adminCards: SifirCard[]) {
  const cardMap = new Map<string, SifirCard>();

  autoCards.forEach((card) => {
    cardMap.set(`${card.question}-${card.difficulty || "easy"}`, card);
  });

  adminCards.forEach((card) => {
    if (!isRealAdminCard(card)) return;

    const normalizedCard: SifirCard = {
      ...card,
      difficulty: getCardDifficulty(card),
      table_no:
        typeof card.table_no === "number"
          ? card.table_no
          : getTableNoFromQuestion(card.question),
    };

    cardMap.set(
      `${normalizedCard.question}-${normalizedCard.difficulty || "easy"}`,
      normalizedCard
    );
  });

  return Array.from(cardMap.values());
}

function TopBar({
  uiLanguage,
  setUiLanguage,
}: {
  uiLanguage: UiLanguage;
  setUiLanguage: (language: UiLanguage) => void;
}) {
  return (
    <div className="mb-6 flex justify-end gap-2">
      <button
        type="button"
        onClick={() => setUiLanguage("bm")}
        className={`rounded-full px-5 py-3 font-black ${
          uiLanguage === "bm"
            ? "bg-yellow-300 text-slate-950"
            : "border border-indigo-100 bg-white text-slate-600 shadow-sm"
        }`}
      >
        BM
      </button>

      <button
        type="button"
        onClick={() => setUiLanguage("en")}
        className={`rounded-full px-5 py-3 font-black ${
          uiLanguage === "en"
            ? "bg-yellow-300 text-slate-950"
            : "border border-indigo-100 bg-white text-slate-600 shadow-sm"
        }`}
      >
        EN
      </button>
    </div>
  );
}

function PremiumLocked({
  t,
  uiLanguage,
  setUiLanguage,
}: {
  t: typeof text.bm;
  uiLanguage: UiLanguage;
  setUiLanguage: (language: UiLanguage) => void;
}) {
  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <TopBar uiLanguage={uiLanguage} setUiLanguage={setUiLanguage} />

        <Link
          href="/dashboard"
          className="inline-flex items-center rounded-full border border-indigo-100 bg-white px-5 py-3 font-bold text-slate-700 shadow-sm hover:bg-indigo-50"
        >
          <ArrowLeft className="mr-2" size={18} />
          {t.back}
        </Link>

        <section className="mt-12 rounded-[2.5rem] border border-indigo-100 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-8 text-center text-white shadow-2xl">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-yellow-300 text-slate-950">
            <Lock size={42} />
          </div>

          <h1 className="mt-6 text-5xl font-black">{t.lockedTitle}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg font-semibold text-indigo-100">
            {t.lockedDesc}
          </p>

          <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/15 p-5">
              <Crown className="mx-auto text-yellow-300" />
              <p className="mt-2 font-black">Sifir 1–12</p>
            </div>

            <div className="rounded-2xl bg-white/15 p-5">
              <Star className="mx-auto text-yellow-300" />
              <p className="mt-2 font-black">Easy • Medium • Hard</p>
            </div>

            <div className="rounded-2xl bg-white/15 p-5">
              <RotateCw className="mx-auto text-yellow-300" />
              <p className="mt-2 font-black">Spin Wheel</p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="mt-8 inline-flex rounded-full bg-yellow-300 px-8 py-4 text-lg font-black text-slate-950 shadow-xl transition hover:bg-yellow-200"
          >
            {t.upgrade}
          </Link>
        </section>
      </div>
    </main>
  );
}

function getLevelActiveClass(level: QuestionLevel) {
  if (level === "easy") return "bg-emerald-400 text-slate-950 shadow-lg";
  if (level === "medium") return "bg-yellow-300 text-slate-950 shadow-lg";
  return "bg-red-500 text-white shadow-lg";
}

function CardQuestion({
  current,
  status,
  label,
}: {
  current: SifirCard;
  status: Status;
  label: string;
}) {
  return (
    <div
      className={`mx-auto max-w-3xl rounded-[2.5rem] p-10 text-center shadow-2xl ${
        status === "correct"
          ? "bg-emerald-500"
          : status === "wrong" || status === "timeup"
          ? "bg-red-500"
          : "bg-gradient-to-br from-indigo-600 to-purple-700"
      }`}
    >
      <p className="text-xl font-bold text-white/90">{label}</p>

      <h2
        className="mt-6 text-6xl font-black text-white sm:text-7xl"
        style={QUESTION_FONT_STYLE}
      >
        {current.question}
      </h2>
    </div>
  );
}

function VerticalQuestion({
  first,
  second,
  input,
  status,
}: {
  first: string;
  second: string;
  input: string;
  status: Status;
}) {
  return (
    <div className="mx-auto max-w-xl rounded-[2.5rem] border border-indigo-100 bg-white p-8 text-center text-slate-900 shadow-2xl">
      <div
        className="mx-auto w-72 text-right text-6xl font-black sm:text-7xl"
        style={QUESTION_FONT_STYLE}
      >
        <div>{first}</div>
        <div className="flex justify-between">
          <span>×</span>
          <span>{second}</span>
        </div>

        <div className="my-4 border-t-8 border-slate-900" />

        <div
          className={`min-h-24 rounded-2xl border-4 bg-slate-50 px-4 py-3 text-center ${
            status === "correct"
              ? "border-emerald-400 text-emerald-600"
              : status === "wrong" || status === "timeup"
              ? "border-red-400 text-red-600"
              : "border-indigo-300 text-indigo-600"
          }`}
        >
          {input || "?"}
        </div>
      </div>
    </div>
  );
}

function WheelQuestion({
  current,
  spinning,
  rotation,
  spinText,
  cardLabel,
  onSpin,
}: {
  current: SifirCard;
  spinning: boolean;
  rotation: number;
  spinText: string;
  cardLabel: string;
  onSpin: () => void;
}) {
  return (
    <div className="text-center">
      <p className="mb-4 font-black text-yellow-300">{cardLabel}</p>

      <div className="relative mx-auto h-[320px] w-[320px] sm:h-[430px] sm:w-[430px]">
        <div className="absolute left-1/2 top-[-8px] z-30 -translate-x-1/2">
          <div className="h-0 w-0 border-l-[24px] border-r-[24px] border-t-[48px] border-l-transparent border-r-transparent border-t-yellow-300 drop-shadow-xl" />
        </div>

        <div
          className="relative h-full w-full rounded-full border-[12px] border-white shadow-2xl transition-transform duration-[2200ms] ease-out"
          style={{
            transform: `rotate(${rotation}deg)`,
            background:
              "conic-gradient(#facc15 0deg 45deg, #38bdf8 45deg 90deg, #34d399 90deg 135deg, #a78bfa 135deg 180deg, #fb7185 180deg 225deg, #f97316 225deg 270deg, #22c55e 270deg 315deg, #6366f1 315deg 360deg)",
          }}
        />

        <div className="absolute left-1/2 top-1/2 z-20 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white p-3 text-center shadow-2xl">
          <p
            className="text-3xl font-black text-indigo-700"
            style={QUESTION_FONT_STYLE}
          >
            {spinning ? "🎡" : current.question}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onSpin}
        disabled={spinning}
        className="mt-10 inline-flex items-center justify-center gap-3 rounded-full bg-yellow-300 px-10 py-5 text-xl font-black text-slate-950 shadow-xl disabled:opacity-60"
      >
        <RotateCw className={spinning ? "animate-spin" : ""} size={26} />
        {spinning ? "Spinning..." : spinText}
      </button>
    </div>
  );
}

function AnswerInput({
  inputRef,
  input,
  status,
  placeholder,
  hint,
  onChange,
  onSubmit,
  disabled,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  input: string;
  status: Status;
  placeholder: string;
  hint: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="mx-auto mt-8 max-w-xl rounded-[2rem] bg-white p-5 shadow-xl">
      <input
        ref={inputRef}
        value={input}
        disabled={disabled}
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit();
          }
        }}
        className={`w-full rounded-2xl border-4 px-5 py-4 text-center text-5xl font-black outline-none ${
          status === "correct"
            ? "border-emerald-400 text-emerald-600"
            : status === "wrong" || status === "timeup"
            ? "border-red-400 text-red-600"
            : "border-indigo-200 text-indigo-700 focus:border-indigo-500"
        }`}
        style={QUESTION_FONT_STYLE}
      />

      <p className="mt-3 text-center text-sm font-bold text-slate-400">
        {hint}
      </p>
    </div>
  );
}

function NumberPad({
  status,
  onPress,
  onClear,
  onSubmit,
  clearText,
  checkText,
}: {
  status: Status;
  onPress: (num: string) => void;
  onClear: () => void;
  onSubmit: () => void;
  clearText: string;
  checkText: string;
}) {
  return (
    <div className="mx-auto mt-6 max-w-xl rounded-[2rem] border border-indigo-100 bg-indigo-50 p-5 shadow-sm">
      <div className="grid grid-cols-3 gap-4">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onPress(num)}
            className="h-20 rounded-2xl bg-white text-3xl font-black text-slate-900 shadow-md"
            style={QUESTION_FONT_STYLE}
          >
            {num}
          </button>
        ))}

        <button
          type="button"
          onClick={onClear}
          className="flex h-20 items-center justify-center rounded-2xl bg-red-500 text-white shadow-md"
        >
          <X />
        </button>

        <button
          type="button"
          onClick={() => onPress("0")}
          className="h-20 rounded-2xl bg-white text-3xl font-black text-slate-900 shadow-md"
          style={QUESTION_FONT_STYLE}
        >
          0
        </button>

        <button
          type="button"
          onClick={onSubmit}
          className={`h-20 rounded-2xl text-xl font-black text-white shadow-md ${
            status === "correct" ? "bg-emerald-500" : "bg-green-500"
          }`}
        >
          <Check className="mr-1 inline" />
          {checkText}
        </button>
      </div>

      <button
        type="button"
        onClick={onClear}
        className="mt-4 w-full rounded-2xl bg-yellow-300 px-5 py-4 font-black text-slate-950 shadow"
      >
        <Eraser className="mr-2 inline" />
        {clearText}
      </button>
    </div>
  );
}

function WheelStats({
  timeLeft,
  timerSeconds,
  currentIndex,
  total,
  correctCount,
  wrongCount,
}: {
  timeLeft: number;
  timerSeconds: number;
  currentIndex: number;
  total: number;
  correctCount: number;
  wrongCount: number;
}) {
  const percent = Math.max(0, Math.min(100, (timeLeft / timerSeconds) * 100));

  return (
    <div className="mb-6 rounded-[2rem] border border-indigo-100 bg-indigo-50 p-5">
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="QUESTION" value={`${currentIndex + 1}/${total}`} />
        <Stat label="TIME" value={`${timeLeft}s`} />
        <Stat label="CORRECT" value={correctCount} />
        <Stat label="WRONG" value={wrongCount} />
      </div>

      <div className="mt-4 h-4 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-yellow-300 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white p-4 text-center text-slate-900">
      <p className="text-xs font-black text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function ResultScreen({
  t,
  correctCount,
  wrongCount,
  scorePercent,
  onPlayAgain,
  onChooseOther,
}: {
  t: typeof text.bm;
  correctCount: number;
  wrongCount: number;
  scorePercent: number;
  onPlayAgain: () => void;
  onChooseOther: () => void;
}) {
  return (
    <section className="mt-8 rounded-[2.5rem] border border-indigo-100 bg-white p-8 text-center shadow-xl">
      <Trophy className="mx-auto fill-yellow-300 text-yellow-300" size={72} />
      <h2 className="mt-4 text-5xl font-black text-indigo-700">{t.result}</h2>
      <p className="mt-4 text-6xl font-black text-yellow-300">{scorePercent}%</p>

      <div className="mx-auto mt-8 grid max-w-xl gap-4 sm:grid-cols-2">
        <Stat label={t.correctCount} value={correctCount} />
        <Stat label={t.wrongCount} value={wrongCount} />
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onPlayAgain}
          className="rounded-2xl bg-yellow-300 px-6 py-4 font-black text-slate-950"
        >
          {t.playAgain}
        </button>

        <button
          type="button"
          onClick={onChooseOther}
          className="rounded-2xl border border-indigo-100 bg-indigo-50 px-6 py-4 font-black text-indigo-700 hover:bg-indigo-100"
        >
          {t.chooseOther}
        </button>
      </div>
    </section>
  );
}

function StatusBox({ type, message }: { type: "correct" | "wrong"; message: string }) {
  return (
    <div
      className={`mt-6 rounded-[2rem] p-5 text-center text-2xl font-black ${
        type === "correct"
          ? "bg-emerald-400 text-slate-950"
          : "bg-red-500 text-white"
      }`}
    >
      {message}
    </div>
  );
}