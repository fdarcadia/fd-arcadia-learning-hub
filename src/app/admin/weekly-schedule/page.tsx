"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProtectedPage } from "@/components/ProtectedPage";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "fdarcadia.hello@gmail.com";

type ScheduleItem = {
  id: string;
  day: string;
  time_label: string | null;
  title: string;
  note: string | null;
  is_done: boolean;
};

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function AdminWeeklySchedulePage() {
  return (
    <ProtectedPage>
      {(user) =>
        user.email === ADMIN_EMAIL ? (
          <WeeklyScheduleContent />
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

function WeeklyScheduleContent() {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [day, setDay] = useState("Monday");
  const [timeLabel, setTimeLabel] = useState("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadItems() {
    const { data, error: loadError } = await supabase
      .from("admin_weekly_schedule")
      .select("*")
      .order("created_at", { ascending: false });

    if (loadError) {
      setError(loadError.message);
      return;
    }

    setItems((data || []) as ScheduleItem[]);
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const { error: insertError } = await supabase
      .from("admin_weekly_schedule")
      .insert({
        day,
        time_label: timeLabel,
        title,
        note,
        is_done: false,
      });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setTimeLabel("");
    setTitle("");
    setNote("");
    loadItems();
  }

  async function toggleDone(item: ScheduleItem) {
    await supabase
      .from("admin_weekly_schedule")
      .update({ is_done: !item.is_done })
      .eq("id", item.id);

    loadItems();
  }

  async function deleteItem(id: string) {
    await supabase.from("admin_weekly_schedule").delete().eq("id", id);
    loadItems();
  }

  return (
    <>
      <Navbar />

      <main className="page-shell py-8">
        <section className="rounded-[2rem] bg-indigo-600 p-6 text-white shadow-xl">
          <p className="tracking-[0.25em] text-yellow-200">
            ADMIN WEEKLY PLANNER
          </p>

          <h1 className="font-display mt-2 text-5xl">
            Weekly Schedule & To-Do
          </h1>

          <p className="mt-2 text-indigo-100">
            Add admin schedule, task list and mark completed items.
          </p>
        </section>

        <form
          onSubmit={addItem}
          className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <select
              value={day}
              onChange={(event) => setDay(event.target.value)}
              className="rounded-2xl border px-4 py-3"
            >
              {days.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <input
              value={timeLabel}
              onChange={(event) => setTimeLabel(event.target.value)}
              placeholder="Time e.g. 9:00 - 10:00"
              className="rounded-2xl border px-4 py-3"
            />

            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Task / Schedule title"
              className="rounded-2xl border px-4 py-3"
              required
            />

            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Note optional"
              className="rounded-2xl border px-4 py-3"
            />
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 font-bold text-white"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
            Add Schedule
          </button>
        </form>

        <section className="mt-8 grid gap-5">
          {days.map((dayName) => {
            const dayItems = items.filter((item) => item.day === dayName);

            return (
              <div key={dayName} className="rounded-[2rem] bg-white p-6 shadow-sm">
                <h2 className="text-3xl font-bold text-indigo-700">
                  {dayName}
                </h2>

                <div className="mt-5 grid gap-3">
                  {dayItems.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-2xl border p-4 ${
                        item.is_done
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-indigo-100 bg-indigo-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-slate-500">
                            {item.time_label || "No time"}
                          </p>

                          <h3
                            className={`text-2xl font-bold ${
                              item.is_done
                                ? "text-emerald-700 line-through"
                                : "text-indigo-700"
                            }`}
                          >
                            {item.title}
                          </h3>

                          <p className="mt-1 text-slate-600">
                            {item.note || "-"}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleDone(item)}
                            className="rounded-2xl bg-emerald-100 p-3 text-emerald-700"
                          >
                            <CheckCircle2 size={20} />
                          </button>

                          <button
                            onClick={() => deleteItem(item.id)}
                            className="rounded-2xl bg-red-100 p-3 text-red-700"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {dayItems.length === 0 ? (
                    <p className="rounded-2xl bg-slate-50 p-4 text-slate-500">
                      No schedule yet.
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </>
  );
}