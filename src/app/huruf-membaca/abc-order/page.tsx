"use client";

import {
  useEffect,
  useMemo,
  useState,
  type DragEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

import {
  ArrowLeft,
  Check,
  GripVertical,
  Home,
  RotateCcw,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";

type LetterTile = {
  id: string;
  letter: string;
};

type DropSlot = {
  index: number;
  letter: string | null;
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));

    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }

  return copy;
}

function createLetterTiles(): LetterTile[] {
  return shuffleArray(
    ALPHABET.map((letter) => ({
      id: `letter-${letter}`,
      letter,
    }))
  );
}

function createSlots(): DropSlot[] {
  return ALPHABET.map((_, index) => ({
    index,
    letter: null,
  }));
}

export default function ABCOrderPage() {
  const [tiles, setTiles] = useState<LetterTile[]>([]);
  const [slots, setSlots] = useState<DropSlot[]>([]);
  const [draggedLetter, setDraggedLetter] = useState<string | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    resetGame();
  }, []);

  const placedCount = useMemo(() => {
    return slots.filter((slot) => slot.letter !== null).length;
  }, [slots]);

  const progress = Math.round((placedCount / 26) * 100);

  const starCount =
    progress === 100 ? 3 : progress >= 65 ? 2 : progress >= 30 ? 1 : 0;

  function resetGame() {
    setTiles(createLetterTiles());
    setSlots(createSlots());
    setDraggedLetter(null);
    setSelectedLetter(null);
    setCompleted(false);
    setShowHint(true);
  }

  function isCorrectSlot(letter: string, slotIndex: number) {
    return ALPHABET[slotIndex] === letter;
  }

  function placeLetter(letter: string, slotIndex: number) {
    if (!isCorrectSlot(letter, slotIndex)) {
      return;
    }

    const existingSlot = slots.find(
      (slot) => slot.letter === letter
    );

    if (existingSlot) {
      return;
    }

    const updatedSlots = slots.map((slot) => {
      if (slot.index === slotIndex) {
        return {
          ...slot,
          letter,
        };
      }

      return slot;
    });

    setSlots(updatedSlots);

    setTiles((previous) =>
      previous.filter((tile) => tile.letter !== letter)
    );

    setSelectedLetter(null);
    setDraggedLetter(null);

    const nextPlacedCount =
      updatedSlots.filter((slot) => slot.letter !== null).length;

    if (nextPlacedCount === 26) {
      setCompleted(true);
    }
  }

  function removeLetter(slotIndex: number) {
    const target = slots[slotIndex];

    if (!target?.letter) {
      return;
    }

    const letter = target.letter;

    setSlots((previous) =>
      previous.map((slot) =>
        slot.index === slotIndex
          ? {
              ...slot,
              letter: null,
            }
          : slot
      )
    );

    setTiles((previous) => [
      ...previous,
      {
        id: `letter-${letter}`,
        letter,
      },
    ]);

    setCompleted(false);
  }

  function handleDragStart(
    event: DragEvent<HTMLButtonElement>,
    letter: string
  ) {
    setDraggedLetter(letter);

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", letter);
  }

  function handleDragEnd() {
    setDraggedLetter(null);
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>,
    slotIndex: number
  ) {
    event.preventDefault();

    const letter =
      event.dataTransfer.getData("text/plain") ||
      draggedLetter;

    if (!letter) {
      return;
    }

    placeLetter(letter, slotIndex);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleTilePointerDown(
    event: ReactPointerEvent<HTMLButtonElement>,
    letter: string
  ) {
    if (event.pointerType === "mouse") {
      return;
    }

    setSelectedLetter(letter);
  }

  function handleSlotPointerDown(slotIndex: number) {
    if (!selectedLetter) {
      return;
    }

    placeLetter(selectedLetter, slotIndex);
  }

  function speakLetter(letter: string) {
    if (!("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(
      `Letter ${letter}`
    );

    speech.rate = 0.7;
    speech.pitch = 1.1;

    window.speechSynthesis.speak(speech);
  }

  const nextExpectedLetter = ALPHABET[placedCount];

  return (
    <main className="min-h-screen bg-[#F4F6FF] text-[#101A3B]">
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html {
          -webkit-text-size-adjust: 100%;
        }

        body {
          margin: 0;
          background: #f4f6ff;
        }

        button {
          font-family: inherit;
        }

        .floating-letter-a {
          animation: floatA 4.5s ease-in-out infinite;
        }

        .floating-letter-b {
          animation: floatB 5.2s ease-in-out infinite;
        }

        .floating-letter-c {
          animation: floatC 4.8s ease-in-out infinite;
        }

        @keyframes floatA {
          0%,
          100% {
            transform: translateY(0px) rotate(-4deg);
          }

          50% {
            transform: translateY(-18px) rotate(2deg);
          }
        }

        @keyframes floatB {
          0%,
          100% {
            transform: translateY(-5px) rotate(4deg);
          }

          50% {
            transform: translateY(14px) rotate(-2deg);
          }
        }

        @keyframes floatC {
          0%,
          100% {
            transform: translateY(4px) rotate(3deg);
          }

          50% {
            transform: translateY(-14px) rotate(-3deg);
          }
        }

        .sparkle-one {
          animation: sparkleMove 3.6s ease-in-out infinite;
        }

        .sparkle-two {
          animation: sparkleMove 4.2s ease-in-out infinite reverse;
        }

        @keyframes sparkleMove {
          0%,
          100% {
            opacity: 0.35;
            transform: scale(0.9);
          }

          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>

      <header className="border-b border-[#E5E9F3] bg-white">
        <div className="mx-auto flex max-w-[1550px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-[#7C3CFF] text-white shadow-[0_8px_22px_rgba(124,60,255,0.2)]">
              <span className="text-lg font-black">
                FD
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-black tracking-[0.06em] text-[#101A3B] sm:text-[16px]">
                  FD ARCADIA
                </span>

                <Sparkles
                  size={14}
                  className="text-[#7C3CFF]"
                />
              </div>

              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#A4B0C5]">
                LearningHub
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden rounded-[14px] bg-[#EEE8FF] px-4 py-2 text-[11px] font-black uppercase tracking-[0.1em] text-[#7C3CFF] sm:block">
              ABC Order
            </div>

            <a
              href="/huruf-membaca"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] border border-[#DFE4EF] bg-white px-3 text-xs font-black text-[#101A3B] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#FAFBFF] sm:px-4"
            >
              <Home size={16} />

              <span className="hidden sm:inline">
                Back to Home
              </span>
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1550px] px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <section className="relative mb-6 overflow-hidden rounded-[30px] border border-[#DFE4EF] bg-white shadow-[0_12px_32px_rgba(25,39,74,0.06)]">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#EEE8FF] blur-3xl" />
          <div className="absolute bottom-[-120px] left-[45%] h-64 w-64 rounded-full bg-[#EAFBF6] blur-3xl" />

          <div className="relative grid gap-8 px-5 py-7 sm:px-7 sm:py-8 lg:grid-cols-[1fr_1fr] lg:items-center lg:px-10 lg:py-10">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#EEE8FF] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-[#7C3CFF]">
                <Star
                  size={13}
                  fill="currentColor"
                />

                Alphabet Activities
              </div>

              <h1 className="text-[38px] font-black tracking-[-0.04em] text-[#101A3B] sm:text-[48px] lg:text-[58px]">
                ABC Order
              </h1>

              <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-[#7F8DA7] sm:text-[15px]">
                Susun huruf mengikut turutan abjad dari A hingga Z.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <FeatureMiniCard
                  icon={
                    <GripVertical size={18} />
                  }
                  title="Drag & Drop"
                  description="Seret huruf ke tempatnya"
                  tone="purple"
                />

                <FeatureMiniCard
                  icon={
                    <Sparkles size={18} />
                  }
                  title="Learn & Play"
                  description="Belajar sambil bermain"
                  tone="pink"
                />

                <FeatureMiniCard
                  icon={
                    <Trophy size={18} />
                  }
                  title="Get Reward"
                  description="Dapat bintang bila betul"
                  tone="teal"
                />
              </div>
            </div>

            <div className="relative flex min-h-[260px] items-center justify-center sm:min-h-[320px]">
              <div className="sparkle-one absolute left-[10%] top-[10%] text-[#FFB800]">
                <Star
                  size={20}
                  fill="currentColor"
                />
              </div>

              <div className="sparkle-two absolute right-[12%] top-[15%] text-[#7C3CFF]">
                <Sparkles size={21} />
              </div>

              <div className="absolute bottom-[18%] left-[18%] h-3 w-3 rounded-full bg-[#0ABFA8]" />
              <div className="absolute right-[20%] top-[48%] h-3 w-3 rounded-full bg-[#F52C8C]" />

              <div className="flex items-center justify-center gap-2 sm:gap-4">
                <div className="floating-letter-a">
                  <FloatingLetter
                    letter="A"
                    className="bg-gradient-to-br from-[#A862FF] to-[#6530F7]"
                  />
                </div>

                <div className="floating-letter-b">
                  <FloatingLetter
                    letter="B"
                    className="bg-gradient-to-br from-[#FF6AA8] to-[#F52C8C]"
                  />
                </div>

                <div className="floating-letter-c">
                  <FloatingLetter
                    letter="C"
                    className="bg-gradient-to-br from-[#46DCC3] to-[#08A989]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
          <section className="rounded-[30px] border border-[#DFE4EF] bg-white p-4 shadow-[0_10px_28px_rgba(25,39,74,0.05)] sm:p-6">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#AAB4C6]">
                  Alphabet Challenge
                </p>

                <h2 className="mt-1 text-xl font-black text-[#101A3B] sm:text-2xl">
                  Susun Huruf
                </h2>

                <p className="mt-1 text-sm font-medium text-[#8190AA]">
                  Seret huruf di bawah dan letakkan pada kotak yang betul.
                </p>
              </div>

              <button
                type="button"
                onClick={resetGame}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-[#F1ECFF] px-4 text-xs font-black text-[#7C3CFF] transition hover:-translate-y-0.5"
              >
                <RotateCcw size={16} />
                Reset
              </button>
            </div>

            <div className="rounded-[24px] border-2 border-dashed border-[#D9CFFF] bg-[#FAF9FF] p-3 sm:p-4">
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-13">
                {slots.map((slot) => {
                  const expected = ALPHABET[slot.index];

                  return (
                    <div
                      key={slot.index}
                      onDragOver={handleDragOver}
                      onDrop={(event) =>
                        handleDrop(
                          event,
                          slot.index
                        )
                      }
                      onPointerDown={() =>
                        handleSlotPointerDown(
                          slot.index
                        )
                      }
                      className={`relative flex aspect-square min-h-[54px] items-center justify-center rounded-[15px] border-2 transition sm:min-h-[64px] ${
                        slot.letter
                          ? "border-[#BDEBDF] bg-[#EAFAF5]"
                          : selectedLetter === expected
                          ? "border-[#7C3CFF] bg-[#F3EFFF] shadow-[0_0_0_3px_rgba(124,60,255,0.08)]"
                          : "border-[#E1E5F0] bg-white"
                      }`}
                    >
                      <span className="absolute left-2 top-1.5 text-[9px] font-black text-[#C1C9D7]">
                        {slot.index + 1}
                      </span>

                      {slot.letter ? (
                        <button
                          type="button"
                          onClick={() =>
                            removeLetter(
                              slot.index
                            )
                          }
                          className="flex h-full w-full items-center justify-center text-2xl font-black text-[#08A989] sm:text-3xl"
                        >
                          {slot.letter}
                        </button>
                      ) : (
                        <span className="text-xl font-black text-[#E2E6EF]">
                          {expected}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-center">
                <div className="rounded-full bg-[#EEE8FF] px-4 py-2 text-[11px] font-black text-[#7C3CFF]">
                  Drop letters here
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#AAB4C6]">
                    Available Letters
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#52627F]">
                    {tiles.length} huruf lagi
                  </p>
                </div>

                {selectedLetter && (
                  <div className="rounded-full bg-[#EEE8FF] px-3 py-1.5 text-xs font-black text-[#7C3CFF]">
                    Selected: {selectedLetter}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-5 gap-2 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-11">
                {tiles.map((tile, index) => {
                  const palette = [
                    "text-[#7C3CFF]",
                    "text-[#F52C8C]",
                    "text-[#08A989]",
                    "text-[#008FD3]",
                    "text-[#F59E0B]",
                  ];

                  const colorClass =
                    palette[
                      index % palette.length
                    ];

                  const selected =
                    selectedLetter ===
                    tile.letter;

                  return (
                    <button
                      type="button"
                      key={tile.id}
                      draggable
                      onDragStart={(event) =>
                        handleDragStart(
                          event,
                          tile.letter
                        )
                      }
                      onDragEnd={
                        handleDragEnd
                      }
                      onPointerDown={(event) =>
                        handleTilePointerDown(
                          event,
                          tile.letter
                        )
                      }
                      onClick={() => {
                        setSelectedLetter(
                          tile.letter
                        );

                        speakLetter(
                          tile.letter
                        );
                      }}
                      className={`flex aspect-square min-h-[58px] touch-manipulation items-center justify-center rounded-[16px] border bg-white text-2xl font-black shadow-[0_6px_16px_rgba(31,43,76,0.06)] transition active:scale-95 sm:min-h-[68px] sm:text-3xl ${
                        selected
                          ? "border-[#7C3CFF] ring-4 ring-[#EEE8FF]"
                          : "border-[#E1E5EE] hover:-translate-y-1 hover:shadow-[0_10px_22px_rgba(31,43,76,0.1)]"
                      } ${colorClass}`}
                    >
                      {tile.letter}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 rounded-[18px] bg-[#F8FAFF] px-4 py-3 text-center text-xs font-bold text-[#8794AA]">
              Tip: Mulakan dengan huruf{" "}
              <span className="font-black text-[#7C3CFF]">
                {nextExpectedLetter ?? "Z"}
              </span>
              .
            </div>
          </section>

          <aside className="space-y-5">
            <InfoCard
              title="Cara Bermain"
              tone="purple"
            >
              <ol className="space-y-3">
                <InstructionItem
                  number="1"
                  text="Pilih atau seret huruf dari bahagian bawah."
                />

                <InstructionItem
                  number="2"
                  text="Letakkan huruf pada kotak nombor yang betul."
                />

                <InstructionItem
                  number="3"
                  text="Susun semua huruf daripada A hingga Z."
                />

                <InstructionItem
                  number="4"
                  text="Lengkapkan semua huruf untuk dapat 3 bintang."
                />
              </ol>
            </InfoCard>

            <InfoCard
              title="Kemajuan"
              tone="teal"
            >
              <div className="flex items-center gap-5">
                <div
                  className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(#7C3CFF ${progress}%, #ECEAF7 ${progress}% 100%)`,
                  }}
                >
                  <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white">
                    <span className="text-xl font-black text-[#101A3B]">
                      {progress}%
                    </span>

                    <span className="text-[10px] font-bold text-[#9AA6B9]">
                      Selesai
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#A7B1C2]">
                      Huruf
                    </p>

                    <p className="mt-1 text-xl font-black text-[#101A3B]">
                      {placedCount}
                      <span className="text-sm text-[#A8B2C2]">
                        {" "}
                        / 26
                      </span>
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#A7B1C2]">
                      Bintang
                    </p>

                    <div className="mt-1 flex gap-1">
                      {[0, 1, 2].map(
                        (star) => (
                          <Star
                            key={star}
                            size={18}
                            fill={
                              star <
                              starCount
                                ? "currentColor"
                                : "none"
                            }
                            className={
                              star <
                              starCount
                                ? "text-[#FFB800]"
                                : "text-[#D8DEE8]"
                            }
                          />
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </InfoCard>

            <InfoCard
              title="Ganjaran"
              tone="pink"
            >
              <p className="text-sm font-medium leading-6 text-[#8190AA]">
                Selesaikan semua huruf dengan betul untuk dapatkan 3 bintang.
              </p>

              <div className="mt-4 flex justify-center gap-3">
                {[0, 1, 2].map(
                  (star) => (
                    <Star
                      key={star}
                      size={34}
                      fill={
                        star < starCount
                          ? "currentColor"
                          : "none"
                      }
                      className={
                        star < starCount
                          ? "text-[#FFB800]"
                          : "text-[#D9DEE8]"
                      }
                    />
                  )
                )}
              </div>
            </InfoCard>

            {showHint && (
              <div className="rounded-[24px] border border-[#E8DFFF] bg-[#F8F5FF] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#EEE8FF] text-[#7C3CFF]">
                    <Sparkles
                      size={17}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-black text-[#101A3B]">
                      Hint
                    </p>

                    <p className="mt-1 text-xs font-medium leading-5 text-[#8190AA]">
                      Huruf seterusnya ialah{" "}
                      <span className="font-black text-[#7C3CFF]">
                        {nextExpectedLetter ??
                          "Z"}
                      </span>
                      .
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setShowHint(false)
                      }
                      className="mt-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#A0AABC]"
                    >
                      Hide hint
                    </button>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {completed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101A3B]/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[480px] rounded-[30px] border border-white/50 bg-white p-6 text-center shadow-[0_30px_90px_rgba(16,26,59,0.2)] sm:p-8">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF2C7] text-[#FFB800]">
              <Trophy size={38} />
            </div>

            <p className="mt-5 text-[10px] font-black uppercase tracking-[0.16em] text-[#7C3CFF]">
              Mission Complete
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[#101A3B]">
              Hebat!
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-6 text-[#8190AA]">
              Semua huruf A hingga Z telah disusun dengan betul.
            </p>

            <div className="mt-5 flex justify-center gap-2">
              {[0, 1, 2].map(
                (star) => (
                  <Star
                    key={star}
                    size={36}
                    fill="currentColor"
                    className="text-[#FFB800]"
                  />
                )
              )}
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={resetGame}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[#7C3CFF] text-sm font-black text-white shadow-[0_10px_24px_rgba(124,60,255,0.2)]"
              >
                <RotateCcw size={17} />
                Main Lagi
              </button>

              <a
                href="/huruf-membaca"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] border border-[#E1E5EF] bg-white text-sm font-black text-[#101A3B]"
              >
                <ArrowLeft size={17} />
                Kembali
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function FloatingLetter({
  letter,
  className,
}: {
  letter: string;
  className: string;
}) {
  return (
    <div
      className={`relative flex h-[120px] w-[105px] items-center justify-center rounded-[28px] text-[84px] font-black leading-none text-white shadow-[0_20px_40px_rgba(50,40,100,0.2)] sm:h-[160px] sm:w-[140px] sm:text-[112px] lg:h-[190px] lg:w-[165px] lg:text-[132px] ${className}`}
    >
      <span className="-translate-y-1">
        {letter}
      </span>

      <div className="absolute bottom-[22%] left-[32%] h-2.5 w-2.5 rounded-full bg-[#17213E]" />
      <div className="absolute bottom-[22%] right-[32%] h-2.5 w-2.5 rounded-full bg-[#17213E]" />

      <div className="absolute bottom-[12%] left-1/2 h-2 w-5 -translate-x-1/2 rounded-b-full border-b-[3px] border-[#17213E]" />
    </div>
  );
}

function FeatureMiniCard({
  icon,
  title,
  description,
  tone,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  tone: "purple" | "pink" | "teal";
}) {
  const toneClass =
    tone === "purple"
      ? "bg-[#EEE8FF] text-[#7C3CFF]"
      : tone === "pink"
      ? "bg-[#FFF0F7] text-[#F52C8C]"
      : "bg-[#E9FBF7] text-[#08A989]";

  return (
    <div className="flex items-center gap-3 rounded-[18px] border border-[#E4E8F0] bg-white p-3 shadow-[0_8px_22px_rgba(25,39,74,0.04)]">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] ${toneClass}`}
      >
        {icon}
      </div>

      <div>
        <p className="text-xs font-black text-[#101A3B]">
          {title}
        </p>

        <p className="mt-0.5 text-[10px] font-medium text-[#8D9AB0]">
          {description}
        </p>
      </div>
    </div>
  );
}

function InfoCard({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "purple" | "pink" | "teal";
  children: ReactNode;
}) {
  const dotClass =
    tone === "purple"
      ? "bg-[#7C3CFF]"
      : tone === "pink"
      ? "bg-[#F52C8C]"
      : "bg-[#08A989]";

  return (
    <section className="rounded-[26px] border border-[#DFE4EF] bg-white p-5 shadow-[0_10px_28px_rgba(25,39,74,0.05)]">
      <div className="mb-4 flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${dotClass}`}
        />

        <h3 className="text-base font-black text-[#101A3B]">
          {title}
        </h3>
      </div>

      {children}
    </section>
  );
}

function InstructionItem({
  number,
  text,
}: {
  number: string;
  text: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7C3CFF] text-[10px] font-black text-white">
        {number}
      </span>

      <p className="pt-0.5 text-xs font-medium leading-5 text-[#7F8EA7]">
        {text}
      </p>
    </li>
  );
}