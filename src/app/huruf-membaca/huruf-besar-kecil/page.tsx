"use client";

import {
  useEffect,
  useMemo,
  useState,
  type DragEvent,
  type ReactNode,
} from "react";

import {
  ArrowLeft,
  Check,
  ChevronRight,
  Crown,
  Home,
  Lock,
  RefreshCcw,
  RotateCcw,
  Sparkles,
  Star,
  Trophy,
  X,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type LetterCase = "uppercase" | "lowercase";

type AppleItem = {
  id: string;
  letter: string;
  category: LetterCase;
};

type LevelResult = {
  completed: boolean;
  stars: number;
};

/* =========================================================
   CONSTANTS
========================================================= */

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const LEVEL_COUNTS = [
  6,  // Level 1
  6,  // Level 2
  8,  // Level 3
  8,  // Level 4
  10, // Level 5
  10, // Level 6
  12, // Level 7
  12, // Level 8
  14, // Level 9
  16, // Level 10
];

/* =========================================================
   HELPERS
========================================================= */

function shuffle<T>(items: T[]): T[] {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    const temporary = result[index];
    result[index] = result[randomIndex];
    result[randomIndex] = temporary;
  }

  return result;
}

function speak(text: string) {
  if (typeof window === "undefined") return;
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(text);

  speech.rate = 0.72;
  speech.pitch = 1.05;

  window.speechSynthesis.speak(speech);
}

/* =========================================================
   LEVEL GENERATOR
========================================================= */

function generateLevel(level: number): AppleItem[] {
  const count = LEVEL_COUNTS[level - 1] ?? 6;

  let letters: string[];

  if (level === 1) {
    letters = ["A", "B", "C", "D", "E", "F"];
  } else if (level === 2) {
    letters = ["G", "H", "I", "J", "K", "L"];
  } else if (level === 3) {
    letters = ["M", "N", "O", "P", "Q", "R", "S", "T"];
  } else if (level === 4) {
    letters = ["U", "V", "W", "X", "Y", "Z", "A", "M"];
  } else {
    letters = shuffle(ALPHABET).slice(0, count);
  }

  return shuffle(letters.slice(0, count)).map((baseLetter, index) => {
    /*
      Pastikan ada campuran uppercase + lowercase.
      Index ganjil lebih cenderung lowercase.
    */
    const useUppercase =
      index % 2 === 0
        ? Math.random() > 0.2
        : Math.random() > 0.7;

    const letter = useUppercase
      ? baseLetter
      : baseLetter.toLowerCase();

    return {
      id: `apple-${level}-${index}-${baseLetter}-${Math.random()
        .toString(36)
        .slice(2)}`,
      letter,
      category: useUppercase ? "uppercase" : "lowercase",
    };
  });
}

/* =========================================================
   PAGE
========================================================= */

export default function HurufBesarKecilPage() {
  const [level, setLevel] = useState(1);

  const [apples, setApples] = useState<AppleItem[]>([]);

  const [uppercaseBasket, setUppercaseBasket] = useState<AppleItem[]>([]);
  const [lowercaseBasket, setLowercaseBasket] = useState<AppleItem[]>([]);

  const [selectedApple, setSelectedApple] =
    useState<AppleItem | null>(null);

  const [draggedApple, setDraggedApple] =
    useState<AppleItem | null>(null);

  const [wrongBasket, setWrongBasket] =
    useState<LetterCase | null>(null);

  const [levelComplete, setLevelComplete] = useState(false);

  const [levelResults, setLevelResults] = useState<
    Record<number, LevelResult>
  >({});

  const [showFinal, setShowFinal] = useState(false);

  /* =======================================================
     LOAD LEVEL
  ======================================================= */

  useEffect(() => {
    resetLevel();
  }, [level]);

  function resetLevel() {
    setApples(generateLevel(level));

    setUppercaseBasket([]);
    setLowercaseBasket([]);

    setSelectedApple(null);
    setDraggedApple(null);

    setWrongBasket(null);
    setLevelComplete(false);
  }

  /* =======================================================
     PROGRESS
  ======================================================= */

  const totalAppleCount =
    apples.length +
    uppercaseBasket.length +
    lowercaseBasket.length;

  const sortedAppleCount =
    uppercaseBasket.length +
    lowercaseBasket.length;

  const progress =
    totalAppleCount === 0
      ? 0
      : Math.round((sortedAppleCount / totalAppleCount) * 100);

  const completedLevels = useMemo(() => {
    return Object.values(levelResults).filter(
      (result) => result.completed
    ).length;
  }, [levelResults]);

  const totalStars = useMemo(() => {
    return Object.values(levelResults).reduce(
      (total, result) => total + result.stars,
      0
    );
  }, [levelResults]);

  /* =======================================================
     SELECT APPLE
  ======================================================= */

  function selectApple(apple: AppleItem) {
    if (levelComplete) return;

    setSelectedApple(apple);
    setWrongBasket(null);

    speak(apple.letter);
  }

  /* =======================================================
     MOVE APPLE
  ======================================================= */

  function moveApple(
    apple: AppleItem,
    target: LetterCase
  ) {
    if (levelComplete) return;

    if (apple.category !== target) {
      setWrongBasket(target);

      window.setTimeout(() => {
        setWrongBasket(null);
      }, 550);

      return;
    }

    /*
      Remove apple dari pilihan.
    */
    setApples((previous) =>
      previous.filter(
        (item) => item.id !== apple.id
      )
    );

    /*
      Add ke bakul betul.
    */
    if (target === "uppercase") {
      setUppercaseBasket((previous) => [
        ...previous,
        apple,
      ]);
    } else {
      setLowercaseBasket((previous) => [
        ...previous,
        apple,
      ]);
    }

    setSelectedApple(null);
    setDraggedApple(null);
    setWrongBasket(null);

    speak(
      target === "uppercase"
        ? `${apple.letter}, huruf besar`
        : `${apple.letter}, huruf kecil`
    );

    /*
      Check sama ada apple terakhir.
    */
    const remaining = apples.filter(
      (item) => item.id !== apple.id
    ).length;

    if (remaining === 0) {
      window.setTimeout(() => {
        completeLevel();
      }, 850);
    }
  }

  /* =======================================================
     REMOVE FROM BASKET
  ======================================================= */

  function returnApple(
    apple: AppleItem
  ) {
    if (levelComplete) return;

    if (apple.category === "uppercase") {
      setUppercaseBasket((previous) =>
        previous.filter(
          (item) => item.id !== apple.id
        )
      );
    } else {
      setLowercaseBasket((previous) =>
        previous.filter(
          (item) => item.id !== apple.id
        )
      );
    }

    setApples((previous) =>
      shuffle([
        ...previous,
        apple,
      ])
    );

    setSelectedApple(null);
  }

  /* =======================================================
     COMPLETE LEVEL
  ======================================================= */

  function completeLevel() {
    setLevelComplete(true);

    setLevelResults((previous) => ({
      ...previous,
      [level]: {
        completed: true,
        stars: 3,
      },
    }));

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

    setLevel((previous) => previous + 1);
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#EAF4FF] text-[#101A3B]">
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html {
          -webkit-text-size-adjust: 100%;
        }

        body {
          margin: 0;
          background: #eaf4ff;
          overscroll-behavior-y: contain;
        }

        button {
          font-family: inherit;
        }

        @keyframes appleFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-7px);
          }
        }

        .apple-floating {
          animation: appleFloat 3s ease-in-out infinite;
        }

        @keyframes basketWrong {
          0%,
          100% {
            transform: translateX(0);
          }

          25% {
            transform: translateX(-10px);
          }

          50% {
            transform: translateX(10px);
          }

          75% {
            transform: translateX(-5px);
          }
        }

        .basket-wrong {
          animation: basketWrong 0.42s ease-in-out;
        }

        @keyframes basketReady {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }

          50% {
            transform: translateY(-5px) scale(1.015);
          }
        }

        .basket-ready {
          animation: basketReady 0.9s ease-in-out infinite;
        }

        @keyframes successPop {
          0% {
            transform: scale(0.88);
            opacity: 0;
          }

          70% {
            transform: scale(1.04);
            opacity: 1;
          }

          100% {
            transform: scale(1);
          }
        }

        .success-pop {
          animation: successPop 0.4s ease-out;
        }
      `}</style>

      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="border-b border-[#DDE5F0] bg-white">
        <div className="mx-auto flex max-w-[1650px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
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
              Kembali
            </span>
          </a>
        </div>
      </header>

      {/* ===================================================
          PAGE
      =================================================== */}

      <div className="mx-auto max-w-[1650px] px-2 py-4 sm:px-4 lg:px-6">
        <div className="grid gap-4 xl:grid-cols-[210px_minmax(0,1fr)_240px]">

          {/* =================================================
              LEVEL SIDEBAR
          ================================================= */}

          <aside className="hidden xl:block">
            <Panel title="Tahap">
              <div className="space-y-2">
                {Array.from(
                  { length: 10 },
                  (_, index) => {
                    const levelNumber =
                      index + 1;

                    const unlocked =
                      levelNumber === 1 ||
                      Boolean(
                        levelResults[
                          levelNumber - 1
                        ]?.completed
                      );

                    const result =
                      levelResults[
                        levelNumber
                      ];

                    return (
                      <button
                        key={levelNumber}
                        type="button"
                        disabled={!unlocked}
                        onClick={() =>
                          setLevel(levelNumber)
                        }
                        className={`flex w-full items-center justify-between rounded-[14px] border px-3 py-3 transition ${
                          level === levelNumber
                            ? "border-[#7C3CFF] bg-[#F3EFFF]"
                            : "border-[#E2E7EF] bg-white"
                        } ${
                          !unlocked
                            ? "cursor-not-allowed opacity-40"
                            : "hover:-translate-y-0.5"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black ${
                              level === levelNumber
                                ? "bg-[#7C3CFF] text-white"
                                : "bg-[#F1F3F7] text-[#74829A]"
                            }`}
                          >
                            {levelNumber}
                          </span>

                          <span className="text-xs font-black text-[#31425F]">
                            Level{" "}
                            {levelNumber}
                          </span>
                        </div>

                        {!unlocked ? (
                          <Lock size={13} />
                        ) : result?.completed ? (
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

          {/* =================================================
              GAME AREA
          ================================================= */}

          <section className="overflow-hidden rounded-[30px] border-4 border-white bg-white shadow-[0_18px_45px_rgba(32,82,118,0.18)]">

            {/* ===============================================
                GARDEN BACKGROUND
            =============================================== */}

            <div
              className="relative min-h-[850px] overflow-hidden bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('/images/huruf-besar-kecil/garden-bg.png')",
              }}
            >

              {/* Soft overlay */}

              <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/5" />

              {/* =============================================
                  TITLE
              ============================================= */}

              <div className="relative z-20 mx-auto flex max-w-[900px] justify-center px-3 pt-3">
                <div className="rounded-[20px] border-4 border-[#A85B28] bg-gradient-to-b from-[#EFA14F] to-[#C96C2C] px-8 py-3 text-center shadow-[0_8px_16px_rgba(80,43,20,0.25)]">
                  <p className="text-xl font-black text-white drop-shadow sm:text-2xl">
                    Huruf Besar & Huruf Kecil
                  </p>

                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#FFF0D4]">
                    Kenal • Asingkan • Belajar
                  </p>
                </div>
              </div>

              {/* =============================================
                  LEVEL INFO
              ============================================= */}

              <div className="relative z-20 mx-auto mt-3 flex max-w-[1150px] items-center justify-between px-3">
                <div className="rounded-[17px] border-4 border-[#A75A27] bg-gradient-to-b from-[#E0964D] to-[#B85E2B] px-5 py-2 shadow-lg">
                  <p className="text-sm font-black text-white">
                    LEVEL{" "}
                    <span className="text-[#FFE76A]">
                      {level}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-full border-4 border-white bg-[#FFF9E4] px-4 py-2 shadow-lg">
                  <Star
                    size={22}
                    fill="currentColor"
                    className="text-[#FFB400]"
                  />

                  <span className="text-sm font-black text-[#24396D]">
                    {totalStars} / 30
                  </span>
                </div>
              </div>

              {/* =============================================
                  INSTRUCTION
              ============================================= */}

              <div className="relative z-20 mx-auto mt-3 max-w-[700px] px-3">
                <div className="rounded-[18px] border-[3px] border-[#F2B74E] bg-[#FFF6D9]/95 px-5 py-3 text-center shadow-lg">
                  <p className="text-sm font-black text-[#6A391D]">
                    Masukkan buah epal ke dalam bakul yang betul.
                  </p>
                </div>
              </div>

              {/* =============================================
                  BASKETS
              ============================================= */}

              <div className="relative z-20 mx-auto mt-5 grid max-w-[1150px] items-end gap-5 px-3 md:grid-cols-2">

                <Basket
                  src="/images/huruf-besar-kecil/basket-uppercase.png"
                  title="HURUF BESAR"
                  subtitle="A - Z"
                  category="uppercase"
                  items={uppercaseBasket}
                  selectedApple={selectedApple}
                  draggedApple={draggedApple}
                  wrong={
                    wrongBasket ===
                    "uppercase"
                  }
                  onDropApple={(apple) =>
                    moveApple(
                      apple,
                      "uppercase"
                    )
                  }
                  onReturnApple={
                    returnApple
                  }
                />

                <Basket
                  src="/images/huruf-besar-kecil/basket-lowercase.png"
                  title="HURUF KECIL"
                  subtitle="a - z"
                  category="lowercase"
                  items={lowercaseBasket}
                  selectedApple={selectedApple}
                  draggedApple={draggedApple}
                  wrong={
                    wrongBasket ===
                    "lowercase"
                  }
                  onDropApple={(apple) =>
                    moveApple(
                      apple,
                      "lowercase"
                    )
                  }
                  onReturnApple={
                    returnApple
                  }
                />
              </div>

              {/* =============================================
                  APPLE TABLE
              ============================================= */}

              <div className="relative z-20 mx-auto mt-5 max-w-[1120px] px-3 pb-8">

                <div className="rounded-[30px] border-[6px] border-[#B56730] bg-gradient-to-b from-[#F3BD72] to-[#D98743] p-3 shadow-[0_13px_25px_rgba(83,47,24,0.2)]">

                  {/* Table title */}

                  <div className="mx-auto -mt-8 mb-3 flex w-fit items-center gap-4 rounded-[18px] border-4 border-[#B66931] bg-gradient-to-b from-[#FFE8AA] to-[#F4C05E] px-5 py-2 shadow-lg">
                    <span className="text-sm font-black text-[#713616]">
                      PILIHAN BUAH HURUF
                    </span>

                    <span className="rounded-full bg-[#AE5925] px-3 py-1 text-[10px] font-black text-white">
                      {apples.length} buah lagi
                    </span>
                  </div>

                  {/* Gingham mat */}

                  <div
                    className="rounded-[20px] border-4 border-white/70 p-4"
                    style={{
                      backgroundColor:
                        "#FFF5F1",
                      backgroundImage: `
                        linear-gradient(
                          90deg,
                          rgba(242,157,153,.28) 50%,
                          transparent 50%
                        ),
                        linear-gradient(
                          rgba(242,157,153,.28) 50%,
                          transparent 50%
                        )
                      `,
                      backgroundSize:
                        "46px 46px",
                    }}
                  >

                    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">

                      {apples.map(
                        (
                          apple,
                          index
                        ) => (
                          <AppleButton
                            key={
                              apple.id
                            }
                            apple={
                              apple
                            }
                            index={
                              index
                            }
                            selected={
                              selectedApple?.id ===
                              apple.id
                            }
                            onSelect={() =>
                              selectApple(
                                apple
                              )
                            }
                            onDragStart={(
                              event
                            ) => {
                              event.dataTransfer.setData(
                                "text/plain",
                                apple.id
                              );

                              setDraggedApple(
                                apple
                              );
                            }}
                            onDragEnd={() =>
                              setDraggedApple(
                                null
                              )
                            }
                          />
                        )
                      )}
                    </div>

                    {apples.length ===
                      0 && (
                      <div className="flex min-h-[120px] items-center justify-center">
                        <p className="text-sm font-black text-[#A46B58]">
                          Semua epal sudah dimasukkan!
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected indicator */}

                {!levelComplete && (
                  <div className="mt-3 flex min-h-[44px] justify-center">
                    {selectedApple ? (
                      <div className="rounded-full border-2 border-white bg-[#7C3CFF] px-5 py-2 text-xs font-black text-white shadow-lg">
                        Epal{" "}
                        <span className="text-[#FFE76D]">
                          {
                            selectedApple.letter
                          }
                        </span>{" "}
                        dipilih — pilih bakul
                      </div>
                    ) : (
                      <div className="rounded-full bg-white/85 px-5 py-2 text-xs font-black text-[#6D7B92] shadow">
                        Pilih atau drag satu epal
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ===============================================
                RESET ONLY
            =============================================== */}

            {!levelComplete && (
              <div className="border-t border-[#E1E7EF] bg-white p-4">
                <button
                  type="button"
                  onClick={
                    resetLevel
                  }
                  className="mx-auto flex h-12 w-full max-w-[320px] items-center justify-center gap-2 rounded-[16px] bg-gradient-to-b from-[#4EB9FF] to-[#177CDF] text-sm font-black text-white shadow-[0_7px_14px_rgba(20,105,190,0.25)] transition hover:-translate-y-0.5"
                >
                  <RotateCcw
                    size={17}
                  />

                  Reset
                </button>
              </div>
            )}

            {/* ===============================================
                COMPLETE PANEL
            =============================================== */}

            {levelComplete && (
              <div className="success-pop border-t border-[#DCEBE5] bg-gradient-to-r from-[#EBFFF6] to-[#F4FFF9] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#08A989] text-white shadow-lg">
                      <Trophy
                        size={25}
                      />
                    </div>

                    <div>
                      <p className="text-lg font-black text-[#087A62]">
                        Hebat! Level{" "}
                        {level} selesai.
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
                                20
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
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[#7C3CFF] px-6 text-sm font-black text-white shadow-[0_8px_18px_rgba(124,60,255,0.23)]"
                  >
                    {level === 10
                      ? "Lihat Keputusan"
                      : "Level Seterusnya"}

                    <ChevronRight
                      size={17}
                    />
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          <aside className="space-y-4">

            <Panel title="Kemajuan">
              <ProgressCircle
                progress={
                  progress
                }
              />
            </Panel>

            <Panel title="Cara Bermain">
              <div className="space-y-3">
                <InstructionRow
                  number={1}
                  text="Pilih satu buah epal."
                />

                <InstructionRow
                  number={2}
                  text="Lihat huruf besar atau huruf kecil."
                />

                <InstructionRow
                  number={3}
                  text="Drag atau tap epal."
                />

                <InstructionRow
                  number={4}
                  text="Masukkan ke bakul yang betul."
                />
              </div>
            </Panel>

            <Panel title="Pencapaian">
              <div className="text-center">
                <Star
                  size={29}
                  fill="currentColor"
                  className="mx-auto text-[#FFB800]"
                />

                <p className="mt-2 text-2xl font-black text-[#101A3B]">
                  {completedLevels} / 10
                </p>

                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#9BA7B8]">
                  Level Selesai
                </p>

                <p className="mt-4 text-sm font-black text-[#354762]">
                  ⭐ {totalStars} / 30
                </p>
              </div>
            </Panel>
          </aside>
        </div>
      </div>

      {/* ===================================================
          FINAL POPUP
      =================================================== */}

      {showFinal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101A3B]/55 p-4 backdrop-blur-sm">

          <div className="relative w-full max-w-[480px] rounded-[34px] border-4 border-white bg-white p-7 text-center shadow-[0_35px_100px_rgba(16,26,59,0.3)]">

            <button
              type="button"
              onClick={() =>
                setShowFinal(false)
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
              Letter Sorting Master!
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-6 text-[#7E8DA5]">
              Semua 10 level Huruf Besar dan Huruf Kecil telah berjaya diselesaikan.
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

            <div className="mt-7 grid gap-3 sm:grid-cols-2">

              <button
                type="button"
                onClick={() => {
                  setShowFinal(false);
                  setLevelResults({});
                  setLevel(1);
                }}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[#7C3CFF] text-sm font-black text-white"
              >
                <RefreshCcw
                  size={17}
                />

                Main Lagi
              </button>

              <a
                href="/huruf-membaca"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] border border-[#DFE4EF] bg-white text-sm font-black text-[#101A3B]"
              >
                <ArrowLeft
                  size={17}
                />

                Kembali
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* =========================================================
   APPLE BUTTON
========================================================= */

function AppleButton({
  apple,
  index,
  selected,
  onSelect,
  onDragStart,
  onDragEnd,
}: {
  apple: AppleItem;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onDragStart: (
    event: DragEvent<HTMLButtonElement>
  ) => void;
  onDragEnd: () => void;
}) {
  const [imageError, setImageError] =
    useState(false);

  const isWideLetter =
    ["M", "W", "m", "w"].includes(
      apple.letter
    );

  const isNarrowLetter =
    ["I", "i", "l"].includes(
      apple.letter
    );

  return (
    <button
      type="button"
      draggable
      onClick={
        onSelect
      }
      onDragStart={
        onDragStart
      }
      onDragEnd={
        onDragEnd
      }
      className={`apple-floating relative mx-auto aspect-square w-full max-w-[128px] touch-manipulation transition ${
        selected
          ? "scale-105 rounded-[26px] bg-[#FFF0A9]/60 ring-4 ring-[#FFD64C]"
          : ""
      }`}
      style={{
        animationDelay: `${(index % 6) * 0.15}s`,
      }}
    >
      {!imageError ? (
        <img
          src="/images/huruf-besar-kecil/apple.png"
          alt=""
          draggable={false}
          onError={() =>
            setImageError(true)
          }
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain drop-shadow-[0_9px_10px_rgba(108,38,32,0.2)]"
        />
      ) : (
        <AppleFallback />
      )}

      {/* LETTER */}

      <span
        className={`
          pointer-events-none
          absolute
          left-1/2
          top-[55%]
          z-10
          flex
          h-[47%]
          w-[50%]
          -translate-x-1/2
          -translate-y-1/2
          items-center
          justify-center
          font-black
          leading-none
          text-white
          drop-shadow-[0_3px_2px_rgba(99,24,27,0.55)]
          ${
            isWideLetter
              ? "text-[clamp(31px,3.5vw,49px)]"
              : isNarrowLetter
              ? "text-[clamp(40px,4.5vw,61px)]"
              : "text-[clamp(36px,4vw,55px)]"
          }
        `}
      >
        {apple.letter}
      </span>
    </button>
  );
}

/* =========================================================
   APPLE FALLBACK
========================================================= */

function AppleFallback() {
  return (
    <div className="absolute inset-[8%]">

      <div className="absolute left-[47%] top-[1%] h-[24%] w-[8%] rotate-[8deg] rounded-full bg-[#75402B]" />

      <div className="absolute left-[53%] top-[4%] h-[18%] w-[26%] -rotate-[25deg] rounded-[100%_0_100%_0] bg-[#39A839]" />

      <div
        className="absolute inset-x-[3%] bottom-[3%] top-[12%] rounded-[48%_48%_45%_45%/43%_43%_57%_57%] border-4 border-[#C51F32]"
        style={{
          background: `
            radial-gradient(
              circle at 27% 20%,
              rgba(255,255,255,.95) 0 7%,
              transparent 8%
            ),
            linear-gradient(
              145deg,
              #FF5B5B,
              #EC2435
            )
          `,
          boxShadow:
            "inset -10px -12px 16px rgba(135,16,26,.18), 0 10px 14px rgba(102,27,30,.18)",
        }}
      />
    </div>
  );
}

/* =========================================================
   BASKET
========================================================= */

function Basket({
  src,
  title,
  subtitle,
  category,
  items,
  selectedApple,
  draggedApple,
  wrong,
  onDropApple,
  onReturnApple,
}: {
  src: string;
  title: string;
  subtitle: string;
  category: LetterCase;
  items: AppleItem[];
  selectedApple: AppleItem | null;
  draggedApple: AppleItem | null;
  wrong: boolean;
  onDropApple: (
    apple: AppleItem
  ) => void;
  onReturnApple: (
    apple: AppleItem
  ) => void;
}) {
  const [imageError, setImageError] =
    useState(false);

  return (
    <div
      className={`relative mx-auto w-full max-w-[520px] ${
        wrong
          ? "basket-wrong"
          : selectedApple
          ? "basket-ready"
          : ""
      }`}
      onDragOver={(event) =>
        event.preventDefault()
      }
      onDrop={(event) => {
        event.preventDefault();

        if (draggedApple) {
          onDropApple(
            draggedApple
          );
        }
      }}
    >
      <button
        type="button"
        onClick={() => {
          if (
            selectedApple
          ) {
            onDropApple(
              selectedApple
            );
          }
        }}
        className="relative block w-full touch-manipulation"
      >
        {!imageError ? (
          <img
            src={src}
            alt={title}
            draggable={false}
            onError={() =>
              setImageError(
                true
              )
            }
            className="pointer-events-none w-full select-none object-contain"
          />
        ) : (
          <BasketFallback />
        )}

        {/* LABEL */}

        <div
          className={`pointer-events-none absolute left-1/2 top-[4%] z-30 w-[62%] -translate-x-1/2 rounded-[20px] border-[3px] border-white/40 px-3 py-2 text-center text-white shadow-lg ${
            category ===
            "uppercase"
              ? "bg-gradient-to-b from-[#A94BE8] to-[#7027B9]"
              : "bg-gradient-to-b from-[#43D949] to-[#11A72D]"
          }`}
        >
          <p className="text-sm font-black drop-shadow sm:text-lg">
            {title}
          </p>

          <p className="mt-1 text-[10px] font-black sm:text-xs">
            {subtitle}
          </p>
        </div>

        {/* APPLES INSIDE */}

        <div className="absolute inset-x-[14%] top-[41%] z-20 flex h-[31%] flex-wrap content-center justify-center gap-1 overflow-hidden">

          {items.map(
            (apple) => (
              <span
                key={
                  apple.id
                }
                onClick={(
                  event
                ) => {
                  event.stopPropagation();

                  onReturnApple(
                    apple
                  );
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#EE3544] text-base font-black text-white shadow sm:h-11 sm:w-11 sm:text-lg"
              >
                {apple.letter}
              </span>
            )
          )}
        </div>
      </button>
    </div>
  );
}

/* =========================================================
   BASKET FALLBACK
========================================================= */

function BasketFallback() {
  return (
    <div className="relative aspect-[1.45/1] w-full">

      <div className="absolute left-[22%] right-[22%] top-[5%] h-[47%] rounded-t-[180px] border-[12px] border-[#B76A2F] border-b-0" />

      <div className="absolute inset-x-[15%] bottom-[5%] top-[29%] rounded-[16px_16px_52px_52px] border-[6px] border-[#A56228] bg-gradient-to-b from-[#E8A052] to-[#BF7033]" />

      <div className="absolute left-[12%] right-[12%] top-[27%] h-[17%] rounded-[50%] border-[6px] border-[#9B5728] bg-[#C77B3B]" />
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
    <section className="rounded-[22px] border border-[#DFE4EF] bg-white p-4 shadow-[0_8px_24px_rgba(25,39,74,0.045)]">
      <h3 className="mb-4 text-sm font-black text-[#101A3B]">
        {title}
      </h3>

      {children}
    </section>
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
          background: `conic-gradient(
            #7C3CFF ${progress}%,
            #ECEAF7 ${progress}% 100%
          )`,
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