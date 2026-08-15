"use client";

import Link from "next/link";
import type { ElementType, ReactNode } from "react";

import {
  ArrowLeft,
  BookOpen,
  CaseSensitive,
  ChevronRight,
  Grip,
  PencilLine,
  Puzzle,
  Shapes,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";

import { ProtectedPage } from "@/components/ProtectedPage";

/* =========================================================
   TYPES
========================================================= */

type ActivityTheme =
  | "purple"
  | "orange"
  | "green"
  | "blue"
  | "pink"
  | "violet";

type PreviewType =
  | "book"
  | "trace"
  | "abc"
  | "sorting"
  | "case"
  | "word";

type Activity = {
  id: string;
  number: number;
  title: string;
  description: string;
  href: string;
  tag: string;
  icon: ElementType;
  theme: ActivityTheme;
  preview: PreviewType;
};

/* =========================================================
   ACTIVITY DATA
========================================================= */

const activities: Activity[] = [
  {
    id: "baca-perkataan",
    number: 1,
    title: "Baca Perkataan",
    description:
      "Ikut gerakan jari, bunyikan suku kata dan gabungkan menjadi perkataan.",
    href: "/huruf-membaca/baca-perkataan",
    tag: "Membaca",
    icon: BookOpen,
    theme: "purple",
    preview: "book",
  },
  {
    id: "alphabet-tracing",
    number: 2,
    title: "Jejak Huruf",
    description:
      "Belajar menulis huruf melalui tracing dengan animasi arah penulisan.",
    href: "/huruf-membaca/alphabet-tracing",
    tag: "Menulis",
    icon: PencilLine,
    theme: "orange",
    preview: "trace",
  },
  {
    id: "abc-order",
    number: 3,
    title: "Susun ABC",
    description:
      "Susun huruf mengikut urutan abjad yang betul melalui aktiviti interaktif.",
    href: "/huruf-membaca/abc-order",
    tag: "Susunan",
    icon: Grip,
    theme: "green",
    preview: "abc",
  },
  {
    id: "vokal-konsonan",
    number: 4,
    title: "Vokal & Konsonan",
    description:
      "Kenal dan asingkan huruf vokal serta konsonan ke dalam kumpulan yang betul.",
    href: "/huruf-membaca/vokal-konsonan",
    tag: "Sorting",
    icon: Shapes,
    theme: "blue",
    preview: "sorting",
  },
  {
    id: "huruf-besar-kecil",
    number: 5,
    title: "Huruf Besar & Kecil",
    description:
      "Kenal pasti dan asingkan huruf besar dengan huruf kecil yang betul.",
    href: "/huruf-membaca/huruf-besar-kecil",
    tag: "Matching",
    icon: CaseSensitive,
    theme: "pink",
    preview: "case",
  },
  {
    id: "bina-perkataan",
    number: 6,
    title: "Bina Perkataan",
    description:
      "Susun huruf dan suku kata untuk membina perkataan Bahasa Melayu.",
    href: "/huruf-membaca/bina-perkataan",
    tag: "Membaca",
    icon: Puzzle,
    theme: "violet",
    preview: "word",
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function HurufMembacaPage() {
  return (
    <ProtectedPage>
      {() => <HurufMembacaContent />}
    </ProtectedPage>
  );
}

/* =========================================================
   CONTENT
========================================================= */

function HurufMembacaContent() {
  return (
    <main className="min-h-screen bg-[#F4F8FF] text-[#101936]">
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html {
          -webkit-text-size-adjust: 100%;
        }

        body {
          margin: 0;
          background: #f4f8ff;
        }

        a,
        button {
          -webkit-tap-highlight-color: transparent;
        }

        @keyframes floating {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-6px);
          }
        }

        @keyframes starMove {
          0%,
          100% {
            transform: translateY(0) rotate(-6deg);
          }

          50% {
            transform: translateY(-7px) rotate(6deg);
          }
        }

        .preview-floating {
          animation: floating 4s ease-in-out infinite;
        }

        .star-floating {
          animation: starMove 3.3s ease-in-out infinite;
        }
      `}</style>

      {/* =====================================================
          TOP NAV
      ===================================================== */}

      <header className="relative z-50 border-b border-[#E3EAF4] bg-white">
        <div className="mx-auto flex max-w-[1700px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 text-xl font-black text-white shadow-lg">
              FD
            </div>

            <div>
              <p className="text-base font-black tracking-wide text-[#1262A9] sm:text-lg">
                FD ARCADIA
              </p>

              <p className="text-xs font-semibold text-[#73819A]">
                LearningHub
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 shadow-sm transition hover:-translate-y-0.5"
          >
            <ArrowLeft size={16} />

            <span className="hidden sm:inline">
              Dashboard
            </span>
          </Link>
        </div>
      </header>

      {/* =====================================================
          HERO / BACKGROUND
      ===================================================== */}

      <section className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-gradient-to-b from-[#8BDEFF] via-[#D9F6FF] to-[#DFF7D2]">
        {/* CLOUDS */}

        <Cloud className="left-[3%] top-[5%]" />
        <Cloud className="right-[5%] top-[7%]" />

        {/* DECORATION */}

        <Star
          size={25}
          fill="currentColor"
          className="star-floating absolute left-[27%] top-[12%] hidden text-yellow-300 sm:block"
        />

        <Star
          size={22}
          fill="currentColor"
          className="star-floating absolute right-[28%] top-[11%] hidden text-yellow-300 sm:block"
        />

        {/* GRASS */}

        <div className="absolute inset-x-0 bottom-0 h-[28%] bg-gradient-to-b from-[#A8EE55] to-[#5FC53D]" />

        <div className="absolute inset-x-0 bottom-[23%] h-[80px] rounded-[50%] bg-[#7CD544]" />

        <Bush className="-left-16 bottom-[13%]" />
        <Bush className="-right-16 bottom-[13%]" />

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="relative z-20 mx-auto max-w-[1700px] px-3 pb-16 pt-7 sm:px-5 md:pt-9 lg:px-7">
          {/* =================================================
              HERO TITLE
          ================================================= */}

          <div className="mx-auto max-w-[900px] text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white bg-white/70 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-violet-600 shadow-sm">
              <Sparkles size={14} />
              FD Arcadia Literacy Playground
            </div>

            <div className="mx-auto mt-4 w-fit">
              <h1 className="text-[42px] font-black leading-none tracking-tight text-[#18134C] sm:text-[58px] lg:text-[68px]">
                HURUF MEMBACA
              </h1>

              <div className="mx-auto mt-3 w-fit rounded-2xl bg-gradient-to-r from-violet-700 via-purple-600 to-violet-700 px-6 py-2 text-xs font-black text-white shadow-lg sm:text-sm">
                Belajar Huruf • Baca • Tulis • Faham
              </div>
            </div>

            <p className="mx-auto mt-5 max-w-2xl text-sm font-semibold leading-6 text-[#55738B] sm:text-base">
              Pilih aktiviti untuk mula belajar.
              Setiap permainan direka secara interaktif dan berperingkat.
            </p>
          </div>

          {/* =================================================
              ACTIVITIES
          ================================================= */}

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
            {activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
              />
            ))}
          </div>

          {/* =================================================
              BOTTOM BADGES
          ================================================= */}

          <div className="mx-auto mt-8 flex max-w-[950px] flex-wrap items-center justify-center gap-3">
            <BottomBadge
              icon={<BookOpen size={16} />}
              text="6 Aktiviti"
            />

            <BottomBadge
              icon={<Trophy size={16} />}
              text="Belajar Berperingkat"
            />

            <BottomBadge
              icon={<Sparkles size={16} />}
              text="Interactive Learning"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   ACTIVITY CARD
========================================================= */

function ActivityCard({
  activity,
}: {
  activity: Activity;
}) {
  const Icon = activity.icon;

  const theme = getTheme(activity.theme);

  return (
    <Link
      href={activity.href}
      className="group relative flex min-h-[500px] flex-col overflow-hidden rounded-[30px] border-4 border-white bg-white shadow-xl transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
    >
      {/* NUMBER */}

      <div
        className={`absolute left-1/2 top-1 z-30 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white text-sm font-black text-white shadow ${theme.number}`}
      >
        {activity.number}
      </div>

      {/* PREVIEW */}

      <div
        className={`relative mx-2 mt-2 flex h-[235px] items-center justify-center overflow-hidden rounded-[24px] ${theme.preview}`}
      >
        <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/30 text-white">
          <Icon size={21} />
        </div>

        <ActivityPreview
          type={activity.preview}
        />

        <div className="absolute bottom-3 right-3 rounded-full bg-white/30 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-white">
          {activity.tag}
        </div>
      </div>

      {/* CONTENT */}

      <div className="flex flex-1 flex-col px-5 pb-5 pt-5 text-center">
        <h2 className="text-[18px] font-black uppercase leading-tight text-[#17153D]">
          {activity.title}
        </h2>

        <p className="mx-auto mt-4 flex-1 text-sm font-medium leading-6 text-[#566680]">
          {activity.description}
        </p>

        <div
          className={`mt-5 flex h-12 items-center justify-center gap-2 rounded-2xl text-sm font-black text-white shadow-lg transition group-hover:scale-[1.02] ${theme.button}`}
        >
          Main Sekarang

          <ChevronRight size={17} />
        </div>
      </div>
    </Link>
  );
}

/* =========================================================
   PREVIEW
========================================================= */

function ActivityPreview({
  type,
}: {
  type: PreviewType;
}) {
  /* =======================================================
     BACA PERKATAAN
  ======================================================= */

  if (type === "book") {
    return (
      <div className="preview-floating relative">
        <div className="flex h-[145px] w-[190px] rounded-2xl border-4 border-violet-700 bg-[#FFF8E8] shadow-xl">
          <div className="flex flex-1 flex-col items-center justify-center border-r border-[#E5DCC9]">
            <span className="text-3xl font-black text-pink-500">
              ba
            </span>

            <span className="mt-4 text-2xl font-black text-orange-400">
              bu
            </span>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center">
            <span className="text-3xl font-black text-sky-500">
              ca
            </span>

            <span className="mt-4 text-2xl font-black text-green-500">
              ku
            </span>
          </div>
        </div>

        <div className="absolute -bottom-5 right-0 text-4xl">
          ☝️
        </div>
      </div>
    );
  }

  /* =======================================================
     TRACE
  ======================================================= */

  if (type === "trace") {
    return (
      <div className="preview-floating relative">
        <div className="flex h-[155px] w-[145px] items-center justify-center rounded-2xl border-4 border-white/70 bg-[#FFFDF4] shadow-xl">
          <span
            className="text-[110px] font-black leading-none"
            style={{
              color: "transparent",
              WebkitTextStroke: "3px #4E5664",
            }}
          >
            A
          </span>
        </div>

        <PencilLine
          size={58}
          className="absolute -bottom-3 -right-7 rotate-[-35deg] text-red-500"
        />
      </div>
    );
  }

  /* =======================================================
     ABC
  ======================================================= */

  if (type === "abc") {
    return (
      <div className="preview-floating grid grid-cols-2 gap-2">
        <LetterCube
          letter="A"
          className="col-span-2 mx-auto bg-sky-500"
        />

        <LetterCube
          letter="B"
          className="bg-pink-500"
        />

        <LetterCube
          letter="C"
          className="bg-yellow-400"
        />
      </div>
    );
  }

  /* =======================================================
     VOKAL KONSONAN
  ======================================================= */

  if (type === "sorting") {
    return (
      <div className="preview-floating flex items-end gap-3">
        <MiniBasket
          label="VOKAL"
          color="bg-pink-500"
          letters={["a", "e", "i", "o", "u"]}
        />

        <MiniBasket
          label="KONSONAN"
          color="bg-blue-500"
          letters={["b", "c", "d", "f", "g"]}
        />
      </div>
    );
  }

  /* =======================================================
     CASE
  ======================================================= */

  if (type === "case") {
    return (
      <div className="preview-floating relative flex items-center gap-3">
        <div className="flex h-[135px] w-[92px] -rotate-6 items-center justify-center rounded-2xl border-4 border-white bg-white text-[70px] font-black text-pink-500 shadow-xl">
          A
        </div>

        <div className="flex h-[110px] w-[80px] rotate-6 items-center justify-center rounded-2xl border-4 border-white bg-white text-[60px] font-black text-violet-600 shadow-xl">
          a
        </div>

        <span className="absolute left-[42%] top-2 text-3xl font-black text-white">
          ↔
        </span>
      </div>
    );
  }

  /* =======================================================
     WORD
  ======================================================= */

  return (
    <div className="preview-floating grid grid-cols-2 gap-2">
      <PuzzleTile
        text="b"
        className="bg-sky-500"
      />

      <PuzzleTile
        text="a"
        className="bg-orange-400"
      />

      <PuzzleTile
        text="c"
        className="bg-green-500"
      />

      <PuzzleTile
        text="a"
        className="bg-violet-600"
      />
    </div>
  );
}

/* =========================================================
   LETTER CUBE
========================================================= */

function LetterCube({
  letter,
  className,
}: {
  letter: string;
  className: string;
}) {
  return (
    <div
      className={`flex h-[70px] w-[70px] items-center justify-center rounded-2xl border-4 border-white/70 text-[42px] font-black text-white shadow-lg ${className}`}
    >
      {letter}
    </div>
  );
}

/* =========================================================
   MINI BASKET
========================================================= */

function MiniBasket({
  label,
  color,
  letters,
}: {
  label: string;
  color: string;
  letters: string[];
}) {
  return (
    <div className="relative w-[100px] pt-8">
      {/* HANDLE */}

      <div className="absolute left-1/2 top-0 h-[70px] w-[72px] -translate-x-1/2 rounded-t-full border-[7px] border-[#B96827] border-b-0" />

      {/* BODY */}

      <div className="relative z-10 min-h-[95px] rounded-b-[28px] rounded-t-xl border-4 border-[#9E5524] bg-[#D9893C] px-2 pb-2 pt-4 shadow-xl">
        <div className="flex flex-wrap justify-center gap-1">
          {letters.map((letter) => (
            <span
              key={letter}
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black text-white shadow ${color}`}
            >
              {letter}
            </span>
          ))}
        </div>

        <div
          className={`mx-auto mt-2 rounded-lg px-2 py-1 text-center text-[8px] font-black text-white ${color}`}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PUZZLE TILE
========================================================= */

function PuzzleTile({
  text,
  className,
}: {
  text: string;
  className: string;
}) {
  return (
    <div
      className={`flex h-[76px] w-[76px] items-center justify-center rounded-2xl border-4 border-white/70 text-[44px] font-black text-white shadow-lg ${className}`}
    >
      {text}
    </div>
  );
}

/* =========================================================
   BADGE
========================================================= */

function BottomBadge({
  icon,
  text,
}: {
  icon: ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border-2 border-white bg-white/80 px-4 py-2 text-xs font-black text-[#5A6680] shadow-sm">
      <span className="text-violet-600">
        {icon}
      </span>

      {text}
    </div>
  );
}

/* =========================================================
   THEME
========================================================= */

function getTheme(
  theme: ActivityTheme
) {
  const themes: Record<
    ActivityTheme,
    {
      preview: string;
      button: string;
      number: string;
    }
  > = {
    purple: {
      preview:
        "bg-gradient-to-br from-purple-400 to-violet-700",
      button:
        "bg-gradient-to-b from-purple-500 to-violet-700",
      number:
        "bg-gradient-to-b from-purple-500 to-violet-700",
    },

    orange: {
      preview:
        "bg-gradient-to-br from-yellow-300 to-orange-400",
      button:
        "bg-gradient-to-b from-orange-400 to-orange-600",
      number:
        "bg-gradient-to-b from-orange-400 to-orange-600",
    },

    green: {
      preview:
        "bg-gradient-to-br from-lime-300 to-green-500",
      button:
        "bg-gradient-to-b from-green-400 to-green-600",
      number:
        "bg-gradient-to-b from-green-400 to-green-600",
    },

    blue: {
      preview:
        "bg-gradient-to-br from-sky-300 to-blue-500",
      button:
        "bg-gradient-to-b from-sky-400 to-blue-600",
      number:
        "bg-gradient-to-b from-sky-400 to-blue-600",
    },

    pink: {
      preview:
        "bg-gradient-to-br from-pink-300 to-rose-500",
      button:
        "bg-gradient-to-b from-pink-400 to-rose-600",
      number:
        "bg-gradient-to-b from-pink-400 to-rose-600",
    },

    violet: {
      preview:
        "bg-gradient-to-br from-violet-300 to-purple-600",
      button:
        "bg-gradient-to-b from-violet-500 to-purple-700",
      number:
        "bg-gradient-to-b from-violet-500 to-purple-700",
    },
  };

  return themes[theme];
}

/* =========================================================
   CLOUD
========================================================= */

function Cloud({
  className,
}: {
  className: string;
}) {
  return (
    <div
      className={`absolute h-[70px] w-[170px] opacity-80 ${className}`}
    >
      <div className="absolute bottom-0 left-0 h-10 w-full rounded-full bg-white" />

      <div className="absolute bottom-3 left-5 h-14 w-14 rounded-full bg-white" />

      <div className="absolute bottom-4 left-16 h-16 w-16 rounded-full bg-white" />

      <div className="absolute bottom-2 right-4 h-12 w-12 rounded-full bg-white" />
    </div>
  );
}

/* =========================================================
   BUSH
========================================================= */

function Bush({
  className,
}: {
  className: string;
}) {
  return (
    <div
      className={`absolute h-[180px] w-[260px] ${className}`}
    >
      <div className="absolute bottom-0 left-0 h-[135px] w-[135px] rounded-full bg-[#35A94B]" />

      <div className="absolute bottom-0 left-[65px] h-[165px] w-[165px] rounded-full bg-[#48BD4D]" />

      <div className="absolute bottom-0 right-0 h-[125px] w-[125px] rounded-full bg-[#2F9F45]" />
    </div>
  );
}