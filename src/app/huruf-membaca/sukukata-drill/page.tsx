"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Feedback = "correct" | "wrong" | null;

type Consonant = {
  letter: string;
  color: string;
  border: string;
  background: string;
};

type Question = {
  consonant: string;
  vowel: string;
  answer: string;
};

const VOWELS = ["a", "i", "u", "e", "o", "e'"];

const CONSONANTS: Consonant[] = [
  {
    letter: "b",
    color: "#db2777",
    border: "#f9a8d4",
    background: "#fff1f7",
  },
  {
    letter: "c",
    color: "#ea580c",
    border: "#fdba74",
    background: "#fff7ed",
  },
  {
    letter: "d",
    color: "#ca8a04",
    border: "#fde68a",
    background: "#fefce8",
  },
  {
    letter: "f",
    color: "#d97706",
    border: "#fde68a",
    background: "#fffbeb",
  },
  {
    letter: "g",
    color: "#4d7c0f",
    border: "#bef264",
    background: "#f7fee7",
  },
  {
    letter: "h",
    color: "#059669",
    border: "#99f6e4",
    background: "#ecfdf5",
  },
  {
    letter: "j",
    color: "#0f766e",
    border: "#99f6e4",
    background: "#f0fdfa",
  },
  {
    letter: "k",
    color: "#0284c7",
    border: "#bae6fd",
    background: "#f0f9ff",
  },
  {
    letter: "l",
    color: "#2563eb",
    border: "#bfdbfe",
    background: "#eff6ff",
  },
  {
    letter: "m",
    color: "#7c3aed",
    border: "#ddd6fe",
    background: "#f5f3ff",
  },
  {
    letter: "n",
    color: "#9333ea",
    border: "#e9d5ff",
    background: "#faf5ff",
  },
  {
    letter: "p",
    color: "#c026d3",
    border: "#f5d0fe",
    background: "#fdf4ff",
  },
  {
    letter: "r",
    color: "#db2777",
    border: "#fbcfe8",
    background: "#fdf2f8",
  },
  {
    letter: "s",
    color: "#e11d48",
    border: "#fecdd3",
    background: "#fff1f2",
  },
  {
    letter: "t",
    color: "#dc2626",
    border: "#fecaca",
    background: "#fef2f2",
  },
  {
    letter: "v",
    color: "#0891b2",
    border: "#a5f3fc",
    background: "#ecfeff",
  },
  {
    letter: "w",
    color: "#0369a1",
    border: "#bae6fd",
    background: "#f0f9ff",
  },
  {
    letter: "y",
    color: "#6d28d9",
    border: "#ddd6fe",
    background: "#f5f3ff",
  },
  {
    letter: "z",
    color: "#a21caf",
    border: "#f5d0fe",
    background: "#fdf4ff",
  },
];

const KEYBOARD_ROWS: string[][] = [
  ["a", "b", "c", "d", "e", "f"],
  ["g", "h", "i", "j", "k", "l"],
  ["m", "n", "o", "p", "q", "r"],
  ["s", "t", "u", "v", "w", "x"],
  ["y", "z"],
];

function shuffle<T>(items: T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    const temporary = result[i];
    result[i] = result[randomIndex];
    result[randomIndex] = temporary;
  }

  return result;
}

function createQuestions(consonant: string): Question[] {
  const firstRound = shuffle(VOWELS);
  const secondRound = shuffle(VOWELS);

  return [...firstRound, ...secondRound].map((vowel) => ({
    consonant,
    vowel,
    answer: `${consonant}${vowel}`,
  }));
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  if (minutes === 0) {
    return `${remaining}s`;
  }

  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

export default function SukuKataDrillPage() {
  const [selectedConsonant, setSelectedConsonant] = useState("b");

  const [questions, setQuestions] = useState<Question[]>(() =>
    createQuestions("b")
  );

  const [questionIndex, setQuestionIndex] = useState(0);

  const [answer, setAnswer] = useState("");

  const [time, setTime] = useState(0);

  const [correct, setCorrect] = useState(0);

  const [wrong, setWrong] = useState(0);

  const [streak, setStreak] = useState(0);

  const [feedback, setFeedback] = useState<Feedback>(null);

  const [checking, setChecking] = useState(false);

  const [finished, setFinished] = useState(false);

  const currentQuestion = questions[questionIndex];

  const currentConsonant = useMemo(() => {
    return (
      CONSONANTS.find(
        (item) => item.letter === selectedConsonant
      ) ?? CONSONANTS[0]
    );
  }, [selectedConsonant]);

  const progress = useMemo(() => {
    if (questions.length === 0) {
      return 0;
    }

    return Math.round(
      ((questionIndex + 1) / questions.length) * 100
    );
  }, [questionIndex, questions.length]);

  /*
   * TIMER
   */
  useEffect(() => {
    if (finished) {
      return;
    }

    const timer = window.setInterval(() => {
      setTime((previous) => previous + 1);
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [finished]);

  /*
   * LOAD CONSONANT
   */
  const loadConsonant = useCallback((letter: string) => {
    setSelectedConsonant(letter);
    setQuestions(createQuestions(letter));
    setQuestionIndex(0);
    setAnswer("");
    setTime(0);
    setCorrect(0);
    setWrong(0);
    setStreak(0);
    setFeedback(null);
    setChecking(false);
    setFinished(false);
  }, []);

  /*
   * TYPE CHARACTER
   */
  const typeCharacter = useCallback(
    (character: string) => {
      if (finished || checking) {
        return;
      }

      setAnswer((previous) => {
        if (previous.length >= 4) {
          return previous;
        }

        return `${previous}${character}`;
      });
    },
    [finished, checking]
  );

  /*
   * DELETE CHARACTER
   */
  const deleteCharacter = useCallback(() => {
    if (finished || checking) {
      return;
    }

    setAnswer((previous) => previous.slice(0, -1));
  }, [finished, checking]);

  /*
   * NEXT QUESTION
   */
  const nextQuestion = useCallback(() => {
    setFeedback(null);
    setAnswer("");
    setChecking(false);

    if (questionIndex >= questions.length - 1) {
      setFinished(true);
      return;
    }

    setQuestionIndex((previous) => previous + 1);
  }, [questionIndex, questions.length]);

  /*
   * CHECK ANSWER
   */
  const checkAnswer = useCallback(() => {
    if (!currentQuestion) {
      return;
    }

    if (finished || checking) {
      return;
    }

    if (!answer.trim()) {
      return;
    }

    setChecking(true);

    const userAnswer = answer.trim().toLowerCase();

    const correctAnswer = currentQuestion.answer.toLowerCase();

    if (userAnswer === correctAnswer) {
      setFeedback("correct");

      setCorrect((previous) => previous + 1);

      setStreak((previous) => previous + 1);

      window.setTimeout(() => {
        nextQuestion();
      }, 650);
    } else {
      setFeedback("wrong");

      setWrong((previous) => previous + 1);

      setStreak(0);

      window.setTimeout(() => {
        setFeedback(null);
        setAnswer("");
        setChecking(false);
      }, 900);
    }
  }, [
    answer,
    checking,
    currentQuestion,
    finished,
    nextQuestion,
  ]);

  /*
   * COMPUTER KEYBOARD
   *
   * Support:
   * A-Z
   * '
   * Backspace
   * Enter
   */
  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        checkAnswer();
        return;
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        deleteCharacter();
        return;
      }

      if (/^[a-zA-Z]$/.test(event.key)) {
        event.preventDefault();
        typeCharacter(event.key.toLowerCase());
        return;
      }

      if (event.key === "'") {
        event.preventDefault();
        typeCharacter("'");
      }
    };

    window.addEventListener("keydown", handleKeyboard);

    return () => {
      window.removeEventListener("keydown", handleKeyboard);
    };
  }, [checkAnswer, deleteCharacter, typeCharacter]);

  /*
   * PREVIOUS
   */
  const previousQuestion = () => {
    if (finished) {
      return;
    }

    if (questionIndex <= 0) {
      return;
    }

    setQuestionIndex((previous) => previous - 1);
    setAnswer("");
    setFeedback(null);
    setChecking(false);
  };

  /*
   * RESTART
   */
  const restart = () => {
    loadConsonant(selectedConsonant);
  };

  /*
   * NEXT CONSONANT
   */
  const nextConsonant = () => {
    const currentIndex = CONSONANTS.findIndex(
      (item) => item.letter === selectedConsonant
    );

    const nextIndex =
      currentIndex >= CONSONANTS.length - 1
        ? 0
        : currentIndex + 1;

    loadConsonant(CONSONANTS[nextIndex].letter);
  };

  return (
    <main className="min-h-screen bg-white px-3 py-4 sm:px-5 md:px-7 lg:px-10">
      <div className="mx-auto max-w-[1550px]">

        {/* ==========================================================
            TOP STATS
        ========================================================== */}

        <section className="rounded-[28px] border border-[#E5E8F0] bg-white p-3 shadow-[0_8px_30px_rgba(20,25,60,0.06)] sm:p-5">

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">

            <StatCard
              icon="▣"
              label="QUESTION"
              value={`${Math.min(
                questionIndex + 1,
                questions.length
              )}/${questions.length}`}
              background="#F0E9FF"
              color="#7547F5"
            />

            <StatCard
              icon="◷"
              label="TIME"
              value={formatTime(time)}
              background="#E9F3FF"
              color="#3985E9"
            />

            <StatCard
              icon="✓"
              label="CORRECT"
              value={String(correct)}
              background="#E1FAEE"
              color="#0DAA6B"
            />

            <StatCard
              icon="×"
              label="WRONG"
              value={String(wrong)}
              background="#FFE7E8"
              color="#EF3038"
            />

            <StatCard
              icon="♨"
              label="STREAK"
              value={String(streak)}
              background="#FFF0D9"
              color="#F58220"
            />

          </div>

          {/* PROGRESS */}

          <div className="mt-4">

            <div className="h-[10px] overflow-hidden rounded-full bg-[#F1F1F5]">
              <div
                className="h-full rounded-full bg-[#7138F5] transition-all duration-300"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <div className="mt-3 h-[7px] overflow-hidden rounded-full bg-[#F4F4F6]">
              <div
                className="h-full rounded-full bg-[#F9C400] transition-all duration-300"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <div className="mt-1 flex justify-end">
              <span className="text-xs font-semibold text-[#6D4BDE]">
                {progress}%
              </span>
            </div>

          </div>
        </section>

        {/* ==========================================================
            GAME
        ========================================================== */}

        {!finished ? (
          <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.65fr_1fr]">

            {/* ======================================================
                QUESTION CARD
            ====================================================== */}

            <div className="relative min-h-[500px] overflow-hidden rounded-[34px] bg-[#0B0C35] p-6 shadow-[0_15px_45px_rgba(14,15,65,0.16)] sm:p-10">

              <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#24255E]" />

              <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-[#17184C]" />

              <div className="relative z-10">

                <p className="text-center text-xs font-medium tracking-[0.2em] text-white/60 sm:text-sm">
                  SUKUKATA-DRILL
                </p>

                {/* EQUATION */}

                <div className="mt-8 flex items-center justify-center gap-2 sm:gap-7">

                  {/* CONSONANT */}

                  <div className="flex h-[105px] w-[90px] items-center justify-center rounded-[22px] bg-white shadow-lg sm:h-[145px] sm:w-[130px]">

                    <span
                      className="text-[65px] font-light leading-none sm:text-[92px]"
                      style={{
                        color: currentConsonant.color,
                      }}
                    >
                      {currentQuestion?.consonant}
                    </span>

                  </div>

                  <span className="text-4xl font-light text-white sm:text-6xl">
                    +
                  </span>

                  {/* VOWEL */}

                  <div className="flex h-[105px] w-[90px] items-center justify-center rounded-[22px] bg-[#FFF3F6] shadow-lg sm:h-[145px] sm:w-[130px]">

                    <span className="text-[58px] font-light leading-none text-[#F0447A] sm:text-[88px]">
                      {currentQuestion?.vowel}
                    </span>

                  </div>

                  <span className="text-4xl font-light text-white sm:text-6xl">
                    =
                  </span>

                  {/* QUESTION */}

                  <div
                    className={`flex h-[105px] w-[90px] items-center justify-center rounded-[22px] border-2 border-dashed sm:h-[145px] sm:w-[130px] ${
                      feedback === "correct"
                        ? "border-[#65D69B] bg-[#112B29]"
                        : feedback === "wrong"
                        ? "border-[#FF7171] bg-[#33191F]"
                        : "border-[#8D7AE8] bg-transparent"
                    }`}
                  >

                    <span
                      className={`text-[65px] font-light leading-none sm:text-[90px] ${
                        feedback === "correct"
                          ? "text-[#5FE09A]"
                          : feedback === "wrong"
                          ? "text-[#FF7373]"
                          : "text-[#9278F5]"
                      }`}
                    >
                      {feedback === "correct"
                        ? "✓"
                        : feedback === "wrong"
                        ? "×"
                        : "?"}
                    </span>

                  </div>

                </div>

                {/* ANSWER BOX */}

                <div
                  className={`mx-auto mt-8 max-w-[760px] rounded-[18px] border-[3px] bg-white px-4 py-3 transition-all sm:px-6 sm:py-4 ${
                    feedback === "correct"
                      ? "border-[#59D696]"
                      : feedback === "wrong"
                      ? "border-[#FF6767]"
                      : "border-[#7138F5]"
                  }`}
                >

                  <div className="flex min-h-[45px] items-center justify-center">

                    {answer ? (
                      <span className="text-3xl font-medium text-[#29293B] sm:text-4xl">
                        {answer}
                      </span>
                    ) : (
                      <span className="text-xl font-light text-[#9292A0] sm:text-2xl">
                        Type answer
                      </span>
                    )}

                  </div>

                </div>

                <p className="mt-3 text-center text-xs text-white/50 sm:text-sm">
                  Press Enter to check answer.
                </p>

                <div className="mx-auto mt-4 h-[6px] w-24 rounded-full bg-white/30" />

                <p className="mt-4 text-center text-xs text-white/45 sm:text-sm">
                  Type suku kata dengan betul untuk teruskan.
                </p>

                {feedback && (
                  <div
                    className={`mx-auto mt-5 max-w-[500px] rounded-2xl px-4 py-3 text-center text-sm font-bold ${
                      feedback === "correct"
                        ? "bg-[#D9FBE9] text-[#087A48]"
                        : "bg-[#FFE2E2] text-[#B51E26]"
                    }`}
                  >
                    {feedback === "correct"
                      ? `Betul! ${currentQuestion.answer}`
                      : `Cuba lagi — jawapan: ${currentQuestion.answer}`}
                  </div>
                )}

              </div>
            </div>

            {/* ======================================================
                KEYPAD
            ====================================================== */}

            <div className="rounded-[34px] border border-[#E2E7F0] bg-white p-5 shadow-[0_8px_30px_rgba(25,30,60,0.05)] sm:p-7">

              <div className="mb-5 flex items-center justify-between">

                <p className="text-sm font-medium tracking-[0.08em] text-[#8891A8]">
                  KEYPAD
                </p>

                <span className="text-xs font-medium text-[#A2A7B5]">
                  A-Z
                </span>

              </div>

              <div className="grid grid-cols-6 gap-2 sm:gap-3">

                {/* A-Z */}

                {KEYBOARD_ROWS.flat().map((letter) => (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => typeCharacter(letter)}
                    disabled={checking}
                    className="flex h-[52px] items-center justify-center rounded-[14px] border border-[#E5E9F0] bg-white text-xl font-medium lowercase text-[#222438] shadow-[0_3px_8px_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:border-[#BBA7F7] hover:bg-[#FAF8FF] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:h-[62px] sm:text-2xl"
                  >
                    {letter}
                  </button>
                ))}

                {/* APOSTROPHE */}

                <button
                  type="button"
                  onClick={() => typeCharacter("'")}
                  disabled={checking}
                  aria-label="Apostrophe"
                  className="flex h-[52px] items-center justify-center rounded-[14px] border border-[#F7D8A9] bg-[#FFF8EC] text-2xl font-medium text-[#E28A16] shadow-[0_3px_8px_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:border-[#F2B65D] hover:bg-[#FFF1D9] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:h-[62px]"
                >
                  &apos;
                </button>

                {/* BACKSPACE */}

                <button
                  type="button"
                  onClick={deleteCharacter}
                  disabled={checking}
                  aria-label="Padam"
                  className="col-span-2 flex h-[52px] items-center justify-center rounded-[14px] border border-[#FFD3D7] bg-[#FFF1F2] text-xl font-bold text-[#EF3340] transition hover:bg-[#FFE7E9] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:h-[62px]"
                >
                  ⌫
                </button>

                {/* ENTER */}

                <button
                  type="button"
                  onClick={checkAnswer}
                  disabled={checking || !answer}
                  className="col-span-3 flex h-[52px] items-center justify-center gap-2 rounded-[14px] bg-[#6631F4] text-lg font-medium text-white shadow-[0_8px_20px_rgba(102,49,244,0.22)] transition hover:bg-[#5724E2] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#B9A8ED] sm:h-[62px] sm:text-xl"
                >
                  Enter
                  <span className="text-base">↵</span>
                </button>

              </div>

              <div className="mt-5 rounded-2xl bg-[#F7F5FF] px-4 py-3 text-center text-xs font-medium text-[#7569A0]">
                Taip huruf untuk membentuk suku kata.
              </div>

              <div className="mt-3 rounded-2xl bg-[#FFF8EC] px-4 py-3 text-center text-xs font-medium text-[#A66C1B]">
                Tekan &apos; untuk membentuk e&apos;.
              </div>

            </div>

          </section>
        ) : (

          /* ======================================================
             FINISH SCREEN
          ====================================================== */

          <section className="mt-5 rounded-[34px] border border-[#E5E8F0] bg-white p-8 text-center shadow-[0_12px_40px_rgba(30,35,70,0.08)] sm:p-14">

            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#FFF4C8] text-5xl">
              🏆
            </div>

            <h2 className="mt-6 text-3xl font-bold text-[#20223A] sm:text-4xl">
              Tahniah!
            </h2>

            <p className="mt-2 text-[#85899A]">
              Semua 12 soalan untuk huruf{" "}
              <strong>{selectedConsonant}</strong> telah selesai.
            </p>

            <div className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">

              <ResultBox
                label="Betul"
                value={correct}
              />

              <ResultBox
                label="Salah"
                value={wrong}
              />

              <ResultBox
                label="Streak"
                value={streak}
              />

              <ResultBox
                label="Masa"
                value={formatTime(time)}
              />

            </div>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">

              <button
                type="button"
                onClick={restart}
                className="rounded-2xl bg-[#6631F4] px-7 py-4 font-semibold text-white shadow-lg transition hover:bg-[#5724E2]"
              >
                Main Semula
              </button>

              <button
                type="button"
                onClick={nextConsonant}
                className="rounded-2xl border border-[#E3E5EC] bg-white px-7 py-4 font-semibold text-[#37394D] transition hover:bg-[#F8F8FA]"
              >
                Huruf Seterusnya →
              </button>

            </div>

          </section>
        )}

        {/* ==========================================================
            CONSONANT SELECTION
        ========================================================== */}

        <section className="mt-6">

          <div className="overflow-x-auto pb-3">

            <div className="flex min-w-max gap-3">

              {CONSONANTS.map((item) => {

                const active =
                  item.letter === selectedConsonant;

                return (
                  <button
                    key={item.letter}
                    type="button"
                    onClick={() => loadConsonant(item.letter)}
                    className="relative w-[92px] shrink-0 rounded-[20px] border-2 px-2 py-3 transition-all duration-200 hover:-translate-y-1 sm:w-[102px]"
                    style={{
                      borderColor: active
                        ? item.color
                        : item.border,
                      backgroundColor: item.background,
                      boxShadow: active
                        ? `0 5px 14px ${item.color}35`
                        : "0 3px 8px rgba(0,0,0,0.04)",
                    }}
                  >

                    <p
                      className="text-[10px] font-medium uppercase"
                      style={{
                        color: item.color,
                      }}
                    >
                      KONSONAN
                    </p>

                    <div
                      className="mt-1 text-[48px] font-light leading-none sm:text-[56px]"
                      style={{
                        color: item.color,
                      }}
                    >
                      {item.letter}
                    </div>

                    <div className="mt-3 rounded-full bg-white px-2 py-1 text-[10px] font-medium text-[#5F6472] shadow-sm">
                      12 Q
                    </div>

                    {active && (
                      <div
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white shadow-md"
                        style={{
                          backgroundColor: item.color,
                        }}
                      >
                        ✓
                      </div>
                    )}

                  </button>
                );
              })}

            </div>

          </div>

        </section>

        {/* ==========================================================
            BOTTOM NAVIGATION
        ========================================================== */}

        <section className="mt-3 flex items-center justify-between gap-3 pb-6 sm:px-4">

          <button
            type="button"
            onClick={previousQuestion}
            disabled={questionIndex === 0 || finished}
            className="rounded-2xl border border-[#ECEEF3] bg-white px-5 py-3 text-sm font-medium text-[#C4C8D2] shadow-sm transition hover:bg-[#FAFAFC] disabled:cursor-not-allowed sm:px-8 sm:py-4 sm:text-base"
          >
            ← Previous
          </button>

          <div className="hidden items-center gap-2 sm:flex">

            {questions
              .slice(0, Math.min(8, questions.length))
              .map((_, index) => (
                <span
                  key={index}
                  className={`h-2.5 rounded-full transition-all ${
                    index === questionIndex
                      ? "w-8 bg-[#7138F5]"
                      : "w-2.5 bg-[#D7D9E1]"
                  }`}
                />
              ))}

          </div>

          <span className="text-xs font-medium tracking-[0.12em] text-[#9095A5] sm:text-sm">
            SWIPE
          </span>

          <button
            type="button"
            onClick={nextQuestion}
            disabled={finished}
            className="rounded-2xl bg-[#08091E] px-6 py-3 text-sm font-medium text-white shadow-[0_8px_20px_rgba(5,6,25,0.16)] transition hover:bg-[#151633] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:px-9 sm:py-4 sm:text-base"
          >
            Next →
          </button>

        </section>

      </div>
    </main>
  );
}

/* ==========================================================================
   STAT CARD
============================================================================= */

function StatCard({
  icon,
  label,
  value,
  background,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  background: string;
  color: string;
}) {
  return (
    <div className="flex min-h-[76px] items-center gap-3 rounded-[18px] border border-[#E8EBF1] bg-white px-4 py-3 shadow-[0_3px_8px_rgba(0,0,0,0.04)] sm:min-h-[86px] sm:px-5">

      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl font-bold sm:h-12 sm:w-12"
        style={{
          backgroundColor: background,
          color,
        }}
      >
        {icon}
      </div>

      <div className="min-w-0">

        <p className="truncate text-[10px] font-medium tracking-wide text-[#9AA0AF] sm:text-xs">
          {label}
        </p>

        <p
          className="text-xl font-medium leading-tight sm:text-2xl"
          style={{
            color,
          }}
        >
          {value}
        </p>

      </div>

    </div>
  );
}

/* ==========================================================================
   RESULT BOX
============================================================================= */

function ResultBox({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[20px] bg-[#F8F8FA] px-4 py-5">

      <p className="text-xs font-medium uppercase tracking-wide text-[#9A9DAB]">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-[#24263B]">
        {value}
      </p>

    </div>
  );
}