"use client";

import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  Loader2,
  RefreshCcw,
  RotateCcw,
  Star,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { PortalShell } from "@/components/PortalShell";
import { ProtectedPage } from "@/components/ProtectedPage";
import { supabase } from "@/lib/supabase";

/* =========================================================
   TYPES
========================================================= */

type WordQuestion = {
  id: string;
  level: string;
  word: string;
  syllable_1: string;
  syllable_2: string;
  letter_pool: string[];
  image_url: string | null;
  image_alt: string | null;
  display_order: number;
  is_active: boolean;
};

type LetterTile = {
  id: string;
  value: string;
  colorIndex: number;
};

type FeedbackState =
  | { type: "idle"; message: "" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

type DragState = {
  tile: LetterTile;
  x: number;
  y: number;
} | null;

const SLOT_COLORS = [
  {
    border: "#43A5FF",
    pale: "#EEF8FF",
    strong: "#278AF0",
    shadow: "rgba(39,138,240,.22)",
  },
  {
    border: "#FFB047",
    pale: "#FFF8EC",
    strong: "#F08A19",
    shadow: "rgba(240,138,25,.22)",
  },
  {
    border: "#60C963",
    pale: "#F0FBF0",
    strong: "#46B54A",
    shadow: "rgba(70,181,74,.22)",
  },
  {
    border: "#FF70AD",
    pale: "#FFF0F6",
    strong: "#F0448B",
    shadow: "rgba(240,68,139,.22)",
  },
  {
    border: "#8A72F2",
    pale: "#F4F1FF",
    strong: "#7458E8",
    shadow: "rgba(116,88,232,.22)",
  },
  {
    border: "#46C9C4",
    pale: "#ECFBFA",
    strong: "#27AAA5",
    shadow: "rgba(39,170,165,.22)",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function shuffleArray<T>(items: T[]) {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function arraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  return a.every((item, index) => item === b[index]);
}

function shuffleDifferent(
  letters: string[],
  previous: string[] = [],
  answerWord = ""
) {
  if (letters.length <= 1) return [...letters];

  const answer = answerWord.toLowerCase().split("");
  let next = [...letters];

  for (let attempt = 0; attempt < 50; attempt++) {
    next = shuffleArray(letters);

    const sameAsPrevious =
      previous.length > 0 && arraysEqual(next, previous);

    const accidentallyCorrect =
      answer.length === next.length && arraysEqual(next, answer);

    if (!sameAsPrevious && !accidentallyCorrect) {
      return next;
    }
  }

  return [...letters].reverse();
}

function createTiles(letters: string[]) {
  return letters.map((value, index) => ({
    id: `${value}-${index}-${Math.random().toString(36).slice(2)}`,
    value,
    colorIndex: index % SLOT_COLORS.length,
  }));
}

/* =========================================================
   PAGE
========================================================= */

export default function BinaPerkataanPage() {
  return (
    <ProtectedPage>
      {() => (
        <PortalShell role="parent">
          <BinaPerkataanOceanGame />
        </PortalShell>
      )}
    </ProtectedPage>
  );
}

/* =========================================================
   GAME
========================================================= */

function BinaPerkataanOceanGame() {
  const [questions, setQuestions] = useState<WordQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);

  const [availableTiles, setAvailableTiles] = useState<LetterTile[]>([]);
  const [answerTiles, setAnswerTiles] = useState<Array<LetterTile | null>>([]);

  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const [feedback, setFeedback] = useState<FeedbackState>({
    type: "idle",
    message: "",
  });

  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [dragState, setDragState] = useState<DragState>(null);

  const previousShuffleRef = useRef<string[]>([]);
  const suppressClickRef = useRef(false);

  const currentQuestion = questions[questionIndex] || null;
  const completedCount = completedIds.size;

  /* =======================================================
     LOAD QUESTIONS
  ======================================================= */

  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("word_build_questions")
          .select(
            "id,level,word,syllable_1,syllable_2,letter_pool,image_url,image_alt,display_order,is_active"
          )
          .eq("level", "KVKV")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (error) throw error;

        setQuestions((data || []) as WordQuestion[]);
      } catch (error) {
        console.error("Load Bina Perkataan error:", error);

        setFeedback({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "Aktiviti gagal dimuatkan.",
        });
      } finally {
        setLoading(false);
      }
    }

    void loadQuestions();
  }, []);

  /* =======================================================
     PREPARE QUESTION
  ======================================================= */

  const prepareQuestion = useCallback((question: WordQuestion | null) => {
    if (!question) return;

    const source =
      Array.isArray(question.letter_pool) && question.letter_pool.length > 0
        ? question.letter_pool
        : question.word.split("");

    const shuffled = shuffleDifferent(
      source.map((letter) => letter.toLowerCase()),
      previousShuffleRef.current,
      question.word
    );

    previousShuffleRef.current = shuffled;

    setAvailableTiles(createTiles(shuffled));
    setAnswerTiles(Array(question.word.length).fill(null));
    setFeedback({ type: "idle", message: "" });
  }, []);

  useEffect(() => {
    prepareQuestion(currentQuestion);
  }, [currentQuestion?.id, prepareQuestion]);

  /* =======================================================
     TILE LOGIC
  ======================================================= */

  function placeTile(tile: LetterTile, targetIndex?: number) {
    if (!currentQuestion) return;

    setFeedback({ type: "idle", message: "" });

    setAnswerTiles((current) => {
      const next = [...current];

      let destination = targetIndex;

      if (
        destination === undefined ||
        destination < 0 ||
        destination >= next.length ||
        next[destination] !== null
      ) {
        destination = next.findIndex((slot) => slot === null);
      }

      if (destination === -1) return current;

      next[destination] = tile;

      setAvailableTiles((tiles) =>
        tiles.filter((item) => item.id !== tile.id)
      );

      return next;
    });
  }

  function removeTile(slotIndex: number) {
    setFeedback({ type: "idle", message: "" });

    setAnswerTiles((current) => {
      const tile = current[slotIndex];

      if (!tile) return current;

      const next = [...current];
      next[slotIndex] = null;

      setAvailableTiles((tiles) => [...tiles, tile]);

      return next;
    });
  }

  function clearAnswer() {
    const returned = answerTiles.filter(
      (tile): tile is LetterTile => Boolean(tile)
    );

    setAvailableTiles((tiles) => shuffleArray([...tiles, ...returned]));

    setAnswerTiles(
      Array(currentQuestion?.word.length || 0).fill(null)
    );

    setFeedback({ type: "idle", message: "" });
  }

  function reshuffle() {
    if (!currentQuestion) return;

    const all = [
      ...availableTiles,
      ...answerTiles.filter(
        (tile): tile is LetterTile => Boolean(tile)
      ),
    ];

    const nextValues = shuffleDifferent(
      all.map((tile) => tile.value),
      previousShuffleRef.current,
      currentQuestion.word
    );

    previousShuffleRef.current = nextValues;

    setAvailableTiles(createTiles(nextValues));
    setAnswerTiles(Array(currentQuestion.word.length).fill(null));
    setFeedback({ type: "idle", message: "" });
  }

  /* =======================================================
     TOUCH + MOUSE DRAG
  ======================================================= */

  function startPointerDrag(
    event: ReactPointerEvent<HTMLButtonElement>,
    tile: LetterTile
  ) {
    suppressClickRef.current = false;

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {}

    setDragState({
      tile,
      x: event.clientX,
      y: event.clientY,
    });
  }

  function movePointerDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!dragState) return;

    suppressClickRef.current = true;

    setDragState((current) =>
      current
        ? {
            ...current,
            x: event.clientX,
            y: event.clientY,
          }
        : null
    );
  }

  function endPointerDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!dragState) return;

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {}

    const element = document.elementFromPoint(
      event.clientX,
      event.clientY
    ) as HTMLElement | null;

    const slotElement = element?.closest?.(
      "[data-word-slot]"
    ) as HTMLElement | null;

    if (slotElement) {
      const slotIndex = Number(slotElement.dataset.wordSlot);

      if (Number.isFinite(slotIndex)) {
        placeTile(dragState.tile, slotIndex);
      }
    }

    setDragState(null);

    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  }

  /* =======================================================
     CHECK
  ======================================================= */

  async function checkAnswer() {
    if (!currentQuestion) return;

    if (!answerTiles.every(Boolean)) {
      setFeedback({
        type: "error",
        message: "Susun semua huruf dahulu.",
      });
      return;
    }

    const answer = answerTiles
      .map((tile) => tile?.value || "")
      .join("")
      .toLowerCase();

    if (answer !== currentQuestion.word.toLowerCase()) {
      setFeedback({
        type: "error",
        message: "Belum tepat. Cuba susun semula.",
      });
      return;
    }

    setChecking(true);

    try {
      setCompletedIds((current) => {
        const next = new Set(current);
        next.add(currentQuestion.id);
        return next;
      });

      setFeedback({
        type: "success",
        message: `Hebat! ${currentQuestion.word} betul.`,
      });
    } finally {
      setChecking(false);
    }
  }

  /* =======================================================
     NAVIGATION
  ======================================================= */

  function previousQuestion() {
    if (questions.length === 0) return;

    setQuestionIndex((current) =>
      current === 0 ? questions.length - 1 : current - 1
    );
  }

  function nextQuestion() {
    if (questions.length === 0) return;

    setQuestionIndex((current) =>
      current === questions.length - 1 ? 0 : current + 1
    );
  }

  /* =======================================================
     LOADING / EMPTY
  ======================================================= */

  if (loading) {
    return (
      <main
        className="grid min-h-[75vh] place-items-center bg-[#EAF8FF]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(239,250,255,.60),rgba(239,250,255,.72)), url("/images/reading-ocean-background.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="rounded-[28px] border border-white/80 bg-white/90 px-8 py-7 text-center shadow-xl backdrop-blur">
          <Loader2
            size={38}
            className="mx-auto animate-spin text-violet-600"
          />

          <p className="mt-3 font-black text-[#35506B]">
            Loading Bina Perkataan...
          </p>
        </div>
      </main>
    );
  }

  if (!currentQuestion) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-[#EAF8FF] p-5">
        <div className="max-w-md rounded-[28px] border border-white bg-white/90 p-7 text-center shadow-xl">
          <ImageOff
            size={38}
            className="mx-auto text-slate-300"
          />

          <h1 className="mt-4 text-2xl font-black text-[#24375D]">
            Tiada Soalan KVKV
          </h1>

          <p className="mt-2 text-sm font-semibold text-slate-500">
            Admin perlu aktifkan sekurang-kurangnya satu soalan.
          </p>
        </div>
      </main>
    );
  }

  const answerReady = answerTiles.every(Boolean);

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#EAF8FF] px-3 py-4 sm:px-5 lg:px-7"
      style={{
        backgroundImage:
          'linear-gradient(rgba(235,249,255,.38),rgba(235,249,255,.58)), url("/images/reading-ocean-background.png")',
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundAttachment: "fixed",
      }}
    >
      {/* floating bubbles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 12 }).map((_, index) => (
          <span
            key={index}
            className="ocean-float-bubble absolute rounded-full border border-white/80 bg-white/20"
            style={{
              width: `${10 + (index % 4) * 6}px`,
              height: `${10 + (index % 4) * 6}px`,
              left: `${5 + ((index * 13) % 88)}%`,
              top: `${8 + ((index * 17) % 80)}%`,
              animationDelay: `${index * 0.35}s`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto w-full max-w-[1480px]">
        {/* TOP */}
        <header className="rounded-[28px] border border-white/90 bg-white/82 p-3 shadow-[0_16px_48px_rgba(65,130,170,.14)] backdrop-blur-xl">
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            <Link
              href="/huruf-membaca"
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white bg-white text-violet-600 shadow-md"
            >
              <ArrowLeft size={20} />
            </Link>

            {[
              ["01", "KV"],
              ["02", "KVKV"],
              ["03", "KVK"],
              ["04", "KV + KV"],
              ["05", "KVK + KV"],
              ["06", "KVK + KVK"],
              ["07", "Diftong"],
              ["08", "Vokal Berganding"],
              ["09", "Digraf"],
            ].map(([no, label]) => {
              const active = label === "KVKV";

              return (
                <div
                  key={label}
                  className={`min-w-[118px] shrink-0 rounded-[18px] border px-4 py-3 text-center ${
                    active
                      ? "border-violet-500 bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-[0_8px_20px_rgba(109,73,232,.24)]"
                      : "border-[#E4EDF6] bg-white/95 text-[#65738A]"
                  }`}
                >
                  <p className="text-[9px] font-black opacity-70">{no}</p>
                  <p className="mt-1 text-sm font-black">{label}</p>
                </div>
              );
            })}

            <div className="ml-auto hidden shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm md:flex">
              <Star className="fill-yellow-400 text-yellow-400" size={17} />
              <span className="text-xs font-black text-[#455777]">
                {questionIndex + 1} / {questions.length}
              </span>
            </div>
          </div>
        </header>

        {/* MAIN CARD */}
        <section className="mt-4 overflow-hidden rounded-[34px] border border-white/90 bg-white/80 shadow-[0_24px_70px_rgba(58,124,168,.17)] backdrop-blur-xl">
          {/* IMAGE + INSTRUCTION */}
          <div className="grid gap-5 border-b border-[#E5EEF5] p-4 sm:p-6 lg:grid-cols-[260px_minmax(0,1fr)_260px] lg:items-center">
            {/* instruction */}
            <div className="order-2 lg:order-1">
              <p className="text-sm sm:text-base md:text-lg font-black uppercase tracking-[0.12em] text-violet-600">
                Arahan
              </p>

              <p className="mt-3 text-base font-bold leading-7 text-[#53637D]">
                Susun huruf untuk bina perkataan yang betul berdasarkan gambar.
              </p>

              <div className="mt-4 rounded-[20px] border border-sky-100 bg-sky-50/80 p-4">
                <p className="text-sm font-black text-sky-700">
                  Petunjuk
                </p>
                <p className="mt-1 text-xs font-semibold leading-5 text-[#71819B]">
                  Tarik huruf ke kotak. Kotak akan bertukar warna bila huruf
                  masuk.
                </p>
              </div>
            </div>

            {/* BIG IMAGE */}
            <div className="order-1 lg:order-2">
              <p className="mb-2 text-center text-[11px] font-black uppercase tracking-[0.14em] text-violet-600">
                Gambar Petunjuk
              </p>

              <div className="mx-auto grid min-h-[300px] w-full max-w-[640px] place-items-center overflow-hidden rounded-[30px] border border-white bg-gradient-to-br from-white via-[#F7FCFF] to-[#EAF8FF] p-4 shadow-[inset_0_0_40px_rgba(66,169,220,.07)] sm:min-h-[350px]">
                {currentQuestion.image_url ? (
                  <img
                    src={currentQuestion.image_url}
                    alt={
                      currentQuestion.image_alt ||
                      `Gambar ${currentQuestion.word}`
                    }
                    className="max-h-[320px] max-w-[94%] object-contain drop-shadow-[0_14px_22px_rgba(24,62,88,.16)]"
                    draggable={false}
                  />
                ) : (
                  <div className="text-center">
                    <ImageOff
                      size={38}
                      className="mx-auto text-slate-300"
                    />
                    <p className="mt-2 text-xs font-black text-slate-400">
                      Gambar belum dimuat naik
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* compact status only — no word sound */}
            <div className="order-3">
              <div className="rounded-[22px] border border-violet-100 bg-gradient-to-br from-white to-violet-50/70 p-5 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-violet-500">
                  Kemajuan
                </p>

                <p className="mt-2 text-3xl font-black text-[#33466F]">
                  {questionIndex + 1}
                  <span className="text-lg text-[#A7B2C5]">
                    {" "}
                    / {questions.length}
                  </span>
                </p>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E5EAF1]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-violet-500 transition-[width] duration-300"
                    style={{
                      width: `${
                        ((questionIndex + 1) /
                          Math.max(questions.length, 1)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ANSWER */}
          <div className="p-4 sm:p-6 lg:p-8">
            <div>
              <p className="text-sm sm:text-base md:text-lg font-black uppercase tracking-[0.12em] text-violet-600">
                Susun Huruf Di Sini
              </p>

              <p className="mt-1 text-base font-semibold text-[#96A4BA]">
                Tarik huruf ke kotak yang betul.
              </p>
            </div>

            <div
              className="mx-auto mt-6 grid max-w-[920px] gap-3 sm:gap-4"
              style={{
                gridTemplateColumns: `repeat(${Math.min(
                  currentQuestion.word.length,
                  6
                )}, minmax(0, 1fr))`,
              }}
            >
              {answerTiles.map((tile, index) => {
                const palette = SLOT_COLORS[index % SLOT_COLORS.length];

                return (
                  <div
                    key={`slot-${index}`}
                    data-word-slot={index}
                    className="relative grid aspect-square min-h-[118px] place-items-center rounded-[24px] border-2 border-dashed transition-all duration-200 sm:min-h-[155px] md:min-h-[175px]"
                    style={{
                      borderColor: tile ? palette.border : `${palette.border}80`,
                      backgroundColor: tile ? palette.pale : "rgba(255,255,255,.72)",
                      boxShadow: tile
                        ? `0 12px 25px ${palette.shadow}`
                        : "inset 0 0 0 1px rgba(255,255,255,.7)",
                    }}
                  >
                    {tile ? (
                      <button
                        type="button"
                        onClick={() => removeTile(index)}
                        className="grid h-full w-full place-items-center rounded-[22px] text-5xl font-black leading-none transition-transform hover:scale-105 sm:text-6xl md:text-7xl lg:text-8xl"
                        style={{
                          color: palette.strong,
                        }}
                      >
                        {tile.value}
                      </button>
                    ) : (
                      <Star
                        size={30}
                        className="text-[#E7ECF5]"
                      />
                    )}

                    <span
                      className="absolute left-3 top-2 text-xs sm:text-sm font-black"
                      style={{
                        color: `${palette.strong}70`,
                      }}
                    >
                      {index + 1}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* FEEDBACK */}
            {feedback.type !== "idle" ? (
              <div
                className={`mx-auto mt-5 flex max-w-[920px] items-center gap-3 rounded-[18px] border px-4 py-3 ${
                  feedback.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-600"
                }`}
              >
                <span
                  className={`grid h-9 w-9 place-items-center rounded-full text-white ${
                    feedback.type === "success"
                      ? "bg-emerald-500"
                      : "bg-red-500"
                  }`}
                >
                  {feedback.type === "success" ? (
                    <Check size={18} strokeWidth={4} />
                  ) : (
                    <X size={18} strokeWidth={4} />
                  )}
                </span>

                <p className="text-base sm:text-lg font-black">
                  {feedback.message}
                </p>
              </div>
            ) : null}

            {/* AVAILABLE LETTERS */}
            <div className="mt-8 border-t border-[#E7EEF5] pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm sm:text-base md:text-lg font-black uppercase tracking-[0.12em] text-violet-600">
                    Huruf Tersedia
                  </p>

                  <p className="mt-1 text-sm sm:text-base font-semibold text-[#9AA8BB]">
                    Setiap kali main, susunan huruf akan berubah.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={reshuffle}
                  className="inline-flex h-11 items-center gap-2 rounded-[15px] border border-violet-200 bg-white px-4 text-xs font-black text-violet-700 shadow-sm transition hover:bg-violet-50"
                >
                  <RefreshCcw size={15} />
                  Acak Semula
                </button>
              </div>

              <div className="mt-5 flex min-h-[120px] flex-wrap items-center justify-center gap-4 rounded-[24px] bg-white/55 p-4">
                {availableTiles.map((tile) => {
                  const palette =
                    SLOT_COLORS[tile.colorIndex % SLOT_COLORS.length];

                  return (
                    <button
                      key={tile.id}
                      type="button"
                      onPointerDown={(event) =>
                        startPointerDrag(event, tile)
                      }
                      onPointerMove={movePointerDrag}
                      onPointerUp={endPointerDrag}
                      onPointerCancel={() => setDragState(null)}
                      onClick={() => {
                        if (!suppressClickRef.current) {
                          placeTile(tile);
                        }
                      }}
                     className="touch-none select-none grid h-[108px] w-[108px] place-items-center rounded-[24px] border-2 bg-white font-black leading-none shadow-[0_10px_24px_rgba(38,74,103,.12)] transition hover:-translate-y-1 active:scale-95 sm:h-[124px] sm:w-[124px] md:h-[140px] md:w-[140px] lg:h-[150px] lg:w-[150px]"
  style={{
    borderColor: `${palette.border}75`,
    color: palette.strong,
    boxShadow: `0 10px 24px ${palette.shadow}`,
    fontSize: "96px",
  }}
>
  {tile.value}
</button>
                  );
                })}

                {availableTiles.length === 0 ? (
                  <p className="text-sm font-bold text-[#A0ADBF]">
                    Semua huruf sudah diletakkan.
                  </p>
                ) : null}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={clearAnswer}
                  className="inline-flex h-12 items-center gap-2 rounded-[15px] border border-sky-100 bg-sky-50 px-4 text-sm font-black text-sky-700"
                >
                  <RotateCcw size={17} />
                  Ulang
                </button>

                <button
                  type="button"
                  onClick={clearAnswer}
                  className="inline-flex h-12 items-center gap-2 rounded-[15px] border border-pink-100 bg-pink-50 px-4 text-sm font-black text-pink-600"
                >
                  <Trash2 size={17} />
                  Padam
                </button>
              </div>

              <button
                type="button"
                onClick={() => void checkAnswer()}
                disabled={!answerReady || checking}
                className={`inline-flex h-12 min-w-[180px] items-center justify-center gap-2 rounded-[15px] px-5 text-sm font-black transition ${
                  answerReady
                    ? "bg-gradient-to-r from-cyan-500 via-sky-500 to-violet-600 text-white shadow-[0_10px_24px_rgba(66,149,218,.28)] hover:-translate-y-0.5"
                    : "cursor-not-allowed bg-slate-100 text-slate-400"
                }`}
              >
                {checking ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Check size={17} />
                )}
                Semak
              </button>
            </div>
          </div>
        </section>

        {/* BOTTOM NAV */}
        <section className="mt-4 rounded-[24px] border border-white/90 bg-white/82 p-3 shadow-[0_14px_38px_rgba(58,124,168,.12)] backdrop-blur-xl">
          <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-center">
            <button
              type="button"
              onClick={previousQuestion}
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[16px] bg-white px-5 text-sm font-black text-violet-700 shadow-sm"
            >
              <ChevronLeft size={18} />
              Sebelumnya
            </button>

            <div className="text-center">
              <p className="text-sm font-black text-[#3A4D70]">
                {completedCount} perkataan selesai
              </p>

              <div className="mx-auto mt-2 h-2.5 max-w-[600px] overflow-hidden rounded-full bg-[#E4EBF2]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-500 transition-[width] duration-300"
                  style={{
                    width: `${
                      (completedCount /
                        Math.max(questions.length, 1)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={nextQuestion}
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[16px] bg-gradient-to-r from-sky-500 to-violet-600 px-5 text-sm font-black text-white shadow-[0_9px_22px_rgba(73,137,218,.22)]"
            >
              Seterusnya
              <ChevronRight size={18} />
            </button>
          </div>
        </section>
      </div>

      {/* FLOATING TILE GHOST */}
      {dragState ? (
        <div
          className="pointer-events-none fixed z-[9999] grid h-[92px] w-[92px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[22px] border-2 bg-white text-5xl font-black shadow-[0_18px_38px_rgba(24,70,105,.23)]"
          style={{
            left: dragState.x,
            top: dragState.y,
            color:
              SLOT_COLORS[
                dragState.tile.colorIndex % SLOT_COLORS.length
              ].strong,
            borderColor:
              SLOT_COLORS[
                dragState.tile.colorIndex % SLOT_COLORS.length
              ].border,
          }}
        >
          {dragState.tile.value}
        </div>
      ) : null}

      <style jsx global>{`
        @keyframes oceanBubbleFloat {
          0%,
          100% {
            transform: translateY(0) scale(1);
            opacity: 0.38;
          }
          50% {
            transform: translateY(-18px) scale(1.08);
            opacity: 0.75;
          }
        }

        .ocean-float-bubble {
          animation: oceanBubbleFloat 5.8s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}