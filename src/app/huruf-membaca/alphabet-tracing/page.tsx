"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Eraser,
  Home,
  PenLine,
  Redo2,
  Sparkles,
  Star,
  Trash2,
  Undo2,
  Volume2,
} from "lucide-react";

type DrawingMode = "pen" | "eraser";

type Point = {
  x: number;
  y: number;
};

type Stroke = {
  points: Point[];
  mode: DrawingMode;
  size: number;
};

type StrokeHint = {
  number: number;
  x: number;
  y: number;
};

type LetterData = {
  uppercaseHints: StrokeHint[];
  lowercaseHints: StrokeHint[];
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const LETTER_DATA: Record<string, LetterData> = {
  A: {
    uppercaseHints: [
      { number: 1, x: 27, y: 16 },
      { number: 2, x: 69, y: 16 },
      { number: 3, x: 50, y: 58 },
    ],
    lowercaseHints: [
      { number: 1, x: 31, y: 42 },
      { number: 2, x: 69, y: 38 },
    ],
  },
  B: {
    uppercaseHints: [
      { number: 1, x: 28, y: 15 },
      { number: 2, x: 49, y: 16 },
      { number: 3, x: 50, y: 49 },
    ],
    lowercaseHints: [
      { number: 1, x: 30, y: 16 },
      { number: 2, x: 53, y: 48 },
    ],
  },
  C: {
    uppercaseHints: [{ number: 1, x: 68, y: 23 }],
    lowercaseHints: [{ number: 1, x: 67, y: 41 }],
  },
  D: {
    uppercaseHints: [
      { number: 1, x: 28, y: 15 },
      { number: 2, x: 50, y: 16 },
    ],
    lowercaseHints: [
      { number: 1, x: 31, y: 43 },
      { number: 2, x: 69, y: 16 },
    ],
  },
  E: {
    uppercaseHints: [
      { number: 1, x: 28, y: 15 },
      { number: 2, x: 48, y: 15 },
      { number: 3, x: 48, y: 49 },
      { number: 4, x: 48, y: 78 },
    ],
    lowercaseHints: [
      { number: 1, x: 32, y: 47 },
      { number: 2, x: 68, y: 34 },
    ],
  },
  F: {
    uppercaseHints: [
      { number: 1, x: 28, y: 15 },
      { number: 2, x: 48, y: 15 },
      { number: 3, x: 48, y: 49 },
    ],
    lowercaseHints: [
      { number: 1, x: 58, y: 16 },
      { number: 2, x: 32, y: 47 },
    ],
  },
  G: {
    uppercaseHints: [
      { number: 1, x: 68, y: 23 },
      { number: 2, x: 61, y: 58 },
    ],
    lowercaseHints: [
      { number: 1, x: 31, y: 43 },
      { number: 2, x: 67, y: 58 },
    ],
  },
  H: {
    uppercaseHints: [
      { number: 1, x: 26, y: 15 },
      { number: 2, x: 74, y: 15 },
      { number: 3, x: 50, y: 49 },
    ],
    lowercaseHints: [
      { number: 1, x: 31, y: 15 },
      { number: 2, x: 55, y: 49 },
    ],
  },
  I: {
    uppercaseHints: [{ number: 1, x: 50, y: 15 }],
    lowercaseHints: [
      { number: 1, x: 50, y: 39 },
      { number: 2, x: 50, y: 17 },
    ],
  },
  J: {
    uppercaseHints: [{ number: 1, x: 62, y: 15 }],
    lowercaseHints: [
      { number: 1, x: 55, y: 39 },
      { number: 2, x: 55, y: 17 },
    ],
  },
  K: {
    uppercaseHints: [
      { number: 1, x: 27, y: 15 },
      { number: 2, x: 68, y: 16 },
      { number: 3, x: 68, y: 56 },
    ],
    lowercaseHints: [
      { number: 1, x: 31, y: 15 },
      { number: 2, x: 67, y: 41 },
      { number: 3, x: 65, y: 58 },
    ],
  },
  L: {
    uppercaseHints: [{ number: 1, x: 30, y: 15 }],
    lowercaseHints: [{ number: 1, x: 50, y: 15 }],
  },
  M: {
    uppercaseHints: [
      { number: 1, x: 16, y: 14 },
      { number: 2, x: 37, y: 14 },
      { number: 3, x: 50, y: 58 },
      { number: 4, x: 82, y: 14 },
    ],
    lowercaseHints: [
      { number: 1, x: 20, y: 40 },
      { number: 2, x: 50, y: 35 },
      { number: 3, x: 79, y: 35 },
    ],
  },
  N: {
    uppercaseHints: [
      { number: 1, x: 25, y: 15 },
      { number: 2, x: 40, y: 15 },
      { number: 3, x: 75, y: 15 },
    ],
    lowercaseHints: [
      { number: 1, x: 29, y: 41 },
      { number: 2, x: 65, y: 38 },
    ],
  },
  O: {
    uppercaseHints: [{ number: 1, x: 67, y: 23 }],
    lowercaseHints: [{ number: 1, x: 67, y: 41 }],
  },
  P: {
    uppercaseHints: [
      { number: 1, x: 29, y: 15 },
      { number: 2, x: 50, y: 16 },
    ],
    lowercaseHints: [
      { number: 1, x: 31, y: 40 },
      { number: 2, x: 54, y: 42 },
    ],
  },
  Q: {
    uppercaseHints: [
      { number: 1, x: 67, y: 23 },
      { number: 2, x: 65, y: 71 },
    ],
    lowercaseHints: [
      { number: 1, x: 31, y: 43 },
      { number: 2, x: 68, y: 40 },
    ],
  },
  R: {
    uppercaseHints: [
      { number: 1, x: 29, y: 15 },
      { number: 2, x: 49, y: 16 },
      { number: 3, x: 58, y: 53 },
    ],
    lowercaseHints: [
      { number: 1, x: 31, y: 41 },
      { number: 2, x: 61, y: 39 },
    ],
  },
  S: {
    uppercaseHints: [{ number: 1, x: 66, y: 23 }],
    lowercaseHints: [{ number: 1, x: 65, y: 41 }],
  },
  T: {
    uppercaseHints: [
      { number: 1, x: 28, y: 15 },
      { number: 2, x: 50, y: 16 },
    ],
    lowercaseHints: [
      { number: 1, x: 50, y: 24 },
      { number: 2, x: 32, y: 47 },
    ],
  },
  U: {
    uppercaseHints: [{ number: 1, x: 24, y: 15 }],
    lowercaseHints: [
      { number: 1, x: 29, y: 40 },
      { number: 2, x: 71, y: 40 },
    ],
  },
  V: {
    uppercaseHints: [
      { number: 1, x: 27, y: 15 },
      { number: 2, x: 73, y: 15 },
    ],
    lowercaseHints: [
      { number: 1, x: 29, y: 40 },
      { number: 2, x: 71, y: 40 },
    ],
  },
  W: {
    uppercaseHints: [
      { number: 1, x: 15, y: 15 },
      { number: 2, x: 34, y: 74 },
      { number: 3, x: 53, y: 51 },
      { number: 4, x: 84, y: 15 },
    ],
    lowercaseHints: [
      { number: 1, x: 15, y: 40 },
      { number: 2, x: 35, y: 66 },
      { number: 3, x: 55, y: 45 },
      { number: 4, x: 84, y: 40 },
    ],
  },
  X: {
    uppercaseHints: [
      { number: 1, x: 27, y: 15 },
      { number: 2, x: 73, y: 15 },
    ],
    lowercaseHints: [
      { number: 1, x: 29, y: 40 },
      { number: 2, x: 71, y: 40 },
    ],
  },
  Y: {
    uppercaseHints: [
      { number: 1, x: 26, y: 15 },
      { number: 2, x: 74, y: 15 },
      { number: 3, x: 50, y: 51 },
    ],
    lowercaseHints: [
      { number: 1, x: 29, y: 40 },
      { number: 2, x: 71, y: 40 },
    ],
  },
  Z: {
    uppercaseHints: [
      { number: 1, x: 27, y: 15 },
      { number: 2, x: 73, y: 20 },
      { number: 3, x: 27, y: 78 },
    ],
    lowercaseHints: [
      { number: 1, x: 29, y: 40 },
      { number: 2, x: 71, y: 43 },
      { number: 3, x: 29, y: 67 },
    ],
  },
};

function getCanvasPoint(
  event: ReactPointerEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement
): Point {
  const rect = canvas.getBoundingClientRect();

  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height,
  };
}

function DrawingCanvas({
  letter,
  variant,
}: {
  letter: string;
  variant: "trace" | "free";
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [mode, setMode] = useState<DrawingMode>("pen");
  const [penSize, setPenSize] = useState(7);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    strokes.forEach((stroke) => {
      if (stroke.points.length === 0) return;

      context.save();
      context.lineCap = "round";
      context.lineJoin = "round";
      context.lineWidth = stroke.size;

      if (stroke.mode === "eraser") {
        context.globalCompositeOperation = "destination-out";
        context.strokeStyle = "#000000";
      } else {
        context.globalCompositeOperation = "source-over";
        context.strokeStyle = "#5B2DFF";
      }

      context.beginPath();

      const first = stroke.points[0];
      context.moveTo(first.x, first.y);

      if (stroke.points.length === 1) {
        context.lineTo(first.x + 0.1, first.y + 0.1);
      } else {
        for (let i = 1; i < stroke.points.length; i += 1) {
          const point = stroke.points[i];
          context.lineTo(point.x, point.y);
        }
      }

      context.stroke();
      context.restore();
    });
  }, [strokes]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  useEffect(() => {
    setStrokes([]);
    setRedoStack([]);
  }, [letter, variant]);

  function handlePointerDown(
    event: ReactPointerEvent<HTMLCanvasElement>
  ) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    event.preventDefault();

    try {
      canvas.setPointerCapture(event.pointerId);
    } catch {
      // ignore
    }

    const point = getCanvasPoint(event, canvas);

    const newStroke: Stroke = {
      points: [point],
      mode,
      size: mode === "eraser" ? 30 : penSize,
    };

    setStrokes((previous) => [...previous, newStroke]);
    setRedoStack([]);
    setIsDrawing(true);
  }

  function handlePointerMove(
    event: ReactPointerEvent<HTMLCanvasElement>
  ) {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    event.preventDefault();

    const point = getCanvasPoint(event, canvas);

    setStrokes((previous) => {
      if (previous.length === 0) return previous;

      const updated = [...previous];
      const lastIndex = updated.length - 1;
      const lastStroke = updated[lastIndex];

      updated[lastIndex] = {
        ...lastStroke,
        points: [...lastStroke.points, point],
      };

      return updated;
    });
  }

  function handlePointerUp(
    event?: ReactPointerEvent<HTMLCanvasElement>
  ) {
    if (event && canvasRef.current) {
      try {
        canvasRef.current.releasePointerCapture(event.pointerId);
      } catch {
        // ignore
      }
    }

    setIsDrawing(false);
  }

  function undo() {
    if (strokes.length === 0) return;

    const removed = strokes[strokes.length - 1];

    setStrokes((previous) => previous.slice(0, -1));
    setRedoStack((previous) => [...previous, removed]);
  }

  function redo() {
    if (redoStack.length === 0) return;

    const restored = redoStack[redoStack.length - 1];

    setRedoStack((previous) => previous.slice(0, -1));
    setStrokes((previous) => [...previous, restored]);
  }

  function clearCanvas() {
    setStrokes([]);
    setRedoStack([]);
  }

  const canvasHeight =
    variant === "trace"
      ? "h-[330px] sm:h-[400px] md:h-[430px] lg:h-[480px]"
      : "h-[280px] sm:h-[320px] md:h-[340px] lg:h-[360px]";

  return (
    <div className="overflow-hidden rounded-[28px] border border-[#DFE4EF] bg-white shadow-[0_10px_28px_rgba(25,39,74,0.05)]">
      <div className={`relative overflow-hidden ${canvasHeight}`}>
        {variant === "trace" ? (
          <TraceCanvasBackground letter={letter} />
        ) : (
          <FreeCanvasBackground />
        )}

        <canvas
          ref={canvasRef}
          width={1600}
          height={900}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={(event) => {
            if (isDrawing) {
              handlePointerUp(event);
            }
          }}
          className="absolute inset-0 z-20 h-full w-full cursor-crosshair touch-none select-none"
          style={{
            touchAction: "none",
            WebkitUserSelect: "none",
            userSelect: "none",
          }}
        />
      </div>

      <div className="relative z-30 flex flex-col gap-3 border-t border-[#E9EDF5] bg-[#FAFBFF] p-3 sm:p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <CanvasToolButton
            active={mode === "pen"}
            onClick={() => setMode("pen")}
          >
            <PenLine size={15} />
            Pen
          </CanvasToolButton>

          <CanvasToolButton
            active={mode === "eraser"}
            onClick={() => setMode("eraser")}
          >
            <Eraser size={15} />
            Eraser
          </CanvasToolButton>

          <SmallButton
            onClick={undo}
            disabled={strokes.length === 0}
          >
            <Undo2 size={15} />
            Undo
          </SmallButton>

          <SmallButton
            onClick={redo}
            disabled={redoStack.length === 0}
          >
            <Redo2 size={15} />
            Redo
          </SmallButton>

          <SmallButton
            onClick={clearCanvas}
            disabled={strokes.length === 0}
            danger
          >
            <Trash2 size={15} />
            Clear
          </SmallButton>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-[#E2E7F1] bg-white px-3 py-2">
          <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#94A0B6]">
            Pen Size
          </span>

          <input
            type="range"
            min={4}
            max={15}
            value={penSize}
            onChange={(event) => {
              setPenSize(Number(event.target.value));
            }}
            className="w-24 accent-[#7C3CFF]"
          />
        </div>
      </div>
    </div>
  );
}

function TraceCanvasBackground({ letter }: { letter: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-white">
      <WritingLines />

      <div className="absolute inset-0 grid grid-cols-2">
        <div className="relative flex items-center justify-center border-r border-dashed border-[#E8D8F5] p-2 sm:p-4 md:p-6">
          <DottedTraceLetter
            character={letter}
            type="uppercase"
          />
        </div>

        <div className="relative flex items-center justify-center p-2 sm:p-4 md:p-6">
          <DottedTraceLetter
            character={letter.toLowerCase()}
            type="lowercase"
          />
        </div>
      </div>
    </div>
  );
}

function DottedTraceLetter({
  character,
  type,
}: {
  character: string;
  type: "uppercase" | "lowercase";
}) {
  return (
    <svg
      viewBox="0 0 500 500"
      preserveAspectRatio="xMidYMid meet"
      className="h-[90%] w-[90%] max-h-full max-w-full overflow-visible"
      aria-hidden="true"
    >
      <text
        x="250"
        y={type === "uppercase" ? "400" : "390"}
        textAnchor="middle"
        fontFamily='"KG Blank Space Bold", "KG Blank Space Solid", "Comic Sans MS", sans-serif'
        fontSize={type === "uppercase" ? "410" : "400"}
        fontWeight="700"
        fill="none"
        stroke="#9EB0CB"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="11 12"
      >
        {character}
      </text>
    </svg>
  );
}

function FreeCanvasBackground() {
  return (
    <div className="absolute inset-0 bg-white">
      <WritingLines />

      <div className="absolute bottom-5 left-1/2 top-5 border-l border-dashed border-[#E5D8EF]" />

      <div className="absolute left-3 top-3 rounded-full bg-[#F1ECFF] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-[#7C3CFF] sm:left-5 sm:top-5 sm:px-3 sm:text-[10px]">
        Uppercase
      </div>

      <div className="absolute left-[52%] top-3 rounded-full bg-[#FFF0F7] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-[#F52C8C] sm:left-[53%] sm:top-5 sm:px-3 sm:text-[10px]">
        Lowercase
      </div>
    </div>
  );
}

function WritingLines() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-4 right-4 top-[21%] border-t border-[#D8E0EE]" />
      <div className="absolute left-4 right-4 top-1/2 border-t border-dashed border-[#B8C8E0]" />
      <div className="absolute left-4 right-4 top-[79%] border-t border-[#9FB0CA]" />
    </div>
  );
}

function StrokeGuide({ letter }: { letter: string }) {
  const data = LETTER_DATA[letter];

  return (
    <div className="grid overflow-hidden md:grid-cols-2">
      <LetterFormation
        character={letter}
        type="uppercase"
        hints={data.uppercaseHints}
      />

      <LetterFormation
        character={letter.toLowerCase()}
        type="lowercase"
        hints={data.lowercaseHints}
      />
    </div>
  );
}

function LetterFormation({
  character,
  type,
  hints,
}: {
  character: string;
  type: "uppercase" | "lowercase";
  hints: StrokeHint[];
}) {
  return (
    <div className="relative min-h-[300px] overflow-hidden px-3 pb-4 pt-11 first:border-b first:border-[#E8ECF4] sm:min-h-[330px] sm:px-4 sm:pt-12 md:first:border-b-0 md:first:border-r">
      <div className="absolute left-4 top-4 rounded-full bg-[#F4F0FF] px-3 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#7C3CFF] sm:left-5 sm:top-5 sm:text-[10px]">
        {type === "uppercase" ? "Uppercase" : "Lowercase"}
      </div>

      <div className="absolute left-4 right-4 top-[31%] border-t border-dashed border-[#C9D5E7]" />
      <div className="absolute bottom-[13%] left-4 right-4 border-t border-[#9EB2CF]" />

      <div className="relative flex h-[245px] items-center justify-center sm:h-[280px]">
        <span className="formation-letter">
          {character}
        </span>

        {hints.map((hint) => (
          <div
            key={`${character}-${hint.number}`}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${hint.x}%`,
              top: `${hint.y}%`,
            }}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#F52C8C] text-[12px] font-black text-white shadow-[0_5px_15px_rgba(245,44,140,0.22)] sm:h-9 sm:w-9 sm:text-sm">
              {hint.number}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepHeader({
  step,
  title,
  description,
  tone,
}: {
  step: string;
  title: string;
  description: string;
  tone: "purple" | "pink" | "teal";
}) {
  const badgeClass =
    tone === "purple"
      ? "bg-[#EEE8FF] text-[#7C3CFF]"
      : tone === "pink"
      ? "bg-[#FFF0F7] text-[#F52C8C]"
      : "bg-[#E7FBF6] text-[#08A989]";

  return (
    <div className="flex gap-3 border-b border-[#E8ECF4] px-4 py-4 sm:gap-4 sm:px-6 sm:py-5">
      <div
        className={`flex h-10 min-w-[48px] items-center justify-center rounded-[14px] text-xs font-black sm:h-11 sm:min-w-[52px] sm:text-sm ${badgeClass}`}
      >
        {step}
      </div>

      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#B2BDCF] sm:text-[10px]">
          Step {step}
        </p>

        <h2 className="mt-1 text-lg font-black tracking-[-0.02em] text-[#101A3B] sm:text-2xl">
          {title}
        </h2>

        <p className="mt-1 text-xs font-medium text-[#8190AA] sm:text-sm">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function AlphabetTracingPage() {
  const [selectedLetter, setSelectedLetter] = useState("A");
  const [completedLetters, setCompletedLetters] = useState<string[]>([]);
  const [mobileLettersOpen, setMobileLettersOpen] = useState(false);

  const currentIndex = ALPHABET.indexOf(selectedLetter);

  const progress = Math.round(
    (completedLetters.length / ALPHABET.length) * 100
  );

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(
        "fd-learninghub-alphabet-progress"
      );

      if (!saved) return;

      const parsed = JSON.parse(saved) as string[];

      setCompletedLetters(
        parsed.filter((letter) => ALPHABET.includes(letter))
      );
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "fd-learninghub-alphabet-progress",
        JSON.stringify(completedLetters)
      );
    } catch {
      // ignore
    }
  }, [completedLetters]);

  function selectLetter(letter: string) {
    setSelectedLetter(letter);
    setMobileLettersOpen(false);
  }

  function previousLetter() {
    if (currentIndex <= 0) return;

    setSelectedLetter(ALPHABET[currentIndex - 1]);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function nextLetter() {
    if (currentIndex >= ALPHABET.length - 1) return;

    setSelectedLetter(ALPHABET[currentIndex + 1]);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function markComplete() {
    setCompletedLetters((previous) => {
      if (previous.includes(selectedLetter)) {
        return previous;
      }

      return [...previous, selectedLetter];
    });
  }

  function resetProgress() {
    setCompletedLetters([]);
  }

  function listenToLetter() {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(
      `Letter ${selectedLetter}`
    );

    speech.rate = 0.75;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
  }

  const isCompleted = completedLetters.includes(selectedLetter);

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
          overscroll-behavior-y: contain;
        }

        button,
        input {
          font-family: inherit;
        }

        canvas {
          -webkit-tap-highlight-color: transparent;
        }

        .formation-letter {
          font-family:
            "KG Blank Space Bold",
            "KG Blank Space Solid",
            "Comic Sans MS",
            sans-serif;
          font-size: clamp(155px, 21vw, 255px);
          font-weight: 700;
          line-height: 0.8;
          color: #13254a;
        }

        @media (max-width: 767px) {
          .formation-letter {
            font-size: clamp(165px, 45vw, 230px);
          }
        }
      `}</style>

      <header className="border-b border-[#E5E9F3] bg-[#F4F6FF]">
        <div className="mx-auto flex max-w-[1550px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#7C3CFF] shadow-[0_8px_22px_rgba(124,60,255,0.2)]">
              <span className="text-lg font-black text-white">
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
            <div className="hidden rounded-full border border-[#DFE4EF] bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.1em] text-[#7A88A1] md:block">
              A-Z Letter Tracing
            </div>

            <a
              href="/huruf-membaca"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] border border-[#DDDFF0] bg-white px-3 text-xs font-black text-[#6F36F4] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#F8F5FF] hover:shadow-md sm:px-4"
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
        <section className="mb-5 overflow-hidden rounded-[28px] border border-[#DFE4EF] bg-white shadow-[0_10px_30px_rgba(25,39,74,0.06)] sm:mb-6 sm:rounded-[30px]">
          <div className="grid gap-5 px-5 py-6 sm:px-6 sm:py-7 lg:grid-cols-[1fr_250px] lg:items-center lg:px-9 lg:py-9">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#EEE8FF] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-[#7C3CFF]">
                <Star size={13} fill="currentColor" />
                Alphabet Journey
              </div>

              <h1 className="text-[31px] font-black leading-none tracking-[-0.035em] text-[#101A3B] sm:text-[44px] lg:text-[50px]">
                Learn. Trace. Write.
              </h1>

              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[#7F8DA7]">
                Learn the letter formation, trace directly on the guide
                and practise writing independently.
              </p>
            </div>

            <div className="rounded-[24px] border border-[#E3E7F0] bg-[#FBFCFF] p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.13em] text-[#A4AFC1]">
                    My Progress
                  </p>

                  <p className="mt-1 text-2xl font-black text-[#101A3B]">
                    {completedLetters.length}
                    <span className="text-sm text-[#B4BECD]">
                      {" "}
                      / 26
                    </span>
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-[#EEE8FF] text-[#7C3CFF]">
                  <Star size={21} fill="currentColor" />
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E9ECF4]">
                <div
                  className="h-full rounded-full bg-[#7C3CFF] transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-[#9CA7B9]">
                <span>{progress}% Complete</span>

                {completedLetters.length > 0 && (
                  <button
                    type="button"
                    onClick={resetProgress}
                    className="font-black text-[#F52C8C] hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <button
          type="button"
          onClick={() =>
            setMobileLettersOpen((previous) => !previous)
          }
          className="mb-4 flex w-full items-center justify-between rounded-[18px] border border-[#DFE4EF] bg-white px-4 py-3.5 text-left font-black shadow-sm lg:hidden"
        >
          <span>
            Letter{" "}
            <span className="text-[#7C3CFF]">
              {selectedLetter}
              {selectedLetter.toLowerCase()}
            </span>
          </span>

          {mobileLettersOpen ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>

        <div className="grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-6">
          <aside
            className={`self-start rounded-[28px] border border-[#DFE4EF] bg-white p-4 shadow-[0_10px_28px_rgba(25,39,74,0.05)] lg:sticky lg:top-5 lg:block ${
              mobileLettersOpen ? "block" : "hidden"
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#A4AEC0]">
                  Choose Letter
                </p>

                <h3 className="mt-1 text-xl font-black text-[#101A3B]">
                  A-Z
                </h3>
              </div>

              <div className="rounded-[10px] bg-[#EEE8FF] px-2.5 py-1.5 text-xs font-black text-[#7C3CFF]">
                26
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-3">
              {ALPHABET.map((letter) => {
                const selected = letter === selectedLetter;
                const completed = completedLetters.includes(letter);

                return (
                  <button
                    type="button"
                    key={letter}
                    onClick={() => selectLetter(letter)}
                    className={`relative aspect-square rounded-[15px] border text-[16px] font-black transition-all duration-200 ${
                      selected
                        ? "border-[#7C3CFF] bg-[#7C3CFF] text-white shadow-[0_8px_22px_rgba(124,60,255,0.2)]"
                        : completed
                        ? "border-[#CFEFE7] bg-[#F0FCF8] text-[#08A989]"
                        : "border-[#E3E7EF] bg-white text-[#25395F] hover:-translate-y-0.5 hover:border-[#C9D1E3]"
                    }`}
                  >
                    {letter}
                    <span className="text-[11px] opacity-70">
                      {letter.toLowerCase()}
                    </span>

                    {completed && !selected && (
                      <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#08A989] text-white">
                        <Check size={9} strokeWidth={4} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="space-y-5 sm:space-y-6">
            <section className="flex flex-col gap-4 rounded-[28px] border border-[#DFE4EF] bg-white p-4 shadow-[0_10px_28px_rgba(25,39,74,0.05)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-[18px] bg-[#EEE8FF] text-[#7C3CFF]">
                  <span className="text-[29px] font-black">
                    {selectedLetter}
                  </span>

                  <span
                    className="text-[22px]"
                    style={{
                      fontFamily:
                        '"KG Blank Space Bold", "KG Blank Space Solid", "Comic Sans MS", sans-serif',
                    }}
                  >
                    {selectedLetter.toLowerCase()}
                  </span>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.13em] text-[#A6B0C2]">
                    Now Learning
                  </p>

                  <h2 className="mt-1 text-xl font-black text-[#101A3B]">
                    Letter {selectedLetter}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={listenToLetter}
                className="inline-flex items-center justify-center gap-2 rounded-[15px] bg-[#FFF0F7] px-4 py-3 text-xs font-black text-[#F52C8C] transition hover:-translate-y-0.5"
              >
                <Volume2 size={17} />
                Listen
              </button>
            </section>

            <section className="overflow-hidden rounded-[30px] border border-[#DFE4EF] bg-white shadow-[0_10px_28px_rgba(25,39,74,0.05)]">
              <StepHeader
                step="01"
                title="Learn the Stroke"
                description="Start at number 1 and follow the number sequence."
                tone="purple"
              />

              <StrokeGuide letter={selectedLetter} />
            </section>

            <section className="overflow-hidden rounded-[30px] border border-[#DFE4EF] bg-white shadow-[0_10px_28px_rgba(25,39,74,0.05)]">
              <StepHeader
                step="02"
                title="Trace the Letter"
                description="Use your finger, stylus or mouse to trace the letter."
                tone="pink"
              />

              <div className="p-3 sm:p-5">
                <DrawingCanvas
                  key={`trace-${selectedLetter}`}
                  letter={selectedLetter}
                  variant="trace"
                />
              </div>
            </section>

            <section className="overflow-hidden rounded-[30px] border border-[#DFE4EF] bg-white shadow-[0_10px_28px_rgba(25,39,74,0.05)]">
              <StepHeader
                step="03"
                title="Write It Yourself"
                description={`Write ${selectedLetter}${selectedLetter.toLowerCase()} by yourself on the handwriting lines.`}
                tone="teal"
              />

              <div className="p-3 sm:p-5">
                <DrawingCanvas
                  key={`free-${selectedLetter}`}
                  letter={selectedLetter}
                  variant="free"
                />
              </div>
            </section>

            <section className="rounded-[30px] border border-[#DFE4EF] bg-white p-4 shadow-[0_10px_28px_rgba(25,39,74,0.05)] sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.13em] text-[#A5B0C2]">
                    Letter Progress
                  </p>

                  <h3 className="mt-1 text-lg font-black text-[#101A3B]">
                    Finished practising{" "}
                    {selectedLetter}
                    {selectedLetter.toLowerCase()}?
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={markComplete}
                  disabled={isCompleted}
                  className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-[16px] px-5 text-sm font-black transition ${
                    isCompleted
                      ? "cursor-default bg-[#EAFBF6] text-[#08A989]"
                      : "bg-[#7C3CFF] text-white shadow-[0_10px_24px_rgba(124,60,255,0.2)] hover:-translate-y-0.5"
                  }`}
                >
                  <Check size={17} strokeWidth={3} />

                  {isCompleted
                    ? "Completed"
                    : "Mark as Complete"}
                </button>
              </div>
            </section>

            <nav className="flex items-center justify-between gap-3 pb-8">
              <button
                type="button"
                onClick={previousLetter}
                disabled={currentIndex === 0}
                className="inline-flex min-h-12 items-center gap-2 rounded-[15px] border border-[#DFE4EF] bg-white px-4 text-sm font-black text-[#60708D] shadow-sm transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-30"
              >
                <ArrowLeft size={17} />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.13em] text-[#A6B0C1]">
                  Letter
                </p>

                <p className="mt-1 text-sm font-black text-[#101A3B]">
                  {currentIndex + 1} / 26
                </p>
              </div>

              <button
                type="button"
                onClick={nextLetter}
                disabled={currentIndex === ALPHABET.length - 1}
                className="inline-flex min-h-12 items-center gap-2 rounded-[15px] bg-[#7C3CFF] px-4 text-sm font-black text-white shadow-[0_10px_24px_rgba(124,60,255,0.2)] transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-30"
              >
                <span className="hidden sm:inline">Next Letter</span>
                <ArrowRight size={17} />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </main>
  );
}

function CanvasToolButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-[38px] items-center justify-center gap-2 rounded-[11px] border px-3 text-xs font-black transition ${
        active
          ? "border-[#7C3CFF] bg-[#7C3CFF] text-white shadow-sm"
          : "border-[#E1E6EF] bg-white text-[#596A87] hover:-translate-y-0.5"
      }`}
    >
      {children}
    </button>
  );
}

function SmallButton({
  children,
  onClick,
  disabled,
  danger = false,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-[38px] items-center justify-center gap-2 rounded-[11px] border bg-white px-3 text-xs font-black transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-30 ${
        danger
          ? "border-[#F6D6E5] text-[#F52C8C]"
          : "border-[#E1E6EF] text-[#596A87]"
      }`}
    >
      {children}
    </button>
  );
}