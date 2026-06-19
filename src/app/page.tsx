import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Gift,
  Paintbrush,
  Sparkles,
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
    <main className="page-shell py-10">
      <section className="grid min-h-screen gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-emerald-700 shadow-sm">
            <Sparkles size={18} />
            Learning made fun, simple and meaningful
          </div>

          <h1 className="font-display text-5xl leading-tight text-indigo-700 sm:text-6xl lg:text-7xl">
            FD Arcadia Learning Hub
          </h1>

          <p className="mt-6 max-w-2xl text-xl leading-9 text-slate-600">
            A fun and interactive learning platform designed for children aged
            4–12 years. Access structured learning schedules, printable
            worksheets, math activities, sifir practice, digital drawing tools
            and personalised learning resources anytime, anywhere.
          </p>

          <div className="mt-6 grid gap-2 text-lg text-slate-700">
            <p>📚 Learning Hub & Worksheets</p>
            <p>➕ Math Activities</p>
            <p>🔢 Sifir Deck 1–12</p>
            <p>✏️ Draw & Learn Canvas</p>
            <p>🎁 Freebies Resources</p>
            <p>📝 Custom Worksheets</p>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/login"
              className="button-shadow inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-4 text-xl font-bold text-white transition hover:-translate-y-0.5 hover:bg-indigo-700"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-200 px-6 py-4 text-xl font-bold text-indigo-700 shadow-md transition hover:-translate-y-0.5 hover:bg-yellow-300"
            >
              Get Started
              <ArrowRight size={22} />
            </Link>

            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-2xl border border-indigo-200 bg-white px-6 py-4 text-xl font-bold text-indigo-700 shadow-md transition hover:-translate-y-0.5 hover:bg-indigo-50"
            >
              View Packages
            </Link>
          </div>
        </div>

        <div className="soft-card rounded-[2rem] p-6">
          <div className="rounded-[1.5rem] bg-gradient-to-br from-yellow-100 via-pink-100 to-sky-100 p-8">
            <div className="mb-8 grid h-24 w-24 place-items-center rounded-3xl bg-white text-indigo-600 shadow-md">
              <BookOpenCheck size={48} />
            </div>

            <h2 className="font-display text-4xl text-indigo-700">
              Learn, play, and grow
            </h2>

            <p className="mt-4 text-xl leading-8 text-slate-600">
              A cheerful learning portal made for subscriptions, worksheets,
              interactive activities and child-friendly digital learning.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <Paintbrush className="text-pink-500" size={32} />
                <p className="mt-3 font-bold text-slate-700">
                  Creative Learning
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <Gift className="text-emerald-500" size={32} />
                <p className="mt-3 font-bold text-slate-700">
                  Free Resources
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-[2rem] bg-white p-8 shadow-sm">
        <h2 className="text-center font-display text-4xl text-indigo-700">
          Everything Your Child Needs in One Place
        </h2>

        <p className="mx-auto mt-6 max-w-4xl text-center text-xl leading-9 text-slate-600">
          FD Arcadia Learning Hub is designed to make learning fun, simple and
          stress-free for both children and parents. Each activity is carefully
          created to help children build confidence in reading, writing,
          mathematics and problem-solving skills through interactive and
          hands-on learning experiences.
        </p>
      </section>

      <section className="mt-20">
        <h2 className="text-center font-display text-4xl text-indigo-700">
          Our Learning Resources
        </h2>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="soft-card p-6">
              <div className="text-4xl">{feature.icon}</div>

              <h3 className="mt-4 text-2xl font-bold text-indigo-700">
                {feature.title}
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <h2 className="text-center font-display text-4xl text-indigo-700">
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
              className={`soft-card p-6 ${
                item.highlight ? "border-2 border-yellow-400" : ""
              }`}
            >
              {item.highlight && (
                <div className="mb-3 inline-flex rounded-full bg-yellow-200 px-3 py-1 text-sm font-bold text-indigo-700">
                  Best Value
                </div>
              )}

              <h3 className="text-xl font-bold text-slate-800">{item.name}</h3>

              <p className="mt-3 text-4xl font-bold text-indigo-700">
                {item.price}
              </p>

              <p className="mt-3 leading-7 text-slate-600">{item.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-4 text-xl font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-indigo-700"
          >
            View All Packages
          </Link>
        </div>
      </section>

      <section className="mt-20 rounded-[2rem] bg-gradient-to-br from-indigo-50 via-pink-50 to-yellow-50 p-8">
        <h2 className="text-center font-display text-4xl text-indigo-700">
          Why Parents Love FD Arcadia
        </h2>

        <div className="mx-auto mt-10 grid max-w-4xl gap-4 text-lg text-slate-700 md:grid-cols-2">
          <p>✅ Child-friendly activities</p>
          <p>✅ Easy for parents to follow</p>
          <p>✅ Interactive learning experience</p>
          <p>✅ Printable resources</p>
          <p>✅ Affordable learning support</p>
          <p>✅ Flexible learning anytime, anywhere</p>
        </div>
      </section>

      <section className="mt-20 rounded-[2rem] bg-indigo-700 p-8 text-center text-white">
        <h2 className="font-display text-4xl">Ready to Start Learning?</h2>

        <p className="mx-auto mt-5 max-w-3xl text-xl leading-9 text-indigo-100">
          Join FD Arcadia Learning Hub today and give your child access to
          engaging educational resources designed to build confidence, creativity
          and a love for learning.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-200 px-6 py-4 text-xl font-bold text-indigo-700 shadow-md transition hover:-translate-y-0.5 hover:bg-yellow-300"
          >
            Register Now
            <ArrowRight size={22} />
          </Link>

          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-4 text-xl font-bold text-indigo-700 shadow-md transition hover:-translate-y-0.5"
          >
            View Packages
          </Link>
        </div>
      </section>
    </main>
  );
}