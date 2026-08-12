"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  GripVertical,
  ListChecks,
  Plus,
  Save,
  StickyNote,
  Trash2,
  Users,
  AlertCircle,
  Clock3,
  Sparkles,
} from "lucide-react";
import { ProtectedPage } from "@/components/ProtectedPage";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "fdarcadia.hello@gmail.com";

type PlannerItem = {
  id: string;
  time: string;
  subject: string;
  note: string;
};

type SavedPlan = {
  id: string;
  plan_date: string;
  month_name: string;
  week_no: number;
  title: string | null;
  notes: string | null;
  items: PlannerItem[];
};

const dayHeaders = [
  { label: "Monday", color: "bg-emerald-300" },
  { label: "Tuesday", color: "bg-pink-300" },
  { label: "Wednesday", color: "bg-sky-300" },
  { label: "Thursday", color: "bg-yellow-300" },
  { label: "Friday", color: "bg-purple-300" },
  { label: "Saturday", color: "bg-cyan-300" },
  { label: "Sunday", color: "bg-orange-300" },
];

const cornerColors = [
  "bg-orange-400",
  "bg-sky-400",
  "bg-yellow-300",
  "bg-purple-400",
  "bg-sky-400",
  "bg-pink-400",
  "bg-emerald-400",
];

function makeId() {
  return crypto.randomUUID();
}

function formatDate(date: Date) {
  const localDate = new Date(date);
  localDate.setHours(12, 0, 0, 0);
  return localDate.toISOString().slice(0, 10);
}

function getMonthName(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function getWeekOfMonth(date: Date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDay = first.getDay() === 0 ? 7 : first.getDay();
  return Math.ceil((date.getDate() + firstDay - 1) / 7);
}

function getDateLabel(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "short",
  });
}

export default function AdminCalendarPage() {
  return (
    <ProtectedPage>
      {(user) =>
        user.email === ADMIN_EMAIL ? (
          <CalendarPlanner />
        ) : (
          <main className="page-shell py-10">
            <h1 className="text-3xl font-bold text-red-600">Access denied</h1>
          </main>
        )
      }
    </ProtectedPage>
  );
}

function CalendarPlanner() {
  const today = new Date();

  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(formatDate(today));
  const [title, setTitle] = useState("Daily Planner");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<PlannerItem[]>([
    {
      id: makeId(),
      time: "8:00–9:30 PM",
      subject: "Membaca",
      note: "Qisha - KV",
    },
  ]);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const selectedDateObject = useMemo(
    () => new Date(`${selectedDate}T00:00:00`),
    [selectedDate]
  );

  const monthName = getMonthName(selectedDateObject);
  const weekNo = getWeekOfMonth(selectedDateObject);

  useEffect(() => {
    loadPlans();
  }, [viewDate]);

  useEffect(() => {
    const existing = savedPlans.find((plan) => plan.plan_date === selectedDate);

    if (existing) {
      setTitle(existing.title || "Daily Planner");
      setNotes(existing.notes || "");
      setItems(
        existing.items?.length
          ? existing.items
          : [{ id: makeId(), time: "", subject: "", note: "" }]
      );
    } else {
      setTitle("Daily Planner");
      setNotes("");
      setItems([
        {
          id: makeId(),
          time: "",
          subject: "",
          note: "",
        },
      ]);
    }
  }, [selectedDate, savedPlans]);

  async function loadPlans() {
    const start = formatDate(
      new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
    );
    const end = formatDate(
      new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0)
    );

    const { data, error } = await supabase
      .from("admin_calendar_plans")
      .select("*")
      .gte("plan_date", start)
      .lte("plan_date", end)
      .order("plan_date", { ascending: true });

    if (error) {
      setMessage(error.message);
      return;
    }

    setSavedPlans((data || []) as SavedPlan[]);
  }

  async function savePlanner() {
    const cleanItems = items.filter(
      (item) => item.time || item.subject || item.note
    );

    const { error } = await supabase.from("admin_calendar_plans").upsert(
      {
        plan_date: selectedDate,
        month_name: monthName,
        week_no: weekNo,
        title,
        notes,
        items: cleanItems,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "plan_date" }
    );

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(`Planner for ${getDateLabel(selectedDate)} saved successfully.`);
    await loadPlans();
  }

  function addItem() {
    setItems((current) => [
      ...current,
      {
        id: makeId(),
        time: "",
        subject: "",
        note: "",
      },
    ]);
  }

  function updateItem(id: string, field: keyof PlannerItem, value: string) {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  }

  function deleteItem(id: string) {
    setItems((current) =>
      current.length === 1
        ? [{ id: makeId(), time: "", subject: "", note: "" }]
        : current.filter((item) => item.id !== id)
    );
  }

  function moveItem(from: number, to: number) {
    if (from === to) return;

    setItems((current) => {
      const copy = [...current];
      const [moved] = copy.splice(from, 1);
      copy.splice(to, 0, moved);
      return copy;
    });
  }

  const calendarCells = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const mondayStart = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    const startDate = new Date(year, month, 1 - mondayStart);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);

      const dateString = formatDate(date);
      const savedPlan = savedPlans.find((plan) => plan.plan_date === dateString);
      const isCurrentMonth = date.getMonth() === month;

      return {
        key: dateString,
        date,
        dateString,
        dayNumber: date.getDate(),
        isCurrentMonth,
        isToday: dateString === formatDate(today),
        isSelected: dateString === selectedDate,
        savedPlan,
        cornerColor: cornerColors[index % 7],
      };
    });
  }, [viewDate, savedPlans, selectedDate]);

  const totalActivities = items.filter(
    (item) => item.time || item.subject || item.note
  ).length;

  const monthPlanCount = savedPlans.length;
  const noteCount = savedPlans.filter((plan) => Boolean(plan.notes?.trim())).length;
  const activityCountThisMonth = savedPlans.reduce(
    (sum, plan) => sum + (plan.items?.length || 0),
    0
  );
  const averageActivities =
    monthPlanCount > 0 ? (activityCountThisMonth / monthPlanCount).toFixed(1) : "0.0";

  const recentPlans = [...savedPlans]
    .sort((a, b) => b.plan_date.localeCompare(a.plan_date))
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-950">
      <div className="grid min-h-screen xl:grid-cols-[220px_minmax(0,1fr)]">
        <DiarySidebar />

        <section className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-100">
                <CalendarDays size={20} />
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-500">
                  Admin Diary
                </p>
                <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                  Plan, teach and track every meaningful moment.
                </h1>
                <p className="mt-1 text-sm font-semibold text-slate-400">
                  Calendar, daily planner and teaching notes in one workspace.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <ArrowLeft size={15} />
                Admin
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-slate-800"
              >
                <ArrowLeft size={15} />
                Dashboard
              </Link>
            </div>
          </header>

          <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <DiaryStat
              icon={<Users size={18} />}
              label="Today's Activities"
              value={totalActivities}
              note="Selected day"
              tone="violet"
            />
            <DiaryStat
              icon={<ListChecks size={18} />}
              label="Plans This Month"
              value={monthPlanCount}
              note="Saved diary days"
              tone="emerald"
            />
            <DiaryStat
              icon={<AlertCircle size={18} />}
              label="Notes Added"
              value={noteCount}
              note="This month"
              tone="amber"
            />
            <DiaryStat
              icon={<CheckCircle2 size={18} />}
              label="Activities"
              value={activityCountThisMonth}
              note="This month"
              tone="blue"
            />
            <DiaryStat
              icon={<Sparkles size={18} />}
              label="Daily Average"
              value={averageActivities}
              note="Activities / day"
              tone="pink"
            />
          </section>

          <section className="mt-5 grid gap-5 2xl:grid-cols-[1.08fr_0.92fr]">
            <div className="space-y-5">
              <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setViewDate(
                          new Date(
                            viewDate.getFullYear(),
                            viewDate.getMonth() - 1,
                            1
                          )
                        )
                      }
                      className="grid h-9 w-9 place-items-center rounded-xl border border-violet-100 bg-violet-50 text-violet-700 transition hover:bg-violet-100"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <h2 className="min-w-[160px] text-center text-xl font-black">
                      {getMonthName(viewDate)}
                    </h2>

                    <button
                      type="button"
                      onClick={() =>
                        setViewDate(
                          new Date(
                            viewDate.getFullYear(),
                            viewDate.getMonth() + 1,
                            1
                          )
                        )
                      }
                      className="grid h-9 w-9 place-items-center rounded-xl border border-violet-100 bg-violet-50 text-violet-700 transition hover:bg-violet-100"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
                        setSelectedDate(formatDate(now));
                      }}
                      className="rounded-xl border border-violet-200 bg-white px-4 py-2 text-xs font-black text-violet-700 transition hover:bg-violet-50"
                    >
                      Today
                    </button>

                    <span className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-black text-white shadow-sm">
                      Month
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-7 overflow-hidden rounded-[18px] border border-slate-200 bg-white">
                  {dayHeaders.map((day) => (
                    <div
                      key={day.label}
                      className={`${day.color} border-r border-slate-200 py-2.5 text-center text-[10px] font-black uppercase tracking-[0.05em] text-slate-900 last:border-r-0`}
                    >
                      {day.label.slice(0, 3)}
                    </div>
                  ))}

                  {calendarCells.map((cell) => (
                    <button
                      key={cell.key}
                      type="button"
                      onClick={() => setSelectedDate(cell.dateString)}
                      className={`relative min-h-24 border-r border-t border-slate-200 p-2.5 text-left transition hover:bg-violet-50/50 ${
                        !cell.isCurrentMonth ? "bg-slate-50 text-slate-300" : ""
                      } ${
                        cell.isSelected
                          ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-inner"
                          : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`text-sm font-black ${
                            cell.isSelected
                              ? "text-white"
                              : cell.isToday
                                ? "rounded-full bg-slate-950 px-2 py-0.5 text-white"
                                : "text-slate-800"
                          }`}
                        >
                          {cell.dayNumber}
                        </span>

                        {cell.savedPlan ? (
                          <span
                            className={`rounded-full px-2 py-1 text-[8px] font-black ${
                              cell.isSelected
                                ? "bg-white/15 text-white"
                                : "bg-pink-50 text-pink-600"
                            }`}
                          >
                            Edited
                          </span>
                        ) : null}
                      </div>

                      {cell.savedPlan?.items?.length ? (
                        <>
                          <div className="mt-3 flex flex-wrap gap-1">
                            {cell.savedPlan.items.slice(0, 5).map((item, itemIndex) => (
                              <span
                                key={`${item.id}-${itemIndex}`}
                                className={`h-2 w-2 rounded-full ${
                                  cell.isSelected
                                    ? "bg-white/70"
                                    : [
                                        "bg-emerald-400",
                                        "bg-pink-400",
                                        "bg-blue-500",
                                        "bg-violet-400",
                                        "bg-orange-400",
                                      ][itemIndex % 5]
                                }`}
                                title={`${item.time} ${item.subject}`}
                              />
                            ))}
                          </div>

                          <p
                            className={`mt-2 line-clamp-1 text-[9px] font-bold ${
                              cell.isSelected ? "text-violet-100" : "text-slate-500"
                            }`}
                          >
                            {cell.savedPlan.items[0]?.subject || "Planned"}
                          </p>
                        </>
                      ) : null}
                    </button>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 rounded-xl bg-slate-50 px-3 py-2.5 text-[9px] font-black text-slate-500">
                  <LegendDot color="bg-emerald-400" label="With Plan" />
                  <LegendDot color="bg-pink-400" label="With Notes" />
                  <LegendDot color="bg-blue-500" label="Activity" />
                  <LegendDot color="bg-violet-500" label="Selected" />
                  <LegendDot color="bg-orange-400" label="Important" />
                </div>
              </section>

              <section className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
                <RecentDiaryCard
                  recentPlans={recentPlans}
                  onSelectDate={setSelectedDate}
                />

                <ImportantNotesCard
                  notes={notes}
                  onChange={setNotes}
                />
              </section>
            </div>

            <div className="space-y-5">
              <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-500">
                      Today's Diary
                    </p>
                    <h2 className="mt-1 text-xl font-black">
                      {getDateLabel(selectedDate)}
                    </h2>
                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      Week {weekNo} · {monthName}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={addItem}
                      className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-black text-amber-700 transition hover:bg-amber-100"
                    >
                      <Plus size={15} />
                      Add
                    </button>

                    <button
                      type="button"
                      onClick={savePlanner}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-xs font-black text-white shadow-sm transition hover:opacity-95"
                    >
                      <Save size={15} />
                      Save
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <MiniDiaryStat
                    tone="amber"
                    icon={<Sparkles size={16} />}
                    value={totalActivities}
                    label="Activities"
                  />
                  <MiniDiaryStat
                    tone="pink"
                    icon={<Clock3 size={16} />}
                    value={items.filter((item) => item.time).length}
                    label="Times"
                  />
                  <MiniDiaryStat
                    tone="emerald"
                    icon={<CheckCircle2 size={16} />}
                    value={items.filter((item) => item.subject).length}
                    label="Subjects"
                  />
                </div>

                <div className="mt-4">
                  <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                    Planner Title
                  </label>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                  />
                </div>

                <div className="mt-4 space-y-3">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => setDragIndex(index)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => {
                        if (dragIndex === null) return;
                        moveItem(dragIndex, index);
                        setDragIndex(null);
                      }}
                      className="rounded-[18px] border border-slate-200 bg-white p-3 shadow-sm"
                    >
                      <div className="flex gap-3">
                        <button
                          type="button"
                          className="mt-1 cursor-grab rounded-lg p-1 text-violet-400 transition hover:bg-violet-50 hover:text-violet-600"
                        >
                          <GripVertical size={18} />
                        </button>

                        <div className="grid flex-1 gap-2 md:grid-cols-[125px_1fr]">
                          <input
                            value={item.time}
                            onChange={(event) =>
                              updateItem(item.id, "time", event.target.value)
                            }
                            placeholder="8:00–9:30 PM"
                            className="rounded-xl border border-violet-100 bg-violet-50 px-3 py-2.5 text-xs font-black text-violet-700 outline-none"
                          />

                          <input
                            value={item.subject}
                            onChange={(event) =>
                              updateItem(item.id, "subject", event.target.value)
                            }
                            placeholder="Membaca"
                            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-black text-slate-800 outline-none"
                          />

                          <textarea
                            value={item.note}
                            onChange={(event) =>
                              updateItem(item.id, "note", event.target.value)
                            }
                            placeholder="Qisha - KV"
                            className="md:col-span-2 h-16 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-600 outline-none"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => deleteItem(item.id)}
                          className="h-fit rounded-xl bg-rose-50 p-2.5 text-rose-600 transition hover:bg-rose-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-violet-300 bg-violet-50/40 px-4 py-3 text-xs font-black text-violet-700 transition hover:bg-violet-50"
                >
                  <Plus size={15} />
                  Add Class / Activity
                </button>

                {message ? (
                  <div
                    className={`mt-4 rounded-xl px-4 py-3 text-xs font-bold ${
                      message.toLowerCase().includes("violates") ||
                      message.toLowerCase().includes("error")
                        ? "bg-red-50 text-red-600"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {message}
                  </div>
                ) : null}
              </section>

              <section className="grid gap-4 lg:grid-cols-2">
                <ToDoCard />

                <PrivateDiaryCard
                  notes={notes}
                  onChange={setNotes}
                  onSave={savePlanner}
                />
              </section>

              <QuickActionsCard
                selectedDate={selectedDate}
                onToday={() => {
                  const now = new Date();
                  setSelectedDate(formatDate(now));
                  setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
                }}
              />
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}


function DiarySidebar() {
  return (
    <aside className="hidden border-r border-indigo-950/10 bg-[#111735] px-3 py-5 text-white xl:flex xl:flex-col">
      <Link href="/admin" className="flex items-center gap-3 px-2">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-indigo-950/30">
          <Sparkles size={18} />
        </div>
        <div>
          <p className="text-xs font-black tracking-[0.1em]">FD ARCADIA</p>
          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-violet-300">
            Admin Portal
          </p>
        </div>
      </Link>

      <nav className="mt-7 space-y-1.5 text-xs font-black">
        <DiaryNav href="/dashboard" label="Dashboard" />
        <DiaryNav href="/admin" label="Parent Manage" />
        <DiaryNav href="/children" label="Children Manage" />
        <DiaryNav href="/admin/calendar" label="Calendar Diary" active />
        <DiaryNav href="/admin/learning-hub" label="Contents Manage" />
        <DiaryNav href="/custom-worksheet" label="Worksheets" />
        <DiaryNav href="/flashcard-library" label="Flashcard Library" />
        <DiaryNav href="/sifir-deck" label="Sifir Deck" />
        <DiaryNav href="/freebies" label="Freebies" />
      </nav>

      <div className="mt-auto rounded-[18px] bg-gradient-to-br from-indigo-600/50 to-fuchsia-500/30 p-4 text-center">
        <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-yellow-300">
          <Sparkles size={18} />
        </div>
        <p className="mt-2 text-xs font-black">Great work today!</p>
        <p className="mt-1 text-[9px] leading-4 text-indigo-100">
          Keep your teaching notes and plans organised.
        </p>
      </div>
    </aside>
  );
}

function DiaryNav({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-xl px-3 py-2.5 transition ${
        active
          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-950/20"
          : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

function DiaryStat({
  icon,
  label,
  value,
  note,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  note: string;
  tone: "violet" | "emerald" | "amber" | "blue" | "pink";
}) {
  const styles = {
    violet: "border-violet-100 bg-violet-50 text-violet-700",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
    amber: "border-amber-100 bg-amber-50 text-amber-700",
    blue: "border-blue-100 bg-blue-50 text-blue-700",
    pink: "border-pink-100 bg-pink-50 text-pink-700",
  }[tone];

  return (
    <div className={`rounded-[18px] border p-4 shadow-sm ${styles}`}>
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/70 shadow-sm">
          {icon}
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.12em]">
            {label}
          </p>
          <p className="mt-0.5 text-2xl font-black text-slate-950">{value}</p>
          <p className="text-[9px] font-bold opacity-70">{note}</p>
        </div>
      </div>
    </div>
  );
}

function MiniDiaryStat({
  tone,
  icon,
  value,
  label,
}: {
  tone: "amber" | "pink" | "emerald";
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  const styles = {
    amber: "bg-amber-50 text-amber-700",
    pink: "bg-pink-50 text-pink-700",
    emerald: "bg-emerald-50 text-emerald-700",
  }[tone];

  return (
    <div className={`rounded-xl p-3 ${styles}`}>
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/70">
          {icon}
        </div>
        <div>
          <p className="text-lg font-black text-slate-950">{value}</p>
          <p className="text-[9px] font-black">{label}</p>
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function RecentDiaryCard({
  recentPlans,
  onSelectDate,
}: {
  recentPlans: SavedPlan[];
  onSelectDate: (date: string) => void;
}) {
  return (
    <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-950">Recent Diary Entries</h3>
        <FileText size={16} className="text-violet-500" />
      </div>

      <div className="mt-3 space-y-2">
        {recentPlans.length ? (
          recentPlans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => onSelectDate(plan.plan_date)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-left transition hover:border-violet-200 hover:bg-violet-50/50"
            >
              <div>
                <p className="text-[10px] font-black text-slate-800">
                  {getDateLabel(plan.plan_date)}
                </p>
                <p className="mt-0.5 text-[9px] font-semibold text-slate-400">
                  {plan.items?.length || 0} activities
                  {plan.notes ? " · Notes added" : ""}
                </p>
              </div>
              <ChevronRight size={14} className="text-slate-400" />
            </button>
          ))
        ) : (
          <p className="rounded-xl bg-slate-50 p-4 text-center text-[10px] font-semibold text-slate-400">
            No diary entries yet.
          </p>
        )}
      </div>
    </section>
  );
}

function ImportantNotesCard({
  notes,
  onChange,
}: {
  notes: string;
  onChange: (value: string) => void;
}) {
  return (
    <section className="rounded-[22px] border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm">
      <div className="flex items-center gap-2 text-amber-700">
        <StickyNote size={16} />
        <h3 className="text-sm font-black">Important Notes</h3>
      </div>
      <textarea
        value={notes}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Pin important reminders, parent follow-ups, homework notes..."
        className="mt-3 h-32 w-full rounded-xl border border-amber-100 bg-white/80 px-3 py-3 text-xs font-semibold text-slate-700 outline-none focus:border-amber-300"
      />
    </section>
  );
}

function ToDoCard() {
  const [tasks, setTasks] = useState([
    { id: "1", text: "Prepare worksheet", done: false },
    { id: "2", text: "Update parent note", done: false },
    { id: "3", text: "Prepare homework", done: false },
  ]);

  function toggleTask(id: string) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  }

  return (
    <section className="rounded-[22px] border border-emerald-100 bg-emerald-50/60 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-emerald-800">To-Do List</h3>
        <ListChecks size={16} className="text-emerald-600" />
      </div>

      <div className="mt-3 space-y-2">
        {tasks.map((task) => (
          <button
            key={task.id}
            type="button"
            onClick={() => toggleTask(task.id)}
            className="flex w-full items-center gap-2 text-left"
          >
            <span
              className={`grid h-4 w-4 place-items-center rounded border ${
                task.done
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-slate-300 bg-white"
              }`}
            >
              {task.done ? <CheckCircle2 size={11} /> : null}
            </span>
            <span
              className={`text-[10px] font-semibold ${
                task.done ? "text-slate-400 line-through" : "text-slate-700"
              }`}
            >
              {task.text}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function PrivateDiaryCard({
  notes,
  onChange,
  onSave,
}: {
  notes: string;
  onChange: (value: string) => void;
  onSave: () => void;
}) {
  return (
    <section className="rounded-[22px] border border-pink-100 bg-pink-50/60 p-4 shadow-sm">
      <div className="flex items-center gap-2 text-pink-700">
        <StickyNote size={16} />
        <h3 className="text-sm font-black">Private Diary Note</h3>
      </div>

      <textarea
        value={notes}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Things I want to remember about today..."
        className="mt-3 h-24 w-full rounded-xl border border-pink-100 bg-white px-3 py-3 text-[10px] font-semibold text-slate-700 outline-none focus:border-pink-300"
      />

      <button
        type="button"
        onClick={onSave}
        className="mt-3 rounded-xl bg-pink-500 px-3 py-2 text-[10px] font-black text-white transition hover:bg-pink-600"
      >
        Save Note
      </button>
    </section>
  );
}

function QuickActionsCard({
  selectedDate,
  onToday,
}: {
  selectedDate: string;
  onToday: () => void;
}) {
  return (
    <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-black text-slate-950">Quick Actions</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onToday}
          className="rounded-xl bg-violet-50 px-3 py-2 text-[10px] font-black text-violet-700"
        >
          Go to Today
        </button>
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(selectedDate)}
          className="rounded-xl bg-blue-50 px-3 py-2 text-[10px] font-black text-blue-700"
        >
          Copy Date
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl bg-amber-50 px-3 py-2 text-[10px] font-black text-amber-700"
        >
          Print Planner
        </button>
      </div>
    </section>
  );
}