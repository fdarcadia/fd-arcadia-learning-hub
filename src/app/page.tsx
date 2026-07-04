import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Gift,
  Paintbrush,
  Sparkles,
  Star,
  CheckCircle2,
  Calculator,
  Pencil,
  BookOpen,
  Trophy,
} from "lucide-react";

export default function HomePage() {
  const features = [
    {
      title: "Learning Hub",
      description:
        "Structured weekly schedules and printable worksheets to support your child's learning journey.",
      icon: "📚",
    },
    {
      title: "Math Activity",
      description:
        "Addition, subtraction, multiplication and division activities for fun practice.",
      icon: "➕",
    },
    {
      title: "Sifir Deck",
      description:
        "Practice multiplication facts from 1–12 through simple and engaging exercises.",
      icon: "🔢",
    },
    {
      title: "Draw & Learn Canvas",
      description:
        "Write, draw, colour and complete digital worksheets directly online.",
      icon: "✏️",
    },
    {
      title: "Freebies Library",
      description:
        "Access free educational resources and printable learning materials.",
      icon: "🎁",
    },
    {
      title: "Custom Worksheet",
      description:
        "Personalised worksheets based on your child's age, level and learning needs.",
      icon: "📝",
    },
  ];

  const packages = [
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
    <main className="min-h-screen bg-[#f8f5ef] text-slate-900">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600 text-yellow-200 shadow-lg">
            <Sparkles size={26} />
          </div>
          <div>
            <p className="text-xl font-black tracking-[0.2em] text-slate-900">
              FD ARCADIA
            </p>
            <p className="text-sm font-bold tracking-[0.3em] text-indigo-600">
              LEARNING HUB
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-2xl border border-indigo-100 bg-white px-5 py-3 font-bold text-indigo-700 shadow-sm transition hover:-translate-y-0.5"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-2xl bg-indigo-600 px-5 py-3 font-bold text-white shadow-lg transition hover:-translate-y-0.5"
          >
            Register
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-bold text-emerald-700 shadow-sm">
            <Star size={18} />
            Learning made fun, simple and meaningful
          </div>

          <h1 className="max-w-4xl text-5xl font-black leading-tight text-indigo-700 sm:text-6xl lg:text-7xl">
            FD Arcadia Learning Hub
          </h1>

          <p className="mt-6 max-w-2xl text-xl leading-9 text-slate-600">
            A fun and interactive learning platform designed for children aged
            4–12 years. Access structured learning schedules, printable
            worksheets, math activities, sifir practice, digital drawing tools
            and personalised learning resources anytime, anywhere.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-7 py-4 text-lg font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-indigo-700"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-200 px-7 py-4 text-lg font-black text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-yellow-300"
            >
              Get Started
              <ArrowRight size={22} />
            </Link>

            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-2xl border border-indigo-100 bg-white px-7 py-4 text-lg font-black text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50"
            >
              View Packages
            </Link>
          </div>

          <div className="mt-10 grid max-w-2xl grid-cols-3 gap-4">
            <div className="rounded-3xl bg-white p-5 text-center shadow-sm">
              <p className="text-3xl font-black text-indigo-700">6+</p>
              <p className="mt-1 text-sm font-bold text-slate-500">Resources</p>
            </div>
            <div className="rounded-3xl bg-white p-5 text-center shadow-sm">
              <p className="text-3xl font-black text-indigo-700">4–12</p>
              <p className="mt-1 text-sm font-bold text-slate-500">Years Old</p>
            </div>
            <div className="rounded-3xl bg-white p-5 text-center shadow-sm">
              <p className="text-3xl font-black text-indigo-700">RM5</p>
              <p className="mt-1 text-sm font-bold text-slate-500">From</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-indigo-100 bg-white p-5 shadow-xl">
          <div className="rounded-[2rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold tracking-[0.25em] text-yellow-200">
                  CHILD DASHBOARD
                </p>
                <h2 className="mt-3 text-4xl font-black">Learn, play & grow</h2>
              </div>
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/20">
                <BookOpenCheck size={34} />
              </div>
            </div>

            <div className="mt-8 rounded-3xl bg-white p-5 text-slate-900">
              <div className="flex items-center gap-4">
                <div className="grid h-20 w-20 place-items-center rounded-3xl bg-sky-100 text-4xl">
                  👧
                </div>
                <div>
                  <h3 className="text-2xl font-black">My Learning Progress</h3>
                  <p className="font-semibold text-slate-500">
                    Weekly learning tracker
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-indigo-50 p-4">
                  <Calculator className="text-indigo-600" />
                  <p className="mt-2 font-black">Math</p>
                  <p className="text-sm text-slate-500">Practice activities</p>
                </div>
                <div className="rounded-2xl bg-yellow-50 p-4">
                  <BookOpen className="text-yellow-600" />
                  <p className="mt-2 font-black">Reading</p>
                  <p className="text-sm text-slate-500">Build confidence</p>
                </div>
                <div className="rounded-2xl bg-pink-50 p-4">
                  <Pencil className="text-pink-600" />
                  <p className="mt-2 font-black">Worksheet</p>
                  <p className="text-sm text-slate-500">Printable files</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <Trophy className="text-emerald-600" />
                  <p className="mt-2 font-black">Progress</p>
                  <p className="text-sm text-slate-500">Track by week</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-[2.5rem] bg-white p-8 shadow-sm">
          <h2 className="text-center text-4xl font-black text-indigo-700">
            Everything Your Child Needs in One Place
          </h2>

          <p className="mx-auto mt-5 max-w-4xl text-center text-lg leading-8 text-slate-600">
            FD Arcadia Learning Hub is designed to make learning fun, simple and
            stress-free for both children and parents. Each activity is carefully
            created to help children build confidence in reading, writing,
            mathematics and problem-solving skills through interactive and
            hands-on learning experiences.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="text-center text-4xl font-black text-indigo-700">
          Our Learning Resources
        </h2>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="grid h-16 w-16 place-items-center rounded-3xl bg-indigo-50 text-4xl">
                {feature.icon}
              </div>

              <h3 className="mt-5 text-2xl font-black text-indigo-700">
                {feature.title}
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="text-center text-4xl font-black text-indigo-700">
          Packages Starting From RM5
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-slate-600">
          Choose a package that suits your child's learning needs. Parent can
          register first and access will be unlocked after payment confirmation.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((item) => (
            <div
              key={item.name}
              className={`rounded-[2rem] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                item.highlight
                  ? "border-2 border-yellow-300"
                  : "border border-indigo-100"
              }`}
            >
              {item.highlight && (
                <div className="mb-4 inline-flex rounded-full bg-yellow-200 px-4 py-2 text-sm font-black text-indigo-700">
                  Best Value
                </div>
              )}

              <h3 className="text-xl font-black text-slate-800">{item.name}</h3>

              <p className="mt-4 text-4xl font-black text-indigo-700">
                {item.price}
              </p>

              <p className="mt-3 leading-7 text-slate-600">{item.detail}</p>

              <div className="mt-5 flex items-center gap-2 text-sm font-bold text-emerald-600">
                <CheckCircle2 size={18} />
                Access after payment confirmation
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-7 py-4 text-lg font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-700"
          >
            View All Packages
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 p-8 text-center text-white shadow-xl">
          <h2 className="text-4xl font-black">Ready to Start Learning?</h2>

          <p className="mx-auto mt-5 max-w-3xl text-xl leading-9 text-indigo-100">
            Join FD Arcadia Learning Hub today and give your child access to
            engaging educational resources designed to build confidence,
            creativity and a love for learning.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-200 px-7 py-4 text-lg font-black text-indigo-700 shadow-md transition hover:-translate-y-0.5 hover:bg-yellow-300"
            >
              Register Now
              <ArrowRight size={22} />
            </Link>

            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-7 py-4 text-lg font-black text-indigo-700 shadow-md transition hover:-translate-y-0.5"
            >
              View Packages
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}