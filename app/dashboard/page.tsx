"use client";

import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  Gift,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Plus,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import BrandLogo from "@/components/BrandLogo";
import { supabase } from "@/lib/supabase";

type ParentProfile = {
  id: string;
  full_name?: string | null;
  subscription_type?: string | null;
  subscription_end?: string | null;
  current_week?: number | null;
  package_type?: string | null;
};

type ChildProfile = {
  id: string;
  age?: number | null;
  child_name?: string | null;
  level?: string | null;
};

const accessCards = [
  {
    description: "Weekly worksheets and guided activities for subscribed families.",
    href: "/learninghub",
    icon: BookOpenCheck,
    lockedText: "Learning Hub subscription required",
    packageType: "learninghub",
    title: "Learning Hub",
  },
  {
    description: "Printable samples, flashcards, and family-friendly downloads.",
    href: "/freebies",
    icon: Gift,
    lockedText: "Learning Hub subscription required",
    packageType: "learninghub",
    title: "Freebies",
  },
  {
    description: "Tuition tasks, worksheet uploads, and student progress tools.",
    href: "/tuition",
    icon: GraduationCap,
    lockedText: "Tuition subscription required",
    packageType: "tuition",
    title: "Tuition Portal",
  },
  {
    description: "Account details, subscription information, and children profiles.",
    href: "/profile",
    icon: UserRound,
    lockedText: "",
    packageType: "any",
    title: "My Profile",
  },
] as const;

export default function DashboardPage() {
  const [parent, setParent] = useState<ParentProfile | null>(null);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [childrenCount, setChildrenCount] = useState(0);
  const [currentWeek, setCurrentWeek] = useState(1);

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/";
      return;
    }

    const { data: parentData } = await supabase
      .from("parents")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!parentData) return;

    const typedParent = parentData as ParentProfile;

    setParent(typedParent);
    setCurrentWeek(typedParent.current_week || 1);

    const { data: childData } = await supabase
      .from("children")
      .select("*")
      .eq("parent_id", typedParent.id);

    const typedChildren = (childData || []) as ChildProfile[];

    setChildren(typedChildren);
    setChildrenCount(typedChildren.length);
  }

  useEffect(() => {
    // Dashboard data is loaded once from Supabase when the page opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const totalWeeks = parent?.subscription_type === "premium" ? 24 : 4;
  const progress = Math.min(100, Math.round((currentWeek / totalWeeks) * 100));
  const packageType = parent?.package_type || "learninghub";

  return (
    <main className="min-h-screen bg-[var(--fd-cream)] text-[var(--fd-ink)]">
      <div className="mx-auto max-w-7xl px-4 py-5 md:px-6 md:py-8">
        <header className="mb-6 flex flex-col gap-4 rounded-lg border border-[var(--fd-blue)]/10 bg-white/85 p-4 shadow-[0_18px_48px_rgba(76,87,169,0.08)] backdrop-blur md:flex-row md:items-center md:justify-between">
          <Link href="/">
            <BrandLogo imageClassName="h-12 w-24" subtitle="Parent Dashboard" />
          </Link>

          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--fd-red)]/20 bg-white px-4 py-3 text-sm font-black text-[var(--fd-red)] transition hover:-translate-y-0.5 hover:bg-[#fff1ed]"
          >
            <LogOut size={18} aria-hidden="true" />
            Logout
          </button>
        </header>

        <section className="mb-6 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-lg bg-[var(--fd-blue)] p-6 text-white shadow-[0_24px_70px_rgba(76,87,169,0.22)] md:p-8">
            <div className="mb-6 inline-flex items-center gap-2 rounded-lg bg-white/12 px-3 py-2 text-xs font-black uppercase tracking-[0.14em]">
              <Sparkles size={16} aria-hidden="true" />
              Welcome back
            </div>
            <h1 className="max-w-2xl text-4xl font-black tracking-normal md:text-5xl">
              {parent?.full_name || "Parent"} 
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/80">
              Track weekly access, manage children, and move quickly into LearningHub or Tuition tasks.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-black text-[var(--fd-blue)]">
                <ShieldCheck size={17} aria-hidden="true" />
                {parent?.subscription_type || "trial"}
              </span>
              <span className="inline-flex items-center gap-2 rounded-lg bg-[#ffec87] px-3 py-2 text-sm font-black text-[var(--fd-blue)]">
                <CalendarDays size={17} aria-hidden="true" />
                Week {currentWeek}
              </span>
              <span className="inline-flex items-center gap-2 rounded-lg bg-[#f0f7e6] px-3 py-2 text-sm font-black text-[var(--fd-green)]">
                <LayoutDashboard size={17} aria-hidden="true" />
                {packageType}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--fd-blue)]/10 bg-white p-6 shadow-[0_18px_48px_rgba(76,87,169,0.08)]">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--fd-green)]">
              Subscription
            </p>
            <h2 className="mt-2 text-2xl font-black text-[var(--fd-blue)]">
              {parent?.subscription_type || "Trial"} plan
            </h2>
            <div className="mt-5 space-y-3 text-sm font-bold text-[var(--fd-blue)]/75">
              <div className="flex items-center justify-between rounded-lg bg-[var(--fd-cream)] px-3 py-3">
                <span>Package</span>
                <span className="text-[var(--fd-blue)]">{packageType}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-[var(--fd-cream)] px-3 py-3">
                <span>Expiry</span>
                <span className="text-[var(--fd-blue)]">{parent?.subscription_end || "Active"}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-4">
          {[
            { label: "Children", value: childrenCount, tone: "bg-[var(--fd-blue)]", icon: UsersRound },
            { label: "Current Week", value: currentWeek, tone: "bg-[var(--fd-sky)]", icon: CalendarDays },
            { label: "Reward Points", value: 0, tone: "bg-[var(--fd-red)]", icon: Sparkles },
            { label: "Worksheets", value: currentWeek, tone: "bg-[var(--fd-green)]", icon: BookOpenCheck },
          ].map((stat) => (
            <article
              key={stat.label}
              className="rounded-lg border border-[var(--fd-blue)]/10 bg-white p-5 shadow-[0_16px_44px_rgba(76,87,169,0.08)]"
            >
              <div className={`mb-5 grid size-11 place-items-center rounded-lg ${stat.tone} text-white`}>
                <stat.icon size={21} aria-hidden="true" />
              </div>
              <p className="text-sm font-black uppercase tracking-[0.12em] text-[var(--fd-blue)]/55">
                {stat.label}
              </p>
              <p className="mt-2 text-4xl font-black text-[var(--fd-blue)]">{stat.value}</p>
            </article>
          ))}
        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {accessCards.map((card) => {
            const Icon = card.icon;
            const isUnlocked = card.packageType === "any" || packageType === card.packageType;

            if (!isUnlocked) {
              return (
                <article
                  key={card.title}
                  className="rounded-lg border border-dashed border-[var(--fd-blue)]/15 bg-white/60 p-5 opacity-75"
                >
                  <div className="mb-4 grid size-11 place-items-center rounded-lg bg-slate-100 text-slate-400">
                    <Icon size={21} aria-hidden="true" />
                  </div>
                  <p className="text-lg font-black text-slate-500">Locked {card.title}</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{card.lockedText}</p>
                </article>
              );
            }

            return (
              <Link
                key={card.title}
                href={card.href}
                className="group rounded-lg border border-[var(--fd-blue)]/10 bg-white p-5 shadow-[0_16px_44px_rgba(76,87,169,0.08)] transition hover:-translate-y-0.5 hover:border-[var(--fd-green)]/45"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-lg bg-[var(--fd-cream)] text-[var(--fd-blue)]">
                    <Icon size={21} aria-hidden="true" />
                  </span>
                  <ArrowRight
                    size={18}
                    className="text-[var(--fd-blue)]/45 transition group-hover:translate-x-1 group-hover:text-[var(--fd-green)]"
                    aria-hidden="true"
                  />
                </div>
                <p className="text-lg font-black text-[var(--fd-blue)]">{card.title}</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-[var(--fd-blue)]/65">
                  {card.description}
                </p>
              </Link>
            );
          })}
        </section>

        <section className="mb-6 rounded-lg border border-[var(--fd-blue)]/10 bg-white p-5 shadow-[0_18px_48px_rgba(76,87,169,0.08)]">
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--fd-green)]">
                Learning progress
              </p>
              <h2 className="mt-2 text-2xl font-black text-[var(--fd-blue)]">{progress}% completed</h2>
            </div>
            <p className="text-sm font-bold text-[var(--fd-blue)]/65">
              Week {currentWeek} of {totalWeeks}
            </p>
          </div>

          <div className="h-4 overflow-hidden rounded-full bg-[var(--fd-cream)]">
            <div
              className="h-full rounded-full bg-[var(--fd-blue)]"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </section>

        <section className="rounded-lg border border-[var(--fd-blue)]/10 bg-white p-5 shadow-[0_18px_48px_rgba(76,87,169,0.08)]">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--fd-green)]">
                Children
              </p>
              <h2 className="mt-2 text-2xl font-black text-[var(--fd-blue)]">My Children</h2>
            </div>
            <Link
              href="/children"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--fd-blue)] px-4 py-3 text-sm font-black text-white transition hover:-translate-y-0.5"
            >
              <Plus size={18} aria-hidden="true" />
              Add Child
            </Link>
          </div>

          {children.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[var(--fd-blue)]/20 bg-[var(--fd-cream)] p-6 text-center">
              <p className="text-lg font-black text-[var(--fd-blue)]">No children added yet</p>
              <p className="mt-2 text-sm font-semibold text-[var(--fd-blue)]/65">
                Add a child profile to begin tracking learning progress.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {children.map((child) => (
                <article
                  key={child.id}
                  className="rounded-lg border border-[var(--fd-purple)]/20 bg-[#fbf7ff] p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-black text-[var(--fd-blue)]">
                        {child.child_name || "Child"}
                      </h3>
                      <p className="mt-2 text-sm font-bold text-[var(--fd-blue)]/65">
                        Age {child.age || "-"} | {child.level || "Level not set"}
                      </p>
                    </div>
                    <span className="rounded-lg bg-white px-3 py-2 text-sm font-black text-[var(--fd-blue)]">
                      Week {currentWeek}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
