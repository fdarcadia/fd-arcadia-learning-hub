"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { TextInput } from "@/components/TextInput";
import { supabase, type UserType } from "@/lib/supabase";

type MainPackage =
  | "learning_hub"
  | "custom_worksheet"
  | "math_package"
  | "flashcard_module"
  | "digital_module"
  | "full_package";

type PackageOption = {
  value: string;
  label: string;
  price: string;
  description: string;
};

const packageGroups: Record<
  MainPackage,
  {
    title: string;
    userType: UserType;
    description: string;
    options: PackageOption[];
  }
> = {
  learning_hub: {
    title: "Learning Hub",
    userType: "learning_hub",
    description: "Structured schedules and worksheets.",
    options: [
      {
        value: "learning_hub_weekly",
        label: "Trial / Weekly",
        price: "RM30",
        description: "1 week Learning Hub access.",
      },
      {
        value: "learning_hub_monthly",
        label: "Standard / Monthly",
        price: "RM50",
        description: "1 month Learning Hub access.",
      },
      {
        value: "learning_hub_6month",
        label: "Premium / 6 Months",
        price: "RM210",
        description: "6 months Learning Hub access.",
      },
    ],
  },
  custom_worksheet: {
    title: "Custom Worksheet",
    userType: "custom_worksheet",
    description: "Personalised worksheet activities.",
    options: [
      {
        value: "worksheet_trial",
        label: "Trial",
        price: "RM5",
        description: "3 activities.",
      },
      {
        value: "worksheet_basic",
        label: "Basic",
        price: "RM15",
        description: "7 activities.",
      },
      {
        value: "worksheet_standard",
        label: "Standard",
        price: "RM25",
        description: "12 activities.",
      },
      {
        value: "worksheet_premium",
        label: "Premium",
        price: "RM39",
        description: "18 activities.",
      },
    ],
  },
  math_package: {
    title: "Math Package",
    userType: "learning_hub",
    description: "Math Activity, Sifir Deck and Freebies.",
    options: [
      {
        value: "math_package",
        label: "Math Package",
        price: "RM25",
        description: "Math Activity + Sifir Deck 1–12 + Freebies.",
      },
    ],
  },
  flashcard_module: {
    title: "Flashcard Digital",
    userType: "learning_hub",
    description: "Koleksi Flashcard Digital FD Arcadia.",
    options: [
     {
  value: "flashcard_rm6",
  label: "Flashcard Digital",
  price: "RM6",
  description: "1 Buku (Softcopy)",
},
{
  value: "flashcard_rm12",
  label: "Flashcard Digital",
  price: "RM12",
  description: "2 Buku (Softcopy)",
},
{
  value: "flashcard_rm17",
  label: "Flashcard Digital",
  price: "RM17",
  description: "3 Buku (Softcopy)",
},
{
  value: "flashcard_rm22",
  label: "Flashcard Digital",
  price: "RM22",
  description: "4 Buku (Softcopy)",
},
{
  value: "flashcard_rm27",
  label: "Flashcard Digital",
  price: "RM27",
  description: "5 Buku (Softcopy)",
},
{
  value: "flashcard_rm42",
  label: "Flashcard Digital",
  price: "RM42",
  description: "8 Buku (Softcopy)",
},
    ],
  },

  digital_module: {
    title: "Modul Digital",
    userType: "learning_hub",
    description: "3 Modul Digital FD Arcadia.",
    options: [
      {
        value: "moduldigital_rm60",
        label: "Modul Digital",
        price: "RM60",
        description: "Read Only No Download.",
      },
    ],
  },

  full_package: {
    title: "Full Package",
    userType: "learning_hub",
    description: "Complete FD Arcadia learning access.",
    options: [
      {
        value: "full_package",
        label: "Full Package",
        price: "RM250",
        description:
          "Learning Hub + Math Activity + Draw & Learn + Sifir Deck + Freebies.",
      },
    ],
  },
};

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [mainPackage, setMainPackage] =
    useState<MainPackage>("learning_hub");

  const [packageType, setPackageType] = useState("learning_hub_weekly");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedGroup = packageGroups[mainPackage];

  const selectedPackage = useMemo(() => {
    return (
      selectedGroup.options.find((option) => option.value === packageType) ||
      selectedGroup.options[0]
    );
  }, [packageType, selectedGroup.options]);

  function handleMainPackageChange(value: MainPackage) {
    setMainPackage(value);
    setPackageType(packageGroups[value].options[0].value);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
    });

    if (signUpError || !data.user) {
      setLoading(false);
      setError(signUpError?.message ?? "Could not create account.");
      return;
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: data.user.id,
      email: cleanEmail,
      full_name: fullName,
      user_type: selectedGroup.userType,
      avatar_url: null,

      package_type: packageType,
      package_note: `${selectedPackage.label} ${selectedPackage.price} - ${selectedPackage.description}`,

      learning_hub_unlocked: false,
      custom_worksheet_unlocked: false,
      flashcard_modul_unlocked: false,
      math_activity_unlocked: false,
      draw_learn_unlocked: false,
      sifir_deck_unlocked: false,
      freebies_unlocked: false,

      subscription_start: null,
      subscription_end: null,
    });

    setLoading(false);

    if (profileError) {
      setError(profileError.message);
      return;
    }

    router.replace("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-5 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-[1380px] items-center">
        <section className="grid w-full overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.13)] xl:grid-cols-[0.82fr_1.18fr]">
          {/* LEFT PREMIUM PANEL */}
          <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#111735] via-[#25265f] to-[#4c3fc9] p-9 text-white xl:flex xl:flex-col xl:justify-between">
            <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl" />
            <div className="absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-indigo-300/10 blur-3xl" />

            <div className="relative">
              <Link href="/" className="inline-flex items-center gap-3">
                {/* Optional custom logo:
                <img
                  src="/fd-arcadia-logo.png"
                  alt="FD Arcadia"
                  className="h-12 w-auto object-contain"
                />
                */}
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/10 text-yellow-300 shadow-sm backdrop-blur">
                  <ArrowRight size={22} />
                </div>

                <div>
                  <p className="text-sm font-black tracking-[0.12em]">
                    FD ARCADIA
                  </p>
                  <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.22em] text-violet-300">
                    Parent Registration
                  </p>
                </div>
              </Link>

              <div className="mt-14 max-w-lg">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-200">
                  Create Parent Account
                </p>

                <h1 className="mt-3 text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl">
                  Choose the right learning access for your child.
                </h1>

                <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
                  Register once, choose a package, then wait for admin payment
                  confirmation before access is unlocked.
                </p>
              </div>

              <div className="mt-9 grid gap-3">
                <RegisterFeature
                  title="Choose your package"
                  description="Select Learning Hub, worksheets, flashcards, math or a full package."
                />
                <RegisterFeature
                  title="Manual verification"
                  description="Access stays locked until FD Arcadia confirms payment."
                />
                <RegisterFeature
                  title="Secure parent account"
                  description="Your parent profile and package choice are saved to your account."
                />
              </div>
            </div>

            <div className="relative rounded-[20px] border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-violet-200">
                Selected Package
              </p>
              <p className="mt-2 text-lg font-black text-white">
                {selectedPackage.label}
              </p>
              <p className="mt-1 text-2xl font-black text-yellow-300">
                {selectedPackage.price}
              </p>
              <p className="mt-1 text-[10px] leading-5 text-slate-400">
                {selectedPackage.description}
              </p>
            </div>
          </aside>

          {/* RIGHT REGISTRATION PANEL */}
          <section className="p-5 sm:p-8 lg:p-10 xl:p-12">
            <div className="mx-auto max-w-[760px]">
              <div className="flex items-center justify-between gap-3">
                <Link
                  href="/"
                  className="text-xs font-black text-slate-500 transition hover:text-indigo-600"
                >
                  ← Back to Home
                </Link>

                <Link
                  href="/login"
                  className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-indigo-700"
                >
                  Already registered?
                </Link>
              </div>

              <div className="mt-8">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500">
                  Get Started
                </p>

                <h2 className="mt-1 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                  Register
                </h2>

                <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                  Create your parent account and choose your preferred FD Arcadia package.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-7">
                <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-indigo-500">
                    Account Details
                  </p>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <TextInput
                        label="Full name"
                        value={fullName}
                        required
                        placeholder="Parent name"
                        onChange={setFullName}
                      />
                    </div>

                    <TextInput
                      label="Email"
                      type="email"
                      value={email}
                      required
                      placeholder="parent@email.com"
                      onChange={setEmail}
                    />

                    <TextInput
                      label="Password"
                      type="password"
                      value={password}
                      required
                      placeholder="Create password"
                      onChange={setPassword}
                    />
                  </div>
                </section>

                <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-indigo-500">
                      Step 1
                    </p>
                    <h3 className="mt-1 text-xl font-black text-slate-950">
                      Choose Package Category
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      Select the type of learning access you want.
                    </p>
                  </div>

                  <fieldset className="mt-5">
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {(Object.keys(packageGroups) as MainPackage[]).map((type) => (
                        <label
                          key={type}
                          className={`cursor-pointer rounded-[18px] border p-4 transition ${
                            mainPackage === type
                              ? "border-indigo-500 bg-indigo-50 shadow-sm ring-2 ring-indigo-100"
                              : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/40"
                          }`}
                        >
                          <input
                            type="radio"
                            name="mainPackage"
                            value={type}
                            checked={mainPackage === type}
                            onChange={() => handleMainPackageChange(type)}
                            className="sr-only"
                          />

                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <span className="block text-sm font-black text-slate-900">
                                {packageGroups[type].title}
                              </span>

                              <span className="mt-1.5 block text-[10px] font-semibold leading-5 text-slate-500">
                                {packageGroups[type].description}
                              </span>
                            </div>

                            <span
                              className={`mt-0.5 h-3 w-3 shrink-0 rounded-full border ${
                                mainPackage === type
                                  ? "border-indigo-600 bg-indigo-600 ring-4 ring-indigo-100"
                                  : "border-slate-300 bg-white"
                              }`}
                            />
                          </div>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </section>

                <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-500">
                      Step 2
                    </p>
                    <h3 className="mt-1 text-xl font-black text-slate-950">
                      Choose Package Option
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      Pick the option that matches your preferred access.
                    </p>
                  </div>

                  <fieldset className="mt-5">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {selectedGroup.options.map((option) => (
                        <label
                          key={option.value}
                          className={`cursor-pointer rounded-[18px] border p-4 transition ${
                            packageType === option.value
                              ? "border-violet-500 bg-violet-50 shadow-sm ring-2 ring-violet-100"
                              : "border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/30"
                          }`}
                        >
                          <input
                            type="radio"
                            name="packageType"
                            value={option.value}
                            checked={packageType === option.value}
                            onChange={() => setPackageType(option.value)}
                            className="sr-only"
                          />

                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <span className="block text-sm font-black text-slate-900">
                                {option.label}
                              </span>

                              <span className="mt-2 block text-2xl font-black text-indigo-600">
                                {option.price}
                              </span>

                              <span className="mt-2 block text-[10px] font-semibold leading-5 text-slate-500">
                                {option.description}
                              </span>
                            </div>

                            <span
                              className={`mt-0.5 h-3 w-3 shrink-0 rounded-full border ${
                                packageType === option.value
                                  ? "border-violet-600 bg-violet-600 ring-4 ring-violet-100"
                                  : "border-slate-300 bg-white"
                              }`}
                            />
                          </div>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </section>

                <section className="rounded-[22px] border border-amber-200 bg-amber-50 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-600">
                        Manual Payment
                      </p>
                      <h3 className="mt-1 text-lg font-black text-slate-900">
                        Access unlocks after payment confirmation
                      </h3>
                      <p className="mt-2 max-w-xl text-xs font-semibold leading-5 text-slate-600">
                        After registration, WhatsApp admin with your registered
                        email and payment proof. Admin will unlock your selected package.
                      </p>
                    </div>

                    <div className="min-w-[190px] rounded-[16px] bg-white p-4 shadow-sm">
                      <p className="text-[8px] font-black uppercase tracking-[0.14em] text-slate-400">
                        Selected
                      </p>
                      <p className="mt-1 text-sm font-black text-slate-900">
                        {selectedPackage.label}
                      </p>
                      <p className="mt-1 text-xl font-black text-indigo-600">
                        {selectedPackage.price}
                      </p>
                    </div>
                  </div>
                </section>

                {error ? (
                  <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : null}
                  {loading ? "Creating account..." : "Register & Continue"}
                  {!loading ? <ArrowRight size={17} /> : null}
                </button>
              </form>

              <p className="mt-7 text-center text-sm font-semibold text-slate-500">
                Already registered?{" "}
                <Link className="font-black text-indigo-600" href="/login">
                  Login here
                </Link>
              </p>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function RegisterFeature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/[0.05] p-4 backdrop-blur">
      <p className="text-xs font-black text-white">{title}</p>
      <p className="mt-1 text-[10px] leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
}