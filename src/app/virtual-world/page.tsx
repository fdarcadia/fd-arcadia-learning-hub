"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpenCheck,
  Check,
  ChevronLeft,
  Flame,
  Home,
  LogOut,
  Sparkles,
  Star,
  Trophy,
  UserRound,
} from "lucide-react";
import { ProtectedPage } from "@/components/ProtectedPage";
import { supabase } from "@/lib/supabase";

type ChildProfile = {
  id: string;
  name?: string | null;
  child_name?: string | null;
  full_name?: string | null;
  age?: number | null;
  level?: string | null;
  grade?: string | null;
  avatar_character?: string | null;
};

type AvatarAction = "idle" | "sit" | "dance" | "wave" | "clap" | "jump";

type TaskTemplate = {
  key: string;
  title: string;
  href: string;
  category: "reading" | "math" | "learning" | "practice";
  reward: number;
  emoji: string;
};

type TodayTask = TaskTemplate & {
  id: string;
};

const actions: { label: string; emoji: string; action: AvatarAction }[] = [
  { label: "Sit", emoji: "🪑", action: "sit" },
  { label: "Dance", emoji: "🎵", action: "dance" },
  { label: "Wave", emoji: "👋", action: "wave" },
  { label: "Clap", emoji: "👏", action: "clap" },
  { label: "Jump", emoji: "🏃", action: "jump" },
];

/*
  30-DAY TASK SYSTEM
  ------------------
  - 3 deterministic tasks are generated every day.
  - The cycle contains 30 days and then repeats.
  - Completion is stored per child + per date in localStorage.
  - No additional Supabase table is required for this V1.
*/
const taskPool: TaskTemplate[] = [
  {
    key: "trace-letters",
    title: "Jejak 3 huruf",
    href: "/huruf-membaca",
    category: "reading",
    reward: 10,
    emoji: "✍️",
  },
  {
    key: "abc-order",
    title: "Susun huruf A-Z",
    href: "/huruf-membaca/abc-order",
    category: "reading",
    reward: 15,
    emoji: "🔤",
  },
  {
    key: "read-kv",
    title: "Baca 5 perkataan KV",
    href: "/huruf-membaca",
    category: "reading",
    reward: 15,
    emoji: "📖",
  },
  {
    key: "read-kvk",
    title: "Baca 3 perkataan KVK",
    href: "/huruf-membaca",
    category: "reading",
    reward: 15,
    emoji: "📚",
  },
  {
    key: "before-after",
    title: "Cari huruf sebelum & selepas",
    href: "/huruf-membaca/abc-order",
    category: "reading",
    reward: 20,
    emoji: "🔡",
  },
  {
    key: "upper-lower",
    title: "Padankan huruf besar & kecil",
    href: "/huruf-membaca",
    category: "reading",
    reward: 15,
    emoji: "Aa",
  },
  {
    key: "vowels",
    title: "Cari 5 huruf vokal",
    href: "/huruf-membaca",
    category: "reading",
    reward: 10,
    emoji: "🔎",
  },
  {
    key: "syllable",
    title: "Lengkapkan 5 suku kata",
    href: "/huruf-membaca",
    category: "reading",
    reward: 15,
    emoji: "🧩",
  },
  {
    key: "math-add",
    title: "Selesaikan 5 soalan tambah",
    href: "/math-activity",
    category: "math",
    reward: 20,
    emoji: "➕",
  },
  {
    key: "math-subtract",
    title: "Selesaikan 5 soalan tolak",
    href: "/math-activity",
    category: "math",
    reward: 20,
    emoji: "➖",
  },
  {
    key: "count-20",
    title: "Kira nombor 1-20",
    href: "/math-activity",
    category: "math",
    reward: 15,
    emoji: "🔢",
  },
  {
    key: "number-match",
    title: "Padankan nombor & kuantiti",
    href: "/math-activity",
    category: "math",
    reward: 15,
    emoji: "🎯",
  },
  {
    key: "number-bond",
    title: "Buat 3 Number Bonds",
    href: "/math-activity",
    category: "math",
    reward: 20,
    emoji: "🔗",
  },
  {
    key: "sifir-2",
    title: "Latihan Sifir 2",
    href: "/sifir-deck",
    category: "math",
    reward: 20,
    emoji: "⭐",
  },
  {
    key: "reading-module",
    title: "Baca 5 muka surat Modul Membaca",
    href: "/flashcard-modules",
    category: "learning",
    reward: 20,
    emoji: "📘",
  },
  {
    key: "flashcard",
    title: "Flashcard 5 minit",
    href: "/flashcard-library",
    category: "practice",
    reward: 10,
    emoji: "🃏",
  },
  {
    key: "learning-hub",
    title: "Selesaikan 1 aktiviti Learning Hub",
    href: "/learning-hub",
    category: "learning",
    reward: 20,
    emoji: "🏫",
  },
  {
    key: "draw-learn",
    title: "Siapkan 1 Draw & Learn",
    href: "/worksheet",
    category: "practice",
    reward: 15,
    emoji: "🎨",
  },
];

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function startOfWeekMonday(date: Date) {
  const copy = startOfDay(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  return addDays(copy, diff);
}

function get30DayIndex(date: Date) {
  const utcDay = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000
  );

  return ((utcDay % 30) + 30) % 30;
}

function makeTasksForDate(date: Date): TodayTask[] {
  const dayIndex = get30DayIndex(date);

  /*
    Use three different jumps through the task pool.
    This guarantees a stable set for a date while producing variation
    throughout the 30-day cycle.
  */
  const positions = [
    dayIndex % taskPool.length,
    (dayIndex * 5 + 7) % taskPool.length,
    (dayIndex * 11 + 13) % taskPool.length,
  ];

  const used = new Set<number>();

  const uniquePositions = positions.map((position, index) => {
    let next = position;

    while (used.has(next)) {
      next = (next + index + 1) % taskPool.length;
    }

    used.add(next);
    return next;
  });

  return uniquePositions.map((position, index) => {
    const template = taskPool[position];

    return {
      ...template,
      id: `${dateKey(date)}-${index}-${template.key}`,
    };
  });
}

function completionStorageKey(childId: string, date: Date) {
  return `fd-arcadia-vw-tasks:${childId}:${dateKey(date)}`;
}

function readCompletedTasks(childId: string, date: Date): string[] {
  if (typeof window === "undefined" || !childId) return [];

  try {
    const raw = window.localStorage.getItem(
      completionStorageKey(childId, date)
    );

    if (!raw) return [];

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed.filter((value) => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

export default function VirtualWorldPage() {
  return (
    <ProtectedPage>
      {(user) => <VirtualWorld userId={user.id} />}
    </ProtectedPage>
  );
}

function VirtualWorld({ userId }: { userId: string }) {
  const router = useRouter();

  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [avatarAction, setAvatarAction] = useState<AvatarAction>("idle");

  const [completedToday, setCompletedToday] = useState<string[]>([]);
  const [taskVersion, setTaskVersion] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const today = useMemo(() => startOfDay(new Date()), []);

  useEffect(() => {
    async function loadChildren() {
      try {
        setLoading(true);
        setError("");

        const { data, error } = await supabase
          .from("children")
          .select("*")
          .eq("parent_id", userId)
          .limit(8);

        if (error) {
          throw error;
        }

        const loaded = (data || []) as ChildProfile[];

        setChildren(loaded);

        if (loaded.length > 0) {
          const saved =
            typeof window !== "undefined"
              ? window.localStorage.getItem("fd-arcadia-selected-child")
              : null;

          const exists = loaded.some((child) => child.id === saved);

          setSelectedChildId(saved && exists ? saved : loaded[0].id);
        } else {
          setSelectedChildId("");
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to load children.";

        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadChildren();
  }, [userId]);

  useEffect(() => {
    if (!selectedChildId) {
      setCompletedToday([]);
      return;
    }

    setCompletedToday(readCompletedTasks(selectedChildId, today));
  }, [selectedChildId, today, taskVersion]);

  useEffect(() => {
    if (avatarAction === "idle" || avatarAction === "sit") return;

    const duration = avatarAction === "dance" ? 1700 : 1000;

    const timer = window.setTimeout(() => {
      setAvatarAction("idle");
    }, duration);

    return () => window.clearTimeout(timer);
  }, [avatarAction]);

  const selectedChild = useMemo(() => {
    return (
      children.find((child) => child.id === selectedChildId) ||
      children[0] ||
      null
    );
  }, [children, selectedChildId]);

  const childName =
    selectedChild?.name ||
    selectedChild?.child_name ||
    selectedChild?.full_name ||
    "My Child";

  const childLevel =
    selectedChild?.level || selectedChild?.grade || "Learning Profile";

  const avatarCharacter =
    selectedChild?.avatar_character?.trim() || "boy_01";

  const avatarImage = `/avatars/${avatarCharacter}/${avatarAction}.png`;
  const idleImage = `/avatars/${avatarCharacter}/idle.png`;

  const isGirlAvatar = avatarCharacter.startsWith("girl_");

  /*
    Save these two images into:
    public/rooms/boy-room.png
    public/rooms/girl-room.png
  */
  const roomBackground = isGirlAvatar
    ? "/rooms/girl-room.png"
    : "/rooms/boy-room.png";

  const todayTasks = useMemo(() => makeTasksForDate(today), [today]);

  const todayCompletedCount = todayTasks.filter((task) =>
    completedToday.includes(task.id)
  ).length;

  const todayPercent =
    todayTasks.length > 0
      ? Math.round((todayCompletedCount / todayTasks.length) * 100)
      : 0;

  const weeklyStats = useMemo(() => {
    if (!selectedChildId) {
      return {
        completed: 0,
        total: 21,
        percent: 0,
        days: [] as {
          key: string;
          label: string;
          completed: boolean;
          today: boolean;
        }[],
      };
    }

    const weekStart = startOfWeekMonday(today);

    let completed = 0;
    let total = 0;

    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const days = Array.from({ length: 7 }, (_, index) => {
      const date = addDays(weekStart, index);
      const tasks = makeTasksForDate(date);
      const completedIds = readCompletedTasks(selectedChildId, date);

      const dayCompletedCount = tasks.filter((task) =>
        completedIds.includes(task.id)
      ).length;

      /*
        Future days should not make the current weekly percentage look worse.
        Count totals only up to today.
      */
      if (date <= today) {
        total += tasks.length;
        completed += dayCompletedCount;
      }

      return {
        key: dateKey(date),
        label: labels[index],
        completed: dayCompletedCount === tasks.length,
        today: dateKey(date) === dateKey(today),
      };
    });

    return {
      completed,
      total,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      days,
    };
  }, [selectedChildId, today, taskVersion]);

  const streakDays = useMemo(() => {
    if (!selectedChildId) return 0;

    let streak = 0;

    /*
      If today's missions are not finished yet, start checking from yesterday.
      If today's missions are finished, today's date contributes to the streak.
    */
    let cursor =
      todayCompletedCount === todayTasks.length ? today : addDays(today, -1);

    for (let i = 0; i < 30; i += 1) {
      const tasks = makeTasksForDate(cursor);
      const completedIds = readCompletedTasks(selectedChildId, cursor);

      const allComplete = tasks.every((task) =>
        completedIds.includes(task.id)
      );

      if (!allComplete) break;

      streak += 1;
      cursor = addDays(cursor, -1);
    }

    return streak;
  }, [
    selectedChildId,
    today,
    todayCompletedCount,
    todayTasks,
    taskVersion,
  ]);

  function selectChild(childId: string) {
    setSelectedChildId(childId);
    setAvatarAction("idle");

    if (typeof window !== "undefined") {
      window.localStorage.setItem("fd-arcadia-selected-child", childId);
    }
  }

  function playAction(action: AvatarAction) {
    if (action === "sit") {
      setAvatarAction((current) => (current === "sit" ? "idle" : "sit"));
      return;
    }

    setAvatarAction("idle");

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setAvatarAction(action);
      });
    });
  }

  function toggleTask(taskId: string) {
    if (!selectedChildId || typeof window === "undefined") return;

    const current = readCompletedTasks(selectedChildId, today);

    const next = current.includes(taskId)
      ? current.filter((id) => id !== taskId)
      : [...current, taskId];

    window.localStorage.setItem(
      completionStorageKey(selectedChildId, today),
      JSON.stringify(next)
    );

    setCompletedToday(next);
    setTaskVersion((currentVersion) => currentVersion + 1);
  }

  async function logout() {
    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0b1032]">
        <div className="text-center text-white">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-violet-300/30 border-t-violet-400" />

          <p className="mt-4 text-sm font-black">
            Entering Virtual World...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0e2d] text-slate-950">
      <style>{`
        @keyframes vwIdle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        @keyframes vwJump {
          0%, 100% { transform: translateY(0) scale(1); }
          18% { transform: translateY(4px) scale(.98); }
          48% { transform: translateY(-82px) scale(1.03); }
          78% { transform: translateY(-12px) scale(1); }
        }

        @keyframes vwDance {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          20% { transform: translateX(-16px) rotate(-5deg); }
          40% { transform: translateX(16px) rotate(5deg); }
          60% { transform: translateX(-12px) rotate(-4deg); }
          80% { transform: translateX(12px) rotate(4deg); }
        }

        @keyframes vwWave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
          75% { transform: rotate(-2deg); }
        }

        @keyframes vwClap {
          0%, 100% { transform: scale(1); }
          25%, 75% { transform: scale(1.035) translateY(-4px); }
          50% { transform: scale(.99); }
        }

        .vw-idle {
          animation: vwIdle 2.8s ease-in-out infinite;
        }

        .vw-jump {
          animation: vwJump .95s ease-in-out both;
        }

        .vw-dance {
          animation: vwDance 1.65s ease-in-out both;
        }

        .vw-wave {
          animation: vwWave .9s ease-in-out both;
        }

        .vw-clap {
          animation: vwClap .8s ease-in-out both;
        }

        .vw-sit {
          transform: translateY(14px);
        }

        @media (prefers-reduced-motion: reduce) {
          .vw-idle,
          .vw-jump,
          .vw-dance,
          .vw-wave,
          .vw-clap {
            animation: none !important;
          }
        }
      `}</style>

      <div className="mx-auto min-h-screen max-w-[1920px] bg-gradient-to-b from-[#f8f5ff] to-[#ebe8ff]">

        {/* TOP BAR */}
        <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-violet-100 bg-white/90 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/dashboard"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-700 transition hover:bg-violet-200"
              title="Back to Home"
            >
              <ChevronLeft size={20} />
            </Link>

            <div className="min-w-0">
              <p className="truncate text-[9px] font-black uppercase tracking-[0.18em] text-violet-500">
                FD Arcadia LearningHub
              </p>

              <h1 className="truncate text-xl font-black text-[#28245d]">
                Virtual World
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-2xl bg-[#292958] px-3 py-2 text-xs font-black text-white sm:flex">
              <Star size={15} className="text-yellow-300" />
              Day {get30DayIndex(today) + 1}/30
            </div>

            <Link
              href="/children/avatar"
              className="hidden rounded-2xl border border-violet-100 bg-violet-50 px-4 py-2.5 text-xs font-black text-violet-700 transition hover:bg-violet-100 md:inline-flex"
            >
              Change Avatar
            </Link>

            <button
              type="button"
              onClick={logout}
              className="grid h-11 w-11 place-items-center rounded-2xl bg-[#292958] text-white transition hover:bg-[#37366f]"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <div className="p-3 pb-28 sm:p-5 lg:p-6">
          {error ? (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </div>
          ) : null}

          {children.length === 0 ? (
            <section className="rounded-[28px] border border-violet-100 bg-white p-8 text-center shadow-sm">
              <UserRound size={48} className="mx-auto text-violet-400" />

              <h2 className="mt-4 text-xl font-black text-[#302b64]">
                No child profile yet
              </h2>

              <p className="mt-2 text-sm font-semibold text-slate-400">
                Add a child profile before entering Virtual World.
              </p>

              <Link
                href="/children"
                className="mt-5 inline-flex rounded-2xl bg-violet-600 px-5 py-3 text-xs font-black text-white"
              >
                Manage Children
              </Link>
            </section>
          ) : (
            <>
              {/* CHILD SELECTOR */}
              <section className="mb-4 rounded-[24px] border border-violet-100 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-violet-500">
                      Choose Child
                    </p>

                    <h2 className="mt-1 text-xl font-black text-[#302b64]">
                      Whose world do you want to enter?
                    </h2>
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {children.map((child) => {
                      const name =
                        child.name ||
                        child.child_name ||
                        child.full_name ||
                        "Child";

                      const avatar =
                        child.avatar_character?.trim() || "boy_01";

                      const active = child.id === selectedChild?.id;

                      return (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => selectChild(child.id)}
                          className={`flex shrink-0 items-center gap-2 rounded-2xl border px-3 py-2.5 text-xs font-black transition ${
                            active
                              ? "border-violet-500 bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                              : "border-slate-200 bg-slate-50 text-slate-700 hover:border-violet-300 hover:bg-violet-50"
                          }`}
                        >
                          <span
                            className={`grid h-10 w-10 place-items-center overflow-hidden rounded-full ${
                              active ? "bg-white/20" : "bg-white"
                            }`}
                          >
                            <img
                              src={`/avatars/${avatar}/idle.png`}
                              alt={name}
                              className="h-full w-full object-contain"
                              draggable={false}
                            />
                          </span>

                          <span>{name}</span>

                          {active ? <Check size={14} /> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* MAIN VIRTUAL WORLD */}
              <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_340px]">

                {/* ROOM */}
                <section className="relative isolate min-h-[650px] overflow-hidden rounded-[32px] border border-white/80 shadow-[0_25px_80px_rgba(63,49,133,.22)]">

                  {/* REAL PNG ROOM BACKGROUND */}
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: `url("${roomBackground}")`,
                    }}
                  />

                  {/* LIGHT READABILITY OVERLAY */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/[0.02] via-transparent to-black/[0.08]" />

                  <div className="relative z-10 flex min-h-[650px] flex-col p-4 sm:p-6">

                    {/* ROOM INFO */}
                    <div className="max-w-[520px] rounded-[24px] bg-white/92 px-5 py-4 shadow-lg backdrop-blur-md">
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-500">
                        {childName}&apos;s Dream Room
                      </p>

                      <h2 className="mt-1 text-2xl font-black text-[#2b285c]">
                        Hi {childName}! 👋
                      </h2>

                      <p className="mt-1 text-sm font-semibold text-slate-600">
                        {childLevel}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-400">
                        Choose an action and bring your avatar to life.
                      </p>
                    </div>

                    {/* AVATAR */}
                    <div className="mt-auto flex justify-center pb-20">
                      <div className="relative flex h-[330px] w-[270px] items-end justify-center sm:h-[400px] sm:w-[320px]">
                        <div
                          className={`absolute bottom-1 h-8 rounded-full bg-indigo-950/20 blur-md transition-all duration-300 ${
                            avatarAction === "jump"
                              ? "w-24 opacity-40"
                              : avatarAction === "sit"
                                ? "w-52 opacity-90"
                                : "w-44"
                          }`}
                        />

                        <div
                          key={`${selectedChild?.id || "none"}-${avatarAction}`}
                          className={`relative z-10 flex h-full w-full origin-bottom items-end justify-center ${
                            avatarAction === "idle" ? "vw-idle" : ""
                          } ${
                            avatarAction === "jump" ? "vw-jump" : ""
                          } ${
                            avatarAction === "dance" ? "vw-dance" : ""
                          } ${
                            avatarAction === "wave" ? "vw-wave" : ""
                          } ${
                            avatarAction === "clap" ? "vw-clap" : ""
                          } ${
                            avatarAction === "sit" ? "vw-sit" : ""
                          }`}
                        >
                          <img
                            src={avatarImage}
                            alt={`${childName} ${avatarAction}`}
                            draggable={false}
                            onError={(event) => {
                              const image = event.currentTarget;

                              if (
                                image.getAttribute("data-fallback") !== "1"
                              ) {
                                image.setAttribute("data-fallback", "1");
                                image.src = idleImage;
                              }
                            }}
                            className="max-h-full max-w-full select-none object-contain drop-shadow-[0_24px_26px_rgba(32,25,86,.22)]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* ACTION BAR */}
                    <div className="absolute inset-x-4 bottom-5 z-20 mx-auto flex max-w-[650px] items-center justify-center gap-1 overflow-x-auto rounded-2xl bg-[#302a43]/85 p-2 text-white shadow-xl backdrop-blur sm:gap-2">
                      {actions.map((item) => {
                        const active = avatarAction === item.action;

                        return (
                          <button
                            key={item.action}
                            type="button"
                            onClick={() => playAction(item.action)}
                            aria-pressed={active}
                            className={`flex min-w-[72px] touch-manipulation items-center justify-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-black transition active:scale-95 sm:min-w-[100px] sm:text-xs ${
                              active
                                ? "border-white/80 bg-violet-500 shadow-lg"
                                : "border-transparent hover:bg-white/15"
                            }`}
                          >
                            <span className="text-lg">{item.emoji}</span>
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </section>

                {/* RIGHT GAME PANEL */}
                <aside className="grid gap-4 md:grid-cols-2 2xl:grid-cols-1">

                  {/* TODAY'S TASKS */}
                  <section className="rounded-[26px] border border-violet-100 bg-white p-4 shadow-[0_16px_45px_rgba(58,46,123,.10)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-violet-500">
                          Day {get30DayIndex(today) + 1} / 30
                        </p>

                        <h2 className="mt-1 text-lg font-black text-[#302b64]">
                          Today&apos;s Tasks
                        </h2>
                      </div>

                      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-50 text-violet-600">
                        <Trophy size={19} />
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      {todayTasks.map((task) => {
                        const completed = completedToday.includes(task.id);

                        return (
                          <div
                            key={task.id}
                            className={`rounded-2xl border p-3 transition ${
                              completed
                                ? "border-emerald-100 bg-emerald-50/60"
                                : "border-slate-100 bg-slate-50"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <button
                                type="button"
                                onClick={() => toggleTask(task.id)}
                                className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 transition ${
                                  completed
                                    ? "border-emerald-500 bg-emerald-500 text-white"
                                    : "border-violet-400 bg-white text-transparent hover:bg-violet-50"
                                }`}
                                aria-label={
                                  completed
                                    ? `Mark ${task.title} incomplete`
                                    : `Mark ${task.title} complete`
                                }
                              >
                                <Check size={15} strokeWidth={3} />
                              </button>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p
                                      className={`text-xs font-black ${
                                        completed
                                          ? "text-emerald-700 line-through"
                                          : "text-[#373267]"
                                      }`}
                                    >
                                      {task.emoji} {task.title}
                                    </p>

                                    <Link
                                      href={task.href}
                                      className="mt-1 inline-flex text-[9px] font-black text-violet-600 hover:underline"
                                    >
                                      Go to activity →
                                    </Link>
                                  </div>

                                  <span className="shrink-0 rounded-full bg-amber-50 px-2 py-1 text-[9px] font-black text-amber-600">
                                    +{task.reward}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-[10px] font-black">
                        <span className="text-slate-400">
                          {todayCompletedCount}/{todayTasks.length} Completed
                        </span>

                        <span className="text-violet-600">{todayPercent}%</span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
                          style={{ width: `${todayPercent}%` }}
                        />
                      </div>
                    </div>
                  </section>

                  {/* WEEKLY PROGRESS */}
                  <section className="rounded-[26px] border border-violet-100 bg-white p-4 shadow-[0_16px_45px_rgba(58,46,123,.10)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-indigo-500">
                          This Week
                        </p>

                        <h2 className="mt-1 text-lg font-black text-[#302b64]">
                          Weekly Progress
                        </h2>
                      </div>

                      <BarChart3 size={21} className="text-indigo-500" />
                    </div>

                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-2xl font-black text-[#302b64]">
                          {weeklyStats.completed}/{weeklyStats.total}
                        </p>

                        <p className="text-[10px] font-bold text-slate-400">
                          Tasks Completed
                        </p>
                      </div>

                      <p className="text-sm font-black text-indigo-600">
                        {weeklyStats.percent}%
                      </p>
                    </div>

                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-violet-500 transition-all duration-500"
                        style={{ width: `${weeklyStats.percent}%` }}
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-7 gap-1">
                      {weeklyStats.days.map((day) => (
                        <div key={day.key} className="text-center">
                          <div
                            className={`mx-auto grid h-7 w-7 place-items-center rounded-full text-[10px] font-black ${
                              day.completed
                                ? "bg-emerald-500 text-white"
                                : day.today
                                  ? "border-2 border-violet-500 bg-violet-50 text-violet-600"
                                  : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {day.completed ? "✓" : ""}
                          </div>

                          <p
                            className={`mt-1 text-[8px] font-black ${
                              day.today
                                ? "text-violet-600"
                                : "text-slate-400"
                            }`}
                          >
                            {day.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* STREAK */}
                  <section className="rounded-[26px] border border-orange-100 bg-gradient-to-br from-white to-orange-50 p-4 shadow-[0_16px_45px_rgba(58,46,123,.10)] md:col-span-2 2xl:col-span-1">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-orange-500">
                          Learning Streak
                        </p>

                        <h2 className="mt-1 text-lg font-black text-[#302b64]">
                          {streakDays} Day{streakDays === 1 ? "" : "s"} 🔥
                        </h2>
                      </div>

                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-100 text-orange-600">
                        <Flame size={23} />
                      </div>
                    </div>

                    <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">
                      Complete all 3 daily missions to keep your streak going.
                    </p>

                    {todayCompletedCount === todayTasks.length ? (
                      <div className="mt-3 rounded-2xl bg-emerald-50 px-3 py-2 text-[10px] font-black text-emerald-700">
                        ✨ Today&apos;s streak secured!
                      </div>
                    ) : (
                      <div className="mt-3 rounded-2xl bg-white px-3 py-2 text-[10px] font-black text-orange-600 shadow-sm">
                        {todayTasks.length - todayCompletedCount} mission
                        {todayTasks.length - todayCompletedCount === 1
                          ? ""
                          : "s"}{" "}
                        left today.
                      </div>
                    )}
                  </section>
                </aside>
              </div>

              {/* QUICK TOOLS */}
              <section className="mt-4 grid gap-4 md:grid-cols-3">
                <Link
                  href="/children/avatar"
                  className="rounded-[22px] border border-violet-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200"
                >
                  <UserRound className="text-violet-600" />

                  <h3 className="mt-3 font-black text-[#302b64]">
                    Change Avatar
                  </h3>

                  <p className="mt-1 text-xs font-semibold text-slate-400">
                    Choose a character for {childName}.
                  </p>
                </Link>

                <div className="rounded-[22px] border border-violet-100 bg-white p-5 shadow-sm">
                  <Sparkles className="text-violet-600" />

                  <h3 className="mt-3 font-black text-[#302b64]">
                    Wardrobe
                  </h3>

                  <p className="mt-1 text-xs font-semibold text-slate-400">
                    Coming next.
                  </p>
                </div>

                <div className="rounded-[22px] border border-violet-100 bg-white p-5 shadow-sm">
                  <Sparkles className="text-violet-600" />

                  <h3 className="mt-3 font-black text-[#302b64]">
                    Room Items
                  </h3>

                  <p className="mt-1 text-xs font-semibold text-slate-400">
                    Coming next.
                  </p>
                </div>
              </section>
            </>
          )}
        </div>

        {/* BOTTOM NAV */}
        <nav className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-[760px] items-center justify-around rounded-[24px] border border-white/15 bg-[#15183d]/95 p-2 text-white shadow-[0_18px_50px_rgba(9,13,44,.35)] backdrop-blur-xl">
          <NavItem href="/dashboard" icon={Home} label="Home" />

          <NavItem
            href="/learning-hub"
            icon={BookOpenCheck}
            label="Learning"
          />

          <NavItem
            href="/virtual-world"
            icon={Sparkles}
            label="Virtual World"
            active
          />

          <NavItem
            href="/flashcard-modules"
            icon={BarChart3}
            label="Progress"
          />

          <NavItem href="/profile" icon={UserRound} label="Profile" />
        </nav>
      </div>
    </main>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[9px] font-black transition sm:flex-row sm:gap-2 sm:text-xs ${
        active
          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
          : "text-indigo-100 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon size={18} />
      <span className="truncate">{label}</span>
    </Link>
  );
}