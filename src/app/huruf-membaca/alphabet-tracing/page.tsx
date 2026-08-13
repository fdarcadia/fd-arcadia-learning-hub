"use client";

import {
  PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/* =========================================================
   TYPES
========================================================= */

type LetterCase = "uppercase" | "lowercase";

type Point = {
  x: number;
  y: number;
};

type TraceStroke = {
  points: Point[];
};

type LetterConfig = {
  letter: string;
  uppercasePath: string;
  lowercasePath: string;
};

type RecordingStatus = "idle" | "recording" | "recorded";

/* =========================================================
   LETTER DATA
   SVG paths tak perlu sempurna handwriting-style,
   tapi sesuai sebagai tracing guide.
========================================================= */

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const LETTER_PATHS: Record<
  string,
  {
    uppercase: string;
    lowercase: string;
  }
> = {
  A: {
    uppercase: "M260 390 L400 80 L540 390 M310 280 L490 280",
    lowercase:
      "M480 210 C450 160 360 165 325 220 C280 290 310 385 385 390 C455 395 490 340 490 275 M490 205 L490 390",
  },

  B: {
    uppercase:
      "M285 80 L285 390 M285 80 L400 80 C490 80 505 200 405 225 L285 225 M405 225 C520 235 510 390 400 390 L285 390",
    lowercase:
      "M300 70 L300 390 M300 245 C325 170 445 165 485 245 C520 315 480 395 405 395 C345 395 305 350 300 300",
  },

  C: {
    uppercase:
      "M510 125 C470 75 360 65 290 125 C210 195 220 315 295 370 C370 425 465 395 515 345",
    lowercase:
      "M490 225 C450 180 360 175 315 225 C260 285 295 380 370 390 C420 395 465 370 490 340",
  },

  D: {
    uppercase:
      "M275 80 L275 390 M275 80 L365 80 C490 80 550 145 550 235 C550 330 490 390 365 390 L275 390",
    lowercase:
      "M485 70 L485 390 M480 225 C450 175 360 175 320 225 C265 290 300 385 375 392 C440 398 485 345 485 285",
  },

  E: {
    uppercase:
      "M500 80 L280 80 L280 390 L500 390 M280 230 L465 230",
    lowercase:
      "M300 295 L500 295 C500 220 450 180 390 180 C320 180 280 230 280 290 C280 360 335 400 405 390 C445 385 475 365 495 340",
  },

  F: {
    uppercase: "M500 80 L280 80 L280 390 M280 230 L460 230",
    lowercase:
      "M420 80 C350 60 320 110 320 175 L320 390 M270 210 L430 210",
  },

  G: {
    uppercase:
      "M520 130 C470 75 360 65 290 125 C210 195 220 315 295 370 C375 430 490 390 530 320 L530 260 L410 260",
    lowercase:
      "M490 210 C450 170 360 170 320 225 C270 295 310 380 385 385 C445 390 485 345 490 285 M490 210 L490 420 C490 485 420 505 355 470",
  },

  H: {
    uppercase: "M280 80 L280 390 M520 80 L520 390 M280 235 L520 235",
    lowercase:
      "M300 70 L300 390 M300 245 C325 185 405 170 455 215 C480 240 485 270 485 320 L485 390",
  },

  I: {
    uppercase: "M290 80 L510 80 M400 80 L400 390 M290 390 L510 390",
    lowercase: "M400 190 L400 390 M400 115 L400 120",
  },

  J: {
    uppercase:
      "M300 80 L520 80 M460 80 L460 310 C460 390 405 420 350 405 C310 395 285 365 285 325",
    lowercase:
      "M430 190 L430 410 C430 475 390 500 335 470 M430 115 L430 120",
  },

  K: {
    uppercase: "M280 80 L280 390 M520 80 L280 260 M355 205 L535 390",
    lowercase:
      "M300 70 L300 390 M480 190 L300 305 M375 255 L505 390",
  },

  L: {
    uppercase: "M290 80 L290 390 L520 390",
    lowercase: "M390 70 L390 350 C390 380 405 395 430 395",
  },

  M: {
    uppercase: "M250 390 L250 80 L400 270 L550 80 L550 390",
    lowercase:
      "M255 205 L255 390 M255 250 C280 180 365 180 390 245 L390 390 M390 250 C420 180 505 180 525 250 L525 390",
  },

  N: {
    uppercase: "M270 390 L270 80 L530 390 L530 80",
    lowercase:
      "M290 205 L290 390 M290 255 C320 185 415 180 460 240 C480 265 480 300 480 390",
  },

  O: {
    uppercase:
      "M400 75 C295 75 235 140 235 235 C235 335 295 400 400 400 C505 400 565 335 565 235 C565 140 505 75 400 75 Z",
    lowercase:
      "M400 180 C320 180 280 225 280 290 C280 355 320 395 400 395 C480 395 520 355 520 290 C520 225 480 180 400 180 Z",
  },

  P: {
    uppercase:
      "M280 390 L280 80 L400 80 C495 80 520 135 520 190 C520 250 480 285 405 285 L280 285",
    lowercase:
      "M300 205 L300 475 M300 240 C330 185 420 175 470 225 C525 285 490 380 420 390 C360 400 310 350 300 300",
  },

  Q: {
    uppercase:
      "M400 75 C295 75 235 140 235 235 C235 335 295 400 400 400 C505 400 565 335 565 235 C565 140 505 75 400 75 Z M440 330 L550 430",
    lowercase:
      "M400 180 C320 180 280 225 280 290 C280 355 320 395 400 395 C480 395 520 355 520 290 C520 225 480 180 400 180 Z M515 205 L515 475",
  },

  R: {
    uppercase:
      "M280 390 L280 80 L400 80 C495 80 520 135 520 190 C520 250 480 280 400 280 L280 280 M395 280 L535 390",
    lowercase:
      "M300 205 L300 390 M300 270 C325 210 380 185 445 205",
  },

  S: {
    uppercase:
      "M520 130 C475 80 380 65 315 105 C245 150 270 225 350 245 L450 270 C535 290 545 365 475 400 C405 435 300 410 265 355",
    lowercase:
      "M480 220 C450 180 365 175 325 205 C285 235 305 285 360 300 L430 320 C490 335 495 375 455 395 C405 420 325 400 295 365",
  },

  T: {
    uppercase: "M260 80 L540 80 M400 80 L400 390",
    lowercase:
      "M390 120 L390 330 C390 385 425 405 475 380 M320 205 L475 205",
  },

  U: {
    uppercase:
      "M270 80 L270 285 C270 365 320 405 400 405 C480 405 530 365 530 285 L530 80",
    lowercase:
      "M290 200 L290 320 C290 375 325 400 375 400 C430 400 480 365 480 305 L480 200 M480 200 L480 390",
  },

  V: {
    uppercase: "M250 80 L400 390 L550 80",
    lowercase: "M285 200 L395 390 L505 200",
  },

  W: {
    uppercase: "M220 80 L300 390 L400 190 L500 390 L580 80",
    lowercase: "M240 200 L310 390 L400 250 L490 390 L560 200",
  },

  X: {
    uppercase: "M270 80 L530 390 M530 80 L270 390",
    lowercase: "M300 200 L500 390 M500 200 L300 390",
  },

  Y: {
    uppercase: "M260 80 L400 245 L540 80 M400 245 L400 390",
    lowercase:
      "M285 200 L390 390 M500 200 L365 470 C340 510 300 510 270 490",
  },

  Z: {
    uppercase: "M270 80 L530 80 L270 390 L530 390",
    lowercase: "M300 200 L500 200 L300 390 L500 390",
  },
};

/* =========================================================
   HELPER COMPONENTS
========================================================= */

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
      <path
        d="M15 5l-7 7 7 7"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" width="27" height="27" fill="none">
      <path
        d="M5 10v4h4l5 4V6L9 10H5Z"
        fill="currentColor"
      />
      <path
        d="M17 9c1.4 1.6 1.4 4.4 0 6M19.4 6.5c3 3 3 8 0 11"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MicrophoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" fill="none">
      <rect
        x="8"
        y="3"
        width="8"
        height="12"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M5 11c0 4 3 7 7 7s7-3 7-7M12 18v3M9 21h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="27" height="27">
      <path d="M8 5v14l11-7L8 5Z" fill="currentColor" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg viewBox="0 0 24 24" width="25" height="25" fill="none">
      <path
        d="M20 7v5h-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 12a7 7 0 1 0-2 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
      <path
        d="M5 12h13M14 7l5 5-5 5"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HandIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
      <path
        d="M7.5 11V6a1.5 1.5 0 0 1 3 0v4M10.5 10V4.8a1.5 1.5 0 0 1 3 0V10M13.5 10V6a1.5 1.5 0 0 1 3 0v5M16.5 11V8a1.5 1.5 0 0 1 3 0v6c0 4-2.7 7-6.5 7h-1c-2.5 0-4.3-1-5.6-3L4 14.5a1.7 1.7 0 0 1 2.7-2l.8.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function JejakHurufPage() {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  const [selectedLetter, setSelectedLetter] = useState("A");
  const [letterCase, setLetterCase] =
    useState<LetterCase>("uppercase");

  const [strokes, setStrokes] = useState<TraceStroke[]>([]);
  const [activeStroke, setActiveStroke] =
    useState<TraceStroke | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);

  const [traceProgress, setTraceProgress] = useState(0);
  const [stars, setStars] = useState(24);

  const [showAllLetters, setShowAllLetters] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const [recordingStatus, setRecordingStatus] =
    useState<RecordingStatus>("idle");

  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const currentPath = useMemo(() => {
    return LETTER_PATHS[selectedLetter]?.[
      letterCase === "uppercase" ? "uppercase" : "lowercase"
    ];
  }, [selectedLetter, letterCase]);

  const displayLetter =
    letterCase === "uppercase"
      ? selectedLetter
      : selectedLetter.toLowerCase();

  /* =========================================================
     SVG POINTER
  ========================================================= */

  const getSvgPoint = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      const svg = svgRef.current;

      if (!svg) {
        return { x: 0, y: 0 };
      }

      const rect = svg.getBoundingClientRect();

      const x =
        ((event.clientX - rect.left) / rect.width) * 800;

      const y =
        ((event.clientY - rect.top) / rect.height) * 500;

      return {
        x: Math.max(0, Math.min(800, x)),
        y: Math.max(0, Math.min(500, y)),
      };
    },
    []
  );

  function startDrawing(
    event: ReactPointerEvent<SVGSVGElement>
  ) {
    event.preventDefault();

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Safari fallback
    }

    const point = getSvgPoint(event);

    setIsDrawing(true);
    setActiveStroke({
      points: [point],
    });
  }

  function continueDrawing(
    event: ReactPointerEvent<SVGSVGElement>
  ) {
    if (!isDrawing) return;

    event.preventDefault();

    const point = getSvgPoint(event);

    setActiveStroke((previous) => {
      if (!previous) {
        return {
          points: [point],
        };
      }

      return {
        points: [...previous.points, point],
      };
    });

    setTraceProgress((previous) =>
      Math.min(100, previous + 0.8)
    );
  }

  function finishDrawing() {
    if (!isDrawing) return;

    setIsDrawing(false);

    if (activeStroke && activeStroke.points.length > 1) {
      setStrokes((previous) => [
        ...previous,
        activeStroke,
      ]);
    }

    setActiveStroke(null);
  }

  function pointsToPath(points: Point[]) {
    if (points.length === 0) return "";

    return points
      .map((point, index) => {
        if (index === 0) {
          return `M ${point.x} ${point.y}`;
        }

        return `L ${point.x} ${point.y}`;
      })
      .join(" ");
  }

  /* =========================================================
     RESET
  ========================================================= */

  function resetTracing() {
    setStrokes([]);
    setActiveStroke(null);
    setIsDrawing(false);
    setTraceProgress(0);
  }

  /* =========================================================
     LETTER
  ========================================================= */

  function chooseLetter(letter: string) {
    setSelectedLetter(letter);
    resetTracing();
    setShowHint(true);
  }

  function changeLetterCase(value: LetterCase) {
    setLetterCase(value);
    resetTracing();
  }

  function goNextLetter() {
    const currentIndex = LETTERS.indexOf(selectedLetter);

    if (traceProgress >= 70) {
      setStars((previous) => previous + 1);
    }

    if (currentIndex < LETTERS.length - 1) {
      chooseLetter(LETTERS[currentIndex + 1]);
    } else {
      chooseLetter("A");
    }
  }

  /* =========================================================
     SPEECH
  ========================================================= */

  function speakLetter() {
    if (typeof window === "undefined") return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(
      displayLetter
    );

    utterance.lang = "ms-MY";
    utterance.rate = 0.75;
    utterance.pitch = 1.1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  }

  /* =========================================================
     RECORDING
  ========================================================= */

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert(
        "Browser ini tidak menyokong rakaman suara."
      );
      return;
    }

    try {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      const recorder = new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(
          audioChunksRef.current,
          {
            type:
              recorder.mimeType || "audio/webm",
          }
        );

        const url = URL.createObjectURL(blob);

        setAudioUrl(url);
        setRecordingStatus("recorded");

        stream
          .getTracks()
          .forEach((track) => track.stop());
      };

      recorder.start();

      setRecordingStatus("recording");
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(
        () => {
          setRecordingSeconds((previous) => {
            if (previous >= 14) {
              stopRecording();
              return 15;
            }

            return previous + 1;
          });
        },
        1000
      );
    } catch (error) {
      console.error(error);

      alert(
        "Kebenaran mikrofon diperlukan untuk merakam suara."
      );
    }
  }

  function stopRecording() {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    const recorder = mediaRecorderRef.current;

    if (
      recorder &&
      recorder.state !== "inactive"
    ) {
      recorder.stop();
    }
  }

  function toggleRecording() {
    if (recordingStatus === "recording") {
      stopRecording();
    } else {
      startRecording();
    }
  }

  function playRecording() {
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audio.play().catch(console.error);
  }

  function clearRecording() {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioUrl(null);
    setRecordingSeconds(0);
    setRecordingStatus("idle");
  }

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      window.speechSynthesis?.cancel();
    };
  }, [audioUrl]);

  /* =========================================================
     UI
  ========================================================= */

  const visibleLetters = showAllLetters
    ? LETTERS
    : LETTERS.slice(0, 10);

  return (
    <main className="page">
      <div className="shell">
        {/* ================= HEADER ================= */}

        <header className="header">
          <div className="headerLeft">
            <button
              className="backButton"
              type="button"
              onClick={() => window.history.back()}
              aria-label="Kembali"
            >
              <BackIcon />
            </button>

            <div className="titleWrap">
              <span className="titleIcon">✎</span>

              <h1>Jejak Huruf</h1>
            </div>
          </div>

          <div className="headerActions">
            <div className="starCounter">
              <span className="star">★</span>
              <strong>{stars}</strong>
            </div>

            <button
              className="soundTop"
              type="button"
              onClick={speakLetter}
              aria-label="Dengar huruf"
            >
              <SpeakerIcon />
            </button>
          </div>
        </header>

        {/* ================= INSTRUCTION ================= */}

        <section className="instruction">
          <div className="instructionIcon">
            <HandIcon />
          </div>

          <div>
            <p>Jejak huruf dengan jari.</p>

            <span>
              Ikut garisan titik-titik mengikut arah
              anak panah.
            </span>
          </div>

          <div className="dotDecor dotDecor1" />
          <div className="dotDecor dotDecor2" />
          <div className="dotDecor dotDecor3" />
        </section>

        {/* ================= MAIN CARD ================= */}

        <section className="mainCard">
          <div className="letterSectionHeader">
            <h2>Pilih Huruf</h2>

            <div className="caseSwitch">
              <button
                type="button"
                className={
                  letterCase === "uppercase"
                    ? "caseActive"
                    : ""
                }
                onClick={() =>
                  changeLetterCase("uppercase")
                }
              >
                A
              </button>

              <button
                type="button"
                className={
                  letterCase === "lowercase"
                    ? "caseActive"
                    : ""
                }
                onClick={() =>
                  changeLetterCase("lowercase")
                }
              >
                a
              </button>
            </div>
          </div>

          {/* ================= LETTER SELECTOR ================= */}

          <div className="letterSelector">
            {visibleLetters.map((letter) => (
              <button
                type="button"
                key={letter}
                onClick={() => chooseLetter(letter)}
                className={`letterButton ${
                  selectedLetter === letter
                    ? "selected"
                    : ""
                }`}
              >
                {letterCase === "uppercase"
                  ? letter
                  : letter.toLowerCase()}
              </button>
            ))}

            {!showAllLetters && (
              <button
                type="button"
                className="letterButton moreButton"
                onClick={() => setShowAllLetters(true)}
              >
                •••
              </button>
            )}
          </div>

          {showAllLetters && (
            <button
              className="collapseLetters"
              type="button"
              onClick={() => setShowAllLetters(false)}
            >
              Tutup pilihan huruf
            </button>
          )}

          {/* ================= TRACING BOARD ================= */}

          <div className="traceBoard">
            <div className="traceLegend">
              <div>
                <span className="legendLine solid" />
                Sudah jejak
              </div>

              <div>
                <span className="legendLine dotted" />
                Belum jejak
              </div>
            </div>

            <div className="decor decorPink">
              ✦
            </div>

            <div className="decor decorYellow">
              ✦
            </div>

            <div className="decor decorBlue">
              ✦
            </div>

            <div className="decor decorPurple">
              •
            </div>

            <svg
              ref={svgRef}
              className="traceSvg"
              viewBox="0 0 800 500"
              onPointerDown={startDrawing}
              onPointerMove={continueDrawing}
              onPointerUp={finishDrawing}
              onPointerCancel={finishDrawing}
              onPointerLeave={finishDrawing}
            >
              {/* GUIDE LETTER */}

              <path
                d={currentPath}
                fill="none"
                stroke="#b9bac3"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="2 18"
                opacity={0.95}
              />

              {/* HINT GLOW */}

              {showHint && (
                <path
                  d={currentPath}
                  fill="none"
                  stroke="#8a38ff"
                  strokeWidth="20"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.08"
                />
              )}

              {/* USER STROKES */}

              {strokes.map((stroke, index) => (
                <path
                  key={index}
                  d={pointsToPath(stroke.points)}
                  fill="none"
                  stroke="url(#purpleGradient)"
                  strokeWidth="32"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}

              {activeStroke && (
                <path
                  d={pointsToPath(
                    activeStroke.points
                  )}
                  fill="none"
                  stroke="url(#purpleGradient)"
                  strokeWidth="32"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              <defs>
                <linearGradient
                  id="purpleGradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#9145ff"
                  />
                  <stop
                    offset="100%"
                    stopColor="#5f2cf2"
                  />
                </linearGradient>
              </defs>
            </svg>

            {/* START POINT */}

            <div className="numberMarker marker1">
              1
            </div>

            <div className="numberMarker marker2">
              2
            </div>

            <div className="numberMarker marker3">
              3
            </div>

            <div className="directionArrow arrow1">
              ↗
            </div>

            <div className="directionArrow arrow2">
              →
            </div>

            <div className="directionArrow arrow3">
              ↓
            </div>

            {/* GUIDE CARD */}

            <div className="guideCard">
              <div className="guideStar">⭐</div>

              <strong>Jejak dari</strong>

              <div className="guideSteps">
                <span>1</span>
                <b>→</b>
                <span>2</span>
                <b>→</b>
                <span>3</span>
              </div>
            </div>
          </div>

          {/* ================= PROGRESS ================= */}

          <div className="progressRow">
            <div className="progressCard">
              <strong>Tahap Jejak</strong>

              <div className="progressTrack">
                <div
                  className="progressFill"
                  style={{
                    width: `${traceProgress}%`,
                  }}
                />
              </div>

              <span>
                {Math.round(traceProgress)}%
              </span>
            </div>

            <div
              className={`achievement ${
                traceProgress >= 70
                  ? "achievementActive"
                  : ""
              }`}
            >
              <span>🏆</span>

              <strong>
                {traceProgress >= 70
                  ? "Hebat!"
                  : "Teruskan!"}
              </strong>

              <span>✨</span>
            </div>
          </div>

          {/* ================= AUDIO SECTION ================= */}

          <div className="audioGrid">
            {/* HEAR LETTER */}

            <button
              type="button"
              className="audioCard hearCard"
              onClick={speakLetter}
            >
              <div className="audioCircle teal">
                <SpeakerIcon />
              </div>

              <div className="audioInfo">
                <strong>Dengar Huruf</strong>

                <span>
                  Dengar sebutan huruf ini.
                </span>
              </div>
            </button>

            {/* RECORD */}

            <div className="recordSection">
              <button
                type="button"
                className="recordColumn"
                onClick={toggleRecording}
              >
                <div
                  className={`audioCircle pink ${
                    recordingStatus === "recording"
                      ? "recordingPulse"
                      : ""
                  }`}
                >
                  <MicrophoneIcon />
                </div>

                <div>
                  <strong>Rakam Sebutan</strong>

                  <span>
                    {recordingStatus === "recording"
                      ? "Sedang merakam..."
                      : "Sebut huruf ini dan rakam suara."}
                  </span>

                  <small>
                    00:
                    {String(recordingSeconds).padStart(
                      2,
                      "0"
                    )}
                  </small>
                </div>
              </button>

              <div className="divider" />

              <button
                type="button"
                className="playColumn"
                onClick={playRecording}
                disabled={!audioUrl}
              >
                <div className="audioCircle pink">
                  <PlayIcon />
                </div>

                <div>
                  <strong>Dengar Rakaman</strong>

                  <span>
                    Dengar semula rakaman kamu.
                  </span>

                  <small>
                    00:
                    {String(recordingSeconds).padStart(
                      2,
                      "0"
                    )}
                  </small>
                </div>
              </button>

              <button
                type="button"
                className="recordAgain"
                disabled={!audioUrl}
                onClick={clearRecording}
              >
                <ResetIcon />
                <span>
                  Rakam
                  <br />
                  Semula
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* ================= BOTTOM ACTIONS ================= */}

        <div className="bottomActions">
          <button
            type="button"
            className="bottomButton resetButton"
            onClick={resetTracing}
          >
            <ResetIcon />
            Jejak Semula
          </button>

          <button
            type="button"
            className="bottomButton hintButton"
            onClick={() =>
              setShowHint((previous) => !previous)
            }
          >
            <span className="bulb">💡</span>
            Petunjuk

            <span className="hintCount">
              {showHint ? 3 : 2}
            </span>
          </button>

          <button
            type="button"
            className="bottomButton nextButton"
            onClick={goNextLetter}
          >
            Seterusnya
            <ArrowRightIcon />
          </button>
        </div>
      </div>

      {/* =====================================================
          STYLES
      ===================================================== */}

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        button {
          font: inherit;
        }

        .page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 10% 5%,
              rgba(139, 92, 246, 0.06),
              transparent 26%
            ),
            radial-gradient(
              circle at 90% 90%,
              rgba(20, 184, 166, 0.05),
              transparent 30%
            ),
            #ffffff;

          color: #17145b;
          padding: 22px 22px 30px;
        }

        .shell {
          width: min(1220px, 100%);
          margin: 0 auto;
        }

        /* ================= HEADER ================= */

        .header {
          min-height: 76px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 17px;
        }

        .headerLeft,
        .headerActions,
        .titleWrap {
          display: flex;
          align-items: center;
        }

        .headerLeft {
          gap: 28px;
        }

        .titleWrap {
          gap: 14px;
        }

        .titleWrap h1 {
          margin: 0;
          font-size: clamp(27px, 3vw, 40px);
          line-height: 1;
          font-weight: 900;
          letter-spacing: -1px;
          color: #17145b;
        }

        .titleIcon {
          color: #7133f5;
          font-size: 40px;
          font-weight: 900;
          transform: rotate(-5deg);
        }

        .backButton {
          width: 76px;
          height: 76px;
          border-radius: 22px;
          border: 2px solid #e3ddff;
          background: white;
          color: #6d35f2;

          display: grid;
          place-items: center;

          cursor: pointer;

          box-shadow:
            0 8px 18px rgba(75, 60, 140, 0.06),
            inset 0 -2px 0 rgba(111, 63, 238, 0.04);

          transition: 0.2s ease;
        }

        .backButton:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(83, 52, 170, 0.1);
        }

        .headerActions {
          gap: 27px;
        }

        .starCounter {
          height: 66px;
          min-width: 145px;

          padding: 0 22px;

          border: 2px solid #e3ddff;
          border-radius: 34px;
          background: white;

          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;

          box-shadow: 0 8px 20px rgba(58, 45, 120, 0.05);

          font-size: 27px;
          color: #4c2da7;
        }

        .star {
          color: #ffbf0a;
          font-size: 38px;

          text-shadow:
            0 2px 0 #f5a900,
            0 4px 8px rgba(255, 184, 0, 0.2);
        }

        .soundTop {
          width: 70px;
          height: 70px;
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;

          display: grid;
          place-items: center;

          background: linear-gradient(
            145deg,
            #8644ff,
            #5824eb
          );

          box-shadow:
            0 10px 24px rgba(101, 55, 241, 0.24),
            inset 0 3px 10px rgba(255, 255, 255, 0.18);
        }

        /* ================= INSTRUCTION ================= */

        .instruction {
          position: relative;
          min-height: 114px;

          display: flex;
          align-items: center;
          gap: 25px;

          padding: 20px 26px;

          overflow: hidden;

          border: 2px solid #e6dfff;
          border-radius: 24px;

          background: linear-gradient(
            100deg,
            #faf8ff,
            #ffffff
          );

          margin-bottom: 26px;
        }

        .instructionIcon {
          width: 63px;
          height: 63px;
          border-radius: 50%;

          display: grid;
          place-items: center;

          color: white;

          background: linear-gradient(
            145deg,
            #8544ff,
            #5826ec
          );

          box-shadow: 0 8px 22px rgba(108, 57, 241, 0.25);

          flex-shrink: 0;
        }

        .instruction p {
          margin: 0 0 5px;
          font-size: 22px;
          font-weight: 800;
          color: #18135c;
        }

        .instruction span {
          display: block;
          color: #6661a1;
          font-size: 18px;
          font-weight: 600;
        }

        .dotDecor {
          width: 12px;
          height: 12px;
          position: absolute;
          border-radius: 50%;
          background: #eee9ff;
        }

        .dotDecor1 {
          right: 40px;
          top: 30px;
        }

        .dotDecor2 {
          right: 69px;
          top: 54px;
        }

        .dotDecor3 {
          right: 39px;
          bottom: 22px;
        }

        /* ================= MAIN CARD ================= */

        .mainCard {
          border: 2px solid #e4defa;
          border-radius: 29px;

          padding: 10px 18px 22px;

          background:
            linear-gradient(
              180deg,
              rgba(250, 249, 255, 0.75),
              white
            );

          box-shadow:
            0 16px 46px rgba(60, 48, 120, 0.04);
        }

        .letterSectionHeader {
          position: relative;
          min-height: 62px;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .letterSectionHeader h2 {
          margin: 0;
          font-size: 25px;
          font-weight: 900;
          color: #19125f;
        }

        .caseSwitch {
          position: absolute;
          right: 2px;
          top: 4px;

          height: 52px;

          display: flex;
          align-items: center;

          padding: 3px;

          border: 2px solid #e5e0f5;
          border-radius: 29px;

          background: white;

          box-shadow: 0 5px 12px rgba(35, 27, 92, 0.06);
        }

        .caseSwitch button {
          width: 68px;
          height: 44px;
          border: 0;
          border-radius: 23px;
          background: transparent;

          font-weight: 900;
          font-size: 24px;
          color: #777394;

          cursor: pointer;

          transition: 0.2s ease;
        }

        .caseSwitch .caseActive {
          color: white;
          background: linear-gradient(
            135deg,
            #8638ff,
            #6423ee
          );

          box-shadow: 0 6px 12px rgba(104, 45, 238, 0.25);
        }

        /* ================= LETTER SELECTOR ================= */

        .letterSelector {
          display: grid;
          grid-template-columns: repeat(11, 1fr);
          gap: 16px;

          padding: 2px 0 24px;
        }

        .letterButton {
          min-width: 0;
          aspect-ratio: 1 / 0.94;

          border: 2px solid #ebe8f5;
          border-radius: 21px;

          background: white;

          font-size: 28px;
          font-weight: 900;
          color: #171550;

          cursor: pointer;

          box-shadow:
            0 7px 12px rgba(38, 30, 80, 0.08),
            inset 0 -2px 1px rgba(50, 37, 100, 0.03);

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .letterButton:hover {
          transform: translateY(-3px);
        }

        .letterButton.selected {
          color: white;

          background: linear-gradient(
            145deg,
            #9850ff,
            #6524ec
          );

          border-color: #8b47ff;

          box-shadow:
            0 9px 19px rgba(101, 39, 239, 0.25),
            0 0 0 4px #f0e8ff;
        }

        .moreButton {
          font-size: 24px;
        }

        .collapseLetters {
          display: block;
          margin: -10px auto 15px;

          border: none;
          background: transparent;

          color: #7041da;
          font-weight: 800;

          cursor: pointer;
        }

        /* ================= TRACE BOARD ================= */

        .traceBoard {
          position: relative;

          min-height: 535px;

          overflow: hidden;

          border: 2px solid #e8e5f2;
          border-radius: 29px;

          background:
            radial-gradient(
              circle at 55% 50%,
              rgba(134, 77, 255, 0.018),
              transparent 35%
            ),
            white;

          box-shadow:
            0 8px 19px rgba(44, 35, 91, 0.07),
            inset 0 1px 0 white;
        }

        .traceSvg {
          position: absolute;
          left: 13%;
          top: 3%;

          width: 67%;
          height: 94%;

          touch-action: none;

          cursor: crosshair;

          user-select: none;
        }

        .traceLegend {
          position: absolute;
          z-index: 5;

          top: 38px;
          left: 36px;

          display: flex;
          flex-direction: column;
          gap: 17px;

          color: #7772a7;
          font-weight: 700;
          font-size: 16px;

          pointer-events: none;
        }

        .traceLegend div {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .legendLine {
          display: inline-block;
          width: 38px;
        }

        .legendLine.solid {
          height: 7px;
          border-radius: 8px;
          background: #7427ef;
        }

        .legendLine.dotted {
          height: 0;
          border-top: 6px dotted #bbbcc3;
        }

        .guideCard {
          position: absolute;

          top: 145px;
          right: 29px;

          z-index: 7;

          width: 205px;
          min-height: 132px;

          border: 2px solid #ded2ff;
          border-radius: 22px;

          background:
            linear-gradient(
              145deg,
              rgba(250, 247, 255, 0.96),
              rgba(255, 255, 255, 0.96)
            );

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          box-shadow: 0 9px 19px rgba(73, 50, 140, 0.05);

          pointer-events: none;
        }

        .guideStar {
          font-size: 49px;
          margin-top: -41px;
          margin-bottom: 4px;

          filter: drop-shadow(
            0 4px 4px rgba(229, 165, 0, 0.18)
          );
        }

        .guideCard strong {
          font-size: 18px;
          margin-bottom: 10px;
        }

        .guideSteps {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .guideSteps span {
          width: 33px;
          height: 33px;

          display: grid;
          place-items: center;

          border-radius: 50%;

          color: white;
          background: #ee338e;

          font-weight: 900;
        }

        .guideSteps b {
          color: #382076;
          font-size: 19px;
        }

        .numberMarker {
          position: absolute;

          z-index: 10;

          width: 35px;
          height: 35px;

          border-radius: 50%;

          display: grid;
          place-items: center;

          color: white;
          background: #ef338d;

          border: 3px solid white;

          font-weight: 900;
          font-size: 17px;

          box-shadow: 0 3px 7px rgba(220, 37, 125, 0.16);

          pointer-events: none;
        }

        .marker1 {
          left: 51%;
          top: 4%;
        }

        .marker2 {
          left: 27%;
          bottom: 9%;
        }

        .marker3 {
          left: 76%;
          bottom: 8%;
        }

        .directionArrow {
          position: absolute;
          z-index: 10;

          color: #6e25f0;

          font-size: 49px;
          font-weight: 800;

          pointer-events: none;
        }

        .arrow1 {
          top: 6%;
          left: 45%;
          transform: rotate(-18deg);
        }

        .arrow2 {
          left: 37%;
          bottom: 2%;
        }

        .arrow3 {
          right: 27%;
          bottom: 6%;
          transform: rotate(-18deg);
        }

        .decor {
          position: absolute;
          z-index: 3;
          pointer-events: none;
          font-weight: 900;
        }

        .decorPink {
          color: #ef5fba;
          left: 25%;
          top: 29%;
          font-size: 30px;
        }

        .decorYellow {
          color: #ffbf22;
          left: 8%;
          top: 62%;
          font-size: 32px;
        }

        .decorBlue {
          color: #68d7d6;
          right: 31%;
          top: 18%;
          font-size: 27px;
        }

        .decorPurple {
          color: #9e5cff;
          left: 13%;
          bottom: 15%;
          font-size: 37px;
        }

        /* ================= PROGRESS ================= */

        .progressRow {
          display: grid;
          grid-template-columns: 1fr 230px;
          gap: 16px;

          margin-top: 20px;
        }

        .progressCard,
        .achievement {
          min-height: 79px;

          border: 2px solid #e8e3f8;
          border-radius: 25px;

          background: white;

          box-shadow: 0 5px 14px rgba(52, 41, 100, 0.05);
        }

        .progressCard {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 20px;
          align-items: center;

          padding: 0 27px;
        }

        .progressCard strong {
          color: #6322d8;
          font-size: 18px;
        }

        .progressTrack {
          height: 19px;
          background: #e7e7eb;
          border-radius: 20px;
          overflow: hidden;
        }

        .progressFill {
          height: 100%;

          border-radius: inherit;

          background: linear-gradient(
            90deg,
            #8e28ff,
            #7023f0
          );

          transition: width 0.25s ease;
        }

        .progressCard > span {
          color: #6222d8;
          font-weight: 900;
          font-size: 23px;
        }

        .achievement {
          position: relative;

          display: flex;
          align-items: center;
          justify-content: center;
          gap: 13px;

          font-size: 19px;

          color: #28215d;

          transition: 0.25s ease;
        }

        .achievement span {
          font-size: 31px;
        }

        .achievementActive {
          border-color: #d7c4ff;
          background: #fcfaff;
          transform: translateY(-2px);
        }

        /* ================= AUDIO ================= */

        .audioGrid {
          display: grid;
          grid-template-columns: 295px 1fr;
          gap: 18px;

          margin-top: 27px;
        }

        .audioCard,
        .recordSection {
          min-height: 178px;
          border-radius: 27px;
        }

        .audioCard {
          border: 2px solid #9be8df;

          background: linear-gradient(
            145deg,
            #f3fffd,
            white
          );

          padding: 25px 20px;

          display: flex;
          align-items: flex-start;
          gap: 20px;

          text-align: left;

          cursor: pointer;
        }

        .audioCircle {
          width: 69px;
          height: 69px;

          flex: 0 0 69px;

          display: grid;
          place-items: center;

          border-radius: 50%;

          color: white;

          box-shadow: 0 7px 16px rgba(25, 130, 135, 0.14);
        }

        .audioCircle.teal {
          background: linear-gradient(
            145deg,
            #55d6dc,
            #05aea5
          );
        }

        .audioCircle.pink {
          background: linear-gradient(
            145deg,
            #ef5aae,
            #ec1681
          );
        }

        .audioInfo,
        .recordColumn > div:last-child,
        .playColumn > div:last-child {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .audioInfo strong,
        .recordColumn strong,
        .playColumn strong {
          color: #059a93;
          font-weight: 900;
          font-size: 17px;
        }

        .audioInfo span,
        .recordColumn span,
        .playColumn span {
          color: #65629a;
          font-size: 15px;
          line-height: 1.55;
          font-weight: 600;
        }

        .recordSection {
          border: 2px solid #f7cde2;

          background: linear-gradient(
            145deg,
            #fff8fb,
            white
          );

          padding: 20px 18px;

          display: grid;
          grid-template-columns:
            minmax(190px, 1fr)
            1px
            minmax(190px, 1fr)
            120px;

          align-items: center;
          gap: 17px;
        }

        .recordColumn,
        .playColumn {
          min-width: 0;

          border: none;
          background: transparent;

          display: flex;
          align-items: flex-start;
          gap: 17px;

          text-align: left;

          cursor: pointer;
        }

        .recordColumn strong,
        .playColumn strong {
          color: #e4267f;
        }

        .recordColumn small,
        .playColumn small {
          width: fit-content;

          margin-top: 10px;
          padding: 5px 17px;

          border: 2px solid #ffc6df;
          border-radius: 16px;

          color: #f02f89;

          font-size: 15px;
          font-weight: 900;
        }

        .divider {
          width: 1px;
          height: 118px;

          border-left: 2px dashed #aaa7be;
        }

        .playColumn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .recordAgain {
          min-height: 120px;

          border: 2px solid #ffc8e0;
          border-radius: 24px;

          background: white;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 7px;

          color: #f12f8c;

          font-weight: 900;
          cursor: pointer;

          box-shadow: 0 7px 14px rgba(183, 47, 108, 0.07);
        }

        .recordAgain:disabled {
          opacity: 0.42;
          cursor: not-allowed;
        }

        .recordingPulse {
          animation: recordingPulse 1.1s infinite;
        }

        @keyframes recordingPulse {
          0% {
            box-shadow:
              0 0 0 0 rgba(239, 37, 131, 0.35);
          }

          70% {
            box-shadow:
              0 0 0 14px rgba(239, 37, 131, 0);
          }

          100% {
            box-shadow:
              0 0 0 0 rgba(239, 37, 131, 0);
          }
        }

        /* ================= BOTTOM ================= */

        .bottomActions {
          display: grid;
          grid-template-columns: 1fr 1fr 1.12fr;
          gap: 42px;

          margin-top: 30px;
        }

        .bottomButton {
          position: relative;

          height: 82px;

          border-radius: 26px;

          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;

          border: none;

          font-size: 19px;
          font-weight: 900;

          cursor: pointer;

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .bottomButton:hover {
          transform: translateY(-3px);
        }

        .resetButton {
          color: #6530da;

          background: linear-gradient(
            145deg,
            #faf7ff,
            #ede7ff
          );

          border: 2px solid #e1d8ff;

          box-shadow: 0 7px 16px rgba(80, 50, 160, 0.08);
        }

        .hintButton {
          color: #4d3785;

          background: linear-gradient(
            145deg,
            #ffd82b,
            #ffb900
          );

          box-shadow: 0 8px 20px rgba(255, 185, 0, 0.18);
        }

        .bulb {
          font-size: 31px;
        }

        .hintCount {
          position: absolute;

          right: 20px;
          top: -17px;

          width: 45px;
          height: 45px;

          display: grid;
          place-items: center;

          border-radius: 50%;

          background: white;

          color: #815716;

          font-size: 18px;

          box-shadow: 0 5px 12px rgba(92, 67, 20, 0.12);
        }

        .nextButton {
          color: white;

          background: linear-gradient(
            135deg,
            #19c8bd,
            #05a8a4
          );

          box-shadow: 0 10px 22px rgba(5, 165, 159, 0.18);
        }

        /* ================= TABLET ================= */

        @media (max-width: 1000px) {
          .letterSelector {
            grid-template-columns: repeat(6, 1fr);
          }

          .traceBoard {
            min-height: 485px;
          }

          .guideCard {
            width: 170px;
            right: 16px;
          }

          .audioGrid {
            grid-template-columns: 1fr;
          }

          .recordSection {
            grid-template-columns:
              minmax(170px, 1fr)
              1px
              minmax(170px, 1fr)
              105px;
          }
        }

        /* ================= MOBILE ================= */

        @media (max-width: 720px) {
          .page {
            padding: 14px 12px 24px;
          }

          .header {
            min-height: 60px;
          }

          .headerLeft {
            gap: 13px;
          }

          .backButton {
            width: 52px;
            height: 52px;
            border-radius: 17px;
          }

          .titleWrap {
            gap: 7px;
          }

          .titleIcon {
            font-size: 28px;
          }

          .titleWrap h1 {
            font-size: 25px;
          }

          .headerActions {
            gap: 8px;
          }

          .starCounter {
            min-width: auto;
            height: 49px;
            padding: 0 13px;
            gap: 7px;
            font-size: 18px;
          }

          .star {
            font-size: 25px;
          }

          .soundTop {
            width: 51px;
            height: 51px;
          }

          .instruction {
            min-height: auto;
            padding: 15px;
            gap: 13px;
            border-radius: 20px;
          }

          .instructionIcon {
            width: 49px;
            height: 49px;
          }

          .instruction p {
            font-size: 17px;
          }

          .instruction span {
            font-size: 13px;
            line-height: 1.5;
          }

          .mainCard {
            padding: 8px 9px 14px;
            border-radius: 22px;
          }

          .letterSectionHeader {
            min-height: 55px;
            justify-content: flex-start;
            padding-left: 8px;
          }

          .letterSectionHeader h2 {
            font-size: 19px;
          }

          .caseSwitch {
            height: 43px;
          }

          .caseSwitch button {
            width: 49px;
            height: 34px;
            font-size: 18px;
          }

          .letterSelector {
            display: flex;
            overflow-x: auto;

            gap: 9px;

            padding: 5px 4px 17px;

            scrollbar-width: none;
          }

          .letterSelector::-webkit-scrollbar {
            display: none;
          }

          .letterButton {
            flex: 0 0 55px;
            width: 55px;
            height: 55px;
            aspect-ratio: auto;

            border-radius: 17px;

            font-size: 21px;
          }

          .traceBoard {
            min-height: 430px;
            border-radius: 22px;
          }

          .traceSvg {
            left: 0;
            top: 7%;
            width: 100%;
            height: 86%;
          }

          .traceLegend {
            top: 17px;
            left: 15px;
            gap: 7px;
            font-size: 11px;
          }

          .traceLegend div {
            gap: 7px;
          }

          .legendLine {
            width: 24px;
          }

          .guideCard {
            width: 119px;
            min-height: 92px;

            top: 83px;
            right: 10px;

            border-radius: 16px;
          }

          .guideStar {
            margin-top: -30px;
            font-size: 34px;
          }

          .guideCard strong {
            font-size: 12px;
            margin-bottom: 5px;
          }

          .guideSteps {
            gap: 4px;
          }

          .guideSteps span {
            width: 23px;
            height: 23px;
            font-size: 11px;
          }

          .guideSteps b {
            font-size: 12px;
          }

          .numberMarker {
            width: 27px;
            height: 27px;
            font-size: 12px;
          }

          .marker1 {
            left: 50%;
            top: 7%;
          }

          .marker2 {
            left: 20%;
            bottom: 10%;
          }

          .marker3 {
            left: auto;
            right: 19%;
            bottom: 10%;
          }

          .directionArrow {
            font-size: 35px;
          }

          .arrow1 {
            top: 8%;
            left: 41%;
          }

          .arrow2 {
            left: 32%;
            bottom: 3%;
          }

          .arrow3 {
            right: 21%;
            bottom: 6%;
          }

          .progressRow {
            grid-template-columns: 1fr;
            gap: 9px;
            margin-top: 12px;
          }

          .progressCard {
            min-height: 64px;
            padding: 0 16px;

            grid-template-columns: auto 1fr auto;
            gap: 10px;
          }

          .progressCard strong {
            font-size: 13px;
          }

          .progressTrack {
            height: 14px;
          }

          .progressCard > span {
            font-size: 17px;
          }

          .achievement {
            min-height: 57px;
          }

          .achievement span {
            font-size: 23px;
          }

          .audioGrid {
            margin-top: 15px;
          }

          .audioCard {
            min-height: 105px;
            padding: 18px 14px;
          }

          .audioCircle {
            width: 55px;
            height: 55px;
            flex-basis: 55px;
          }

          .audioInfo strong,
          .recordColumn strong,
          .playColumn strong {
            font-size: 14px;
          }

          .audioInfo span,
          .recordColumn span,
          .playColumn span {
            font-size: 12px;
          }

          .recordSection {
            min-height: auto;

            grid-template-columns: 1fr;
            gap: 14px;

            padding: 16px;

            border-radius: 22px;
          }

          .recordColumn,
          .playColumn {
            min-height: 76px;
            align-items: center;
          }

          .divider {
            height: 1px;
            width: 100%;
            border-left: none;
            border-top: 2px dashed #d4baca;
          }

          .recordAgain {
            min-height: 70px;
            flex-direction: row;
          }

          .bottomActions {
            position: sticky;
            bottom: 8px;
            z-index: 30;

            grid-template-columns: 1fr 1fr 1fr;
            gap: 7px;

            margin-top: 18px;

            padding: 7px;

            border: 1px solid #eeeaf6;
            border-radius: 22px;

            background: rgba(255, 255, 255, 0.93);

            backdrop-filter: blur(14px);
          }

          .bottomButton {
            height: 62px;
            border-radius: 18px;

            gap: 5px;

            padding: 5px;

            font-size: 11px;
          }

          .bottomButton :global(svg) {
            width: 19px;
          }

          .bulb {
            font-size: 20px;
          }

          .hintCount {
            width: 28px;
            height: 28px;

            right: 4px;
            top: -11px;

            font-size: 11px;
          }
        }

        @media (max-width: 400px) {
          .titleWrap h1 {
            font-size: 21px;
          }

          .titleIcon {
            display: none;
          }

          .starCounter {
            padding: 0 10px;
          }

          .traceBoard {
            min-height: 390px;
          }

          .guideCard {
            right: 5px;
            width: 105px;
          }
        }
      `}</style>
    </main>
  );
}