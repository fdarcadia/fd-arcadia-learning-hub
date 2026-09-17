"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Gender = "female" | "male";

const ADMIN_EMAIL = "fdarcadia.hello@gmail.com";

const teacherImages: Record<Gender, string> = {
  female: "/images/teachers/teacher_hero_female.png",
  male: "/images/teachers/teacher_hero_male.png",
};

function addOneYearMinusOneDay(dateString: string) {
  if (!dateString) return "";

  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  date.setFullYear(date.getFullYear() + 1);
  date.setDate(date.getDate() - 1);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatDate(dateString: string) {
  if (!dateString) return "-";

  return new Intl.DateTimeFormat("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${dateString}T00:00:00`));
}

export default function NewTeacherPage() {
  const today = new Date().toISOString().slice(0, 10);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState<Gender>("female");
  const [accessStart, setAccessStart] = useState(today);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<{
    name: string;
    email: string;
    password: string;
    accessStart: string;
    accessExpires: string;
  } | null>(null);

  const accessExpires = useMemo(
    () => addOneYearMinusOneDay(accessStart),
    [accessStart]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setCreated(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Please login as admin first.");
      }

      const response = await fetch("/api/admin/teachers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
          gender,
          access_start: accessStart,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to create teacher.");
      }

      setCreated({
        name: data.teacher.full_name,
        email: data.teacher.email,
        password,
        accessStart: data.teacher.access_start,
        accessExpires: data.teacher.access_expires,
      });

      setFullName("");
      setEmail("");
      setPassword("");
      setGender("female");
      setAccessStart(today);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
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
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-300">
                Teacher Management · New Account
              </p>
              <h1 className="mt-2 text-4xl font-black tracking-tight">
                Add New Teacher
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
                Create the teacher login, choose the correct illustration and
                automatically assign 12 months of access.
              </p>
            </div>

            <div className="hidden h-20 w-20 place-items-center rounded-[1.5rem] border border-white/10 bg-white/10 md:grid">
              <UserPlus size={35} />
            </div>
          </div>
        </section>

        {/* SUCCESS */}
        {created ? (
          <section className="mt-5 rounded-[24px] border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500 text-white">
                <Check size={21} />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-black text-emerald-800">
                  Teacher account created successfully
                </h2>
                <p className="mt-1 text-xs font-semibold text-emerald-700">
                  Save or give these temporary login details to the teacher.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Result label="Teacher" value={created.name} />
                  <Result label="Login Email" value={created.email} />
                  <Result label="Temporary Password" value={created.password} />
                  <Result
                    label="12-Month Access"
                    value={`${formatDate(created.accessStart)} → ${formatDate(
                      created.accessExpires
                    )}`}
                  />
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* ERROR */}
        {error ? (
          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-xs font-bold text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          {/* FORM */}
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-7">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-500">
                Account Details
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">
                Teacher Information
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-400">
                All fields are required.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Field label="Teacher Name">
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="e.g. Teacher Aina"
                  required
                  className="input"
                />
              </Field>

              <Field label="Login Email">
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="teacher@email.com"
                    required
                    className="input pl-11"
                  />
                </div>
              </Field>

              <Field label="Temporary Password">
                <div className="relative">
                  <KeyRound
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Minimum 8 characters"
                    minLength={8}
                    required
                    className="input pl-11 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="mt-2 text-[10px] font-semibold text-slate-400">
                  Use at least 8 characters. Teacher should change it after
                  first login.
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
                        className={`relative overflow-hidden rounded-[1.5rem] border-2 p-3 text-left transition ${
                          selected
                            ? "border-indigo-500 bg-indigo-50 shadow-sm"
                            : "border-slate-100 bg-slate-50 hover:border-indigo-200 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-24 w-20 overflow-hidden rounded-xl bg-white">
                            <img
                              src={teacherImages[option]}
                              alt={`${option} teacher`}
                              className="h-full w-full object-contain"
                            />
                          </div>

                          <div>
                            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                              Illustration
                            </p>
                            <p className="mt-1 text-xl font-black capitalize text-indigo-800">
                              {option}
                            </p>
                            <p className="mt-1 text-[10px] font-semibold text-slate-400">
                              Used on Teacher Dashboard
                            </p>
                          </div>
                        </div>

                        {selected ? (
                          <span className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-indigo-500 text-white">
                            <Check size={15} />
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ACCESS */}
              <div className="rounded-[1.5rem] bg-gradient-to-br from-violet-50 via-white to-pink-50 p-5">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-500">
                  12-Month Teacher Access
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-400">
                  Expiry is calculated automatically.
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Access Start">
                    <input
                      type="date"
                      value={accessStart}
                      onChange={(event) => setAccessStart(event.target.value)}
                      required
                      className="input bg-white"
                    />
                  </Field>

                  <Field label="Access Expires">
                    <div className="input flex items-center bg-white font-black text-indigo-700">
                      {formatDate(accessExpires)}
                    </div>
                  </Field>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 text-sm font-black text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  "Creating Teacher..."
                ) : (
                  <>
                    <UserPlus size={18} />
                    Create Teacher Account
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </form>
          </section>

          {/* PREVIEW */}
          <aside>
            <section className="sticky top-6 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
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
                    alt="Teacher preview"
                    className="h-[95%] w-auto object-contain"
                  />
                </div>

                <div className="mt-5 text-center">
                  <h3 className="text-xl font-black text-slate-900">
                    {fullName || "Teacher Name"}
                  </h3>
                  <p className="mt-1 break-all text-xs font-semibold text-slate-400">
                    {email || "teacher@email.com"}
                  </p>

                  <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[9px] font-black text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    ACTIVE
                  </span>
                </div>

                <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                    Access Period
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
        </div>
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

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm">
      <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-all text-xs font-black text-slate-800">
        {value}
      </p>
    </div>
  );
}
