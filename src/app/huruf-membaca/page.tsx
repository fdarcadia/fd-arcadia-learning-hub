"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CaseSensitive,
  CheckCircle2,
  ChevronRight,
  Ear,
  Gamepad2,
  Grip,
  Languages,
  LetterText,
  Loader2,
  LockKeyhole,
  PencilLine,
  Puzzle,
  Search,
  Shapes,
  Sparkles,
  Star,
  Volume2,
} from "lucide-react";

import { ProtectedPage } from "@/components/ProtectedPage";
import { supabase } from "@/lib/supabase";

/* =========================================================
   TYPES
========================================================= */

type Activity = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  color: string;
  iconBg: string;
  tag: string;
  available: boolean;
};

type ReadingGameActivity = {
  id: string;
  title: string | null;
  slug: string | null;
  description: string | null;
  game_type: string | null;
  difficulty: string | null;
  is_active: boolean | null;
  display_order: number | null;
};

/* =========================================================
   STATIC ACTIVITY LIST
========================================================= */

const activities: Activity[] = [
  {
    id: "baca-perkataan",
    title: "Baca Perkataan",
    description:
      "Ikut gerakan jari, bunyikan suku kata dan gabungkan menjadi perkataan.",
    href: "/huruf-membaca/baca-perkataan",
    icon: BookOpen,
    color: "from-violet-600 to-purple-500",
    iconBg: "bg-violet-100 text-violet-600",
    tag: "Membaca",
    available: true,
  },
  {
    id: "alphabet-tracing",
    title: "Jejak Huruf",
    description:
      "Belajar menulis huruf melalui tracing dengan animasi arah penulisan.",
    href: "/huruf-membaca/alphabet-tracing",
    icon: PencilLine,
    color: "from-pink-500 to-rose-400",
    iconBg: "bg-pink-100 text-pink-600",
    tag: "Menulis",
    available: true,
  },
  {
    id: "teka-gambar",
    title: "Teka Gambar",
    description:
      "Lihat gambar, dengar bunyi dan pilih perkataan yang betul.",
    href: "/huruf-membaca/teka-gambar",
    icon: Search,
    color: "from-amber-400 to-orange-400",
    iconBg: "bg-amber-100 text-amber-600",
    tag: "Kosa Kata",
    available: true,
  },
  {
    id: "abc-order",
    title: "Susun ABC",
    description:
      "Drag & drop huruf untuk menyusun abjad mengikut urutan yang betul.",
    href: "/huruf-membaca/abc-order",
    icon: Grip,
    color: "from-sky-500 to-blue-500",
    iconBg: "bg-sky-100 text-sky-600",
    tag: "Drag & Drop",
    available: true,
  },
  {
    id: "vokal-konsonan",
    title: "Vokal & Konsonan",
    description:
      "Asingkan huruf vokal dan konsonan ke dalam kumpulan yang betul.",
    href: "/huruf-membaca/vokal-konsonan",
    icon: Shapes,
    color: "from-emerald-500 to-teal-400",
    iconBg: "bg-emerald-100 text-emerald-600",
    tag: "Sorting",
    available: true,
  },
  {
    id: "bunyi-huruf",
    title: "Padankan Bunyi Huruf",
    description:
      "Dengar bunyi fonik Bahasa Melayu dan pilih huruf yang sepadan.",
    href: "/huruf-membaca/bunyi-huruf",
    icon: Ear,
    color: "from-indigo-500 to-violet-500",
    iconBg: "bg-indigo-100 text-indigo-600",
    tag: "Fonik",
    available: true,
  },
  {
    id: "huruf-besar-kecil",
    title: "Huruf Besar & Kecil",
    description:
      "Padankan huruf besar dengan pasangan huruf kecil yang betul.",
    href: "/huruf-membaca/huruf-besar-kecil",
    icon: CaseSensitive,
    color: "from-cyan-500 to-sky-400",
    iconBg: "bg-cyan-100 text-cyan-600",
    tag: "Matching",
    available: true,
  },
  {
    id: "bina-perkataan",
    title: "Bina Perkataan",
    description:
      "Susun huruf dan suku kata untuk membina perkataan Bahasa Melayu.",
    href: "/huruf-membaca/bina-perkataan",
    icon: Puzzle,
    color: "from-fuchsia-500 to-pink-500",
    iconBg: "bg-fuchsia-100 text-fuchsia-600",
    tag: "Membaca",
    available: true,
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function HurufMembacaPage() {
  return (
    <ProtectedPage>
      {(user) => <HurufMembacaContent userId={user.id} />}
    </ProtectedPage>
  );
}

/* =========================================================
   CONTENT
========================================================= */

function HurufMembacaContent({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [dbActivities, setDbActivities] = useState<ReadingGameActivity[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  useEffect(() => {
    loadActivities();
  }, []);

  async function loadActivities() {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("reading_game_activities")
        .select(
          "id,title,slug,description,game_type,difficulty,is_active,display_order"
        )
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) {
        console.warn("Reading activities:", error.message);
        setDbActivities([]);
        return;
      }

      setDbActivities((data || []) as ReadingGameActivity[]);
    } catch (error) {
      console.warn("Unable to load reading activities:", error);
    } finally {
      setLoading(false);
    }
  }

  const categories = [
    "Semua",
    "Membaca",
    "Fonik",
    "Menulis",
    "Drag & Drop",
    "Matching",
  ];

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.title.toLowerCase().includes(search.toLowerCase()) ||
      activity.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "Semua" || activity.tag === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-[#f6f7ff] text-[#111936]">
      {/* =====================================================
          TOP NAV
      ===================================================== */}

      <header className="border-b border-indigo-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 md:px-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-violet-500 sm:text-xs">
              FD Arcadia Learning Hub
            </p>

            <h1 className="mt-1 text-xl font-black text-[#111936] sm:text-2xl">
              Huruf & Membaca
            </h1>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200">
            <Sparkles size={21} />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 md:px-8 md:py-9">
        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#111936] via-[#191f54] to-[#43358c] p-6 text-white shadow-[0_25px_70px_rgba(31,38,95,0.18)] md:p-9 lg:p-11">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute bottom-[-100px] left-[35%] h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="absolute right-7 top-7 hidden gap-3 md:flex">
            <FloatingIcon icon={Star} color="text-yellow-300" />
            <FloatingIcon icon={BookOpen} color="text-pink-300" />
            <FloatingIcon icon={LetterText} color="text-cyan-300" />
          </div>

          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold text-violet-100 backdrop-blur">
              <Gamepad2 size={15} />
              INTERACTIVE LITERACY PLAYGROUND
            </div>

            <h2 className="mt-5 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Belajar huruf.
              <br />
              <span className="text-violet-300">Bina bunyi.</span>{" "}
              Baca perkataan.
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-7 text-indigo-100 md:text-lg">
              Aktiviti interaktif Bahasa Melayu untuk mengenal huruf,
              menguasai bunyi fonik, membina suku kata dan membaca dengan
              lebih yakin.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <HeroBadge icon={BookOpen} text="Membaca" />
              <HeroBadge icon={Volume2} text="Audio Fonik" />
              <HeroBadge icon={Grip} text="Drag & Drop" />
              <HeroBadge icon={PencilLine} text="Tracing" />
            </div>
          </div>
        </section>

        {/* =====================================================
            QUICK START
        ===================================================== */}

        <section className="mt-7 grid gap-4 md:grid-cols-3">
          <QuickCard
            number="01"
            title="Kenal Huruf"
            description="Mulakan dengan huruf, bunyi dan tracing."
            icon={LetterText}
            color="bg-violet-50 text-violet-600"
          />

          <QuickCard
            number="02"
            title="Bina Bunyi"
            description="Gabungkan bunyi kepada suku kata."
            icon={Volume2}
            color="bg-pink-50 text-pink-600"
          />

          <QuickCard
            number="03"
            title="Mula Membaca"
            description="Gabungkan suku kata menjadi perkataan."
            icon={BookOpen}
            color="bg-emerald-50 text-emerald-600"
          />
        </section>

        {/* =====================================================
            ACTIVITY HEADER
        ===================================================== */}

        <section className="mt-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-violet-500">
                Learning Games
              </p>

              <h2 className="mt-2 text-3xl font-black text-[#111936] md:text-4xl">
                Pilih Aktiviti
              </h2>

              <p className="mt-2 text-slate-500">
                Pilih permainan untuk mula belajar.
              </p>
            </div>

            <div className="relative w-full lg:w-[360px]">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari aktiviti..."
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 font-semibold outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
              />
            </div>
          </div>

          {/* CATEGORY */}

          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => {
              const active = selectedCategory === category;

              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold transition ${
                    active
                      ? "bg-[#111936] text-white shadow-lg"
                      : "border border-slate-200 bg-white text-slate-500 hover:border-violet-200 hover:text-violet-600"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </section>

        {/* =====================================================
            ACTIVITY GRID
        ===================================================== */}

        <section className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {filteredActivities.map((activity, index) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              index={index}
            />
          ))}
        </section>

        {filteredActivities.length === 0 && (
          <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-10 text-center">
            <Search className="mx-auto text-slate-300" size={36} />

            <h3 className="mt-4 text-xl font-black">
              Aktiviti tidak dijumpai
            </h3>

            <p className="mt-2 text-slate-500">
              Cuba kata carian atau kategori lain.
            </p>
          </div>
        )}

        {/* =====================================================
            ADMIN CREATED ACTIVITIES
        ===================================================== */}

        {loading ? (
          <div className="mt-10 flex items-center justify-center gap-3 rounded-[28px] bg-white p-7 text-slate-500">
            <Loader2 className="animate-spin text-violet-500" size={20} />
            Loading activities...
          </div>
        ) : dbActivities.length > 0 ? (
          <section className="mt-12">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-pink-500">
                  New Challenges
                </p>

                <h2 className="mt-2 text-3xl font-black">
                  Aktiviti Tambahan
                </h2>
              </div>

              <div className="rounded-full bg-pink-50 px-4 py-2 text-sm font-black text-pink-600">
                {dbActivities.length} aktiviti
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {dbActivities.map((activity) => (
                <DatabaseActivityCard
                  key={activity.id}
                  activity={activity}
                />
              ))}
            </div>
          </section>
        ) : null}

        {/* =====================================================
            READING FEATURE
        ===================================================== */}

        <section className="mt-12 overflow-hidden rounded-[32px] border border-violet-100 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[1fr_0.9fr]">
            <div className="p-7 md:p-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-4 py-2 text-xs font-black uppercase tracking-wider text-violet-600">
                <Sparkles size={15} />
                Featured
              </div>

              <h2 className="mt-5 text-3xl font-black md:text-4xl">
                Baca dengan gerakan jari
              </h2>

              <p className="mt-4 max-w-xl leading-7 text-slate-500">
                Anak boleh menggerakkan slider dari kiri ke kanan sambil
                membaca setiap bunyi. Huruf akan berubah warna mengikut
                kedudukan jari.
              </p>

              <div className="mt-6 space-y-3">
                <FeatureLine text="Gerakan jari interaktif" />
                <FeatureLine text="Huruf berubah warna satu demi satu" />
                <FeatureLine text="Audio bunyi fonik Bahasa Melayu" />
                <FeatureLine text="Pecahan suku kata automatik" />
              </div>

              <Link
                href="/huruf-membaca/baca-perkataan"
                className="mt-7 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 font-black text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5"
              >
                Mula Membaca
                <ArrowRight size={19} />
              </Link>
            </div>

            {/* MINI GAME PREVIEW */}

            <div className="flex items-center justify-center bg-gradient-to-br from-violet-50 via-indigo-50 to-pink-50 p-7 md:p-10">
              <div className="w-full max-w-[520px] rounded-[30px] border border-white bg-white/80 p-6 shadow-xl backdrop-blur">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-violet-500">
                    Baca Perkataan
                  </span>

                  <span className="rounded-full bg-yellow-50 px-3 py-1.5 text-sm font-black text-yellow-600">
                    ⭐ 24
                  </span>
                </div>

                <div className="mt-7 flex items-center justify-center gap-3 text-6xl font-black sm:text-7xl">
                  <span className="text-violet-600">b</span>
                  <span className="text-slate-300">a</span>
                  <span className="text-slate-300">j</span>
                  <span className="text-slate-300">u</span>
                </div>

                <div className="mt-8 rounded-full bg-slate-100 p-1.5">
                  <div className="relative h-8 w-[35%] rounded-full bg-gradient-to-r from-violet-600 to-purple-500">
                    <div className="absolute -right-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full border-[6px] border-violet-200 bg-white shadow-md" />
                  </div>
                </div>

                <div className="mt-7 grid grid-cols-3 gap-2">
                  <MiniWord text="ba" active />
                  <MiniWord text="ju" />
                  <MiniWord text="baju" />
                </div>

                <div className="mt-5 flex items-center justify-center gap-2 text-sm font-bold text-violet-600">
                  <Volume2 size={17} />
                  Ikut gerakan jari dan baca
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 py-7 text-sm text-slate-400 sm:flex-row">
          <span>FD Arcadia Learning Hub</span>

          <span className="flex items-center gap-2">
            <Languages size={15} />
            Bahasa Melayu Literacy
          </span>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   ACTIVITY CARD
========================================================= */

function ActivityCard({
  activity,
  index,
}: {
  activity: Activity;
  index: number;
}) {
  const Icon = activity.icon;

  return (
    <Link
      href={activity.available ? activity.href : "#"}
      className="group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl"
    >
      <div
        className={`absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r ${activity.color}`}
      />

      <div className="flex items-start justify-between">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${activity.iconBg}`}
        >
          <Icon size={26} strokeWidth={2.2} />
        </div>

        <span className="rounded-full bg-slate-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
          {activity.tag}
        </span>
      </div>

      <div className="mt-7">
        <span className="text-xs font-black text-slate-300">
          {String(index + 1).padStart(2, "0")}
        </span>

        <h3 className="mt-1 text-xl font-black text-[#111936]">
          {activity.title}
        </h3>

        <p className="mt-2 min-h-[66px] text-sm leading-6 text-slate-500">
          {activity.description}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-sm font-black text-violet-600">
          {activity.available ? "Mula Aktiviti" : "Akan Datang"}
        </span>

        {activity.available ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-50 text-violet-600 transition group-hover:bg-violet-600 group-hover:text-white">
            <ChevronRight size={18} />
          </div>
        ) : (
          <LockKeyhole size={18} className="text-slate-300" />
        )}
      </div>
    </Link>
  );
}

/* =========================================================
   DATABASE CARD
========================================================= */

function DatabaseActivityCard({
  activity,
}: {
  activity: ReadingGameActivity;
}) {
  const slug = activity.slug || activity.id;

  return (
    <Link
      href={`/huruf-membaca/game/${slug}`}
      className="group rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-pink-200 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-pink-500">
          <Gamepad2 size={23} />
        </div>

        {activity.difficulty && (
          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase text-emerald-600">
            {activity.difficulty}
          </span>
        )}
      </div>

      <h3 className="mt-5 text-xl font-black">
        {activity.title || "Aktiviti Membaca"}
      </h3>

      <p className="mt-2 line-clamp-2 min-h-[48px] text-sm leading-6 text-slate-500">
        {activity.description || "Aktiviti pembelajaran interaktif."}
      </p>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-sm font-black text-pink-500">
          Main Sekarang
        </span>

        <ChevronRight
          size={18}
          className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-pink-500"
        />
      </div>
    </Link>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function FloatingIcon({
  icon: Icon,
  color,
}: {
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 backdrop-blur">
      <Icon size={21} className={color} />
    </div>
  );
}

function HeroBadge({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) {
  return (
    <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-bold text-white/90 backdrop-blur">
      <Icon size={15} />
      {text}
    </span>
  );
}

function QuickCard({
  number,
  title,
  description,
  icon: Icon,
  color,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`flex h-13 w-13 min-h-[52px] min-w-[52px] items-center justify-center rounded-2xl ${color}`}
      >
        <Icon size={23} />
      </div>

      <div className="min-w-0">
        <span className="text-[10px] font-black tracking-widest text-slate-300">
          STEP {number}
        </span>

        <h3 className="font-black text-[#111936]">{title}</h3>

        <p className="mt-0.5 truncate text-sm text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function FeatureLine({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
        <CheckCircle2 size={16} />
      </div>

      {text}
    </div>
  );
}

function MiniWord({
  text,
  active = false,
}: {
  text: string;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-3 text-center font-black ${
        active
          ? "border-violet-300 bg-violet-50 text-violet-600"
          : "border-slate-200 bg-white text-slate-500"
      }`}
    >
      {text}
    </div>
  );
}