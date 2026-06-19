import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export default function PricingPage() {
  const learningHubPackages = [
    {
      name: "Weekly Access",
      price: "RM30",
      description: "1 week access to Learning Hub.",
      features: [
        "1 Week Learning Hub Access",
        "Weekly Schedule",
        "Printable Worksheets",
        "Parent-friendly learning guide",
      ],
    },
    {
      name: "Monthly Access",
      price: "RM50",
      description: "1 month access to Learning Hub.",
      features: [
        "1 Month Learning Hub Access",
        "Weekly Learning Schedule",
        "Printable Worksheets",
        "Reading, writing and math activities",
      ],
      highlight: true,
    },
    {
      name: "6 Months Access",
      price: "RM210",
      description: "6 months access to Learning Hub.",
      features: [
        "6 Months Learning Hub Access",
        "Structured learning plan",
        "Printable worksheets",
        "Best for consistent home learning",
      ],
    },
  ];

  const customWorksheetPackages = [
    {
      name: "Trial",
      price: "RM5",
      detail: "3 Activities",
    },
    {
      name: "Basic",
      price: "RM15",
      detail: "7 Activities",
    },
    {
      name: "Standard",
      price: "RM25",
      detail: "12 Activities",
    },
    {
      name: "Premium",
      price: "RM39",
      detail: "18 Activities",
      highlight: true,
    },
  ];

  return (
    <main className="page-shell py-10">
      {/* Hero */}
      <section className="rounded-[2rem] bg-gradient-to-br from-yellow-100 via-pink-100 to-sky-100 p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-emerald-700 shadow-sm">
          <Sparkles size={18} />
          Choose the best learning package for your child
        </div>

        <h1 className="font-display text-5xl text-indigo-700 sm:text-6xl">
          FD Arcadia Packages
        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-xl leading-9 text-slate-600">
          Affordable learning support for children aged 4–7 years. Choose from
          Learning Hub access, Math Activity, Sifir Deck, Draw & Learn Canvas or
          personalised custom worksheets.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/register"
            className="button-shadow inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 text-xl font-bold text-white transition hover:-translate-y-0.5 hover:bg-indigo-700"
          >
            Register Now
            <ArrowRight size={22} />
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-4 text-xl font-bold text-indigo-700 shadow-md transition hover:-translate-y-0.5"
          >
            Login
          </Link>
        </div>
      </section>

      {/* Math Package + Full Package */}
      <section className="mt-16 grid gap-6 lg:grid-cols-2">
        <div className="soft-card p-8">
          <div className="mb-4 inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
            Math Starter
          </div>

          <h2 className="font-display text-4xl text-indigo-700">
            Math Package
          </h2>

          <p className="mt-3 text-5xl font-bold text-indigo-700">RM25</p>

          <p className="mt-4 text-lg leading-8 text-slate-600">
            Perfect for children who need fun and simple math practice at home.
          </p>

          <div className="mt-6 grid gap-3 text-lg text-slate-700">
            <PackageFeature text="Math Activity" />
            <PackageFeature text="Addition, subtraction, multiplication and division" />
            <PackageFeature text="Sifir Deck 1–12" />
            <PackageFeature text="Freebies Library" />
          </div>

          <Link
            href="/register"
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 text-lg font-bold text-white transition hover:-translate-y-0.5 hover:bg-indigo-700"
          >
            Choose Math Package
            <ArrowRight size={20} />
          </Link>
        </div>

        <div className="soft-card border-2 border-yellow-400 p-8">
          <div className="mb-4 inline-flex rounded-full bg-yellow-200 px-4 py-2 text-sm font-bold text-indigo-700">
            Best Value
          </div>

          <h2 className="font-display text-4xl text-indigo-700">
            Full Package
          </h2>

          <p className="mt-3 text-5xl font-bold text-indigo-700">RM250</p>

          <p className="mt-4 text-lg leading-8 text-slate-600">
            Complete learning access for parents who want everything in one
            package.
          </p>

          <div className="mt-6 grid gap-3 text-lg text-slate-700">
            <PackageFeature text="Learning Hub Schedule and Worksheets" />
            <PackageFeature text="Math Activity" />
            <PackageFeature text="Draw & Learn Canvas" />
            <PackageFeature text="Sifir Deck 1–12" />
            <PackageFeature text="Freebies Library" />
          </div>

          <Link
            href="/register"
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-200 px-6 py-4 text-lg font-bold text-indigo-700 shadow-md transition hover:-translate-y-0.5 hover:bg-yellow-300"
          >
            Choose Full Package
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Learning Hub Packages */}
      <section className="mt-20">
        <h2 className="text-center font-display text-4xl text-indigo-700">
          Learning Hub Access
        </h2>

        <p className="mx-auto mt-4 max-w-3xl text-center text-lg leading-8 text-slate-600">
          Access structured weekly schedules and worksheets created to support
          reading, writing, math and early learning skills.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {learningHubPackages.map((item) => (
            <div
              key={item.name}
              className={`soft-card p-8 ${
                item.highlight ? "border-2 border-indigo-300" : ""
              }`}
            >
              {item.highlight && (
                <div className="mb-4 inline-flex rounded-full bg-indigo-100 px-4 py-2 text-sm font-bold text-indigo-700">
                  Popular Choice
                </div>
              )}

              <h3 className="text-2xl font-bold text-slate-800">
                {item.name}
              </h3>

              <p className="mt-3 text-5xl font-bold text-indigo-700">
                {item.price}
              </p>

              <p className="mt-4 leading-7 text-slate-600">
                {item.description}
              </p>

              <div className="mt-6 grid gap-3 text-slate-700">
                {item.features.map((feature) => (
                  <PackageFeature key={feature} text={feature} />
                ))}
              </div>

              <Link
                href="/register"
                className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-6 py-4 text-lg font-bold text-white transition hover:-translate-y-0.5 hover:bg-indigo-700"
              >
                Choose Package
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Custom Worksheet Packages */}
      <section className="mt-20">
        <h2 className="text-center font-display text-4xl text-indigo-700">
          Custom Worksheet Packages
        </h2>

        <p className="mx-auto mt-4 max-w-3xl text-center text-lg leading-8 text-slate-600">
          Personalised worksheet activities based on your child&apos;s age,
          level and learning needs.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {customWorksheetPackages.map((item) => (
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

              <h3 className="text-xl font-bold text-slate-800">
                {item.name}
              </h3>

              <p className="mt-3 text-4xl font-bold text-indigo-700">
                {item.price}
              </p>

              <p className="mt-3 text-lg text-slate-600">{item.detail}</p>

              <Link
                href="/register"
                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3 font-bold text-indigo-700 shadow-md transition hover:-translate-y-0.5"
              >
                Select
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="mt-20 rounded-[2rem] bg-white p-8 shadow-sm">
        <h2 className="text-center font-display text-4xl text-indigo-700">
          How to Get Access
        </h2>

        <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3">
          <StepCard
            number="1"
            title="Register Account"
            description="Create your parent account using email and password."
          />

          <StepCard
            number="2"
            title="Choose Package"
            description="Select the package that suits your child&apos;s learning needs."
          />

          <StepCard
            number="3"
            title="Access Unlocked"
            description="After payment confirmation, your selected features will be unlocked."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="mt-20 rounded-[2rem] bg-indigo-700 p-8 text-center text-white">
        <h2 className="font-display text-4xl">
          Ready to Start Your Child&apos;s Learning Journey?
        </h2>

        <p className="mx-auto mt-5 max-w-3xl text-xl leading-9 text-indigo-100">
          Join FD Arcadia Learning Hub and support your child with engaging,
          meaningful and easy-to-follow learning activities.
        </p>

        <Link
          href="/register"
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-200 px-6 py-4 text-xl font-bold text-indigo-700 shadow-md transition hover:-translate-y-0.5 hover:bg-yellow-300"
        >
          Register Now
          <ArrowRight size={22} />
        </Link>
      </section>
    </main>
  );
}

function PackageFeature({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle2 className="mt-1 shrink-0 text-emerald-500" size={20} />
      <span>{text}</span>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-yellow-50 via-pink-50 to-sky-50 p-6 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-indigo-600 text-2xl font-bold text-white">
        {number}
      </div>

      <h3 className="mt-5 text-xl font-bold text-indigo-700">{title}</h3>

      <p className="mt-3 leading-7 text-slate-600">{description}</p>
    </div>
  );
}