"use client";

import {
  PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Flame,
  Hand,
  Heart,
  Lightbulb,
  Loader2,
  Mic,
  Play,
  RotateCcw,
  Square,
  Sparkles,
  Star,
  Volume2,
  VolumeX,
} from "lucide-react";

import { PortalShell } from "@/components/PortalShell";
import { ProtectedPage } from "@/components/ProtectedPage";
import { supabase } from "@/lib/supabase";

/* =========================================================
   TYPES
========================================================= */

type ReadingMode = "finger" | "tap";

type ReadingLevel =
  | "KV"
  | "KVKV"
  | "KVK"
  | "KV+KVK"
  | "KVK+KV"
  | "KVK+KVK"
  | "KV+KV+KV"
  | "KV+KV+KVK"
  | "KVK+KV+KV"
  | "Diftong"
  | "Vokal Berganding"
  | "Digraf";

type ReadingActivity = {
  id: string;
  title: string;
  slug: string;
};

type ReadingQuestion = {
  id: string;
  activity_id: string;

  title: string;

  question_type: string;

  instruction: string | null;

  word: string | null;

  syllable1: string | null;
  syllable2: string | null;
  syllable3: string | null;

  reading_level: ReadingLevel | null;

  letter: string | null;

  answer: string | null;

  options: string[];

  image_url: string | null;
  audio_url: string | null;

  difficulty: string;

  is_active: boolean;

  display_order: number;
};

/* =========================================================
   READING LEVELS
========================================================= */

const readingLevels: {
  id: ReadingLevel;
  label: string;
  short: string;
}[] = [
  {
    id: "KV",
    label: "KV",
    short: "KV",
  },
  {
    id: "KVKV",
    label: "KVKV",
    short: "KVKV",
  },
  {
    id: "KVK",
    label: "KVK",
    short: "KVK",
  },
  {
    id: "KV+KVK",
    label: "KV + KVK",
    short: "KV + KVK",
  },
  {
    id: "KVK+KV",
    label: "KVK + KV",
    short: "KVK + KV",
  },
  {
    id: "KVK+KVK",
    label: "KVK + KVK",
    short: "KVK + KVK",
  },
  {
    id: "KV+KV+KV",
    label: "KV + KV + KV",
    short: "KV + KV + KV",
  },
  {
    id: "KV+KV+KVK",
    label: "KV + KV + KVK",
    short: "KV + KV + KVK",
  },
  {
    id: "KVK+KV+KV",
    label: "KVK + KV + KV",
    short: "KVK + KV + KV",
  },
  {
    id: "Diftong",
    label: "Diftong",
    short: "Diftong",
  },
  {
    id: "Vokal Berganding",
    label: "Vokal Berganding",
    short: "Vokal Berganding",
  },
  {
    id: "Digraf",
    label: "Digraf",
    short: "Digraf",
  },
];

/* =========================================================
   FALLBACK
========================================================= */

const FALLBACK_QUESTION: ReadingQuestion = {
  id: "fallback-baju",

  activity_id: "fallback",

  title: "Baju",

  question_type: "reading_finger",

  instruction:
    "Tarik jari dari kiri ke kanan dan baca perkataan.",

  word: "baju",

  syllable1: "ba",

  syllable2: "ju",

  syllable3: null,

  reading_level: "KVKV",

  letter: null,

  answer: "baju",

  options: [],

  image_url: null,

  audio_url: "/audio/reading/baju.mp3",

  difficulty: "beginner",

  is_active: true,

  display_order: 1,
};

/* =========================================================
   LETTER COLOURS
========================================================= */

const letterColours = [
  "#13A8A8", // aqua teal
  "#2D9CDB", // ocean blue
  "#5B7CFA", // periwinkle
  "#7357D9", // soft violet
  "#20B7C9", // cyan
  "#3A8DDE", // clear blue
  "#66C6B9", // seafoam
  "#7896E8", // lavender blue
];

/* =========================================================
   LETTER AUTO FIT
   Pastikan huruf seperti g, j, p, q, y tidak terpotong
   dan semua huruf kekal visual-center dalam kotak.
========================================================= */

function getLetterVisualStyle(letter: string) {
  const lower = letter.toLowerCase();

  // Descender letters:
  // g, j, p, q, y perlukan ruang tambahan di bawah baseline
  if (["g", "j", "p", "q", "y"].includes(lower)) {
    return {
      fontSize: "clamp(72px, 7vw, 108px)",
      lineHeight: 1.45,
      transform: "translateY(-2px)",
      paddingTop: "12px",
      paddingBottom: "28px",
    };
  }

  // Huruf lebar
  if (["m", "w"].includes(lower)) {
    return {
      fontSize: "clamp(70px, 6.8vw, 104px)",
      lineHeight: 1.3,
      transform: "translateY(0px)",
      paddingTop: "10px",
      paddingBottom: "10px",
    };
  }

  // Huruf tinggi/nipis
  if (["i", "l", "t"].includes(lower)) {
    return {
      fontSize: "clamp(76px, 7.3vw, 112px)",
      lineHeight: 1.3,
      transform: "translateY(0px)",
      paddingTop: "10px",
      paddingBottom: "10px",
    };
  }

  return {
    fontSize: "clamp(74px, 7vw, 108px)",
    lineHeight: 1.35,
    transform: "translateY(0px)",
    paddingTop: "10px",
    paddingBottom: "10px",
  };
}

/* =========================================================
   PAGE
========================================================= */

export default function BacaPerkataanPage() {
  return (
    <ProtectedPage>
      {() => (
        <PortalShell role="parent">
          <ReadingGame />
        </PortalShell>
      )}
    </ProtectedPage>
  );
}

/* =========================================================
   GAME
========================================================= */

function ReadingGame() {
  const trackRef =
    useRef<HTMLDivElement | null>(null);

  const audioRef =
    useRef<HTMLAudioElement | null>(
      null
    );

  const lastSoundIndexRef =
    useRef(-1);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingStreamRef = useRef<MediaStream | null>(null);
  const recordedUrlRef = useRef<string | null>(null);
  const recordedAudioRef = useRef<HTMLAudioElement | null>(null);

  const [activity, setActivity] =
    useState<ReadingActivity | null>(
      null
    );

  const [questions, setQuestions] =
    useState<ReadingQuestion[]>([]);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [mode, setMode] =
    useState<ReadingMode>("finger");

  const [selectedLevel, setSelectedLevel] =
    useState<ReadingLevel>("KV");

  const [soundEnabled, setSoundEnabled] =
    useState(true);

  const [progress, setProgress] =
    useState(0);

  const [dragging, setDragging] =
    useState(false);

  const [
    tappedLetters,
    setTappedLetters,
  ] = useState<number[]>([]);

  const [completed, setCompleted] =
    useState(false);

  const [showHint, setShowHint] =
    useState(false);

  const [message, setMessage] =
    useState(
      "Mari baca bersama!"
    );

  const [stars, setStars] =
    useState(24);

  const [streak, setStreak] =
    useState(2);

  const [hearts] = useState(3);

  const [celebrate, setCelebrate] =
    useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordingError, setRecordingError] = useState("");

  /* =========================================================
     LOCAL REWARD
  ========================================================= */

  useEffect(() => {
    try {
      const savedStars =
        window.localStorage.getItem(
          "fd-reading-stars"
        );

      const savedStreak =
        window.localStorage.getItem(
          "fd-reading-streak"
        );

      if (savedStars) {
        setStars(
          Number(savedStars) || 24
        );
      }

      if (savedStreak) {
        setStreak(
          Number(savedStreak) || 2
        );
      }
    } catch {}
  }, []);

  /* =========================================================
     LOAD QUESTIONS
  ========================================================= */

  const loadQuestions =
    useCallback(async () => {
      try {
        setLoading(true);

        setError("");

        const {
          data: activityData,
          error: activityError,
        } = await supabase
          .from(
            "reading_game_activities"
          )
          .select("id,title,slug")
          .eq(
            "slug",
            "baca-perkataan"
          )
          .eq("is_active", true)
          .maybeSingle();

        if (activityError) {
          throw activityError;
        }

        if (!activityData) {
          setQuestions([]);
          setError(
            'Aktiviti "baca-perkataan" belum tersedia.'
          );

          return;
        }

        const loadedActivity =
          activityData as ReadingActivity;

        setActivity(
          loadedActivity
        );

        const {
          data: questionData,
          error: questionError,
        } = await supabase
          .from(
            "reading_game_questions"
          )
          .select(
            `
            id,
            activity_id,
            title,
            question_type,
            instruction,
            word,
            syllable1,
            syllable2,
            syllable3,
            reading_level,
            letter,
            answer,
            options,
            image_url,
            audio_url,
            difficulty,
            is_active,
            display_order
          `
          )
          .eq(
            "activity_id",
            loadedActivity.id
          )
          .eq("is_active", true)
          .order(
            "display_order",
            {
              ascending: true,
            }
          );

        if (questionError) {
          throw questionError;
        }

        const cleaned = (
          questionData || []
        )
          .filter(
            (item) => item.word
          )
          .map((item) => ({
            ...item,

            options:
              Array.isArray(
                item.options
              )
                ? item.options.map(
                    String
                  )
                : [],
          })) as ReadingQuestion[];

        setQuestions(cleaned);
      } catch (loadError) {
        console.error(
          "Load reading game:",
          loadError
        );

        setQuestions([]);

        setError(
          "Content belum dapat dimuatkan. Sila cuba semula."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  /* =========================================================
     CURRENT QUESTION
  ========================================================= */

  const levelQuestions = useMemo(
    () =>
      questions.filter(
        (item) =>
          item.reading_level === selectedLevel
      ),
    [questions, selectedLevel]
  );

  const question =
    levelQuestions[currentIndex] ||
    null;

  const word = (
    question?.word ||
    question?.answer ||
    ""
  )
    .trim()
    .toLowerCase();

  const letters = useMemo(
    () =>
      word
        ? word.split("")
        : [],
    [word]
  );

  const syllables = useMemo(
    () =>
      [
        question?.syllable1,
        question?.syllable2,
        question?.syllable3,
      ].filter(
        Boolean
      ) as string[],
    [
      question?.syllable1,
      question?.syllable2,
      question?.syllable3,
    ]
  );

  /* =========================================================
     ACTIVE LETTER
  ========================================================= */

  const fingerActiveIndex =
    useMemo(() => {
      if (progress <= 2) {
        return -1;
      }

      if (letters.length <= 1) {
        return 0;
      }

      const section =
        100 / letters.length;

      return Math.min(
        letters.length - 1,
        Math.floor(
          progress / section
        )
      );
    }, [
      progress,
      letters.length,
    ]);

  /* =========================================================
     RESET WHEN QUESTION CHANGES
  ========================================================= */

  useEffect(() => {
    resetInteraction();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  useEffect(() => {
    setCurrentIndex(0);
    resetInteraction();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLevel]);

  /* =========================================================
     AUDIO
  ========================================================= */

  function stopAudio() {
    if (audioRef.current) {
      audioRef.current.pause();

      audioRef.current.currentTime =
        0;
    }

    if (
      typeof window !==
        "undefined" &&
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
    }
  }

  function fallbackSpeech(
    text: string,
    rate = 0.65
  ) {
    if (!soundEnabled) {
      return;
    }

    if (
      typeof window ===
        "undefined" ||
      !(
        "speechSynthesis" in
        window
      )
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        text
      );

    utterance.lang = "ms-MY";

    utterance.rate = rate;

    utterance.pitch = 1;

    window.speechSynthesis.speak(
      utterance
    );
  }

  async function playAudio(
    src:
      | string
      | null
      | undefined,
    fallback: string,
    rate = 0.65
  ) {
    if (!soundEnabled) {
      return;
    }

    stopAudio();

    if (!src) {
      fallbackSpeech(
        fallback,
        rate
      );

      return;
    }

    try {
      const audio = new Audio(src);

      audioRef.current = audio;

      audio.onerror = () => {
        fallbackSpeech(
          fallback,
          rate
        );
      };

      await audio.play();
    } catch {
      fallbackSpeech(
        fallback,
        rate
      );
    }
  }

  function playLetter(
    letter: string
  ) {
    playAudio(
      `/audio/phonics/${letter.toLowerCase()}.mp3`,
      letter,
      0.5
    );
  }

  function playSyllable(
    syllable: string
  ) {
    playAudio(
      `/audio/reading/${syllable.toLowerCase()}.mp3`,
      syllable,
      0.58
    );
  }

  function playWord() {
    if (!question || !word || !soundEnabled) return;

    stopAudio();

    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) return;

    const utterance = new SpeechSynthesisUtterance(word);
    const voices = window.speechSynthesis.getVoices();

    const malayVoice =
      voices.find((voice) =>
        voice.lang.toLowerCase().startsWith("ms")
      ) ||
      voices.find((voice) =>
        voice.lang.toLowerCase().startsWith("id")
      );

    if (malayVoice) utterance.voice = malayVoice;

    utterance.lang = malayVoice?.lang || "ms-MY";
    utterance.rate = 0.72;
    utterance.pitch = 1.18;

    window.speechSynthesis.speak(utterance);
  }

  function toggleSound() {
    setSoundEnabled(
      (current) => {
        if (current) {
          stopAudio();
        }

        return !current;
      }
    );
  }

  /* =========================================================
     TEMPORARY VOICE RECORDING
  ========================================================= */

  function clearRecordedVoice() {
    if (recordedAudioRef.current) {
      recordedAudioRef.current.pause();
      recordedAudioRef.current = null;
    }
    if (recordedUrlRef.current) {
      URL.revokeObjectURL(recordedUrlRef.current);
      recordedUrlRef.current = null;
    }
    setRecordedUrl(null);
    setRecordingError("");
  }

  function stopRecordingStream() {
    recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
    recordingStreamRef.current = null;
  }

  async function startRecording() {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setRecordingError("Rakaman suara tidak disokong pada browser ini.");
      return;
    }

    try {
      clearRecordedVoice();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingStreamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, {
          type: recorder.mimeType || "audio/webm",
        });
        const url = URL.createObjectURL(blob);
        recordedUrlRef.current = url;
        setRecordedUrl(url);
        setIsRecording(false);
        stopRecordingStream();
      };

      recorder.onerror = () => {
        setRecordingError("Rakaman tidak berjaya. Cuba sekali lagi.");
        setIsRecording(false);
        stopRecordingStream();
      };

      recorder.start();
      setIsRecording(true);
      setRecordingError("");
    } catch (recordError) {
      console.error("Microphone recording:", recordError);
      setRecordingError(
        "Benarkan akses mikrofon untuk menggunakan fungsi Rakam."
      );
      setIsRecording(false);
      stopRecordingStream();
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
      return;
    }
    setIsRecording(false);
    stopRecordingStream();
  }

  async function playRecordedVoice() {
    if (!recordedUrl) return;

    if (recordedAudioRef.current) {
      recordedAudioRef.current.pause();
      recordedAudioRef.current.currentTime = 0;
    }

    const audio = new Audio(recordedUrl);
    recordedAudioRef.current = audio;

    try {
      await audio.play();
    } catch (playError) {
      console.error("Play recorded voice:", playError);
    }
  }

  useEffect(() => {
    return () => {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== "inactive") recorder.stop();
      stopRecordingStream();
      if (recordedUrlRef.current) {
        URL.revokeObjectURL(recordedUrlRef.current);
      }
    };
  }, []);

  /* =========================================================
     DRAG
  ========================================================= */

  function calculateProgress(
    clientX: number
  ) {
    if (!trackRef.current) {
      return;
    }

    const rect =
      trackRef.current.getBoundingClientRect();

    const x =
      clientX - rect.left;

    const nextProgress =
      Math.max(
        0,
        Math.min(
          100,
          (x / rect.width) * 100
        )
      );

    setProgress(
      nextProgress
    );

    const index =
      letters.length > 0
        ? Math.min(
            letters.length - 1,
            Math.floor(
              nextProgress /
                (100 /
                  letters.length)
            )
          )
        : -1;

    if (
      index >= 0 &&
      index !==
        lastSoundIndexRef.current
    ) {
      lastSoundIndexRef.current =
        index;

      const letter =
        letters[index];

      if (letter) {
        playLetter(letter);
      }
    }

    if (
      nextProgress >= 96 &&
      !completed
    ) {
      completeQuestion();
    }
  }

  function handlePointerDown(
    event: ReactPointerEvent<HTMLDivElement>
  ) {
    if (mode !== "finger") {
      return;
    }

    event.currentTarget.setPointerCapture(
      event.pointerId
    );

    setDragging(true);

    calculateProgress(
      event.clientX
    );
  }

  function handlePointerMove(
    event: ReactPointerEvent<HTMLDivElement>
  ) {
    if (
      !dragging ||
      mode !== "finger"
    ) {
      return;
    }

    calculateProgress(
      event.clientX
    );
  }

  function handlePointerUp(
    event: ReactPointerEvent<HTMLDivElement>
  ) {
    try {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    } catch {}

    setDragging(false);
  }

  /* =========================================================
     TAP MODE
  ========================================================= */

  function tapLetter(
    index: number
  ) {
    if (mode !== "tap") {
      return;
    }

    const alreadyActive =
      tappedLetters.includes(index);

    if (!alreadyActive) {
      setTappedLetters(
        (current) => [
          ...current,
          index,
        ]
      );
    }

    playLetter(
      letters[index]
    );

    const count =
      alreadyActive
        ? tappedLetters.length
        : tappedLetters.length + 1;

    if (
      count === letters.length &&
      !completed
    ) {
      window.setTimeout(
        completeQuestion,
        400
      );
    }
  }

  /* =========================================================
     COMPLETE
  ========================================================= */

  function completeQuestion() {
    if (completed) {
      return;
    }

    setCompleted(true);

    setCelebrate(true);

    const nextStars =
      stars + 1;

    const nextStreak =
      streak + 1;

    setStars(nextStars);

    setStreak(nextStreak);

    setMessage(
      "Hebat! Anda berjaya membaca perkataan."
    );

    try {
      window.localStorage.setItem(
        "fd-reading-stars",
        String(nextStars)
      );

      window.localStorage.setItem(
        "fd-reading-streak",
        String(nextStreak)
      );
    } catch {}

    window.setTimeout(
      playWord,
      300
    );

  }

  /* =========================================================
     RESET
  ========================================================= */

  function resetInteraction() {
    stopAudio();

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    stopRecordingStream();
    clearRecordedVoice();

    setProgress(0);

    setDragging(false);

    setTappedLetters([]);

    setCompleted(false);

    setShowHint(false);

    setMessage(
      "Mari baca bersama!"
    );

    lastSoundIndexRef.current =
      -1;
  }

  function resetActivity() {
    resetInteraction();
  }

  /* =========================================================
     MODE
  ========================================================= */

  function toggleMode() {
    setMode((current) =>
      current === "finger"
        ? "tap"
        : "finger"
    );

    resetInteraction();
  }

  /* =========================================================
     QUESTIONS
  ========================================================= */

  function nextQuestion() {
    if (
      levelQuestions.length === 0
    ) {
      return;
    }

    if (
      currentIndex <
      levelQuestions.length - 1
    ) {
      setCurrentIndex(
        (current) =>
          current + 1
      );

      return;
    }

    setCurrentIndex(0);
  }

  function previousQuestion() {
    if (
      levelQuestions.length === 0
    ) {
      return;
    }

    if (currentIndex > 0) {
      setCurrentIndex(
        (current) =>
          current - 1
      );

      return;
    }

    setCurrentIndex(
      levelQuestions.length - 1
    );
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#eaf8ff] px-4 py-8">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <Loader2
              size={32}
              className="mx-auto animate-spin text-violet-600"
            />

            <p className="mt-4 font-black text-slate-500">
              Loading reading game...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#eaf8ff] px-3 py-4 sm:px-5 lg:px-7"
      style={{
        backgroundImage:
          "linear-gradient(rgba(236,249,255,0.30), rgba(236,249,255,0.30)), url('/images/reading-ocean-background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center bottom",
        backgroundAttachment: "fixed",
      }}
    >
      {/* OCEAN THEME OVERLAY */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-sky-50/10 to-white/5" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="ocean-bubble absolute left-[8%] top-[18%] h-6 w-6 rounded-full border-2 border-white/70 bg-white/20" />
        <span className="ocean-bubble ocean-bubble-delay absolute right-[12%] top-[28%] h-10 w-10 rounded-full border-2 border-white/60 bg-white/15" />
        <span className="ocean-bubble ocean-bubble-delay-2 absolute left-[18%] top-[62%] h-4 w-4 rounded-full border-2 border-white/70 bg-white/20" />
      </div>

      {celebrate ? (
        <Celebration
          word={word}
          streak={streak}
          onNext={() => {
            setCelebrate(false);
            nextQuestion();
          }}
        />
      ) : null}

      <div className="relative mx-auto max-w-[1180px]">
        <section className="overflow-hidden rounded-[34px] border-[4px] border-white/80 bg-white/90 shadow-[0_28px_80px_rgba(70,150,190,0.20)] backdrop-blur-[8px]">
          {/* =====================================================
              TOP BAR
          ===================================================== */}

          <div className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-7 sm:pt-6">
            <Link
              href="/huruf-membaca"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-violet-600 shadow-sm"
            >
              <ArrowLeft size={20} />
            </Link>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-1.5 md:flex">
                {levelQuestions
                  .slice(0, 10)
                  .map(
                    (
                      item,
                      index
                    ) => (
                      <span
                        key={item.id}
                        className={`rounded-full transition-all ${
                          index ===
                          currentIndex
                            ? "h-2.5 w-8 bg-violet-600"
                            : index <
                                currentIndex
                              ? "h-2.5 w-2.5 bg-violet-400"
                              : "h-2.5 w-2.5 bg-violet-100"
                        }`}
                      />
                    )
                  )}
              </div>

              <span className="text-xs font-black text-violet-600">
                {levelQuestions.length > 0
                  ? currentIndex + 1
                  : 0} /{" "}
                {levelQuestions.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 shadow-sm">
                <Star
                  size={18}
                  className="fill-yellow-400 text-yellow-400"
                />

                <span className="font-black">
                  {stars}
                </span>
              </div>

              <button
                type="button"
                onClick={toggleSound}
                className={`grid h-11 w-11 place-items-center rounded-full border shadow-sm transition ${
                  soundEnabled
                    ? "border-violet-100 bg-violet-50 text-violet-600"
                    : "border-slate-200 bg-slate-100 text-slate-400"
                }`}
              >
                {soundEnabled ? (
                  <Volume2
                    size={19}
                  />
                ) : (
                  <VolumeX
                    size={19}
                  />
                )}
              </button>
            </div>
          </div>

          {/* =====================================================
              TITLE
          ===================================================== */}

          <div className="px-5 pt-3 sm:px-8">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-500">
              FD Arcadia Learning Hub
            </p>

            <h1 className="mt-1 text-3xl font-black text-[#111936] sm:text-4xl">
              Baca Perkataan
            </h1>
          </div>

          {/* =====================================================
              READING LEVEL SELECTOR
          ===================================================== */}

          <div className="mt-5 border-y border-sky-100 bg-gradient-to-r from-sky-50/90 via-white/90 to-cyan-50/90 px-5 py-4 sm:px-8">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-500">
                  Pilihan Tahap Membaca
                </p>

                <p className="mt-1 text-xs font-semibold text-slate-400">
                  Pilih tahap yang sesuai.
                </p>
              </div>

              <span className="rounded-full bg-violet-100 px-3 py-1.5 text-[10px] font-black text-violet-600">
                {selectedLevel}
              </span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {readingLevels.map(
                (
                  level,
                  index
                ) => {
                  const active =
                    selectedLevel ===
                    level.id;

                  return (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() =>
                        setSelectedLevel(
                          level.id
                        )
                      }
                      className={`min-w-fit shrink-0 rounded-xl border px-3 py-2.5 text-center transition ${
                        active
                          ? "border-violet-600 bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200"
                          : "border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      <p
                        className={`text-[9px] font-black ${
                          active
                            ? "text-violet-200"
                            : "text-slate-300"
                        }`}
                      >
                        {index + 1}
                      </p>

                      <p className="mt-0.5 whitespace-nowrap text-[11px] font-black">
                        {level.short}
                      </p>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* =====================================================
              INSTRUCTION
          ===================================================== */}

          <div className="mx-auto mt-5 max-w-[680px] px-5">
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-sky-100 bg-white/92 px-4 py-3 text-center shadow-[0_8px_20px_rgba(74,163,197,0.10)] backdrop-blur">
              {mode ===
              "finger" ? (
                <Hand
                  size={18}
                  className="text-violet-600"
                />
              ) : (
                <Volume2
                  size={18}
                  className="text-teal-500"
                />
              )}

              <p className="text-sm font-bold text-slate-600">
                {mode ===
                "finger"
                  ? question?.instruction ||
                    "Tarik jari dari kiri ke kanan dan baca perkataan."
                  : "Tekan setiap huruf untuk dengar bunyi fonik."}
              </p>
            </div>
          </div>

          {/* =====================================================
              MAIN WORD AREA
          ===================================================== */}

          {question ? (
            <div className="relative mx-3 mt-6 overflow-visible rounded-[30px] border-2 border-sky-100 bg-white/82 px-3 py-7 shadow-[0_18px_45px_rgba(51,151,190,0.10)] backdrop-blur-sm sm:mx-6 sm:px-5 lg:mx-7 lg:px-7">
              {/* =====================================================
                  LETTER CARDS
                  Auto responsive ikut lebar phone / iPad / desktop.
                  Sentiasa kekal SATU BARIS walaupun perkataan panjang.
              ===================================================== */}
              <div
                className="mx-auto grid w-full items-end justify-center"
                style={{
                  gridTemplateColumns: `repeat(${Math.max(
                    letters.length,
                    1
                  )}, minmax(0, 1fr))`,
                  gap:
                    letters.length >= 9
                      ? "3px"
                      : letters.length >= 7
                        ? "5px"
                        : letters.length >= 5
                          ? "7px"
                          : "10px",
                  maxWidth:
                    letters.length <= 2
                      ? "520px"
                      : letters.length === 3
                        ? "650px"
                        : letters.length === 4
                          ? "760px"
                          : letters.length <= 6
                            ? "900px"
                            : "100%",
                }}
              >
                {letters.map((letter, index) => {
                  const active =
                    mode === "finger"
                      ? index <= fingerActiveIndex
                      : tappedLetters.includes(index);

                  const isCurrent =
                    !completed &&
                    (mode === "finger"
                      ? index === fingerActiveIndex
                      : tappedLetters.length > 0 &&
                        tappedLetters[tappedLetters.length - 1] === index);

                  const colour =
                    letterColours[index % letterColours.length];

                  const lower = letter.toLowerCase();
                  const isDescender = [
                    "g",
                    "j",
                    "p",
                    "q",
                    "y",
                  ].includes(lower);

                  const isWide = ["m", "w"].includes(lower);

                  const maxCircleSize =
                    letters.length <= 2
                      ? 210
                      : letters.length === 3
                        ? 185
                        : letters.length === 4
                          ? 160
                          : letters.length === 5
                            ? 138
                            : letters.length === 6
                              ? 118
                              : letters.length <= 8
                                ? 98
                                : letters.length <= 10
                                  ? 82
                                  : 70;

                  const minFontSize =
                    letters.length >= 11
                      ? 18
                      : letters.length >= 9
                        ? 20
                        : letters.length >= 7
                          ? 23
                          : letters.length >= 5
                            ? 27
                            : 34;

                  const fluidFontSize =
                    letters.length <= 2
                      ? "10vw"
                      : letters.length === 3
                        ? "8.5vw"
                        : letters.length === 4
                          ? "7.2vw"
                          : letters.length <= 6
                            ? "5.8vw"
                            : letters.length <= 8
                              ? "4.7vw"
                              : "3.7vw";

                  const maxFontSize =
                    letters.length <= 2
                      ? 108
                      : letters.length === 3
                        ? 92
                        : letters.length === 4
                          ? 78
                          : letters.length <= 6
                            ? 62
                            : letters.length <= 8
                              ? 48
                              : 40;

                  return (
                    <button
                      key={`${letter}-${index}`}
                      type="button"
                      disabled={mode !== "tap"}
                      onClick={() => tapLetter(index)}
                      aria-label={`Huruf ${letter}`}
                      className={`flex min-w-0 flex-col items-center ${
                        mode === "tap"
                          ? "cursor-pointer"
                          : "cursor-default"
                      }`}
                    >
                      {/* BULATAN HURUF */}
                      <div
                        className={`ocean-letter-float relative flex aspect-square w-full shrink-0 items-center justify-center rounded-full border-[3px] bg-white/95 transition-all duration-300 ${
                          isCurrent
                            ? "-translate-y-1 scale-[1.025]"
                            : "translate-y-0 scale-100"
                        }`}
                        style={{
                          maxWidth: `${maxCircleSize}px`,
                          maxHeight: `${maxCircleSize}px`,
                          borderColor: active
                            ? colour
                            : "#C7E1EE",
                          background: active
                            ? `linear-gradient(145deg, #FFFFFF 0%, ${colour}12 100%)`
                            : "linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)",
                          boxShadow: isCurrent
                            ? `0 14px 30px ${colour}2E`
                            : active
                              ? `0 9px 22px ${colour}18`
                              : "0 8px 20px rgba(30,41,59,0.05)",
                        }}
                      >
                        {/* HURUF — auto fit, termasuk g/j/p/q/y */}
                        <span
                          className="flex h-full w-full select-none items-center justify-center overflow-visible text-center font-black lowercase transition-all duration-300"
                          style={{
                            fontFamily:
                              '"Century Gothic", "Futura", "Avenir Next", Arial, sans-serif',
                            fontSize: `clamp(${minFontSize}px, ${fluidFontSize}, ${maxFontSize}px)`,
                            lineHeight: isDescender ? 1.28 : 1.08,
                            transform: isDescender
                              ? "translateY(-2%)"
                              : "translateY(0)",
                            paddingTop: isDescender ? "3%" : "0",
                            paddingBottom: isDescender ? "9%" : "0",
                            paddingLeft: isWide ? "3%" : "0",
                            paddingRight: isWide ? "3%" : "0",
                            color: active
                              ? colour
                              : "#AEB6C5",
                          }}
                        >
                          {letter}
                        </span>
                      </div>

                      {/* DOT PROGRESS BAWAH — dot putih dalam bulatan dibuang */}
                      <span
                        className={`mt-2 rounded-full transition-all duration-300 ${
                          letters.length >= 8
                            ? "h-2 w-2"
                            : letters.length >= 5
                              ? "h-2.5 w-2.5"
                              : "h-3.5 w-3.5"
                        } ${
                          isCurrent
                            ? "scale-125"
                            : "scale-100"
                        }`}
                        style={{
                          backgroundColor: active
                            ? colour
                            : "#D8DEE8",
                          boxShadow: isCurrent
                            ? `0 4px 12px ${colour}55`
                            : "none",
                        }}
                      />
                    </button>
                  );
                })}
              </div>

              {/* HINT */}
              {showHint && syllables.length > 0 ? (
                <div className="mx-auto mt-6 flex w-fit flex-wrap items-center justify-center gap-2 rounded-2xl bg-amber-50 px-5 py-3">
                  <Lightbulb
                    size={17}
                    className="text-amber-500"
                  />

                  {syllables.map((syllable, index) => (
                    <span
                      key={`${syllable}-${index}`}
                      className="text-lg font-black text-amber-700"
                    >
                      {syllable}
                      {index < syllables.length - 1 ? " + " : ""}
                    </span>
                  ))}

                  <ArrowRight
                    size={15}
                    className="text-amber-400"
                  />

                  <span className="text-lg font-black text-violet-600">
                    {word}
                  </span>
                </div>
              ) : null}

              {/* DRAG HANDLE */}
              {mode === "finger" ? (
                <div className="mx-auto mt-9 max-w-[760px]">
                  <div
                    ref={trackRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    className="relative h-[92px] touch-none select-none cursor-grab active:cursor-grabbing"
                  >
                    <div className="absolute left-0 right-0 top-[18px] h-[34px] overflow-hidden rounded-full border border-sky-100 bg-white/90 shadow-inner">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#32C7C7] via-[#2D9CDB] to-[#6D62E9] transition-[width] duration-75"
                        style={{
                          width: `${progress}%`,
                        }}
                      />

                      {letters.slice(1).map((_, index) => (
                        <div
                          key={index}
                          className="absolute top-0 h-full w-px bg-white/35"
                          style={{
                            left: `${((index + 1) / letters.length) * 100}%`,
                          }}
                        />
                      ))}

                      <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-white/40 to-transparent" />
                    </div>

                    <div
                      className="pointer-events-none absolute top-[4px] z-30 -translate-x-1/2 transition-[left] duration-75"
                      style={{
                        left: `${Math.max(4, Math.min(progress, 96))}%`,
                      }}
                    >
                      <div
                        className={`relative grid h-[62px] w-[62px] place-items-center rounded-[22px] border-[5px] border-white bg-white shadow-[0_10px_25px_rgba(32,45,80,0.22)] transition ${
                          dragging ? "scale-110" : ""
                        }`}
                      >
                        <div className="flex gap-[3px]">
                          <span className="h-5 w-[3px] rounded-full bg-slate-300" />
                          <span className="h-5 w-[3px] rounded-full bg-slate-300" />
                          <span className="h-5 w-[3px] rounded-full bg-slate-300" />
                        </div>

                        <span className="absolute -right-[6px] top-[8px] h-4 w-4 rounded-full bg-cyan-400 ring-4 ring-white shadow-[0_0_14px_rgba(34,211,238,0.55)]" />
                      </div>

                      <div className="absolute left-[34px] top-[40px] text-[46px] drop-shadow-md">
                        ☝🏻
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                      <span>Mula</span>
                      <span className="text-violet-500">Tarik & Baca</span>
                      <span>Selesai</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-7 text-center text-xs font-black text-teal-600">
                  Tekan huruf satu demi satu.
                </p>
              )}
            </div>
          ) : (
            <div className="mx-4 mt-6 rounded-[28px] border border-dashed border-violet-200 bg-white px-6 py-16 text-center sm:mx-7">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-violet-50 text-3xl">
                📚
              </div>
              <h3 className="mt-4 text-xl font-black text-[#111936]">
                Aktiviti {selectedLevel} belum tersedia
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-400">
                Aktiviti untuk tahap ini belum ditambah oleh guru. Pilih tahap lain atau cuba semula selepas kandungan ditambah.
              </p>
            </div>
          )}

          {/* =====================================================
              SYLLABLE CARDS
          ===================================================== */}

          {question ? (
            <div className="mx-auto mt-5 grid max-w-[820px] gap-3 px-5 sm:grid-cols-3">
              {selectedLevel !== "KV"
                ? syllables.map((syllable, index) => (
                <SyllableButton
                  key={`${syllable}-${index}`}
                  label={`Suku Kata ${index + 1}`}
                  value={syllable}
                  colour={
                    index === 0
                      ? "violet"
                      : index === 1
                        ? "pink"
                        : "teal"
                  }
                />
              ))
                : null}

              <SyllableButton
                label={
                  selectedLevel === "KV"
                    ? "Suku Kata"
                    : "Perkataan"
                }
                value={word}
                colour="teal"
                onClick={playWord}
                showAudio
              />
            </div>
          ) : null}

          {/* =====================================================
              CONTROL ROW
          ===================================================== */}

          <div className="mx-auto mt-5 grid max-w-[930px] gap-3 px-5 sm:grid-cols-[1fr_auto_1fr_auto] sm:items-center">
            {/* MODE */}

            <button
              type="button"
              onClick={toggleMode}
              className="flex min-h-[56px] items-center justify-between rounded-2xl border border-sky-100 bg-sky-50/90 px-4"
            >
              <div className="flex items-center gap-3">
                <Hand
                  size={18}
                  className="text-violet-600"
                />

                <div className="text-left">
                  <p className="text-xs font-black text-slate-800">
                    {mode ===
                    "finger"
                      ? "Ikut dengan jari"
                      : "Tekan huruf"}
                  </p>

                  <p className="mt-0.5 text-[9px] font-semibold text-slate-400">
                    Tukar mode bacaan
                  </p>
                </div>
              </div>

              <div
                className={`relative h-7 w-12 rounded-full ${
                  mode ===
                  "finger"
                    ? "bg-violet-600"
                    : "bg-teal-500"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                    mode ===
                    "finger"
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </div>
            </button>

            {/* WORD AUDIO */}

            <button
              type="button"
              onClick={playWord}
              className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-500 text-white shadow-[0_10px_24px_rgba(45,156,219,0.28)]"
            >
              <Volume2
                size={24}
              />
            </button>

            {/* RESET */}

            <button
              type="button"
              onClick={resetActivity}
              className="flex min-h-[56px] items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-violet-600 shadow-sm"
            >
              <RotateCcw
                size={18}
              />

              Ulangi
            </button>

            {/* TEMPORARY VOICE RECORDING */}

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex h-11 items-center gap-2 rounded-full border px-3 text-xs font-black transition ${
                  isRecording
                    ? "border-rose-200 bg-rose-50 text-rose-600"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                {isRecording ? (
                  <Square size={14} className="fill-current" />
                ) : (
                  <Mic size={16} />
                )}

                {isRecording
                  ? "Stop"
                  : recordedUrl
                    ? "Rakam Semula"
                    : "Rakam"}
              </button>

              {recordedUrl && !isRecording ? (
                <button
                  type="button"
                  onClick={playRecordedVoice}
                  className="grid h-11 w-11 place-items-center rounded-full border border-violet-200 bg-violet-50 text-violet-600 transition hover:bg-violet-100"
                  aria-label="Dengar rakaman"
                  title="Dengar rakaman"
                >
                  <Play size={17} className="fill-current" />
                </button>
              ) : null}
            </div>
          </div>

          {recordingError ? (
            <p className="mx-auto mt-2 max-w-[930px] px-5 text-center text-[10px] font-bold text-rose-500">
              {recordingError}
            </p>
          ) : null}

          {/* =====================================================
              HINT
          ===================================================== */}

          <div className="mx-auto mt-4 flex max-w-[930px] items-center justify-between gap-3 px-5">
            <button
              type="button"
              onClick={() =>
                setShowHint(
                  (current) =>
                    !current
                )
              }
              className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-xs font-black text-amber-700"
            >
              <Lightbulb
                size={16}
              />

              {showHint
                ? "Tutup Hint"
                : "Hint"}
            </button>

            <p
              className={`text-xs font-black ${
                completed
                  ? "text-emerald-600"
                  : "text-slate-400"
              }`}
            >
              {message}
            </p>
          </div>

          {/* =====================================================
              BOTTOM NAV
          ===================================================== */}

          <div className="mx-5 mt-6 grid gap-3 border-t border-slate-100 py-5 sm:grid-cols-[auto_1fr_auto]">
            <button
              type="button"
              onClick={previousQuestion}
              disabled={!question}
              className="inline-flex min-h-[48px] disabled:cursor-not-allowed disabled:opacity-40 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-600"
            >
              <ChevronLeft
                size={18}
              />

              Sebelum
            </button>

            <div className="grid grid-cols-3 gap-2 rounded-2xl bg-[#f7f7fd] p-2">
              <div className="flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-3">
                <Flame
                  size={17}
                  className="fill-orange-500 text-orange-500"
                />

                <span className="text-xs font-black">
                  {streak}
                </span>
              </div>

              <div className="flex items-center justify-center gap-2 rounded-xl bg-violet-50 px-3 py-3 text-xs font-black text-violet-600">
                <Sparkles
                  size={16}
                />

                {completed
                  ? "Hebat!"
                  : "Cuba!"}
              </div>

              <div className="flex items-center justify-center gap-1 rounded-xl bg-white">
                {Array.from({
                  length:
                    hearts,
                }).map(
                  (
                    _,
                    index
                  ) => (
                    <Heart
                      key={
                        index
                      }
                      size={
                        17
                      }
                      className="fill-rose-400 text-rose-400"
                    />
                  )
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={nextQuestion}
              disabled={!question}
              className="inline-flex min-h-[48px] disabled:cursor-not-allowed disabled:opacity-40 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 px-5 text-sm font-black text-white shadow-[0_8px_20px_rgba(14,165,233,0.22)]"
            >
              Seterusnya

              <ChevronRight
                size={18}
              />
            </button>
          </div>
        </section>

        {error ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-xs font-bold text-amber-700">
            {error}
          </div>
        ) : null}
      </div>

      <style jsx global>{`
        @keyframes oceanLetterFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        @keyframes oceanBubbleFloat {
          0% { transform: translateY(20px) scale(0.9); opacity: 0; }
          20% { opacity: 0.75; }
          100% { transform: translateY(-90px) scale(1.08); opacity: 0; }
        }

        .ocean-letter-float {
          animation: oceanLetterFloat 3.8s ease-in-out infinite;
        }

        .ocean-letter-float:nth-child(2) { animation-delay: .28s; }
        .ocean-letter-float:nth-child(3) { animation-delay: .56s; }
        .ocean-letter-float:nth-child(4) { animation-delay: .84s; }
        .ocean-letter-float:nth-child(5) { animation-delay: 1.12s; }

        .ocean-bubble {
          animation: oceanBubbleFloat 6s ease-in-out infinite;
        }
        .ocean-bubble-delay { animation-delay: 1.7s; }
        .ocean-bubble-delay-2 { animation-delay: 3.2s; }

        @media (prefers-reduced-motion: reduce) {
          .ocean-letter-float, .ocean-bubble { animation: none !important; }
        }
      `}</style>
    </main>
  );
}

/* =========================================================
   SYLLABLE BUTTON
========================================================= */

function SyllableButton({
  label,
  value,
  colour,
  onClick,
  showAudio = false,
}: {
  label: string;
  value: string;
  colour:
    | "violet"
    | "pink"
    | "teal";
  onClick?: () => void;
  showAudio?: boolean;
}) {
  const colours = {
    violet: {
      border:
        "border-violet-200",
      text: "text-violet-600",
      icon: "bg-violet-600",
    },

    pink: {
      border:
        "border-pink-200",
      text: "text-pink-500",
      icon: "bg-pink-500",
    },

    teal: {
      border:
        "border-teal-200",
      text: "text-teal-600",
      icon: "bg-teal-500",
    },
  };

  const theme =
    colours[colour];

  const content = (
    <>
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
          {label}
        </p>

        <p className={`mt-1 text-3xl font-black ${theme.text}`}>
          {value}
        </p>
      </div>

      {showAudio ? (
        <div
          className={`grid h-10 w-10 place-items-center rounded-full text-white ${theme.icon}`}
        >
          <Volume2 size={17} />
        </div>
      ) : null}
    </>
  );

  if (!onClick) {
    return (
      <div
        className={`flex min-h-[88px] items-center justify-between rounded-[20px] border-2 bg-white px-4 text-left shadow-sm ${theme.border}`}
      >
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[88px] items-center justify-between rounded-[20px] border-2 bg-white px-4 text-left shadow-sm transition hover:-translate-y-0.5 ${theme.border}`}
    >
      {content}
    </button>
  );

}

/* =========================================================
   CELEBRATION
========================================================= */

function Celebration({
  word,
  streak,
  onNext,
}: {
  word: string;
  streak: number;
  onNext: () => void;
}) {
  const confetti = [
    {
      left: "10%",
      top: "14%",
      color: "#FACC15",
      rotate: "18deg",
    },
    {
      left: "18%",
      top: "28%",
      color: "#EC4899",
      rotate: "45deg",
    },
    {
      left: "28%",
      top: "12%",
      color: "#14B8A6",
      rotate: "72deg",
    },
    {
      left: "38%",
      top: "24%",
      color: "#8B5CF6",
      rotate: "14deg",
    },
    {
      left: "62%",
      top: "18%",
      color: "#F59E0B",
      rotate: "56deg",
    },
    {
      left: "72%",
      top: "28%",
      color: "#06B6D4",
      rotate: "32deg",
    },
    {
      left: "82%",
      top: "13%",
      color: "#22C55E",
      rotate: "75deg",
    },
    {
      left: "90%",
      top: "30%",
      color: "#EC4899",
      rotate: "20deg",
    },
  ];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#101632]/45 px-4 backdrop-blur-[3px]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {confetti.map(
          (
            item,
            index
          ) => (
            <span
              key={index}
              className="absolute h-3 w-2 rounded-sm"
              style={{
                left: item.left,
                top: item.top,
                backgroundColor:
                  item.color,
                transform: `rotate(${item.rotate})`,
                animation:
                  "celebrationFloat 1.4s ease-in-out infinite alternate",
                animationDelay: `${
                  index * 80
                }ms`,
              }}
            />
          )
        )}
      </div>

      <div className="relative w-full max-w-[380px] overflow-hidden rounded-[32px] border border-white/80 bg-white px-6 pb-6 pt-7 text-center shadow-[0_30px_90px_rgba(22,29,74,0.32)] sm:px-8">
        <div className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-violet-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 top-10 h-40 w-40 rounded-full bg-emerald-200/35 blur-3xl" />

        <div className="relative mx-auto flex h-[88px] w-[88px] items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-yellow-200/60 blur-xl" />
          <div className="relative text-[68px] drop-shadow-[0_10px_18px_rgba(245,158,11,0.30)]">
            ⭐
          </div>
        </div>

        <div className="relative mt-1">
          <h2 className="text-4xl font-black tracking-[-0.04em] text-violet-600">
            Hebat!
          </h2>

          <p className="mt-1 text-sm font-black text-[#17203f]">
            Jawapan anda betul!
          </p>

          <div className="mx-auto mt-4 flex min-h-[52px] max-w-[230px] items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 px-5">
            <span className="text-3xl font-black text-emerald-600">
              {word}
            </span>
          </div>

          <div className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-black text-orange-600">
            <Flame
              size={15}
              className="fill-orange-500 text-orange-500"
            />
            Streak {streak}
          </div>

          <button
            type="button"
            onClick={onNext}
            className="mx-auto mt-5 flex min-h-[48px] w-full max-w-[220px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(109,70,238,0.30)] transition hover:-translate-y-0.5"
          >
            Seterusnya
            <ChevronRight
              size={18}
            />
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes celebrationFloat {
          from {
            transform: translateY(-4px) rotate(0deg);
          }

          to {
            transform: translateY(14px) rotate(18deg);
          }
        }
      `}</style>
    </div>
  );
}