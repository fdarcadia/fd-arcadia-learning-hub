"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheckBig,
  CircleX,
  ClipboardList,
  Clock,
  Crown,
  Delete,
  Flame,
  Loader2,
  Lock,
  Rocket,
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

function getSifirCardTheme(num: number) {
  const themes = [
    "border-rose-200 bg-rose-100 hover:bg-rose-200",
    "border-orange-200 bg-orange-100 hover:bg-orange-200",
    "border-amber-200 bg-amber-100 hover:bg-amber-200",
    "border-yellow-200 bg-yellow-100 hover:bg-yellow-200",
    "border-lime-200 bg-lime-100 hover:bg-lime-200",
    "border-emerald-200 bg-emerald-100 hover:bg-emerald-200",
    "border-teal-200 bg-teal-100 hover:bg-teal-200",
    "border-cyan-200 bg-cyan-100 hover:bg-cyan-200",
    "border-sky-200 bg-sky-100 hover:bg-sky-200",
    "border-blue-200 bg-blue-100 hover:bg-blue-200",
    "border-violet-200 bg-violet-100 hover:bg-violet-200",
    "border-fuchsia-200 bg-fuchsia-100 hover:bg-fuchsia-200",
  ];

  return themes[(num - 1) % themes.length];
}

function getSifirNumberTheme(num: number) {
  const themes = [
    "text-rose-600",
    "text-orange-600",
    "text-amber-600",
    "text-yellow-600",
    "text-lime-700",
    "text-emerald-600",
    "text-teal-600",
    "text-cyan-600",
    "text-sky-600",
    "text-blue-600",
    "text-violet-600",
    "text-fuchsia-600",
  ];

  return themes[(num - 1) % themes.length];
}

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
    swipeHint: "Swipe atau jawab betul untuk kad seterusnya",
    streak: "Streak",
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
    chooseTitle: "Times Table Deck",
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
    swipeHint: "Swipe or answer correctly for the next card",
    streak: "Streak",
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
  const [uiLanguage, setUiLanguage] = useState<UiLanguage>("en");
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
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [slideState, setSlideState] = useState<"idle" | "out-left" | "out-right" | "in-right" | "in-left">("idle");
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState(0);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const answerLockedRef = useRef(false);
  const current = cards[index];
  const t = text[uiLanguage];

  useEffect(() => {
    // English is the default UI. The existing EN/BM switch still lets users change language.
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
    const timedMode = mode === "wheel" || mode === "card";

    if (
      !timedMode ||
      !selectedSifir ||
      !current ||
      isSpinning ||
      showResult ||
      answeredCurrent
    ) {
      return;
    }

    if (timeLeft <= 0) {
      if (answerLockedRef.current) return;

      answerLockedRef.current = true;
      setStatus("timeup");
      setWrongCount((prev) => Math.min(prev + 1, cards.length));
      setStreak(0);
      setAnsweredCurrent(true);

      const timeout = setTimeout(() => {
        if (mode === "wheel") {
          moveToNextWheelQuestion();
        } else {
          animateToNextCard();
        }
      }, 900);

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
    setStreak(0);
    setBestStreak(0);
    setShowResult(false);
    setAnsweredCurrent(false);
    answerLockedRef.current = false;
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
    setStreak(0);
    setBestStreak(0);
    setShowResult(false);
    setAnsweredCurrent(false);
    answerLockedRef.current = false;
    setTimeLeft(timerSeconds);
  }

  function restartRound() {
    if (!selectedSifir) return;
    chooseSifir(selectedSifir);
  }

  function pressNumber(num: string) {
    if (status === "correct" || isSpinning || slideState !== "idle" || showResult) return;
    setInput((prev) => `${prev}${num}`.replace(/[^0-9]/g, "").slice(0, 4));
    setStatus("idle");
  }

  function handleInputChange(value: string) {
    if (isSpinning || slideState !== "idle" || showResult) return;
    setInput(value.replace(/[^0-9]/g, "").slice(0, 4));
    setStatus("idle");
  }

  function clearInput() {
    if (isSpinning || slideState !== "idle" || showResult) return;
    setInput("");
    setStatus("idle");
    inputRef.current?.focus();
  }

  function checkAnswer() {
    if (!current || !input || isSpinning || slideState !== "idle" || showResult) return;
    if (answerLockedRef.current) return;

    const isCorrect = input.trim() === String(current.answer || "").trim();
    setStatus(isCorrect ? "correct" : "wrong");

    if (!isCorrect) {
      setWrongCount((prev) => Math.min(prev + 1, cards.length));
      setStreak(0);

      // Wrong answers stay on the same question so the student can retry.
      answerLockedRef.current = false;
      setAnsweredCurrent(false);
      inputRef.current?.focus();
      return;
    }

    answerLockedRef.current = true;
    setAnsweredCurrent(true);

    setCorrectCount((prev) => Math.min(prev + 1, cards.length));
    setStreak((prev) => {
      const next = prev + 1;
      setBestStreak((best) => Math.max(best, next));
      return next;
    });

    // Show the green correct state briefly, then move automatically.
    if (mode === "wheel") {
      setTimeout(() => autoSpinNextQuestion(), 850);
    } else {
      setTimeout(() => animateToNextCard(), 700);
    }
  }

  function animateToNextCard() {
    if (cards.length === 0 || slideState !== "idle") return;

    if (index + 1 >= cards.length) {
      setShowResult(true);
      setAnsweredCurrent(true);
      return;
    }

    setSlideState("out-left");

    setTimeout(() => {
      setIndex((prev) => prev + 1);
      setInput("");
      setStatus("idle");
      setAnsweredCurrent(false);
      answerLockedRef.current = false;
      setTimeLeft(timerSeconds);
      setSlideState("in-right");

      requestAnimationFrame(() => {
        requestAnimationFrame(() => setSlideState("idle"));
      });

      inputRef.current?.focus();
    }, 220);
  }

  function animateToPreviousCard() {
    if (cards.length === 0 || slideState !== "idle" || index <= 0) return;

    setSlideState("out-right");

    setTimeout(() => {
      setIndex((prev) => Math.max(0, prev - 1));
      setInput("");
      setStatus("idle");
      setAnsweredCurrent(false);
      answerLockedRef.current = false;
      setTimeLeft(timerSeconds);
      setSlideState("in-left");

      requestAnimationFrame(() => {
        requestAnimationFrame(() => setSlideState("idle"));
      });

      inputRef.current?.focus();
    }, 220);
  }

  function nextCard() {
    if (cards.length === 0) return;
    animateToNextCard();
  }

  function previousCard() {
    if (cards.length === 0) return;
    animateToPreviousCard();
  }

  function onCardTouchStart(clientX: number) {
    if (mode !== "card" || slideState !== "idle") return;
    setTouchStartX(clientX);
    setTouchDeltaX(0);
  }

  function onCardTouchMove(clientX: number) {
    if (touchStartX === null || mode !== "card" || slideState !== "idle") return;
    setTouchDeltaX(clientX - touchStartX);
  }

  function onCardTouchEnd() {
    if (touchStartX === null || mode !== "card" || slideState !== "idle") {
      setTouchStartX(null);
      setTouchDeltaX(0);
      return;
    }

    if (touchDeltaX < -70) {
      animateToNextCard();
    } else if (touchDeltaX > 70) {
      animateToPreviousCard();
    }

    setTouchStartX(null);
    setTouchDeltaX(0);
  }

  function getSlideClass() {
    if (slideState === "out-left") return "-translate-x-[115%] rotate-[-2deg] opacity-0";
    if (slideState === "out-right") return "translate-x-[115%] rotate-[2deg] opacity-0";
    if (slideState === "in-right") return "translate-x-[35%] opacity-0";
    if (slideState === "in-left") return "-translate-x-[35%] opacity-0";
    return "translate-x-0 rotate-0 opacity-100";
  }

  function autoSpinNextQuestion() {
    if (cards.length === 0 || isSpinning || showResult) return;

    if (index + 1 >= cards.length) {
      setShowResult(true);
      setAnsweredCurrent(true);
      return;
    }

    setIsSpinning(true);
    setInput("");
    setStatus("idle");
    setWheelRotation((prev) => prev + 1800 + Math.floor(Math.random() * 1080));

    setTimeout(() => {
      setIndex((prev) => prev + 1);
      setAnsweredCurrent(false);
      answerLockedRef.current = false;
      setTimeLeft(timerSeconds);
      setIsSpinning(false);
      inputRef.current?.focus();
    }, 2200);
  }

  function spinWheel() {
    if (cards.length === 0 || isSpinning || showResult) return;

    setIsSpinning(true);
    setStatus("idle");
    setInput("");
    setAnsweredCurrent(false);
    answerLockedRef.current = false;
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
    answerLockedRef.current = false;
    setTimeLeft(timerSeconds);
  }

  const questionParts = useMemo(() => {
    if (!current) return { first: "?", second: "?" };
    return parseQuestion(current.question);
  }, [current]);

  const verticalParts = useMemo(() => {
    const firstNum = Number(questionParts.first);
    const secondNum = Number(questionParts.second);

    if (!Number.isFinite(firstNum) || !Number.isFinite(secondNum)) {
      return questionParts;
    }

    // In vertical multiplication, prioritise a 2-digit value on top.
    // If both are the same digit length, place the larger value on top.
    const firstDigits = Math.abs(firstNum).toString().length;
    const secondDigits = Math.abs(secondNum).toString().length;

    if (secondDigits > firstDigits || (secondDigits === firstDigits && secondNum > firstNum)) {
      return { first: questionParts.second, second: questionParts.first };
    }

    return questionParts;
  }, [questionParts]);

  const safeCorrectCount = Math.min(correctCount, cards.length);
  const scorePercent =
    cards.length > 0
      ? Math.min(100, Math.round((safeCorrectCount / cards.length) * 100))
      : 0;

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

          <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-8 w-1.5 rounded-full bg-indigo-600" />
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                  {uiLanguage === "en" ? "CHOOSE LEVEL" : "PILIH TAHAP"}
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-400">
                  {uiLanguage === "en"
                    ? "Pick a level that suits your practice today"
                    : "Pilih tahap yang sesuai untuk latihan hari ini"}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <button
                type="button"
                onClick={() => setDifficulty("easy")}
                className={`relative overflow-hidden rounded-[26px] border-2 p-5 text-left transition duration-200 ${
                  difficulty === "easy"
                    ? "border-emerald-500 bg-gradient-to-br from-emerald-50 to-white shadow-[0_14px_36px_rgba(16,185,129,0.16)]"
                    : "border-emerald-100 bg-gradient-to-br from-emerald-50/70 to-white hover:border-emerald-300"
                }`}
              >
                {difficulty === "easy" && (
                  <span className="absolute right-4 top-4 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-emerald-700 shadow-sm">
                    Recommended
                  </span>
                )}

                <div className="flex items-center gap-4">
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                    <Sparkles size={28} />
                  </div>

                  <div>
                    <p className="text-2xl font-black text-emerald-600">EASY</p>
                    <p className="mt-1 text-sm font-bold text-slate-500">Basic Practice</p>
                  </div>
                </div>

                <div className="mt-5 border-t border-emerald-100 pt-4 text-center">
                  <span className="text-sm font-black text-emerald-600">12 Questions</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDifficulty("medium")}
                className={`overflow-hidden rounded-[26px] border-2 p-5 text-left transition duration-200 ${
                  difficulty === "medium"
                    ? "border-orange-400 bg-gradient-to-br from-orange-50 to-white shadow-[0_14px_36px_rgba(249,115,22,0.15)]"
                    : "border-orange-100 bg-gradient-to-br from-orange-50/70 to-white hover:border-orange-300"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-orange-100 text-orange-500">
                    <Trophy size={28} />
                  </div>

                  <div>
                    <p className="text-2xl font-black text-orange-500">MEDIUM</p>
                    <p className="mt-1 text-sm font-bold text-slate-500">Mixed Challenge</p>
                  </div>
                </div>

                <div className="mt-5 border-t border-orange-100 pt-4 text-center">
                  <span className="text-sm font-black text-orange-500">Start</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDifficulty("hard")}
                className={`overflow-hidden rounded-[26px] border-2 p-5 text-left transition duration-200 ${
                  difficulty === "hard"
                    ? "border-rose-400 bg-gradient-to-br from-rose-50 to-white shadow-[0_14px_36px_rgba(244,63,94,0.14)]"
                    : "border-rose-100 bg-gradient-to-br from-rose-50/70 to-white hover:border-rose-300"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-500">
                    <Rocket size={28} />
                  </div>

                  <div>
                    <p className="text-2xl font-black text-rose-500">HARD</p>
                    <p className="mt-1 text-sm font-bold text-slate-500">Advanced Practice</p>
                  </div>
                </div>

                <div className="mt-5 border-t border-rose-100 pt-4 text-center">
                  <span className="text-sm font-black text-rose-500">Start</span>
                </div>
              </button>
            </div>
          </section>

          <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-8 w-1.5 rounded-full bg-indigo-600" />
                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                    {uiLanguage === "en" ? "CHOOSE TIMES TABLE (SIFIR)" : "PILIH SIFIR"}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-slate-400">
                    {uiLanguage === "en"
                      ? "Select a times table from 1 to 12"
                      : "Pilih sifir daripada 1 hingga 12"}
                  </p>
                </div>
              </div>

              <div className="inline-flex self-start items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-black text-indigo-700 sm:self-auto">
                <ClipboardList size={17} />
                Total: 12 Tables
              </div>
            </div>

            <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-6 xl:grid-cols-12">
              {sifirOptions.map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => chooseSifir(num)}
                  className={`group relative min-h-[138px] overflow-hidden rounded-[22px] border-2 px-2 pb-12 pt-3 text-center shadow-[0_8px_20px_rgba(15,23,42,0.07)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(15,23,42,0.12)] ${getSifirCardTheme(
                    num
                  )}`}
                >
                  <span
                    className={`block text-[9px] font-black uppercase tracking-[0.12em] ${getSifirNumberTheme(
                      num
                    )}`}
                  >
                    {uiLanguage === "en" ? "TABLE" : "SIFIR"}
                  </span>

                  <span
                    className={`mt-1 block text-[46px] font-black leading-[0.95] ${getSifirNumberTheme(
                      num
                    )}`}
                    style={QUESTION_FONT_STYLE}
                  >
                    {num}
                  </span>

                  <span className="absolute inset-x-2 bottom-2 rounded-full bg-white px-2 py-2 text-[10px] font-black text-slate-700 shadow-sm ring-1 ring-black/5">
                    {difficulty === "easy" ? "12 Q" : "Start"}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-6 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-[1.4fr_1fr_1fr_1fr]">
              <div className="flex items-center gap-3 rounded-2xl bg-indigo-50 px-4 py-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-white text-indigo-600 shadow-sm">
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="text-sm font-black text-indigo-700">How it works?</p>
                  <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                    Choose a level and times table above.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3">
                <CircleCheckBig size={18} className="text-emerald-600" />
                <p className="text-[11px] font-bold text-slate-600">Answer correctly</p>
              </div>

              <div className="flex items-center gap-2 rounded-2xl bg-orange-50 px-4 py-3">
                <Flame size={18} className="text-orange-600" />
                <p className="text-[11px] font-bold text-slate-600">Build your streak</p>
              </div>

              <div className="flex items-center gap-2 rounded-2xl bg-violet-50 px-4 py-3">
                <Trophy size={18} className="text-violet-600" />
                <p className="text-[11px] font-bold text-slate-600">Beat your best score</p>
              </div>
            </div>
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
                  setAnsweredCurrent(false);
                  answerLockedRef.current = false;
                  setSlideState("idle");
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
                  : t.wheelMode}
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
            bestStreak={bestStreak}
            onPlayAgain={restartRound}
            onChooseOther={backToChoose}
          />
        ) : (
          <section className="mt-8 rounded-[2.5rem] border border-indigo-100 bg-white p-6 shadow-xl">
            <GameStats
              timed={mode === "card" || mode === "wheel"}
              timeLeft={timeLeft}
              timerSeconds={timerSeconds}
              currentIndex={index}
              total={cards.length}
              correctCount={correctCount}
              wrongCount={wrongCount}
              streak={streak}
            />

            <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
              <div className="min-w-0">
                {mode === "card" && (
                  <div
                    className={`transition-all duration-200 ease-out ${getSlideClass()}`}
                    style={{
                      transform:
                        touchStartX !== null && slideState === "idle"
                          ? `translateX(${Math.max(-100, Math.min(100, touchDeltaX * 0.32))}px)`
                          : undefined,
                    }}
                    onTouchStart={(event) => onCardTouchStart(event.touches[0]?.clientX ?? 0)}
                    onTouchMove={(event) => onCardTouchMove(event.touches[0]?.clientX ?? 0)}
                    onTouchEnd={onCardTouchEnd}
                  >
                    <CardQuestion
                      current={current}
                      status={status}
                      label={t.question}
                      swipeHint={t.swipeHint}
                      inputRef={inputRef}
                      input={input}
                      placeholder={t.typeAnswer}
                      hint={t.enterHint}
                      onChange={handleInputChange}
                      onSubmit={checkAnswer}
                      disabled={isSpinning || slideState !== "idle" || status === "correct"}
                    />
                  </div>
                )}

                {mode === "vertical" && (
                  <div className={`transition-all duration-200 ease-out ${getSlideClass()}`}>
                    <VerticalQuestion
                      first={verticalParts.first}
                      second={verticalParts.second}
                      input={input}
                      status={status}
                      inputRef={inputRef}
                      placeholder={t.typeAnswer}
                      hint={t.enterHint}
                      onChange={handleInputChange}
                      onSubmit={checkAnswer}
                      disabled={slideState !== "idle" || status === "correct"}
                    />
                  </div>
                )}

                {mode === "wheel" && (
                  <>
                    <WheelQuestion
                      current={current}
                      spinning={isSpinning}
                      rotation={wheelRotation}
                      spinText={t.spin}
                      cardLabel={`${index + 1} / ${cards.length}`}
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
                      disabled={isSpinning || status === "correct"}
                    />
                  </>
                )}

                <div className="mt-4">
                  {status === "correct" && (
                    <StatusBox type="correct" message={t.correct} />
                  )}

                  {(status === "wrong" || status === "timeup") && (
                    <StatusBox
                      type="wrong"
                      message={status === "timeup" ? t.timeUp : t.wrong}
                    />
                  )}
                </div>
              </div>

              <div className="lg:sticky lg:top-5">
                <NumberPad
                  status={status}
                  onPress={pressNumber}
                  onClear={clearInput}
                  onSubmit={checkAnswer}
                  clearText={t.clear}
                  checkText={t.check}
                />
              </div>
            </div>

            <div className="mt-6 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex min-w-max gap-2">
                {sifirOptions.map((num) => {
                  const selected = selectedSifir === num;

                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => chooseSifir(num)}
                      className={`relative h-[132px] w-[88px] shrink-0 overflow-hidden rounded-[22px] border-2 px-2 pb-11 pt-3 text-center shadow-sm transition hover:-translate-y-0.5 ${
                        selected
                          ? "border-orange-500 bg-orange-50 ring-2 ring-orange-100"
                          : getSifirCardTheme(num)
                      }`}
                    >
                      <span
                        className={`block text-[9px] font-black uppercase ${getSifirNumberTheme(
                          num
                        )}`}
                      >
                        {uiLanguage === "en" ? "TABLE" : "SIFIR"}
                      </span>

                      <span
                        className={`mt-1 block text-[44px] font-black leading-[0.95] ${getSifirNumberTheme(
                          num
                        )}`}
                        style={QUESTION_FONT_STYLE}
                      >
                        {num}
                      </span>

                      <span className="absolute inset-x-2 bottom-2 rounded-full bg-white px-2 py-1.5 text-[10px] font-black text-slate-700 shadow-sm">
                        12 Q
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {mode !== "wheel" && (
              <div className="mx-auto mt-5 flex max-w-xl items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={previousCard}
                  disabled={index === 0 || slideState !== "idle"}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-30"
                >
                  <ChevronLeft size={17} />
                  {t.previous}
                </button>

                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                  {mode === "card" ? "Swipe" : "Auto Next"}
                </p>

                <button
                  type="button"
                  onClick={nextCard}
                  disabled={index + 1 >= cards.length || slideState !== "idle"}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-30"
                >
                  {t.next}
                  <ChevronRight size={17} />
                </button>
              </div>
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
  swipeHint,
  inputRef,
  input,
  placeholder,
  hint,
  onChange,
  onSubmit,
  disabled,
}: {
  current: SifirCard;
  status: Status;
  label: string;
  swipeHint: string;
  inputRef: RefObject<HTMLInputElement | null>;
  input: string;
  placeholder: string;
  hint: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}) {
  const parts = parseQuestion(current.question);

  return (
    <div className="select-none">
      <div
        className={`relative overflow-hidden rounded-[2rem] border p-6 text-center shadow-[0_18px_50px_rgba(15,23,42,0.12)] sm:p-8 ${
          status === "correct"
            ? "border-emerald-200 bg-gradient-to-br from-emerald-600 to-teal-700"
            : status === "wrong" || status === "timeup"
              ? "border-rose-200 bg-gradient-to-br from-rose-600 to-red-700"
              : "border-indigo-200 bg-gradient-to-br from-[#090d2a] via-[#17184f] to-[#321c72]"
        }`}
      >
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/[0.06]" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/[0.04]" />

        <div className="relative">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/55">
            {label}
          </p>

          <div
            className="mt-6 flex items-center justify-center gap-3 text-5xl font-black sm:gap-5 sm:text-7xl"
            style={QUESTION_FONT_STYLE}
          >
            <span className="text-orange-400">{parts.first}</span>
            <span className="text-white">×</span>
            <span className="text-sky-400">{parts.second}</span>
            <span className="text-white">=</span>
            <span className="text-violet-400">?</span>
          </div>

          <input
            ref={inputRef}
            value={input}
            disabled={disabled}
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onSubmit();
              }
            }}
            className={`mx-auto mt-7 block w-full max-w-xl rounded-2xl border-[3px] bg-white px-5 py-4 text-center text-4xl font-black text-slate-950 outline-none transition ${
              status === "correct"
                ? "border-emerald-400"
                : status === "wrong" || status === "timeup"
                  ? "border-red-400"
                  : "border-violet-400 focus:border-yellow-300"
            }`}
            style={QUESTION_FONT_STYLE}
          />

          <p className="mt-3 text-xs font-bold text-white/55">{hint}</p>
          <div className="mx-auto mt-4 h-1.5 w-20 rounded-full bg-white/20" />
          <p className="mt-3 text-[11px] font-bold text-white/40">{swipeHint}</p>
        </div>
      </div>
    </div>
  );
}

function VerticalQuestion({
  first,
  second,
  input,
  status,
  inputRef,
  placeholder,
  hint,
  onChange,
  onSubmit,
  disabled,
}: {
  first: string;
  second: string;
  input: string;
  status: Status;
  inputRef: RefObject<HTMLInputElement | null>;
  placeholder: string;
  hint: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)]">
      <div className="bg-[#060b22] px-6 py-4 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
          Vertical Multiplication
        </p>
      </div>

      <div className="p-6 sm:p-8">
        <div
          className="mx-auto w-[min(76vw,310px)] text-right text-6xl font-black text-slate-950 sm:text-7xl"
          style={QUESTION_FONT_STYLE}
        >
          <div className="pr-3">{first}</div>

          <div className="mt-1 flex items-end justify-between border-b-[6px] border-slate-950 pb-3">
            <span className="text-5xl text-indigo-600">×</span>
            <span className="pr-3 text-orange-500">{second}</span>
          </div>
        </div>

        <input
          ref={inputRef}
          value={input}
          disabled={disabled}
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onSubmit();
            }
          }}
          className={`mx-auto mt-6 block w-full max-w-md rounded-2xl border-[3px] px-5 py-4 text-center text-4xl font-black outline-none transition ${
            status === "correct"
              ? "border-emerald-400 bg-emerald-50 text-emerald-600"
              : status === "wrong" || status === "timeup"
                ? "border-red-400 bg-red-50 text-red-600"
                : "border-indigo-200 bg-indigo-50/40 text-indigo-700 focus:border-indigo-500"
          }`}
          style={QUESTION_FONT_STYLE}
        />

        <p className="mt-3 text-center text-xs font-bold text-slate-400">{hint}</p>
        <p className="mt-4 text-center text-[11px] font-bold text-slate-400">
          2-digit / larger number is placed on top automatically.
        </p>
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
            {spinning ? "..." : current.question}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onSpin}
        disabled={spinning}
        className="mt-10 inline-flex items-center justify-center rounded-full bg-yellow-300 px-10 py-5 text-xl font-black text-slate-950 shadow-xl disabled:opacity-60"
      >
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
    <div className="mx-auto mt-6 max-w-xl rounded-[1.7rem] border border-slate-200 bg-white p-4 shadow-sm">
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
  const locked = status === "correct" || status === "timeup";

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-3 shadow-sm sm:p-4">
      <p className="mb-3 hidden text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 lg:block">
        Number Pad
      </p>

      <div className="grid grid-cols-3 gap-2.5">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onPress(num)}
            disabled={locked}
            className="min-h-16 rounded-2xl border border-slate-200 bg-white text-2xl font-black text-slate-950 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 active:scale-95 disabled:opacity-40"
            style={QUESTION_FONT_STYLE}
          >
            {num}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPress("0")}
          disabled={locked}
          className="min-h-16 rounded-2xl border border-slate-200 bg-white text-2xl font-black text-slate-950 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 active:scale-95 disabled:opacity-40"
          style={QUESTION_FONT_STYLE}
        >
          0
        </button>

        <button
          type="button"
          onClick={onClear}
          disabled={locked}
          className="flex min-h-16 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-600 transition active:scale-95 disabled:opacity-40"
          aria-label={clearText}
          title={clearText}
        >
          <Delete size={21} />
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={locked}
          className="min-h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 px-3 text-sm font-black text-white shadow-md transition active:scale-95 disabled:opacity-40"
        >
          <Check className="mx-auto mb-0.5" size={17} />
          {checkText}
        </button>
      </div>
    </div>
  );
}

function GameStats({
  timed,
  timeLeft,
  timerSeconds,
  currentIndex,
  total,
  correctCount,
  wrongCount,
  streak,
}: {
  timed: boolean;
  timeLeft: number;
  timerSeconds: number;
  currentIndex: number;
  total: number;
  correctCount: number;
  wrongCount: number;
  streak: number;
}) {
  const timePercent = timed
    ? Math.max(0, Math.min(100, (timeLeft / timerSeconds) * 100))
    : 100;

  const progress =
    total > 0 ? Math.max(0, Math.min(100, ((currentIndex + 1) / total) * 100)) : 0;

  return (
    <div className="mb-5 rounded-[1.7rem] border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div className={`grid gap-2 ${timed ? "grid-cols-5" : "grid-cols-4"}`}>
        <div className="flex min-w-0 items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white px-2 py-3 shadow-sm sm:gap-3 sm:px-3">
          <span className="hidden h-9 w-9 shrink-0 place-items-center rounded-full bg-violet-100 text-violet-600 sm:grid">
            <ClipboardList size={18} />
          </span>
          <div className="min-w-0 text-center sm:text-left">
            <p className="text-[8px] font-black uppercase tracking-[0.08em] text-slate-400 sm:text-[9px]">
              QUESTION
            </p>
            <p className="mt-0.5 text-lg font-black leading-none text-slate-950 sm:text-xl">
              {currentIndex + 1}/{total}
            </p>
          </div>
        </div>

        {timed && (
          <div className="flex min-w-0 items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white px-2 py-3 shadow-sm sm:gap-3 sm:px-3">
            <span className="hidden h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-600 sm:grid">
              <Clock size={18} />
            </span>
            <div className="min-w-0 text-center sm:text-left">
              <p className="text-[8px] font-black uppercase tracking-[0.08em] text-slate-400 sm:text-[9px]">
                TIME
              </p>
              <p className="mt-0.5 text-lg font-black leading-none text-slate-950 sm:text-xl">
                {timeLeft}s
              </p>
            </div>
          </div>
        )}

        <div className="flex min-w-0 items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white px-2 py-3 shadow-sm sm:gap-3 sm:px-3">
          <span className="hidden h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600 sm:grid">
            <CircleCheckBig size={18} />
          </span>
          <div className="min-w-0 text-center sm:text-left">
            <p className="text-[8px] font-black uppercase tracking-[0.08em] text-slate-400 sm:text-[9px]">
              CORRECT
            </p>
            <p className="mt-0.5 text-lg font-black leading-none text-emerald-600 sm:text-xl">
              {correctCount}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white px-2 py-3 shadow-sm sm:gap-3 sm:px-3">
          <span className="hidden h-9 w-9 shrink-0 place-items-center rounded-full bg-red-100 text-red-600 sm:grid">
            <CircleX size={18} />
          </span>
          <div className="min-w-0 text-center sm:text-left">
            <p className="text-[8px] font-black uppercase tracking-[0.08em] text-slate-400 sm:text-[9px]">
              WRONG
            </p>
            <p className="mt-0.5 text-lg font-black leading-none text-red-600 sm:text-xl">
              {wrongCount}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white px-2 py-3 shadow-sm sm:gap-3 sm:px-3">
          <span className="hidden h-9 w-9 shrink-0 place-items-center rounded-full bg-orange-100 text-orange-600 sm:grid">
            <Flame size={19} />
          </span>
          <div className="min-w-0 text-center sm:text-left">
            <p className="text-[8px] font-black uppercase tracking-[0.08em] text-slate-400 sm:text-[9px]">
              STREAK
            </p>
            <p className="mt-0.5 text-lg font-black leading-none text-slate-950 sm:text-xl">
              {streak}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="min-w-9 text-right text-[10px] font-black text-indigo-600">
          {Math.round(progress)}%
        </span>
      </div>

      {timed && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              timeLeft <= 5 ? "bg-red-500" : "bg-yellow-400"
            }`}
            style={{ width: `${timePercent}%` }}
          />
        </div>
      )}
    </div>
  );
}

function ResultScreen({
  t,
  correctCount,
  wrongCount,
  scorePercent,
  bestStreak,
  onPlayAgain,
  onChooseOther,
}: {
  t: typeof text.bm;
  correctCount: number;
  wrongCount: number;
  scorePercent: number;
  bestStreak: number;
  onPlayAgain: () => void;
  onChooseOther: () => void;
}) {
  const resultMessage =
    scorePercent === 100
      ? "Excellent! Perfect score!"
      : scorePercent >= 80
        ? "Great job! You are doing very well."
        : scorePercent >= 50
          ? "Good effort! Keep practising."
          : "Keep trying. You can improve with practice.";

  return (
    <section className="mt-8 overflow-hidden rounded-[2.5rem] border border-indigo-100 bg-white text-center shadow-[0_22px_70px_rgba(79,70,229,0.14)]">
      <div className="bg-gradient-to-br from-indigo-50 via-white to-violet-50 px-6 py-10 sm:px-10">
        <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-[2rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 shadow-[0_18px_45px_rgba(79,70,229,0.35)]">
          <div className="absolute inset-2 rounded-[1.6rem] border border-white/20" />
          <Trophy
            className="relative z-10 fill-white text-white drop-shadow-[0_8px_12px_rgba(15,23,42,0.28)]"
            size={54}
          />
        </div>

        <p className="mt-6 text-sm font-black uppercase tracking-[0.28em] text-violet-500">
          FD Arcadia Achievement
        </p>

        <h2
          className="mt-2 text-5xl font-black text-indigo-700 sm:text-6xl"
          style={QUESTION_FONT_STYLE}
        >
          {t.result}
        </h2>

        <p
          className="mt-4 bg-gradient-to-r from-indigo-700 via-violet-600 to-purple-700 bg-clip-text text-7xl font-black text-transparent sm:text-8xl"
          style={QUESTION_FONT_STYLE}
        >
          {scorePercent}%
        </p>

        <p className="mx-auto mt-3 max-w-xl text-base font-bold text-slate-500 sm:text-lg">
          {resultMessage}
        </p>

        <div className="mx-auto mt-8 grid max-w-2xl gap-4 sm:grid-cols-3">
          <div className="rounded-[1.6rem] border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">
              {t.correctCount}
            </p>
            <p
              className="mt-2 text-4xl font-black text-emerald-700"
              style={QUESTION_FONT_STYLE}
            >
              {correctCount}
            </p>
          </div>

          <div className="rounded-[1.6rem] border border-rose-100 bg-rose-50 p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-500">
              {t.wrongCount}
            </p>
            <p
              className="mt-2 text-4xl font-black text-rose-600"
              style={QUESTION_FONT_STYLE}
            >
              {wrongCount}
            </p>
          </div>

          <div className="rounded-[1.6rem] border border-amber-100 bg-amber-50 p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-600">
              BEST STREAK
            </p>
            <p
              className="mt-2 text-4xl font-black text-amber-700"
              style={QUESTION_FONT_STYLE}
            >
              🔥 {bestStreak}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onPlayAgain}
            className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 font-black text-white shadow-[0_12px_30px_rgba(79,70,229,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(79,70,229,0.32)]"
          >
            {t.playAgain}
          </button>

          <button
            type="button"
            onClick={onChooseOther}
            className="rounded-2xl border border-indigo-200 bg-white px-8 py-4 font-black text-indigo-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-50"
          >
            {t.chooseOther}
          </button>
        </div>
      </div>
    </section>
  );
}

function StatusBox({
  type,
  message,
}: {
  type: "correct" | "wrong";
  message: string;
}) {
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