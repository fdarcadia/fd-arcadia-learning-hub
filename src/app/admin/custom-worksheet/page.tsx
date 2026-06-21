"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, Trash2, UploadCloud } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProtectedPage } from "@/components/ProtectedPage";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "fdarcadia.hello@gmail.com";

const subjects = [
  { value: "bahasa-melayu", label: "Bahasa Melayu" },
  { value: "english", label: "English" },
  { value: "mathematics", label: "Mathematics" },
  { value: "science", label: "Science" },
  { value: "membaca-3m", label: "Membaca 3M" },
];

type ParentProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
};

type WorksheetItem = {
  id: string;
  subject: string;
  title: string;
  description: string | null;
  external_link: string;
  parent_user_id: string | null;
  parent_name: string | null;
  created_at: string;
};

export default function AdminCustomWorksheetPage() {
  return (
    <ProtectedPage>
      {(user) =>
        user.email === ADMIN_EMAIL ? (
          <AdminCustomWorksheetContent />
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

function AdminCustomWorksheetContent() {
  const [parents, setParents] = useState<ParentProfile[]>([]);
  const [worksheets, setWorksheets] = useState<WorksheetItem[]>([]);

  const [subject, setSubject] = useState("bahasa-melayu");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [selectedParentId, setSelectedParentId] = useState("");

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadPageData();
  }, []);

  async function loadPageData() {
    setPageLoading(true);
    setError("");

    const { data: parentData, error: parentError } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .order("full_name", { ascending: true });

    const { data: worksheetData, error: worksheetError } = await supabase
      .from("custom_worksheet_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (parentError) {
      setError(parentError.message);
    } else {
      setParents((parentData || []) as ParentProfile[]);
    }

    if (worksheetError) {
      setError(worksheetError.message);
    } else {
      setWorksheets((worksheetData || []) as WorksheetItem[]);
    }

    setPageLoading(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedParentId) {
      setError("Please choose a parent first.");
      return;
    }

    const selectedParent = parents.find((parent) => parent.id === selectedParentId);

    if (!selectedParent) {
      setError("Selected parent not found.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    const parentName =
      selectedParent.full_name || selectedParent.email || "Unnamed Parent";

    const { error } = await supabase.from("custom_worksheet_items").insert({
      subject,
      title,
      description,
      external_link: externalLink,
      parent_user_id: selectedParent.id,
      parent_name: parentName,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Worksheet link saved and assigned successfully.");
    setTitle("");
    setDescription("");
    setExternalLink("");
    setSelectedParentId("");

    await loadPageData();
  }

  async function deleteWorksheet(id: string) {
    const confirmDelete = confirm("Delete this worksheet link?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("custom_worksheet_items")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    setWorksheets((prev) => prev.filter((item) => item.id !== id));
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
            Paste worksheet links and assign them to specific parents only.
          </p>
        </section>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm"
        >
          <h2 className="text-2xl font-black text-slate-800">
            Assign New Worksheet
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <select
              value={selectedParentId}
              onChange={(e) => setSelectedParentId(e.target.value)}
              className="rounded-2xl border px-4 py-3"
              required
            >
              <option value="">Choose parent</option>
              {parents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.full_name || "No name"} — {parent.email}
                </option>
              ))}
            </select>

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
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              placeholder="Google Drive / Canva link"
              className="rounded-2xl border px-4 py-3"
              required
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description"
              className="rounded-2xl border px-4 py-3 md:col-span-2"
              rows={3}
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
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 font-bold text-white disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <UploadCloud size={20} />
            )}
            Save & Assign Worksheet
          </button>
        </form>

        <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-slate-800">
            Assigned Worksheets
          </h2>

          {pageLoading ? (
            <div className="mt-6 flex items-center gap-2 text-slate-500">
              <Loader2 className="animate-spin" size={20} />
              Loading...
            </div>
          ) : worksheets.length === 0 ? (
            <p className="mt-5 text-slate-500">
              No worksheet assigned yet.
            </p>
          ) : (
            <div className="mt-5 grid gap-4">
              {worksheets.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                      <p className="text-sm font-bold uppercase text-indigo-600">
                        {subjects.find((s) => s.value === item.subject)?.label ||
                          item.subject}
                      </p>

                      <h3 className="mt-1 text-xl font-black text-slate-800">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Parent:{" "}
                        <span className="font-bold">
                          {item.parent_name || "Not assigned"}
                        </span>
                      </p>

                      {item.description && (
                        <p className="mt-2 text-slate-600">
                          {item.description}
                        </p>
                      )}

                      <a
                        href={item.external_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block font-bold text-indigo-600 underline"
                      >
                        Open Link
                      </a>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteWorksheet(item.id)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-4 py-3 font-bold text-white"
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}