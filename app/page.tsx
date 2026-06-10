import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Gift,
  GraduationCap,
  LayoutDashboard,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import LoginRedirectButton from "@/components/LoginRedirectButton";

const features = [
  {
    icon: UsersRound,
    title: "Parent Command Centre",
    description:
      "Track every child, view progress, and keep learning routines organised from one simple portal.",
  },
  {
    icon: GraduationCap,
    title: "Tuition Student Space",
    description:
      "Students can access homework, notes, weekly tasks, and guided materials without messy links.",
  },
  {
    icon: BookOpenCheck,
    title: "Worksheet Library",
    description:
      "Printable weekly worksheets, flashcards, and activity packs for preschool and primary learners.",
  },
];

const highlights = [
  "Weekly learning packs",
  "Reward-based progress",
  "Freebie resource vault",
  "Parent-friendly dashboard",
];

const plans = [
  {
    name: "Trial",
    price: "RM29",
    note: "Best for first-time families",
    items: ["Week 1 access", "Parent dashboard", "Freebies access"],
    featured: false,
  },
  {
    name: "Monthly",
    price: "RM49",
    note: "Most popular for steady learning",
    items: ["4 weeks access", "Reward system", "Learning hub", "Freebies access"],
    featured: true,
  },
  {
    name: "Premium",
    price: "RM200",
    note: "Full support for committed learners",
    items: ["6 months access", "All worksheets", "Premium resources", "Priority support"],
    featured: false,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--fd-cream)] text-[var(--fd-blue)]">
      <section className="relative overflow-hidden">
        <Image
          src="/brand/learning-hero.png"
          alt="Bright learning desk with worksheets and rewards"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,253,248,0.98)_0%,rgba(255,253,248,0.9)_42%,rgba(255,253,248,0.42)_72%,rgba(255,253,248,0.1)_100%)]" />
        <div className="absolute inset-x-0 top-0 z-50 border-b border-[var(--fd-blue)]/10 bg-white/70 backdrop-blur-xl">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
            <Link href="/" className="font-black tracking-tight">
              <BrandLogo subtitle="Learning Hub" imageClassName="h-10 w-20" />
            </Link>

            <div className="hidden items-center gap-7 text-sm font-semibold text-[var(--fd-blue)]/75 md:flex">
              <a href="#programs">Programs</a>
              <a href="#pricing">Pricing</a>
              <a href="#freebies">Freebies</a>
            </div>

            <LoginRedirectButton />
          </nav>
        </div>

        <div className="relative z-10 mx-auto grid min-h-[680px] max-w-7xl content-center px-5 pb-16 pt-28 md:px-8 lg:min-h-[760px]">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--fd-blue)]/10 bg-white/80 px-4 py-2 text-sm font-bold text-[var(--fd-blue)] shadow-sm backdrop-blur">
              <Sparkles size={16} className="text-[var(--fd-red)]" aria-hidden="true" />
              Learn, play, grow together
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-normal text-[var(--fd-blue)] md:text-7xl">
              Premium learning hub for curious young minds.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#4c57a9] md:text-xl">
              FD Arcadia brings worksheets, tuition tasks, rewards, and parent progress tracking into one beautiful learning experience for homeschoolers, preschoolers, and primary students.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--fd-red)] px-6 py-4 text-base font-black text-white shadow-[0_18px_45px_rgba(232,93,69,0.28)] transition hover:-translate-y-0.5"
              >
                Get Started
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link
                href="/freebies"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--fd-blue)]/15 bg-white/85 px-6 py-4 text-base font-black text-[var(--fd-blue)] shadow-sm backdrop-blur transition hover:-translate-y-0.5"
              >
                <Gift size={18} aria-hidden="true" />
                Explore Freebies
              </Link>
            </div>

            <div className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["200+", "resources"],
                ["4", "weekly hubs"],
                ["3", "flexible plans"],
                ["1", "parent portal"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-lg border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur">
                  <p className="text-2xl font-black text-[var(--fd-blue)]">{value}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[#6698cc]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="programs" className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--fd-green)]">
              Built for real routines
            </p>
            <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-normal md:text-5xl">
              Everything families need to keep learning moving.
            </h2>
          </div>
          <p className="max-w-md text-base leading-7 text-[#4c57a9]">
            Clean access for parents, guided work for students, and ready-to-use resources for every week.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-lg border border-[var(--fd-blue)]/10 bg-white p-7 shadow-[0_20px_60px_rgba(23,32,51,0.08)] transition hover:-translate-y-1"
            >
              <div className="grid size-12 place-items-center rounded-lg bg-[#f0f7e6] text-[var(--fd-green)]">
                <feature.icon size={24} aria-hidden="true" />
              </div>
              <h3 className="mt-6 text-2xl font-black">{feature.title}</h3>
              <p className="mt-3 leading-7 text-[#4c57a9]">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[var(--fd-blue)] py-16 text-white md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 md:grid-cols-[0.9fr_1.1fr] md:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--fd-yellow)]">
              Why parents choose us
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-normal md:text-5xl">
              Structured learning that still feels joyful.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {highlights.map((item, index) => {
              const Icon = [BookOpenCheck, Trophy, Gift, LayoutDashboard][index];

              return (
                <div key={item} className="rounded-lg border border-white/10 bg-white/8 p-5">
                  <Icon size={24} className="text-[var(--fd-yellow)]" aria-hidden="true" />
                  <p className="mt-4 text-lg font-black">{item}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="freebies" className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--fd-red)]">
              Free resources
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-normal md:text-5xl">
              Give parents a reason to start today.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#4c57a9]">
              The freebies area can become your lead magnet: printable samples, flashcards, mini activities, and preview packs that build trust before parents subscribe.
            </p>
            <Link
              href="/freebies"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[var(--fd-green)] px-6 py-4 font-black text-white shadow-[0_18px_45px_rgba(15,139,141,0.22)] transition hover:-translate-y-0.5"
            >
              View Freebies
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {["Worksheets", "Flashcards", "Activities", "Reward charts"].map((item, index) => (
              <div
                key={item}
                className="rounded-lg border border-[var(--fd-blue)]/10 bg-white p-6 shadow-[0_18px_50px_rgba(23,32,51,0.08)]"
              >
                <Image
                  src={["/stickers/star.svg", "/stickers/smile.svg", "/stickers/heart.svg", "/stickers/trophy.svg"][index]}
                  alt=""
                  width={42}
                  height={42}
                  className="h-11 w-11 object-contain"
                />
                <p className="mt-5 text-xl font-black">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-[#fff8dc] px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--fd-green)]">
              Subscription plans
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-normal md:text-5xl">
              Pick the pace that fits your child.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={
                  plan.featured
                    ? "relative rounded-lg bg-[var(--fd-blue)] p-7 text-white shadow-[0_24px_70px_rgba(23,32,51,0.22)]"
                    : "rounded-lg border border-[var(--fd-blue)]/10 bg-white p-7 shadow-[0_18px_50px_rgba(23,32,51,0.08)]"
                }
              >
                {plan.featured && (
                  <div className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full bg-[var(--fd-yellow)] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[var(--fd-blue)]">
                    <Star size={13} fill="currentColor" aria-hidden="true" />
                    Popular
                  </div>
                )}
                <h3 className="text-3xl font-black">{plan.name}</h3>
                <p className={plan.featured ? "mt-2 text-white/70" : "mt-2 text-[#4c57a9]"}>
                  {plan.note}
                </p>
                <p className="mt-7 text-5xl font-black">{plan.price}</p>
                <ul className="mt-7 space-y-3">
                  {plan.items.map((item) => (
                    <li key={item} className="flex items-center gap-3 font-semibold">
                      <CheckCircle2
                        size={19}
                        className={plan.featured ? "text-[var(--fd-yellow)]" : "text-[var(--fd-green)]"}
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <div className="rounded-lg bg-[var(--fd-red)] p-8 text-white shadow-[0_24px_80px_rgba(232,93,69,0.2)] md:p-12">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/16 px-4 py-2 text-sm font-black">
                <ShieldCheck size={16} aria-hidden="true" />
                Parent-ready platform
              </div>
              <h2 className="text-4xl font-black tracking-normal md:text-5xl">
                Ready to make FD Arcadia feel official?
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-white/85">
                Start with the learning hub now, then add your real contact details, student stories, and WhatsApp signup when you are ready to launch.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-4 font-black text-[var(--fd-blue)] transition hover:-translate-y-0.5"
              >
                Join Now
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <a
                href="https://wa.me/"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/35 px-6 py-4 font-black text-white transition hover:-translate-y-0.5"
              >
                <MessageCircle size={18} aria-hidden="true" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
