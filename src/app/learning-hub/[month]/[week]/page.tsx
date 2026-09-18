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
  visibility?: "shared" | "parent" | null;
};

type LearningHubItemProgress = {
  item_id: string;
  downloaded: boolean | null;
  completed: boolean | null;
  completed_at: string | null;
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
      className: "bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:bg-indigo-100",
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
  const [progressMap, setProgressMap] = useState<Record<string, LearningHubItemProgress>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(true);
  const [savingItemId, setSavingItemId] = useState<string | null>(null);
  const [showDemoIfEmpty, setShowDemoIfEmpty] = useState(true);
  const [progressError, setProgressError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setItems([]);
        setLoading(false);
        return;
      }

      // Shared content is visible to everyone who can access this week.
      const {
        data: sharedData,
        error: sharedError,
      } = await supabase
        .from("learning_hub_week_items")
        .select("*")
        .eq("month_no", monthNo)
        .eq("week_no", weekNo)
        .eq("is_active", true)
        .eq("visibility", "shared")
        .order("day", { ascending: true })
        .order("column_no", { ascending: true })
        .order("display_order", { ascending: true });

      if (sharedError) {
        console.error("Learning Hub shared items error:", sharedError);
        setItems([]);
        setLoading(false);
        return;
      }

      // Personalised items are only returned when explicitly assigned
      // to the currently logged-in parent.
      const {
        data: assignmentData,
        error: assignmentError,
      } = await supabase
        .from("learning_hub_item_assignments")
        .select("item_id")
        .eq("parent_id", user.id);

      if (assignmentError) {
        console.error(
          "Learning Hub personalised assignment error:",
          assignmentError,
        );
        setItems((sharedData || []) as WeekAtGlanceItem[]);
        setLoading(false);
        return;
      }

      const assignedItemIds = (assignmentData || [])
        .map((row) => row.item_id)
        .filter(Boolean);

      let personalisedItems: WeekAtGlanceItem[] = [];

      if (assignedItemIds.length > 0) {
        const {
          data: personalisedData,
          error: personalisedError,
        } = await supabase
          .from("learning_hub_week_items")
          .select("*")
          .in("id", assignedItemIds)
          .eq("month_no", monthNo)
          .eq("week_no", weekNo)
          .eq("is_active", true)
          .eq("visibility", "parent");

        if (personalisedError) {
          console.error(
            "Learning Hub personalised items error:",
            personalisedError,
          );
        } else {
          personalisedItems = (personalisedData || []) as WeekAtGlanceItem[];
        }
      }

      const merged = [...(sharedData || []), ...personalisedItems];

      const uniqueItems = Array.from(
        new Map(merged.map((item) => [item.id, item])).values(),
      ).sort((a, b) => {
        const dayCompare = a.day.localeCompare(b.day);
        if (dayCompare !== 0) return dayCompare;

        const columnA = a.column_no ?? 999;
        const columnB = b.column_no ?? 999;
        if (columnA !== columnB) return columnA - columnB;

        return (a.display_order ?? 0) - (b.display_order ?? 0);
      });

      if (cancelled) return;

      setItems(uniqueItems);
      setLoading(false);
    }

    if (monthNo && weekNo) {
      loadItems();
    } else {
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [monthNo, weekNo]);

  useEffect(() => {
    let cancelled = false;

    async function loadProgress() {
      setProgressLoading(true);
      setProgressError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (!user) {
        setUserId(null);
        setProgressMap({});
        setProgressLoading(false);
        return;
      }

      setUserId(user.id);

      if (items.length === 0) {
        setProgressMap({});
        setProgressLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("learning_hub_item_progress")
        .select("item_id,downloaded,completed,completed_at")
        .eq("parent_id", user.id)
        .in("item_id", items.map((item) => item.id));

      if (cancelled) return;

      if (error) {
        console.error("Learning Hub item progress error:", error);
        setProgressMap({});
        setProgressError(error.message);
        setProgressLoading(false);
        return;
      }

      const nextMap: Record<string, LearningHubItemProgress> = {};
      ((data || []) as LearningHubItemProgress[]).forEach((row) => {
        nextMap[row.item_id] = row;
      });

      setProgressMap(nextMap);
      setProgressLoading(false);
    }

    loadProgress();

    return () => {
      cancelled = true;
    };
  }, [items]);

  const displayItems =
    items.length > 0 ? items : showDemoIfEmpty ? fallbackItems : [];

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

  const completedCount = items.filter(
    (item) => progressMap[item.id]?.completed === true
  ).length;

  const downloadedCount = items.filter(
    (item) => progressMap[item.id]?.downloaded === true
  ).length;

  const readyItems = displayItems.filter((item) => Boolean(item.link_url)).length;

  // Only "Mark as Done" contributes to learning progress.
  const progress = items.length
    ? Math.round((completedCount / items.length) * 100)
    : 0;

  async function saveItemProgress(
    itemId: string,
    patch: Partial<LearningHubItemProgress>
  ) {
    if (!userId || !items.some((item) => item.id === itemId)) return false;

    setSavingItemId(itemId);
    setProgressError("");

    const current = progressMap[itemId];

    const payload = {
      parent_id: userId,
      item_id: itemId,
      downloaded: Boolean(current?.downloaded) || Boolean(patch.downloaded),
      completed: Boolean(current?.completed) || Boolean(patch.completed),
      completed_at:
        patch.completed === true
          ? new Date().toISOString()
          : current?.completed_at ?? null,
    };

    const { data, error } = await supabase
      .from("learning_hub_item_progress")
      .upsert(payload, { onConflict: "parent_id,item_id" })
      .select("item_id,downloaded,completed,completed_at")
      .single();

    setSavingItemId(null);

    if (error) {
      console.error("Unable to save Learning Hub progress:", error);
      setProgressError(error.message);
      return false;
    }

    setProgressMap((currentMap) => ({
      ...currentMap,
      [itemId]: data as LearningHubItemProgress,
    }));

    return true;
  }

  async function handleResourceClick(item: WeekAtGlanceItem) {
    if (!item.link_url || item.id.startsWith("fallback-")) return;
    await saveItemProgress(item.id, { downloaded: true });
  }

  async function handleMarkDone(item: WeekAtGlanceItem) {
    if (item.id.startsWith("fallback-")) return;
    await saveItemProgress(item.id, { completed: true });
  }

  return (
    <main className="min-h-screen bg-[#f8f9fd] text-slate-900">
      <section className="mx-auto w-full max-w-[1500px] min-w-0 px-3 py-4 sm:px-5 sm:py-6 lg:px-8 xl:px-10">
          <TopHeader
            monthNo={monthNo}
            weekNo={weekNo}
            monthParam={monthParam}
          />

          <section className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <SmallStat label="Activities" value={String(displayItems.length)} icon={<FileText size={22} />} />
            <SmallStat label="Completed" value={items.length ? String(completedCount) : "—"} icon={<CheckCircle2 size={23} />} />
            <SmallStat label="Progress" value={items.length ? `${progress}%` : "0%"} icon={<Trophy size={22} />} />
            <div className="flex min-h-[82px] items-center gap-3 rounded-[1.25rem] border border-indigo-100 bg-white px-4 py-3 shadow-sm sm:px-5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-2xl">🌱</div>
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-900">Keep going!</p>
                <p className="mt-0.5 text-xs leading-5 text-slate-500">Small steps make big progress.</p>
              </div>
            </div>
          </section>

          {progressError ? (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              Progress could not be saved or loaded. Please refresh and try again.
            </div>
          ) : null}

          {loading ? (
            <LoadingState />
          ) : displayItems.length === 0 ? (
            <EmptyState monthNo={monthNo} weekNo={weekNo} />
          ) : (
            <>
              {items.length === 0 ? (
                <div className="mb-4 rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-bold text-yellow-900">
                  Demo preview is showing because admin has not uploaded Week At
                  A Glance items yet.
                  <button
                    type="button"
                    onClick={() => setShowDemoIfEmpty(false)}
                    className="ml-2 mt-2 rounded-xl bg-white px-3 py-2 font-black text-yellow-900 sm:mt-0"
                  >
                    Hide demo
                  </button>
                </div>
              ) : null}

              <WeekGrid
                itemsByCell={itemsByCell}
                progressMap={progressMap}
                savingItemId={savingItemId}
                onResourceClick={handleResourceClick}
                onMarkDone={handleMarkDone}
                progressLoading={progressLoading}
              />
            </>
          )}

          <BottomGuide />
      </section>
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
    <aside className="hidden border-r border-indigo-100 bg-white p-5 xl:block">
      <Link href="/dashboard" className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-600 text-yellow-200 shadow-lg">
          <Sparkles size={24} />
        </div>
        <div>
          <p className="text-lg font-black tracking-[0.16em] text-slate-900">FD ARCADIA</p>
          <p className="text-xs font-black tracking-[0.22em] text-indigo-600">LEARNING HUB</p>
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
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-black transition ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-indigo-700"
              }`}
            >
              <Icon size={19} />
              {item.title}
            </Link>
          );
        })}

        <p className="mb-1 mt-5 text-[10px] font-black tracking-[0.2em] text-slate-400">
          MONTH {monthNo || "-"}
        </p>

        {[1, 2, 3, 4].map((week) => (
          <Link
            key={week}
            href={`/learning-hub/${monthParam}/week-${week}`}
            className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-black transition ${
              week === weekNo
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
            }`}
          >
            <span>Week {week}</span>
            {week === weekNo ? (
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
            ) : week < weekNo ? (
              <CheckCircle2 size={17} className="text-emerald-600" />
            ) : (
              <Clock3 size={17} className="text-yellow-600" />
            )}
          </Link>
        ))}
      </nav>

      <div className="mt-7 rounded-[1.5rem] bg-gradient-to-br from-indigo-600 to-violet-700 p-5 text-white shadow-lg">
        <Star className="text-yellow-200" size={25} />
        <p className="mt-3 text-sm font-black">Learning Journey</p>
        <h3 className="mt-1 text-lg font-black">Keep going!</h3>
        <p className="mt-1 text-xs text-indigo-100">
          Week {weekNo || "-"} is {progress}% complete.
        </p>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-yellow-200 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <Link
          href={`/learning-hub/${monthParam}`}
          className="mt-4 inline-flex rounded-lg bg-white px-4 py-2.5 text-sm font-black text-indigo-700"
        >
          Back Month
        </Link>
      </div>

      <div className="mt-5 rounded-[1.5rem] bg-yellow-50 p-5 shadow-sm">
        <h3 className="text-sm font-black text-slate-900">Need Help?</h3>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          Contact FD Arcadia admin if any file link cannot open.
        </p>
        <Link
          href="/pricing"
          className="mt-3 inline-flex rounded-lg bg-white px-4 py-2.5 text-sm font-black text-indigo-700"
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
    <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <Link
          href={`/learning-hub/${monthParam}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 transition hover:text-indigo-800 sm:text-base"
        >
          <ArrowLeft size={18} />
          Back to Month {monthNo || "-"}
        </Link>

        <p className="mt-4 text-[11px] font-black tracking-[0.16em] text-indigo-500 sm:text-xs">
          FD ARCADIA LEARNING HUB
        </p>
        <h1 className="mt-1 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
          Week {weekNo || "-"} at a Glance
        </h1>
        <p className="mt-1 text-sm text-slate-500 sm:text-base">
          Month {monthNo || "-"} • Daily activities, files and learning resources.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:pt-8">
        <div className="rounded-2xl border border-indigo-100 bg-white px-4 py-3 shadow-sm">
          <p className="text-[9px] font-black tracking-[0.16em] text-indigo-400">WEEK OF</p>
          <div className="mt-1 flex items-center gap-2 text-sm font-black text-slate-800">
            <CalendarDays size={16} className="text-indigo-500" />
            Set in Admin
          </div>
        </div>

        <Link
          href={`/learning-hub/${monthParam}`}
          className="inline-flex min-h-14 items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 text-sm font-black text-indigo-600 shadow-sm transition hover:bg-indigo-100"
        >
          <LayoutList size={18} />
          Month View
        </Link>

        <Link
          href="/dashboard"
          className="inline-flex min-h-14 items-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-black text-white shadow-sm transition hover:bg-indigo-700"
        >
          <Home size={18} />
          Dashboard
        </Link>
      </div>
    </header>
  );
}

function WeekGrid({
  itemsByCell,
  progressMap,
  savingItemId,
  onResourceClick,
  onMarkDone,
  progressLoading,
}: {
  itemsByCell: Map<string, WeekAtGlanceItem[]>;
  progressMap: Record<string, LearningHubItemProgress>;
  savingItemId: string | null;
  onResourceClick: (item: WeekAtGlanceItem) => void;
  onMarkDone: (item: WeekAtGlanceItem) => void;
  progressLoading: boolean;
}) {
  const cardProps = {
    progressMap,
    savingItemId,
    onResourceClick,
    onMarkDone,
    progressLoading,
  };

  return (
    <>
      {/* Desktop / large laptop: compact timetable. */}
      <section className="hidden xl:block">
        <div className="overflow-x-auto rounded-[1.5rem] border border-indigo-100 bg-white p-2 shadow-sm">
          <div className="min-w-[1080px]">
            <div className="grid grid-cols-[58px_repeat(5,minmax(145px,1fr))_52px_minmax(220px,1.3fr)] gap-1.5">
              <div />
              {subjectConfigs.slice(0, 5).map((subject) => (
                <SubjectHeader key={subject.key} subject={subject} />
              ))}
              <div className="grid min-h-20 place-items-center rounded-xl bg-yellow-100 px-1 text-center font-black text-slate-900">
                <span className="[writing-mode:vertical-rl] rotate-180 text-[10px]">
                  LUNCH & REST
                </span>
              </div>
              <SubjectHeader subject={subjectConfigs[5]} />
            </div>

            <div className="mt-1.5 space-y-1.5">
              {dayConfigs.map((day) => (
                <DesktopRowForDay
                  key={day.key}
                  day={day}
                  itemsByCell={itemsByCell}
                  {...cardProps}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tablet / iPad: two-column cards, no forced horizontal timetable. */}
      <section className="hidden md:block xl:hidden">
        <div className="space-y-4">
          {dayConfigs.map((day) => (
            <TabletDaySection
              key={day.key}
              day={day}
              itemsByCell={itemsByCell}
              {...cardProps}
            />
          ))}
        </div>
      </section>

      {/* Phone: one-column, large touch targets. */}
      <section className="md:hidden">
        <div className="space-y-4">
          {dayConfigs.map((day) => (
            <MobileDaySection
              key={day.key}
              day={day}
              itemsByCell={itemsByCell}
              {...cardProps}
            />
          ))}
        </div>
      </section>
    </>
  );
}

function DesktopRowForDay({
  day,
  itemsByCell,
  progressMap,
  savingItemId,
  onResourceClick,
  onMarkDone,
  progressLoading,
}: {
  day: DayConfig;
  itemsByCell: Map<string, WeekAtGlanceItem[]>;
  progressMap: Record<string, LearningHubItemProgress>;
  savingItemId: string | null;
  onResourceClick: (item: WeekAtGlanceItem) => void;
  onMarkDone: (item: WeekAtGlanceItem) => void;
  progressLoading: boolean;
}) {
  return (
    <div className="grid grid-cols-[58px_repeat(5,minmax(145px,1fr))_52px_minmax(220px,1.3fr)] gap-1.5">
      <div className={`grid min-h-[132px] place-items-center rounded-xl px-2 py-3 text-center font-black ${day.color}`}>
        <span className="[writing-mode:vertical-rl] rotate-180 text-sm">{day.full}</span>
      </div>

      {subjectConfigs.slice(0, 5).map((subject) => (
        <ActivityCell
          key={`${day.key}-${subject.key}`}
          items={itemsByCell.get(`${day.key}__${subject.key}`) || []}
          subject={subject}
          day={day}
          progressMap={progressMap}
          savingItemId={savingItemId}
          onResourceClick={onResourceClick}
          onMarkDone={onMarkDone}
          progressLoading={progressLoading}
        />
      ))}

      <div className="min-h-[132px] rounded-xl bg-yellow-50" />

      <LanguageCell
        day={day}
        itemsByCell={itemsByCell}
        progressMap={progressMap}
        savingItemId={savingItemId}
        onResourceClick={onResourceClick}
        onMarkDone={onMarkDone}
        progressLoading={progressLoading}
      />
    </div>
  );
}

function TabletDaySection({
  day,
  itemsByCell,
  progressMap,
  savingItemId,
  onResourceClick,
  onMarkDone,
  progressLoading,
}: {
  day: DayConfig;
  itemsByCell: Map<string, WeekAtGlanceItem[]>;
  progressMap: Record<string, LearningHubItemProgress>;
  savingItemId: string | null;
  onResourceClick: (item: WeekAtGlanceItem) => void;
  onMarkDone: (item: WeekAtGlanceItem) => void;
  progressLoading: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
      <div className={`flex items-center justify-between px-4 py-3 ${day.color}`}>
        <h2 className="font-black">{day.full}</h2>
        <span className="text-[10px] font-black uppercase tracking-wider opacity-70">
          Daily Learning
        </span>
      </div>

      <div className="grid gap-3 p-3 sm:grid-cols-2">
        {subjectConfigs.map((subject) => {
          const cellItems = itemsByCell.get(`${day.key}__${subject.key}`) || [];
          if (!cellItems.length) return null;

          return (
            <div
              key={subject.key}
              className={subject.key === "LANGUAGE & LITERACY" ? "sm:col-span-2" : ""}
            >
              <SubjectMobileHeading subject={subject} />
              <div className="space-y-2">
                {cellItems.map((item) => (
                  <ActivityCard
                    key={item.id}
                    item={item}
                    progress={progressMap[item.id]}
                    saving={savingItemId === item.id}
                    onResourceClick={onResourceClick}
                    onMarkDone={onMarkDone}
                    progressLoading={progressLoading}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MobileDaySection({
  day,
  itemsByCell,
  progressMap,
  savingItemId,
  onResourceClick,
  onMarkDone,
  progressLoading,
}: {
  day: DayConfig;
  itemsByCell: Map<string, WeekAtGlanceItem[]>;
  progressMap: Record<string, LearningHubItemProgress>;
  savingItemId: string | null;
  onResourceClick: (item: WeekAtGlanceItem) => void;
  onMarkDone: (item: WeekAtGlanceItem) => void;
  progressLoading: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
      <div className={`flex items-center justify-between px-4 py-3 ${day.color}`}>
        <h2 className="font-black">{day.full}</h2>
        <span className="rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider">
          Daily Learning
        </span>
      </div>

      <div className="divide-y divide-indigo-50">
        {subjectConfigs.map((subject) => {
          const cellItems = itemsByCell.get(`${day.key}__${subject.key}`) || [];
          if (!cellItems.length) return null;

          return (
            <div key={subject.key} className="p-3.5">
              <SubjectMobileHeading subject={subject} />
              <div className="mt-2 space-y-3">
                {cellItems.map((item) => (
                  <ActivityCard
                    key={item.id}
                    item={item}
                    progress={progressMap[item.id]}
                    saving={savingItemId === item.id}
                    onResourceClick={onResourceClick}
                    onMarkDone={onMarkDone}
                    progressLoading={progressLoading}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function LanguageCell({
  day,
  itemsByCell,
  progressMap,
  savingItemId,
  onResourceClick,
  onMarkDone,
  progressLoading,
}: {
  day: DayConfig;
  itemsByCell: Map<string, WeekAtGlanceItem[]>;
  progressMap: Record<string, LearningHubItemProgress>;
  savingItemId: string | null;
  onResourceClick: (item: WeekAtGlanceItem) => void;
  onMarkDone: (item: WeekAtGlanceItem) => void;
  progressLoading: boolean;
}) {
  const languageItems = itemsByCell.get(`${day.key}__LANGUAGE & LITERACY`) || [];

  if (!languageItems.length) {
    return (
      <div className="grid min-h-[132px] grid-cols-2 gap-1.5">
        <EmptyMiniCell label="Language" />
        <EmptyMiniCell label="Literacy" />
      </div>
    );
  }

  return (
    <div className="grid min-h-[132px] grid-cols-2 gap-1.5">
      {languageItems.slice(0, 4).map((item) => (
        <ActivityMiniCard
          key={item.id}
          item={item}
          progress={progressMap[item.id]}
          saving={savingItemId === item.id}
          onResourceClick={onResourceClick}
          onMarkDone={onMarkDone}
          progressLoading={progressLoading}
          compact
        />
      ))}
    </div>
  );
}

function SubjectHeader({ subject }: { subject: SubjectConfig }) {
  return (
    <div className={`rounded-xl border border-indigo-100 px-2 py-3 text-center shadow-sm ${subject.headerClass}`}>
      <div className="text-2xl">{subject.icon}</div>
      <h3 className="mt-0.5 text-sm font-black text-slate-950">{subject.label}</h3>
      {subject.time ? (
        <p className="mt-0.5 text-[9px] font-bold text-slate-500">{subject.time}</p>
      ) : null}
    </div>
  );
}

function SubjectMobileHeading({ subject }: { subject: SubjectConfig }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-lg">
        {subject.icon}
      </span>
      <div className="min-w-0">
        <h3 className="truncate text-sm font-black text-indigo-700">{subject.label}</h3>
        {subject.time ? (
          <p className="text-[10px] font-bold text-slate-400">{subject.time}</p>
        ) : null}
      </div>
    </div>
  );
}

function ActivityCell({
  items,
  subject,
  day,
  progressMap,
  savingItemId,
  onResourceClick,
  onMarkDone,
  progressLoading,
}: {
  items: WeekAtGlanceItem[];
  subject: SubjectConfig;
  day: DayConfig;
  progressMap: Record<string, LearningHubItemProgress>;
  savingItemId: string | null;
  onResourceClick: (item: WeekAtGlanceItem) => void;
  onMarkDone: (item: WeekAtGlanceItem) => void;
  progressLoading: boolean;
}) {
  if (!items.length) {
    return <EmptyMiniCell label={subject.key === "NOTES" ? "Notes" : "No activity"} />;
  }

  return (
    <div className="grid min-h-[132px] gap-1.5">
      {items.map((item) => (
        <ActivityMiniCard
          key={`${day.key}-${subject.key}-${item.id}`}
          item={item}
          progress={progressMap[item.id]}
          saving={savingItemId === item.id}
          onResourceClick={onResourceClick}
          onMarkDone={onMarkDone}
          progressLoading={progressLoading}
        />
      ))}
    </div>
  );
}

function EmptyMiniCell({ label }: { label: string }) {
  return (
    <div className="grid min-h-[132px] place-items-center rounded-xl border border-dashed border-indigo-100 bg-slate-50 p-2">
      <div className="text-center">
        <p className="text-[10px] font-bold text-slate-300">{label}</p>
        <div className="mx-auto mt-2 grid h-7 w-7 place-items-center rounded-full border border-indigo-100 bg-white text-indigo-400">
          <Plus size={14} />
        </div>
      </div>
    </div>
  );
}

function ActivityCard({
  item,
  progress,
  saving,
  onResourceClick,
  onMarkDone,
  progressLoading,
}: {
  item: WeekAtGlanceItem;
  progress?: LearningHubItemProgress;
  saving: boolean;
  onResourceClick: (item: WeekAtGlanceItem) => void;
  onMarkDone: (item: WeekAtGlanceItem) => void;
  progressLoading: boolean;
}) {
  const button = getButtonMeta(item.button_type);
  const ButtonIcon = button.icon;
  const completed = progress?.completed === true;
  const downloaded = progress?.downloaded === true;
  const hasLink = Boolean(item.link_url);
  const isDemo = item.id.startsWith("fallback-");

  return (
    <article
      className={`rounded-2xl border p-3.5 shadow-sm ${
        completed ? "border-emerald-200 bg-emerald-50/40" : "border-indigo-100 bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          {item.thumbnail_url ? (
            item.thumbnail_url.length <= 4 ? (
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-indigo-50 text-2xl">
                {item.thumbnail_url}
              </div>
            ) : (
              <img src={item.thumbnail_url} alt="" className="h-12 w-14 rounded-xl object-cover" />
            )
          ) : (
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-indigo-50 text-2xl">
              {getSubjectEmoji(item.subject)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="line-clamp-2 text-sm font-black leading-5 text-slate-950">
              {item.title || "Untitled"}
            </h4>
            {completed ? (
              <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-black text-emerald-700">
                DONE
              </span>
            ) : null}
          </div>

          {item.description ? (
            <p className="mt-1 line-clamp-2 text-xs leading-4 text-slate-500">{item.description}</p>
          ) : null}

          <ActivityMeta item={item} />

          <div className="mt-3 grid grid-cols-2 gap-2">
            {hasLink ? (
              <a
                href={item.link_url || "#"}
                target="_blank"
                rel="noreferrer"
                onClick={() => onResourceClick(item)}
                className={`flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-black shadow-sm transition ${button.className}`}
              >
                <ButtonIcon size={16} />
                {item.button_text || button.label}
              </a>
            ) : (
              <div className="flex min-h-11 items-center justify-center rounded-xl bg-slate-100 px-3 text-xs font-black text-slate-400">
                No link
              </div>
            )}

            {!isDemo ? (
              <button
                type="button"
                onClick={() => onMarkDone(item)}
                disabled={completed || saving || progressLoading}
                className={`flex min-h-10 items-center justify-center gap-1.5 rounded-xl px-3 text-[11px] font-black transition ${
                  completed
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <CheckCircle2 size={16} />
                {saving ? "Saving..." : completed ? "Completed" : "Mark as Done"}
              </button>
            ) : (
              <div className="flex min-h-11 items-center justify-center rounded-xl bg-slate-100 px-3 text-xs font-black text-slate-400">
                Demo
              </div>
            )}
          </div>

          {downloaded && !completed ? (
            <p className="mt-2 text-center text-[10px] font-bold text-indigo-500">
              Resource opened/downloaded • Mark as Done after completing it.
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function ActivityMiniCard({
  item,
  progress,
  saving,
  onResourceClick,
  onMarkDone,
  progressLoading,
}: {
  item: WeekAtGlanceItem;
  progress?: LearningHubItemProgress;
  saving: boolean;
  onResourceClick: (item: WeekAtGlanceItem) => void;
  onMarkDone: (item: WeekAtGlanceItem) => void;
  progressLoading: boolean;
  compact?: boolean;
}) {
  const button = getButtonMeta(item.button_type);
  const ButtonIcon = button.icon;
  const completed = progress?.completed === true;
  const hasLink = Boolean(item.link_url);
  const isDemo = item.id.startsWith("fallback-");

  return (
    <article
      className={`relative rounded-xl border p-2.5 text-center shadow-sm ${
        completed ? "border-emerald-200 bg-emerald-50/50" : "border-indigo-100 bg-white"
      }`}
    >
      {item.thumbnail_url ? (
        item.thumbnail_url.length <= 4 ? (
          <div className="mx-auto grid h-10 w-12 place-items-center rounded-lg bg-indigo-50 text-2xl">
            {item.thumbnail_url}
          </div>
        ) : (
          <img src={item.thumbnail_url} alt="" className="mx-auto h-10 w-14 rounded-lg object-cover" />
        )
      ) : (
        <div className="mx-auto grid h-10 w-12 place-items-center rounded-lg bg-indigo-50 text-2xl">
          {getSubjectEmoji(item.subject)}
        </div>
      )}

      <h4 className="mt-1.5 line-clamp-2 text-[11px] font-black leading-4 text-slate-950">
        {item.title || "Untitled"}
      </h4>

      <ActivityMeta item={item} compact />

      <div className="mt-2 grid grid-cols-2 gap-1">
        {hasLink ? (
          <a
            href={item.link_url || "#"}
            target="_blank"
            rel="noreferrer"
            onClick={() => onResourceClick(item)}
            className={`flex min-h-9 items-center justify-center gap-1 rounded-lg px-1.5 text-[10px] font-black ${button.className}`}
          >
            <ButtonIcon size={13} />
            {item.button_text || button.label}
          </a>
        ) : (
          <div className="flex min-h-9 items-center justify-center rounded-lg bg-slate-100 px-1.5 text-[10px] font-black text-slate-400">
            No link
          </div>
        )}

        {!isDemo ? (
          <button
            type="button"
            onClick={() => onMarkDone(item)}
            disabled={completed || saving || progressLoading}
            className={`flex min-h-9 items-center justify-center gap-1 rounded-lg px-1.5 text-[10px] font-black ${
              completed ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <CheckCircle2 size={13} />
            {saving ? "..." : "Done"}
          </button>
        ) : (
          <div className="flex min-h-9 items-center justify-center rounded-lg bg-slate-100 px-1.5 text-[10px] font-black text-slate-400">
            Demo
          </div>
        )}
      </div>
    </article>
  );
}

function ActivityMeta({
  item,
  compact,
}: {
  item: WeekAtGlanceItem;
  compact?: boolean;
}) {
  return (
    <div className={`mt-2 flex flex-wrap gap-1 ${compact ? "justify-center" : ""}`}>
      {item.time_start || item.time_end ? (
        <span className="rounded-full bg-indigo-50 px-2 py-1 text-[9px] font-black text-indigo-700">
          {item.time_start || ""} {item.time_end ? `- ${item.time_end}` : ""}
        </span>
      ) : null}
      {item.difficulty ? (
        <span className="rounded-full bg-yellow-100 px-2 py-1 text-[9px] font-black text-yellow-800">
          {item.difficulty}
        </span>
      ) : null}
      {item.estimated_minutes ? (
        <span className="rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-black text-emerald-700">
          {item.estimated_minutes} min
        </span>
      ) : null}
    </div>
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

function SmallStat({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="flex min-h-[82px] items-center gap-3 rounded-[1.25rem] border border-indigo-100 bg-white px-4 py-3 shadow-sm sm:px-5">
      {icon ? (
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-indigo-500">
          {icon}
        </div>
      ) : null}
      <div>
        <p className="text-[10px] font-black tracking-[0.16em] text-indigo-400">{label.toUpperCase()}</p>
        <p className="mt-0.5 text-2xl font-black text-slate-950 sm:text-3xl">{value}</p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="rounded-[2rem] bg-white p-12 text-center shadow-sm">
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
    <div className="rounded-[2rem] bg-white p-12 text-center shadow-sm">
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
    <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.55fr]">
      <div className="rounded-[1.7rem] border border-indigo-100 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="font-black text-indigo-700">How to use?</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Click the button in each box to open the activity, worksheet, video
              or learning resource.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[1.7rem] border border-indigo-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 text-sm font-black text-slate-600">
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
