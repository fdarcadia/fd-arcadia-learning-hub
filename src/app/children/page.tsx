"use client";

import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Baby,
  BarChart3,
  BookOpen,
  BookOpenCheck,
  Camera,
  CheckCircle2,
  ChevronRight,
  FileText,
  Home,
  ImagePlus,
  Loader2,
  Palette,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Trophy,
  Upload,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { ProtectedPage } from "@/components/ProtectedPage";
import { supabase } from "@/lib/supabase";

type Child = {
  id: string;
  parent_id: string;
  child_name: string;
  age: string | null;
  avatar: string | null;
  avatar_url?: string | null;
  avatar_type?: string | null;
  subjects: string[] | null;
  created_at?: string | null;
  school?: string | null;
  level?: string | null;
  reading_level?: string | null;
  math_level?: string | null;
  learning_goal?: string | null;
  parent_notes?: string | null;
};

type ChildFormState = {
  id: string | null;
  child_name: string;
  age: string;
  avatar_url: string;
  avatar_type: "default" | "upload" | "url";
  subjects: string[];
  school: string;
  level: string;
  reading_level: string;
  math_level: string;
  learning_goal: string;
  parent_notes: string;
};

const emptyForm: ChildFormState = {
  id: null,
  child_name: "",
  age: "",
  avatar_url: "/avatars/1.svg",
  avatar_type: "default",
  subjects: [],
  school: "",
  level: "",
  reading_level: "",
  math_level: "",
  learning_goal: "",
  parent_notes: "",
};

const defaultAvatars = [
  "/avatars/1.svg",
  "/avatars/2.svg",
  "/avatars/3.svg",
  "/avatars/4.svg",
  "/avatars/5.svg",
  "/avatars/6.svg",
  "/avatars/7.svg",
  "/avatars/8.svg",
];

const subjects = [
  "Bahasa Melayu",
  "English",
  "Mathematics",
  "Science",
  "Membaca 3M",
];

const levels = [
  "Preschool 4",
  "Preschool 5",
  "Preschool 6",
  "Year 1",
  "Year 2",
  "Year 3",
];

const readingLevels = [
  "Pre Reader",
  "Letter Recognition",
  "Vowels",
  "KV",
  "KVKV",
  "KVK",
  "Sentence",
  "Story Book",
];

const mathLevels = [
  "Numbers 1-10",
  "Numbers 1-20",
  "Counting",
  "Addition",
  "Subtraction",
  "Multiplication",
  "Division",
  "Mixed",
];

const storageBucket = "child-avatars";

export default function ChildrenPage() {
  return (
    <ProtectedPage>
      {(user) => <ChildrenContent parentId={user.id} />}
    </ProtectedPage>
  );
}

function ChildrenContent({ parentId }: { parentId: string }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [children, setChildren] = useState<Child[]>([]);
  const [form, setForm] = useState<ChildFormState>(emptyForm);
  const [activeChildId, setActiveChildId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  async function loadChildren() {
    setLoadingChildren(true);
    setError("");

    const { data, error: loadError } = await supabase
      .from("children")
      .select("*")
      .eq("parent_id", parentId)
      .order("created_at", { ascending: false });

    if (loadError) {
      setError(loadError.message);
      setLoadingChildren(false);
      return;
    }

    const rows = (data || []) as Child[];
    setChildren(rows);

    if (!activeChildId && rows.length > 0) {
      setActiveChildId(rows[0].id);
    }

    setLoadingChildren(false);
  }

  useEffect(() => {
    loadChildren();
  }, [parentId]);

  const activeChild = useMemo(() => {
    return children.find((child) => child.id === activeChildId) || children[0];
  }, [children, activeChildId]);

  const stats = useMemo(() => {
    const totalSubjects = children.reduce(
      (sum, child) => sum + (child.subjects?.length || 0),
      0
    );

    return {
      children: children.length,
      subjects: totalSubjects,
      averageProgress: children.length ? 72 : 0,
      weeklyGoals: children.filter((child) => child.learning_goal).length,
    };
  }, [children]);

  function updateForm<K extends keyof ChildFormState>(
    key: K,
    value: ChildFormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function toggleSubject(subject: string) {
    setForm((current) => ({
      ...current,
      subjects: current.subjects.includes(subject)
        ? current.subjects.filter((item) => item !== subject)
        : [...current.subjects, subject],
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setMessage("");
    setError("");
  }

  function editChild(child: Child) {
    const avatarValue = child.avatar_url || child.avatar || "/avatars/1.svg";
    const avatarType = child.avatar_type === "upload" ? "upload" : defaultAvatars.includes(avatarValue) ? "default" : "url";

    setForm({
      id: child.id,
      child_name: child.child_name || "",
      age: child.age || "",
      avatar_url: avatarValue,
      avatar_type: avatarType,
      subjects: child.subjects || [],
      school: child.school || "",
      level: child.level || "",
      reading_level: child.reading_level || "",
      math_level: child.math_level || "",
      learning_goal: child.learning_goal || "",
      parent_notes: child.parent_notes || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setMessage("");

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload PNG, JPG, WEBP or SVG file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Avatar image must be less than 2MB.");
      return;
    }

    setUploadingAvatar(true);

    const fileExt = file.name.split(".").pop() || "png";
    const fileName = `${parentId}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(storageBucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      setUploadingAvatar(false);
      setError(
        `${uploadError.message}. Make sure Supabase Storage bucket '${storageBucket}' exists and is public.`
      );
      return;
    }

    const { data } = supabase.storage.from(storageBucket).getPublicUrl(fileName);

    setForm((current) => ({
      ...current,
      avatar_url: data.publicUrl,
      avatar_type: "upload",
    }));

    setUploadingAvatar(false);
    setMessage("Avatar uploaded successfully.");
  }

  async function saveChild(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      parent_id: parentId,
      child_name: form.child_name.trim(),
      age: form.age.trim() || null,
      avatar: form.avatar_url.trim() || null,
      avatar_url: form.avatar_url.trim() || null,
      avatar_type: form.avatar_type,
      subjects: form.subjects,
      school: form.school.trim() || null,
      level: form.level.trim() || null,
      reading_level: form.reading_level.trim() || null,
      math_level: form.math_level.trim() || null,
      learning_goal: form.learning_goal.trim() || null,
      parent_notes: form.parent_notes.trim() || null,
    };

    if (!payload.child_name) {
      setSaving(false);
      setError("Please enter child name.");
      return;
    }

    if (form.id) {
      const { error: updateError } = await supabase
        .from("children")
        .update(payload)
        .eq("id", form.id);

      setSaving(false);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setMessage("Child profile updated successfully.");
      resetForm();
      await loadChildren();
      return;
    }

    const { error: insertError } = await supabase.from("children").insert(payload);

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setMessage("Child profile added successfully.");
    resetForm();
    await loadChildren();
  }

  async function deleteChild(id: string) {
    const confirmDelete = window.confirm("Delete this child profile?");
    if (!confirmDelete) return;

    setDeletingId(id);
    setError("");

    const { error: deleteError } = await supabase
      .from("children")
      .delete()
      .eq("id", id);

    setDeletingId("");

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    await loadChildren();
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <div className="grid min-h-screen xl:grid-cols-[250px_minmax(0,1fr)]">
        <ChildrenSidebar totalChildren={children.length} />

        <section className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">
          <header className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <Link
                href="/dashboard"
                className="mb-3 inline-flex items-center gap-2 text-xs font-black text-indigo-600 transition hover:text-indigo-700"
              >
                <ArrowLeft size={20} />
                Back to Dashboard
              </Link>

              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500">
                CHILD PROFILE CENTER
              </p>

              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                My Children
              </h1>

              <p className="mt-1 max-w-3xl text-sm font-semibold text-slate-400">
                Add child profile, upload avatar, set learning level, goal,
                notes and selected subjects.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-slate-800"
              >
                <Plus size={18} />
                Add Child
              </button>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Dashboard
              </Link>
            </div>
          </header>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Children" value={String(stats.children)} />
            <StatCard label="Subjects" value={String(stats.subjects)} />
            <StatCard label="Progress" value={`${stats.averageProgress}%`} />
            <StatCard label="Goals" value={String(stats.weeklyGoals)} />
          </section>

          {children.length > 0 ? (
            <section className="mt-5 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-indigo-500">
                    CHILD SWITCHER
                  </p>
                  <h2 className="mt-1 text-xl font-black text-slate-950">
                    Choose active child
                  </h2>
                </div>
                <Users className="text-indigo-500" size={30} />
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2">
                {children.map((child) => {
                  const avatar = child.avatar_url || child.avatar || "";
                  const active = child.id === activeChild?.id;

                  return (
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => setActiveChildId(child.id)}
                      className={`flex min-w-[210px] items-center gap-3 rounded-[18px] border p-3 text-left transition ${
                        active
                          ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
                          : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/60"
                      }`}
                    >
                      <AvatarImage src={avatar} name={child.child_name} size="sm" />
                      <div>
                        <p className="font-black text-slate-900">{child.child_name}</p>
                        <p className="text-sm font-bold text-slate-500">
                          Age {child.age || "-"} • {child.level || "Level"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          <section className="mt-5 grid gap-5 2xl:grid-cols-[1.08fr_0.92fr]">
            <form
              onSubmit={saveChild}
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-indigo-500">
                    {form.id ? "EDIT CHILD" : "ADD CHILD"}
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-slate-950">
                    {form.id ? "Update Profile" : "Create Profile"}
                  </h2>
                </div>

                {form.id ? (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                  >
                    <X size={20} />
                  </button>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  label="Child Name"
                  value={form.child_name}
                  onChange={(value) => updateForm("child_name", value)}
                  placeholder="e.g. Noah"
                  required
                />

                <InputField
                  label="Age"
                  value={form.age}
                  onChange={(value) => updateForm("age", value)}
                  placeholder="e.g. 5"
                />

                <SelectField
                  label="Level / Grade"
                  value={form.level}
                  onChange={(value) => updateForm("level", value)}
                  options={levels}
                  placeholder="Select level"
                />

                <InputField
                  label="School"
                  value={form.school}
                  onChange={(value) => updateForm("school", value)}
                  placeholder="e.g. PASTI / Preschool"
                />

                <SelectField
                  label="Reading Level"
                  value={form.reading_level}
                  onChange={(value) => updateForm("reading_level", value)}
                  options={readingLevels}
                  placeholder="Select reading level"
                />

                <SelectField
                  label="Math Level"
                  value={form.math_level}
                  onChange={(value) => updateForm("math_level", value)}
                  options={mathLevels}
                  placeholder="Select math level"
                />
              </div>

              <section className="mt-6 rounded-[20px] border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
                <div className="mb-5">
                  <h3 className="text-lg font-black text-slate-900">Avatar</h3>
                  <p className="mt-1 text-xs font-semibold text-slate-400">
                    Choose a default avatar or upload your own image.
                  </p>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1fr_auto_1fr]">
                  <div>
                    <p className="font-black text-slate-700">Choose default avatar</p>

                    <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-4">
                      {defaultAvatars.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() =>
                            setForm((current) => ({
                              ...current,
                              avatar_url: item,
                              avatar_type: "default",
                            }))
                          }
                          className={`relative overflow-hidden rounded-2xl border bg-slate-50 p-2 transition ${
                            form.avatar_url === item
                              ? "border-indigo-500 ring-2 ring-indigo-100"
                              : "border-slate-200 hover:border-indigo-300"
                          }`}
                        >
                          <div className="grid h-16 place-items-center rounded-lg bg-slate-50">
                            <img
                              src={item}
                              alt=""
                              className="h-14 w-14 rounded-lg object-contain"
                            />
                          </div>

                          {form.avatar_url === item ? (
                            <span className="absolute bottom-2 left-2 grid h-6 w-6 place-items-center rounded-full bg-indigo-600 text-white shadow-sm">
                              <CheckCircle2 size={16} />
                            </span>
                          ) : null}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="hidden items-center xl:flex">
                    <div className="grid h-12 w-12 place-items-center rounded-full border border-indigo-100 bg-white text-xs font-black text-slate-500">
                      OR
                    </div>
                  </div>

                  <div>
                    <p className="font-black text-slate-700">Upload your own avatar</p>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-4 flex min-h-[150px] w-full flex-col items-center justify-center rounded-[18px] border-2 border-dashed border-indigo-200 bg-white px-4 py-5 text-center transition hover:border-indigo-300 hover:bg-indigo-50/50"
                    >
                      {uploadingAvatar ? (
                        <>
                          <Loader2 className="animate-spin text-indigo-600" size={38} />
                          <p className="mt-3 font-black text-indigo-700">
                            Uploading avatar...
                          </p>
                        </>
                      ) : (
                        <>
                          <ImagePlus className="text-indigo-600" size={44} />
                          <p className="mt-3 font-black text-indigo-700">
                            Click to upload image
                          </p>
                          <p className="mt-1 text-sm font-bold text-slate-500">
                            PNG, JPG, WEBP or SVG. Max 2MB.
                          </p>
                        </>
                      )}
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={uploadAvatar}
                    />

                    {form.avatar_url ? (
                      <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                        <AvatarImage src={form.avatar_url} name="Avatar preview" size="sm" />
                        <div className="flex-1">
                          <p className="text-sm font-black text-slate-700">
                            {form.avatar_type === "upload"
                              ? "Uploaded avatar selected"
                              : form.avatar_type === "default"
                                ? "Default avatar selected"
                                : "Avatar URL selected"}
                          </p>
                          <p className="break-all text-xs text-slate-500">
                            {form.avatar_url}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setForm((current) => ({
                              ...current,
                              avatar_url: "",
                              avatar_type: "url",
                            }))
                          }
                          className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-6">
                  <InputField
                    label="Avatar Image URL (optional)"
                    value={form.avatar_type === "url" ? form.avatar_url : ""}
                    onChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        avatar_url: value,
                        avatar_type: "url",
                      }))
                    }
                    placeholder="Paste image URL e.g. https://example.com/avatar.png"
                    icon={<Camera size={20} />}
                  />
                  <p className="mt-2 text-sm font-bold text-slate-400">
                    Uploaded or selected avatar will be saved automatically.
                  </p>
                </div>
              </section>

              <div className="mt-5">
                <InputField
                  label="Learning Goal"
                  value={form.learning_goal}
                  onChange={(value) => updateForm("learning_goal", value)}
                  placeholder="e.g. Read 20 pages this week"
                  icon={<Trophy size={20} />}
                />
              </div>

              <div className="mt-5">
                <label className="block">
                  <span className="text-xs font-black text-slate-600">
                    Parent Notes
                  </span>
                  <textarea
                    value={form.parent_notes}
                    onChange={(event) =>
                      updateForm("parent_notes", event.target.value)
                    }
                    placeholder="e.g. Loves math, needs spelling practice..."
                    className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                  />
                </label>
              </div>

              <section className="mt-5">
                <p className="font-black text-indigo-700">Selected Subjects</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {subjects.map((subject) => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => toggleSubject(subject)}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-black transition ${
                        form.subjects.includes(subject)
                          ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50"
                      }`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </section>

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
                  disabled={saving || uploadingAvatar}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : form.id ? (
                    <Save size={20} />
                  ) : (
                    <Plus size={20} />
                  )}
                  {saving ? "Saving..." : form.id ? "Update Child" : "Add Child"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-50"
                >
                  Clear Form
                </button>
              </div>
            </form>

            <section>
              <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
                      CHILDREN
                    </p>
                    <h2 className="mt-1 text-3xl font-black text-indigo-700">
                      Profiles
                    </h2>
                  </div>
                  <Users className="text-indigo-500" size={24} />
                </div>

                {loadingChildren ? (
                  <LoadingCard />
                ) : children.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="space-y-5">
                    {children.map((child) => (
                      <ChildProfileCard
                        key={child.id}
                        child={child}
                        deleting={deletingId === child.id}
                        onEdit={() => editChild(child)}
                        onDelete={() => deleteChild(child.id)}
                      />
                    ))}
                  </div>
                )}
              </section>
            </section>
          </section>
        </section>
      </div>
    </main>
  );
}

function ChildrenSidebar({ totalChildren }: { totalChildren: number }) {
  return (
    <aside className="hidden border-r border-indigo-950/10 bg-[#111735] px-4 py-6 text-white xl:flex xl:flex-col">
      <Link href="/dashboard" className="flex items-center gap-3 px-2">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-indigo-950/30">
          <Sparkles size={26} />
        </div>

        <div>
          <p className="text-sm font-black tracking-[0.08em] text-white">
            FD ARCADIA
          </p>
          <p className="text-[9px] font-black tracking-[0.2em] text-violet-300">
            CHILDREN
          </p>
        </div>
      </Link>

      <nav className="mt-8 space-y-1.5">
        <SidebarLink href="/dashboard" icon={<Home size={22} />}>
          Dashboard
        </SidebarLink>
        <SidebarLink href="/children" icon={<Users size={22} />} active>
          My Children
        </SidebarLink>
        <SidebarLink href="/custom-worksheet" icon={<FileText size={22} />}>
          Custom Worksheet
        </SidebarLink>
        <SidebarLink href="/flashcard-library" icon={<BookOpen size={22} />}>
          Flashcard Library
        </SidebarLink>
      </nav>

      <div className="mt-auto rounded-[20px] border border-violet-400/20 bg-gradient-to-br from-violet-600/35 to-indigo-500/15 p-4 text-white">
        <Baby className="text-yellow-300" size={18} />
        <p className="mt-3 text-xs font-black">Child Profiles</p>
        <h3 className="mt-1 text-lg font-black">{totalChildren} Children</h3>
        <p className="mt-1 text-[10px] leading-5 text-indigo-200">
          Manage learning profile and progress goals.
        </p>
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  icon,
  active,
  children,
}: {
  href: string;
  icon: ReactNode;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-black transition ${
        active
          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-950/20"
          : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}

function ChildProfileCard({
  child,
  deleting,
  onEdit,
  onDelete,
}: {
  child: Child;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const subjectsCount = child.subjects?.length || 0;
  const progress = Math.min(100, 35 + subjectsCount * 12);
  const avatar = child.avatar_url || child.avatar || "";

  return (
    <article className="rounded-[20px] border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex flex-col gap-5 lg:flex-row">
        <AvatarImage src={avatar} name={child.child_name} size="xl" />

        <div className="flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-950">
                {child.child_name}
              </h3>
              <p className="mt-1 font-bold text-slate-600">
                Age: {child.age || "-"} • {child.level || "Level not set"}
              </p>
              <p className="mt-1 text-sm font-bold text-slate-500">
                {child.school || "School not set"}
              </p>
            </div>

            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-700">
              Active
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <MiniInfo label="Reading" value={child.reading_level || "-"} />
            <MiniInfo label="Math" value={child.math_level || "-"} />
            <MiniInfo label="Progress" value={`${progress}%`} />
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-indigo-600"
              style={{ width: `${progress}%` }}
            />
          </div>

          {child.learning_goal ? (
            <div className="mt-4 rounded-xl bg-amber-50 p-3">
              <p className="text-sm font-black text-yellow-800">Weekly Goal</p>
              <p className="mt-1 text-sm text-slate-600">{child.learning_goal}</p>
            </div>
          ) : null}

          {child.parent_notes ? (
            <div className="mt-3 rounded-xl bg-indigo-50 p-3">
              <p className="text-sm font-black text-indigo-700">Parent Notes</p>
              <p className="mt-1 text-sm text-slate-600">{child.parent_notes}</p>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            {(child.subjects || []).map((subject) => (
              <span
                key={subject}
                className="rounded-full bg-white px-3 py-1.5 text-[10px] font-black text-slate-600 shadow-sm"
              >
                {subject}
              </span>
            ))}
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <QuickButton href="/learning-hub" icon={<BookOpenCheck size={16} />}>
              Learning Hub
            </QuickButton>
            <QuickButton href="/custom-worksheet" icon={<FileText size={16} />}>
              Worksheet
            </QuickButton>
            <QuickButton href="/flashcard-library" icon={<BookOpen size={16} />}>
              Flashcard
            </QuickButton>
            <QuickButton
              href={`/children/${child.id}/report`}
              icon={<BarChart3 size={16} />}
            >
              Report
            </QuickButton>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white"
            >
              <Pencil size={17} />
              Edit
            </button>

            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-black text-red-600 disabled:opacity-60"
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
      </div>
    </article>
  );
}

function AvatarImage({
  src,
  name,
  size,
}: {
  src: string;
  name: string;
  size: "sm" | "lg" | "xl";
}) {
  const dimension =
    size === "sm" ? "h-14 w-14" : size === "lg" ? "h-32 w-32" : "h-36 w-36";

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-indigo-50 ${dimension}`}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div className="grid h-full w-full place-items-center text-indigo-600">
          <UserRound size={size === "sm" ? 28 : 60} />
        </div>
      )}

      {size !== "sm" ? (
        <div className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-white text-indigo-600 shadow">
          <UserRound size={20} />
        </div>
      ) : null}
    </div>
  );
}

function QuickButton({
  href,
  icon,
  children,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-3 py-3 text-sm font-black text-indigo-700 shadow-sm transition hover:bg-indigo-50"
    >
      {icon}
      {children}
    </Link>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  required,
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  icon?: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black text-slate-600">{label}</span>
      <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-50">
        {icon ? <span className="text-indigo-600">{icon}</span> : null}
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
        />
      </div>
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black text-slate-600">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">
        {label.toUpperCase()}
      </p>
      <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-3">
      <p className="text-[8px] font-black uppercase tracking-[0.14em] text-slate-400">
        {label.toUpperCase()}
      </p>
      <p className="mt-1 text-sm font-black text-slate-800">{value}</p>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="rounded-[18px] bg-slate-50 p-8 text-center">
      <Loader2 className="mx-auto animate-spin text-indigo-600" size={36} />
      <p className="mt-3 font-bold text-slate-500">Loading children...</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[18px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
      <Baby className="mx-auto text-indigo-400" size={44} />
      <h2 className="mt-3 text-xl font-black text-slate-800">
        No child profile yet
      </h2>
      <p className="mt-2 text-slate-500">
        Add your first child profile using the form.
      </p>
    </div>
  );
}