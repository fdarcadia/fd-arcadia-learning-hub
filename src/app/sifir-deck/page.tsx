"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, Eraser, RefreshCcw, Star, X } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ProtectedPage } from "@/components/ProtectedPage";
import { supabase } from "@/lib/supabase";

type SifirCard = {
  id: string;
  language?: string;
  question: string;
  answer: string;
  is_active?: boolean;
};

type UiLanguage = "bm" | "en";

const text = {
  bm: {
    subtitle: "Latihan sifir menggunakan kad yang admin sediakan.",
    loading: "Memuatkan kad...",
    emptyTitle: "Belum ada kad sifir.",
    emptyDesc: "Admin perlu tambah soalan di Admin Sifir Deck dahulu.",
    cardMode: "Card Mode",
    verticalMode: "Vertical Mode",
    previous: "Sebelum",
    next: "Seterusnya",
    card: "Kad",
    question: "Soalan Sifir",
    typeAnswer: "Taip jawapan di sini",
    enterHint: "Tekan Enter untuk semak jawapan.",
    correct: "Betul! Good job!",
    wrong: "Cuba lagi 💪",
    clear: "Padam Jawapan",
    check: "Semak",
    back: "Back",
  },
  en: {
    subtitle: "Practice multiplication using admin cards.",
    loading: "Loading cards...",
    emptyTitle: "No sifir cards yet.",
    emptyDesc: "Admin needs to add questions in Admin Sifir Deck first.",
    cardMode: "Card Mode",
    verticalMode: "Vertical Mode",
    previous: "Previous",
    next: "Next",
    card: "Card",
    question: "Multiplication Question",
    typeAnswer: "Type answer here",
    enterHint: "Press Enter to check answer.",
    correct: "Correct! Good job!",
    wrong: "Try again 💪",
    clear: "Clear Answer",
    check: "Check",
    back: "Back",
  },
};

export default function SifirDeckPage() {
  return (
    <ProtectedPage>
      {() => (
        <>
          <Navbar />
          <SifirDeckGame />
        </>
      )}
    </ProtectedPage>
  );
}

function SifirDeckGame() {
  const [cards, setCards] = useState<SifirCard[]>([]);
  const [index, setIndex] = useState(0);
  const [uiLanguage, setUiLanguage] = useState<UiLanguage>("bm");
  const [mode, setMode] = useState<"card" | "vertical">("card");
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [loading, setLoading] = useState(true);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const current = cards[index];
  const t = text[uiLanguage];

  useEffect(() => {
    const browserLanguage = navigator.language.toLowerCase();
    setUiLanguage(browserLanguage.includes("ms") ? "bm" : "en");
    loadCards();
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, [index, mode]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!current) return;

      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        pressNumber(event.key);
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        setInput((prev) => prev.slice(0, -1));
        setStatus("idle");
      }

      if (event.key === "Enter") {
        event.preventDefault();
        checkAnswer();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  async function loadCards() {
    setLoading(true);
    setInput("");
    setStatus("idle");
    setIndex(0);

    let query = supabase
      .from("sifir_deck_questions")
      .select("*")
      .order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error(error);
      setCards([]);
    } else {
      const activeCards = (data || []).filter((card: SifirCard) => {
        if (typeof card.is_active === "boolean") return card.is_active;
        return true;
      });

      setCards(activeCards as SifirCard[]);
    }

    setLoading(false);
  }

  function pressNumber(num: string) {
    if (status === "correct") return;
    setInput((prev) => `${prev}${num}`.replace(/[^0-9]/g, "").slice(0, 4));
    setStatus("idle");
  }

  function handleInputChange(value: string) {
    setInput(value.replace(/[^0-9]/g, "").slice(0, 4));
    setStatus("idle");
  }

  function clearInput() {
    setInput("");
    setStatus("idle");
    inputRef.current?.focus();
  }

  function checkAnswer() {
    if (!current || !input) return;

    const userAnswer = input.trim();
    const correctAnswer = String(current.answer || "").trim();

    if (userAnswer === correctAnswer) {
      setStatus("correct");
    } else {
      setStatus("wrong");
    }

    inputRef.current?.focus();
  }

  function nextCard() {
    if (cards.length === 0) return;
    setIndex((prev) => (prev + 1 >= cards.length ? 0 : prev + 1));
    setInput("");
    setStatus("idle");
  }

  function previousCard() {
    if (cards.length === 0) return;
    setIndex((prev) => (prev - 1 < 0 ? cards.length - 1 : prev - 1));
    setInput("");
    setStatus("idle");
  }

  const questionParts = useMemo(() => {
    if (!current) return { first: "?", second: "?" };

    const cleaned = current.question.replace("=", "").replace("?", "").trim();

    if (cleaned.includes("×")) {
      const [first, second] = cleaned.split("×").map((x) => x.trim());
      return { first, second };
    }

    if (cleaned.includes("x")) {
      const [first, second] = cleaned.split("x").map((x) => x.trim());
      return { first, second };
    }

    if (cleaned.includes("*")) {
      const [first, second] = cleaned.split("*").map((x) => x.trim());
      return { first, second };
    }

    return { first: current.question, second: "" };
  }, [current]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-emerald-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-[2rem] bg-gradient-to-r from-emerald-500 to-green-500 p-6 text-white shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold tracking-[0.25em] text-yellow-100">
                FD ARCADIA
              </p>

              <h1 className="mt-2 text-5xl font-black">✏️ Sifir Deck</h1>

              <p className="mt-2 text-green-50">{t.subtitle}</p>
            </div>

            <Link
              href="/dashboard"
              className="rounded-full bg-white px-5 py-3 font-bold text-emerald-700 shadow"
            >
              <ArrowLeft className="mr-2 inline" size={18} />
              {t.back}
            </Link>
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] bg-white p-5 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setMode("card")}
              className={`rounded-2xl px-5 py-3 font-bold ${
                mode === "card"
                  ? "bg-yellow-300 text-slate-800 ring-4 ring-yellow-400"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {t.cardMode}
            </button>

            <button
              type="button"
              onClick={() => setMode("vertical")}
              className={`rounded-2xl px-5 py-3 font-bold ${
                mode === "vertical"
                  ? "bg-sky-500 text-white ring-4 ring-sky-700"
                  : "bg-sky-100 text-sky-700"
              }`}
            >
              {t.verticalMode}
            </button>
          </div>
        </section>

        {loading ? (
          <div className="mt-8 rounded-[2rem] bg-white p-10 text-center font-bold shadow">
            {t.loading}
          </div>
        ) : cards.length === 0 ? (
          <div className="mt-8 rounded-[2rem] bg-white p-10 text-center shadow">
            <h2 className="text-3xl font-bold text-slate-700">
              {t.emptyTitle}
            </h2>
            <p className="mt-2 text-slate-500">{t.emptyDesc}</p>
          </div>
        ) : (
          <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <button
                type="button"
                onClick={previousCard}
                className="rounded-2xl bg-slate-100 px-5 py-3 font-bold text-slate-700"
              >
                {t.previous}
              </button>

              <p className="font-bold text-emerald-700">
                {t.card} {index + 1} / {cards.length}
              </p>

              <button
                type="button"
                onClick={nextCard}
                className="rounded-2xl bg-emerald-500 px-5 py-3 font-bold text-white"
              >
                {t.next}
              </button>
            </div>

            {mode === "card" ? (
              <CardQuestion current={current} status={status} label={t.question} />
            ) : (
              <VerticalQuestion
                first={questionParts.first}
                second={questionParts.second}
                input={input}
                status={status}
              />
            )}

            <AnswerInput
              inputRef={inputRef}
              input={input}
              status={status}
              placeholder={t.typeAnswer}
              hint={t.enterHint}
              onChange={handleInputChange}
              onSubmit={checkAnswer}
            />

            <NumberPad
              status={status}
              onPress={pressNumber}
              onClear={clearInput}
              onSubmit={checkAnswer}
              clearText={t.clear}
              checkText={t.check}
            />

            {status === "correct" ? (
              <div className="mt-6 rounded-[2rem] bg-emerald-100 p-5 text-center text-2xl font-black text-emerald-700">
                <Star className="mr-2 inline fill-yellow-300 text-yellow-400" />
                {t.correct}
              </div>
            ) : null}

            {status === "wrong" ? (
              <div className="mt-6 rounded-[2rem] bg-red-100 p-5 text-center text-2xl font-black text-red-600">
                {t.wrong}
              </div>
            ) : null}
          </section>
        )}
      </div>
    </main>
  );
}

function CardQuestion({
  current,
  status,
  label,
}: {
  current: SifirCard;
  status: "idle" | "correct" | "wrong";
  label: string;
}) {
  return (
    <div
      className={`mx-auto max-w-3xl rounded-[2rem] p-10 text-center text-white shadow-2xl ${
        status === "correct"
          ? "bg-emerald-500"
          : status === "wrong"
          ? "bg-red-500"
          : "bg-indigo-600"
      }`}
    >
      <p className="text-2xl text-white/80">{label}</p>

      <h2 className="mt-6 text-7xl font-black">{current.question}</h2>
    </div>
  );
}

function VerticalQuestion({
  first,
  second,
  input,
  status,
}: {
  first: string;
  second: string;
  input: string;
  status: "idle" | "correct" | "wrong";
}) {
  return (
    <div className="mx-auto max-w-xl rounded-[2rem] border-4 border-yellow-200 bg-yellow-50 p-8 text-center shadow-xl">
      <div className="mx-auto w-72 text-right text-7xl font-black text-slate-800">
        <div>{first}</div>

        <div className="flex justify-between">
          <span>×</span>
          <span>{second}</span>
        </div>

        <div className="my-4 border-t-8 border-slate-800" />

        <div
          className={`min-h-24 rounded-2xl border-4 bg-white px-4 py-3 text-center ${
            status === "correct"
              ? "border-emerald-400 text-emerald-600"
              : status === "wrong"
              ? "border-red-400 text-red-600"
              : "border-slate-300 text-indigo-600"
          }`}
        >
          {input || "?"}
        </div>
      </div>
    </div>
  );
}

function AnswerInput({
  inputRef,
  input,
  status,
  placeholder,
  hint,
  onChange,
  onSubmit,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  input: string;
  status: "idle" | "correct" | "wrong";
  placeholder: string;
  hint: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="mx-auto mt-8 max-w-xl rounded-[2rem] bg-white p-5 shadow">
      <input
        ref={inputRef}
        value={input}
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit();
          }
        }}
        className={`w-full rounded-2xl border-4 px-5 py-4 text-center text-5xl font-black outline-none ${
          status === "correct"
            ? "border-emerald-400 text-emerald-600"
            : status === "wrong"
            ? "border-red-400 text-red-600"
            : "border-sky-200 text-indigo-700 focus:border-indigo-500"
        }`}
      />

      <p className="mt-3 text-center text-sm font-bold text-slate-400">
        {hint}
      </p>
    </div>
  );
}

function NumberPad({
  status,
  onPress,
  onClear,
  onSubmit,
  clearText,
  checkText,
}: {
  status: "idle" | "correct" | "wrong";
  onPress: (num: string) => void;
  onClear: () => void;
  onSubmit: () => void;
  clearText: string;
  checkText: string;
}) {
  return (
    <div className="mx-auto mt-6 max-w-xl rounded-[2rem] bg-sky-100 p-5 shadow-xl">
      <div className="grid grid-cols-3 gap-4">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onPress(num)}
            className="h-20 rounded-2xl bg-white text-3xl font-black text-slate-800 shadow-md transition hover:scale-105"
          >
            {num}
          </button>
        ))}

        <button
          type="button"
          onClick={onClear}
          className="h-20 rounded-2xl bg-red-500 text-3xl font-black text-white shadow-md"
        >
          <X />
        </button>

        <button
          type="button"
          onClick={() => onPress("0")}
          className="h-20 rounded-2xl bg-white text-3xl font-black text-slate-800 shadow-md transition hover:scale-105"
        >
          0
        </button>

        <button
          type="button"
          onClick={onSubmit}
          className={`h-20 rounded-2xl text-2xl font-black text-white shadow-md ${
            status === "correct" ? "bg-emerald-500" : "bg-green-500"
          }`}
        >
          <Check className="mr-1 inline" />
          {checkText}
        </button>
      </div>

      <button
        type="button"
        onClick={onClear}
        className="mt-4 w-full rounded-2xl bg-yellow-400 px-5 py-4 font-black text-slate-800 shadow"
      >
        <Eraser className="mr-2 inline" />
        {clearText}
      </button>
    </div>
  );
}