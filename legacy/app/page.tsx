import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  FileText,
  Layers3,
  LockKeyhole,
  Palette,
  ShieldCheck,
  Sparkles,
  Star,
  WandSparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import BrandLogo from "@/components/common/BrandLogo";
import LoginRedirectButton from "@/components/marketing/LoginRedirectButton";

const programs = [
  {
    accent: "bg-[#f0f7e6] text-[var(--fd-green)]",
    description: "A protected worksheet hub with drawing, text, eraser, upload, and export tools.",
    icon: BookOpenCheck,
    title: "Learning Hub",
  },
  {
    accent: "bg-[#fff8dc] text-[var(--fd-red)]",
    description: "Personalised printable packs for parents who want child-specific practice.",
    icon: FileText,
    title: "Custom Worksheet",
  },
  {
    accent: "bg-[#efedff] text-[var(--fd-purple)]",
    description: "Flashcards and modules that make revision simple, visual, and joyful.",
    icon: Layers3,
    title: "Flashcard & Modul",
  },
];

const premiumDetails = [
  "Private parent dashboard",
  "Child-friendly worksheet tools",
  "Purchase-based section access",
  "Tablet, iPad, laptop, and mobile friendly",
];

const steps = [
  "Choose account type",
  "Enter parent profile",
  "Open the unlocked hub",
  "Start learning activities",
];

export default function Home() {
  return (
    <main className="premium-page-bg min-h-screen text-[var(--fd-blue)]">
      <section className="relative overflow-hidden">
        <Image
          src="/brand/learning-hero.png"
          alt="Premium child-friendly learning desk with worksheets"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,253,248,0.98)_0%,rgba(255,247,237,0.9)_44%,rgba(240,237,255,0.54)_76%,rgba(237,249,243,0.3)_100%)]" />

        <header className="absolute inset-x-0 top-0 z-30 border-b border-white/70 bg-white/82 shadow-[0_12px_40px_rgba(56,66,130,0.08)] backdrop-blur-xl">
          <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">
            <Link href="/" className="shrink-0">
              <BrandLogo subtitle="Premium Learning Hub" imageClassName="h-11 w-24" />
            </Link>

            <div className="hidden items-center gap-7 text-sm font-black text-[var(--fd-blue)]/75 md:flex">
              <a href="#programs" className="font-kindergarten">
                Programs
              </a>
              <a href="#worksheet" className="font-kindergarten">
                Worksheet Studio
              </a>
              <a href="#access" className="font-kindergarten">
                Access
              </a>
            </div>

            <LoginRedirectButton />
          </nav>
        </header>

        <div className="relative z-10 mx-auto grid min-h-[86vh] max-w-7xl content-center px-5 pb-20 pt-28 md:px-8">
          <div className="max-w-4xl">
            <div className="font-kindergarten premium-card-shadow mb-5 inline-flex items-center gap-2 rounded-lg border border-white/80 bg-white/88 px-4 py-2 text-lg text-[var(--fd-red)] backdrop-blur">
              <Sparkles size={17} aria-hidden="true" />
              Premium learning for little minds
            </div>

            <h1 className="font-blank-space max-w-4xl text-5xl leading-[1.02] tracking-normal text-[var(--fd-blue)] md:text-7xl">
              FD Arcadia Learning Hub
            </h1>

            <p className="font-kindergarten mt-6 max-w-2xl text-xl leading-8 text-[#4c57a9] md:text-2xl">
              A cheerful paid learning portal for parents and children, with protected access,
              profile management, worksheet activities, flashcards, and custom learning packs.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="premium-button-shadow-red inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--fd-red)] px-7 py-4 text-base font-black text-white transition hover:-translate-y-0.5"
              >
                <span className="font-kindergarten text-lg">Register Now</span>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link
                href="/login"
                className="premium-button-shadow inline-flex items-center justify-center gap-2 rounded-lg border border-white/80 bg-white/92 px-7 py-4 text-base font-black text-[var(--fd-blue)] backdrop-blur transition hover:-translate-y-0.5"
              >
                <ShieldCheck size={18} aria-hidden="true" />
                <span className="font-kindergarten text-lg">Parent Sign In</span>
              </Link>
            </div>

            <div className="mt-10 grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-4">
              {[
                ["3", "premium sections"],
                ["1", "secure login"],
                ["24/7", "learning access"],
                ["PDF", "worksheet upload"],
              ].map(([value, label]) => (
                <div key={label} className="premium-card-shadow rounded-lg border border-white/85 bg-white/82 p-4 backdrop-blur">
                  <p className="font-blank-space text-3xl text-[var(--fd-blue)]">{value}</p>
                  <p className="font-kindergarten mt-1 text-sm text-[#6698cc]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="programs" className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="font-kindergarten text-lg text-[var(--fd-green)]">What parents can unlock</p>
            <h2 className="font-blank-space mt-3 max-w-3xl text-4xl tracking-normal md:text-6xl">
              Premium learning rooms
            </h2>
          </div>
          <p className="font-kindergarten max-w-md text-xl leading-7 text-[#4c57a9]">
            Each account gets access based on the package selected during registration.
            Locked sections stay protected until purchase.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {programs.map((program) => {
            const Icon = program.icon;

            return (
              <article
                key={program.title}
                className="premium-card-shadow rounded-lg border border-white/85 bg-white/88 p-6 transition hover:-translate-y-1"
              >
                <div className={`grid size-12 place-items-center rounded-lg ${program.accent}`}>
                  <Icon size={24} aria-hidden="true" />
                </div>
                <h3 className="font-kindergarten mt-6 text-3xl text-[var(--fd-blue)]">{program.title}</h3>
                <p className="font-kindergarten mt-3 text-lg leading-6 text-[#4c57a9]">{program.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="worksheet" className="bg-[linear-gradient(135deg,var(--fd-blue)_0%,#5e559f_54%,#3f7d73_100%)] py-16 text-white shadow-[inset_0_24px_60px_rgba(255,255,255,0.08)] md:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 md:grid-cols-[0.85fr_1.15fr] md:px-8">
          <div>
            <p className="font-kindergarten text-lg text-[var(--fd-yellow)]">Built for finger, mouse, and stylus</p>
            <h2 className="font-blank-space mt-3 text-4xl tracking-normal md:text-6xl">
              Worksheet Activity Canvas
            </h2>
            <p className="font-kindergarten mt-5 text-xl leading-8 text-white/82">
              Children can draw, erase, type, upload worksheet backgrounds, undo, redo,
              clear the canvas, and save their work as an image or PDF.
            </p>
            <Link
              href="/worksheet-activity"
              className="premium-button-shadow mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-7 py-4 font-black text-[var(--fd-blue)] transition hover:-translate-y-0.5"
            >
              <Palette size={18} aria-hidden="true" />
              <span className="font-kindergarten text-lg">Open Studio</span>
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Pen and eraser", WandSparkles],
              ["Text tool", CheckCircle2],
              ["Upload PDF page", FileText],
              ["Export PNG or PDF", Star],
            ].map(([label, Icon]) => (
              <div key={label as string} className="rounded-lg border border-white/18 bg-white/12 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.12)] backdrop-blur">
                <Icon size={24} className="text-[var(--fd-yellow)]" aria-hidden="true" />
                <p className="font-kindergarten mt-4 text-2xl">{label as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="access" className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-[1fr_0.85fr] md:px-8 md:py-24">
        <div>
          <p className="font-kindergarten text-lg text-[var(--fd-red)]">Premium member access</p>
          <h2 className="font-blank-space mt-3 text-4xl tracking-normal md:text-6xl">
            Unlock what your child needs
          </h2>
          <p className="font-kindergarten mt-5 max-w-2xl text-xl leading-8 text-[#4c57a9]">
            Parents can choose the right learning section for their child. Each area opens only
            when it is included in the selected package.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {premiumDetails.map((item) => (
              <div key={item} className="premium-card-shadow flex items-start gap-3 rounded-lg bg-white/88 p-4">
                <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-[var(--fd-green)]" aria-hidden="true" />
                <p className="font-kindergarten text-lg leading-6">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="premium-card-shadow rounded-lg border border-white/85 bg-white/90 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="font-kindergarten text-lg text-[var(--fd-green)]">How it starts</p>
              <h3 className="font-blank-space mt-1 text-4xl">Parent journey</h3>
            </div>
            <div className="grid size-12 place-items-center rounded-lg bg-[#fff8dc] text-[var(--fd-red)]">
              <LockKeyhole size={24} aria-hidden="true" />
            </div>
          </div>

          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center gap-3 rounded-lg bg-[var(--fd-cream)] p-4">
                <span className="font-blank-space grid size-10 place-items-center rounded-lg bg-white text-2xl text-[var(--fd-blue)]">
                  {index + 1}
                </span>
                <span className="font-kindergarten text-xl text-[var(--fd-blue)]">{step}</span>
              </div>
            ))}
          </div>

          <Link
            href="/register"
          className="premium-button-shadow mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--fd-blue)] px-5 py-4 font-black text-white transition hover:-translate-y-0.5" >
            <span className="font-kindergarten text-lg">Start Registration</span>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </aside>
      </section>
    </main>
  );
}
