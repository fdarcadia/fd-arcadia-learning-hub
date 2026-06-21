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
    <main className="page-shell grid min-h-screen place-items-center py-10">
      <section className="soft-card w-full max-w-4xl rounded-[2rem] p-6 sm:p-8">
        <p className="text-emerald-700">Get started</p>

        <h1 className="font-display mt-2 text-5xl text-indigo-700">
          Register
        </h1>

        <p className="mt-3 text-lg text-slate-600">
          Create your parent account and choose your preferred FD Arcadia
          package. Access will be unlocked after manual payment confirmation.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <TextInput
            label="Full name"
            value={fullName}
            required
            placeholder="Parent name"
            onChange={setFullName}
          />

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

          <fieldset>
            <legend className="mb-3 text-sm font-bold text-emerald-700">
              Choose package category
            </legend>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(Object.keys(packageGroups) as MainPackage[]).map((type) => (
                <label
                  key={type}
                  className={`cursor-pointer rounded-2xl border p-4 transition ${
                    mainPackage === type
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md"
                      : "border-indigo-100 bg-white text-slate-600 hover:border-indigo-300"
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

                  <span className="block text-lg font-bold">
                    {packageGroups[type].title}
                  </span>

                  <span className="mt-2 block text-sm leading-6">
                    {packageGroups[type].description}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-sm font-bold text-emerald-700">
              Choose package option
            </legend>

            <div className="grid gap-3 sm:grid-cols-2">
              {selectedGroup.options.map((option) => (
                <label
                  key={option.value}
                  className={`cursor-pointer rounded-2xl border p-4 transition ${
                    packageType === option.value
                      ? "border-yellow-400 bg-yellow-50 text-indigo-700 shadow-md"
                      : "border-indigo-100 bg-white text-slate-600 hover:border-indigo-300"
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

                  <span className="block text-xl font-bold">
                    {option.label}
                  </span>

                  <span className="mt-2 block text-3xl font-bold text-indigo-700">
                    {option.price}
                  </span>

                  <span className="mt-2 block leading-7">
                    {option.description}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <section className="rounded-[2rem] border border-yellow-200 bg-yellow-50 p-5">
            <h2 className="text-xl font-bold text-indigo-700">
              Manual Payment Notice
            </h2>

            <p className="mt-2 text-slate-700">
              After registration, please WhatsApp admin with your registered
              email and payment proof. Admin will unlock your selected package
              after confirmation.
            </p>

            <div className="mt-4 rounded-2xl bg-white p-4">
              <p className="text-sm font-bold text-yellow-600">
                SELECTED PACKAGE
              </p>

              <p className="mt-1 text-xl font-bold text-indigo-700">
                {selectedPackage.label} — {selectedPackage.price}
              </p>

              <p className="mt-1 text-slate-600">
                {selectedPackage.description}
              </p>
            </div>
          </section>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="button-shadow flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 text-xl font-bold text-white transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={22} /> : null}
            Register & Continue
            {!loading ? <ArrowRight size={22} /> : null}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-600">
          Already registered?{" "}
          <Link className="font-bold text-indigo-700" href="/login">
            Login here
          </Link>
        </p>
      </section>
    </main>
  );
}