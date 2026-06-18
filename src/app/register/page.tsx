"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { TextInput } from "@/components/TextInput";
import {
  supabase,
  unlocksForUserType,
  type UserType,
  userTypeLabels,
} from "@/lib/supabase";

const userTypes: UserType[] = [
  "learning_hub",
  "custom_worksheet",
  "flashcard_modul",
];

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<UserType>("learning_hub");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError || !data.user) {
      setLoading(false);
      setError(signUpError?.message ?? "Could not create account.");
      return;
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
  id: data.user.id,
  email,
  full_name: fullName,
  user_type: userType,
  avatar_url: null,
  learning_hub_unlocked: false,
  custom_worksheet_unlocked: false,
  flashcard_modul_unlocked: false,
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
      <section className="soft-card w-full max-w-2xl rounded-[2rem] p-6 sm:p-8">
        <p className="text-emerald-700">Get started</p>
        <h1 className="font-display mt-2 text-5xl text-indigo-700">Register</h1>
        <p className="mt-3 text-lg text-slate-600">
          Create your parent account and choose your first learning section.
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
            <legend className="mb-3 text-sm text-emerald-700">User type</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {userTypes.map((type) => (
                <label
                  key={type}
                  className={`cursor-pointer rounded-2xl border p-4 text-center transition ${
                    userType === type
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md"
                      : "border-indigo-100 bg-white text-slate-600 hover:border-indigo-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="userType"
                    value={type}
                    checked={userType === type}
                    onChange={() => setUserType(type)}
                    className="sr-only"
                  />
                  {userTypeLabels[type]}
                </label>
              ))}
            </div>
          </fieldset>

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
            Register
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
