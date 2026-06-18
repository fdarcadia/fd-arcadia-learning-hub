import Link from "next/link";
import { ArrowRight, BookOpenCheck, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <main className="page-shell flex min-h-screen items-center py-10">
      <section className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-emerald-700 shadow-sm">
            <Sparkles size={18} />
            Cute learning for bright little minds
          </div>
          <h1 className="font-display text-5xl leading-tight text-indigo-700 sm:text-6xl lg:text-7xl">
            FD Arcadia Learning Hub
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-9 text-slate-600">
            Welcome to a cheerful education space for parents and children.
            Login, manage your profile, and start simple learning activities in
            one friendly portal.
          </p>

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
              A soft, simple portal made for subscriptions, worksheets, and
              child-friendly activities.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
