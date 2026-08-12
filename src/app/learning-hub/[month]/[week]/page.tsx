"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  Gift,
  Home,
  LayoutList,
  LockKeyhole,
  PlayCircle,
  Plus,
  Sparkles,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { ProtectedPage } from "@/components/ProtectedPage";
import { supabase } from "@/lib/supabase";

type WeekAtGlanceItem = {
  id: string;
  month_no: number;
  week_no: number;
  day: string;
  column_no: number | null;
  subject: string;
  title: string;
  description: string | null;
  time_start: string | null;
  time_end: string | null;
  button_type: string | null;
  button_text: string | null;
  link_url: string | null;
  thumbnail_url: string | null;
  difficulty: string | null;
  estimated_minutes: number | null;
  display_order: number | null;
  is_completed: boolean | null;
  is_active: boolean | null;
};

type DayConfig = {
  key: string;
  label: string;
  full: string;
  color: string;
  accent: string;
};

type SubjectConfig = {
  key: string;
  label: string;
  time: string;
  icon: string;
  headerClass: string;
};

type ButtonMeta = {
  icon: React.ElementType;
  label: string;
  className: string;
};

const dayConfigs: DayConfig[] = [
  {
    key: "MON",
    label: "MON",
    full: "Monday",
    color: "bg-yellow-200 text-slate-950",
    accent: "border-yellow-300",
  },
  {
    key: "TUE",
    label: "TUE",
    full: "Tuesday",
    color: "bg-emerald-100 text-emerald-950",
    accent: "border-emerald-300",
  },
  {
    key: "WED",
    label: "WED",
    full: "Wednesday",
    color: "bg-pink-100 text-pink-950",
    accent: "border-pink-300",
  },
  {
    key: "THU",
    label: "THU",
    full: "Thursday",
    color: "bg-orange-200 text-orange-950",
    accent: "border-orange-300",
  },
  {
    key: "FRI",
    label: "FRI",
    full: "Friday",
    color: "bg-blue-100 text-blue-950",
    accent: "border-blue-300",
  },
];

const subjectConfigs: SubjectConfig[] = [
  {
    key: "NOTES",
    label: "NOTES",
    time: "",
    icon: "📝",
    headerClass: "bg-white",
  },
  {
    key: "WARM-UP",
    label: "WARM-UP",
    time: "9:00 - 10:30am",
    icon: "☀️",
    headerClass: "bg-yellow-50",
  },
  {
    key: "SCIENCE",
    label: "SCIENCE",
    time: "10:30 - 11:00am",
    icon: "🧪",
    headerClass: "bg-sky-50",
  },
  {
    key: "MATH",
    label: "MATH",
    time: "11:15 - 12:30am",
    icon: "🔢",
    headerClass: "bg-indigo-50",
  },
  {
    key: "MEMBACA",
    label: "MEMBACA",
    time: "12:30 - 1:15pm",
    icon: "📖",
    headerClass: "bg-purple-50",
  },
  {
    key: "LANGUAGE & LITERACY",
    label: "LANGUAGE & LITERACY",
    time: "2:30 - 3:30pm",
    icon: "✏️",
    headerClass: "bg-pink-50",
  },
];

const sidebarLinks = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "My Children", href: "/children", icon: Users },
  { title: "Learning Hub", href: "/learning-hub", icon: BookOpenCheck },
  { title: "Freebies", href: "/freebies", icon: Gift },
];

const fallbackItems: WeekAtGlanceItem[] = [
  makeFallback("MON", "NOTES", "My Notes", "Write parent notes here.", "open", "Add", null, "📝"),
  makeFallback("MON", "WARM-UP", "My Family Flashcards", "Family picture talk.", "play", "Play", "9:00", "👨‍👩‍👧"),
  makeFallback("MON", "SCIENCE", "Family Photo Talk", "Talk about family photo.", "download", "Download", "10:30", "🖼️"),
  makeFallback("MON", "MATH", "All about number 1 - 5", "Recognise numbers.", "download", "Download", "11:15", "🔢"),
  makeFallback("MON", "MEMBACA", "Flashcard Buku 1", "Kad imbas membaca.", "download", "Download", "12:30", "📘"),
  makeFallback("MON", "LANGUAGE & LITERACY", "Body Part! This is me", "Vocabulary activity.", "play", "Play", "2:30", "🧒"),
  makeFallback("MON", "LANGUAGE & LITERACY", "Prewriting Straight Line", "Writing practice.", "download", "Download", "2:50", "✏️"),
  makeFallback("TUE", "NOTES", "", "", "open", "Add", null, "📝"),
  makeFallback("TUE", "WARM-UP", "Family Fingers", "Finger play activity.", "play", "Play", "9:00", "🖐️"),
  makeFallback("TUE", "SCIENCE", "Good / Bad Choice", "Decision making.", "download", "Download", "10:30", "✅"),
  makeFallback("TUE", "MATH", "Sensory SAND TRAY", "Number sensory activity.", "download", "Download", "11:15", "🏖️"),
  makeFallback("TUE", "MEMBACA", "Phonic C", "Alphabet sound C.", "download", "Download", "12:30", "ABC"),
  makeFallback("TUE", "LANGUAGE & LITERACY", "Prewriting : C Alphabet", "Trace letter C.", "download", "Download", "2:30", "C"),
  makeFallback("TUE", "LANGUAGE & LITERACY", "Alphabet Match & Cover", "Match alphabet cards.", "download", "Download", "2:50", "🔤"),
  makeFallback("WED", "NOTES", "", "", "open", "Add", null, "📝"),
  makeFallback("WED", "WARM-UP", "Family Fingers", "Activity 2 & 3.", "play", "Play", "9:00", "🖐️"),
  makeFallback("WED", "SCIENCE", "I can smell Activity", "Sense of smell.", "worksheet", "Worksheet", "10:30", "👃"),
  makeFallback("WED", "MATH", "All about number 6 - 10", "Recognise numbers.", "download", "Download", "11:15", "🔢"),
  makeFallback("WED", "MEMBACA", "Huruf & Bunyi Nn", "Konsonan.", "worksheet", "Worksheet", "12:30", "Nn"),
  makeFallback("WED", "LANGUAGE & LITERACY", "Prewriting : D Alphabet", "Trace letter D.", "download", "Download", "2:30", "D"),
  makeFallback("WED", "LANGUAGE & LITERACY", "Color by code activity", "a-d letters.", "download", "Download", "2:50", "🖍️"),
  makeFallback("THU", "NOTES", "", "", "open", "Add", null, "📝"),
  makeFallback("THU", "WARM-UP", "Sort the smell", "Sorting activity.", "download", "Download", "9:00", "♨️"),
  makeFallback("THU", "SCIENCE", "My Organs", "Human organs.", "download", "Download", "10:30", "🫁"),
  makeFallback("THU", "MATH", "Why do I have bones?", "Human bones.", "download", "Download", "11:15", "🦴"),
  makeFallback("THU", "MEMBACA", "Huruf & Bunyi Bb", "Konsonan.", "worksheet", "Worksheet", "12:30", "Bb"),
  makeFallback("THU", "LANGUAGE & LITERACY", "A is for", "Letter A activity.", "download", "Download", "2:30", "A"),
  makeFallback("THU", "LANGUAGE & LITERACY", "B is for", "Letter B activity.", "download", "Download", "2:50", "B"),
  makeFallback("THU", "LANGUAGE & LITERACY", "My Family Drawing", "Draw family members.", "download", "Download", "3:10", "👨‍👩‍👧"),
  makeFallback("FRI", "NOTES", "Alphabet Dot", "Dot tracing activity.", "download", "Download", "9:00", "A"),
  makeFallback("FRI", "WARM-UP", "Family Puzzle", "Puzzle activity.", "download", "Download", "9:00", "🧩"),
  makeFallback("FRI", "SCIENCE", "Basic Human Needs", "Food, water, shelter.", "download", "Download", "10:30", "🏠"),
  makeFallback("FRI", "MATH", "Say It, Build It, Count It!", "Build numbers.", "download", "Download", "11:15", "123"),
  makeFallback("FRI", "MEMBACA", "Ulangan Membaca", "Cutting skills.", "worksheet", "Worksheet 1", "12:30", "✂️"),
  makeFallback("FRI", "LANGUAGE & LITERACY", "My 5 Sense", "Senses activity.", "play", "Play", "2:30", "👁️"),
  makeFallback("FRI", "LANGUAGE & LITERACY", "Amazing Work!", "Celebrate learning.", "open", "Open", "3:10", "⭐"),
];

function makeFallback(
  day: string,
  subject: string,
  title: string,
  description: string,
  buttonType: string,
  buttonText: string,
  timeStart: string | null,
  icon: string
): WeekAtGlanceItem {
  return {
    id: `fallback-${day}-${subject}-${title || Math.random()}`,
    month_no: 1,
    week_no: 1,
    day,
    column_no: 1,
    subject,
    title,
    description,
    time_start: timeStart,
    time_end: null,
    button_type: buttonType,
    button_text: buttonText,
    link_url: null,
    thumbnail_url: icon,
    difficulty: null,
    estimated_minutes: null,
    display_order: 0,
    is_completed: false,
    is_active: true,
  };
}

function getRouteNumber(value: string | string[] | undefined, prefix: string) {
  const text = Array.isArray(value) ? value[0] : value || "";
  return Number(text.replace(prefix, ""));
}

function normalize(value: string | null | undefined) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
}

function normalizeDay(value: string | null | undefined) {
  const key = normalize(value);
  if (key.startsWith("MON")) return "MON";
  if (key.startsWith("TUE")) return "TUE";
  if (key.startsWith("WED")) return "WED";
  if (key.startsWith("THU")) return "THU";
  if (key.startsWith("FRI")) return "FRI";
  return key || "MON";
}

function normalizeSubject(value: string | null | undefined) {
  const key = normalize(value);
  if (key.includes("WARM")) return "WARM-UP";
  if (key.includes("SCIENCE")) return "SCIENCE";
  if (key.includes("MATH")) return "MATH";
  if (key.includes("MEMBACA") || key.includes("BM")) return "MEMBACA";
  if (key.includes("LANGUAGE") || key.includes("LITERACY")) return "LANGUAGE & LITERACY";
  if (key.includes("NOTE")) return "NOTES";
  return key || "NOTES";
}

function getButtonMeta(type: string | null | undefined): ButtonMeta {
  const key = normalize(type);

  if (key.includes("PLAY") || key.includes("VIDEO") || key.includes("WATCH")) {
    return {
      icon: PlayCircle,
      label: "Play",
      className: "bg-indigo-600 text-white hover:bg-indigo-700",
    };
  }

  if (key.includes("WORKSHEET")) {
    return {
      icon: FileText,
      label: "Worksheet",
      className: "bg-yellow-200 text-yellow-900 hover:bg-yellow-300",
    };
  }

  if (key.includes("OPEN") || key.includes("LINK")) {
    return {
      icon: ExternalLink,
      label: "Open",
      className: "bg-purple-100 text-purple-700 hover:bg-purple-200",
    };
  }

  return {
    icon: Download,
    label: "Download",
    className: "bg-white text-indigo-700 hover:bg-indigo-50",
  };
}

export default function WeekPage() {
  return (
    <ProtectedPage>
      {() => <WeekAtGlanceContent />}
    </ProtectedPage>
  );
}

function WeekAtGlanceContent() {
  const params = useParams();

  const monthNo = getRouteNumber(params.month as string, "month-");
  const weekNo = getRouteNumber(params.week as string, "week-");
  const monthParam = `month-${monthNo || 1}`;

  const [items, setItems] = useState<WeekAtGlanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDemoIfEmpty, setShowDemoIfEmpty] = useState(true);

  useEffect(() => {
    async function loadItems() {
      setLoading(true);

      const { data, error } = await supabase
        .from("learning_hub_week_items")
        .select("*")
        .eq("month_no", monthNo)
        .eq("week_no", weekNo)
        .eq("is_active", true)
        .order("day", { ascending: true })
        .order("column_no", { ascending: true })
        .order("display_order", { ascending: true });

      if (error) {
        console.log(error);
        setLoading(false);
        return;
      }

      setItems((data || []) as WeekAtGlanceItem[]);
      setLoading(false);
    }

    if (monthNo && weekNo) {
      loadItems();
    } else {
      setLoading(false);
    }
  }, [monthNo, weekNo]);

  const displayItems = items.length > 0 ? items : showDemoIfEmpty ? fallbackItems : [];

  const itemsByCell = useMemo(() => {
    const map = new Map<string, WeekAtGlanceItem[]>();

    displayItems.forEach((item) => {
      const day = normalizeDay(item.day);
      const subject = normalizeSubject(item.subject);
      const key = `${day}__${subject}`;

      const current = map.get(key) || [];
      current.push(item);
      map.set(key, current);
    });

    return map;
  }, [displayItems]);

  const readyItems = displayItems.filter((item) => Boolean(item.link_url)).length;
  const progress = displayItems.length ? Math.round((readyItems / displayItems.length) * 100) : 0;

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <div className="grid min-h-screen xl:grid-cols-[250px_minmax(0,1fr)]">
        <ParentSidebar monthNo={monthNo} weekNo={weekNo} monthParam={monthParam} progress={items.length ? progress : 75} />

        <section className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">
          <TopHeader monthNo={monthNo} weekNo={weekNo} monthParam={monthParam} />

          <section className="mb-5 grid gap-3 sm:grid-cols-3">
            <SmallStat label="Activities" value={String(displayItems.length)} />
            <SmallStat label="Ready Links" value={String(readyItems)} />
            <SmallStat label={items.length ? "Progress" : "Demo Preview"} value={items.length ? `${progress}%` : "ON"} />
          </section>

          {loading ? (
            <LoadingState />
          ) : displayItems.length === 0 ? (
            <EmptyState monthNo={monthNo} weekNo={weekNo} />
          ) : (
            <>
              {items.length === 0 ? (
                <div className="mb-5 flex flex-col gap-3 rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-900 sm:flex-row sm:items-center sm:justify-between">
                  Demo preview is showing because admin has not uploaded Week At A Glance items yet.
                  <button
                    type="button"
                    onClick={() => setShowDemoIfEmpty(false)}
                    className="rounded-xl bg-white px-3 py-2 text-[10px] font-black text-amber-800 shadow-sm"
                  >
                    Hide demo
                  </button>
                </div>
              ) : null}

              <WeekGrid itemsByCell={itemsByCell} />
            </>
          )}

          <BottomGuide />
        </section>
      </div>
    </main>
  );
}

function ParentSidebar({
  monthNo,
  weekNo,
  monthParam,
  progress,
}: {
  monthNo: number;
  weekNo: number;
  monthParam: string;
  progress: number;
}) {
  return (
    <aside className="hidden border-r border-indigo-950/10 bg-[#111735] px-4 py-6 text-white xl:flex xl:flex-col">
      <Link href="/dashboard" className="flex items-center gap-3 px-2">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-indigo-950/30">
          <Sparkles size={26} />
        </div>

        <div>
          <p className="text-sm font-black tracking-[0.08em] text-white">
            FD ARCADIA
          </p>
          <p className="text-[9px] font-black tracking-[0.2em] text-violet-300">
            LEARNING HUB
          </p>
        </div>
      </Link>

      <nav className="mt-8 space-y-1.5">
        {sidebarLinks.map((item) => {
          const Icon = item.icon;
          const active = item.title === "Learning Hub";

          return (
            <Link
              key={item.title}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-black transition ${
                active
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-950/20"
                  : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <Icon size={22} />
              {item.title}
            </Link>
          );
        })}

        <p className="mb-2 mt-7 px-3 text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">
          MONTH {monthNo || "-"}
        </p>

        {[1, 2, 3, 4].map((week) => (
          <Link
            key={week}
            href={`/learning-hub/${monthParam}/week-${week}`}
            className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition ${
              week === weekNo
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-950/20"
                : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <span>Week {week}</span>
            {week === weekNo ? (
              <span className="h-2.5 w-2.5 rounded-full bg-violet-400" />
            ) : week < weekNo ? (
              <CheckCircle2 size={18} className="text-emerald-400" />
            ) : (
              <Clock3 size={18} className="text-slate-500" />
            )}
          </Link>
        ))}
      </nav>

      <div className="mt-auto rounded-[18px] border border-white/10 bg-white/[0.05] p-4 text-white">
        <Star className="text-yellow-300" size={17} />
        <p className="mt-3 text-xs font-black">Learning Journey</p>
        <h3 className="mt-1 text-lg font-black">Keep going!</h3>
        <p className="mt-1 text-[10px] leading-5 text-slate-400">
          Week {weekNo || "-"} is {progress}% ready.
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-400 to-indigo-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <Link
          href={`/learning-hub/${monthParam}`}
          className="mt-3 inline-flex items-center text-[10px] font-black text-violet-300 transition hover:text-white"
        >
          Back Month
        </Link>
      </div>

      <div className="mt-4 rounded-[18px] border border-white/10 bg-white/[0.04] p-4">
        <h3 className="text-xs font-black text-white">Need Help?</h3>
        <p className="mt-1 text-[10px] leading-5 text-slate-400">
          Contact FD Arcadia admin if any file link cannot open.
        </p>
        <Link
          href="/pricing"
          className="mt-3 inline-flex text-[10px] font-black text-violet-300 transition hover:text-white"
        >
          Contact Us
        </Link>
      </div>
    </aside>
  );
}

function TopHeader({
  monthNo,
  weekNo,
  monthParam,
}: {
  monthNo: number;
  weekNo: number;
  monthParam: string;
}) {
  return (
    <header className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div>
        <Link
          href={`/learning-hub/${monthParam}`}
          className="inline-flex items-center gap-2 text-xs font-black text-indigo-600 transition hover:text-indigo-700"
        >
          <ArrowLeft size={14} />
          Back to Month {monthNo || "-"}
        </Link>

        <p className="mt-3 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500">
          FD Arcadia Learning Hub
        </p>

        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Week {weekNo || "-"} at a Glance
        </h1>

        <p className="mt-1 text-sm font-semibold text-slate-400">
          Month {monthNo || "-"} • Daily activities, files and learning resources.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">
            Week Of
          </p>
          <div className="mt-1 flex items-center gap-2 text-xs font-black text-slate-700">
            <CalendarDays size={14} className="text-indigo-500" />
            Set in Admin
          </div>
        </div>

        <Link
          href={`/learning-hub/${monthParam}`}
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-4 text-xs font-black text-indigo-700 transition hover:bg-indigo-100"
        >
          <LayoutList size={15} />
          Month View
        </Link>

        <Link
          href="/dashboard"
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-black text-white transition hover:bg-slate-800"
        >
          <Home size={15} />
          Dashboard
        </Link>
      </div>
    </header>
  );
}

function WeekGrid({
  itemsByCell,
}: {
  itemsByCell: Map<string, WeekAtGlanceItem[]>;
}) {
  return (
    <section className="overflow-x-auto pb-2">
      <div className="min-w-[1320px] rounded-[22px] border border-slate-200 bg-white p-3 shadow-sm">
        <div className="grid grid-cols-[80px_130px_180px_180px_180px_180px_70px_340px] gap-2">
          <div className="rounded-2xl bg-white" />

          {subjectConfigs.slice(0, 5).map((subject) => (
            <SubjectHeader key={subject.key} subject={subject} />
          ))}

          <div className="grid place-items-center rounded-[16px] bg-amber-100 px-2 py-4 text-center text-xs font-black tracking-wide text-amber-900 [writing-mode:vertical-rl] rotate-180">
            LUNCH & REST
            <span className="mt-2 text-xs font-bold">1:15 - 2:30pm</span>
          </div>

          <SubjectHeader subject={subjectConfigs[5]} />
        </div>

        <div className="mt-2 grid grid-cols-[80px_130px_180px_180px_180px_180px_70px_340px] gap-2">
          {dayConfigs.map((day) => (
            <RowForDay key={day.key} day={day} itemsByCell={itemsByCell} />
          ))}
        </div>
      </div>
    </section>
  );
}

function RowForDay({
  day,
  itemsByCell,
}: {
  day: DayConfig;
  itemsByCell: Map<string, WeekAtGlanceItem[]>;
}) {
  return (
    <>
      <div
        className={`grid min-h-[142px] place-items-center rounded-[16px] px-3 py-4 text-center font-black ${day.color}`}
      >
        <span className="[writing-mode:vertical-rl] rotate-180 text-sm tracking-[0.1em]">
          {day.label}
        </span>
      </div>

      {subjectConfigs.slice(0, 5).map((subject) => {
        const cellItems = itemsByCell.get(`${day.key}__${subject.key}`) || [];

        return (
          <ActivityCell
            key={`${day.key}-${subject.key}`}
            items={cellItems}
            subject={subject}
            day={day}
          />
        );
      })}

      <div className="min-h-[142px] rounded-[16px] bg-amber-50" />

      <LanguageCell day={day} itemsByCell={itemsByCell} />
    </>
  );
}

function LanguageCell({
  day,
  itemsByCell,
}: {
  day: DayConfig;
  itemsByCell: Map<string, WeekAtGlanceItem[]>;
}) {
  const languageItems = itemsByCell.get(`${day.key}__LANGUAGE & LITERACY`) || [];

  if (languageItems.length === 0) {
    return (
      <div className="grid min-h-[150px] grid-cols-2 gap-2">
        <EmptyMiniCell label="Language" />
        <EmptyMiniCell label="Literacy" />
      </div>
    );
  }

  return (
    <div className="grid min-h-[150px] grid-cols-2 gap-2">
      {languageItems.slice(0, 4).map((item) => (
        <ActivityMiniCard key={item.id} item={item} compact />
      ))}

      {languageItems.length === 1 ? <EmptyMiniCell label="Extra Activity" /> : null}
    </div>
  );
}

function SubjectHeader({ subject }: { subject: SubjectConfig }) {
  return (
    <div
      className={`rounded-[16px] border border-slate-200 px-3 py-3 text-center ${subject.headerClass}`}
    >
      <div className="text-2xl">{subject.icon}</div>
      <h3 className="mt-1 text-sm font-black text-slate-900">
        {subject.label}
      </h3>
      {subject.time ? (
        <p className="mt-1 text-[9px] font-bold text-slate-400">{subject.time}</p>
      ) : null}
    </div>
  );
}

function ActivityCell({
  items,
  subject,
  day,
}: {
  items: WeekAtGlanceItem[];
  subject: SubjectConfig;
  day: DayConfig;
}) {
  if (items.length === 0) {
    return <EmptyMiniCell label={subject.key === "NOTES" ? "Notes" : "No activity"} />;
  }

  return (
    <div className="grid min-h-[150px] gap-2">
      {items.map((item) => (
        <ActivityMiniCard key={`${day.key}-${subject.key}-${item.id}`} item={item} />
      ))}
    </div>
  );
}

function EmptyMiniCell({ label }: { label: string }) {
  return (
    <div className="grid min-h-[142px] place-items-center rounded-[16px] border border-dashed border-slate-200 bg-slate-50 p-3">
      <div className="text-center">
        <p className="text-xs font-bold text-slate-300">{label}</p>
        <div className="mx-auto mt-3 grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-300">
          <Plus size={16} />
        </div>
      </div>
    </div>
  );
}

function ActivityMiniCard({
  item,
  compact,
}: {
  item: WeekAtGlanceItem;
  compact?: boolean;
}) {
  const button = getButtonMeta(item.button_type);
  const ButtonIcon = button.icon;
  const hasLink = Boolean(item.link_url);
  const isEmojiThumb = item.thumbnail_url && item.thumbnail_url.length <= 4;

  return (
    <article
      className={`relative rounded-[16px] border border-slate-200 bg-white p-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md ${
        compact ? "min-h-[150px]" : "min-h-[150px]"
      }`}
    >
      {item.thumbnail_url ? (
        isEmojiThumb ? (
          <div className="mx-auto grid h-12 w-14 place-items-center rounded-xl bg-indigo-50 text-3xl">
            {item.thumbnail_url}
          </div>
        ) : (
          <img
            src={item.thumbnail_url}
            alt=""
            className="mx-auto h-12 w-16 rounded-xl object-cover"
          />
        )
      ) : (
        <div className="mx-auto grid h-12 w-14 place-items-center rounded-xl bg-indigo-50 text-3xl">
          {getSubjectEmoji(item.subject)}
        </div>
      )}

      <h4 className="mt-2 line-clamp-2 text-xs font-black leading-4 text-slate-900">
        {item.title || "Untitled"}
      </h4>

      {item.description ? (
        <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500">
          {item.description}
        </p>
      ) : null}

      <div className="mt-2 flex flex-wrap justify-center gap-1">
        {item.time_start || item.time_end ? (
          <span className="rounded-full bg-indigo-50 px-2 py-1 text-[9px] font-black text-indigo-700">
            {item.time_start || ""} {item.time_end ? `- ${item.time_end}` : ""}
          </span>
        ) : null}

        {item.difficulty ? (
          <span className="rounded-full bg-amber-50 px-2 py-1 text-[9px] font-black text-amber-700">
            {item.difficulty}
          </span>
        ) : null}

        {item.estimated_minutes ? (
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-black text-emerald-700">
            {item.estimated_minutes} min
          </span>
        ) : null}
      </div>

      {hasLink ? (
        <a
          href={item.link_url || "#"}
          target="_blank"
          rel="noreferrer"
          className={`mx-auto mt-3 inline-flex h-8 items-center justify-center gap-1 rounded-xl px-3 text-[10px] font-black shadow-sm transition ${button.className}`}
        >
          <ButtonIcon size={15} />
          {item.button_text || button.label}
        </a>
      ) : (
        <div className="mx-auto mt-3 inline-flex h-8 items-center justify-center gap-1 rounded-xl bg-slate-100 px-3 text-[10px] font-black text-slate-400">
          <ButtonIcon size={15} />
          {item.button_text || button.label}
        </div>
      )}
    </article>
  );
}

function getSubjectEmoji(subject: string | null | undefined) {
  const key = normalizeSubject(subject);
  if (key === "WARM-UP") return "☀️";
  if (key === "SCIENCE") return "🧪";
  if (key === "MATH") return "🔢";
  if (key === "MEMBACA") return "📖";
  if (key === "LANGUAGE & LITERACY") return "✏️";
  if (key === "NOTES") return "📝";
  return "📌";
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">
        {label.toUpperCase()}
      </p>
      <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
      <p className="mt-4 font-bold text-slate-500">Loading week content...</p>
    </div>
  );
}

function EmptyState({
  monthNo,
  weekNo,
}: {
  monthNo: number;
  weekNo: number;
}) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-10 text-center shadow-sm">
      <FileText className="mx-auto text-slate-400" size={44} />

      <h2 className="mt-3 text-2xl font-black text-slate-600">
        No Week At A Glance Content Yet
      </h2>

      <p className="mx-auto mt-2 max-w-xl text-slate-500">
        No activities uploaded for Month {monthNo || "-"} Week {weekNo || "-"}.
        Add content later from the admin page.
      </p>
    </div>
  );
}

function BottomGuide() {
  return (
    <section className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.7fr]">
      <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">How to use?</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Click the button in each box to open the activity, worksheet, video
              or learning resource.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-black text-slate-500">
          <span className="inline-flex items-center gap-2">
            <PlayCircle size={18} className="text-indigo-600" />
            Play Video
          </span>
          <span className="inline-flex items-center gap-2">
            <Download size={18} className="text-indigo-600" />
            Download / Open
          </span>
          <span className="inline-flex items-center gap-2">
            <ExternalLink size={18} className="text-indigo-600" />
            Open Link
          </span>
        </div>
      </div>
    </section>
  );
}