"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Plus,
  Save,
  Trash2,
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

  return (
    <main className="min-h-screen bg-[#fff8ea] px-4 py-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-bold text-white shadow-md transition hover:-translate-y-1 hover:bg-indigo-700"
            >
              <ArrowLeft size={20} />
              Back Home
            </Link>

            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-2xl bg-yellow-200 px-5 py-3 font-bold text-indigo-700 shadow-md transition hover:-translate-y-1 hover:bg-yellow-300"
            >
              <ArrowLeft size={20} />
              Back to Admin
            </Link>
          </div>

          <div className="rounded-2xl bg-white px-5 py-3 font-bold text-indigo-700 shadow-sm">
            Week {weekNo} · {monthName}
          </div>
        </div>

        <section className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CalendarDays className="text-indigo-600" />
                <p className="tracking-[0.2em] text-sm font-bold text-yellow-600">
                  MONTHLY CALENDAR OVERVIEW
                </p>
              </div>

              <h1 className="font-display mt-2 text-4xl text-indigo-700">
                {getMonthName(viewDate)}
              </h1>

              <p className="mt-1 text-slate-600">
                Click any date to view and edit daily planner.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  setViewDate(
                    new Date(
                      viewDate.getFullYear(),
                      viewDate.getMonth() - 1,
                      1
                    )
                  )
                }
                className="rounded-2xl bg-indigo-50 p-3 text-indigo-700"
              >
                <ChevronLeft />
              </button>

              <button
                onClick={() =>
                  setViewDate(
                    new Date(
                      viewDate.getFullYear(),
                      viewDate.getMonth() + 1,
                      1
                    )
                  )
                }
                className="rounded-2xl bg-indigo-50 p-3 text-indigo-700"
              >
                <ChevronRight />
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-7 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {dayHeaders.map((day) => (
              <div
                key={day.label}
                className={`${day.color} border-r border-slate-200 py-3 text-center text-sm font-black text-slate-900 last:border-r-0`}
              >
                {day.label}
              </div>
            ))}

            {calendarCells.map((cell, index) => {
              const firstItem = cell.savedPlan?.items?.[0];

              return (
                <button
                  key={cell.key}
                  onClick={() => setSelectedDate(cell.dateString)}
                  className={`relative min-h-28 border-r border-t border-slate-200 p-3 text-left transition hover:bg-yellow-50 ${
                    !cell.isCurrentMonth ? "bg-slate-50 text-slate-300" : ""
                  } ${
                    cell.isSelected
                      ? "bg-yellow-50 ring-2 ring-inset ring-yellow-300"
                      : ""
                  }`}
                >
                  <span
                    className={`absolute left-0 top-0 h-4 w-4 rounded-br-lg ${
                      cell.isCurrentMonth ? cell.cornerColor : "bg-slate-200"
                    }`}
                  />

                  <div className="flex items-start justify-between">
                    <p
                      className={`text-lg font-black ${
                        cell.isToday
                          ? "rounded-full bg-indigo-600 px-2 text-white"
                          : "text-slate-800"
                      }`}
                    >
                      {cell.dayNumber}
                    </p>

                    {cell.savedPlan ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">
                        Edited
                      </span>
                    ) : null}
                  </div>

                  {firstItem ? (
                    <div className="mt-4 space-y-1 text-xs">
                      <p className="font-bold text-indigo-700">
                        • {firstItem.time}
                      </p>
                      <p className="line-clamp-1 text-slate-700">
                        {firstItem.subject}
                      </p>
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.6fr]">
          <aside className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm">
            <div className="rounded-2xl bg-indigo-50 p-4">
              <p className="text-sm font-bold text-indigo-500">
                SELECTED DATE
              </p>
              <h2 className="mt-1 text-2xl font-black text-indigo-700">
                {getDateLabel(selectedDate)}
              </h2>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm font-bold text-slate-400">Week</p>
                <p className="mt-1 font-black text-indigo-700">Week {weekNo}</p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm font-bold text-slate-400">Month</p>
                <p className="mt-1 font-black text-indigo-700">{monthName}</p>
              </div>
            </div>

            <div className="mt-5">
              <p className="font-black text-indigo-700">Daily Summary</p>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-yellow-50 p-3 text-center">
                  <p className="text-xl font-black text-indigo-700">
                    {totalActivities}
                  </p>
                  <p className="text-xs text-slate-500">Activities</p>
                </div>

                <div className="rounded-2xl bg-pink-50 p-3 text-center">
                  <p className="text-xl font-black text-indigo-700">
                    {items.filter((item) => item.subject).length}
                  </p>
                  <p className="text-xs text-slate-500">Subjects</p>
                </div>

                <div className="rounded-2xl bg-emerald-50 p-3 text-center">
                  <p className="text-xl font-black text-indigo-700">
                    {items.filter((item) => item.time).length}
                  </p>
                  <p className="text-xs text-slate-500">Times</p>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <label className="font-black text-indigo-700">
                Notes / Remarks
              </label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Focus, reminder, homework, parent note..."
                className="mt-2 h-36 w-full rounded-2xl border border-indigo-100 bg-white px-4 py-3 outline-none"
              />
            </div>
          </aside>

          <section className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="tracking-[0.2em] text-sm font-bold text-yellow-600">
                  DAILY PLANNER
                </p>

                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="mt-1 w-full bg-transparent text-3xl font-black text-indigo-700 outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="rounded-2xl border border-indigo-100 bg-white px-4 py-3 font-bold text-indigo-700 outline-none"
                />

                <button
                  onClick={addItem}
                  className="inline-flex items-center gap-2 rounded-2xl border border-indigo-600 px-4 py-3 font-bold text-indigo-700"
                >
                  <Plus size={18} />
                  Add Activity
                </button>

                <button
                  onClick={savePlanner}
                  className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-bold text-white shadow-md transition hover:bg-indigo-700"
                >
                  <Save size={18} />
                  Save Planner
                </button>
              </div>
            </div>

            <div className="mt-5 space-y-4">
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
                  className="rounded-2xl bg-indigo-50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <button className="mt-3 cursor-grab text-indigo-400">
                      <GripVertical />
                    </button>

                    <div className="grid flex-1 gap-3 md:grid-cols-[150px_1fr_1.3fr]">
                      <input
                        value={item.time}
                        onChange={(event) =>
                          updateItem(item.id, "time", event.target.value)
                        }
                        placeholder="8:00–9:30 PM"
                        className="rounded-2xl bg-white px-4 py-4 text-lg outline-none"
                      />

                      <input
                        value={item.subject}
                        onChange={(event) =>
                          updateItem(item.id, "subject", event.target.value)
                        }
                        placeholder="Membaca"
                        className="rounded-2xl bg-white px-4 py-4 text-lg outline-none"
                      />

                      <textarea
                        value={item.note}
                        onChange={(event) =>
                          updateItem(item.id, "note", event.target.value)
                        }
                        placeholder="Qisha - KV"
                        className="h-16 rounded-2xl bg-white px-4 py-4 text-lg outline-none"
                      />
                    </div>

                    <button
                      onClick={() => deleteItem(item.id)}
                      className="rounded-2xl bg-red-100 p-4 text-red-600"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Drag and drop the purple handle to reorder activities.
            </p>

            {message ? (
              <div
                className={`mt-5 rounded-2xl px-5 py-4 font-bold ${
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
        </section>
      </div>
    </main>
  );
}