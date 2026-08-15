"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Crown,
  Home,
  Lightbulb,
  Lock,
  Play,
  RefreshCcw,
  RotateCcw,
  Sparkles,
  Star,
  Trophy,
  Volume2,
  X,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type PageMode = "home" | "book" | "sorting";

type LetterCategory = "vokal" | "konsonan";

type SlideType =
  | "intro-vowel"
  | "vowel"
  | "intro-consonant"
  | "consonant"
  | "compare"
  | "finish";

type BookSlide = {
  id: string;
  type: SlideType;
  title: string;
  subtitle: string;
  letter?: string;
  examples?: string[];
  groupLabel?: string;
};

type BubbleItem = {
  id: string;
  letter: string;
  category: LetterCategory;
  tone: BubbleTone;
};

type BubbleTone =
  | "pink"
  | "blue"
  | "green"
  | "purple"
  | "yellow";

type SortedItem = {
  id: string;
  letter: string;
  category: LetterCategory;
};

type LevelResult = {
  completed: boolean;
  stars: number;
};

/* =========================================================
   CONSTANT
========================================================= */

const LOWERCASE = "abcdefghijklmnopqrstuvwxyz".split("");

const VOWELS = ["a", "e", "i", "o", "u"];

const BUBBLE_TONES: BubbleTone[] = [
  "pink",
  "blue",
  "green",
  "purple",
  "yellow",
];

const LEVEL_COUNTS = [
  6,
  6,
  8,
  8,
  10,
  10,
  12,
  12,
  14,
  16,
];

const BOOK_SLIDES: BookSlide[] = [
  {
    id: "intro-vowel",
    type: "intro-vowel",
    title: "Huruf Vokal",
    subtitle:
      "Terdapat 5 huruf vokal dalam Bahasa Melayu.",
    examples: ["a", "e", "i", "o", "u"],
  },

  {
    id: "a",
    type: "vowel",
    title: "Huruf a",
    subtitle: "a ialah huruf vokal.",
    letter: "a",
    examples: ["ayam", "api"],
  },

  {
    id: "e",
    type: "vowel",
    title: "Huruf e",
    subtitle: "e ialah huruf vokal.",
    letter: "e",
    examples: ["ekor", "emas"],
  },

  {
    id: "i",
    type: "vowel",
    title: "Huruf i",
    subtitle: "i ialah huruf vokal.",
    letter: "i",
    examples: ["ikan", "ibu"],
  },

  {
    id: "o",
    type: "vowel",
    title: "Huruf o",
    subtitle: "o ialah huruf vokal.",
    letter: "o",
    examples: ["obor", "oren"],
  },

  {
    id: "u",
    type: "vowel",
    title: "Huruf u",
    subtitle: "u ialah huruf vokal.",
    letter: "u",
    examples: ["ular", "ubi"],
  },

  {
    id: "intro-consonant",
    type: "intro-consonant",
    title: "Huruf Konsonan",
    subtitle:
      "Semua huruf selain a, e, i, o dan u ialah huruf konsonan.",
    examples: ["b", "c", "d", "f", "g"],
  },

  {
    id: "consonant-1",
    type: "consonant",
    title: "Huruf Konsonan",
    subtitle: "Mari belajar kumpulan pertama.",
    groupLabel: "Kumpulan 1",
    examples: ["b", "c", "d", "f", "g"],
  },

  {
    id: "consonant-2",
    type: "consonant",
    title: "Huruf Konsonan",
    subtitle: "Mari belajar kumpulan kedua.",
    groupLabel: "Kumpulan 2",
    examples: ["h", "j", "k", "l", "m"],
  },

  {
    id: "consonant-3",
    type: "consonant",
    title: "Huruf Konsonan",
    subtitle: "Mari belajar kumpulan ketiga.",
    groupLabel: "Kumpulan 3",
    examples: ["n", "p", "q", "r", "s"],
  },

  {
    id: "consonant-4",
    type: "consonant",
    title: "Huruf Konsonan",
    subtitle: "Mari belajar kumpulan terakhir.",
    groupLabel: "Kumpulan 4",
    examples: ["t", "v", "w", "x", "y", "z"],
  },

  {
    id: "compare",
    type: "compare",
    title: "Mari Bezakan",
    subtitle:
      "Ingat: a, e, i, o dan u ialah Vokal. Huruf lain ialah Konsonan.",
  },

  {
    id: "finish",
    type: "finish",
    title: "Hebat!",
    subtitle:
      "Sekarang anda sudah mengenali huruf Vokal dan Konsonan.",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(
      Math.random() * (i + 1)
    );

    const temp = copy[i];
    copy[i] = copy[randomIndex];
    copy[randomIndex] = temp;
  }

  return copy;
}

function getCategory(
  letter: string
): LetterCategory {
  return VOWELS.includes(
    letter.toLowerCase()
  )
    ? "vokal"
    : "konsonan";
}

function speak(text: string) {
  if (typeof window === "undefined") return;

  if (
    !("speechSynthesis" in window)
  ) {
    return;
  }

  window.speechSynthesis.cancel();

  const utterance =
    new SpeechSynthesisUtterance(text);

  utterance.rate = 0.72;
  utterance.pitch = 1.08;

  window.speechSynthesis.speak(
    utterance
  );
}

function bubbleAsset(
  tone: BubbleTone
) {
  return `/images/vokal-konsonan/bubble-${tone}.png`;
}

/* =========================================================
   LEVEL GENERATOR
========================================================= */

function generateLevel(
  level: number
): BubbleItem[] {
  const count =
    LEVEL_COUNTS[level - 1] ?? 8;

  const consonants =
    LOWERCASE.filter(
      (letter) =>
        !VOWELS.includes(letter)
    );

  /*
   * Level awal:
   * lowercase sahaja.
   *
   * Level 6 ke atas:
   * boleh campur uppercase.
   */
  const mixedCase = level >= 6;

  const usedLetters =
    new Set<string>();

  const chosen: string[] = [];

  /*
   * Pastikan ada vokal.
   */
  const vowelCount =
    level <= 2
      ? 3
      : Math.max(
          2,
          Math.min(
            5,
            Math.round(count * 0.35)
          )
        );

  const shuffledVowels =
    shuffle(VOWELS);

  for (
    let i = 0;
    i < vowelCount;
    i += 1
  ) {
    const letter =
      shuffledVowels[
        i % shuffledVowels.length
      ];

    const key =
      letter.toUpperCase();

    if (
      !usedLetters.has(key)
    ) {
      usedLetters.add(key);
      chosen.push(letter);
    }
  }

  const shuffledConsonants =
    shuffle(consonants);

  for (
    let i = 0;
    chosen.length < count &&
    i <
      shuffledConsonants.length;
    i += 1
  ) {
    const letter =
      shuffledConsonants[i];

    const key =
      letter.toUpperCase();

    if (
      usedLetters.has(key)
    ) {
      continue;
    }

    usedLetters.add(key);
    chosen.push(letter);
  }

  return shuffle(chosen).map(
    (baseLetter, index) => {
      const useUppercase =
        mixedCase &&
        Math.random() > 0.5;

      const letter =
        useUppercase
          ? baseLetter.toUpperCase()
          : baseLetter;

      return {
        id: `bubble-${level}-${index}-${Math.random()
          .toString(36)
          .slice(2)}`,
        letter,
        category:
          getCategory(letter),
        tone:
          BUBBLE_TONES[
            index %
              BUBBLE_TONES.length
          ],
      };
    }
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function VokalKonsonanPage() {
  const [mode, setMode] =
    useState<PageMode>("home");

  /* ================= BOOK ================= */

  const [
    slideIndex,
    setSlideIndex,
  ] = useState(0);

  const swipeStartX =
    useRef<number | null>(null);

  /* ================= SORTING ================= */

  const [level, setLevel] =
    useState(1);

  const [
    bubbleItems,
    setBubbleItems,
  ] = useState<BubbleItem[]>([]);

  const [
    vowelBasket,
    setVowelBasket,
  ] = useState<SortedItem[]>([]);

  const [
    consonantBasket,
    setConsonantBasket,
  ] = useState<SortedItem[]>([]);

  const [
    poppingBubbleId,
    setPoppingBubbleId,
  ] = useState<string | null>(
    null
  );

  const [
    selectedBubble,
    setSelectedBubble,
  ] =
    useState<BubbleItem | null>(
      null
    );

  const [
    draggedBubble,
    setDraggedBubble,
  ] =
    useState<BubbleItem | null>(
      null
    );

  const [
    feedback,
    setFeedback,
  ] = useState<
    | "idle"
    | "correct"
    | "wrong"
    | "success"
  >("idle");

  const [
    levelResults,
    setLevelResults,
  ] = useState<
    Record<number, LevelResult>
  >({});

  const [
    showFinal,
    setShowFinal,
  ] = useState(false);

  useEffect(() => {
    if (mode === "sorting") {
      loadLevel();
    }
  }, [mode, level]);

  /* =======================================================
     BOOK CALC
  ======================================================= */

  const currentSlide =
    BOOK_SLIDES[slideIndex];

  const bookProgress =
    Math.round(
      ((slideIndex + 1) /
        BOOK_SLIDES.length) *
        100
    );

  /* =======================================================
     SORTING CALC
  ======================================================= */

  const completedLevels =
    useMemo(() => {
      return Object.values(
        levelResults
      ).filter(
        (result) =>
          result.completed
      ).length;
    }, [levelResults]);

  const totalStars = useMemo(
    () => {
      return Object.values(
        levelResults
      ).reduce(
        (total, result) =>
          total + result.stars,
        0
      );
    },
    [levelResults]
  );

  const totalItems =
    bubbleItems.length +
    vowelBasket.length +
    consonantBasket.length +
    (selectedBubble ? 1 : 0);

  const sortedCount =
    vowelBasket.length +
    consonantBasket.length;

  const gameProgress =
    totalItems === 0
      ? 0
      : Math.round(
          (sortedCount /
            totalItems) *
            100
        );

  /* =======================================================
     BOOK FUNCTIONS
  ======================================================= */

  function previousSlide() {
    setSlideIndex((previous) =>
      Math.max(
        0,
        previous - 1
      )
    );
  }

  function nextSlide() {
    setSlideIndex((previous) =>
      Math.min(
        BOOK_SLIDES.length - 1,
        previous + 1
      )
    );
  }

  function listenSlide() {
    if (currentSlide.letter) {
      speak(
        `Huruf ${currentSlide.letter}`
      );

      return;
    }

    if (
      currentSlide.type ===
      "intro-vowel"
    ) {
      speak(
        "Huruf vokal ialah a, e, i, o dan u."
      );

      return;
    }

    if (
      currentSlide.type ===
      "intro-consonant"
    ) {
      speak(
        "Semua huruf selain a, e, i, o dan u ialah huruf konsonan."
      );

      return;
    }

    if (
      currentSlide.examples
    ) {
      speak(
        currentSlide.examples.join(
          " "
        )
      );

      return;
    }

    speak(
      currentSlide.subtitle
    );
  }

  function handleSwipeDown(
    event: ReactPointerEvent<HTMLDivElement>
  ) {
    swipeStartX.current =
      event.clientX;
  }

  function handleSwipeUp(
    event: ReactPointerEvent<HTMLDivElement>
  ) {
    if (
      swipeStartX.current ===
      null
    ) {
      return;
    }

    const difference =
      event.clientX -
      swipeStartX.current;

    swipeStartX.current = null;

    if (
      Math.abs(difference) < 45
    ) {
      return;
    }

    if (difference < 0) {
      nextSlide();
    } else {
      previousSlide();
    }
  }

  /* =======================================================
     SORTING FUNCTIONS
  ======================================================= */

  function loadLevel() {
    setBubbleItems(
      generateLevel(level)
    );

    setVowelBasket([]);
    setConsonantBasket([]);

    setSelectedBubble(null);
    setDraggedBubble(null);
    setPoppingBubbleId(null);

    setFeedback("idle");
  }

  /*
   * TAP BUBBLE
   *
   * 1. play pop animation
   * 2. bubble disappear
   * 3. selectedBubble remains
   * 4. child chooses basket
   */
  function popBubble(
    item: BubbleItem
  ) {
    if (poppingBubbleId) {
      return;
    }

    if (selectedBubble) {
      return;
    }

    speak(item.letter);

    setPoppingBubbleId(
      item.id
    );

    window.setTimeout(() => {
      setBubbleItems(
        (previous) =>
          previous.filter(
            (bubble) =>
              bubble.id !==
              item.id
          )
      );

      setSelectedBubble(item);

      setPoppingBubbleId(
        null
      );
    }, 460);
  }

  /*
   * DRAG version:
   *
   * Desktop can drag bubble
   * directly without tapping first.
   */
  function moveToBasket(
    item: BubbleItem,
    target: LetterCategory,
    fromDrag = false
  ) {
    const correct =
      item.category === target;

    if (!correct) {
      setFeedback("wrong");

      /*
       * If bubble was tapped,
       * return it to play area.
       */
      if (!fromDrag) {
        setBubbleItems(
          (previous) =>
            shuffle([
              ...previous,
              item,
            ])
        );
      }

      setSelectedBubble(null);
      setDraggedBubble(null);

      window.setTimeout(() => {
        setFeedback("idle");
      }, 800);

      return;
    }

    /*
     * Dragged bubble still exists
     * in bubbleItems, so remove it.
     */
    if (fromDrag) {
      setBubbleItems(
        (previous) =>
          previous.filter(
            (bubble) =>
              bubble.id !==
              item.id
          )
      );
    }

    const sorted: SortedItem = {
      id: item.id,
      letter: item.letter,
      category: item.category,
    };

    if (
      target === "vokal"
    ) {
      setVowelBasket(
        (previous) => [
          ...previous,
          sorted,
        ]
      );
    } else {
      setConsonantBasket(
        (previous) => [
          ...previous,
          sorted,
        ]
      );
    }

    setSelectedBubble(null);
    setDraggedBubble(null);

    setFeedback("correct");

    const remaining =
      bubbleItems.filter(
        (bubble) =>
          bubble.id !== item.id
      ).length;

    /*
     * If item was already removed
     * because it was popped,
     * bubbleItems.length is already
     * the remaining number.
     */
    const actualRemaining =
      fromDrag
        ? remaining
        : bubbleItems.length;

    if (actualRemaining === 0) {
      window.setTimeout(() => {
        finishLevel();
      }, 600);

      return;
    }

    window.setTimeout(() => {
      setFeedback("idle");
    }, 500);
  }

  function removeSorted(
    item: SortedItem
  ) {
    if (
      item.category === "vokal"
    ) {
      setVowelBasket(
        (previous) =>
          previous.filter(
            (entry) =>
              entry.id !== item.id
          )
      );
    } else {
      setConsonantBasket(
        (previous) =>
          previous.filter(
            (entry) =>
              entry.id !== item.id
          )
      );
    }

    setBubbleItems(
      (previous) =>
        shuffle([
          ...previous,
          {
            id: item.id,
            letter:
              item.letter,
            category:
              item.category,
            tone:
              BUBBLE_TONES[
                Math.floor(
                  Math.random() *
                    BUBBLE_TONES.length
                )
              ],
          },
        ])
    );

    setFeedback("idle");
  }

  function finishLevel() {
    setFeedback("success");

    setLevelResults(
      (previous) => ({
        ...previous,

        [level]: {
          completed: true,
          stars: 3,
        },
      })
    );

    if (level === 10) {
      window.setTimeout(() => {
        setShowFinal(true);
      }, 900);
    }
  }

  function nextLevel() {
    if (level === 10) {
      setShowFinal(true);
      return;
    }

    setLevel(
      (previous) =>
        previous + 1
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#F3F5FF] text-[#101A3B]">
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html {
          -webkit-text-size-adjust: 100%;
        }

        body {
          margin: 0;
          background: #f3f5ff;
          overscroll-behavior-y: contain;
        }

        button {
          font-family: inherit;
        }

        /* ================================================
           BUBBLE FLOAT
        ================================================= */

        @keyframes bubbleFloat {
          0%,
          100% {
            transform: translateY(0px) rotate(-1deg);
          }

          50% {
            transform: translateY(-12px) rotate(1deg);
          }
        }

        .bubble-floating {
          animation: bubbleFloat
            3.4s ease-in-out
            infinite;
        }

        /* ================================================
           REAL BUBBLE POP
        ================================================= */

        @keyframes realBubblePop {
          0% {
            transform: scale(1);
            opacity: 1;
          }

          28% {
            transform: scale(1.18);
            opacity: 1;
          }

          52% {
            transform: scale(0.92);
            opacity: 1;
          }

          72% {
            transform: scale(1.38);
            opacity: 0.85;
            filter: brightness(1.4);
          }

          100% {
            transform: scale(1.8);
            opacity: 0;
            filter: brightness(2);
          }
        }

        .bubble-popping {
          pointer-events: none !important;

          animation:
            realBubblePop
            460ms
            cubic-bezier(
              0.2,
              0.8,
              0.2,
              1
            )
            forwards !important;
        }

        /* ================================================
           PARTICLES
        ================================================= */

        .pop-particle {
          position: absolute;

          left: 50%;
          top: 50%;

          width: 12px;
          height: 12px;

          border-radius: 9999px;

          background: rgba(
            255,
            255,
            255,
            0.95
          );

          box-shadow:
            0 0 8px
              rgba(
                255,
                255,
                255,
                0.8
              );

          pointer-events: none;

          animation:
            particleBurst
            500ms
            ease-out
            forwards;
        }

        @keyframes particleBurst {
          from {
            transform:
              translate(
                -50%,
                -50%
              )
              scale(0.4);

            opacity: 1;
          }

          to {
            transform:
              translate(
                var(--particle-x),
                var(--particle-y)
              )
              scale(1);

            opacity: 0;
          }
        }

        /* ================================================
           WRONG
        ================================================= */

        @keyframes wrongShake {
          0%,
          100% {
            transform: translateX(0);
          }

          25% {
            transform: translateX(-8px);
          }

          50% {
            transform: translateX(8px);
          }

          75% {
            transform: translateX(-4px);
          }
        }

        .wrong-shake {
          animation:
            wrongShake
            0.4s
            ease-in-out;
        }

        /* ================================================
           FALLBACK BUBBLE
        ================================================= */

        .bubble-fallback {
          position: absolute;
          inset: 0;

          border-radius: 9999px;

          border: 4px solid
            rgba(
              255,
              255,
              255,
              0.88
            );

          box-shadow:
            inset
              -12px
              -14px
              20px
              rgba(
                31,
                45,
                92,
                0.12
              ),
            0
              14px
              24px
              rgba(
                37,
                72,
                122,
                0.2
              );
        }

        .bubble-fallback::after {
          content: "";

          position: absolute;

          left: 18%;
          top: 13%;

          width: 27%;
          height: 20%;

          border-radius: 50%;

          background:
            rgba(
              255,
              255,
              255,
              0.85
            );

          filter: blur(1px);

          transform: rotate(-25deg);
        }
      `}</style>

      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="border-b border-[#E4E8F1] bg-white">
        <div className="mx-auto flex max-w-[1550px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-[#7C3CFF] text-lg font-black text-white shadow-[0_8px_22px_rgba(124,60,255,0.2)]">
              FD
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-black tracking-[0.05em] text-[#101A3B] sm:text-[16px]">
                  FD ARCADIA
                </span>

                <Sparkles
                  size={14}
                  className="text-[#7C3CFF]"
                />
              </div>

              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#A3AFC3]">
                LearningHub
              </p>
            </div>
          </div>

          <a
            href="/huruf-membaca"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] border border-[#DFE4EF] bg-white px-3 text-xs font-black text-[#101A3B] shadow-sm"
          >
            <Home size={16} />

            <span className="hidden sm:inline">
              Back to Home
            </span>
          </a>
        </div>
      </header>

      {/* ===================================================
          HOME
      =================================================== */}

      {mode === "home" && (
        <HomeScreen
          onBook={() => {
            setSlideIndex(0);
            setMode("book");
          }}
          onGame={() => {
            setLevel(1);
            setMode("sorting");
          }}
        />
      )}

      {/* ===================================================
          BOOK
      =================================================== */}

      {mode === "book" && (
        <div className="mx-auto max-w-[1250px] px-3 py-5 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                setMode("home")
              }
              className="inline-flex h-11 items-center gap-2 rounded-[14px] border border-[#DFE4EF] bg-white px-4 text-xs font-black text-[#596B88] shadow-sm"
            >
              <ArrowLeft size={16} />

              Aktiviti
            </button>

            <div className="rounded-full bg-[#EEE8FF] px-4 py-2 text-xs font-black text-[#7C3CFF]">
              {slideIndex + 1} /{" "}
              {BOOK_SLIDES.length}
            </div>
          </div>

          <section className="overflow-hidden rounded-[32px] border border-[#DFE4EF] bg-white shadow-[0_14px_35px_rgba(25,39,74,0.06)]">
            <div className="border-b border-[#E8EBF3] px-5 py-4">
              <div className="flex items-center gap-4">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#ECEAF7]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#F52C8C] to-[#7C3CFF]"
                    style={{
                      width: `${bookProgress}%`,
                    }}
                  />
                </div>

                <span className="text-xs font-black text-[#7C3CFF]">
                  {bookProgress}%
                </span>
              </div>
            </div>

            <div
              onPointerDown={
                handleSwipeDown
              }
              onPointerUp={
                handleSwipeUp
              }
              className="touch-pan-y select-none p-3 sm:p-5"
            >
              <BookSlideView
                slide={
                  currentSlide
                }
              />
            </div>

            <div className="grid gap-3 border-t border-[#E8EBF3] bg-[#FBFCFF] p-4 sm:grid-cols-[1fr_auto_1fr] sm:px-6">
              <button
                type="button"
                onClick={
                  previousSlide
                }
                disabled={
                  slideIndex === 0
                }
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[15px] border border-[#E0E5EF] bg-white px-4 text-xs font-black text-[#65748E] disabled:opacity-30 sm:justify-self-start"
              >
                <ChevronLeft
                  size={17}
                />

                Previous
              </button>

              <button
                type="button"
                onClick={
                  listenSlide
                }
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[15px] bg-[#FFF0F7] px-5 text-xs font-black text-[#F52C8C]"
              >
                <Volume2
                  size={17}
                />

                Listen
              </button>

              {slideIndex ===
              BOOK_SLIDES.length -
                1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setMode(
                      "home"
                    )
                  }
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[15px] bg-[#7C3CFF] px-5 text-xs font-black text-white sm:justify-self-end"
                >
                  <Check
                    size={17}
                  />

                  Selesai
                </button>
              ) : (
                <button
                  type="button"
                  onClick={
                    nextSlide
                  }
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[15px] bg-[#7C3CFF] px-5 text-xs font-black text-white sm:justify-self-end"
                >
                  Next

                  <ChevronRight
                    size={17}
                  />
                </button>
              )}
            </div>
          </section>
        </div>
      )}

      {/* ===================================================
          SORTING
      =================================================== */}

      {mode === "sorting" && (
        <div className="mx-auto max-w-[1550px] px-2 py-4 sm:px-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() =>
                setMode("home")
              }
              className="inline-flex h-11 items-center gap-2 rounded-[14px] border border-[#DFE4EF] bg-white px-4 text-xs font-black text-[#596B88] shadow-sm"
            >
              <ArrowLeft size={16} />

              Aktiviti
            </button>

            <div className="flex items-center gap-2">
              <div className="rounded-full bg-[#EEE8FF] px-4 py-2 text-xs font-black text-[#7C3CFF]">
                Level {level} / 10
              </div>

              <div className="flex items-center gap-2 rounded-full bg-[#FFF5CA] px-4 py-2 text-xs font-black text-[#D78E00]">
                <Star
                  size={16}
                  fill="currentColor"
                />

                {totalStars}
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[210px_minmax(0,1fr)_250px]">
            {/* LEVELS */}

            <aside className="hidden xl:block">
              <Panel title="Tahap">
                <div className="space-y-2">
                  {Array.from(
                    { length: 10 },
                    (_, index) => {
                      const levelNumber =
                        index + 1;

                      const unlocked =
                        levelNumber ===
                          1 ||
                        Boolean(
                          levelResults[
                            levelNumber -
                              1
                          ]
                            ?.completed
                        );

                      return (
                        <button
                          key={
                            levelNumber
                          }
                          type="button"
                          disabled={
                            !unlocked
                          }
                          onClick={() =>
                            setLevel(
                              levelNumber
                            )
                          }
                          className={`flex w-full items-center justify-between rounded-[13px] border px-3 py-3 ${
                            level ===
                            levelNumber
                              ? "border-[#7C3CFF] bg-[#F3EFFF]"
                              : "border-[#E4E8F0] bg-white"
                          } ${
                            !unlocked
                              ? "opacity-40"
                              : ""
                          }`}
                        >
                          <span className="text-xs font-black text-[#344765]">
                            Level{" "}
                            {
                              levelNumber
                            }
                          </span>

                          {!unlocked ? (
                            <Lock
                              size={13}
                            />
                          ) : levelResults[
                              levelNumber
                            ]
                              ?.completed ? (
                            <Star
                              size={14}
                              fill="currentColor"
                              className="text-[#FFB800]"
                            />
                          ) : null}
                        </button>
                      );
                    }
                  )}
                </div>
              </Panel>
            </aside>

            {/* GAME */}

            <section
              className={`overflow-hidden rounded-[30px] border-4 border-white bg-white shadow-[0_18px_45px_rgba(31,73,113,0.17)] ${
                feedback ===
                "wrong"
                  ? "wrong-shake"
                  : ""
              }`}
            >
              {/* GARDEN */}

              <div
                className="relative min-h-[760px] overflow-hidden bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('/images/vokal-konsonan/garden-bg.png')",
                }}
              >
                {/* Overlay */}

                <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/5" />

                {/* INSTRUCTION */}

                <div className="relative z-10 mx-auto max-w-[820px] px-3 pt-4">
                  <div className="rounded-[20px] border-2 border-white/80 bg-white/90 px-4 py-3 text-center shadow-lg backdrop-blur-sm">
                    <p className="text-base font-black text-[#663C24] sm:text-lg">
                      Asingkan
                      Huruf Vokal
                      dan
                      Konsonan
                    </p>

                    <p className="mt-1 text-[11px] font-bold text-[#92725D]">
                      Tekan
                      bubble
                      sampai
                      POP,
                      kemudian
                      pilih bakul
                      yang betul.
                    </p>
                  </div>
                </div>

                {/* BUBBLES */}

                <div className="relative z-20 mx-auto mt-5 grid max-w-[1000px] grid-cols-3 gap-3 px-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                  {bubbleItems.map(
                    (
                      item,
                      index
                    ) => {
                      const popping =
                        poppingBubbleId ===
                        item.id;

                      return (
                        <BubbleButton
                          key={
                            item.id
                          }
                          item={
                            item
                          }
                          index={
                            index
                          }
                          popping={
                            popping
                          }
                          onPop={() =>
                            popBubble(
                              item
                            )
                          }
                          onDragStart={(
                            event
                          ) => {
                            event.dataTransfer.setData(
                              "text/plain",
                              item.id
                            );

                            setDraggedBubble(
                              item
                            );
                          }}
                          onDragEnd={() =>
                            setDraggedBubble(
                              null
                            )
                          }
                        />
                      );
                    }
                  )}
                </div>

                {/* SELECTED LETTER */}

                <div className="relative z-20 mt-5 flex min-h-[55px] justify-center px-3">
                  {selectedBubble ? (
                    <div className="rounded-full border-[3px] border-white bg-[#7137DD] px-6 py-2.5 text-sm font-black text-white shadow-[0_8px_20px_rgba(63,33,145,.25)]">
                      Huruf{" "}
                      <span className="text-[#FFF0A4]">
                        {
                          selectedBubble.letter
                        }
                      </span>{" "}
                      dipilih —
                      pilih bakul
                    </div>
                  ) : (
                    <div className="rounded-full border-2 border-white/80 bg-white/75 px-5 py-2.5 text-xs font-black text-[#53758C] shadow backdrop-blur-sm">
                      Tekan satu
                      bubble
                    </div>
                  )}
                </div>

                {/* BASKETS */}

                <div className="absolute inset-x-0 bottom-5 z-20 px-3 sm:px-5">
                  <div className="grid items-end gap-4 md:grid-cols-2">
                    <ImageBasket
                      src="/images/vokal-konsonan/basket-pink.png"
                      title="VOKAL"
                      subtitle="a, e, i, o, u"
                      category="vokal"
                      items={
                        vowelBasket
                      }
                      selected={
                        selectedBubble
                      }
                      dragged={
                        draggedBubble
                      }
                      onDrop={(
                        item,
                        fromDrag
                      ) =>
                        moveToBasket(
                          item,
                          "vokal",
                          fromDrag
                        )
                      }
                      onRemove={
                        removeSorted
                      }
                    />

                    <ImageBasket
                      src="/images/vokal-konsonan/basket-blue.png"
                      title="KONSONAN"
                      subtitle="b, c, d ... z"
                      category="konsonan"
                      items={
                        consonantBasket
                      }
                      selected={
                        selectedBubble
                      }
                      dragged={
                        draggedBubble
                      }
                      onDrop={(
                        item,
                        fromDrag
                      ) =>
                        moveToBasket(
                          item,
                          "konsonan",
                          fromDrag
                        )
                      }
                      onRemove={
                        removeSorted
                      }
                    />
                  </div>
                </div>
              </div>

              {/* CONTROL */}

              <div className="flex flex-wrap items-center justify-center gap-3 border-t border-[#E5E9F1] bg-white p-4">
                <button
                  type="button"
                  onClick={
                    loadLevel
                  }
                  className="inline-flex h-11 items-center gap-2 rounded-[14px] bg-[#EDF6FF] px-5 text-xs font-black text-[#1C83D8]"
                >
                  <RotateCcw
                    size={15}
                  />

                  Reset
                </button>

                <div className="rounded-full bg-[#EEE8FF] px-5 py-3 text-xs font-black text-[#7C3CFF]">
                  Selesai:{" "}
                  {sortedCount} /{" "}
                  {totalItems}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (
                      !selectedBubble
                    ) {
                      speak(
                        "Tekan satu bubble dahulu."
                      );

                      return;
                    }

                    speak(
                      selectedBubble.category ===
                        "vokal"
                        ? `${selectedBubble.letter} ialah huruf vokal`
                        : `${selectedBubble.letter} ialah huruf konsonan`
                    );
                  }}
                  className="inline-flex h-11 items-center gap-2 rounded-[14px] bg-[#FFF4D5] px-5 text-xs font-black text-[#D99000]"
                >
                  <Lightbulb
                    size={15}
                  />

                  Hint
                </button>
              </div>

              {feedback ===
                "correct" && (
                <FeedbackBox
                  type="correct"
                  title="Betul!"
                  text="Bagus! Huruf masuk ke bakul yang betul."
                />
              )}

              {feedback ===
                "wrong" && (
                <FeedbackBox
                  type="wrong"
                  title="Cuba Lagi!"
                  text="Semak sama ada huruf itu Vokal atau Konsonan."
                />
              )}

              {feedback ===
                "success" && (
                <div className="border-t border-[#E2E8EF] bg-[#EFFFF6] p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#08A989] text-white">
                        <Trophy
                          size={22}
                        />
                      </div>

                      <div>
                        <p className="font-black text-[#087A62]">
                          Hebat!
                          Level{" "}
                          {level}{" "}
                          selesai.
                        </p>

                        <div className="mt-1 flex gap-1">
                          {[0, 1, 2].map(
                            (
                              star
                            ) => (
                              <Star
                                key={
                                  star
                                }
                                size={
                                  18
                                }
                                fill="currentColor"
                                className="text-[#FFB800]"
                              />
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={
                        nextLevel
                      }
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-[#7C3CFF] px-5 text-xs font-black text-white"
                    >
                      {level === 10
                        ? "Keputusan"
                        : "Level Seterusnya"}

                      <ChevronRight
                        size={16}
                      />
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* RIGHT */}

            <aside className="space-y-4">
              <Panel title="Kemajuan">
                <ProgressCircle
                  progress={
                    gameProgress
                  }
                />
              </Panel>

              <Panel title="Cara Bermain">
                <div className="space-y-3">
                  <Instruction
                    number={1}
                    text="Tekan bubble huruf."
                  />

                  <Instruction
                    number={2}
                    text="Bubble akan POP dan hilang."
                  />

                  <Instruction
                    number={3}
                    text="Pilih bakul Vokal atau Konsonan."
                  />

                  <Instruction
                    number={4}
                    text="Selesaikan semua bubble."
                  />
                </div>
              </Panel>

              <Panel title="Pencapaian">
                <div className="text-center">
                  <p className="text-2xl font-black text-[#101A3B]">
                    {
                      completedLevels
                    }{" "}
                    / 10
                  </p>

                  <p className="mt-1 text-[9px] font-black uppercase tracking-[0.15em] text-[#9CA7B9]">
                    Level
                    Selesai
                  </p>

                  <div className="mt-4 flex justify-center gap-2">
                    <Star
                      size={20}
                      fill="currentColor"
                      className="text-[#FFB800]"
                    />

                    <span className="font-black">
                      {
                        totalStars
                      }
                    </span>
                  </div>
                </div>
              </Panel>
            </aside>
          </div>
        </div>
      )}

      {/* FINAL POPUP */}

      {showFinal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#101A3B]/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-[480px] rounded-[34px] border-4 border-white bg-white p-7 text-center shadow-[0_35px_100px_rgba(16,26,59,.3)]">
            <button
              type="button"
              onClick={() =>
                setShowFinal(
                  false
                )
              }
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F8]"
            >
              <X size={17} />
            </button>

            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#FFF0B2] text-[#FFB100]">
              <Crown size={45} />
            </div>

            <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-[#7C3CFF]">
              Tahniah
            </p>

            <h2 className="mt-2 text-3xl font-black text-[#101A3B]">
              Bubble Master!
            </h2>

            <p className="mt-3 text-sm font-medium text-[#7E8DA5]">
              Semua 10 level
              Vokal &
              Konsonan telah
              selesai.
            </p>

            <div className="mt-5 flex justify-center gap-2">
              {[0, 1, 2].map(
                (star) => (
                  <Star
                    key={star}
                    size={38}
                    fill="currentColor"
                    className="text-[#FFB800]"
                  />
                )
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setShowFinal(
                  false
                );

                setMode("home");
              }}
              className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-[16px] bg-[#7C3CFF] text-sm font-black text-white"
            >
              Kembali ke Aktiviti
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

/* =========================================================
   HOME
========================================================= */

function HomeScreen({
  onBook,
  onGame,
}: {
  onBook: () => void;
  onGame: () => void;
}) {
  return (
    <div className="mx-auto max-w-[1400px] px-3 py-5 sm:px-6">
      <section className="overflow-hidden rounded-[34px] bg-gradient-to-br from-[#B267FF] via-[#7C6EFF] to-[#55C6FF] p-1 shadow-[0_20px_50px_rgba(75,67,180,.18)]">
        <div className="rounded-[31px] bg-white/10 px-5 py-8 backdrop-blur-sm sm:px-9">
          <div className="text-center">
            <div className="inline-flex rounded-full bg-white/20 px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-white">
              Belajar • Main
              • Seronok
            </div>

            <h1 className="mt-4 text-[38px] font-black text-white sm:text-[52px]">
              Vokal &
              Konsonan
            </h1>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <HomeCard
              tone="pink"
              icon={
                <BookOpen
                  size={45}
                />
              }
              title="Slide Deck"
              description="Belajar Vokal dan Konsonan."
              button="Buka Buku"
              onClick={onBook}
            />

            <HomeCard
              tone="green"
              icon={
                <Play
                  size={45}
                  fill="currentColor"
                />
              }
              title="Bubble Sorting"
              description="Pop bubble dan asingkan huruf."
              button="Mula Main"
              onClick={onGame}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function HomeCard({
  tone,
  icon,
  title,
  description,
  button,
  onClick,
}: {
  tone: "pink" | "green";
  icon: ReactNode;
  title: string;
  description: string;
  button: string;
  onClick: () => void;
}) {
  const card =
    tone === "pink"
      ? "from-[#FFF2F8] to-[#FFE0EF]"
      : "from-[#F0FFF8] to-[#DDF7EB]";

  const buttonClass =
    tone === "pink"
      ? "from-[#FF5C9F] to-[#E72378]"
      : "from-[#48DB58] to-[#19A82F]";

  return (
    <div
      className={`rounded-[30px] border-4 border-white bg-gradient-to-b p-6 shadow-lg ${card}`}
    >
      <div className="text-[#7C3CFF]">
        {icon}
      </div>

      <h2 className="mt-5 text-2xl font-black text-[#30225A]">
        {title}
      </h2>

      <p className="mt-2 text-sm font-semibold text-[#796F87]">
        {description}
      </p>

      <button
        type="button"
        onClick={onClick}
        className={`mt-5 flex h-13 min-h-[52px] w-full items-center justify-center rounded-[18px] bg-gradient-to-b text-sm font-black text-white shadow-lg ${buttonClass}`}
      >
        {button}
      </button>
    </div>
  );
}

/* =========================================================
   BUBBLE BUTTON
========================================================= */

function BubbleButton({
  item,
  index,
  popping,
  onPop,
  onDragStart,
  onDragEnd,
}: {
  item: BubbleItem;
  index: number;
  popping: boolean;
  onPop: () => void;
  onDragStart: (
    event: DragEvent<HTMLButtonElement>
  ) => void;
  onDragEnd: () => void;
}) {
  const [
    imageError,
    setImageError,
  ] = useState(false);

  const fallbackColor: Record<
    BubbleTone,
    string
  > = {
    pink:
      "linear-gradient(145deg,#FF8BC1,#F3388D)",
    blue:
      "linear-gradient(145deg,#8BD0FF,#378FEA)",
    green:
      "linear-gradient(145deg,#80E9AA,#28B96B)",
    purple:
      "linear-gradient(145deg,#C192FF,#7541E0)",
    yellow:
      "linear-gradient(145deg,#FFE283,#F3AC24)",
  };

  return (
    <button
      type="button"
      draggable
      onClick={onPop}
      onDragStart={
        onDragStart
      }
      onDragEnd={
        onDragEnd
      }
      className={`relative mx-auto aspect-square w-full max-w-[145px] touch-manipulation select-none ${
        popping
          ? "bubble-popping"
          : "bubble-floating"
      }`}
      style={{
        animationDelay: `${(index % 6) * 0.18}s`,
      }}
    >
      {!imageError ? (
        <img
          src={bubbleAsset(
            item.tone
          )}
          alt=""
          draggable={false}
          onError={() =>
            setImageError(true)
          }
          className="pointer-events-none absolute inset-0 h-full w-full object-contain drop-shadow-[0_12px_16px_rgba(37,77,123,.18)]"
        />
      ) : (
        <div
          className="bubble-fallback"
          style={{
            background:
              fallbackColor[
                item.tone
              ],
          }}
        />
      )}

      <span className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-[52px] font-black leading-none text-white drop-shadow-[0_4px_2px_rgba(28,37,88,.3)] sm:text-[64px] lg:text-[72px]">
        {item.letter}
      </span>

      {popping && (
        <PopParticles />
      )}
    </button>
  );
}

/* =========================================================
   POP PARTICLES
========================================================= */

function PopParticles() {
  const particles = [
    ["-70px", "-55px"],
    ["0px", "-80px"],
    ["70px", "-50px"],
    ["80px", "12px"],
    ["55px", "65px"],
    ["0px", "85px"],
    ["-60px", "65px"],
    ["-85px", "5px"],
  ];

  return (
    <>
      {particles.map(
        ([x, y], index) => (
          <span
            key={index}
            className="pop-particle z-30"
            style={
              {
                "--particle-x":
                  x,
                "--particle-y":
                  y,
              } as React.CSSProperties
            }
          />
        )
      )}
    </>
  );
}

/* =========================================================
   IMAGE BASKET
========================================================= */

function ImageBasket({
  src,
  title,
  subtitle,
  category,
  items,
  selected,
  dragged,
  onDrop,
  onRemove,
}: {
  src: string;
  title: string;
  subtitle: string;
  category: LetterCategory;
  items: SortedItem[];
  selected: BubbleItem | null;
  dragged: BubbleItem | null;
  onDrop: (
    item: BubbleItem,
    fromDrag: boolean
  ) => void;
  onRemove: (
    item: SortedItem
  ) => void;
}) {
  return (
    <div
      className="relative mx-auto w-full max-w-[520px]"
      onDragOver={(event) =>
        event.preventDefault()
      }
      onDrop={(event) => {
        event.preventDefault();

        if (dragged) {
          onDrop(
            dragged,
            true
          );
        }
      }}
    >
      <button
        type="button"
        onClick={() => {
          if (selected) {
            onDrop(
              selected,
              false
            );
          }
        }}
        className={`relative block w-full touch-manipulation transition ${
          selected
            ? "scale-[1.02] drop-shadow-[0_0_16px_rgba(255,255,255,.85)]"
            : ""
        }`}
      >
        <img
          src={src}
          alt={title}
          draggable={false}
          className="pointer-events-none w-full select-none object-contain"
        />

        {/* LABEL */}

        <div className="pointer-events-none absolute inset-x-[23%] bottom-[18%] text-center text-white">
          <p className="text-lg font-black drop-shadow-[0_2px_2px_rgba(0,0,0,.25)] sm:text-2xl lg:text-3xl">
            {title}
          </p>

          <p className="mt-1 text-[9px] font-black drop-shadow sm:text-xs">
            {subtitle}
          </p>
        </div>

        {/* ITEMS INSIDE */}

        <div className="absolute inset-x-[14%] top-[27%] flex h-[32%] flex-wrap content-center justify-center gap-1 overflow-hidden">
          {items.map(
            (item) => (
              <span
                key={item.id}
                onClick={(
                  event
                ) => {
                  event.stopPropagation();

                  onRemove(
                    item
                  );
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-white/95 text-base font-black text-[#283958] shadow-md sm:h-11 sm:w-11 sm:text-lg"
              >
                {item.letter}
              </span>
            )
          )}
        </div>
      </button>

      <div className="mt-1 text-center">
        <span className="rounded-full bg-white/80 px-3 py-1 text-[9px] font-black text-[#6F7E95]">
          {category ===
          "vokal"
            ? "Huruf Vokal"
            : "Huruf Konsonan"}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   BOOK
========================================================= */

function BookSlideView({
  slide,
}: {
  slide: BookSlide;
}) {
  const isVowel =
    slide.type ===
      "intro-vowel" ||
    slide.type === "vowel";

  return (
    <div className="mx-auto flex min-h-[520px] max-w-[900px] flex-col items-center justify-center rounded-[30px] border border-[#E2E6EF] bg-[#FCFCFF] px-5 py-8 text-center">
      <div
        className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] ${
          isVowel
            ? "bg-[#FFF0F7] text-[#F52C8C]"
            : "bg-[#EEE8FF] text-[#7C3CFF]"
        }`}
      >
        {slide.groupLabel ??
          (isVowel
            ? "Huruf Vokal"
            : "Huruf Konsonan")}
      </div>

      <h2 className="mt-5 text-3xl font-black text-[#101A3B] sm:text-4xl">
        {slide.title}
      </h2>

      <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-[#7D8CA6]">
        {slide.subtitle}
      </p>

      {slide.letter && (
        <div className="mt-7 text-[180px] font-black leading-none text-[#F52C8C] sm:text-[240px]">
          {slide.letter}
        </div>
      )}

      {slide.examples && (
        <div className="mt-8 flex max-w-[740px] flex-wrap justify-center gap-3">
          {slide.examples.map(
            (example) => (
              <button
                key={`${slide.id}-${example}`}
                type="button"
                onClick={() =>
                  speak(
                    example
                  )
                }
                className={`flex min-h-[80px] min-w-[80px] items-center justify-center rounded-[22px] border bg-white px-4 text-3xl font-black shadow-sm ${
                  isVowel
                    ? "border-[#F3D1E0] text-[#F52C8C]"
                    : "border-[#D9D0FF] text-[#7C3CFF]"
                }`}
              >
                {example}
              </button>
            )
          )}
        </div>
      )}

      {slide.type ===
        "compare" && (
        <div className="mt-8 grid w-full max-w-[720px] gap-4 sm:grid-cols-2">
          <div className="rounded-[25px] bg-[#EFFFF7] p-6">
            <p className="font-black text-[#08A989]">
              VOKAL
            </p>

            <p className="mt-4 text-3xl font-black tracking-[0.13em] text-[#08A989]">
              a e i o u
            </p>
          </div>

          <div className="rounded-[25px] bg-[#F5F1FF] p-6">
            <p className="font-black text-[#7C3CFF]">
              KONSONAN
            </p>

            <p className="mt-4 text-sm font-black leading-7 text-[#7C3CFF]">
              b c d f g h j
              k l m n p q r
              s t v w x y z
            </p>
          </div>
        </div>
      )}

      {slide.type ===
        "finish" && (
        <div className="mt-8 flex gap-2">
          {[0, 1, 2].map(
            (star) => (
              <Star
                key={star}
                size={38}
                fill="currentColor"
                className="text-[#FFB800]"
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   GENERAL
========================================================= */

function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[22px] border border-[#DFE4EF] bg-white p-4 shadow-[0_8px_24px_rgba(25,39,74,.045)]">
      <h3 className="mb-4 text-sm font-black text-[#101A3B]">
        {title}
      </h3>

      {children}
    </section>
  );
}

function Instruction({
  number,
  text,
}: {
  number: number;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7C3CFF] text-[10px] font-black text-white">
        {number}
      </span>

      <p className="pt-0.5 text-xs font-medium leading-5 text-[#7C8BA4]">
        {text}
      </p>
    </div>
  );
}

function ProgressCircle({
  progress,
}: {
  progress: number;
}) {
  return (
    <div className="flex justify-center">
      <div
        className="flex h-28 w-28 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(#7C3CFF ${progress}%, #ECEAF7 ${progress}% 100%)`,
        }}
      >
        <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white">
          <span className="text-xl font-black text-[#101A3B]">
            {progress}%
          </span>

          <span className="text-[9px] font-bold text-[#9CA7B9]">
            Selesai
          </span>
        </div>
      </div>
    </div>
  );
}

function FeedbackBox({
  type,
  title,
  text,
}: {
  type: "correct" | "wrong";
  title: string;
  text: string;
}) {
  const style =
    type === "correct"
      ? "bg-[#EAFBF5] text-[#087B65]"
      : "bg-[#FFF1F6] text-[#C51D68]";

  return (
    <div
      className={`border-t border-white p-4 ${style}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${
            type === "correct"
              ? "bg-[#08A989]"
              : "bg-[#F52C8C]"
          }`}
        >
          {type === "correct" ? (
            <Check size={18} />
          ) : (
            <X size={18} />
          )}
        </div>

        <div>
          <p className="font-black">
            {title}
          </p>

          <p className="text-xs font-medium opacity-75">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}