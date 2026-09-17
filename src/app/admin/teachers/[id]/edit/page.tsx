"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  Save,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Gender = "female" | "male";
type TeacherStatus = "active" | "inactive" | "suspended";

type Teacher = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  gender: Gender;
  image_url: string | null;
  status: TeacherStatus;
  access_start: string;
  access_expires: string;
};

const teacherImages: Record<Gender, string> = {
  female: "/images/teachers/teacher_hero_female.png",
  male: "/images/teachers/teacher_hero_male.png",
};

function formatDate(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export default function EditTeacherPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const teacherId = params?.id;

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<Gender>("female");
  const [status, setStatus] = useState<TeacherStatus>("active");
  const [accessStart, setAccessStart] = useState("");
  const [accessExpires, setAccessExpires] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!teacherId) return;

    async function loadTeacher() {
      setLoading(true);
      setError("");

      const { data, error: queryError } = await supabase
        .from("teachers")
        .select(
          "id,user_id,full_name,email,gender,image_url,status,access_start,access_expires"
        )
        .eq("id", teacherId)
        .maybeSingle();

      if (queryError) {
        setError(queryError.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setError("Teacher not found.");
        setLoading(false);
        return;
      }

      const item = data as Teacher;

      setTeacher(item);
      setFullName(item.full_name);
      setEmail(item.email);
      setGender(item.gender);
      setStatus(item.status);
      setAccessStart(item.access_start);
      setAccessExpires(item.access_expires);
      setLoading(false);
    }

    loadTeacher();
  }, [teacherId]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!teacherId) return;

    setSaving(true);
    setError("");
    setSuccess("");

    const image_url = teacherImages[gender];

    const { data, error: updateError } = await supabase
      .from("teachers")
      .update({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        gender,
        image_url,
        status,
        access_start: accessStart,
        access_expires: accessExpires,
      })
      .eq("id", teacherId)
      .select(
        "id,user_id,full_name,email,gender,image_url,status,access_start,access_expires"
      )
      .single();

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setTeacher(data as Teacher);
    setSuccess("Teacher details updated successfully.");
    setSaving(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f7fb] p-6">
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-white p-12 text-center shadow-sm">
          <p className="font-bold text-slate-400">Loading teacher...</p>
        </div>
      </main>
    );
  }

  if (!teacher) {
    return (
      <main className="min-h-screen bg-[#f6f7fb] p-6">
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-white p-10 text-center shadow-sm">
          <X className="mx-auto text-red-400" size={38} />
          <h1 className="mt-4 text-2xl font-black text-slate-900">
            Teacher not found
          </h1>
          <Link
            href="/admin/teachers"
            className="mt-5 inline-flex rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-black text-white"
          >
            Back to Teachers
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* TOP */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin/teachers"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft size={17} />
            Back to Teacher Management
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-indigo-700">
            <ShieldCheck size={15} />
            Admin Only
          </div>
        </div>

        {/* HEADER */}
        <section className="mt-6 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#111735] via-[#29255e] to-[#6652c7] p-6 text-white shadow-xl sm:p-8">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-300">
            Teacher Account
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Edit Teacher
          </h1>
          <p className="mt-2 text-sm font-semibold text-slate-300">
            Update teacher information, illustration, status and access dates.
          </p>
        </section>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-xs font-bold text-red-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-xs font-bold text-emerald-700">
            <Check size={17} />
            {success}
          </div>
        ) : null}

        <form
          onSubmit={handleSave}
          className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]"
        >
          {/* FORM */}
          <section className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-7">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-500">
                Profile Details
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">
                Teacher Information
              </h2>
            </div>

            <div className="space-y-5">
              <Field label="Teacher Name">
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="input"
                  placeholder="Teacher name"
                />
              </Field>

              <Field label="Login Email">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input"
                  placeholder="teacher@email.com"
                />
                <p className="mt-1.5 text-[10px] font-semibold text-slate-400">
                  This updates the teacher profile email. Supabase Auth email
                  remains unchanged in this page.
                </p>
              </Field>

              {/* GENDER */}
              <div>
                <label className="mb-3 block text-sm font-bold text-slate-700">
                  Teacher Illustration
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  {(["female", "male"] as Gender[]).map((option) => {
                    const selected = gender === option;

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setGender(option)}
                        className={`relative flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition ${
                          selected
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-slate-100 bg-slate-50 hover:border-indigo-200"
                        }`}
                      >
                        <div className="h-20 w-16 overflow-hidden rounded-xl bg-white">
                          <img
                            src={teacherImages[option]}
                            alt={`${option} teacher`}
                            className="h-full w-full object-contain"
                          />
                        </div>

                        <div>
                          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                            Illustration
                          </p>
                          <p className="mt-1 text-lg font-black capitalize text-indigo-800">
                            {option}
                          </p>
                        </div>

                        {selected ? (
                          <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-indigo-500 text-white">
                            <Check size={14} />
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STATUS */}
              <Field label="Teacher Status">
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as TeacherStatus)
                  }
                  className="input"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </Field>

              {/* ACCESS */}
              <div className="rounded-[1.5rem] bg-gradient-to-br from-violet-50 to-pink-50 p-5">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-500">
                  Access Period
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Access Start">
                    <input
                      type="date"
                      value={accessStart}
                      onChange={(e) => setAccessStart(e.target.value)}
                      required
                      className="input bg-white"
                    />
                  </Field>

                  <Field label="Access Expires">
                    <input
                      type="date"
                      value={accessExpires}
                      onChange={(e) => setAccessExpires(e.target.value)}
                      required
                      className="input bg-white"
                    />
                  </Field>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 text-sm font-black text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={18} />
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </section>

          {/* PREVIEW */}
          <aside>
            <section className="sticky top-6 overflow-hidden rounded-[2rem] bg-white shadow-sm">
              <div className="bg-gradient-to-r from-pink-100 to-indigo-100 px-6 py-5">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-pink-500">
                  Live Preview
                </p>
                <h2 className="mt-1 text-xl font-black text-indigo-800">
                  Teacher Profile
                </h2>
              </div>

              <div className="p-6">
                <div className="flex h-64 items-end justify-center overflow-hidden rounded-[1.75rem] bg-gradient-to-b from-sky-50 to-pink-50">
                  <img
                    src={teacherImages[gender]}
                    alt="Teacher"
                    className="h-[95%] w-auto object-contain"
                  />
                </div>

                <div className="mt-5 text-center">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <UserRound size={22} />
                  </div>

                  <h3 className="mt-3 text-xl font-black text-slate-900">
                    {fullName || "Teacher Name"}
                  </h3>

                  <p className="mt-1 break-all text-xs font-semibold text-slate-400">
                    {email || "teacher@email.com"}
                  </p>

                  <span
                    className={`mt-4 inline-flex rounded-full px-3 py-1.5 text-[9px] font-black ${
                      status === "active"
                        ? "bg-emerald-50 text-emerald-700"
                        : status === "suspended"
                          ? "bg-violet-50 text-violet-700"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {status.toUpperCase()}
                  </span>
                </div>

                <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                    Access
                  </p>
                  <p className="mt-2 text-xs font-bold text-slate-700">
                    {formatDate(accessStart)}
                  </p>
                  <p className="text-xs font-bold text-slate-700">
                    → {formatDate(accessExpires)}
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}
