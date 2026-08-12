"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Baby,
  BarChart3,
  BookOpen,
  BookOpenCheck,
  CheckCircle2,
  FileText,
  GraduationCap,
  Home,
  Loader2,
  School,
  Sparkles,
  Target,
  UserRound,
  Users,
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

export default function ChildReportPage() {
  const params = useParams();
  const childId = String(params.id || "");

  return (
    <ProtectedPage>
      {(user) => <ChildReportContent childId={childId} parentId={user.id} />}
    </ProtectedPage>
  );
}

function ChildReportContent({
  childId,
  parentId,
}: {
  childId: string;
  parentId: string;
}) {
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadChild() {
      setLoading(true);
      setError("");

      if (!childId) {
        setError("Child profile ID is missing.");
        setLoading(false);
        return;
      }

      const { data, error: loadError } = await supabase
        .from("children")
        .select("*")
        .eq("id", childId)
        .eq("parent_id", parentId)
        .maybeSingle();

      if (loadError) {
        setError(loadError.message);
        setChild(null);
        setLoading(false);
        return;
      }

      setChild((data as Child | null) || null);
      setLoading(false);
    }

    loadChild();
  }, [childId, parentId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
        <div className="grid min-h-screen xl:grid-cols-[250px_minmax(0,1fr)]">
          <ReportSidebar childName="Child Report" />
          <section className="grid min-h-[70vh] place-items-center px-4 py-8">
            <div className="text-center">
              <Loader2 className="mx-auto animate-spin text-indigo-600" size={38} />
              <p className="mt-4 text-sm font-bold text-slate-500">
                Loading child report...
              </p>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (error || !child) {
    return (
      <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
        <div className="grid min-h-screen xl:grid-cols-[250px_minmax(0,1fr)]">
          <ReportSidebar childName="Child Report" />
          <section className="px-4 py-6 sm:px-6 lg:px-8">
            <Link
              href="/children"
              className="inline-flex items-center gap-2 text-xs font-black text-indigo-600"
            >
              <ArrowLeft size={15} />
              Back to Children
            </Link>

            <div className="mt-6 rounded-[24px] border border-slate-200 bg-white p-10 text-center shadow-sm">
              <Baby className="mx-auto text-slate-300" size={46} />
              <h1 className="mt-4 text-2xl font-black text-slate-900">
                Child report not found
              </h1>
              <p className="mx-auto mt-2 max-w-lg text-sm font-semibold text-slate-500">
                {error || "This child profile is unavailable or does not belong to this account."}
              </p>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const avatar = child.avatar_url || child.avatar || "";
  const subjects = child.subjects || [];

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <div className="grid min-h-screen xl:grid-cols-[250px_minmax(0,1fr)]">
        <ReportSidebar childName={child.child_name} />

        <section className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">
          <header className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <Link
                href="/children"
                className="inline-flex items-center gap-2 text-xs font-black text-indigo-600 transition hover:text-indigo-700"
              >
                <ArrowLeft size={15} />
                Back to Children
              </Link>

              <p className="mt-3 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500">
                CHILD LEARNING REPORT
              </p>

              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                {child.child_name}&apos;s Report
              </h1>

              <p className="mt-1 text-sm font-semibold text-slate-400">
                Learning profile, current levels, goals and parent notes.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/children"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <Users size={15} />
                My Children
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-slate-800"
              >
                <Home size={15} />
                Dashboard
              </Link>
            </div>
          </header>

          <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
            <div className="bg-gradient-to-br from-[#171d42] via-[#252b62] to-indigo-700 p-5 text-white sm:p-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <AvatarImage src={avatar} name={child.child_name} />

                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-200">
                    Student Profile
                  </p>
                  <h2 className="mt-1 text-3xl font-black tracking-tight">
                    {child.child_name}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-indigo-100">
                    Age {child.age || "-"} • {child.level || "Level not set"}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {subjects.length ? (
                      subjects.map((subject) => (
                        <span
                          key={subject}
                          className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-black text-white"
                        >
                          {subject}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black text-indigo-100">
                        No subject selected
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid min-w-[170px] gap-2 sm:text-right">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-indigo-200">
                    School
                  </p>
                  <p className="text-sm font-black">{child.school || "Not set"}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
              <SummaryCard
                icon={<BookOpen size={17} />}
                label="Reading"
                value={child.reading_level || "Not set"}
              />
              <SummaryCard
                icon={<BarChart3 size={17} />}
                label="Mathematics"
                value={child.math_level || "Not set"}
              />
              <SummaryCard
                icon={<GraduationCap size={17} />}
                label="Level"
                value={child.level || "Not set"}
              />
              <SummaryCard
                icon={<School size={17} />}
                label="Subjects"
                value={`${subjects.length} selected`}
              />
            </div>
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-5">
              <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <SectionHeading
                  eyebrow="CURRENT PROFILE"
                  title="Learning Levels"
                  icon={<BookOpenCheck size={19} />}
                />

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <LevelCard
                    label="Reading Level"
                    value={child.reading_level || "Not set"}
                    description="Current reading stage saved in the child profile."
                  />
                  <LevelCard
                    label="Math Level"
                    value={child.math_level || "Not set"}
                    description="Current mathematics stage saved in the child profile."
                  />
                </div>
              </section>

              <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <SectionHeading
                  eyebrow="LEARNING FOCUS"
                  title="Selected Subjects"
                  icon={<GraduationCap size={19} />}
                />

                <div className="mt-5 flex flex-wrap gap-2">
                  {subjects.length ? (
                    subjects.map((subject) => (
                      <span
                        key={subject}
                        className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-2.5 text-xs font-black text-indigo-700"
                      >
                        {subject}
                      </span>
                    ))
                  ) : (
                    <EmptyInline text="No subjects have been selected yet." />
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-5">
              <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <SectionHeading
                  eyebrow="LEARNING GOAL"
                  title="Current Goal"
                  icon={<Target size={19} />}
                />

                {child.learning_goal ? (
                  <div className="mt-5 rounded-[20px] bg-gradient-to-br from-amber-50 to-orange-50 p-5">
                    <div className="flex items-start gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-amber-600 shadow-sm">
                        <Target size={19} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-amber-600">
                          Active Goal
                        </p>
                        <p className="mt-1 text-sm font-black leading-6 text-slate-800">
                          {child.learning_goal}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5">
                    <EmptyInline text="No learning goal has been set yet." />
                  </div>
                )}
              </section>

              <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <SectionHeading
                  eyebrow="PARENT NOTES"
                  title="Learning Notes"
                  icon={<FileText size={19} />}
                />

                {child.parent_notes ? (
                  <div className="mt-5 rounded-[18px] border border-slate-100 bg-slate-50 p-4">
                    <p className="whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-600">
                      {child.parent_notes}
                    </p>
                  </div>
                ) : (
                  <div className="mt-5">
                    <EmptyInline text="No parent notes have been added." />
                  </div>
                )}
              </section>
            </div>
          </section>

          <section className="mt-5 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-indigo-500">
                  PROGRESS REPORT
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Detailed progress will appear here
                </h2>
                <p className="mt-1 max-w-2xl text-xs font-semibold leading-5 text-slate-500">
                  This page only shows saved child-profile information for now.
                  No progress percentage is generated from profile fields.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 self-start rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-black text-slate-500">
                <CheckCircle2 size={16} />
                Profile data connected
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function ReportSidebar({ childName }: { childName: string }) {
  return (
    <aside className="hidden border-r border-indigo-950/10 bg-[#111735] px-4 py-6 text-white xl:flex xl:flex-col">
      <Link href="/dashboard" className="flex items-center gap-3 px-2">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-indigo-950/30">
          <Sparkles size={24} />
        </div>
        <div>
          <p className="text-sm font-black tracking-[0.08em] text-white">
            FD ARCADIA
          </p>
          <p className="text-[9px] font-black tracking-[0.2em] text-violet-300">
            CHILD REPORT
          </p>
        </div>
      </Link>

      <nav className="mt-8 space-y-1.5">
        <SidebarLink href="/dashboard" icon={<Home size={20} />}>
          Dashboard
        </SidebarLink>
        <SidebarLink href="/children" icon={<Users size={20} />} active>
          My Children
        </SidebarLink>
        <SidebarLink href="/learning-hub" icon={<BookOpenCheck size={20} />}>
          Learning Hub
        </SidebarLink>
        <SidebarLink href="/custom-worksheet" icon={<FileText size={20} />}>
          Custom Worksheet
        </SidebarLink>
        <SidebarLink href="/flashcard-library" icon={<BookOpen size={20} />}>
          Flashcard Library
        </SidebarLink>
      </nav>

      <div className="mt-auto rounded-[20px] border border-violet-400/20 bg-gradient-to-br from-violet-600/35 to-indigo-500/15 p-4">
        <UserRound className="text-yellow-300" size={18} />
        <p className="mt-3 text-[9px] font-black uppercase tracking-[0.16em] text-violet-200">
          Viewing Report
        </p>
        <h3 className="mt-1 truncate text-lg font-black text-white">
          {childName}
        </h3>
        <p className="mt-1 text-[10px] leading-5 text-indigo-200">
          Child profile and learning information.
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

function AvatarImage({ src, name }: { src: string; name: string }) {
  return (
    <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-full border-4 border-white/20 bg-white/10 shadow-xl sm:h-28 sm:w-28">
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
        <UserRound className="text-white" size={42} />
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-slate-100 bg-slate-50/70 p-4">
      <div className="flex items-center gap-2 text-indigo-600">
        {icon}
        <p className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">
          {label}
        </p>
      </div>
      <p className="mt-2 text-sm font-black text-slate-900">{value}</p>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  icon,
}: {
  eyebrow: string;
  title: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-indigo-500">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-xl font-black text-slate-950">{title}</h2>
      </div>
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
        {icon}
      </div>
    </div>
  );
}

function LevelCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-[18px] border border-slate-200 bg-slate-50/60 p-4">
      <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-lg font-black text-slate-900">{value}</p>
      <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function EmptyInline({ text }: { text: string }) {
  return (
    <div className="rounded-[18px] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">
      {text}
    </div>
  );
}