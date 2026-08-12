"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  Trash2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProtectedPage } from "@/components/ProtectedPage";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "fdarcadia.hello@gmail.com";

type QuestionLevel = "easy" | "medium" | "hard";

type DeckQuestion = {
  id: string;
  language: string;
  question: string;
  answer: string;
  difficulty: QuestionLevel | null;
  table_no: number | null;
  created_at?: string;
};

export default function AdminSifirDeckPage() {
  return (
    <ProtectedPage>
      {(user) =>
        user.email === ADMIN_EMAIL ? (
          <Content />
        ) : (
          <>
            <Navbar />
            <main className="page-shell py-10">
              <h1 className="text-3xl font-bold text-red-600">
                Access denied
              </h1>
            </main>
          </>
        )
      }
    </ProtectedPage>
  );
}

function Content() {
  const [language, setLanguage] = useState("bm");
  const [level, setLevel] = useState<QuestionLevel>("easy");
  const [firstNumber, setFirstNumber] = useState("");
  const [secondNumber, setSecondNumber] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const [items, setItems] = useState<DeckQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [wheelLimit, setWheelLimit] = useState(20);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [savingSettings, setSavingSettings] = useState(false);

  const [selectedTable, setSelectedTable] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (firstNumber && secondNumber) {
      const first = Number(firstNumber);
      const second = Number(secondNumber);

      if (!Number.isNaN(first) && !Number.isNaN(second)) {
        setQuestion(`${firstNumber} × ${secondNumber} = ?`);
        setAnswer(String(first * second));
      }
    }
  }, [firstNumber, secondNumber]);

  async function loadData() {
    setLoading(true);

    const { data, error } = await supabase
      .from("sifir_deck_questions")
      .select("*")
      .order("table_no", { ascending: true, nullsFirst: false })
      .order("difficulty", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setItems([]);
    } else {
      setItems((data || []) as DeckQuestion[]);
    }

    const { data: settings, error: settingsError } = await supabase
      .from("sifir_deck_settings")
      .select("wheel_question_limit, timer_seconds")
      .eq("id", "global")
      .maybeSingle();

    if (!settingsError && settings) {
      setWheelLimit(Number(settings.wheel_question_limit || 20));
      setTimerSeconds(Number(settings.timer_seconds || 30));
    }

    setLoading(false);
  }

  async function saveSettings() {
    if (wheelLimit < 1) {
      alert("Wheel question limit must be at least 1.");
      return;
    }

    if (timerSeconds < 5) {
      alert("Timer must be at least 5 seconds.");
      return;
    }

    setSavingSettings(true);

    const { error } = await supabase.from("sifir_deck_settings").upsert({
      id: "global",
      wheel_question_limit: wheelLimit,
      timer_seconds: timerSeconds,
    });

    setSavingSettings(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Spin wheel settings saved.");
  }

  function detectTableNo() {
    if (secondNumber && !Number.isNaN(Number(secondNumber))) {
      return Number(secondNumber);
    }

    const match = question.match(/[×xX]\s*(\d+)/);
    if (match?.[1]) {
      return Number(match[1]);
    }

    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!question.trim() || !answer.trim()) {
      alert("Please add question and answer.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("sifir_deck_questions").insert({
      language,
      question: question.trim(),
      answer: answer.trim(),
      difficulty: level,
      table_no: detectTableNo(),
    });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setFirstNumber("");
    setSecondNumber("");
    setQuestion("");
    setAnswer("");
    setLevel("easy");

    await loadData();
  }

  async function deleteQuestion(id: string) {
    const confirmDelete = confirm("Delete this card?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("sifir_deck_questions")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadData();
  }

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchTable =
        selectedTable === "all" || item.table_no === Number(selectedTable);

      const matchLevel =
        selectedLevel === "all" || item.difficulty === selectedLevel;

      const keyword = search.toLowerCase();

      const matchSearch =
        item.question.toLowerCase().includes(keyword) ||
        item.answer.toLowerCase().includes(keyword) ||
        item.language.toLowerCase().includes(keyword) ||
        String(item.table_no || "").includes(keyword);

      return matchTable && matchLevel && matchSearch;
    });
  }, [items, selectedTable, selectedLevel, search]);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f6f7fb] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <section className="relative overflow-hidden rounded-[28px] border border-indigo-400/20 bg-gradient-to-br from-[#111735] via-[#28265f] to-[#5b45b7] p-6 text-white shadow-[0_20px_60px_rgba(30,41,59,0.16)] sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-violet-200">
                  ADMIN SIFIR DECK
                </p>

                <h1 className="font-display mt-2 text-4xl font-black tracking-tight sm:text-5xl">
                  Create Sifir Cards
                </h1>

                <p className="mt-2 max-w-2xl text-sm font-semibold text-xs font-black uppercase tracking-[0.16em] text-violet-200/80">
                  Add questions, set level, timer and spin wheel limit.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/sifir-deck"
                  className="rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-black text-white backdrop-blur transition hover:bg-white/15"
                >
                  Preview Parent
                </Link>

                <Link
                  href="/dashboard"
                  className="rounded-xl bg-white px-4 py-2.5 text-sm font-black text-slate-900 shadow-sm transition hover:bg-slate-50"
                >
                  <ArrowLeft className="mr-2 inline" size={18} />
                  Back
                </Link>
              </div>
            </div>
          </section>

          <section className="mt-5 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-violet-50 text-violet-600">
                <Settings size={28} />
              </div>

              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-950">
                  Spin Wheel Settings
                </h2>
                <p className="text-sm font-semibold text-slate-400">
                  Control how many random questions and how many seconds per
                  question.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                  Random Questions Per Round
                </span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={wheelLimit}
                  onChange={(e) => setWheelLimit(Number(e.target.value))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">Timer Seconds</span>
                <input
                  type="number"
                  min={5}
                  max={300}
                  value={timerSeconds}
                  onChange={(e) => setTimerSeconds(Number(e.target.value))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                />
              </label>

              <button
                type="button"
                onClick={saveSettings}
                disabled={savingSettings}
                className="self-end rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
              >
                {savingSettings ? (
                  <>
                    <Loader2 className="mr-2 inline animate-spin" size={20} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 inline" size={20} />
                    Save Settings
                  </>
                )}
              </button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-violet-100 bg-violet-50/70 p-4 text-sm font-bold text-violet-700">
                Parent Spin Wheel will use{" "}
                <b>{wheelLimit} random question(s)</b> per round.
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-4 text-sm font-bold text-amber-700">
                Timer will be <b>{timerSeconds} second(s)</b> per question.
              </div>
            </div>
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
            <form
              onSubmit={handleSubmit}
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-50 text-amber-600">
                  <Plus size={28} />
                </div>

                <div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-950">
                    Add New Card
                  </h2>
                  <p className="text-sm font-semibold text-slate-400">
                    Auto calculate answer and detect sifir number.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3">
                <p className="text-xs font-black text-indigo-700">
                  Medium & Hard Question Bank
                </p>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                  Admin creates and saves the Medium and Hard questions here. Existing question logic is unchanged.
                </p>
              </div>

              <div className="mt-6 grid gap-4">
                <label className="grid gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">Language</span>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                  >
                    <option value="bm">Bahasa Melayu</option>
                    <option value="en">English</option>
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                    Question Level
                  </span>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as QuestionLevel)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                      First Number
                    </span>
                    <input
                      value={firstNumber}
                      onChange={(e) => setFirstNumber(e.target.value)}
                      placeholder="Contoh: 42"
                      inputMode="numeric"
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                      Sifir Number
                    </span>
                    <input
                      value={secondNumber}
                      onChange={(e) => setSecondNumber(e.target.value)}
                      placeholder="Contoh: 2"
                      inputMode="numeric"
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                    />
                  </label>
                </div>

                <label className="grid gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">Question</span>
                  <input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Contoh: 42 × 2 = ?"
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                    required
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">Answer</span>
                  <input
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Jawapan: 84"
                    inputMode="numeric"
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                    required
                  />
                </label>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 inline animate-spin" size={20} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={20} className="mr-2 inline" />
                      Save Card
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-2xl font-black tracking-tight text-slate-950">
                Live Preview
              </h2>

              <p className="mt-1 text-sm font-semibold text-slate-400">
                This is how the parent card will read the question.
              </p>

              <div className="mt-5 rounded-[22px] bg-gradient-to-br from-[#111735] to-[#322c73] p-7 text-center text-white shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-200">Soalan Sifir</p>

                <h3 className="mt-4 text-5xl font-black tracking-tight">
                  {question || "42 × 2 = ?"}
                </h3>
              </div>

              <div className="mt-4 rounded-[20px] border border-emerald-100 bg-emerald-50/70 p-5 text-center">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-700">
                  Answer
                </p>

                <p className="mt-2 text-4xl font-black text-emerald-600">
                  {answer || "84"}
                </p>
              </div>

              <div className="mt-4 rounded-[18px] border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-sm font-bold text-sm font-semibold text-slate-400">LEVEL</p>
                <p className="mt-2 text-2xl font-black uppercase text-indigo-700">
                  {level}
                </p>
              </div>

              <div className="mt-4 rounded-[18px] border border-amber-100 bg-amber-50 p-4 text-center text-amber-700">
                <Clock className="mx-auto" size={28} />
                <p className="mt-2 font-bold">
                  Spin Wheel Timer: {timerSeconds}s
                </p>
              </div>
            </div>
          </section>

          <section className="mt-5 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-500">
                  SAVED QUESTIONS
                </p>

                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                  {filteredItems.length} / {items.length} Questions
                </h2>
              </div>

              <button
                onClick={loadData}
                className="rounded-xl bg-emerald-50 px-4 py-2.5 text-xs font-black text-emerald-700 transition hover:bg-emerald-100"
              >
                <RefreshCw className="mr-2 inline" size={18} />
                Refresh
              </button>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
              >
                <option value="all">Semua Sifir</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((no) => (
                  <option key={no} value={no}>
                    Sifir {no}
                  </option>
                ))}
              </select>

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
              >
                <option value="all">Semua Level</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search soalan / jawapan..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-11 text-sm font-bold text-slate-700 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                />
              </div>
            </div>

            {loading ? (
              <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-center text-sm font-semibold text-slate-400">
                Loading questions...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="mt-6 rounded-2xl bg-yellow-50 p-6 text-center text-yellow-700">
                No questions found.
              </div>
            ) : (
              <div className="mt-5 overflow-x-auto rounded-[18px] border border-slate-200">
                <table className="w-full min-w-[850px] border-collapse bg-white text-left">
                  <thead className="bg-slate-950 text-white">
                    <tr>
                      <th className="p-4">No</th>
                      <th className="p-4">Sifir</th>
                      <th className="p-4">Level</th>
                      <th className="p-4">Language</th>
                      <th className="p-4">Question</th>
                      <th className="p-4">Answer</th>
                      <th className="p-4 text-center">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredItems.map((item, index) => (
                      <tr
                        key={item.id}
                        className="border-t border-slate-100 transition hover:bg-violet-50/40"
                      >
                        <td className="p-4 font-semibold text-slate-600">
                          {index + 1}
                        </td>

                        <td className="p-4">
                          <span className="rounded-full bg-indigo-50 px-3 py-1 font-bold text-indigo-700">
                            {item.table_no
                              ? `Sifir ${item.table_no}`
                              : "Not set"}
                          </span>
                        </td>

                        <td className="p-4">
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-bold uppercase ${getLevelClass(
                              item.difficulty || "easy"
                            )}`}
                          >
                            {item.difficulty || "easy"}
                          </span>
                        </td>

                        <td className="p-4 font-bold uppercase text-slate-600">
                          {item.language}
                        </td>

                        <td className="p-4 text-xl font-black text-indigo-700">
                          {item.question}
                        </td>

                        <td className="p-4 text-lg font-black text-emerald-700">
                          {item.answer}
                        </td>

                        <td className="p-4 text-center">
                          <button
                            onClick={() => deleteQuestion(item.id)}
                            className="rounded-xl bg-rose-50 p-2.5 text-rose-600 transition hover:bg-rose-100"
                            title="Delete question"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

function getLevelClass(level: QuestionLevel) {
  if (level === "easy") return "bg-emerald-100 text-emerald-700";
  if (level === "medium") return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}