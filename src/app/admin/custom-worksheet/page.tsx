"use client";

import { FormEvent, useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProtectedPage } from "@/components/ProtectedPage";
import { supabase } from "@/lib/supabase";

const subjects = [
  { value: "bahasa-melayu", label: "Bahasa Melayu" },
  { value: "english", label: "English" },
  { value: "mathematics", label: "Mathematics" },
  { value: "science", label: "Science" },
  { value: "membaca-3m", label: "Membaca 3M" },
];

export default function AdminCustomWorksheetPage() {
  return (
    <ProtectedPage>
      {(user) =>
        user.email === "fdarcadia.hello@gmail.com" ? (
          <AdminCustomWorksheetContent />
        ) : (
          <>
            <Navbar />
            <main className="page-shell py-10">
              <h1 className="text-3xl font-bold text-red-600">Access denied</h1>
            </main>
          </>
        )
      }
    </ProtectedPage>
  );
}

function AdminCustomWorksheetContent() {
  const [subject, setSubject] = useState("bahasa-melayu");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [externalLink, setExternalLink] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const { error } = await supabase.from("custom_worksheet_items").insert({
      subject,
      title,
      description,
      external_link: externalLink,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Worksheet link saved successfully.");
    setTitle("");
    setDescription("");
    setExternalLink("");
  }

  return (
    <>
      <Navbar />

      <main className="page-shell py-8">
        <section className="rounded-[2rem] bg-indigo-600 p-6 text-white shadow-xl">
          <p className="tracking-[0.25em] text-yellow-200">ADMIN UPLOAD</p>
          <h1 className="font-display mt-2 text-5xl">
            Custom Worksheet
          </h1>
          <p className="mt-2 text-indigo-100">
            Paste Google Drive links for purchased worksheet files.
          </p>
        </section>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="rounded-2xl border px-4 py-3"
            >
              {subjects.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Worksheet title"
              className="rounded-2xl border px-4 py-3"
              required
            />

            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description"
              className="rounded-2xl border px-4 py-3"
            />

            <input
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              placeholder="Google Drive / Canva link"
              className="rounded-2xl border px-4 py-3"
              required
            />
          </div>

          {error && (
            <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-700">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 font-bold text-white"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <UploadCloud size={20} />}
            Save Worksheet Link
          </button>
        </form>
      </main>
    </>
  );
}