"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import {
  ArrowLeft,
  Check,
  Clock,
  Eraser,
  RotateCw,
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
  table_no?: number | null;
};

const QUESTION_FONT_STYLE: CSSProperties = {
  fontFamily:
    '"KG Miss Kindergarten", "KG Miss Kindergarten Sketch", "Comic Sans MS", cursive',
};

const sifirOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const sifirColors: Record<number, string> = {
  1: "bg-sky-400 shadow-sky-700",
  2: "bg-rose-400 shadow-rose-700",
  3: "bg-orange-400 shadow-orange-700",
  4: "bg-yellow-300 shadow-yellow-600",
  5: "bg-green-400 shadow-green-700",
  6: "bg-teal-400 shadow-teal-700",
  7: "bg-cyan-500 shadow-cyan-700",
  8: "bg-violet-400 shadow-violet-700",
  9: "bg-pink-400 shadow-pink-700",
  10: "bg-teal-500 shadow-teal-800",
  11: "bg-indigo-500 shadow-indigo-800",
  12: "bg-amber-300 shadow-amber-700",
};


function generateAutoSifirCards(): SifirCard[] {
  const generatedCards: SifirCard[] = [];

  for (let sifir = 1; sifir <= 12; sifir += 1) {
    for (let multiplier = 1; multiplier <= 12; multiplier += 1) {
      const answer = sifir * multiplier;

      generatedCards.push({
        id: `easy-${sifir}-${multiplier}`,
        language: "auto",
        question: `${sifir} × ${multiplier}`,
        answer: String(answer),
        difficulty: "easy",
        table_no: sifir,
      });

      generatedCards.push({
        id: `medium-a-${sifir}-${multiplier}`,
        language: "auto",
        question: `${sifir} × ${multiplier}`,
        answer: String(answer),
        difficulty: "medium",
        table_no: sifir,
      });

      generatedCards.push({
        id: `medium-b-${sifir}-${multiplier}`,
        language: "auto",
        question: `${sifir} × ___ = ${answer}`,
        answer: String(multiplier),
        difficulty: "medium",
        table_no: sifir,
      });

      generatedCards.push({
        id: `medium-c-${sifir}-${multiplier}`,
        language: "auto",
        question: `${multiplier} × ${sifir}`,
        answer: String(answer),
        difficulty: "medium",
        table_no: sifir,
      });

      generatedCards.push({
        id: `hard-a-${sifir}-${multiplier}`,
        language: "auto",
        question: `${sifir} × ___ = ${answer}`,
        answer: String(multiplier),
        difficulty: "hard",
        table_no: sifir,
      });

      generatedCards.push({
        id: `hard-b-${sifir}-${multiplier}`,
        language: "auto",
        question: `___ × ${multiplier} = ${answer}`,
        answer: String(sifir),
        difficulty: "hard",
        table_no: sifir,
      });

      generatedCards.push({
        id: `hard-c-${sifir}-${multiplier}`,
        language: "auto",
        question: `${multiplier} × ${sifir}`,
        answer: String(answer),
        difficulty: "hard",
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

function mergeCardsWithoutDuplicate(
  autoCards: SifirCard[],
  adminCards: SifirCard[]
) {
  const cardMap = new Map<string, SifirCard>();

  autoCards.forEach((card) => {
    cardMap.set(`${card.question}-${card.difficulty || "easy"}`, card);
  });

  adminCards.forEach((card) => {
    const normalizedCard: SifirCard = {
      ...card,
      difficulty: normalizeDifficulty(card.difficulty),
    };

    cardMap.set(
      `${normalizedCard.question}-${normalizedCard.difficulty || "easy"}`,
      normalizedCard
    );
  });

  return Array.from(cardMap.values());
}

const text = {
  bm: {
    chooseTitle: "Pilih Sifir",
    chooseSubtitle: "Sifir berapa yang ingin kamu kuasai?",
    tileLabel: "SIFIR",
    headerTitle: "Sifir",
    back: "Balik",
    subtitle: "Latihan sifir auto 1 hingga 12 dengan pilihan tahap dan spin wheel.",
    loading: "Memuatkan kad...",
    emptyDesc: "Tiada soalan dijumpai. Sila refresh semula halaman ini.",
    cardMode: "Card Mode",
    verticalMode: "Vertical Mode",
    wheelMode: "Spin Wheel",
    spin: "Pusing Roda",
    previous: "Sebelum",
    next: "Seterusnya",
    card: "Kad",
    question: "Soalan Sifir",
    typeAnswer: "Taip jawapan di sini",
    enterHint: "Tekan Enter untuk semak jawapan.",
    correct: "Betul! Good job!",
    wrong: "Cuba lagi 💪",
    clear: "Padam Jawapan",
    check: "Semak",
    noQuestion: "Tiada soalan untuk sifir",
    level: "Tahap",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    result: "Keputusan",
    playAgain: "Main Lagi",
    chooseOther: "Pilih Sifir Lain",
    correctCount: "Betul",
    wrongCount: "Salah",
    score: "Markah",
    timeUp: "Masa Tamat!",
  },
  en: {
    chooseTitle: "Choose Times Table",
    chooseSubtitle: "Which multiplication table do you want to master?",
    tileLabel: "TIMES",
    headerTitle: "Times Table",
    back: "Back",
    subtitle: "Practice auto times tables 1 to 12 with level and spin wheel.",
    loading: "Loading cards...",
    emptyDesc: "No question found. Please refresh this page.",
    cardMode: "Card Mode",
    verticalMode: "Vertical Mode",
    wheelMode: "Spin Wheel",
    spin: "Spin Wheel",
    previous: "Previous",
    next: "Next",
    card: "Card",
    question: "Multiplication Question",
    typeAnswer: "Type answer here",
    enterHint: "Press Enter to check answer.",
    correct: "Correct! Good job!",
    wrong: "Try again 💪",
    clear: "Clear Answer",
    check: "Check",
    noQuestion: "No question for times table",
    level: "Level",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    result: "Result",
    playAgain: "Play Again",
    chooseOther: "Choose Other Times Table",
    correctCount: "Correct",
    wrongCount: "Wrong",
    score: "Score",
    timeUp: "Time's Up!",
  },
};

export default function SifirDeckPage() {
  return (
    <ProtectedPage>
      {() => (
        <>
          <Navbar />
          <SifirDeckGame />
        </>
      )}
    </ProtectedPage>
  );
}

function SifirDeckGame() {
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
    loadCards();
  }, []);

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

  async function loadCards() {
    setLoading(true);
    setInput("");
    setStatus("idle");
    setIndex(0);

    const autoCards = generateAutoSifirCards();

    const { data, error } = await supabase
      .from("sifir_deck_questions")
      .select("id,language,question,answer,difficulty,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setAllCards(autoCards);
    } else {
      const combinedCards = mergeCardsWithoutDuplicate(
        autoCards,
        (data || []) as SifirCard[]
      );

      setAllCards(combinedCards);
    }

    const { data: settings, error: settingsError } = await supabase
      .from("sifir_deck_settings")
      .select("wheel_question_limit,timer_seconds")
      .eq("id", "global")
      .maybeSingle();

    if (!settingsError && settings) {
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
      const parsed = parseQuestion(card.question);
      const cardDifficulty = normalizeDifficulty(card.difficulty);

      if (cardDifficulty !== difficulty) return false;

      const firstNumber = Number(parsed.first);
      const secondNumber = Number(parsed.second);
      const isNormalQuestion =
        !card.question.includes("___") && !card.question.includes("=");

      if (difficulty === "easy") {
        return firstNumber === num && isNormalQuestion;
      }

      if (typeof card.table_no === "number") {
        return card.table_no === num;
      }

      return firstNumber === num || secondNumber === num;
    });

    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    const maxQuestions = difficulty === "easy" ? 12 : wheelLimit;
    const limitedQuestions = shuffled.slice(0, maxQuestions);

    setSelectedSifir(num);
    setCards(limitedQuestions);
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

    const userAnswer = input.trim();
    const correctAnswer = String(current.answer || "").trim();
    const isCorrect = userAnswer === correctAnswer;

    setStatus(isCorrect ? "correct" : "wrong");

    if (mode === "wheel") {
      setAnsweredCurrent(true);

      if (isCorrect) {
        setCorrectCount((prev) => prev + 1);

        setTimeout(() => {
          autoSpinNextQuestion();
        }, 1000);
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

    const nextIndex = index + 1;

    setIsSpinning(true);
    setInput("");
    setStatus("idle");

    setWheelRotation((prev) => prev + 1800 + Math.floor(Math.random() * 1080));

    setTimeout(() => {
      setIndex(nextIndex);
      setAnsweredCurrent(false);
      setTimeLeft(timerSeconds);
      setIsSpinning(false);
      inputRef.current?.focus();
    }, 3000);
  }

  function nextCard() {
    if (cards.length === 0) return;

    const nextIndex = index + 1 >= cards.length ? 0 : index + 1;

    setIndex(nextIndex);
    setInput("");
    setStatus("idle");
  }

  function previousCard() {
    if (cards.length === 0) return;

    const prevIndex = index - 1 < 0 ? cards.length - 1 : index - 1;

    setIndex(prevIndex);
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
      const randomIndex = Math.floor(Math.random() * cards.length);

      setIndex(randomIndex);
      setTimeLeft(timerSeconds);
      setIsSpinning(false);
      inputRef.current?.focus();
    }, 3000);
  }

  function moveToNextWheelQuestion() {
    if (cards.length === 0) return;

    if (index + 1 >= cards.length) {
      setShowResult(true);
      return;
    }

    const nextIndex = index + 1;

    setIndex(nextIndex);
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

  if (!selectedSifir) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-emerald-50 px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <LanguageToggle
            uiLanguage={uiLanguage}
            setUiLanguage={setUiLanguage}
          />

          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-full bg-white px-6 py-4 text-lg font-black text-slate-700 shadow-lg"
          >
            <ArrowLeft className="mr-2" size={20} />
            {t.back}
          </Link>

          <section className="mt-12 text-center">
            <h1
              className="text-5xl font-black leading-tight text-slate-800 sm:text-6xl"
              style={QUESTION_FONT_STYLE}
            >
              {t.chooseTitle}
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-xl font-bold leading-8 text-slate-500 sm:text-2xl">
              {t.chooseSubtitle}
            </p>

            <p className="mx-auto mt-4 inline-flex rounded-full bg-white px-5 py-3 text-sm font-bold text-emerald-700 shadow">
              Spin Wheel: {wheelLimit} questions • Timer: {timerSeconds}s
            </p>
          </section>

          <section className="mx-auto mt-8 max-w-3xl rounded-[2rem] bg-white p-5 shadow">
            <p className="text-center text-sm font-black uppercase tracking-[0.2em] text-yellow-600">
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
                      : "bg-slate-100 text-slate-500"
                  }`}
                  style={QUESTION_FONT_STYLE}
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

          <section className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
            {sifirOptions.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => chooseSifir(num)}
                className={`aspect-square rounded-[2rem] ${sifirColors[num]} text-white shadow-[0_10px_0] transition hover:-translate-y-1 active:translate-y-1 active:shadow-none`}
              >
                <span
                  className="block text-sm font-black uppercase tracking-[0.2em] sm:text-base"
                  style={QUESTION_FONT_STYLE}
                >
                  {t.tileLabel}
                </span>

                <span
                  className="mt-2 block text-6xl font-black drop-shadow sm:text-7xl"
                  style={QUESTION_FONT_STYLE}
                >
                  {num}
                </span>
              </button>
            ))}
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-emerald-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <LanguageToggle uiLanguage={uiLanguage} setUiLanguage={setUiLanguage} />

        <section className="rounded-[2rem] bg-gradient-to-r from-emerald-500 to-green-500 p-6 text-white shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold tracking-[0.25em] text-yellow-100">
                FD ARCADIA
              </p>

              <h1
                className="mt-2 text-4xl font-black sm:text-5xl"
                style={QUESTION_FONT_STYLE}
              >
                ✏️ {t.headerTitle} {selectedSifir}
              </h1>

              <p className="mt-2 text-green-50">{t.subtitle}</p>

              <p className="mt-2 text-sm font-bold text-yellow-100">
                {t.level}: {difficulty.toUpperCase()} • Spin Wheel round:{" "}
                {cards.length} question(s)
              </p>
            </div>

            <button
              type="button"
              onClick={backToChoose}
              className="rounded-full bg-white px-5 py-3 font-bold text-emerald-700 shadow"
            >
              <ArrowLeft className="mr-2 inline" size={18} />
              {t.back}
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] bg-white p-5 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setMode("card")}
              className={`rounded-2xl px-5 py-3 font-bold ${
                mode === "card"
                  ? "bg-yellow-300 text-slate-800 ring-4 ring-yellow-400"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {t.cardMode}
            </button>

            <button
              type="button"
              onClick={() => setMode("vertical")}
              className={`rounded-2xl px-5 py-3 font-bold ${
                mode === "vertical"
                  ? "bg-sky-500 text-white ring-4 ring-sky-700"
                  : "bg-sky-100 text-sky-700"
              }`}
            >
              {t.verticalMode}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("wheel");
                setTimeLeft(timerSeconds);
                setStatus("idle");
                setInput("");
              }}
              className={`rounded-2xl px-5 py-3 font-bold ${
                mode === "wheel"
                  ? "bg-pink-500 text-white ring-4 ring-pink-700"
                  : "bg-pink-100 text-pink-700"
              }`}
            >
              🎡 {t.wheelMode}
            </button>
          </div>
        </section>

        {loading ? (
          <div className="mt-8 rounded-[2rem] bg-white p-10 text-center font-bold shadow">
            {t.loading}
          </div>
        ) : cards.length === 0 ? (
          <div className="mt-8 rounded-[2rem] bg-white p-10 text-center shadow">
            <h2
              className="text-3xl font-bold text-slate-700"
              style={QUESTION_FONT_STYLE}
            >
              {t.noQuestion} {selectedSifir}.
            </h2>

            <p className="mt-2 text-slate-500">{t.emptyDesc}</p>
          </div>
        ) : showResult ? (
          <ResultScreen
            resultTitle={t.result}
            correctLabel={t.correctCount}
            wrongLabel={t.wrongCount}
            scoreLabel={t.score}
            playAgainText={t.playAgain}
            chooseOtherText={t.chooseOther}
            correctCount={correctCount}
            wrongCount={wrongCount}
            scorePercent={scorePercent}
            onPlayAgain={restartRound}
            onChooseOther={backToChoose}
          />
        ) : (
          <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-xl">
            {mode !== "wheel" ? (
              <div className="mb-5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={previousCard}
                  className="rounded-2xl bg-slate-100 px-5 py-3 font-bold text-slate-700"
                >
                  {t.previous}
                </button>

                <p className="font-bold text-emerald-700">
                  {t.card} {index + 1} / {cards.length}
                </p>

                <button
                  type="button"
                  onClick={nextCard}
                  className="rounded-2xl bg-emerald-500 px-5 py-3 font-bold text-white"
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

            {mode === "card" ? (
              <>
                <CardQuestion
                  current={current}
                  status={status}
                  label={t.question}
                />

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
              </>
            ) : mode === "vertical" ? (
              <>
                <VerticalQuestion
                  first={questionParts.first}
                  second={questionParts.second}
                  input={input}
                  status={status}
                />

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
              </>
            ) : (
              <>
                <WheelQuestion
                  current={current}
                  status={status}
                  spinning={isSpinning}
                  rotation={wheelRotation}
                  spinText={t.spin}
                  cardLabel={`${t.card} ${index + 1} / ${cards.length}`}
                  onSpin={spinWheel}
                />

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
              </>
            )}

            {status === "correct" && (
              <div className="mt-6 rounded-[2rem] bg-emerald-100 p-5 text-center text-2xl font-black text-emerald-700">
                <Star className="mr-2 inline fill-yellow-300 text-yellow-400" />
                {t.correct}
              </div>
            )}

            {status === "wrong" && (
              <div className="mt-6 rounded-[2rem] bg-red-100 p-5 text-center text-2xl font-black text-red-600">
                {t.wrong}
              </div>
            )}

            {status === "timeup" && (
              <div className="mt-6 rounded-[2rem] bg-orange-100 p-5 text-center text-2xl font-black text-orange-600">
                <Clock className="mr-2 inline" />
                {t.timeUp}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function LanguageToggle({
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
        className={`rounded-full px-5 py-3 font-black shadow ${
          uiLanguage === "bm"
            ? "bg-emerald-500 text-white"
            : "bg-white text-slate-700"
        }`}
      >
        BM
      </button>

      <button
        type="button"
        onClick={() => setUiLanguage("en")}
        className={`rounded-full px-5 py-3 font-black shadow ${
          uiLanguage === "en"
            ? "bg-emerald-500 text-white"
            : "bg-white text-slate-700"
        }`}
      >
        English
      </button>
    </div>
  );
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

function getLevelActiveClass(level: QuestionLevel) {
  if (level === "easy") return "bg-emerald-500 text-white shadow-lg";
  if (level === "medium") return "bg-yellow-400 text-slate-800 shadow-lg";
  return "bg-red-500 text-white shadow-lg";
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
    <div className="mb-6 rounded-[2rem] bg-indigo-50 p-5">
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl bg-white p-4 text-center">
          <p className="text-sm font-bold text-slate-400">QUESTION</p>
          <p className="text-2xl font-black text-indigo-700">
            {currentIndex + 1} / {total}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 text-center">
          <p className="text-sm font-bold text-slate-400">TIME</p>
          <p className="text-2xl font-black text-orange-600">{timeLeft}s</p>
        </div>

        <div className="rounded-2xl bg-white p-4 text-center">
          <p className="text-sm font-bold text-slate-400">CORRECT</p>
          <p className="text-2xl font-black text-emerald-600">
            {correctCount}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 text-center">
          <p className="text-sm font-bold text-slate-400">WRONG</p>
          <p className="text-2xl font-black text-red-600">{wrongCount}</p>
        </div>
      </div>

      <div className="mt-4 h-4 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-orange-400 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function ResultScreen({
  resultTitle,
  correctLabel,
  wrongLabel,
  scoreLabel,
  playAgainText,
  chooseOtherText,
  correctCount,
  wrongCount,
  scorePercent,
  onPlayAgain,
  onChooseOther,
}: {
  resultTitle: string;
  correctLabel: string;
  wrongLabel: string;
  scoreLabel: string;
  playAgainText: string;
  chooseOtherText: string;
  correctCount: number;
  wrongCount: number;
  scorePercent: number;
  onPlayAgain: () => void;
  onChooseOther: () => void;
}) {
  return (
    <section className="mt-8 rounded-[2rem] bg-white p-8 text-center shadow-xl">
      <Trophy className="mx-auto fill-yellow-300 text-yellow-500" size={72} />

      <h2
        className="mt-4 text-5xl font-black text-indigo-700"
        style={QUESTION_FONT_STYLE}
      >
        {resultTitle}
      </h2>

      <p className="mt-4 text-6xl font-black text-emerald-600">
        {scorePercent}%
      </p>

      <p className="mt-2 text-xl font-bold text-slate-500">{scoreLabel}</p>

      <div className="mx-auto mt-8 grid max-w-xl gap-4 sm:grid-cols-2">
        <div className="rounded-[2rem] bg-emerald-100 p-6">
          <p className="text-lg font-bold text-emerald-700">{correctLabel}</p>
          <p className="mt-2 text-5xl font-black text-emerald-700">
            {correctCount}
          </p>
        </div>

        <div className="rounded-[2rem] bg-red-100 p-6">
          <p className="text-lg font-bold text-red-700">{wrongLabel}</p>
          <p className="mt-2 text-5xl font-black text-red-700">{wrongCount}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onPlayAgain}
          className="rounded-2xl bg-indigo-600 px-6 py-4 font-black text-white"
        >
          {playAgainText}
        </button>

        <button
          type="button"
          onClick={onChooseOther}
          className="rounded-2xl bg-yellow-300 px-6 py-4 font-black text-slate-800"
        >
          {chooseOtherText}
        </button>
      </div>
    </section>
  );
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
      className={`mx-auto max-w-3xl rounded-[2rem] p-10 text-center text-white shadow-2xl ${
        status === "correct"
          ? "bg-emerald-500"
          : status === "wrong" || status === "timeup"
          ? "bg-red-500"
          : "bg-indigo-600"
      }`}
    >
      <p className="text-2xl text-white/80">{label}</p>

      <h2
        className="mt-6 text-6xl font-black sm:text-7xl"
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
    <div className="mx-auto max-w-xl rounded-[2rem] border-4 border-yellow-200 bg-yellow-50 p-8 text-center shadow-xl">
      <div
        className="mx-auto w-72 text-right text-6xl font-black text-slate-800 sm:text-7xl"
        style={QUESTION_FONT_STYLE}
      >
        <div>{first}</div>

        <div className="flex justify-between">
          <span>×</span>
          <span>{second}</span>
        </div>

        <div className="my-4 border-t-8 border-slate-800" />

        <div
          className={`min-h-24 rounded-2xl border-4 bg-white px-4 py-3 text-center ${
            status === "correct"
              ? "border-emerald-400 text-emerald-600"
              : status === "wrong" || status === "timeup"
              ? "border-red-400 text-red-600"
              : "border-slate-300 text-indigo-600"
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
  status: Status;
  spinning: boolean;
  rotation: number;
  spinText: string;
  cardLabel: string;
  onSpin: () => void;
}) {
  return (
    <div className="text-center">
      <p className="mb-4 text-center font-bold text-emerald-700">
        {cardLabel}
      </p>

      <div className="relative mx-auto h-[320px] w-[320px] sm:h-[430px] sm:w-[430px]">
        <div className="absolute left-1/2 top-[-8px] z-30 -translate-x-1/2">
          <div className="h-0 w-0 border-l-[24px] border-r-[24px] border-t-[48px] border-l-transparent border-r-transparent border-t-pink-600 drop-shadow-xl" />
        </div>

        <div className="absolute inset-0 rounded-full bg-pink-400 opacity-20 blur-2xl" />

        <div
          className="relative h-full w-full rounded-full border-[12px] border-white shadow-[0_20px_0_#be185d,0_30px_50px_rgba(0,0,0,0.25)] transition-transform duration-[3000ms] ease-out"
          style={{
            transform: `rotate(${rotation}deg)`,
            background:
              "conic-gradient(#ff4fa3 0deg 45deg, #ffd166 45deg 90deg, #06d6a0 90deg 135deg, #4cc9f0 135deg 180deg, #b517ff 180deg 225deg, #ff9f1c 225deg 270deg, #ef476f 270deg 315deg, #8ac926 315deg 360deg)",
          }}
        >
          <div className="absolute inset-8 rounded-full border-[10px] border-white/50" />
          <div className="absolute inset-[72px] rounded-full bg-white/20" />
        </div>

        <div className="absolute left-1/2 top-1/2 z-20 flex h-36 w-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-white p-3 shadow-2xl sm:h-44 sm:w-44">
          <div className="text-center">
            <p className="text-[10px] font-black tracking-[0.2em] text-pink-600 sm:text-xs">
              QUESTION
            </p>

            <p
              className="mt-2 text-3xl font-black text-indigo-700 sm:text-4xl"
              style={QUESTION_FONT_STYLE}
            >
              {spinning ? "🎡" : current.question}
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onSpin}
        disabled={spinning}
        className="mt-10 inline-flex items-center justify-center gap-3 rounded-full bg-pink-600 px-10 py-5 text-xl font-black text-white shadow-xl transition hover:scale-105 hover:bg-pink-700 active:scale-95 disabled:opacity-60"
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
    <div className="mx-auto mt-8 max-w-xl rounded-[2rem] bg-white p-5 shadow">
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
        className={`w-full rounded-2xl border-4 px-5 py-4 text-center text-5xl font-black outline-none disabled:bg-slate-100 ${
          status === "correct"
            ? "border-emerald-400 text-emerald-600"
            : status === "wrong" || status === "timeup"
            ? "border-red-400 text-red-600"
            : "border-sky-200 text-indigo-700 focus:border-indigo-500"
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
    <div className="mx-auto mt-6 max-w-xl rounded-[2rem] bg-sky-100 p-5 shadow-xl">
      <div className="grid grid-cols-3 gap-4">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onPress(num)}
            className="h-20 rounded-2xl bg-white text-3xl font-black text-slate-800 shadow-md transition hover:scale-105"
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
          className="h-20 rounded-2xl bg-white text-3xl font-black text-slate-800 shadow-md transition hover:scale-105"
          style={QUESTION_FONT_STYLE}
        >
          0
        </button>

        <button
          type="button"
          onClick={onSubmit}
          className={`h-20 rounded-2xl text-2xl font-black text-white shadow-md ${
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
        className="mt-4 w-full rounded-2xl bg-yellow-400 px-5 py-4 font-black text-slate-800 shadow"
      >
        <Eraser className="mr-2 inline" />
        {clearText}
      </button>
    </div>
  );
}