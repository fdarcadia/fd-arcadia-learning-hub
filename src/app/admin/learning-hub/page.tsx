"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Edit3,
  ExternalLink,
  FileText,
  Gift,
  Home,
  Link2,
  Loader2,
  LockKeyhole,
  Pencil,
  PlayCircle,
  Plus,
  RefreshCcw,
  Save,
  Sparkles,
  Trash2,
  UploadCloud,
  Users,
  X,
} from "lucide-react";
import { ProtectedPage } from "@/components/ProtectedPage";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "fdarcadia.hello@gmail.com";

type WeekItem = {
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
  visibility: "shared" | "parent" | null;
  created_at?: string;
  updated_at?: string;
};

type FormState = {
  id: string | null;
  month_no: string;
  week_no: string;
  day: string;
  subject: string;
  column_no: string;
  title: string;
  description: string;
  time_start: string;
  time_end: string;
  button_type: string;
  button_text: string;
  link_url: string;
  thumbnail_url: string;
  difficulty: string;
  estimated_minutes: string;
  display_order: string;
  is_active: boolean;
  visibility: "shared" | "parent";
  assigned_parent_ids: string[];
};

type ParentProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  user_type: string | null;
  package_type: string | null;
  learning_hub_unlocked: boolean | null;
  subscription_start: string | null;
  subscription_end: string | null;
};

type LearningHubAccessRow = {
  id: string;
  parent_id: string;
  month_no: number;
  week_no: number | null;
  unlocked: boolean;
  created_at?: string;
  updated_at?: string;
};

const emptyForm: FormState = {
  id: null,
  month_no: "1",
  week_no: "1",
  day: "MON",
  subject: "WARM-UP",
  column_no: "1",
  title: "",
  description: "",
  time_start: "",
  time_end: "",
  button_type: "download",
  button_text: "Download",
  link_url: "",
  thumbnail_url: "",
  difficulty: "",
  estimated_minutes: "",
  display_order: "0",
  is_active: true,
  visibility: "shared",
  assigned_parent_ids: [],
};

const days = [
  { value: "MON", label: "Monday", short: "MON", color: "bg-yellow-100 text-yellow-900" },
  { value: "TUE", label: "Tuesday", short: "TUE", color: "bg-emerald-100 text-emerald-900" },
  { value: "WED", label: "Wednesday", short: "WED", color: "bg-pink-100 text-pink-900" },
  { value: "THU", label: "Thursday", short: "THU", color: "bg-orange-100 text-orange-900" },
  { value: "FRI", label: "Friday", short: "FRI", color: "bg-blue-100 text-blue-900" },
];

const subjects = [
  { value: "NOTES", label: "Notes", icon: "📝", time: "" },
  { value: "WARM-UP", label: "Warm-Up", icon: "☀️", time: "9:00 - 10:30am" },
  { value: "SCIENCE", label: "Science", icon: "🧪", time: "10:30 - 11:00am" },
  { value: "MATH", label: "Math", icon: "🔢", time: "11:15 - 12:30am" },
  { value: "MEMBACA", label: "Membaca", icon: "📖", time: "12:30 - 1:15pm" },
  { value: "LANGUAGE & LITERACY", label: "Language & Literacy", icon: "✏️", time: "2:30 - 3:30pm" },
];

const buttonTypes = [
  { value: "download", label: "Download", icon: Download },
  { value: "play", label: "Play Video", icon: PlayCircle },
  { value: "worksheet", label: "Worksheet", icon: FileText },
  { value: "open", label: "Open Link", icon: ExternalLink },
];

const sidebarLinks = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "Admin", href: "/admin", icon: Users },
  { title: "Learning Hub", href: "/admin/learning-hub", icon: BookOpenCheck },
  { title: "Parent Preview", href: "/learning-hub", icon: Gift },
];

export default function AdminLearningHubPage() {
  return (
    <ProtectedPage>
      {(user) =>
        user.email === ADMIN_EMAIL ? (
          <AdminLearningHubContent email={user.email ?? ""} />
        ) : (
          <AccessDenied />
        )
      }
    </ProtectedPage>
  );
}

function AccessDenied() {
  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-red-100 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-black text-red-600">Access denied</h1>
        <p className="mt-2 text-slate-600">
          This page is only for FD Arcadia admin.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-2xl bg-indigo-600 px-5 py-3 font-black text-white"
        >
          Back Dashboard
        </Link>
      </div>
    </main>
  );
}

function AdminLearningHubContent({ email }: { email: string }) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [items, setItems] = useState<WeekItem[]>([]);
  const [selectedDay, setSelectedDay] = useState("MON");
  const [selectedParentFilter, setSelectedParentFilter] = useState("all");
  const [loadingItems, setLoadingItems] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Subscription / Learning Hub access management
  const [parents, setParents] = useState<ParentProfile[]>([]);
  const [accessRows, setAccessRows] = useState<LearningHubAccessRow[]>([]);
  const [selectedParentId, setSelectedParentId] = useState("");
  const [accessMonth, setAccessMonth] = useState("1");
  const [loadingAccess, setLoadingAccess] = useState(false);
  const [savingAccess, setSavingAccess] = useState(false);
  const [accessMessage, setAccessMessage] = useState("");
  const [accessError, setAccessError] = useState("");

  // Personalised worksheet/link assignment
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [assignmentSaving, setAssignmentSaving] = useState(false);
  const [itemAssignments, setItemAssignments] = useState<Record<string, string>>({});

  const selectedMonth = Number(form.month_no);
  const selectedWeek = Number(form.week_no);

  useEffect(() => {
    setSelectedDay("MON");
    setSelectedParentFilter("all");
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedWeek]);

  useEffect(() => {
    loadParentsForAccess();
  }, []);

  useEffect(() => {
    if (selectedParentId) {
      loadParentAccess(selectedParentId, Number(accessMonth));
    } else {
      setAccessRows([]);
    }
  }, [selectedParentId, accessMonth]);

  async function loadItems() {
    setLoadingItems(true);
    setError("");

    const { data, error: loadError } = await supabase
      .from("learning_hub_week_items")
      .select("*")
      .eq("month_no", selectedMonth)
      .eq("week_no", selectedWeek)
      .order("day", { ascending: true })
      .order("subject", { ascending: true })
      .order("display_order", { ascending: true });

    if (loadError) {
      setError(loadError.message);
      setLoadingItems(false);
      return;
    }

    setItems((data || []) as WeekItem[]);
    setLoadingItems(false);
  }

  useEffect(() => {
    loadItemAssignmentsForWeek(selectedMonth, selectedWeek);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedWeek, items.length]);



  async function loadParentsForAccess() {
    setLoadingAccess(true);
    setAccessError("");

    const { data, error: parentError } = await supabase
      .from("profiles")
      .select(
        `
          id,
          email,
          full_name,
          user_type,
          package_type,
          learning_hub_unlocked,
          subscription_start,
          subscription_end
        `,
      )
      .in("package_type", [
        "learning_hub_weekly",
        "learning_hub_monthly",
        "learning_hub_6month",
        "full_package",
      ])
      .order("full_name", { ascending: true });

    if (parentError) {
      setAccessError(parentError.message);
      setParents([]);
      setLoadingAccess(false);
      return;
    }

    setParents((data || []) as ParentProfile[]);
    setLoadingAccess(false);
  }

  async function loadParentAccess(parentId: string, monthNo: number) {
    setLoadingAccess(true);
    setAccessError("");
    setAccessMessage("");

    const { data, error: accessLoadError } = await supabase
      .from("learning_hub_access")
      .select(
        `
          id,
          parent_id,
          month_no,
          week_no,
          unlocked,
          created_at,
          updated_at
        `,
      )
      .eq("parent_id", parentId)
      .eq("month_no", monthNo);

    if (accessLoadError) {
      setAccessError(accessLoadError.message);
      setAccessRows([]);
      setLoadingAccess(false);
      return;
    }

    setAccessRows((data || []) as LearningHubAccessRow[]);
    setLoadingAccess(false);
  }

  function getAccessRow(monthNo: number, weekNo: number | null) {
    return accessRows.find(
      (row) =>
        row.month_no === monthNo &&
        (weekNo === null ? row.week_no === null : row.week_no === weekNo),
    );
  }

  function getAccessState(monthNo: number, weekNo: number) {
    const exact = getAccessRow(monthNo, weekNo);
    if (exact) return Boolean(exact.unlocked);

    const monthRow = getAccessRow(monthNo, null);
    if (monthRow) return Boolean(monthRow.unlocked);

    const selectedParent = parents.find((parent) => parent.id === selectedParentId);

    // Keep the existing parent-side default:
    // Weekly package gets Month 1 / Week 1 automatically when no override exists.
    return (
      selectedParent?.package_type === "learning_hub_weekly" &&
      monthNo === 1 &&
      weekNo === 1
    );
  }

  async function saveAccessOverride(
    monthNo: number,
    weekNo: number | null,
    unlocked: boolean,
  ) {
    if (!selectedParentId) {
      setAccessError("Please select a parent first.");
      return;
    }

    setSavingAccess(true);
    setAccessError("");
    setAccessMessage("");

    const existing = getAccessRow(monthNo, weekNo);

    let saveError: { message: string } | null = null;

    if (existing) {
      const { error: updateError } = await supabase
        .from("learning_hub_access")
        .update({
          unlocked,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      saveError = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("learning_hub_access")
        .insert({
          parent_id: selectedParentId,
          month_no: monthNo,
          week_no: weekNo,
          unlocked,
        });

      saveError = insertError;
    }

    if (saveError) {
      setAccessError(saveError.message);
      setSavingAccess(false);
      return;
    }

    await loadParentAccess(selectedParentId, monthNo);
    setAccessMessage(
      weekNo === null
        ? `Month ${monthNo} access ${unlocked ? "unlocked" : "locked"}.`
        : `Month ${monthNo} · Week ${weekNo} ${unlocked ? "unlocked" : "locked"}.`,
    );
    setSavingAccess(false);
  }

  async function toggleWeekAccess(weekNo: number) {
    const current = getAccessState(Number(accessMonth), weekNo);
    await saveAccessOverride(Number(accessMonth), weekNo, !current);
  }

  async function toggleMonthAccess() {
    const monthNo = Number(accessMonth);
    const monthRow = getAccessRow(monthNo, null);

    // Month-level control reflects the current effective state.
    // Saving false creates an explicit lock, preventing an accidental open-all.
    const currentlyOpen = [1, 2, 3, 4].some((week) =>
      getAccessState(monthNo, week),
    );

    await saveAccessOverride(monthNo, null, !currentlyOpen);
  }



  async function loadItemAssignmentsForWeek(monthNo: number, weekNo: number) {
    const { data: weekItems, error: itemsError } = await supabase
      .from("learning_hub_week_items")
      .select("id")
      .eq("month_no", monthNo)
      .eq("week_no", weekNo);

    if (itemsError || !weekItems?.length) {
      setItemAssignments({});
      return;
    }

    const itemIds = weekItems.map((item) => item.id);

    const { data: assignments, error: assignmentError } = await supabase
      .from("learning_hub_item_assignments")
      .select("item_id,parent_id")
      .in("item_id", itemIds);

    if (assignmentError) {
      console.error("Learning Hub item assignment load error:", assignmentError);
      setItemAssignments({});
      return;
    }

    const map: Record<string, string> = {};
    for (const row of assignments || []) {
      if (row.item_id && row.parent_id) {
        const ids = map[row.item_id]
          ? map[row.item_id].split(",").filter(Boolean)
          : [];

        if (!ids.includes(row.parent_id)) ids.push(row.parent_id);
        map[row.item_id] = ids.join(",");
      }
    }

    setItemAssignments(map);
  }

  async function loadItemAssignment(itemId: string) {
    setAssignmentLoading(true);

    const { data, error: assignmentError } = await supabase
      .from("learning_hub_item_assignments")
      .select("parent_id")
      .eq("item_id", itemId);

    if (assignmentError) {
      setError(assignmentError.message);
      setAssignmentLoading(false);
      return;
    }

    const assignedParentIds = (data || [])
      .map((row) => row.parent_id)
      .filter(Boolean);

    setForm((current) => ({
      ...current,
      visibility: assignedParentIds.length ? "parent" : "shared",
      assigned_parent_ids: assignedParentIds,
    }));

    setAssignmentLoading(false);
  }
  async function saveItemAssignment(itemId: string) {
    setAssignmentSaving(true);

    const { error: deleteError } = await supabase
      .from("learning_hub_item_assignments")
      .delete()
      .eq("item_id", itemId);

    if (deleteError) {
      setAssignmentSaving(false);
      throw deleteError;
    }

    if (form.visibility === "shared") {
      setAssignmentSaving(false);
      return;
    }

    if (!form.assigned_parent_ids.length) {
      setAssignmentSaving(false);
      throw new Error(
        "Please select at least one parent for this personalised worksheet/link.",
      );
    }

    const rows = form.assigned_parent_ids.map((parentId) => ({
      item_id: itemId,
      parent_id: parentId,
    }));

    const { error: insertError } = await supabase
      .from("learning_hub_item_assignments")
      .insert(rows);

    if (insertError) {
      setAssignmentSaving(false);
      throw insertError;
    }

    setAssignmentSaving(false);
  }
  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function resetForm() {
    setForm((current) => ({
      ...emptyForm,
      month_no: current.month_no,
      week_no: current.week_no,
    }));
    setMessage("");
    setError("");
  }

  async function editItem(item: WeekItem) {
    setForm({
      id: item.id,
      month_no: String(item.month_no),
      week_no: String(item.week_no),
      day: item.day || "MON",
      subject: item.subject || "WARM-UP",
      column_no: String(item.column_no || 1),
      title: item.title || "",
      description: item.description || "",
      time_start: item.time_start || "",
      time_end: item.time_end || "",
      button_type: item.button_type || "download",
      button_text: item.button_text || "",
      link_url: item.link_url || "",
      thumbnail_url: item.thumbnail_url || "",
      difficulty: item.difficulty || "",
      estimated_minutes: item.estimated_minutes ? String(item.estimated_minutes) : "",
      display_order: item.display_order ? String(item.display_order) : "0",
      is_active: item.is_active ?? true,
      visibility: item.visibility === "parent" ? "parent" : "shared",
      assigned_parent_ids: [],
    });

    // Load the selected parent assignment when editing a personalised item.
    await loadItemAssignment(item.id);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    if (!form.title.trim()) {
      setSaving(false);
      setError("Please enter activity title.");
      return;
    }

    const payload = {
      month_no: Number(form.month_no),
      week_no: Number(form.week_no),
      day: form.day,
      subject: form.subject,
      column_no: Number(form.column_no || 1),
      title: form.title.trim(),
      description: form.description.trim() || null,
      time_start: form.time_start.trim() || null,
      time_end: form.time_end.trim() || null,
      button_type: form.button_type,
      button_text: form.button_text.trim() || defaultButtonText(form.button_type),
      link_url: form.link_url.trim() || null,
      thumbnail_url: form.thumbnail_url.trim() || null,
      difficulty: form.difficulty.trim() || null,
      estimated_minutes: form.estimated_minutes ? Number(form.estimated_minutes) : null,
      display_order: Number(form.display_order || 0),
      is_active: form.is_active,
      visibility: form.visibility,
    };

    if (form.id) {
      const { error: updateError } = await supabase
        .from("learning_hub_week_items")
        .update(payload)
        .eq("id", form.id);

      setSaving(false);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      try {
        await saveItemAssignment(form.id);
      } catch (assignmentError) {
        setSaving(false);
        setError(
          assignmentError instanceof Error
            ? assignmentError.message
            : "Unable to save parent assignment.",
        );
        return;
      }

      setMessage(
        form.visibility === "parent"
          ? "Personalised worksheet updated for the selected parent."
          : "Week At A Glance item updated successfully.",
      );
      resetForm();
      await loadItems();
      return;
    }

    const { data: insertedItem, error: insertError } = await supabase
      .from("learning_hub_week_items")
      .insert(payload)
      .select("id")
      .single();

    if (insertError || !insertedItem) {
      setSaving(false);
      setError(insertError?.message || "Unable to save activity.");
      return;
    }

    try {
      await saveItemAssignment(insertedItem.id);
    } catch (assignmentError) {
      // Roll back the item if the parent assignment could not be saved.
      await supabase
        .from("learning_hub_week_items")
        .delete()
        .eq("id", insertedItem.id);

      setSaving(false);
      setError(
        assignmentError instanceof Error
          ? assignmentError.message
          : "Unable to save parent assignment.",
      );
      return;
    }

    setSaving(false);
    setMessage(
      form.visibility === "parent"
        ? "Personalised worksheet saved for the selected parent only."
        : "Week At A Glance item saved successfully.",
    );
    resetForm();
    await loadItems();
  }

  async function deleteItem(id: string) {
    const confirmDelete = window.confirm("Delete this activity?");
    if (!confirmDelete) return;

    setDeletingId(id);
    setError("");
    setMessage("");

    const { error: deleteAssignmentError } = await supabase
      .from("learning_hub_item_assignments")
      .delete()
      .eq("item_id", id);

    if (deleteAssignmentError) {
      setDeletingId("");
      setError(deleteAssignmentError.message);
      return;
    }

    const { error: deleteError } = await supabase
      .from("learning_hub_week_items")
      .delete()
      .eq("id", id);

    setDeletingId("");

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setMessage("Activity deleted successfully.");
    await loadItems();
  }

  const stats = useMemo(() => {
    return {
      total: items.length,
      active: items.filter((item) => item.is_active).length,
      links: items.filter((item) => item.link_url).length,
      videos: items.filter((item) =>
        String(item.button_type || "").toLowerCase().includes("play")
      ).length,
    };
  }, [items]);

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-slate-900">
      <div className="grid min-h-screen xl:grid-cols-[280px_1fr]">
        <AdminSidebar email={email} />

        <section className="px-4 py-6 lg:px-8">
          <header className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <Link
                href="/dashboard"
                className="mb-4 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-indigo-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <ArrowLeft size={20} />
                Back Dashboard
              </Link>

              <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
                ADMIN CMS
              </p>

              <h1 className="mt-1 text-4xl font-black text-indigo-700 sm:text-5xl">
                Week At A Glance Editor
              </h1>

              <p className="mt-2 max-w-3xl text-slate-600">
                Add, edit and remove activities for parent Learning Hub weekly
                planner. Parent buttons will open your Google Drive, Canva or
                YouTube link directly.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/learning-hub/month-${form.month_no}/week-${form.week_no}`}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-black text-white shadow-sm transition hover:bg-indigo-700"
              >
                <ExternalLink size={18} />
                Preview Parent Page
              </Link>

              <Link
  href={`/admin/learning-hub/month/month-${form.month_no}`}
  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-emerald-700"
>
  <CalendarDays size={18} />
  Manage Month
</Link>


              <button
                type="button"
                onClick={loadItems}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-indigo-700 shadow-sm transition hover:bg-indigo-50"
              >
                <RefreshCcw size={18} />
                Refresh
              </button>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-4">
            <StatCard label="Total Items" value={String(stats.total)} />
            <StatCard label="Active" value={String(stats.active)} />
            <StatCard label="With Link" value={String(stats.links)} />
            <StatCard label="Video / Play" value={String(stats.videos)} />
          </section>


          {/* =====================================================
              SUBSCRIPTION / ACCESS CONTROL
              This section only manages learning_hub_access.
              Existing Week At A Glance editor below is unchanged.
          ====================================================== */}
          <section className="mt-6 rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-sm font-black tracking-[0.2em] text-indigo-500">
                  SUBSCRIPTION ACCESS
                </p>
                <h2 className="mt-1 text-3xl font-black text-indigo-700">
                  Parent Week Unlock
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                  Unlock or lock individual weeks for a parent. Monthly,
                  6-month and full packages stay locked until admin activates
                  them. Weekly package keeps its existing Month 1 · Week 1
                  default unless an override is saved.
                </p>
              </div>

              <div className="rounded-2xl bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-700">
                Access is controlled per parent
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
              <label className="block">
                <span className="text-sm font-black text-slate-600">
                  Parent / Student
                </span>
                <select
                  value={selectedParentId}
                  onChange={(event) => setSelectedParentId(event.target.value)}
                  disabled={loadingAccess || savingAccess}
                  className="mt-2 w-full rounded-2xl border border-indigo-100 bg-white px-4 py-3 font-bold text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="">
                    {loadingAccess ? "Loading parents..." : "Select parent"}
                  </option>
                  {parents.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.full_name || parent.email || "Unnamed parent"}{" "}
                      {parent.package_type
                        ? `— ${parent.package_type.replaceAll("_", " ")}`
                        : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-black text-slate-600">
                  Month
                </span>
                <select
                  value={accessMonth}
                  onChange={(event) => setAccessMonth(event.target.value)}
                  disabled={!selectedParentId || loadingAccess || savingAccess}
                  className="mt-2 w-full rounded-2xl border border-indigo-100 bg-white px-4 py-3 font-bold text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                >
                  {[1, 2, 3, 4, 5, 6].map((month) => (
                    <option key={month} value={String(month)}>
                      Month {month}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {selectedParentId ? (
              <>
                {(() => {
                  const selectedParent = parents.find(
                    (parent) => parent.id === selectedParentId,
                  );

                  if (!selectedParent) return null;

                  const subscriptionActive = (() => {
                    if (!selectedParent.learning_hub_unlocked) return false;

                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const start = selectedParent.subscription_start
                      ? new Date(
                          `${selectedParent.subscription_start.slice(0, 10)}T00:00:00`,
                        )
                      : null;

                    const end = selectedParent.subscription_end
                      ? new Date(
                          `${selectedParent.subscription_end.slice(0, 10)}T00:00:00`,
                        )
                      : null;

                    if (start && today < start) return false;
                    if (end && today > end) return false;

                    return true;
                  })();

                  const effectiveWeeks = [1, 2, 3, 4].map((week) => ({
                    week,
                    unlocked: getAccessState(Number(accessMonth), week),
                  }));

                  const unlockedCount = effectiveWeeks.filter(
                    (item) => item.unlocked,
                  ).length;

                  return (
                    <div className="mt-6">
                      <div className="grid gap-3 md:grid-cols-4">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                            Package
                          </p>
                          <p className="mt-1 font-black text-slate-700">
                            {selectedParent.package_type
                              ?.replaceAll("_", " ") || "None"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                            Subscription
                          </p>
                          <p
                            className={`mt-1 font-black ${
                              subscriptionActive
                                ? "text-emerald-600"
                                : "text-red-500"
                            }`}
                          >
                            {subscriptionActive ? "Active" : "Inactive"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                            Month
                          </p>
                          <p className="mt-1 font-black text-slate-700">
                            Month {accessMonth}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                            Available
                          </p>
                          <p className="mt-1 font-black text-indigo-600">
                            {unlockedCount}/4 weeks
                          </p>
                        </div>
                      </div>

                      {!subscriptionActive ? (
                        <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                          This subscription is inactive. Parent-side access
                          remains locked even if an access row exists.
                        </div>
                      ) : null}

                      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {effectiveWeeks.map(({ week, unlocked }) => (
                          <div
                            key={week}
                            className={`rounded-[1.5rem] border p-4 ${
                              unlocked
                                ? "border-emerald-100 bg-emerald-50"
                                : "border-slate-100 bg-slate-50"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                                  Week
                                </p>
                                <h3 className="mt-1 text-xl font-black text-slate-800">
                                  Week {week}
                                </h3>
                              </div>

                              {unlocked ? (
                                <CheckCircle2
                                  className="text-emerald-500"
                                  size={24}
                                />
                              ) : (
                                <LockKeyhole
                                  className="text-slate-400"
                                  size={24}
                                />
                              )}
                            </div>

                            <p
                              className={`mt-3 text-sm font-bold ${
                                unlocked
                                  ? "text-emerald-700"
                                  : "text-slate-500"
                              }`}
                            >
                              {unlocked ? "Unlocked" : "Locked"}
                            </p>

                            <button
                              type="button"
                              onClick={() => toggleWeekAccess(week)}
                              disabled={savingAccess || !subscriptionActive}
                              className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 font-black text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                unlocked
                                  ? "bg-slate-700 hover:bg-slate-800"
                                  : "bg-indigo-600 hover:bg-indigo-700"
                              }`}
                            >
                              {savingAccess ? (
                                <Loader2 className="animate-spin" size={17} />
                              ) : unlocked ? (
                                <LockKeyhole size={17} />
                              ) : (
                                <CheckCircle2 size={17} />
                              )}
                              {unlocked ? "Lock Week" : "Unlock Week"}
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 flex flex-col gap-3 rounded-[1.5rem] border border-indigo-100 bg-indigo-50/60 p-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="font-black text-indigo-700">
                            Month {accessMonth} access
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            Unlocking the month creates a month-level access
                            row for all four weeks. You can still override an
                            individual week afterwards.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={toggleMonthAccess}
                          disabled={savingAccess || !subscriptionActive}
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-black text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {savingAccess ? (
                            <Loader2 className="animate-spin" size={18} />
                          ) : (
                            <CalendarDays size={18} />
                          )}
                          {unlockedCount === 4
                            ? "Lock Month"
                            : "Unlock Month"}
                        </button>
                      </div>

                      {accessError ? (
                        <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 font-bold text-red-700">
                          {accessError}
                        </div>
                      ) : null}

                      {accessMessage ? (
                        <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 font-bold text-emerald-700">
                          {accessMessage}
                        </div>
                      ) : null}
                    </div>
                  );
                })()}
              </>
            ) : (
              <div className="mt-5 rounded-2xl bg-slate-50 p-6 text-center text-sm font-bold text-slate-500">
                Select a parent to manage Learning Hub access.
              </div>
            )}
          </section>

          <section className="mt-6 grid gap-6 2xl:grid-cols-[0.95fr_1.05fr]">
            <form
              onSubmit={handleSubmit}
              className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
                    {form.id ? "EDIT ACTIVITY" : "ADD ACTIVITY"}
                  </p>
                  <h2 className="mt-1 text-3xl font-black text-indigo-700">
                    {form.id ? "Update Box" : "Create New Box"}
                  </h2>
                </div>

                {form.id ? (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-600"
                  >
                    <X size={20} />
                  </button>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <SelectField
                  label="Month"
                  value={form.month_no}
                  onChange={(value) => updateForm("month_no", value)}
                  options={[1, 2, 3, 4, 5, 6].map((month) => ({
                    value: String(month),
                    label: `Month ${month}`,
                  }))}
                />

                <SelectField
                  label="Week"
                  value={form.week_no}
                  onChange={(value) => updateForm("week_no", value)}
                  options={[1, 2, 3, 4].map((week) => ({
                    value: String(week),
                    label: `Week ${week}`,
                  }))}
                />

                <SelectField
                  label="Day"
                  value={form.day}
                  onChange={(value) => updateForm("day", value)}
                  options={days.map((day) => ({
                    value: day.value,
                    label: day.label,
                  }))}
                />

                <SelectField
                  label="Subject / Column"
                  value={form.subject}
                  onChange={(value) => updateForm("subject", value)}
                  options={subjects.map((subject) => ({
                    value: subject.value,
                    label: `${subject.icon} ${subject.label}`,
                  }))}
                />

                <InputField
                  label="Column No"
                  value={form.column_no}
                  onChange={(value) => updateForm("column_no", value)}
                  placeholder="1"
                  type="number"
                />

                <InputField
                  label="Display Order"
                  value={form.display_order}
                  onChange={(value) => updateForm("display_order", value)}
                  placeholder="0"
                  type="number"
                />

                <InputField
                  label="Title"
                  value={form.title}
                  onChange={(value) => updateForm("title", value)}
                  placeholder="e.g. Family Photo Talk"
                  required
                />

                <InputField
                  label="Description"
                  value={form.description}
                  onChange={(value) => updateForm("description", value)}
                  placeholder="Short description"
                />

                <InputField
                  label="Start Time"
                  value={form.time_start}
                  onChange={(value) => updateForm("time_start", value)}
                  placeholder="9:00"
                />

                <InputField
                  label="End Time"
                  value={form.time_end}
                  onChange={(value) => updateForm("time_end", value)}
                  placeholder="10:30"
                />

                <SelectField
                  label="Button Type"
                  value={form.button_type}
                  onChange={(value) => {
                    updateForm("button_type", value);
                    updateForm("button_text", defaultButtonText(value));
                  }}
                  options={buttonTypes.map((type) => ({
                    value: type.value,
                    label: type.label,
                  }))}
                />

                <InputField
                  label="Button Text"
                  value={form.button_text}
                  onChange={(value) => updateForm("button_text", value)}
                  placeholder="Download / Play / Open"
                />

                <InputField
                  label="Difficulty"
                  value={form.difficulty}
                  onChange={(value) => updateForm("difficulty", value)}
                  placeholder="Easy / Medium / Hard"
                />

                <InputField
                  label="Estimated Minutes"
                  value={form.estimated_minutes}
                  onChange={(value) => updateForm("estimated_minutes", value)}
                  placeholder="15"
                  type="number"
                />

                <div className="md:col-span-2">
                  <InputField
                    label="Google Drive / Canva / YouTube Link"
                    value={form.link_url}
                    onChange={(value) => updateForm("link_url", value)}
                    placeholder="https://drive.google.com/..."
                    icon={<Link2 size={20} />}
                  />
                </div>

                <div className="md:col-span-2">
                  <InputField
                    label="Thumbnail URL or Emoji"
                    value={form.thumbnail_url}
                    onChange={(value) => updateForm("thumbnail_url", value)}
                    placeholder="Paste image URL or emoji e.g. 📖"
                    icon={<UploadCloud size={20} />}
                  />
                </div>


                <div className="md:col-span-2 rounded-[1.5rem] border border-indigo-100 bg-indigo-50/60 p-4">
                  <p className="text-sm font-black tracking-[0.14em] text-indigo-500">
                    CONTENT VISIBILITY
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Choose whether this worksheet/link is shared with all
                    parents who can access the week, or only one selected parent.
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => {
                        updateForm("visibility", "shared");
                        updateForm("assigned_parent_ids", []);
                      }}
                      className={`rounded-2xl border p-4 text-left transition ${
                        form.visibility === "shared"
                          ? "border-indigo-300 bg-white shadow-sm"
                          : "border-white bg-white/60"
                      }`}
                    >
                      <p className="font-black text-slate-800">Shared Content</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        All parents with access to this week can see it.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateForm("visibility", "parent")}
                      className={`rounded-2xl border p-4 text-left transition ${
                        form.visibility === "parent"
                          ? "border-indigo-300 bg-white shadow-sm"
                          : "border-white bg-white/60"
                      }`}
                    >
                      <p className="font-black text-indigo-700">
                        Selected Parent Only
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Only the selected parent will see this worksheet/link.
                      </p>
                    </button>
                  </div>

                  {form.visibility === "parent" ? (
                    <div className="mt-4">
                      <p className="mb-2 text-sm font-black text-slate-700">
                        Select Parent(s)
                      </p>

                      <div className="max-h-64 space-y-2 overflow-y-auto rounded-2xl border border-indigo-100 bg-white p-2">
                        {parents.map((parent) => {
                          const checked = form.assigned_parent_ids.includes(parent.id);

                          return (
                            <label
                              key={parent.id}
                              className={`flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition ${
                                checked
                                  ? "bg-indigo-50 text-indigo-700"
                                  : "text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={assignmentLoading || assignmentSaving}
                                onChange={(event) => {
                                  const next = event.target.checked
                                    ? [...form.assigned_parent_ids, parent.id]
                                    : form.assigned_parent_ids.filter(
                                        (id) => id !== parent.id,
                                      );

                                  updateForm("assigned_parent_ids", next);
                                }}
                                className="h-5 w-5 rounded border-indigo-200 text-indigo-600 focus:ring-indigo-500"
                              />
                              <div className="min-w-0">
                                <p className="font-bold">
                                  {parent.full_name || parent.email || "Unnamed parent"}
                                </p>
                                {parent.full_name && parent.email ? (
                                  <p className="truncate text-xs text-slate-400">
                                    {parent.email}
                                  </p>
                                ) : null}
                              </div>
                            </label>
                          );
                        })}

                        {!parents.length ? (
                          <p className="p-4 text-sm font-bold text-red-500">
                            No Learning Hub subscriber found.
                          </p>
                        ) : null}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                          {form.assigned_parent_ids.length} parent
                          {form.assigned_parent_ids.length === 1 ? "" : "s"} selected
                        </span>

                        {form.assigned_parent_ids.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => updateForm("assigned_parent_ids", [])}
                            className="text-xs font-black text-slate-400 hover:text-red-500"
                          >
                            Clear selection
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>

                <label className="flex items-center gap-3 rounded-2xl bg-indigo-50 px-4 py-4 font-black text-indigo-700 md:col-span-2">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(event) => updateForm("is_active", event.target.checked)}
                    className="h-5 w-5 accent-indigo-600"
                  />
                  Show this item to parent
                </label>
              </div>

              {error ? (
                <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 font-bold text-red-700">
                  {error}
                </div>
              ) : null}

              {message ? (
                <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 font-bold text-emerald-700">
                  {message}
                </div>
              ) : null}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 font-black text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Save size={20} />
                  )}
                  {saving ? "Saving..." : form.id ? "Update Activity" : "Save Activity"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-6 py-4 font-black text-slate-700 transition hover:bg-slate-200"
                >
                  Clear Form
                </button>
              </div>
            </form>

            <section className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
                    WEEK ITEMS
                  </p>
                  <h2 className="mt-1 text-3xl font-black text-indigo-700">
                    Month {form.month_no} - Week {form.week_no}
                  </h2>
                </div>
                <BookOpenCheck className="text-indigo-600" size={34} />
              </div>

              {loadingItems ? (
                <div className="rounded-2xl bg-indigo-50 p-8 text-center">
                  <Loader2 className="mx-auto animate-spin text-indigo-600" size={32} />
                  <p className="mt-3 font-bold text-slate-500">Loading items...</p>
                </div>
              ) : items.length === 0 ? (
                <EmptyItems />
              ) : (
                <div>
                  <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {days.map((day) => {
                      const dayItems = items.filter((item) => {
                        if (item.day !== day.value) return false;
                        if (selectedParentFilter === "all") return true;
                        if (selectedParentFilter === "shared") {
                          return !itemAssignments[item.id];
                        }
                        return itemAssignments[item.id]?.split(",").includes(selectedParentFilter);
                      });
                      const active = selectedDay === day.value;

                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => setSelectedDay(day.value)}
                          className={`rounded-2xl border px-3 py-3 text-left transition ${
                            active
                              ? "border-indigo-200 bg-indigo-50 shadow-sm"
                              : "border-slate-100 bg-slate-50 hover:border-indigo-100 hover:bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-xs font-black tracking-[0.14em] ${
                                active ? "text-indigo-700" : "text-slate-500"
                              }`}
                            >
                              {day.short}
                            </span>
                            <span
                              className={`grid h-6 min-w-6 place-items-center rounded-full px-1 text-xs font-black ${
                                active
                                  ? "bg-indigo-600 text-white"
                                  : "bg-white text-slate-500"
                              }`}
                            >
                              {dayItems.length}
                            </span>
                          </div>
                          <p
                            className={`mt-1 text-sm font-bold ${
                              active ? "text-indigo-700" : "text-slate-600"
                            }`}
                          >
                            {day.label}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mb-5 rounded-[1.5rem] border border-indigo-100 bg-white/80 p-4 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-xs font-black tracking-[0.18em] text-indigo-400">
                          FILTER BY PARENT
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Check which worksheets are shared and which are assigned to a specific parent.
                        </p>
                      </div>

                      <select
                        value={selectedParentFilter}
                        onChange={(event) => setSelectedParentFilter(event.target.value)}
                        className="min-w-[260px] rounded-2xl border border-indigo-100 bg-white px-4 py-3 text-sm font-bold text-indigo-700 outline-none focus:border-indigo-300"
                      >
                        <option value="all">All parents / all content</option>
                        <option value="shared">Shared — everyone</option>
                        {parents.map((parent) => (
                          <option key={parent.id} value={parent.id}>
                            {parent.full_name || parent.email || "Unnamed parent"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {(() => {
                    const currentDay = days.find((day) => day.value === selectedDay);
                    const dayItems = items.filter((item) => {
                      if (item.day !== selectedDay) return false;
                      if (selectedParentFilter === "all") return true;
                      if (selectedParentFilter === "shared") {
                        return !itemAssignments[item.id];
                      }
                      return itemAssignments[item.id]?.split(",").includes(selectedParentFilter);
                    });

                    return (
                      <div>
                        <div className="mb-4 flex items-end justify-between gap-3">
                          <div>
                            <p className="text-xs font-black tracking-[0.18em] text-slate-400">
                              {currentDay?.short || selectedDay}
                            </p>
                            <h3 className="mt-1 text-2xl font-black text-indigo-700">
                              {currentDay?.label || selectedDay} Activities
                            </h3>
                          </div>
                          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                            {dayItems.length} {dayItems.length === 1 ? "activity" : "activities"}
                          </span>
                        </div>

                        {dayItems.length === 0 ? (
                          <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                            <CalendarDays className="mx-auto text-slate-300" size={34} />
                            <p className="mt-3 font-black text-slate-500">
                              No activities for {currentDay?.label || selectedDay}.
                            </p>
                            <p className="mt-1 text-sm text-slate-400">
                              Add an activity using the form on the left.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {dayItems.map((item) => (
                              <ItemRow
                                key={item.id}
                                item={item}
                                deleting={deletingId === item.id}
                                onEdit={() => editItem(item)}
                                onDelete={() => deleteItem(item.id)}
                                assignedParentName={
                                  itemAssignments[item.id]
                                    ? itemAssignments[item.id]
                                        .split(",")
                                        .map((parentId) => {
                                          const parent = parents.find((p) => p.id === parentId);
                                          return parent?.full_name || parent?.email || "";
                                        })
                                        .filter(Boolean)
                                        .join(", ")
                                    : ""
                                }
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </section>
          </section>
        </section>
      </div>
    </main>
  );
}

function AdminSidebar({ email }: { email: string }) {
  return (
    <aside className="hidden border-r border-indigo-100 bg-white p-6 xl:block">
      <Link href="/dashboard" className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600 text-yellow-200 shadow-lg">
          <Sparkles size={26} />
        </div>

        <div>
          <p className="text-xl font-black tracking-[0.18em] text-slate-900">
            FD ARCADIA
          </p>
          <p className="text-sm font-black tracking-[0.25em] text-indigo-600">
            LEARNING HUB
          </p>
        </div>
      </Link>

      <nav className="mt-10 space-y-2">
        {sidebarLinks.map((item) => {
          const Icon = item.icon;
          const active = item.title === "Learning Hub";

          return (
            <Link
              key={item.title}
              href={item.href}
              className={`flex items-center gap-4 rounded-2xl px-4 py-3 font-black transition ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-indigo-700"
              }`}
            >
              <Icon size={22} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="mt-10 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-xl">
        <Pencil className="text-yellow-200" size={30} />
        <p className="mt-4 font-black">Admin Mode</p>
        <h3 className="mt-1 text-xl font-black">Week Editor</h3>
        <p className="mt-2 break-words text-sm text-indigo-100">{email}</p>
      </div>
    </aside>
  );
}

function ItemRow({
  item,
  deleting,
  onEdit,
  onDelete,
  assignedParentName,
}: {
  item: WeekItem;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
  assignedParentName?: string;
}) {
  const subject = subjects.find((entry) => entry.value === item.subject);
  const button = buttonTypes.find((entry) => entry.value === item.button_type);
  const ButtonIcon = button?.icon || ExternalLink;

  return (
    <article className="rounded-[1.5rem] border border-indigo-100 bg-[#fbfaf7] p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-3xl">
            {item.thumbnail_url && item.thumbnail_url.length <= 4
              ? item.thumbnail_url
              : subject?.icon || "📌"}
          </div>

          <div>
            <div className="flex flex-wrap gap-2">
              <Badge text={`Month ${item.month_no}`} />
              <Badge text={`Week ${item.week_no}`} />
              <Badge text={item.day} />
              <Badge text={item.subject} />
              {item.is_active ? (
                <Badge text="Active" green />
              ) : (
                <Badge text="Hidden" gray />
              )}
              {item.visibility === "parent" ? (
                <Badge text="Personalised" />
              ) : null}
              {item.visibility === "parent" && assignedParentName ? (
                <span className="inline-flex max-w-[260px] items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                  👤 {assignedParentName}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
                  Shared · All Parents
                </span>
              )}
            </div>

            <h3 className="mt-3 text-xl font-black text-indigo-700">
              {item.title}
            </h3>

            {item.description ? (
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {item.description}
              </p>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-2 text-sm font-bold text-slate-500">
              {item.time_start || item.time_end ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1">
                  <Clock3 size={14} />
                  {item.time_start || ""} {item.time_end ? `- ${item.time_end}` : ""}
                </span>
              ) : null}

              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1">
                <ButtonIcon size={14} />
                {item.button_text || defaultButtonText(item.button_type || "open")}
              </span>

              {item.estimated_minutes ? (
                <span className="rounded-full bg-white px-3 py-1">
                  {item.estimated_minutes} min
                </span>
              ) : null}

              {item.link_url ? (
                <a
                  href={item.link_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-indigo-600"
                >
                  Open Link
                  <ExternalLink size={14} />
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 font-black text-white"
          >
            <Edit3 size={17} />
            Edit
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 font-black text-red-600 disabled:opacity-60"
          >
            {deleting ? (
              <Loader2 className="animate-spin" size={17} />
            ) : (
              <Trash2 size={17} />
            )}
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-600">{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-indigo-100 bg-white px-4 py-3 font-bold text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-600">{label}</span>
      <div className="mt-2 flex items-center gap-2 rounded-2xl border border-indigo-100 bg-white px-4 py-3 transition focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100">
        {icon ? <span className="text-indigo-600">{icon}</span> : null}
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          type={type}
          className="w-full bg-transparent font-bold text-slate-800 outline-none placeholder:text-slate-400"
        />
      </div>
    </label>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-indigo-100 bg-white p-5 shadow-sm">
      <p className="text-sm font-black tracking-[0.18em] text-yellow-600">
        {label.toUpperCase()}
      </p>
      <p className="mt-2 text-3xl font-black text-indigo-700">{value}</p>
    </div>
  );
}

function Badge({
  text,
  green,
  gray,
}: {
  text: string;
  green?: boolean;
  gray?: boolean;
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-black ${
        green
          ? "bg-emerald-100 text-emerald-700"
          : gray
            ? "bg-slate-100 text-slate-500"
            : "bg-indigo-50 text-indigo-700"
      }`}
    >
      {text}
    </span>
  );
}

function EmptyItems() {
  return (
    <div className="rounded-[1.5rem] bg-indigo-50 p-8 text-center">
      <FileText className="mx-auto text-indigo-400" size={40} />
      <h3 className="mt-3 text-xl font-black text-indigo-700">
        No items yet
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Add your first activity using the form.
      </p>
    </div>
  );
}

function defaultButtonText(type: string) {
  if (type === "play") return "Play";
  if (type === "worksheet") return "Worksheet";
  if (type === "open") return "Open";
  return "Download";
}
