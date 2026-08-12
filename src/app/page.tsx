"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  Calculator,
  CheckCircle2,
  Gift,
  GraduationCap,
  Heart,
  Layers3,
  Palette,
  Pencil,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users,
} from "lucide-react";

const LOGO_SRC = "/fd-arcadia-logo1.png";

type Feature = {
  title: string;
  description: string;
  icon: React.ElementType;
  tone: "violet" | "blue" | "amber" | "pink" | "emerald" | "cyan";
};

type PackageItem = {
  name: string;
  price: string;
  detail: string;
  highlight?: boolean;
};

export default function HomePage() {
  const features: Feature[] = [
    {
      title: "Learning Hub",
      description:
        "Structured weekly schedules and printable worksheets to support your child's learning journey.",
      icon: BookOpenCheck,
      tone: "violet",
    },
    {
      title: "Math Activity",
      description:
        "Addition, subtraction, multiplication and division activities for fun practice.",
      icon: Calculator,
      tone: "blue",
    },
    {
      title: "Sifir Deck",
      description:
        "Practice multiplication facts from 1–12 through simple and engaging exercises.",
      icon: Trophy,
      tone: "amber",
    },
    {
      title: "Draw & Learn Canvas",
      description:
        "Write, draw, colour and complete digital worksheets directly online.",
      icon: Palette,
      tone: "pink",
    },
    {
      title: "Freebies Library",
      description:
        "Access free educational resources and printable learning materials.",
      icon: Gift,
      tone: "emerald",
    },
    {
      title: "Custom Worksheet",
      description:
        "Personalised worksheets based on your child's age, level and learning needs.",
      icon: Pencil,
      tone: "cyan",
    },
  ];

  const packages: PackageItem[] = [
    {
      name: "Custom Worksheet Trial",
      price: "RM5",
      detail: "3 Activities",
    },
    {
      name: "Math Package",
      price: "RM25",
      detail: "Math Activity + Sifir Deck + Freebies",
    },
    {
      name: "Learning Hub Weekly",
      price: "RM30",
      detail: "1 Week Learning Hub Access",
    },
    {
      name: "Learning Hub Monthly",
      price: "RM50",
      detail: "1 Month Learning Hub Access",
    },
    {
      name: "Learning Hub Premium",
      price: "RM210",
      detail: "6 Months Learning Hub Access",
    },
    {
      name: "Full Package",
      price: "RM250",
      detail:
        "Learning Hub + Math Activity + Draw & Learn + Sifir Deck + Freebies",
      highlight: true,
    },
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f8fc] text-slate-950">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-[#f7f8fc]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:h-20 sm:w-20">
  <img
    src={LOGO_SRC}
    alt="FD Arcadia"
    className="h-full w-full object-contain p-1"
  />
</div>

            <div className="min-w-0">
              <p className="truncate text-sm font-black tracking-[0.16em] text-slate-950 sm:text-base">
                FD ARCADIA
              </p>
              <p className="truncate text-[9px] font-black uppercase tracking-[0.22em] text-violet-600 sm:text-[10px]">
                Learning Hub
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            <a
              href="#features"
              className="rounded-xl px-3 py-2 text-xs font-black text-slate-500 transition hover:bg-white hover:text-violet-700"
            >
              Resources
            </a>
            <a
              href="#packages"
              className="rounded-xl px-3 py-2 text-xs font-black text-slate-500 transition hover:bg-white hover:text-violet-700"
            >
              Packages
            </a>
            <Link
              href="/pricing"
              className="rounded-xl px-3 py-2 text-xs font-black text-slate-500 transition hover:bg-white hover:text-violet-700"
            >
              Pricing
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/login"
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-black text-slate-700 shadow-sm transition hover:border-violet-200 hover:text-violet-700 sm:px-4"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-slate-950 px-3.5 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-slate-800 sm:px-4"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-10 pt-10 sm:px-6 lg:grid-cols-[1.03fr_0.97fr] lg:items-center lg:py-16">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-violet-700">
            <Star size={14} />
            Learning made simple & meaningful
          </div>

          <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl">
            A smarter learning space for
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
              {" "}growing minds.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-slate-500 sm:text-lg">
            FD Arcadia Learning Hub brings structured learning schedules,
            worksheets, math activities, sifir practice, digital drawing tools
            and personalised resources into one parent-friendly platform for
            children aged 4–12 years.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Start Learning
              <ArrowRight size={17} />
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-black text-slate-700 shadow-sm transition hover:border-violet-200 hover:text-violet-700"
            >
              Parent Login
            </Link>

            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-sm font-black text-violet-700 transition hover:bg-violet-50"
            >
              View Packages
            </Link>
          </div>

          <div className="mt-9 grid max-w-xl grid-cols-3 gap-3">
            <MiniMetric value="6+" label="Resources" />
            <MiniMetric value="4–12" label="Years Old" />
            <MiniMetric value="RM5" label="Starting From" />
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] font-black text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-500" />
              Parent-friendly
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-500" />
              Interactive practice
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-500" />
              Structured learning
            </span>
          </div>
        </div>

        {/* PRODUCT PREVIEW */}
        <div className="relative">
          <div className="absolute -left-12 top-14 h-40 w-40 rounded-full bg-violet-200/50 blur-3xl" />
          <div className="absolute -right-10 bottom-10 h-40 w-40 rounded-full bg-blue-200/50 blur-3xl" />

          <div className="relative overflow-hidden rounded-[30px] border border-white bg-white p-3 shadow-[0_28px_80px_rgba(15,23,42,0.13)]">
            <div className="overflow-hidden rounded-[24px] bg-gradient-to-br from-[#111735] via-[#25265f] to-[#5145a6] p-5 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-300">
                    Parent Dashboard
                  </p>
                  <h2 className="mt-1 text-2xl font-black">My Learning Space</h2>
                </div>

                <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/10">
                  <Sparkles size={19} className="text-yellow-300" />
                </div>
              </div>

              <div className="mt-5 rounded-[20px] bg-white p-4 text-slate-950 shadow-xl">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-violet-100 text-violet-700">
                    <GraduationCap size={23} />
                  </div>
                  <div>
                    <p className="text-sm font-black">Learning Progress</p>
                    <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                      Weekly learning tracker
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
  <div
    className="fd-fade-up"
    style={{ animationDelay: "0.1s" }}
  >
    <DashboardPreviewCard
      icon={Calculator}
      title="Math"
      text="Practice activities"
      tone="violet"
    />
  </div>

  <div
    className="fd-fade-up"
    style={{ animationDelay: "0.2s" }}
  >
    <DashboardPreviewCard
      icon={BookOpen}
      title="Reading"
      text="Build confidence"
      tone="amber"
    />
  </div>

  <div
    className="fd-fade-up"
    style={{ animationDelay: "0.3s" }}
  >
    <DashboardPreviewCard
      icon={Pencil}
      title="Worksheet"
      text="Personalised files"
      tone="pink"
    />
  </div>

  <div
    className="fd-fade-up"
    style={{ animationDelay: "0.4s" }}
  >
    <DashboardPreviewCard
      icon={Trophy}
      title="Progress"
      text="Track by week"
      tone="emerald"
    />
  </div>
</div>

                <div className="mt-4 rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center justify-between text-[9px] font-black text-slate-500">
                    <span>Weekly Progress</span>
                    <span className="text-violet-700">72%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
  <div className="fd-progress h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" />
</div>
                </div>
              </div>
            </div>
          </div>

          <div className="fd-float absolute -bottom-5 -left-3 hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl sm:block">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-800">
                  Parent Controlled
                </p>
                <p className="text-[8px] font-semibold text-slate-400">
                  Secure learning access
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid gap-3 rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3">
          <TrustItem
            icon={Layers3}
            title="One Learning Portal"
            text="Activities, worksheets and progress in one place."
          />
          <TrustItem
            icon={Users}
            title="Built for Parents"
            text="Simple access to your child's learning resources."
          />
          <TrustItem
            icon={Heart}
            title="Designed for Children"
            text="Clear, colourful and age-appropriate activities."
          />
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="Learning Resources"
          title="Everything your child needs in one place."
          description="A focused set of digital and printable resources designed to support reading, mathematics, writing, creativity and independent practice."
        />

        <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-violet-100/60 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-500">
                Why FD Arcadia
              </p>
              <h2 className="mt-2 max-w-2xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Learning that feels organised, not overwhelming.
              </h2>
              <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-500 sm:text-base">
                FD Arcadia Learning Hub is designed to make learning simple for
                both children and parents. Activities are organised into clear
                learning areas so children can practise at their own pace while
                parents can easily find the resources they need.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <BenefitCard title="Structured" text="Clear weekly learning flow." />
              <BenefitCard title="Interactive" text="Practice beyond printed worksheets." />
              <BenefitCard title="Flexible" text="Learn at home, anytime." />
              <BenefitCard title="Personalised" text="Resources suited to learning needs." />
            </div>
          </div>
        </div>
      </section>

      {/* PACKAGES */}
      <section id="packages" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="Packages"
          title="Choose the access that fits your child."
          description="Register your parent account first. Package access will be unlocked after payment confirmation."
        />

        <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((item) => (
            <PackageCard key={item.name} item={item} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-slate-800"
          >
            View All Packages
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#111735] via-[#25265f] to-[#5145a6] px-6 py-10 text-center text-white shadow-[0_24px_70px_rgba(39,39,94,0.22)] sm:px-10 sm:py-12">
          <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-violet-400/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />

          <div className="relative">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-white/10 text-yellow-300">
              <Sparkles size={21} />
            </div>

            <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
              Ready to create a better learning routine?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-300 sm:text-base">
              Join FD Arcadia Learning Hub and give your child access to
              engaging learning resources built for practice, confidence and
              steady progress.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-slate-950 shadow-sm transition hover:-translate-y-0.5"
              >
                Create Parent Account
                <ArrowRight size={16} />
              </Link>

              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/10 px-6 py-3.5 text-sm font-black text-white transition hover:bg-white/15"
              >
                View Packages
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
              <img
                src={LOGO_SRC}
                alt="FD Arcadia"
                className="h-full w-full object-contain p-1"
              />
            </div>

            <div>
              <p className="text-xs font-black tracking-[0.12em] text-slate-900">
                FD ARCADIA
              </p>
              <p className="text-[9px] font-semibold text-slate-400">
                Learning Hub
              </p>
            </div>
          </div>

          <p className="text-[10px] font-semibold text-slate-400">
            Learning • Practice • Progress
          </p>
        </div>
      </footer>
    </main>
  );
}

function MiniMetric({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-[16px] border border-slate-200 bg-white px-3 py-3 text-center shadow-sm">
      <p className="text-xl font-black text-slate-950 sm:text-2xl">{value}</p>
      <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function DashboardPreviewCard({
  icon: Icon,
  title,
  text,
  tone,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
  tone: "violet" | "amber" | "pink" | "emerald";
}) {
  const toneClass = {
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
    pink: "bg-pink-50 text-pink-600",
    emerald: "bg-emerald-50 text-emerald-600",
  }[tone];

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
      <div
  className={`fd-icon-pop grid h-8 w-8 place-items-center rounded-lg ${toneClass}`}
>
  <Icon size={15} />
</div>
      <p className="mt-2 text-xs font-black text-slate-900">{title}</p>
      <p className="mt-0.5 text-[9px] font-semibold text-slate-400">{text}</p>
    </div>
  );
}

function TrustItem({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
        <Icon size={17} />
      </div>
      <div>
        <p className="text-xs font-black text-slate-900">{title}</p>
        <p className="mt-0.5 text-[9px] font-semibold text-slate-400">{text}</p>
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-500">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;

  const toneClass = {
    violet: "bg-violet-50 text-violet-600 border-violet-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    pink: "bg-pink-50 text-pink-600 border-pink-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    cyan: "bg-cyan-50 text-cyan-600 border-cyan-100",
  }[feature.tone];

  return (
    <article className="group rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg">
      <div className={`grid h-11 w-11 place-items-center rounded-xl border ${toneClass}`}>
        <Icon size={19} />
      </div>

      <h3 className="mt-4 text-lg font-black text-slate-950">{feature.title}</h3>

      <p className="mt-2 text-xs font-medium leading-6 text-slate-500">
        {feature.description}
      </p>

      <div className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-black text-violet-600 opacity-70 transition group-hover:opacity-100">
        Explore resource
        <ArrowRight size={12} />
      </div>
    </article>
  );
}

function BenefitCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[16px] border border-slate-200 bg-slate-50 p-4">
      <CheckCircle2 size={16} className="text-emerald-500" />
      <p className="mt-2 text-sm font-black text-slate-900">{title}</p>
      <p className="mt-1 text-[10px] font-semibold text-slate-400">{text}</p>
    </div>
  );
}

function PackageCard({ item }: { item: PackageItem }) {
  return (
    <article
      className={`relative rounded-[20px] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg ${
        item.highlight
          ? "border-2 border-violet-500"
          : "border border-slate-200"
      }`}
    >
      {item.highlight ? (
        <div className="absolute right-4 top-4 rounded-full bg-violet-100 px-3 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-violet-700">
          Best Value
        </div>
      ) : null}

      <p className="pr-20 text-sm font-black text-slate-800">{item.name}</p>

      <p className="mt-4 text-3xl font-black tracking-tight text-slate-950">
        {item.price}
      </p>

      <p className="mt-2 min-h-12 text-xs font-medium leading-5 text-slate-500">
        {item.detail}
      </p>

      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4 text-[9px] font-black text-emerald-600">
        <CheckCircle2 size={13} />
        Access after payment confirmation
      </div>
    </article>
  );
}