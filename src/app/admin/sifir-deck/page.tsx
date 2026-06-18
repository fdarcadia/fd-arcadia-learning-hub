"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProtectedPage } from "@/components/ProtectedPage";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "fdarcadia.hello@gmail.com";

type DeckQuestion = {
  id: string;
  language: string;
  question: string;
  answer: string;
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
  const [firstNumber, setFirstNumber] = useState("");
  const [secondNumber, setSecondNumber] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [items, setItems] = useState<DeckQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (firstNumber && secondNumber) {
      setQuestion(`${firstNumber} × ${secondNumber} = ?`);
      setAnswer(String(Number(firstNumber) * Number(secondNumber)));
    }
  }, [firstNumber, secondNumber]);

  async function loadData() {
    setLoading(true);

    const { data, error } = await supabase
      .from("sifir_deck_questions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setItems([]);
    } else {
      setItems((data || []) as DeckQuestion[]);
    }

    setLoading(false);
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

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-emerald-50 px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <section className="rounded-[2rem] bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white shadow-xl sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="tracking-[0.25em] text-yellow-200">
                  ADMIN SIFIR DECK
                </p>

                <h1 className="font-display mt-3 text-5xl sm:text-6xl">
                  Create Sifir Cards
                </h1>

                <p className="mt-3 text-indigo-100">
                  Cards created here will appear on parent Sifir Deck page.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/sifir-deck"
                  className="rounded-full bg-white px-5 py-3 font-bold text-indigo-700 shadow"
                >
                  Preview Parent
                </Link>

                <Link
                  href="/dashboard"
                  className="rounded-full bg-yellow-200 px-5 py-3 font-bold text-indigo-700 shadow"
                >
                  <ArrowLeft className="mr-2 inline" size={18} />
                  Back
                </Link>
              </div>
            </div>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_420px]">
            <form
              onSubmit={handleSubmit}
              className="rounded-[2rem] bg-white p-6 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-yellow-100 text-yellow-700">
                  <Plus size={28} />
                </div>

                <div>
                  <h2 className="text-3xl font-bold text-indigo-700">
                    Add New Card
                  </h2>
                  <p className="text-slate-500">
                    Auto calculate answer or edit manually.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                <label className="grid gap-2">
                  <span className="font-bold text-slate-700">Language</span>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
                  >
                    <option value="bm">Bahasa Melayu</option>
                    <option value="en">English</option>
                  </select>
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="font-bold text-slate-700">
                      First Number
                    </span>
                    <input
                      value={firstNumber}
                      onChange={(e) => setFirstNumber(e.target.value)}
                      placeholder="Contoh: 7"
                      inputMode="numeric"
                      className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="font-bold text-slate-700">
                      Second Number
                    </span>
                    <input
                      value={secondNumber}
                      onChange={(e) => setSecondNumber(e.target.value)}
                      placeholder="Contoh: 8"
                      inputMode="numeric"
                      className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
                    />
                  </label>
                </div>

                <label className="grid gap-2">
                  <span className="font-bold text-slate-700">Question</span>
                  <input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Contoh: 7 × 8 = ?"
                    className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
                    required
                  />
                </label>

                <label className="grid gap-2">
                  <span className="font-bold text-slate-700">Answer</span>
                  <input
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Jawapan: 56"
                    inputMode="numeric"
                    className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
                    required
                  />
                </label>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-2xl bg-indigo-600 px-6 py-4 text-lg font-bold text-white shadow-md transition hover:bg-indigo-700 disabled:opacity-60"
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

            <div className="rounded-[2rem] bg-white p-6 shadow-xl">
              <h2 className="text-3xl font-bold text-indigo-700">
                Live Preview
              </h2>

              <p className="mt-1 text-slate-500">
                This is how the parent card will read the question.
              </p>

              <div className="mt-6 rounded-[2rem] bg-indigo-600 p-8 text-center text-white shadow-xl">
                <p className="text-indigo-100">Soalan Sifir</p>

                <h3 className="mt-5 text-5xl font-black">
                  {question || "7 × 8 = ?"}
                </h3>
              </div>

              <div className="mt-5 rounded-[2rem] border-4 border-yellow-200 bg-yellow-50 p-6 text-center">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-700">
                  Answer
                </p>

                <p className="mt-3 text-5xl font-black text-emerald-600">
                  {answer || "56"}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="tracking-[0.2em] text-sm font-bold text-yellow-600">
                  SAVED CARDS
                </p>

                <h2 className="mt-1 text-3xl font-bold text-indigo-700">
                  {items.length} Sifir Cards
                </h2>
              </div>

              <button
                onClick={loadData}
                className="rounded-2xl bg-emerald-100 px-5 py-3 font-bold text-emerald-700"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-center text-slate-500">
                Loading cards...
              </div>
            ) : items.length === 0 ? (
              <div className="mt-6 rounded-2xl bg-yellow-50 p-6 text-center text-yellow-700">
                No cards yet. Add your first card above.
              </div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[2rem] border border-indigo-100 bg-indigo-50 p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-indigo-700">
                          {item.language.toUpperCase()}
                        </span>

                        <h3 className="mt-4 text-3xl font-black text-indigo-700">
                          {item.question}
                        </h3>

                        <p className="mt-3 inline-flex items-center rounded-2xl bg-emerald-100 px-4 py-2 font-bold text-emerald-700">
                          <CheckCircle2 className="mr-2" size={18} />
                          Answer: {item.answer}
                        </p>
                      </div>

                      <button
                        onClick={() => deleteQuestion(item.id)}
                        className="rounded-2xl bg-red-100 p-3 text-red-600 transition hover:bg-red-200"
                        title="Delete card"
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}