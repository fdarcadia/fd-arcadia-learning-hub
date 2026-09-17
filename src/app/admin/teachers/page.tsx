"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Edit3,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Teacher = {
  id: string;
  user_id: string;
  role: "teacher";
  full_name: string;
  email: string;
  gender: "female" | "male";
  image_url: string | null;
  status: "active" | "inactive" | "suspended";
  access_start: string;
  access_expires: string;
  created_at: string;
  updated_at: string;
};

const fallbackImages = {
  female: "/images/teachers/teacher_hero_female.png",
  male: "/images/teachers/teacher_hero_male.png",
};

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function isExpired(date: string) {
  return date < todayString();
}

function daysLeft(date: string) {
  const today = new Date(`${todayString()}T00:00:00`);
  const end = new Date(`${date}T00:00:00`);
  const days = Math.ceil(
    (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (days < 0) return "Expired";
  if (days === 0) return "Ends today";
  return `${days} day${days === 1 ? "" : "s"} left`;
}

function renewDates(currentExpiry: string) {
  const today = todayString();
  const base = currentExpiry && currentExpiry >= today ? currentExpiry : today;
  const start = new Date(`${base}T00:00:00`);
  start.setDate(start.getDate() + 1);

  const expiry = new Date(start);
  expiry.setFullYear(expiry.getFullYear() + 1);
  expiry.setDate(expiry.getDate() - 1);

  return {
    access_start: start.toISOString().slice(0, 10),
    access_expires: expiry.toISOString().slice(0, 10),
  };
}

export default function TeacherManagementPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadTeachers() {
    setLoading(true);
    setError("");

    const { data, error: queryError } = await supabase
      .from("teachers")
      .select(
        "id,user_id,role,full_name,email,gender,image_url,status,access_start,access_expires,created_at,updated_at"
      )
      .order("full_name", { ascending: true });

    if (queryError) {
      setError(queryError.message);
      setTeachers([]);
    } else {
      setTeachers((data || []) as Teacher[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadTeachers();
  }, []);

  const stats = useMemo(() => {
    const active = teachers.filter(
      (teacher) =>
        teacher.status === "active" && !isExpired(teacher.access_expires)
    ).length;

    const expired = teachers.filter(
      (teacher) => isExpired(teacher.access_expires)
    ).length;

    const suspended = teachers.filter(
      (teacher) => teacher.status === "suspended"
    ).length;

    const expiringSoon = teachers.filter((teacher) => {
      if (teacher.status !== "active" || isExpired(teacher.access_expires))
        return false;

      const today = new Date(`${todayString()}T00:00:00`);
      const end = new Date(`${teacher.access_expires}T00:00:00`);
      const days = Math.ceil(
        (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      return days >= 0 && days <= 30;
    }).length;

    return {
      total: teachers.length,
      active,
      expired,
      suspended,
      expiringSoon,
    };
  }, [teachers]);

  const filteredTeachers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return teachers.filter((teacher) => {
      const matchesSearch =
        !keyword ||
        teacher.full_name.toLowerCase().includes(keyword) ||
        teacher.email.toLowerCase().includes(keyword);

      const expired = isExpired(teacher.access_expires);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          teacher.status === "active" &&
          !expired) ||
        (statusFilter === "expired" && expired) ||
        (statusFilter === "suspended" && teacher.status === "suspended");

      return matchesSearch && matchesStatus;
    });
  }, [teachers, search, statusFilter]);

  async function updateTeacher(
    id: string,
    payload: Partial<Teacher>,
    successMessage: string
  ) {
    setWorkingId(id);
    setError("");
    setSuccess("");

    const { data, error: updateError } = await supabase
      .from("teachers")
      .update(payload)
      .eq("id", id)
      .select(
        "id,user_id,role,full_name,email,gender,image_url,status,access_start,access_expires,created_at,updated_at"
      )
      .single();

    if (updateError) {
      setError(updateError.message);
      setWorkingId("");
      return;
    }

    setTeachers((current) =>
      current.map((teacher) =>
        teacher.id === id ? (data as Teacher) : teacher
      )
    );

    setSuccess(successMessage);
    setWorkingId("");
  }

  async function handleRenew(teacher: Teacher) {
    const dates = renewDates(teacher.access_expires);

    const confirmed = window.confirm(
      `${teacher.full_name}\n\nRenew teacher access for another 12 months?\n\nStart: ${formatDate(
        dates.access_start
      )}\nExpires: ${formatDate(dates.access_expires)}`
    );

    if (!confirmed) return;

    await updateTeacher(
      teacher.id,
      {
        access_start: dates.access_start,
        access_expires: dates.access_expires,
        status: "active",
      },
      `${teacher.full_name} has been renewed for 12 months.`
    );
  }

  async function handleStatusChange(teacher: Teacher) {
    const nextStatus =
      teacher.status === "active" ? "suspended" : "active";

    await updateTeacher(
      teacher.id,
      { status: nextStatus },
      `${teacher.full_name} is now ${nextStatus}.`
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* HEADER */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:text-indigo-600"
            >
              <ArrowLeft size={19} />
            </Link>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-500">
                Admin Workspace · Staff
              </p>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Teacher Management
              </h1>
              <p className="mt-1 text-sm font-semibold text-slate-400">
                Manage teacher accounts, access periods and status.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={loadTeachers}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            <Link
              href="/admin/teachers/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5"
            >
              <Plus size={16} />
              Add New Teacher
            </Link>
          </div>
        </header>

        {/* HERO */}
        <section className="relative mt-6 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#111735] via-[#29255e] to-[#6652c7] p-6 text-white shadow-[0_20px_55px_rgba(15,23,42,0.16)] sm:p-7">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-indigo-400/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/10 text-violet-200">
                  <Users size={22} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-300">
                    Teacher Directory
                  </p>
                  <h2 className="mt-1 text-2xl font-black">
                    {stats.total} teacher{stats.total === 1 ? "" : "s"}
                  </h2>
                </div>
              </div>

              <p className="mt-3 max-w-xl text-xs leading-5 text-slate-300">
                Every teacher has a Supabase login, a teacher profile and a
                12-month access period.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <MiniStat label="Active" value={stats.active} tone="emerald" />
              <MiniStat
                label="Expiring ≤30d"
                value={stats.expiringSoon}
                tone="amber"
              />
              <MiniStat label="Expired" value={stats.expired} tone="rose" />
              <MiniStat
                label="Suspended"
                value={stats.suspended}
                tone="violet"
              />
            </div>
          </div>
        </section>

        {/* FILTERS */}
        <section className="mt-5 rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_190px_auto]">
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
              <Search size={16} className="text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search teacher or email..."
                className="w-full bg-transparent text-xs font-bold text-slate-700 outline-none placeholder:text-slate-400"
              />
            </label>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 outline-none"
            >
              <option value="all">All Teachers</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="suspended">Suspended</option>
            </select>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-black text-slate-600 transition hover:bg-slate-200"
            >
              Reset
            </button>
          </div>

          <div className="mt-3 border-t border-slate-100 pt-3">
            <p className="text-[10px] font-black text-slate-400">
              Showing {filteredTeachers.length} of {teachers.length} teachers
            </p>
          </div>
        </section>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">
            {success}
          </div>
        ) : null}

        {/* TABLE / LIST */}
        <section className="mt-5 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <div className="hidden grid-cols-[minmax(260px,1.4fr)_150px_180px_140px_240px] gap-4 border-b border-slate-100 bg-slate-50/80 px-5 py-3 text-[9px] font-black uppercase tracking-[0.12em] text-slate-400 lg:grid">
            <span>Teacher</span>
            <span>Gender</span>
            <span>Access Period</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm font-bold text-slate-400">
              Loading teachers...
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="p-12 text-center">
              <UserRound className="mx-auto text-slate-300" size={38} />
              <p className="mt-3 text-sm font-black text-slate-700">
                No teachers found
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Add your first teacher or change the search/filter.
              </p>

              <Link
                href="/admin/teachers/new"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-black text-white"
              >
                <Plus size={15} />
                Add Teacher
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredTeachers.map((teacher) => {
                const expired = isExpired(teacher.access_expires);
                const active =
                  teacher.status === "active" && !expired;
                const image =
                  teacher.image_url || fallbackImages[teacher.gender];

                return (
                  <article
                    key={teacher.id}
                    className="px-4 py-4 transition hover:bg-slate-50/70 sm:px-5"
                  >
                    <div className="grid gap-4 lg:grid-cols-[minmax(260px,1.4fr)_150px_180px_140px_240px] lg:items-center">
                      {/* TEACHER */}
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="grid h-14 w-14 shrink-0 place-items-end overflow-hidden rounded-2xl bg-gradient-to-br from-violet-100 to-pink-100">
                          <img
                            src={image}
                            alt={teacher.full_name}
                            className="h-full w-full object-contain"
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-sm font-black text-slate-950">
                              {teacher.full_name}
                            </h3>

                            <span className="rounded-full bg-indigo-50 px-2 py-1 text-[8px] font-black uppercase text-indigo-600">
                              Teacher
                            </span>
                          </div>

                          <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-400">
                            {teacher.email}
                          </p>
                        </div>
                      </div>

                      {/* GENDER */}
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                          Illustration
                        </p>
                        <p className="mt-1 text-xs font-black capitalize text-slate-700">
                          {teacher.gender}
                        </p>
                      </div>

                      {/* ACCESS */}
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                          Access
                        </p>
                        <p className="mt-1 text-[10px] font-bold text-slate-600">
                          {formatDate(teacher.access_start)}
                        </p>
                        <p className="text-[10px] font-bold text-slate-600">
                          → {formatDate(teacher.access_expires)}
                        </p>
                        <p
                          className={`mt-1 text-[9px] font-black ${
                            expired ? "text-rose-600" : "text-emerald-600"
                          }`}
                        >
                          {daysLeft(teacher.access_expires)}
                        </p>
                      </div>

                      {/* STATUS */}
                      <div>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[9px] font-black ${
                            active
                              ? "bg-emerald-50 text-emerald-700"
                              : expired
                                ? "bg-rose-50 text-rose-700"
                                : "bg-violet-50 text-violet-700"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              active
                                ? "bg-emerald-500"
                                : expired
                                  ? "bg-rose-500"
                                  : "bg-violet-500"
                            }`}
                          />
                          {expired
                            ? "Expired"
                            : teacher.status === "suspended"
                              ? "Suspended"
                              : teacher.status}
                        </span>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex flex-wrap items-center justify-start gap-2 lg:justify-end">
                        <Link
                          href={`/admin/teachers/${teacher.id}/edit`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-[10px] font-black text-slate-700 transition hover:bg-slate-200"
                        >
                          <Edit3 size={14} />
                          Edit
                        </Link>

                        <button
                          type="button"
                          disabled={workingId === teacher.id}
                          onClick={() => handleRenew(teacher)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-[10px] font-black text-white transition hover:bg-indigo-700 disabled:opacity-50"
                        >
                          <RefreshCw
                            size={14}
                            className={
                              workingId === teacher.id ? "animate-spin" : ""
                            }
                          />
                          Renew 12 Months
                        </button>

                        <button
                          type="button"
                          disabled={workingId === teacher.id}
                          onClick={() => handleStatusChange(teacher)}
                          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[10px] font-black transition disabled:opacity-50 ${
                            teacher.status === "active"
                              ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {teacher.status === "active" ? (
                            <>
                              <XCircle size={14} />
                              Suspend
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={14} />
                              Activate
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* INFO */}
        <section className="mt-5 grid gap-3 md:grid-cols-3">
          <InfoCard
            icon={ShieldCheck}
            title="Secure Login"
            text="Teacher accounts are created through Supabase Auth."
          />
          <InfoCard
            icon={Clock3}
            title="12-Month Access"
            text="Renewal automatically creates the next access period."
          />
          <InfoCard
            icon={UserRound}
            title="Teacher Illustration"
            text="Female or male illustration is stored with the profile."
          />
        </section>
      </div>
    </main>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "amber" | "rose" | "violet";
}) {
  const classes = {
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    amber: "border-amber-400/20 bg-amber-400/10 text-amber-200",
    rose: "border-rose-400/20 bg-rose-400/10 text-rose-200",
    violet: "border-violet-400/20 bg-violet-400/10 text-violet-200",
  }[tone];

  return (
    <div className={`min-w-[105px] rounded-2xl border px-3 py-3 ${classes}`}>
      <p className="text-xl font-black text-white">{value}</p>
      <p className="mt-0.5 text-[8px] font-black uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
        <Icon size={18} />
      </div>
      <h3 className="mt-3 text-sm font-black text-slate-900">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-400">{text}</p>
    </div>
  );
}
