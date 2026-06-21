"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Languages,
  Trash2,
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
      if (!currentQuestion || timerExpired) return;

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
    setTimeLeft(timerSeconds);
    setTimerExpired(false);
    setTimerRunning(timerEnabled);
  };

  const chooseTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setSelectedFolder("");
    setCurrentIndex(0);
    resetAnswer();
  };

  const chooseFolder = (folder: string) => {
    setSelectedFolder(folder);
    setCurrentIndex(0);
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
    if (timerExpired) return;

    const boxId = selectedBox || editableBoxes[0]?.id;
    if (!boxId) return;

    setAnswers((prev) => ({ ...prev, [boxId]: num }));

    const index = editableBoxes.findIndex((box) => box.id === boxId);
    const nextBox = editableBoxes[index + 1];
    if (nextBox) setSelectedBox(nextBox.id);

    setResult(null);
  };

  const deleteNumber = () => {
    if (timerExpired) return;

    const boxId = selectedBox || editableBoxes[0]?.id;
    if (!boxId) return;

    setAnswers((prev) => ({ ...prev, [boxId]: "" }));
    setResult(null);
  };

  const checkAnswer = async () => {
    if (!currentQuestion || timerExpired) return;

    setTimerRunning(false);

    const answerEntries = Object.entries(currentQuestion.answer_json || {});
    let score = 0;

    answerEntries.forEach(([boxId, correctValue]) => {
      if ((answers[boxId] || "").trim() === String(correctValue).trim()) {
        score += 1;
      }
    });

    const total = answerEntries.length;
    const isCorrect = total > 0 && score === total;

    setResult(isCorrect ? "correct" : "wrong");
    await saveAttempt(score, total);
  };

  const saveAttempt = async (score: number, total: number) => {
    if (!currentQuestion) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from("math_activity_attempts").insert({
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
    });

    if (!error) {
      await loadData();
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
    if (folderQuestions.length === 0) return;
    setCurrentIndex((prev) =>
      prev + 1 >= folderQuestions.length ? 0 : prev + 1
    );
    resetAnswer();
  };

  const previousQuestion = () => {
    if (folderQuestions.length === 0) return;
    setCurrentIndex((prev) =>
      prev - 1 < 0 ? folderQuestions.length - 1 : prev - 1
    );
    resetAnswer();
  };

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
    <main className="min-h-screen bg-[#fffaf0] px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-bold text-slate-700 shadow"
          >
            <ArrowLeft size={18} />
            Back
          </Link>

          <button
            type="button"
            onClick={() => setLanguage(language === "en" ? "bm" : "en")}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 font-bold text-white shadow"
          >
            <Languages size={18} />
            {language === "en" ? "BM" : "EN"}
          </button>
        </div>

        <section className="mb-6 rounded-3xl bg-white p-6 shadow">
          <h1 className="text-center text-4xl font-black text-slate-900">
            {language === "en" ? "Math Activity" : "Aktiviti Matematik"}
          </h1>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {topics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => chooseTopic(topic.id)}
                className={`rounded-3xl border-4 p-5 text-center shadow transition ${
                  selectedTopic === topic.id
                    ? "border-slate-900 bg-slate-900 text-white"
                    : `border-white ${topic.bg} text-slate-900`
                }`}
              >
                <div className="text-xl font-black">
                  {language === "en" ? topic.en : topic.bm}
                </div>

                <div className="text-sm font-bold opacity-70">
                  {language === "en" ? topic.bm : topic.en}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="mb-6 rounded-3xl bg-white p-5 shadow">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                {language === "en" ? "Timer" : "Masa"}
              </h2>

              <p className="text-sm font-bold text-slate-400">
                {language === "en"
                  ? "Optional countdown timer"
                  : "Pilihan timer kiraan masa"}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setTimerEnabled(false)}
                className={`rounded-2xl px-4 py-2 font-black ${
                  !timerEnabled
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                OFF
              </button>

              <button
                type="button"
                onClick={() => setTimerEnabled(true)}
                className={`rounded-2xl px-4 py-2 font-black ${
                  timerEnabled
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                ON
              </button>

              {timerEnabled && (
                <select
                  value={timerSeconds}
                  onChange={(e) => setTimerSeconds(Number(e.target.value))}
                  className="rounded-2xl border px-4 py-2 font-bold"
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

          {timerEnabled && (
            <div className="mt-4 flex flex-col items-center justify-center rounded-2xl bg-orange-50 p-4">
              <div className="flex items-center justify-center gap-2">
                <Clock className="text-orange-600" />
                <span className="text-3xl font-black text-orange-600">
                  {timeLeft}s
                </span>
              </div>

              {timerExpired && (
                <p className="mt-2 font-black text-red-600">
                  {language === "en" ? "Time is up!" : "Masa tamat!"}
                </p>
              )}
            </div>
          )}
        </section>

        <section className="mb-6 rounded-3xl bg-white p-5 shadow">
          <h2 className="mb-3 text-xl font-black text-slate-900">
            {language === "en" ? "Choose Folder" : "Pilih Folder"}
          </h2>

          <div className="flex flex-wrap gap-3">
            {folders.length === 0 && (
              <p className="font-bold text-slate-400">
                {language === "en" ? "No question yet." : "Belum ada soalan."}
              </p>
            )}

            {folders.map((folder) => (
              <button
                key={folder}
                type="button"
                onClick={() => chooseFolder(folder)}
                className={`rounded-2xl px-5 py-3 font-black shadow ${
                  selectedFolder === folder
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {folder}
              </button>
            ))}
          </div>
        </section>

        {!currentQuestion ? (
          <section className="rounded-3xl bg-white p-8 text-center font-bold text-slate-500 shadow">
            {language === "en"
              ? "No question in this folder yet."
              : "Belum ada soalan dalam folder ini."}
          </section>
        ) : (
          <section className={`rounded-3xl p-5 shadow-xl ${topicInfo.bg}`}>
            <div className="rounded-3xl bg-white p-5 shadow">
              <div className="mb-4 text-center">
                <p className="text-lg font-bold text-slate-500">
                  {currentQuestion.mode_label}
                </p>

                <h2 className="text-4xl font-black text-slate-900">
                  {language === "en"
                    ? currentQuestion.title_en
                    : currentQuestion.title_bm}
                </h2>

                <p className="mt-1 text-sm font-bold text-slate-400">
                  {currentIndex + 1} / {folderQuestions.length}
                </p>
              </div>

              <div className="overflow-x-auto rounded-3xl">
                <div className="relative mx-auto min-h-[430px] h-[70vw] max-h-[650px] w-full max-w-[950px] rounded-3xl bg-white">
                  {(currentQuestion.layout_json?.items || []).map((item) => (
                    <ParentLayoutItem
                      key={item.id}
                      item={item}
                      selectedBox={selectedBox}
                      answer={answers[item.id] || ""}
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

            <div className="mt-6 rounded-3xl bg-white p-5 shadow">
              {result === "correct" && (
                <div className="mb-4 flex items-center justify-center gap-2 rounded-2xl bg-green-100 p-3 font-black text-green-700">
                  <CheckCircle2 />
                  {language === "en" ? "Correct!" : "Betul!"}
                </div>
              )}

              {result === "wrong" && (
                <div className="mb-4 flex items-center justify-center gap-2 rounded-2xl bg-red-100 p-3 font-black text-red-700">
                  <XCircle />
                  {timerExpired
                    ? language === "en"
                      ? "Time is up!"
                      : "Masa tamat!"
                    : language === "en"
                    ? "Try again"
                    : "Cuba lagi"}
                </div>
              )}

              <div className="mb-4 rounded-2xl bg-slate-50 p-3 text-center font-bold text-slate-500">
                {language === "en"
                  ? "Tap a box, then type using keyboard or keypad."
                  : "Tekan kotak, kemudian taip guna keyboard atau keypad."}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => pressNumber(num)}
                    disabled={timerExpired}
                    className="rounded-2xl bg-white p-5 text-2xl font-black text-slate-900 shadow ring-1 ring-slate-200 disabled:opacity-50"
                  >
                    {num}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={deleteNumber}
                  disabled={timerExpired}
                  className="rounded-2xl bg-red-100 p-5 font-black text-red-700 shadow disabled:opacity-50"
                >
                  {language === "en" ? "Delete" : "Padam"}
                </button>

                <button
                  type="button"
                  onClick={() => pressNumber("0")}
                  disabled={timerExpired}
                  className="rounded-2xl bg-white p-5 text-2xl font-black text-slate-900 shadow ring-1 ring-slate-200 disabled:opacity-50"
                >
                  0
                </button>

                <button
                  type="button"
                  onClick={checkAnswer}
                  disabled={timerExpired}
                  className="rounded-2xl bg-indigo-600 p-5 font-black text-white shadow disabled:opacity-50"
                >
                  {language === "en" ? "Check & Save" : "Semak & Simpan"}
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={previousQuestion}
                  className="rounded-2xl bg-slate-100 px-5 py-4 font-black text-slate-700 shadow"
                >
                  {language === "en" ? "Previous" : "Sebelum"}
                </button>

                <button
                  type="button"
                  onClick={nextQuestion}
                  className="rounded-2xl bg-slate-900 px-5 py-4 font-black text-white shadow"
                >
                  {language === "en" ? "Next Question" : "Soalan Seterusnya"}
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="mt-8 rounded-3xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-black text-slate-900">
            {language === "en" ? "Play History" : "Sejarah Latihan"}
          </h2>

          {attempts.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-5 font-bold text-slate-400">
              {language === "en" ? "No history yet." : "Belum ada sejarah."}
            </p>
          ) : (
            <div className="space-y-3">
              {attempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex flex-col justify-between gap-3 rounded-2xl bg-slate-50 p-4 shadow-sm sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-black text-slate-900">
                      {language === "en" ? attempt.title_en : attempt.title_bm}
                    </p>

                    <p className="text-sm font-bold text-slate-500">
                      {attempt.mode_label} • {attempt.score}/{attempt.total}
                    </p>

                    <p className="text-sm text-slate-400">
                      {new Date(attempt.created_at).toLocaleString("en-MY", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteAttempt(attempt.id)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-100 px-4 py-2 font-bold text-red-600"
                  >
                    <Trash2 size={18} />
                    {language === "en" ? "Delete" : "Padam"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function ParentLayoutItem({
  item,
  selectedBox,
  answer,
  onSelectBox,
}: {
  item: LayoutItem;
  selectedBox: string;
  answer: string;
  onSelectBox: () => void;
}) {
  if (item.type === "box") {
    const value = item.editable ? answer : item.text || "";

    return (
      <button
        type="button"
        onClick={onSelectBox}
        disabled={!item.editable}
        className={`absolute flex items-center justify-center rounded-xl border-4 font-black shadow ${
          selectedBox === item.id ? "ring-4 ring-indigo-200" : ""
        }`}
        style={{
          left: `${(item.x / 950) * 100}%`,
          top: `${(item.y / 650) * 100}%`,
          width: `${((item.width || 80) / 950) * 100}%`,
          height: `${((item.height || 80) / 650) * 100}%`,
          transform: `rotate(${item.rotation || 0}deg)`,
          borderColor:
            selectedBox === item.id
              ? "#4f46e5"
              : item.borderColor || (item.editable ? "#818cf8" : "#cbd5e1"),
          backgroundColor: item.bgColor || "#ffffff",
          color: item.textColor || "#0f172a",
          fontSize: Math.max((item.height || 80) / 2.5, 20),
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
          left: `${(item.x / 950) * 100}%`,
          top: `${(item.y / 650) * 100}%`,
          width: `${((item.width || 300) / 950) * 100}%`,
          height: item.height || 5,
          transform: `rotate(${item.rotation || 0}deg)`,
          transformOrigin: "left center",
          backgroundColor: item.lineColor || "#3b82f6",
        }}
      />
    );
  }

  if (item.type === "arrow") {
    return (
      <div
        className="absolute"
        style={{
          left: `${(item.x / 950) * 100}%`,
          top: `${(item.y / 650) * 100}%`,
          transform: `rotate(${item.rotation || 0}deg)`,
          color: item.textColor || "#0f172a",
        }}
      >
        {item.direction === "right" ? (
          <ArrowRight size={item.size || 60} />
        ) : (
          <ArrowDown size={item.size || 60} />
        )}
      </div>
    );
  }

  return (
    <div
      className="absolute font-black"
      style={{
        left: item.x,
        top: item.y,
        fontSize: item.size || 40,
        transform: `rotate(${item.rotation || 0}deg)`,
        color: item.textColor || "#0f172a",
      }}
    >
      {item.text}
    </div>
  );
}