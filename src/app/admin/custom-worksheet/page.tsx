"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, FileText, Loader2, Search, Sparkles, Trash2, UploadCloud, Users } from "lucide-react";
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
  const [searchText, setSearchText] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");

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

  const totalAssigned = worksheets.length;
  const uniqueParents = new Set(
    worksheets.map((item) => item.parent_user_id).filter(Boolean)
  ).size;
  const subjectCount = new Set(worksheets.map((item) => item.subject)).size;

  const filteredWorksheets = worksheets.filter((item) => {
    const matchesSearch = `${item.title} ${item.parent_name || ""} ${
      item.description || ""
    }`
      .toLowerCase()
      .includes(searchText.trim().toLowerCase());

    const matchesSubject =
      subjectFilter === "all" || item.subject === subjectFilter;

    return matchesSearch && matchesSubject;
  });

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-950">
      <div className="grid min-h-screen xl:grid-cols-[250px_minmax(0,1fr)]">
        <WorksheetAdminSidebar />

        <section className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <a
                href="/admin"
                className="inline-flex items-center gap-2 text-xs font-black text-indigo-600 transition hover:text-indigo-700"
              >
                <ArrowLeft size={15} />
                Back to Admin
              </a>

              <p className="mt-3 text-[9px] font-black uppercase tracking-[0.2em] text-violet-500">
                Worksheet Management
              </p>

              <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                Custom Worksheet
              </h1>

              <p className="mt-1 max-w-3xl text-sm font-semibold text-slate-400">
                Assign worksheet links to selected parents and manage every resource from one place.
              </p>
            </div>

            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 self-start rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-slate-800"
            >
              Dashboard
            </a>
          </header>

          <section className="relative mt-5 overflow-hidden rounded-[26px] bg-gradient-to-br from-[#111735] via-[#25265f] to-[#5145a6] p-5 text-white shadow-[0_20px_55px_rgba(15,23,42,0.16)] sm:p-6">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-pink-400/20 blur-3xl" />

            <div className="relative grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/10 text-yellow-300">
                  <FileText size={21} />
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-300">
                    Premium Resource Assignment
                  </p>
                  <h2 className="mt-1 text-2xl font-black sm:text-3xl">
                    Create a personalised worksheet library.
                  </h2>
                  <p className="mt-2 max-w-xl text-xs leading-5 text-slate-300">
                    Choose a parent, subject and worksheet link. Each assigned item appears only for that parent.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.06]">
                <HeroStat value={totalAssigned} label="Assigned" />
                <HeroStat value={uniqueParents} label="Parents" />
                <HeroStat value={subjectCount} label="Subjects" />
              </div>
            </div>
          </section>

          <section className="mt-5 grid gap-5 2xl:grid-cols-[0.9fr_1.1fr]">
            <form
              onSubmit={handleSubmit}
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-indigo-500">
                  New Assignment
                </p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">
                  Assign New Worksheet
                </h2>
                <p className="mt-1 text-xs font-semibold text-slate-400">
                  Fill in the worksheet details and select the parent who should receive it.
                </p>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <FieldBlock label="Parent">
                  <select
                    value={selectedParentId}
                    onChange={(e) => setSelectedParentId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                    required
                  >
                    <option value="">Choose parent</option>
                    {parents.map((parent) => (
                      <option key={parent.id} value={parent.id}>
                        {parent.full_name || "No name"} — {parent.email}
                      </option>
                    ))}
                  </select>
                </FieldBlock>

                <FieldBlock label="Subject">
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                  >
                    {subjects.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </FieldBlock>

                <FieldBlock label="Worksheet Title">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Worksheet title"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                    required
                  />
                </FieldBlock>

                <FieldBlock label="Google Drive / Canva Link">
                  <input
                    value={externalLink}
                    onChange={(e) => setExternalLink(e.target.value)}
                    placeholder="Paste external link"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                    required
                  />
                </FieldBlock>

                <div className="md:col-span-2">
                  <FieldBlock label="Description">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Short description"
                      className="min-h-28 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                      rows={3}
                    />
                  </FieldBlock>
                </div>
              </div>

              {error ? (
                <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
                  {error}
                </div>
              ) : null}

              {message ? (
                <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">
                  {message}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-xs font-black text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={17} />
                ) : (
                  <UploadCloud size={17} />
                )}
                {loading ? "Saving..." : "Save & Assign Worksheet"}
              </button>
            </form>

            <section>
              <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Assigned Library
                    </p>
                    <h2 className="mt-1 text-xl font-black text-slate-950">
                      Assigned Worksheets
                    </h2>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <Search size={15} className="text-slate-400" />
                      <input
                        value={searchText}
                        onChange={(event) => setSearchText(event.target.value)}
                        placeholder="Search..."
                        className="w-full bg-transparent text-xs font-semibold text-slate-700 outline-none placeholder:text-slate-400"
                      />
                    </label>

                    <select
                      value={subjectFilter}
                      onChange={(event) => setSubjectFilter(event.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 outline-none"
                    >
                      <option value="all">All Subjects</option>
                      {subjects.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {pageLoading ? (
                <div className="mt-4 flex items-center justify-center gap-2 rounded-[22px] border border-slate-200 bg-white p-10 text-sm font-bold text-slate-400">
                  <Loader2 className="animate-spin" size={20} />
                  Loading...
                </div>
              ) : filteredWorksheets.length === 0 ? (
                <div className="mt-4 rounded-[22px] border border-dashed border-slate-300 bg-white p-10 text-center">
                  <FileText className="mx-auto text-slate-300" size={34} />
                  <p className="mt-3 text-sm font-black text-slate-700">
                    No worksheet assigned yet.
                  </p>
                </div>
              ) : (
                <div className="mt-4 grid gap-3">
                  {filteredWorksheets.map((item) => (
                    <WorksheetCard
                      key={item.id}
                      item={item}
                      onDelete={deleteWorksheet}
                    />
                  ))}
                </div>
              )}
            </section>
          </section>
        </section>
      </div>
    </main>
  );
}


function WorksheetAdminSidebar() {
  return (
    <aside className="hidden border-r border-indigo-950/10 bg-[#111735] px-4 py-6 text-white xl:flex xl:flex-col">
      <a href="/admin" className="flex items-center gap-3 px-2">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-indigo-950/30">
          <Sparkles size={20} />
        </div>
        <div>
          <p className="text-sm font-black tracking-[0.08em]">FD ARCADIA</p>
          <p className="text-[9px] font-black tracking-[0.2em] text-violet-300">
            WORKSHEET ADMIN
          </p>
        </div>
      </a>

      <nav className="mt-8 space-y-1.5 text-xs font-black">
        <SidebarItem href="/dashboard" label="Dashboard" />
        <SidebarItem href="/admin" label="Parent Manage" />
        <SidebarItem href="/admin/calendar" label="Calendar Diary" />
        <SidebarItem href="/admin/learning-hub" label="Learning Hub" />
        <SidebarItem href="/admin/freebies" label="Freebies" />
        <SidebarItem href="/admin/custom-worksheet" label="Custom Worksheet" active />
      </nav>

      <div className="mt-auto rounded-[20px] border border-violet-400/20 bg-gradient-to-br from-violet-600/35 to-indigo-500/15 p-4">
        <Users className="text-yellow-300" size={18} />
        <p className="mt-3 text-xs font-black">Parent Assignments</p>
        <p className="mt-1 text-[10px] leading-5 text-indigo-200">
          Personalise worksheets for selected parent accounts.
        </p>
      </div>
    </aside>
  );
}

function SidebarItem({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <a
      href={href}
      className={`block rounded-xl px-3 py-3 transition ${
        active
          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-950/20"
          : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
      }`}
    >
      {label}
    </a>
  );
}

function HeroStat({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
  return (
    <div className="px-4 py-4 text-center">
      <p className="text-xl font-black text-white sm:text-2xl">{value}</p>
      <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function FieldBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function WorksheetCard({
  item,
  onDelete,
}: {
  item: WorksheetItem;
  onDelete: (id: string) => void;
}) {
  const subjectLabel =
    subjects.find((subject) => subject.value === item.subject)?.label ||
    item.subject;

  const subjectTone =
    {
      "bahasa-melayu": "bg-pink-50 text-pink-700",
      english: "bg-blue-50 text-blue-700",
      mathematics: "bg-amber-50 text-amber-700",
      science: "bg-emerald-50 text-emerald-700",
      "membaca-3m": "bg-violet-50 text-violet-700",
    }[item.subject] || "bg-slate-100 text-slate-600";

  return (
    <article className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-[9px] font-black ${subjectTone}`}>
              {subjectLabel}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black text-slate-500">
              {item.parent_name || "Not assigned"}
            </span>
          </div>

          <h3 className="mt-3 text-lg font-black text-slate-950">
            {item.title}
          </h3>

          {item.description ? (
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
              {item.description}
            </p>
          ) : null}

          <a
            href={item.external_link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-[10px] font-black text-indigo-700 transition hover:bg-indigo-100"
          >
            <ExternalLink size={14} />
            Open Worksheet
          </a>
        </div>

        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="inline-flex items-center gap-2 self-start rounded-xl bg-rose-50 px-3 py-2.5 text-[10px] font-black text-rose-700 transition hover:bg-rose-100"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </article>
  );
}