"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Delete,
  Languages,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Star,
  Trash2,
  Volume2,
  VolumeX,
  Zap,
  XCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Language = "en" | "bm";
type Topic = "addition" | "subtraction" | "multiplication" | "division";
type ItemType = "box" | "line" | "arrow" | "text";

type LayoutItem = {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  text?: string;
  editable?: boolean;
  size?: number;
  width?: number;
  height?: number;
  rotation?: number;
  direction?: "down" | "right";
  borderColor?: string;
  bgColor?: string;
  textColor?: string;
  lineColor?: string;
};

type MathQuestion = {
  id: string;
  topic: Topic;
  title: string;
  title_en: string;
  title_bm: string;
  mode_label: string;
  is_active: boolean;
  layout_json: { items: LayoutItem[] };
  answer_json: Record<string, string>;
};

type Attempt = {
  id: string;
  question_id: string;
  topic: Topic;
  mode_label: string;
  title_en: string;
  title_bm: string;
  score: number;
  total: number;
  answers: Record<string, string>;
  correct_answers: Record<string, string>;
  created_at: string;
};

const topics: { id: Topic; en: string; bm: string; bg: string }[] = [
  { id: "addition", en: "Addition", bm: "Tambah", bg: "bg-purple-100" },
  { id: "subtraction", en: "Subtraction", bm: "Tolak", bg: "bg-pink-100" },
  { id: "multiplication", en: "Multiplication", bm: "Darab", bg: "bg-yellow-100" },
  { id: "division", en: "Division", bm: "Bahagi", bg: "bg-green-100" },
];

export default function MathActivityPage() {
  const [language, setLanguage] = useState<Language>("en");
  const [selectedTopic, setSelectedTopic] = useState<Topic>("addition");
  const [selectedFolder, setSelectedFolder] = useState("");
  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedBox, setSelectedBox] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [loading, setLoading] = useState(true);

  const [wrongBoxes, setWrongBoxes] = useState<string[]>([]);
  const [checking, setChecking] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [hintVisible, setHintVisible] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [stars, setStars] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionAnswered, setSessionAnswered] = useState(0);
  const [completedQuestionIds, setCompletedQuestionIds] = useState<string[]>([]);
  const [activityComplete, setActivityComplete] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    const { data: questionData, error: questionError } = await supabase
      .from("math_activity_questions")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (questionError) {
      alert(questionError.message);
      setLoading(false);
      return;
    }

    setQuestions((questionData || []) as MathQuestion[]);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: attemptData } = await supabase
        .from("math_activity_attempts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setAttempts((attemptData || []) as Attempt[]);
    }

    setLoading(false);
  };

  const topicQuestions = useMemo(
    () => questions.filter((q) => q.topic === selectedTopic),
    [questions, selectedTopic]
  );

  const folders = useMemo(
    () =>
      Array.from(
        new Set(topicQuestions.map((q) => q.mode_label || "No Folder"))
      ),
    [topicQuestions]
  );

  const folderQuestions = useMemo(
    () =>
      topicQuestions.filter(
        (q) => (q.mode_label || "No Folder") === selectedFolder
      ),
    [topicQuestions, selectedFolder]
  );

  const currentQuestion = folderQuestions[currentIndex];

  const editableBoxes = useMemo(
    () =>
      currentQuestion?.layout_json?.items?.filter(
        (item) => item.type === "box" && item.editable
      ) || [],
    [currentQuestion]
  );

  useEffect(() => {
    setSelectedFolder(folders[0] || "");
    setCurrentIndex(0);
    resetAnswer();
  }, [selectedTopic, folders.join("|")]);

  useEffect(() => {
    if (!selectedBox && editableBoxes.length > 0) {
      setSelectedBox(editableBoxes[0].id);
    }
  }, [editableBoxes, selectedBox]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!currentQuestion || timerExpired || checking || activityComplete) return;

      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        pressNumber(event.key);
      }

      if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        deleteNumber();
      }

      if (event.key === "Enter") {
        event.preventDefault();
        checkAnswer();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        moveToNextBox();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveToPreviousBox();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  useEffect(() => {
    setTimeLeft(timerSeconds);
    setTimerExpired(false);
    setTimerRunning(timerEnabled);
  }, [timerEnabled, timerSeconds, currentQuestion?.id]);

  useEffect(() => {
    if (!timerEnabled || !timerRunning || timerExpired || !currentQuestion) {
      return;
    }

    if (timeLeft <= 0) {
      setTimerExpired(true);
      setTimerRunning(false);
      setResult("wrong");
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timerEnabled, timerRunning, timerExpired, timeLeft, currentQuestion]);

  const resetAnswer = () => {
    setAnswers({});
    setSelectedBox("");
    setResult(null);
    setWrongBoxes([]);
    setRetryCount(0);
    setHintVisible(false);
    setChecking(false);
    setTimeLeft(timerSeconds);
    setTimerExpired(false);
    setTimerRunning(timerEnabled);
  };

  const resetSession = () => {
    setStreak(0);
    setBestStreak(0);
    setStars(0);
    setSessionCorrect(0);
    setSessionAnswered(0);
    setCompletedQuestionIds([]);
    setActivityComplete(false);
  };

  const playTone = (kind: "correct" | "wrong" | "complete") => {
    if (!soundEnabled || typeof window === "undefined") return;

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioContextClass) return;

      const context = new AudioContextClass();
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.type = "sine";
      oscillator.frequency.value =
        kind === "correct" ? 660 : kind === "complete" ? 784 : 220;

      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        context.currentTime + (kind === "complete" ? 0.35 : 0.2),
      );

      oscillator.start();
      oscillator.stop(context.currentTime + (kind === "complete" ? 0.38 : 0.22));
      oscillator.addEventListener("ended", () => void context.close());
    } catch {
      // Audio is optional; activity continues if a browser blocks it.
    }
  };

  const chooseTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setSelectedFolder("");
    setCurrentIndex(0);
    resetSession();
    resetAnswer();
  };

  const chooseFolder = (folder: string) => {
    setSelectedFolder(folder);
    setCurrentIndex(0);
    resetSession();
    resetAnswer();
  };

  const moveToNextBox = () => {
    if (editableBoxes.length === 0 || timerExpired) return;
    const index = editableBoxes.findIndex((box) => box.id === selectedBox);
    const nextIndex =
      index < 0 || index + 1 >= editableBoxes.length ? 0 : index + 1;
    setSelectedBox(editableBoxes[nextIndex].id);
  };

  const moveToPreviousBox = () => {
    if (editableBoxes.length === 0 || timerExpired) return;
    const index = editableBoxes.findIndex((box) => box.id === selectedBox);
    const prevIndex = index <= 0 ? editableBoxes.length - 1 : index - 1;
    setSelectedBox(editableBoxes[prevIndex].id);
  };

  const pressNumber = (num: string) => {
    if (timerExpired || checking || activityComplete) return;

    const boxId = selectedBox || editableBoxes[0]?.id;
    if (!boxId) return;

    setAnswers((prev) => ({ ...prev, [boxId]: num }));
    setWrongBoxes((prev) => prev.filter((id) => id !== boxId));

    const index = editableBoxes.findIndex((box) => box.id === boxId);
    const nextBox = editableBoxes[index + 1];
    if (nextBox) setSelectedBox(nextBox.id);

    setResult(null);
  };

  const deleteNumber = () => {
    if (timerExpired || checking || activityComplete) return;

    const boxId = selectedBox || editableBoxes[0]?.id;
    if (!boxId) return;

    setAnswers((prev) => ({ ...prev, [boxId]: "" }));
    setWrongBoxes((prev) => prev.filter((id) => id !== boxId));
    setResult(null);
  };

  const checkAnswer = async () => {
    if (!currentQuestion || timerExpired || checking || activityComplete) return;

    const answerEntries = Object.entries(currentQuestion.answer_json || {});
    if (answerEntries.length === 0) return;

    setChecking(true);
    setTimerRunning(false);

    let score = 0;
    const incorrectIds: string[] = [];

    answerEntries.forEach(([boxId, correctValue]) => {
      const isBoxCorrect =
        (answers[boxId] || "").trim() === String(correctValue).trim();

      if (isBoxCorrect) {
        score += 1;
      } else {
        incorrectIds.push(boxId);
      }
    });

    const total = answerEntries.length;
    const isCorrect = score === total;

    setWrongBoxes(incorrectIds);
    setResult(isCorrect ? "correct" : "wrong");

    if (!isCorrect) {
      const nextRetry = retryCount + 1;
      setRetryCount(nextRetry);
      setStreak(0);
      if (nextRetry >= 2) setHintVisible(true);
      playTone("wrong");
      await saveAttempt(score, total);
      setChecking(false);
      if (timerEnabled) setTimerRunning(true);
      return;
    }

    const firstCompletion = !completedQuestionIds.includes(currentQuestion.id);
    const earnedStars = retryCount === 0 ? 3 : retryCount === 1 ? 2 : 1;
    const nextStreak = streak + 1;

    if (firstCompletion) {
      setCompletedQuestionIds((prev) => [...prev, currentQuestion.id]);
      setSessionCorrect((prev) => prev + 1);
      setSessionAnswered((prev) => prev + 1);
      setStars((prev) => prev + earnedStars);
      setStreak(nextStreak);
      setBestStreak((prev) => Math.max(prev, nextStreak));
    }

    playTone("correct");
    await saveAttempt(score, total);

    window.setTimeout(() => {
      if (currentIndex + 1 >= folderQuestions.length) {
        setActivityComplete(true);
        setTimerRunning(false);
        playTone("complete");
        setChecking(false);
        return;
      }

      setCurrentIndex((prev) => prev + 1);
      resetAnswer();
    }, 900);
  };

  const saveAttempt = async (score: number, total: number) => {
    if (!currentQuestion) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const payload = {
      user_id: user.id,
      question_id: currentQuestion.id,
      topic: currentQuestion.topic,
      mode_label: currentQuestion.mode_label,
      title_en: currentQuestion.title_en,
      title_bm: currentQuestion.title_bm,
      score,
      total,
      answers,
      correct_answers: currentQuestion.answer_json || {},
    };

    const { data, error } = await supabase
      .from("math_activity_attempts")
      .insert(payload)
      .select("*")
      .single();

    if (!error && data) {
      setAttempts((prev) => [data as Attempt, ...prev]);
    }
  };

  const deleteAttempt = async (id: string) => {
    const yes = confirm(
      language === "en" ? "Delete this history?" : "Padam sejarah ini?"
    );

    if (!yes) return;

    const { error } = await supabase
      .from("math_activity_attempts")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setAttempts((prev) => prev.filter((item) => item.id !== id));
  };

  const nextQuestion = () => {
    if (folderQuestions.length === 0 || checking) return;

    if (currentIndex + 1 >= folderQuestions.length) {
      setActivityComplete(true);
      setTimerRunning(false);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    resetAnswer();
  };

  const previousQuestion = () => {
    if (folderQuestions.length === 0 || checking) return;
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    resetAnswer();
  };

  const restartActivity = () => {
    setCurrentIndex(0);
    resetSession();
    resetAnswer();
  };

  const sessionProgress =
    folderQuestions.length > 0
      ? Math.round((completedQuestionIds.length / folderQuestions.length) * 100)
      : 0;

  const sessionAccuracy =
    sessionAnswered > 0
      ? Math.round((sessionCorrect / sessionAnswered) * 100)
      : 0;

  const topicInfo =
    topics.find((topic) => topic.id === selectedTopic) || topics[0];

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fffaf0] p-6">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 text-center font-black shadow">
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-[#f5f7fb] text-slate-950">
      {/* COMPACT APP BAR */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-3 py-3 sm:px-5 lg:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href="/dashboard"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={19} />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="hidden h-8 w-8 place-items-center rounded-xl bg-indigo-600 text-white sm:grid">
                  <Sparkles size={16} />
                </div>
                <h1 className="truncate text-base font-black sm:text-lg">
                  {language === "en" ? "Math Activity" : "Aktiviti Matematik"}
                </h1>
              </div>
              <p className="hidden text-[11px] font-bold text-slate-400 sm:block">
                FD Arcadia Learning Hub
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {timerEnabled && currentQuestion && (
              <div
                className={`inline-flex h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-black ${
                  timeLeft <= 10
                    ? "bg-red-50 text-red-600"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                <Clock size={15} />
                {timeLeft}s
              </div>
            )}

            <button
              type="button"
              onClick={() => setSoundEnabled((prev) => !prev)}
              className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
              aria-label={soundEnabled ? "Mute sound" : "Enable sound"}
            >
              {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
            </button>

            <button
              type="button"
              onClick={() => setLanguage(language === "en" ? "bm" : "en")}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-3.5 text-xs font-black text-white shadow-sm sm:px-4"
            >
              <Languages size={16} />
              {language === "en" ? "BM" : "EN"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-3 py-4 sm:px-5 lg:px-8">
        {/* TOPIC + SETTINGS: horizontal on tablet so it does not consume the whole screen */}
        <section className="rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {topics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => chooseTopic(topic.id)}
                className={`min-w-[116px] flex-1 rounded-2xl border px-4 py-3 text-left transition sm:min-w-[135px] ${
                  selectedTopic === topic.id
                    ? "border-slate-950 bg-slate-950 text-white shadow-lg"
                    : "border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100"
                }`}
              >
                <p className="text-sm font-black">
                  {language === "en" ? topic.en : topic.bm}
                </p>
                <p className={`mt-0.5 text-[10px] font-bold ${
                  selectedTopic === topic.id ? "text-slate-400" : "text-slate-400"
                }`}>
                  {language === "en" ? topic.bm : topic.en}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-col gap-3 border-t border-slate-100 pt-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {folders.length === 0 ? (
                <span className="px-2 py-2 text-xs font-bold text-slate-400">
                  {language === "en" ? "No question yet." : "Belum ada soalan."}
                </span>
              ) : (
                folders.map((folder) => (
                  <button
                    key={folder}
                    type="button"
                    onClick={() => chooseFolder(folder)}
                    className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-black transition ${
                      selectedFolder === folder
                        ? "bg-indigo-600 text-white"
                        : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                    }`}
                  >
                    {folder}
                  </button>
                ))
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className="hidden text-[10px] font-black uppercase tracking-wider text-slate-400 sm:inline">
                {language === "en" ? "Timer" : "Masa"}
              </span>
              <button
                type="button"
                onClick={() => setTimerEnabled(false)}
                className={`rounded-xl px-3 py-2 text-xs font-black ${
                  !timerEnabled ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                OFF
              </button>
              <button
                type="button"
                onClick={() => setTimerEnabled(true)}
                className={`rounded-xl px-3 py-2 text-xs font-black ${
                  timerEnabled ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                ON
              </button>
              {timerEnabled && (
                <select
                  value={timerSeconds}
                  onChange={(e) => setTimerSeconds(Number(e.target.value))}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-2 text-xs font-black outline-none"
                >
                  <option value={30}>30s</option>
                  <option value={60}>60s</option>
                  <option value={90}>90s</option>
                  <option value={120}>120s</option>
                  <option value={180}>180s</option>
                </select>
              )}
            </div>
          </div>
        </section>

        {currentQuestion && !activityComplete && (
          <section className="mt-4 rounded-[22px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-[170px] flex-1">
                <div className="mb-1.5 flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <span>
                    {language === "en" ? "Activity Progress" : "Progress Aktiviti"}
                  </span>
                  <span>{sessionProgress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${sessionProgress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <SessionBadge
                  icon={<CheckCircle2 size={14} />}
                  value={`${sessionCorrect}`}
                  label={language === "en" ? "Correct" : "Betul"}
                />
                <SessionBadge
                  icon={<Zap size={14} />}
                  value={`${streak}`}
                  label="Streak"
                />
                <SessionBadge
                  icon={<Star size={14} />}
                  value={`${stars}`}
                  label="Stars"
                />
              </div>
            </div>
          </section>
        )}

        {activityComplete ? (
          <ActivityCompleteCard
            language={language}
            correct={sessionCorrect}
            total={folderQuestions.length}
            accuracy={sessionAccuracy}
            stars={stars}
            bestStreak={bestStreak}
            onRestart={restartActivity}
            onChooseAnother={() => {
              setActivityComplete(false);
              resetSession();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        ) : !currentQuestion ? (
          <section className="mt-4 grid min-h-[55dvh] place-items-center rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div>
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-2xl">
                ➗
              </div>
              <h2 className="mt-4 text-xl font-black">
                {language === "en" ? "No question available" : "Tiada soalan tersedia"}
              </h2>
              <p className="mt-2 text-sm font-semibold text-slate-400">
                {language === "en"
                  ? "Choose another topic or folder."
                  : "Pilih topik atau folder yang lain."}
              </p>
            </div>
          </section>
        ) : (
          <>
            {/* MAIN STUDENT WORKSPACE */}
            <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
              <div className="min-w-0 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_15px_50px_rgba(15,23,42,0.08)]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-500">
                      {currentQuestion.mode_label}
                    </p>
                    <h2 className="mt-1 truncate text-lg font-black sm:text-xl">
                      {language === "en"
                        ? currentQuestion.title_en
                        : currentQuestion.title_bm}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">
                      {currentIndex + 1} / {folderQuestions.length}
                    </span>
                    <button
                      type="button"
                      onClick={previousQuestion}
                      className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
                      aria-label="Previous question"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={nextQuestion}
                      className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white transition hover:bg-slate-800"
                      aria-label="Next question"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                {/* Fixed aspect ratio = no giant 70vw canvas and no horizontal scrolling on iPad */}
                <div className="p-2 sm:p-4">
                  <div className="mx-auto w-full max-w-[950px]">
                    <div
                      className="relative w-full overflow-hidden rounded-[22px] bg-white ring-1 ring-slate-100"
                      style={{ aspectRatio: "950 / 650" }}
                    >
                      {(currentQuestion.layout_json?.items || []).map((item) => (
                        <ParentLayoutItem
                          key={item.id}
                          item={item}
                          selectedBox={selectedBox}
                          answer={answers[item.id] || ""}
                          isWrong={wrongBoxes.includes(item.id)}
                          showHint={hintVisible && wrongBoxes.includes(item.id)}
                          onSelectBox={() => {
                            if (
                              item.type === "box" &&
                              item.editable &&
                              !timerExpired
                            ) {
                              setSelectedBox(item.id);
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mobile/iPad keypad is directly under the worksheet */}
                <div className="border-t border-slate-100 bg-slate-50/70 p-3 xl:hidden">
                  <StudentKeypad
                    language={language}
                    timerExpired={timerExpired}
                    result={result}
                    checking={checking}
                    retryCount={retryCount}
                    hintVisible={hintVisible}
                    onHint={() => setHintVisible(true)}
                    onNumber={pressNumber}
                    onDelete={deleteNumber}
                    onCheck={checkAnswer}
                  />
                </div>
              </div>

              {/* Desktop side keypad; on iPad/mobile it moves under worksheet */}
              <aside className="hidden xl:block">
                <div className="sticky top-[84px] rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
                  <StudentKeypad
                    language={language}
                    timerExpired={timerExpired}
                    result={result}
                    checking={checking}
                    retryCount={retryCount}
                    hintVisible={hintVisible}
                    onHint={() => setHintVisible(true)}
                    onNumber={pressNumber}
                    onDelete={deleteNumber}
                    onCheck={checkAnswer}
                  />

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={previousQuestion}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-3 text-xs font-black text-slate-700"
                    >
                      <ChevronLeft size={15} />
                      {language === "en" ? "Previous" : "Sebelum"}
                    </button>
                    <button
                      type="button"
                      onClick={nextQuestion}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 py-3 text-xs font-black text-white"
                    >
                      {language === "en" ? "Next" : "Seterusnya"}
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              </aside>
            </section>

            {/* Tablet/mobile bottom navigation stays close to the exercise */}
            <div className="mt-3 grid grid-cols-2 gap-2 xl:hidden">
              <button
                type="button"
                onClick={previousQuestion}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm"
              >
                <ChevronLeft size={17} />
                {language === "en" ? "Previous" : "Sebelum"}
              </button>
              <button
                type="button"
                onClick={nextQuestion}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-black text-white shadow-sm"
              >
                {language === "en" ? "Next Question" : "Soalan Seterusnya"}
                <ChevronRight size={17} />
              </button>
            </div>
          </>
        )}

        {/* HISTORY: collapsed visually below the learning area, not competing with the task */}
        <details className="mt-6 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
            <div>
              <p className="text-sm font-black">
                {language === "en" ? "Play History" : "Sejarah Latihan"}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
                {attempts.length} {language === "en" ? "saved attempts" : "latihan disimpan"}
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-500">
              {language === "en" ? "View" : "Lihat"}
            </span>
          </summary>

          <div className="border-t border-slate-100 p-4">
            {attempts.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-400">
                {language === "en" ? "No history yet." : "Belum ada sejarah."}
              </p>
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {attempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black">
                        {language === "en" ? attempt.title_en : attempt.title_bm}
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        {attempt.mode_label} • {attempt.score}/{attempt.total}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        {new Date(attempt.created_at).toLocaleString("en-MY", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteAttempt(attempt.id)}
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
                      aria-label="Delete attempt"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </details>
      </div>
    </main>
  );
}

function StudentKeypad({
  language,
  timerExpired,
  result,
  checking,
  retryCount,
  hintVisible,
  onHint,
  onNumber,
  onDelete,
  onCheck,
}: {
  language: Language;
  timerExpired: boolean;
  result: "correct" | "wrong" | null;
  checking: boolean;
  retryCount: number;
  hintVisible: boolean;
  onHint: () => void;
  onNumber: (num: string) => void;
  onDelete: () => void;
  onCheck: () => void;
}) {
  const disabled = timerExpired || checking;

  return (
    <div>
      {result === "correct" && (
        <div className="mb-3 flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">
          <CheckCircle2 size={18} />
          {language === "en" ? "Correct! Next question..." : "Betul! Soalan seterusnya..."}
        </div>
      )}

      {result === "wrong" && (
        <div className="mb-3 rounded-2xl bg-red-50 px-4 py-3 text-center text-sm font-black text-red-700">
          <div className="flex items-center justify-center gap-2">
            <XCircle size={18} />
            {timerExpired
              ? language === "en"
                ? "Time is up!"
                : "Masa tamat!"
              : language === "en"
                ? "Almost! Check the red box."
                : "Hampir! Semak kotak merah."}
          </div>
        </div>
      )}

      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold text-slate-400">
          {language === "en"
            ? "Tap an answer box, then tap the numbers."
            : "Tekan kotak jawapan, kemudian tekan nombor."}
        </p>

        {result === "wrong" && retryCount >= 2 && (
          <button
            type="button"
            onClick={onHint}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-black ${
              hintVisible
                ? "bg-amber-100 text-amber-800"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            <Lightbulb size={14} />
            {language === "en" ? "Hint" : "Petunjuk"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2 xl:grid-cols-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onNumber(num)}
            disabled={disabled}
            className="min-h-12 rounded-xl border border-slate-200 bg-white text-xl font-black text-slate-950 shadow-sm transition active:scale-95 disabled:opacity-40 sm:min-h-14 xl:min-h-14"
          >
            {num}
          </button>
        ))}

        <button
          type="button"
          onClick={onDelete}
          disabled={disabled}
          className="flex min-h-12 items-center justify-center rounded-xl bg-red-50 font-black text-red-600 transition active:scale-95 disabled:opacity-40 sm:min-h-14"
          aria-label={language === "en" ? "Delete" : "Padam"}
        >
          <Delete size={19} />
        </button>

        <button
          type="button"
          onClick={() => onNumber("0")}
          disabled={disabled}
          className="min-h-12 rounded-xl border border-slate-200 bg-white text-xl font-black text-slate-950 shadow-sm transition active:scale-95 disabled:opacity-40 sm:min-h-14"
        >
          0
        </button>

        <button
          type="button"
          onClick={onCheck}
          disabled={disabled}
          className="col-span-4 min-h-12 rounded-xl bg-indigo-600 px-4 text-sm font-black text-white shadow-lg shadow-indigo-100 transition active:scale-[0.99] disabled:opacity-40 xl:col-span-1 xl:min-h-14"
        >
          {checking
            ? language === "en"
              ? "Checking..."
              : "Menyemak..."
            : language === "en"
              ? "Check Answer"
              : "Semak Jawapan"}
        </button>
      </div>
    </div>
  );
}

function SessionBadge({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex min-w-[76px] items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
      <span className="text-indigo-600">{icon}</span>
      <div>
        <p className="text-sm font-black leading-none text-slate-950">{value}</p>
        <p className="mt-1 text-[9px] font-black uppercase tracking-wider text-slate-400">
          {label}
        </p>
      </div>
    </div>
  );
}

function ActivityCompleteCard({
  language,
  correct,
  total,
  accuracy,
  stars,
  bestStreak,
  onRestart,
  onChooseAnother,
}: {
  language: Language;
  correct: number;
  total: number;
  accuracy: number;
  stars: number;
  bestStreak: number;
  onRestart: () => void;
  onChooseAnother: () => void;
}) {
  const perfect = total > 0 && correct === total;

  return (
    <section className="relative mt-4 overflow-hidden rounded-[32px] border border-slate-200 bg-white px-5 py-10 text-center shadow-[0_20px_70px_rgba(15,23,42,0.1)] sm:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-amber-400" />

      <div className="mx-auto grid h-20 w-20 place-items-center rounded-[28px] bg-indigo-50 text-4xl">
        {perfect ? "🏆" : "🌟"}
      </div>

      <p className="mt-5 text-[11px] font-black uppercase tracking-[0.22em] text-indigo-500">
        {language === "en" ? "Activity Complete" : "Aktiviti Selesai"}
      </p>
      <h2 className="mt-2 text-3xl font-black text-slate-950">
        {perfect
          ? language === "en"
            ? "Excellent work!"
            : "Cemerlang!"
          : language === "en"
            ? "Great effort!"
            : "Syabas!"}
      </h2>

      <div className="mx-auto mt-7 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
        <ResultStat value={`${correct}/${total}`} label={language === "en" ? "Correct" : "Betul"} />
        <ResultStat value={`${accuracy}%`} label="Accuracy" />
        <ResultStat value={`⭐ ${stars}`} label="Stars" />
        <ResultStat value={`🔥 ${bestStreak}`} label="Best Streak" />
      </div>

      {perfect && (
        <div className="mx-auto mt-6 max-w-lg rounded-2xl bg-emerald-50 px-5 py-4 text-sm font-black text-emerald-700">
          🎉 {language === "en"
            ? "100% complete — fantastic!"
            : "100% selesai — sangat bagus!"}
        </div>
      )}

      <div className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white"
        >
          <RotateCcw size={17} />
          {language === "en" ? "Play Again" : "Cuba Lagi"}
        </button>
        <button
          type="button"
          onClick={onChooseAnother}
          className="flex-1 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-black text-slate-700"
        >
          {language === "en" ? "Choose Another Activity" : "Pilih Aktiviti Lain"}
        </button>
      </div>
    </section>
  );
}

function ResultStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-4">
      <p className="text-xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>
    </div>
  );
}


function ParentLayoutItem({
  item,
  selectedBox,
  answer,
  isWrong,
  showHint,
  onSelectBox,
}: {
  item: LayoutItem;
  selectedBox: string;
  answer: string;
  isWrong: boolean;
  showHint: boolean;
  onSelectBox: () => void;
}) {
  // Everything is positioned as a percentage of the original 950×650 editor.
  // This makes the worksheet shrink cleanly to iPad/phone without horizontal scroll.
  const left = `${(item.x / 950) * 100}%`;
  const top = `${(item.y / 650) * 100}%`;

  if (item.type === "box") {
    const value = item.editable ? answer : item.text || "";
    const width = `${((item.width || 80) / 950) * 100}%`;
    const height = `${((item.height || 80) / 650) * 100}%`;

    return (
      <button
        type="button"
        onClick={onSelectBox}
        disabled={!item.editable}
        className={`absolute flex items-center justify-center rounded-[clamp(4px,1vw,12px)] border-[clamp(2px,0.4vw,4px)] font-black shadow-sm transition ${
          selectedBox === item.id && item.editable
            ? "z-10 ring-[clamp(2px,0.5vw,5px)] ring-indigo-200"
            : ""
        }`}
        style={{
          left,
          top,
          width,
          height,
          transform: `rotate(${item.rotation || 0}deg)`,
          borderColor: isWrong
            ? "#ef4444"
            : showHint
              ? "#f59e0b"
              : selectedBox === item.id
                ? "#4f46e5"
                : item.borderColor || (item.editable ? "#818cf8" : "#cbd5e1"),
          backgroundColor: isWrong
            ? "#fef2f2"
            : showHint
              ? "#fffbeb"
              : item.bgColor || "#ffffff",
          color: item.textColor || "#0f172a",
          fontSize: `clamp(12px, ${Math.max((item.height || 80) / 2.5, 20) / 9.5}vw, ${Math.max((item.height || 80) / 2.5, 20)}px)`,
        }}
      >
        {value}
      </button>
    );
  }

  if (item.type === "line") {
    return (
      <div
        className="absolute rounded-full"
        style={{
          left,
          top,
          width: `${((item.width || 300) / 950) * 100}%`,
          height: `clamp(2px, ${((item.height || 5) / 650) * 100}%, ${item.height || 5}px)`,
          transform: `rotate(${item.rotation || 0}deg)`,
          transformOrigin: "left center",
          backgroundColor: item.lineColor || "#3b82f6",
        }}
      />
    );
  }

  if (item.type === "arrow") {
    const arrowSize = item.size || 60;
    return (
      <div
        className="absolute"
        style={{
          left,
          top,
          transform: `rotate(${item.rotation || 0}deg) scale(clamp(0.45, 0.75vw, 1))`,
          transformOrigin: "top left",
          color: item.textColor || "#0f172a",
        }}
      >
        {item.direction === "right" ? (
          <ArrowRight size={arrowSize} />
        ) : (
          <ArrowDown size={arrowSize} />
        )}
      </div>
    );
  }

  return (
    <div
      className="absolute whitespace-nowrap font-black"
      style={{
        left,
        top,
        fontSize: `clamp(10px, ${(item.size || 40) / 9.5}vw, ${item.size || 40}px)`,
        transform: `rotate(${item.rotation || 0}deg)`,
        transformOrigin: "top left",
        color: item.textColor || "#0f172a",
      }}
    >
      {item.text}
    </div>
  );
}
