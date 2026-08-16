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
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Crown,
  Eye,
  Gift,
  Home,
  Lightbulb,
  Lock,
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

type Difficulty = "easy" | "medium" | "hard";

type EasyType = "uppercase" | "lowercase";

type MediumCase = "uppercase" | "lowercase" | "mixed";

type QuestionDirection = "before" | "after";

type EasyItem = {
  id: string;
  value: string;
  order: number;
};


type MediumQuestion = {
  sequence: string[];
  missingIndexes: number[];
  options: string[];
};

type HardQuestion = {
  id: string;
  letter: string;
  direction: QuestionDirection;
  answer: string;
  userAnswer: string;
};

type LevelResult = {
  stars: number;
  completed: boolean;
};

type HardLevelConfig = {
  label: string;
  before: number;
  after: number;
  caseMode: "uppercase" | "lowercase" | "mixed" | "lowercase-heavy";
};

/* =========================================================
   CONSTANTS
========================================================= */

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz".split("");

const EASY_LEVEL_COUNTS = [
  26,
  5,
  5,
  6,
  6,
  7,
  8,
  8,
  10,
  10,
];

const MEDIUM_MISSING_COUNTS = [
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  3,
  3,
  3,
];

const HARD_CONFIG: Record<number, HardLevelConfig> = {
  1: {
    label: "Before Uppercase",
    before: 8,
    after: 0,
    caseMode: "uppercase",
  },
  2: {
    label: "Before Lowercase",
    before: 8,
    after: 0,
    caseMode: "lowercase",
  },
  3: {
    label: "After Uppercase",
    before: 0,
    after: 8,
    caseMode: "uppercase",
  },
  4: {
    label: "After Lowercase",
    before: 0,
    after: 8,
    caseMode: "lowercase",
  },
  5: {
    label: "Uppercase Mix",
    before: 4,
    after: 4,
    caseMode: "uppercase",
  },
  6: {
    label: "Before + After",
    before: 4,
    after: 4,
    caseMode: "mixed",
  },
  7: {
    label: "Mixed Case",
    before: 4,
    after: 4,
    caseMode: "mixed",
  },
  8: {
    label: "Lowercase Challenge",
    before: 4,
    after: 4,
    caseMode: "lowercase-heavy",
  },
  9: {
    label: "Advanced Mix",
    before: 4,
    after: 4,
    caseMode: "mixed",
  },
  10: {
    label: "Final Challenge",
    before: 4,
    after: 4,
    caseMode: "mixed",
  },
};

/* =========================================================
   GENERIC HELPERS
========================================================= */

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

function randomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function starsFromScore(score: number) {
  if (score >= 100) return 3;
  if (score >= 80) return 2;
  if (score >= 60) return 1;
  return 0;
}

function speak(text: string) {
  if (typeof window === "undefined") return;
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(text);
  speech.rate = 0.75;
  speech.pitch = 1.05;

  window.speechSynthesis.speak(speech);
}

/* =========================================================
   EASY GENERATOR
========================================================= */

function generateEasyItems(
  level: number,
  type: EasyType
): EasyItem[] {
  const count = EASY_LEVEL_COUNTS[level - 1] ?? 5;

  const source = type === "uppercase" ? UPPERCASE : LOWERCASE;

  if (level === 1) {
    return source.map((value, index) => ({
      id: `${type}-${value}`,
      value,
      order: index,
    }));
  }

  const safeCount = Math.min(count, source.length);
  const maxStart = source.length - safeCount;
  const start = randomInteger(0, Math.max(0, maxStart));

  return source
    .slice(start, start + safeCount)
    .map((value, index) => ({
      id: `${type}-${value}`,
      value,
      order: start + index,
    }));
}

/* =========================================================
   MEDIUM GENERATOR
========================================================= */

function generateMediumQuestion(
  level: number,
  letterCase: MediumCase
): MediumQuestion {
  const sequenceLength =
    level <= 3 ? 4 : level <= 6 ? 5 : 6;

  const missingCount =
    MEDIUM_MISSING_COUNTS[level - 1] ?? 1;

  let useUppercase = true;

  if (letterCase === "lowercase") {
    useUppercase = false;
  }

  if (letterCase === "mixed") {
    useUppercase = Math.random() >= 0.5;
  }

  const source = useUppercase ? UPPERCASE : LOWERCASE;

  const maxStart = source.length - sequenceLength;
  const start = randomInteger(0, maxStart);

  const sequence = source.slice(
    start,
    start + sequenceLength
  );

  const candidateIndexes = shuffle(
    Array.from(
      { length: sequenceLength },
      (_, index) => index
    )
  );

  const missingIndexes = candidateIndexes
    .slice(0, Math.min(missingCount, sequenceLength - 1))
    .sort((a, b) => a - b);

  const correctAnswers = missingIndexes.map(
    (index) => sequence[index]
  );

  const optionSet = new Set<string>(correctAnswers);

  while (optionSet.size < Math.min(correctAnswers.length + 3, 6)) {
    const randomSourceIndex = clamp(
      start + randomInteger(-3, sequenceLength + 2),
      0,
      source.length - 1
    );

    optionSet.add(source[randomSourceIndex]);
  }

  return {
    sequence,
    missingIndexes,
    options: shuffle(Array.from(optionSet)),
  };
}

/* =========================================================
   HARD GENERATOR
========================================================= */

function getSourceForHardQuestion(
  config: HardLevelConfig,
  index: number
) {
  if (config.caseMode === "uppercase") {
    return UPPERCASE;
  }

  if (config.caseMode === "lowercase") {
    return LOWERCASE;
  }

  if (config.caseMode === "lowercase-heavy") {
    return index < 6 ? LOWERCASE : UPPERCASE;
  }

  return index % 2 === 0 ? UPPERCASE : LOWERCASE;
}

function generateHardQuestions(level: number): HardQuestion[] {
  const config = HARD_CONFIG[level] ?? HARD_CONFIG[1];

  const directions: QuestionDirection[] = [
    ...Array.from(
      { length: config.before },
      () => "before" as QuestionDirection
    ),
    ...Array.from(
      { length: config.after },
      () => "after" as QuestionDirection
    ),
  ];

  const shuffledDirections = shuffle(directions);

  /*
    Important:
    usedLetters stores uppercase representation.
    Therefore q and Q are treated as the same letter.
    No duplicate letters within one level.
  */
  const usedLetters = new Set<string>();

  const questions: HardQuestion[] = [];

  shuffledDirections.forEach((direction, index) => {
    const source = getSourceForHardQuestion(config, index);

    let selectedIndex = 0;
    let selectedLetter = "";

    let attempts = 0;

    do {
      const minimumIndex =
        direction === "before" ? 1 : 0;

      const maximumIndex =
        direction === "after"
          ? source.length - 2
          : source.length - 1;

      selectedIndex = randomInteger(
        minimumIndex,
        maximumIndex
      );

      selectedLetter = source[selectedIndex];

      attempts += 1;
    } while (
      usedLetters.has(selectedLetter.toUpperCase()) &&
      attempts < 100
    );

    usedLetters.add(selectedLetter.toUpperCase());

    const answerIndex =
      direction === "before"
        ? selectedIndex - 1
        : selectedIndex + 1;

    questions.push({
      id: `hard-${level}-${index}-${Math.random()
        .toString(36)
        .slice(2)}`,
      letter: selectedLetter,
      direction,
      answer: source[answerIndex],
      userAnswer: "",
    });
  });

  return questions;
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function ABCOrderPage() {
  const [difficulty, setDifficulty] =
    useState<Difficulty>("easy");

  const [easyType, setEasyType] =
    useState<EasyType>("uppercase");

  const [mediumCase, setMediumCase] =
    useState<MediumCase>("uppercase");

  const [level, setLevel] = useState(1);

  /* EASY */
  const [easyItems, setEasyItems] = useState<EasyItem[]>([]);
  const [easyPlaced, setEasyPlaced] = useState<
    Array<EasyItem | null>
  >([]);

  const [selectedEasyItem, setSelectedEasyItem] =
    useState<EasyItem | null>(null);

  const [draggedEasyItem, setDraggedEasyItem] =
    useState<EasyItem | null>(null);


  /* MEDIUM */
  const [mediumQuestion, setMediumQuestion] =
    useState<MediumQuestion | null>(null);

  const [mediumAnswers, setMediumAnswers] = useState<
    Record<number, string>
  >({});

  const [selectedMediumOption, setSelectedMediumOption] =
    useState<string | null>(null);

  const [draggedMediumOption, setDraggedMediumOption] =
    useState<string | null>(null);

  const [showMediumGuide, setShowMediumGuide] =
    useState(true);

  /* HARD */
  const [hardQuestions, setHardQuestions] = useState<
    HardQuestion[]
  >([]);

  const [hardReviewOpen, setHardReviewOpen] =
    useState(false);

  const [hardReviewIndex, setHardReviewIndex] =
    useState(0);

  const [hardGameStarted, setHardGameStarted] =
    useState(false);

  const swipeStartX = useRef<number | null>(null);

  /* GLOBAL */
  const [feedback, setFeedback] = useState<
    "idle" | "success" | "retry"
  >("idle");

  const [score, setScore] = useState(0);

  const [showCompletion, setShowCompletion] =
    useState(false);

  const [levelResults, setLevelResults] = useState<
    Record<Difficulty, Record<number, LevelResult>>
  >({
    easy: {},
    medium: {},
    hard: {},
  });

  /* =======================================================
     LOAD LEVEL
  ======================================================= */

  useEffect(() => {
    loadCurrentLevel();
  }, [difficulty, level, easyType, mediumCase]);

  function loadCurrentLevel() {
    setFeedback("idle");
    setScore(0);

    setSelectedEasyItem(null);
    setDraggedEasyItem(null);

    setSelectedMediumOption(null);
    setDraggedMediumOption(null);

    if (difficulty === "easy") {
      const generated = generateEasyItems(level, easyType);

      setEasyItems(shuffle(generated));

      setEasyPlaced(
        Array.from({ length: generated.length }, () => null)
      );
    }

    if (difficulty === "medium") {
      setMediumQuestion(
        generateMediumQuestion(
          level,
          mediumCase
        )
      );

      setMediumAnswers({});

      /*
        Medium has optional guide.
        Easy has no guide.
      */
      setShowMediumGuide(level <= 5);
    }

    if (difficulty === "hard") {
      setHardQuestions(
        generateHardQuestions(level)
      );

      setHardReviewIndex(0);
      setHardReviewOpen(true);
      setHardGameStarted(false);
    }
  }

  /* =======================================================
     TOTAL PROGRESS
  ======================================================= */

  const totalCompletedLevels = useMemo(() => {
    return Object.values(
      levelResults[difficulty]
    ).filter((result) => result.completed).length;
  }, [difficulty, levelResults]);

  const totalStars = useMemo(() => {
    return Object.values(
      levelResults[difficulty]
    ).reduce(
      (total, result) => total + result.stars,
      0
    );
  }, [difficulty, levelResults]);

  const progressPercent =
    (totalCompletedLevels / 10) * 100;

  /* =======================================================
     EASY
  ======================================================= */

  const sortedEasyReference = useMemo(() => {
    return [...easyItems, ...easyPlaced.filter(Boolean)]
      .filter(
        (item): item is EasyItem => Boolean(item)
      )
      .sort((a, b) => a.order - b.order);
  }, [easyItems, easyPlaced]);

  function placeEasyItem(
    item: EasyItem,
    slotIndex: number
  ) {
    if (easyPlaced[slotIndex]) return;

    const expected =
      sortedEasyReference[slotIndex];

    if (!expected) return;

    if (item.value !== expected.value) {
      setFeedback("retry");

      window.setTimeout(() => {
        setFeedback("idle");
      }, 650);

      return;
    }

    setEasyPlaced((previous) => {
      const updated = [...previous];
      updated[slotIndex] = item;
      return updated;
    });

    setEasyItems((previous) =>
      previous.filter(
        (candidate) => candidate.id !== item.id
      )
    );

    setSelectedEasyItem(null);
    setDraggedEasyItem(null);

    speak(item.value);
  }

  function removeEasyItem(slotIndex: number) {
    const item = easyPlaced[slotIndex];

    if (!item) return;

    setEasyPlaced((previous) => {
      const updated = [...previous];
      updated[slotIndex] = null;
      return updated;
    });

    setEasyItems((previous) =>
      shuffle([...previous, item])
    );
  }

  function checkEasy() {
    if (
      easyPlaced.length === 0 ||
      !easyPlaced.every(Boolean)
    ) {
      setFeedback("retry");
      return;
    }

    completeCurrentLevel(100);
  }


  /* =======================================================
     MEDIUM
  ======================================================= */

  function placeMediumAnswer(
    option: string,
    missingIndex: number
  ) {
    setMediumAnswers((previous) => ({
      ...previous,
      [missingIndex]: option,
    }));

    setSelectedMediumOption(null);
    setDraggedMediumOption(null);

    speak(option);
  }

  function removeMediumAnswer(index: number) {
    setMediumAnswers((previous) => {
      const updated = { ...previous };
      delete updated[index];
      return updated;
    });
  }

  function checkMedium() {
    if (!mediumQuestion) return;

    const total =
      mediumQuestion.missingIndexes.length;

    let correct = 0;

    mediumQuestion.missingIndexes.forEach(
      (missingIndex) => {
        if (
          mediumAnswers[missingIndex] ===
          mediumQuestion.sequence[missingIndex]
        ) {
          correct += 1;
        }
      }
    );

    const percentage = Math.round(
      (correct / total) * 100
    );

    setScore(percentage);

    if (percentage < 80) {
      setFeedback("retry");
      return;
    }

    completeCurrentLevel(percentage);
  }

  /* =======================================================
     HARD
  ======================================================= */

  function startHardGame() {
    setHardReviewOpen(false);
    setHardGameStarted(true);
    setFeedback("idle");
  }

  function newHardQuestionSet() {
    setHardQuestions(
      generateHardQuestions(level)
    );

    setScore(0);
    setFeedback("idle");
  }

  function updateHardAnswer(
    questionId: string,
    answer: string
  ) {
    const oneCharacter = answer.slice(-1);

    setHardQuestions((previous) =>
      previous.map((question) =>
        question.id === questionId
          ? {
              ...question,
              userAnswer: oneCharacter,
            }
          : question
      )
    );
  }

  function checkHard() {
    if (hardQuestions.length !== 8) {
      return;
    }

    const allAnswered = hardQuestions.every(
      (question) =>
        question.userAnswer.trim().length === 1
    );

    if (!allAnswered) {
      setFeedback("retry");
      return;
    }

    const correct = hardQuestions.filter(
      (question) =>
        question.userAnswer === question.answer
    ).length;

    const percentage = Math.round(
      (correct / 8) * 100
    );

    setScore(percentage);

    /*
      With 8 questions:
      7/8 = 87.5%
      6/8 = 75%

      Therefore passing at least 80%
      effectively requires 7/8.
    */
    if (percentage < 80) {
      setFeedback("retry");
      return;
    }

    completeCurrentLevel(percentage);
  }

  /* =======================================================
     HARD REVIEW SLIDES
  ======================================================= */

  const reviewUpper =
    UPPERCASE[hardReviewIndex];

  const reviewLower =
    LOWERCASE[hardReviewIndex];

  function previousReviewSlide() {
    setHardReviewIndex((previous) =>
      Math.max(0, previous - 1)
    );
  }

  function nextReviewSlide() {
    setHardReviewIndex((previous) =>
      Math.min(25, previous + 1)
    );
  }

  function handleReviewPointerDown(
    event: ReactPointerEvent<HTMLDivElement>
  ) {
    swipeStartX.current = event.clientX;
  }

  function handleReviewPointerUp(
    event: ReactPointerEvent<HTMLDivElement>
  ) {
    if (swipeStartX.current === null) return;

    const difference =
      event.clientX - swipeStartX.current;

    swipeStartX.current = null;

    if (Math.abs(difference) < 45) {
      return;
    }

    if (difference < 0) {
      nextReviewSlide();
    } else {
      previousReviewSlide();
    }
  }

  /* =======================================================
     COMPLETE LEVEL
  ======================================================= */

  function completeCurrentLevel(
    percentage: number
  ) {
    const stars = starsFromScore(percentage);

    setScore(percentage);
    setFeedback("success");

    setLevelResults((previous) => ({
      ...previous,
      [difficulty]: {
        ...previous[difficulty],
        [level]: {
          completed: true,
          stars,
        },
      },
    }));

    if (level === 10) {
      window.setTimeout(() => {
        setShowCompletion(true);
      }, 700);
    }
  }

  function nextLevel() {
    if (level >= 10) {
      setShowCompletion(true);
      return;
    }

    setLevel((previous) => previous + 1);
  }

  function changeDifficulty(
    nextDifficulty: Difficulty
  ) {
    setDifficulty(nextDifficulty);
    setLevel(1);
    setFeedback("idle");
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main
      className="min-h-screen text-[#4A2A13]"
      style={{
        backgroundColor: "#FFF8E8",
        backgroundImage:
          "linear-gradient(rgba(255,250,231,0.88), rgba(255,248,225,0.94)), url('/images/abc-order/bee-honey-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
      }}
    >
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html {
          -webkit-text-size-adjust: 100%;
        }

        body {
          margin: 0;
          background: #fff8e8;
        }

        button,
        input {
          font-family: inherit;
        }

        @keyframes floatA {
          0%,
          100% {
            transform: translateY(0) rotate(-5deg);
          }

          50% {
            transform: translateY(-13px) rotate(2deg);
          }
        }

        @keyframes floatB {
          0%,
          100% {
            transform: translateY(-5px) rotate(4deg);
          }

          50% {
            transform: translateY(11px) rotate(-2deg);
          }
        }

        @keyframes floatC {
          0%,
          100% {
            transform: translateY(4px) rotate(3deg);
          }

          50% {
            transform: translateY(-11px) rotate(-4deg);
          }
        }

        .float-a {
          animation: floatA 4.2s ease-in-out infinite;
        }

        .float-b {
          animation: floatB 5s ease-in-out infinite;
        }

        .float-c {
          animation: floatC 4.6s ease-in-out infinite;
        }

        @keyframes wrongShake {
          0%,
          100% {
            transform: translateX(0);
          }

          25% {
            transform: translateX(-7px);
          }

          50% {
            transform: translateX(7px);
          }

          75% {
            transform: translateX(-4px);
          }
        }

        .wrong-shake {
          animation: wrongShake 0.42s ease-in-out;
        }

        @keyframes beeFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0) rotate(-5deg);
          }

          50% {
            transform: translate3d(10px, -12px, 0) rotate(6deg);
          }
        }

        @keyframes beeFlyAcross {
          0% {
            transform: translateX(-40px) translateY(4px) rotate(-8deg);
          }

          50% {
            transform: translateX(34px) translateY(-12px) rotate(8deg);
          }

          100% {
            transform: translateX(-40px) translateY(4px) rotate(-8deg);
          }
        }

        @keyframes honeyGlow {
          0%,
          100% {
            filter: drop-shadow(0 5px 9px rgba(240, 158, 0, 0.18));
          }

          50% {
            filter: drop-shadow(0 8px 18px rgba(240, 158, 0, 0.38));
          }
        }

        @keyframes honeyPop {
          0% {
            transform: scale(0.96);
          }

          50% {
            transform: scale(1.035);
          }

          100% {
            transform: scale(1);
          }
        }

        .bee-float {
          animation: beeFloat 3.2s ease-in-out infinite;
        }

        .bee-fly {
          animation: beeFlyAcross 7s ease-in-out infinite;
        }

        .honey-glow {
          animation: honeyGlow 2.8s ease-in-out infinite;
        }

        .honey-pop {
          animation: honeyPop 0.28s ease-out;
        }

        .kg-letter {
          font-family:
            "KG Blank Space Solid",
            "KG Blank Space",
            "Arial Rounded MT Bold",
            "Trebuchet MS",
            sans-serif;
          font-weight: 900;
          line-height: 1;
          letter-spacing: 0.01em;
        }

        .honeycomb-tile {
          background:
            linear-gradient(145deg, rgba(255,255,255,0.97), rgba(255,249,220,0.98));
          box-shadow:
            inset 0 0 0 2px rgba(255, 200, 68, 0.18),
            0 8px 20px rgba(118, 74, 15, 0.08);
        }

        .honeycomb-slot {
          background:
            linear-gradient(145deg, rgba(255,253,239,0.96), rgba(255,248,213,0.92));
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="bee-float absolute left-[2%] top-[22%] text-4xl opacity-90 sm:text-5xl">
          🐝
        </div>

        <div
          className="bee-fly absolute right-[7%] top-[34%] hidden text-4xl opacity-80 md:block"
          style={{ animationDelay: "0.8s" }}
        >
          🐝
        </div>

        <div
          className="bee-float absolute bottom-[12%] right-[3%] hidden text-5xl opacity-80 lg:block"
          style={{ animationDelay: "1.4s" }}
        >
          🐝
        </div>

        <div className="absolute -left-10 bottom-4 h-40 w-40 rounded-full bg-[#FFD94F]/20 blur-3xl" />
        <div className="absolute -right-10 top-28 h-52 w-52 rounded-full bg-[#FFBF00]/15 blur-3xl" />
      </div>

      {/* HEADER */}

      <header className="relative z-10 border-b border-[#F1D891] bg-[#FFFDF6]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-gradient-to-br from-[#FFC928] to-[#EE9300] text-lg font-black text-[#5A330A] shadow-[0_8px_22px_rgba(219,142,0,0.24)]">
              FD
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-black tracking-[0.05em] text-[#4A2A13] sm:text-[16px]">
                  FD ARCADIA
                </span>

                <Sparkles
                  size={14}
                  className="text-[#C97900]"
                />
              </div>

              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#A3AFC3]">
                LearningHub
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden rounded-[14px] bg-[#FFF0B8] px-4 py-2 text-[11px] font-black text-[#C97900] sm:block">
              Susun ABC
            </div>

            <a
              href="/huruf-membaca"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] border border-[#EED89C] bg-white px-3 text-xs font-black text-[#4A2A13] shadow-sm transition hover:-translate-y-0.5 sm:px-4"
            >
              <Home size={16} />

              <span className="hidden sm:inline">
                Back to Home
              </span>
            </a>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-[1600px] px-3 py-5 sm:px-6 lg:px-8">
        {/* HERO */}

        <section className="honey-glow relative mb-5 overflow-hidden rounded-[30px] border border-[#F0D899] bg-[#FFFDF8]/95 shadow-[0_10px_30px_rgba(25,39,74,0.055)]">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#FFF0B8] blur-3xl" />

          <div className="grid gap-6 px-5 py-6 md:grid-cols-[1fr_auto] md:items-center md:px-8 lg:px-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF0B8] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-[#C97900]">
                <Star
                  size={13}
                  fill="currentColor"
                />

                Bee Alphabet Adventure
              </div>

              <h1 className="mt-3 text-[34px] font-black tracking-[-0.04em] text-[#4A2A13] sm:text-[46px]">
                Susun ABC
              </h1>

              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[#8A6A43]">
                Susun, lengkapkan dan kuasai turutan
                huruf melalui aktiviti berperingkat.
              </p>
            </div>

            <div className="hidden items-center gap-1 md:flex">
              <div className="float-a">
                <HeroLetter
                  letter="A"
                  className="from-[#A35EFF] to-[#6B32F5]"
                />
              </div>

              <div className="float-b">
                <HeroLetter
                  letter="B"
                  className="from-[#FF72A9] to-[#F52C8C]"
                />
              </div>

              <div className="float-c">
                <HeroLetter
                  letter="C"
                  className="from-[#46DCC3] to-[#08A989]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* DIFFICULTY */}

        <section className="mb-5 grid gap-3 sm:grid-cols-3">
          <DifficultyCard
            active={difficulty === "easy"}
            tone="green"
            title="Easy Bee"
            subtitle="Drag & Drop"
            description="Susun huruf mengikut turutan."
            onClick={() => changeDifficulty("easy")}
          />

          <DifficultyCard
            active={difficulty === "medium"}
            tone="pink"
            title="Busy Bee"
            subtitle="Missing Sequence"
            description="Lengkapkan huruf yang hilang."
            onClick={() => changeDifficulty("medium")}
          />

          <DifficultyCard
            active={difficulty === "hard"}
            tone="purple"
            title="Queen Bee"
            subtitle="Before & After"
            description="10 Level Challenge."
            onClick={() => changeDifficulty("hard")}
          />
        </section>

        <div className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)_310px]">
          {/* LEFT SIDEBAR */}

          <aside className="space-y-4">
            {difficulty === "easy" && (
              <Panel title="Pilih Aktiviti">
                <div className="space-y-2">
                  <ModeOption
                    active={easyType === "uppercase"}
                    label="Alphabet A-Z"
                    sublabel="Huruf Besar"
                    onClick={() =>
                      setEasyType("uppercase")
                    }
                  />

                  <ModeOption
                    active={easyType === "lowercase"}
                    label="Alphabet a-z"
                    sublabel="Huruf Kecil"
                    onClick={() =>
                      setEasyType("lowercase")
                    }
                  />
                </div>
              </Panel>
            )}

            {difficulty === "medium" && (
              <Panel title="Jenis Huruf">
                <div className="space-y-2">
                  <ModeOption
                    active={
                      mediumCase === "uppercase"
                    }
                    label="Huruf Besar"
                    sublabel="A-Z"
                    onClick={() =>
                      setMediumCase("uppercase")
                    }
                  />

                  <ModeOption
                    active={
                      mediumCase === "lowercase"
                    }
                    label="Huruf Kecil"
                    sublabel="a-z"
                    onClick={() =>
                      setMediumCase("lowercase")
                    }
                  />

                  <ModeOption
                    active={mediumCase === "mixed"}
                    label="Campuran"
                    sublabel="A-Z + a-z"
                    onClick={() =>
                      setMediumCase("mixed")
                    }
                  />
                </div>
              </Panel>
            )}

            {difficulty === "hard" && (
              <Panel title="Hard Challenge">
                <div className="rounded-[16px] bg-[#FFF4C9] p-3">
                  <p className="text-xs font-black text-[#C97900]">
                    {HARD_CONFIG[level].label}
                  </p>

                  <p className="mt-1 text-[10px] font-medium leading-5 text-[#7F8EA6]">
                    8 soalan unik setiap level.
                  </p>

                  {level >= 6 && (
                    <div className="mt-2 flex gap-2">
                      <span className="rounded-full bg-white px-2 py-1 text-[9px] font-black text-[#F52C8C]">
                        4 Before
                      </span>

                      <span className="rounded-full bg-white px-2 py-1 text-[9px] font-black text-[#08A989]">
                        4 After
                      </span>
                    </div>
                  )}
                </div>
              </Panel>
            )}

            <Panel title="Tahap">
              <div className="space-y-2">
                {Array.from(
                  { length: 10 },
                  (_, index) => {
                    const levelNumber = index + 1;

                    const result =
                      levelResults[difficulty][
                        levelNumber
                      ];

                    const unlocked =
                      levelNumber === 1 ||
                      Boolean(
                        levelResults[difficulty][
                          levelNumber - 1
                        ]?.completed
                      );

                    return (
                      <button
                        key={levelNumber}
                        type="button"
                        disabled={!unlocked}
                        onClick={() =>
                          setLevel(levelNumber)
                        }
                        className={`flex w-full items-center justify-between rounded-[14px] border px-3 py-3 text-left transition ${
                          level === levelNumber
                            ? "border-[#7C3CFF] bg-[#FFF4C9]"
                            : "border-[#E9D9B4] bg-[#FFFDF8]"
                        } ${
                          unlocked
                            ? "hover:-translate-y-0.5"
                            : "cursor-not-allowed opacity-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black ${
                              level === levelNumber
                                ? "bg-[#7C3CFF] text-white"
                                : "bg-[#FFF3C6] text-[#9A6A22]"
                            }`}
                          >
                            {levelNumber}
                          </span>

                          <span className="text-xs font-black text-[#513316]">
                            Level {levelNumber}
                          </span>
                        </div>

                        {!unlocked ? (
                          <Lock
                            size={13}
                            className="text-[#C1A879]"
                          />
                        ) : result?.completed ? (
                          <div className="flex gap-0.5">
                            {[0, 1, 2].map(
                              (star) => (
                                <Star
                                  key={star}
                                  size={12}
                                  fill={
                                    star <
                                    result.stars
                                      ? "currentColor"
                                      : "none"
                                  }
                                  className={
                                    star <
                                    result.stars
                                      ? "text-[#FFB800]"
                                      : "text-[#E6D7B3]"
                                  }
                                />
                              )
                            )}
                          </div>
                        ) : null}
                      </button>
                    );
                  }
                )}
              </div>
            </Panel>
          </aside>

          {/* MAIN GAME */}

          <section
            className={`rounded-[30px] border border-[#EED89C] bg-white shadow-[0_10px_28px_rgba(25,39,74,0.05)] ${
              feedback === "retry"
                ? "wrong-shake"
                : ""
            }`}
          >
            <div className="border-b border-[#F0DFB7] px-4 py-4 sm:px-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF0B8] px-3 py-1.5 text-[11px] font-black text-[#C97900]">
                    <Trophy size={14} />

                    LEVEL {level} / 10
                  </div>

                  <h2 className="mt-3 text-xl font-black text-[#4A2A13] sm:text-2xl">
                    {difficulty === "easy" &&
                      "Susun Mengikut Turutan"}

                    {difficulty === "medium" &&
                      "Lengkapkan Turutan"}

                    {difficulty === "hard" &&
                      "Before & After Challenge"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (difficulty === "hard") {
                      newHardQuestionSet();
                    } else {
                      loadCurrentLevel();
                    }
                  }}
                  className="inline-flex h-10 items-center gap-2 rounded-[13px] bg-[#FFF0B5] px-3 text-xs font-black text-[#C97900]"
                >
                  <RefreshCcw size={15} />
                  New Question
                </button>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#F5E7BD]">
                <div
                  className="h-full rounded-full bg-[#7C3CFF]"
                  style={{
                    width: `${level * 10}%`,
                  }}
                />
              </div>
            </div>

            {/* EASY */}

            {difficulty === "easy" && (
<div className="p-4 sm:p-6">
                <InstructionBanner>
                  {level === 1
                    ? "Susun semua item mengikut turutan yang betul."
                    : "Susun item random mengikut turutan."}
                </InstructionBanner>

                <div
                  className={`mt-5 grid gap-2 ${
                    easyPlaced.length > 12
                      ? "grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10"
                      : "grid-cols-5"
                  }`}
                >
                  {easyPlaced.map(
                    (item, index) => (
                      <div
                        key={index}
                        onDragOver={(event) =>
                          event.preventDefault()
                        }
                        onDrop={(event) => {
                          event.preventDefault();

                          const id =
                            event.dataTransfer.getData(
                              "text/plain"
                            );

                          const found =
                            easyItems.find(
                              (candidate) =>
                                candidate.id === id
                            ) ??
                            draggedEasyItem;

                          if (found) {
                            placeEasyItem(
                              found,
                              index
                            );
                          }
                        }}
                        onClick={() => {
                          if (
                            selectedEasyItem &&
                            !item
                          ) {
                            placeEasyItem(
                              selectedEasyItem,
                              index
                            );
                          }
                        }}
                        className={`honeycomb-slot relative flex aspect-square min-h-[74px] items-center justify-center rounded-[18px] border-[3px] transition sm:min-h-[86px] ${
                          item
                            ? "border-[#9ACB63] bg-[#F1FFE7]"
                            : selectedEasyItem
                            ? "cursor-pointer border-dashed border-[#7C3CFF] bg-[#FFF9DE]"
                            : "border-dashed border-[#F0C95F] bg-[#FFFDF2]"
                        }`}
                      >
                        <span className="absolute left-2 top-1 text-[9px] font-black text-[#B5BFCE]">
                          {index + 1}
                        </span>

                        {item && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              removeEasyItem(index);
                            }}
                            className="kg-letter text-[54px] sm:text-[60px] md:text-[66px] lg:text-[72px] xl:text-[76px] font-black leading-none text-[#6F9E2C] drop-shadow-[0_2px_0_rgba(255,255,255,0.95)]"
                          >
                            {item.value}
                          </button>
                        )}
                      </div>
                    )
                  )}
                </div>

                <div className="mt-7 border-t border-[#F0E0BC] pt-5">
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.14em] text-[#AE8B58]">
                    Item Tersedia
                  </p>

                  <div
                    className={`grid gap-2 ${
                      easyItems.length > 12
                        ? "grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10"
                        : "grid-cols-5"
                    }`}
                  >
                    {easyItems.map(
                      (item, index) => {
                        const palette = [
                          "#7C3CFF",
                          "#F52C8C",
                          "#08A989",
                          "#1597E5",
                          "#F59E0B",
                        ];

                        const selected =
                          selectedEasyItem?.id ===
                          item.id;

                        return (
                          <button
                            type="button"
                            draggable
                            key={item.id}
                            onDragStart={(
                              event: DragEvent<HTMLButtonElement>
                            ) => {
                              event.dataTransfer.setData(
                                "text/plain",
                                item.id
                              );

                              setDraggedEasyItem(
                                item
                              );
                            }}
                            onClick={() => {
                              setSelectedEasyItem(
                                item
                              );

                              speak(item.value);
                            }}
                            className={`honeycomb-tile kg-letter flex aspect-square min-h-[92px] touch-manipulation items-center justify-center rounded-[18px] border-[3px] text-[56px] sm:min-h-[100px] sm:text-[62px] md:text-[68px] lg:text-[72px] xl:text-[78px] font-black leading-none shadow-[0_8px_18px_rgba(126,79,15,0.09)] transition active:scale-95 ${
                              selected
                                ? "border-[#7C3CFF] ring-4 ring-[#FFF1B8]"
                                : "border-[#E8D8AF] hover:-translate-y-1"
                            }`}
                            style={{
                              color:
                                palette[
                                  index %
                                    palette.length
                                ],
                            }}
                          >
                            {item.value}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* MEDIUM */}

            {difficulty === "medium" &&
              mediumQuestion && (
                <div className="p-4 sm:p-6">
                  {showMediumGuide ? (
                    <AlphabetGuide
                      type={
                        mediumCase ===
                        "lowercase"
                          ? "lowercase"
                          : "uppercase"
                      }
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setShowMediumGuide(true)
                      }
                      className="mb-4 inline-flex items-center gap-2 rounded-[13px] bg-[#FFF0B5] px-4 py-2 text-xs font-black text-[#C97900]"
                    >
                      <Eye size={15} />
                      Lihat Panduan A-Z
                    </button>
                  )}

                  <InstructionBanner>
                    Lengkapkan huruf yang hilang
                    mengikut turutan.
                  </InstructionBanner>

                  <div className="mt-7 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                    {mediumQuestion.sequence.map(
                      (letter, index) => {
                        const missing =
                          mediumQuestion.missingIndexes.includes(
                            index
                          );

                        const answer =
                          mediumAnswers[index];

                        return (
                          <div
                            key={`${letter}-${index}`}
                            onDragOver={(event) =>
                              event.preventDefault()
                            }
                            onDrop={(event) => {
                              event.preventDefault();

                              const option =
                                event.dataTransfer.getData(
                                  "text/plain"
                                ) ||
                                draggedMediumOption;

                              if (
                                missing &&
                                option
                              ) {
                                placeMediumAnswer(
                                  option,
                                  index
                                );
                              }
                            }}
                            onClick={() => {
                              if (
                                missing &&
                                selectedMediumOption
                              ) {
                                placeMediumAnswer(
                                  selectedMediumOption,
                                  index
                                );
                              }
                            }}
                            className={`flex h-[82px] w-[68px] items-center justify-center rounded-[17px] border-[3px] kg-letter text-[54px] font-black leading-none sm:h-[112px] sm:w-[96px] sm:text-[68px] ${
                              missing
                                ? answer
                                  ? "border-[#BEEADB] bg-[#ECFBF5] text-[#08A989]"
                                  : "cursor-pointer border-dashed border-[#FF5A9C] bg-[#FFF9FC] text-[#F52C8C]"
                                : "border-[#E8D8AF] bg-white text-[#4A2A13]"
                            }`}
                          >
                            {missing ? (
                              answer ? (
                                <button
                                  type="button"
                                  onClick={(
                                    event
                                  ) => {
                                    event.stopPropagation();

                                    removeMediumAnswer(
                                      index
                                    );
                                  }}
                                  className="h-full w-full text-inherit"
                                >
                                  {answer}
                                </button>
                              ) : (
                                "?"
                              )
                            ) : (
                              letter
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>

                  <div className="mt-8">
                    <p className="mb-3 text-center text-[10px] font-black uppercase tracking-[0.14em] text-[#A7B0C0]">
                      Pilihan Jawapan
                    </p>

                    <div className="flex flex-wrap justify-center gap-3">
                      {mediumQuestion.options.map(
                        (option, index) => {
                          const used =
                            Object.values(
                              mediumAnswers
                            ).includes(option);

                          const selected =
                            selectedMediumOption ===
                            option;

                          return (
                            <button
                              key={`${option}-${index}`}
                              type="button"
                              draggable={!used}
                              disabled={used}
                              onDragStart={(
                                event: DragEvent<HTMLButtonElement>
                              ) => {
                                event.dataTransfer.setData(
                                  "text/plain",
                                  option
                                );

                                setDraggedMediumOption(
                                  option
                                );
                              }}
                              onClick={() => {
                                setSelectedMediumOption(
                                  option
                                );

                                speak(option);
                              }}
                              className={`flex h-[64px] w-[64px] touch-manipulation items-center justify-center rounded-[15px] border honeycomb-tile bg-white kg-letter text-[52px] sm:text-[58px] font-black leading-none shadow-[0_7px_16px_rgba(126,79,15,0.09)] transition ${
                                used
                                  ? "opacity-25"
                                  : selected
                                  ? "border-[#F52C8C] text-[#F52C8C] ring-4 ring-[#FFF0F7]"
                                  : "border-[#E7D6AC] text-[#C97900] hover:-translate-y-1"
                              }`}
                            >
                              {option}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              )}

            {/* HARD */}

            {difficulty === "hard" &&
              hardGameStarted && (
                <div className="p-4 sm:p-6">
                  <InstructionBanner>
                    Isi 8 jawapan. Level 6-10
                    mempunyai 4 Before dan 4
                    After.
                  </InstructionBanner>

                  <div className="mt-6 grid gap-3 md:grid-cols-2">
                    {hardQuestions.map(
                      (question, index) => (
                        <div
                          key={question.id}
                          className="flex items-center gap-3 rounded-[18px] border border-[#E3E7EF] bg-[#FCFCFF] p-3 sm:p-4"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7C3CFF] text-[11px] font-black text-white">
                            {index + 1}
                          </span>

                          <div className="min-w-[72px]">
                            <p
                              className={`text-[9px] font-black uppercase tracking-[0.1em] ${
                                question.direction ===
                                "before"
                                  ? "text-[#F52C8C]"
                                  : "text-[#08A989]"
                              }`}
                            >
                              {question.direction}
                            </p>

                            <p className="kg-letter mt-1 text-[54px] sm:text-[62px] font-black leading-none text-[#4A2A13]">
                              {question.letter}
                            </p>
                          </div>

                          <span className="font-black text-[#AAB4C3]">
                            =
                          </span>

                          <input
                            value={
                              question.userAnswer
                            }
                            onChange={(event) =>
                              updateHardAnswer(
                                question.id,
                                event.target.value
                              )
                            }
                            className="h-14 min-w-0 flex-1 rounded-[13px] border-2 border-[#DEE3ED] bg-white kg-letter text-center text-[48px] sm:text-[54px] font-black leading-none text-[#C97900] outline-none transition focus:border-[#7C3CFF]"
                            maxLength={1}
                            autoComplete="off"
                            autoCapitalize="off"
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {difficulty === "hard" &&
              !hardGameStarted && (
                <div className="flex min-h-[360px] flex-col items-center justify-center p-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#FFF0B8] text-[#C97900]">
                    <Eye size={28} />
                  </div>

                  <h3 className="mt-4 text-xl font-black text-[#4A2A13]">
                    Alphabet Review
                  </h3>

                  <p className="mt-2 max-w-md text-sm font-medium leading-6 text-[#8D7253]">
                    Lihat Aa hingga Zz dahulu sebelum
                    memulakan cabaran level ini.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setHardReviewOpen(true);
                    }}
                    className="mt-5 inline-flex h-12 items-center gap-2 rounded-[15px] bg-[#7C3CFF] px-6 text-sm font-black text-white"
                  >
                    <Eye size={17} />
                    Buka Review
                  </button>
                </div>
              )}

            {/* FEEDBACK */}

            {feedback === "success" && (
              <div className="mx-4 mb-4 rounded-[18px] bg-[#EAFBF5] px-4 py-4 sm:mx-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#08A989] text-white">
                      <Check size={21} />
                    </div>

                    <div>
                      <p className="font-black text-[#087B65]">
                        Hebat! Level selesai.
                      </p>

                      <p className="mt-0.5 text-xs font-medium text-[#659B8E]">
                        Markah {score}%.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={nextLevel}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-[#7C3CFF] px-5 text-xs font-black text-white"
                  >
                    {level === 10
                      ? "Lihat Keputusan"
                      : "Tahap Seterusnya"}

                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {feedback === "retry" && (
              <div className="mx-4 mb-4 rounded-[18px] bg-[#FFF1F6] px-4 py-4 sm:mx-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F52C8C] text-white">
                      <X size={18} />
                    </div>

                    <div>
                      <p className="font-black text-[#C51D68]">
                        Cuba sekali lagi.
                      </p>

                      <p className="text-xs font-medium text-[#B98299]">
                        Semak jawapan sebelum cuba
                        semula.
                      </p>
                    </div>
                  </div>

                  {difficulty === "hard" && (
                    <button
                      type="button"
                      onClick={newHardQuestionSet}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-[13px] bg-white px-4 text-xs font-black text-[#F52C8C]"
                    >
                      <RefreshCcw size={14} />
                      Set Baru
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ACTIONS */}

            <div className="flex flex-wrap items-center justify-center gap-3 border-t border-[#F0DFB7] p-4 sm:p-5">
              <button
                type="button"
                onClick={() => {
                  if (difficulty === "hard") {
                    newHardQuestionSet();
                  } else {
                    loadCurrentLevel();
                  }
                }}
                className="inline-flex h-12 items-center gap-2 rounded-[15px] bg-[#FFF0B5] px-5 text-xs font-black text-[#C97900]"
              >
                <RotateCcw size={16} />
                Reset
              </button>

              {difficulty === "medium" && (
                <button
                  type="button"
                  onClick={() =>
                    setShowMediumGuide(
                      (previous) => !previous
                    )
                  }
                  className="inline-flex h-12 items-center gap-2 rounded-[15px] bg-[#FFF7E5] px-5 text-xs font-black text-[#E49A00]"
                >
                  <Lightbulb size={16} />
                  Hint
                </button>
              )}

              {difficulty === "hard" &&
                hardGameStarted && (
                  <button
                    type="button"
                    onClick={() => {
                      setHardReviewIndex(0);
                      setHardReviewOpen(true);
                    }}
                    className="inline-flex h-12 items-center gap-2 rounded-[15px] bg-[#FFF7E5] px-5 text-xs font-black text-[#E49A00]"
                  >
                    <Eye size={16} />
                    Review Aa-Zz
                  </button>
                )}

              {(difficulty !== "hard" ||
                hardGameStarted) && (
                <button
                  type="button"
                  onClick={() => {
                    if (difficulty === "easy") {
                      checkEasy();
                    }

                    if (
                      difficulty === "medium"
                    ) {
                      checkMedium();
                    }

                    if (
                      difficulty === "hard"
                    ) {
                      checkHard();
                    }
                  }}
                  className="inline-flex h-12 min-w-[200px] items-center justify-center gap-2 rounded-[15px] bg-[#7C3CFF] px-7 text-sm font-black text-white shadow-[0_10px_24px_rgba(124,60,255,0.2)]"
                >
                  <Check size={17} />
                  Semak Jawapan
                </button>
              )}
            </div>
          </section>

          {/* RIGHT SIDEBAR */}

          <aside className="space-y-4">
            <Panel title="Cara Bermain">
              <div className="space-y-3">
                {difficulty === "easy" && (
                  <>
                    <InstructionRow number={1} text="Pilih huruf dari bawah." />
                    <InstructionRow number={2} text="Drag atau tap huruf." />
                    <InstructionRow number={3} text="Letakkan pada slot yang betul." />
                    <InstructionRow number={4} text="Lengkapkan susunan A hingga Z." />
                  </>
                )}

                {difficulty === "medium" && (
                  <>
                    <InstructionRow
                      number={1}
                      text="Lihat turutan huruf."
                    />

                    <InstructionRow
                      number={2}
                      text="Cari huruf yang hilang."
                    />

                    <InstructionRow
                      number={3}
                      text="Drag atau tap jawapan."
                    />

                    <InstructionRow
                      number={4}
                      text="Lengkapkan semua slot."
                    />
                  </>
                )}

                {difficulty === "hard" && (
                  <>
                    <InstructionRow
                      number={1}
                      text="Review Aa hingga Zz."
                    />

                    <InstructionRow
                      number={2}
                      text="Tekan Start Level."
                    />

                    <InstructionRow
                      number={3}
                      text="Jawab 8 soalan unik."
                    />

                    <InstructionRow
                      number={4}
                      text="Dapat sekurang-kurangnya 80%."
                    />
                  </>
                )}
              </div>
            </Panel>

            <Panel title="Kemajuan">
              <div className="flex items-center gap-5">
                <div
                  className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(#7C3CFF ${progressPercent}%, #ECEAF7 ${progressPercent}% 100%)`,
                  }}
                >
                  <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white">
                    <span className="text-xl font-black text-[#4A2A13]">
                      {Math.round(
                        progressPercent
                      )}
                      %
                    </span>

                    <span className="text-[9px] font-bold text-[#9DA8BA]">
                      Selesai
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#AE8B58]">
                    Level
                  </p>

                  <p className="mt-1 text-xl font-black text-[#4A2A13]">
                    {totalCompletedLevels}
                    <span className="text-sm text-[#A8B2C3]">
                      {" "}
                      / 10
                    </span>
                  </p>

                  <p className="mt-4 text-[10px] font-black uppercase tracking-[0.12em] text-[#AE8B58]">
                    Bintang
                  </p>

                  <div className="mt-1 flex items-center gap-1">
                    <Star
                      size={17}
                      fill="currentColor"
                      className="text-[#FFB800]"
                    />

                    <span className="font-black text-[#4A2A13]">
                      {totalStars}
                    </span>
                  </div>
                </div>
              </div>
            </Panel>

            <Panel title="Ganjaran">
              <div className="text-center">
                <Gift
                  size={30}
                  className="mx-auto text-[#F52C8C]"
                />

                <p className="mt-3 text-xs font-medium leading-5 text-[#7E8DA7]">
                  Selesaikan semua 10 level dan
                  kumpulkan sehingga 30 bintang.
                </p>

                <div className="mt-4 flex justify-center gap-2">
                  {[0, 1, 2].map((star) => (
                    <Star
                      key={star}
                      size={29}
                      className="text-[#D7DCE7]"
                    />
                  ))}
                </div>
              </div>
            </Panel>
          </aside>
        </div>
      </div>

      {/* HARD Aa-Zz REVIEW SLIDE DECK */}

      {difficulty === "hard" &&
        hardReviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101A3B]/50 p-3 backdrop-blur-md sm:p-5">
            <div className="relative w-full max-w-[760px] overflow-hidden rounded-[32px] bg-white shadow-[0_35px_100px_rgba(16,26,59,0.25)]">
              <div className="border-b border-[#F0DFB7] px-5 py-4 sm:px-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#C97900]">
                      Hard Mode Review
                    </p>

                    <h2 className="mt-1 text-xl font-black text-[#4A2A13] sm:text-2xl">
                      Alphabet Aa-Zz
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setHardReviewOpen(false)
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1F3F8] text-[#7F8CA3]"
                  >
                    <X size={17} />
                  </button>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#F5E7BD]">
                    <div
                      className="h-full rounded-full bg-[#7C3CFF] transition-all duration-300"
                      style={{
                        width: `${
                          ((hardReviewIndex + 1) /
                            26) *
                          100
                        }%`,
                      }}
                    />
                  </div>

                  <span className="text-xs font-black text-[#C97900]">
                    {hardReviewIndex + 1} / 26
                  </span>
                </div>
              </div>

              <div
                onPointerDown={
                  handleReviewPointerDown
                }
                onPointerUp={
                  handleReviewPointerUp
                }
                className="touch-pan-y select-none px-5 py-8 sm:px-8 sm:py-10"
              >
                <div className="mx-auto flex min-h-[300px] max-w-[520px] flex-col items-center justify-center rounded-[30px] border border-[#E7D6AC] bg-[#FAF9FF] px-6 py-8 text-center sm:min-h-[370px]">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#FFF0B8] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-[#C97900]">
                    Letter{" "}
                    {UPPERCASE[
                      hardReviewIndex
                    ]}
                  </div>

                  <div className="flex items-baseline justify-center gap-4 sm:gap-6">
                    <span className="kg-letter text-[130px] font-black leading-none text-[#4A2A13] sm:text-[180px]">
                      {reviewUpper}
                    </span>

                    <span className="kg-letter text-[105px] font-black leading-none text-[#F52C8C] sm:text-[150px]">
                      {reviewLower}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      speak(
                        `Letter ${reviewUpper}`
                      )
                    }
                    className="mt-6 inline-flex h-11 items-center gap-2 rounded-[14px] bg-[#FFF0F7] px-4 text-xs font-black text-[#F52C8C]"
                  >
                    <Volume2 size={16} />
                    Listen
                  </button>

                  <p className="mt-4 text-[10px] font-medium text-[#9CA7B8] sm:hidden">
                    Swipe kiri atau kanan
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={
                      previousReviewSlide
                    }
                    disabled={
                      hardReviewIndex === 0
                    }
                    className="inline-flex h-11 items-center gap-2 rounded-[14px] border border-[#E8D4A0] bg-white px-4 text-xs font-black text-[#8B673B] disabled:opacity-30"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={nextReviewSlide}
                    disabled={
                      hardReviewIndex === 25
                    }
                    className="inline-flex h-11 items-center gap-2 rounded-[14px] bg-[#FFF0B8] px-4 text-xs font-black text-[#C97900] disabled:opacity-30"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="grid gap-3 border-t border-[#F0DFB7] bg-[#FFFBEB] p-4 sm:grid-cols-2 sm:px-7 sm:py-5">
                <button
                  type="button"
                  onClick={startHardGame}
                  className="inline-flex h-12 items-center justify-center rounded-[15px] border border-[#E8D4A0] bg-white text-sm font-black text-[#697891]"
                >
                  Skip Review
                </button>

                <button
                  type="button"
                  onClick={startHardGame}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[15px] bg-[#7C3CFF] text-sm font-black text-white shadow-[0_10px_24px_rgba(124,60,255,0.2)]"
                >
                  <Check size={17} />
                  Start Level {level}
                </button>
              </div>
            </div>
          </div>
        )}

      {/* FINAL COMPLETION */}

      {showCompletion && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#101A3B]/45 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-[480px] overflow-hidden rounded-[32px] bg-white p-7 text-center shadow-[0_30px_100px_rgba(16,26,59,0.25)]">
            <button
              type="button"
              onClick={() =>
                setShowCompletion(false)
              }
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF2CA] text-[#936C35]"
            >
              <X size={17} />
            </button>

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF2C8] text-[#FFB800]">
              <Crown size={38} />
            </div>

            <p className="mt-5 text-[10px] font-black uppercase tracking-[0.16em] text-[#C97900]">
              Tahniah
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[#4A2A13]">
              Susun ABC Master!
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-6 text-[#8A6D49]">
              Anda telah berjaya menamatkan semua
              10 level.
            </p>

            <div className="mt-5 flex justify-center gap-2">
              {[0, 1, 2].map((star) => (
                <Star
                  key={star}
                  size={36}
                  fill="currentColor"
                  className="text-[#FFB800]"
                />
              ))}
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setShowCompletion(false);
                  setLevel(1);
                }}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[#7C3CFF] text-sm font-black text-white"
              >
                <RotateCcw size={17} />
                Main Lagi
              </button>

              <a
                href="/huruf-membaca"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] border border-[#E8D4A0] bg-white text-sm font-black text-[#4A2A13]"
              >
                <ArrowLeft size={17} />
                Back to Home
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

function HeroLetter({
  letter,
  className,
}: {
  letter: string;
  className: string;
}) {
  return (
    <div
      className={`flex h-[100px] w-[82px] items-center justify-center rounded-[25px] bg-gradient-to-br text-[68px] font-black text-white shadow-[0_18px_35px_rgba(60,40,100,0.17)] ${className}`}
    >
      {letter}
    </div>
  );
}

function DifficultyCard({
  active,
  tone,
  title,
  subtitle,
  description,
  onClick,
}: {
  active: boolean;
  tone: "green" | "pink" | "purple";
  title: string;
  subtitle: string;
  description: string;
  onClick: () => void;
}) {
  const toneClass =
    tone === "green"
      ? "text-[#08A989] bg-[#EAFAF5]"
      : tone === "pink"
      ? "text-[#F52C8C] bg-[#FFF0F7]"
      : "text-[#C97900] bg-[#FFF0B8]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[22px] border p-4 text-left transition hover:-translate-y-1 ${
        active
          ? "border-[#7C3CFF] bg-white shadow-[0_10px_24px_rgba(124,60,255,0.1)]"
          : "border-[#E7D6AC] bg-white"
      }`}
    >
      <div
        className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${toneClass}`}
      >
        {title}
      </div>

      <h3 className="mt-3 text-base font-black text-[#4A2A13]">
        {subtitle}
      </h3>

      <p className="mt-1 text-xs font-medium text-[#8D7150]">
        {description}
      </p>
    </button>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-[#EED89C] bg-white p-4 shadow-[0_8px_24px_rgba(25,39,74,0.045)]">
      <h3 className="mb-4 text-sm font-black text-[#4A2A13]">
        {title}
      </h3>

      {children}
    </section>
  );
}

function ModeOption({
  active,
  label,
  sublabel,
  onClick,
}: {
  active: boolean;
  label: string;
  sublabel: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[15px] border px-3 py-3 text-left transition ${
        active
          ? "border-[#7C3CFF] bg-[#FFF4C9]"
          : "border-[#E5E8F0] bg-white hover:border-[#CBC4F3]"
      }`}
    >
      <p
        className={`text-xs font-black ${
          active
            ? "text-[#C97900]"
            : "text-[#513316]"
        }`}
      >
        {label}
      </p>

      <p className="mt-1 text-[10px] font-medium text-[#9A805F]">
        {sublabel}
      </p>
    </button>
  );
}

function InstructionRow({
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

function InstructionBanner({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-[18px] border-2 border-[#F3CF67] bg-[#FFF3C8]/95 px-4 py-3 text-center text-sm font-black text-[#6E4312] shadow-[0_5px_14px_rgba(126,79,15,0.06)]">
      <Lightbulb size={16} />
      {children}
    </div>
  );
}

/* =========================================================
   MEDIUM GUIDE ONLY
========================================================= */

function AlphabetGuide({
  type,
}: {
  type: "uppercase" | "lowercase";
}) {
  const source =
    type === "lowercase"
      ? LOWERCASE
      : UPPERCASE;

  return (
    <div className="mb-4 rounded-[20px] border border-[#E4E7EF] bg-[#FFFBEB] p-4">
      <p className="mb-3 text-center text-[10px] font-black uppercase tracking-[0.14em] text-[#F52C8C]">
        Panduan A-Z
      </p>

      <div className="grid grid-cols-13 gap-1.5">
        {source.map((letter) => (
          <div
            key={letter}
            className="kg-letter flex h-12 items-center justify-center rounded-[10px] bg-white text-[22px] sm:text-[26px] font-black leading-none text-[#566784]"
          >
            {letter}
          </div>
        ))}
      </div>
    </div>
  );
}