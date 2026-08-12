"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Download,
  FileText,
  FolderOpen,
  Loader2,
  Palette,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProtectedPage } from "@/components/ProtectedPage";
import { supabase } from "@/lib/supabase";

type WorksheetItem = {
  id: string;
  subject: string;
  title: string;
  description: string | null;
  external_link: string;
  parent_user_id: string | null;
  created_at: string;
};

const subjectLabels: Record<string, string> = {
  "bahasa-melayu": "Bahasa Melayu",
  english: "English",
  mathematics: "Mathematics",
  science: "Science",
  "membaca-3m": "Membaca 3M",
};

const subjectMeta: Record<
  string,
  {
    eyebrow: string;
    description: string;
    accent: string;
    soft: string;
    border: string;
  }
> = {
  "bahasa-melayu": {
    eyebrow: "Language Practice",
    description: "Bahasa, kosa kata, ayat dan latihan pemahaman.",
    accent: "text-rose-600",
    soft: "bg-rose-50",
    border: "border-rose-100",
  },
  english: {
    eyebrow: "English Practice",
    description: "Phonics, vocabulary, reading and writing activities.",
    accent: "text-sky-600",
    soft: "bg-sky-50",
    border: "border-sky-100",
  },
  mathematics: {
    eyebrow: "Math Practice",
    description: "Number sense, operations and problem-solving worksheets.",
    accent: "text-amber-600",
    soft: "bg-amber-50",
    border: "border-amber-100",
  },
  science: {
    eyebrow: "Science Practice",
    description: "Observation, discovery and simple science activities.",
    accent: "text-emerald-600",
    soft: "bg-emerald-50",
    border: "border-emerald-100",
  },
  "membaca-3m": {
    eyebrow: "Reading Practice",
    description: "Suku kata, reading, writing and early literacy practice.",
    accent: "text-violet-600",
    soft: "bg-violet-50",
    border: "border-violet-100",
  },
};

export default function SubjectWorksheetPage() {
  const params = useParams();
  const subject = String(params.subject || "");
  const label = subjectLabels[subject] || subject;

  return (
    <ProtectedPage>
      {() => (
        <>
          <Navbar />
          <SubjectWorksheetContent subject={subject} label={label} />
        </>
      )}
    </ProtectedPage>
  );
}

function SubjectWorksheetContent({
  subject,
  label,
}: {
  subject: string;
  label: string;
}) {
  const [items, setItems] = useState<WorksheetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const meta =
    subjectMeta[subject] || {
      eyebrow: "Worksheet Subject",
      description: "Your assigned worksheet collection.",
      accent: "text-indigo-600",
      soft: "bg-indigo-50",
      border: "border-indigo-100",
    };

  useEffect(() => {
    loadItems();
  }, [subject]);

  async function loadItems() {
    setLoading(true);
    setError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Please login again.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("custom_worksheet_items")
      .select("*")
      .eq("subject", subject)
      .eq("parent_user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setItems([]);
    } else {
      setItems((data || []) as WorksheetItem[]);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        {/* TOP ACTIONS */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/custom-worksheet"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Back to Subjects
          </Link>

          <Link
            href="/worksheet"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-slate-800"
          >
            <Palette size={16} />
            Draw & Learn
          </Link>
        </div>

        {/* PREMIUM HERO */}
        <section className="relative mt-5 overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 px-6 py-7 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:px-8 sm:py-8">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/10 text-indigo-200">
                  <FolderOpen size={22} />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-indigo-300">
                    {meta.eyebrow}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-slate-400">
                    Custom Worksheet Library
                  </p>
                </div>
              </div>

              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                {label}
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                {meta.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:min-w-[300px]">
              <HeroStat
                label="Assigned"
                value={loading ? "..." : String(items.length)}
              />
              <HeroStat
                label="Status"
                value={items.length > 0 ? "Ready" : "Waiting"}
              />
            </div>
          </div>
        </section>

        {/* SECTION HEADING */}
        <section className="mt-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-indigo-500">
                Your Files
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                Assigned Worksheets
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-400">
                Only worksheets assigned to your account will appear here.
              </p>
            </div>

            {!loading && !error && (
              <div className="inline-flex self-start items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-600 shadow-sm sm:self-auto">
                <FileText size={14} className="text-indigo-500" />
                {items.length} file{items.length === 1 ? "" : "s"}
              </div>
            )}
          </div>

          {loading ? (
            <div className="mt-5 flex items-center gap-3 rounded-[24px] border border-slate-200 bg-white p-6 text-sm font-bold text-slate-500 shadow-sm">
              <Loader2 className="animate-spin text-indigo-600" size={20} />
              Loading worksheets...
            </div>
          ) : error ? (
            <div className="mt-5 rounded-[24px] border border-red-100 bg-red-50 p-6 text-sm font-bold text-red-700">
              {error}
            </div>
          ) : items.length === 0 ? (
            <EmptyState label={label} />
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <WorksheetCard
                  key={item.id}
                  item={item}
                  accent={meta.accent}
                  soft={meta.soft}
                  border={meta.border}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function WorksheetCard({
  item,
  accent,
  soft,
  border,
}: {
  item: WorksheetItem;
  accent: string;
  soft: string;
  border: string;
}) {
  return (
    <article className="group flex h-full flex-col rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.10)]">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`grid h-12 w-12 place-items-center rounded-2xl border ${border} ${soft} ${accent}`}
        >
          <FileText size={22} />
        </div>

        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-emerald-700">
          Available
        </span>
      </div>

      <div className="mt-5 flex-1">
        <h3 className="text-xl font-black leading-snug text-slate-950">
          {item.title || "Worksheet"}
        </h3>

        {item.description && (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
            {item.description}
          </p>
        )}
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-[11px] font-semibold text-slate-400">
        <CalendarDays size={14} />
        Added{" "}
        {new Date(item.created_at).toLocaleDateString("en-MY", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </div>

      <a
        href={item.external_link}
        target="_blank"
        rel="noreferrer"
        className="mt-4 flex items-center justify-between rounded-xl bg-indigo-600 px-4 py-3 text-sm font-black text-white transition hover:bg-indigo-700"
      >
        <span className="inline-flex items-center gap-2">
          <Download size={16} />
          Open Worksheet
        </span>
        <ChevronRight size={16} />
      </a>
    </article>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="mt-5 rounded-[26px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-400">
        <FileText size={30} />
      </div>

      <h2 className="mt-4 text-xl font-black text-slate-800">
        No {label} worksheet yet
      </h2>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
        Once admin assigns your purchased worksheet, it will appear here
        automatically.
      </p>

      <Link
        href="/custom-worksheet"
        className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
      >
        Browse Other Subjects
        <ChevronRight size={15} />
      </Link>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-4 text-center backdrop-blur">
      <p className="text-xl font-black text-white sm:text-2xl">{value}</p>
      <p className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
    </div>
  );
}