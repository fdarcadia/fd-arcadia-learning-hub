"use client";

import { FormEvent, useState } from "react";
import { Link2, Loader2, Save } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProtectedPage } from "@/components/ProtectedPage";
import { supabase } from "@/lib/supabase";

export default function AdminLearningHubPage() {
  return (
    <ProtectedPage>
      {(user) =>
        user.email === "fdarcadia.hello@gmail.com" ? (
          <AdminLearningHubContent />
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

function AdminLearningHubContent() {
  const [monthNo, setMonthNo] = useState("1");
  const [weekNo, setWeekNo] = useState("1");
  const [day, setDay] = useState("Monday");
  const [timeLabel, setTimeLabel] = useState("");
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [itemType, setItemType] = useState("worksheet");
  const [externalLink, setExternalLink] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    const cleanLink = externalLink.trim();

    if (!cleanLink) {
      setLoading(false);
      setError("Please paste Google Drive / Canva / YouTube link.");
      return;
    }

    const { error: insertError } = await supabase
      .from("learning_hub_items")
      .insert({
        month_no: Number(monthNo),
        week_no: Number(weekNo),
        day,
        time_label: timeLabel,
        category,
        title,
        item_type: itemType,
        external_link: cleanLink,
        file_name: "",
      });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setMessage("Learning Hub content saved successfully.");

    setTimeLabel("");
    setCategory("");
    setTitle("");
    setItemType("worksheet");
    setExternalLink("");
  }

  return (
    <>
      <Navbar />

      <main className="page-shell py-8">
        <section className="rounded-[2rem] bg-indigo-600 p-6 text-white shadow-xl">
          <p className="tracking-[0.25em] text-yellow-200">
            ADMIN UPLOAD
          </p>

          <h1 className="font-display mt-2 text-5xl">
            Learning Hub Content
          </h1>

          <p className="mt-2 text-indigo-100">
            Add schedule item and paste Google Drive, Canva or YouTube link.
          </p>
        </section>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-4 md:grid-cols-3">
            <select
              value={monthNo}
              onChange={(event) => setMonthNo(event.target.value)}
              className="rounded-2xl border px-4 py-3"
            >
              {[1, 2, 3, 4, 5, 6].map((month) => (
                <option key={month} value={month}>
                  Month {month}
                </option>
              ))}
            </select>

            <select
              value={weekNo}
              onChange={(event) => setWeekNo(event.target.value)}
              className="rounded-2xl border px-4 py-3"
            >
              {[1, 2, 3, 4].map((week) => (
                <option key={week} value={week}>
                  Week {week}
                </option>
              ))}
            </select>

            <select
              value={day}
              onChange={(event) => setDay(event.target.value)}
              className="rounded-2xl border px-4 py-3"
            >
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
              ].map((dayName) => (
                <option key={dayName} value={dayName}>
                  {dayName}
                </option>
              ))}
            </select>

            <input
              value={timeLabel}
              onChange={(event) => setTimeLabel(event.target.value)}
              placeholder="Time e.g. 9:00 - 10:30"
              className="rounded-2xl border px-4 py-3"
            />

            <input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Category e.g. Math"
              className="rounded-2xl border px-4 py-3"
              required
            />

            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Title e.g. Number Bonds"
              className="rounded-2xl border px-4 py-3"
              required
            />

            <select
              value={itemType}
              onChange={(event) => setItemType(event.target.value)}
              className="rounded-2xl border px-4 py-3"
            >
              <option value="worksheet">Worksheet</option>
              <option value="slides">Slides</option>
              <option value="video">Video</option>
              <option value="game">Game</option>
              <option value="flashcard">Flashcard</option>
              <option value="pdf">PDF</option>
              <option value="activity">Activity</option>
            </select>

            <div className="md:col-span-2">
              <div className="flex items-center gap-2 rounded-2xl border px-4 py-3">
                <Link2 className="text-indigo-600" size={22} />

                <input
                  value={externalLink}
                  onChange={(event) => setExternalLink(event.target.value)}
                  placeholder="Paste Google Drive / Canva / YouTube link"
                  className="w-full bg-transparent outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-700">
              {message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 font-bold text-white transition hover:bg-indigo-700 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Save size={20} />
            )}
            Save Content Link
          </button>
        </form>
      </main>
    </>
  );
}