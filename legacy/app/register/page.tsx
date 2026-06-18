"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import BrandLogo from "@/components/common/BrandLogo";
import { accessOptions, type AccountType, getAccessOption } from "@/lib/accountAccess";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("learning_hub");
  const [loading, setLoading] = useState(false);

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const selectedAccess = getAccessOption(accountType);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          account_type: accountType,
          full_name: fullName,
          phone,
        },
      },
    });

    if (error) {
      setLoading(false);
      alert(error.message);
      return;
    }

    const userId = data.user?.id;

    if (!userId || !selectedAccess) {
      setLoading(false);
      alert("Registration could not be completed. Please try again.");
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      account_type: accountType,
      email,
      full_name: fullName,
      phone,
      user_id: userId,
    });

    if (profileError) {
      setLoading(false);
      alert(profileError.message);
      return;
    }

    const accessRecord = {
      custom_worksheet_access: false,
      flashcard_modul_access: false,
      learning_hub_access: false,
      subscription_status: "active",
      user_id: userId,
      [selectedAccess.accessKey]: true,
    };

    const { error: accessError } = await supabase.from("user_access").insert(accessRecord);

    setLoading(false);

    if (accessError) {
      alert(accessError.message);
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <main className="min-h-screen bg-[var(--fd-cream)] px-5 py-10 text-[var(--fd-blue)]">
      <section className="mx-auto w-full max-w-3xl rounded-lg border border-[var(--fd-blue)]/10 bg-white p-6 shadow-[0_24px_70px_rgba(76,87,169,0.14)] md:p-8">
        <BrandLogo
          className="mb-7 justify-center"
          imageClassName="h-20 w-40"
          label="FD Arcadia"
          subtitle="Parent Registration"
        />

        <div className="mb-7 text-center">
          <h1 className="text-3xl font-black">Create your account</h1>
          <p className="mt-2 text-sm font-semibold text-[var(--fd-blue)]/65">
            Choose the section you are registering for today.
          </p>
        </div>

        <form onSubmit={handleRegister} className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-black">
              Full name
              <input
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="mt-2 w-full rounded-lg border border-[var(--fd-blue)]/15 bg-[var(--fd-cream)] px-4 py-3 font-semibold outline-none transition focus:border-[var(--fd-blue)]"
                placeholder="Parent or guardian name"
              />
            </label>

            <label className="block text-sm font-black">
              Phone number
              <input
                required
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="mt-2 w-full rounded-lg border border-[var(--fd-blue)]/15 bg-[var(--fd-cream)] px-4 py-3 font-semibold outline-none transition focus:border-[var(--fd-blue)]"
                placeholder="012-345 6789"
              />
            </label>

            <label className="block text-sm font-black">
              Email
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-lg border border-[var(--fd-blue)]/15 bg-[var(--fd-cream)] px-4 py-3 font-semibold outline-none transition focus:border-[var(--fd-blue)]"
                placeholder="parent@email.com"
              />
            </label>

            <label className="block text-sm font-black">
              Password
              <input
                required
                minLength={6}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-lg border border-[var(--fd-blue)]/15 bg-[var(--fd-cream)] px-4 py-3 font-semibold outline-none transition focus:border-[var(--fd-blue)]"
                placeholder="At least 6 characters"
              />
            </label>
          </div>

          <fieldset>
            <legend className="mb-3 text-sm font-black">Account type</legend>
            <div className="grid gap-3 md:grid-cols-3">
              {accessOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = accountType === option.accountType;

                return (
                  <label
                    key={option.accountType}
                    className={`cursor-pointer rounded-lg border p-4 transition ${
                      isSelected
                        ? "border-[var(--fd-blue)] bg-[#eef6ff]"
                        : "border-[var(--fd-blue)]/10 bg-[var(--fd-cream)] hover:border-[var(--fd-green)]/50"
                    }`}
                  >
                    <input
                      checked={isSelected}
                      className="sr-only"
                      name="accountType"
                      type="radio"
                      value={option.accountType}
                      onChange={() => setAccountType(option.accountType)}
                    />
                    <div className="flex items-start justify-between gap-3">
                      <Icon size={24} aria-hidden="true" />
                      {isSelected ? <CheckCircle2 size={20} className="text-[var(--fd-green)]" /> : null}
                    </div>
                    <p className="mt-4 font-black">{option.label}</p>
                    <p className="mt-2 text-xs font-semibold leading-5 text-[var(--fd-blue)]/65">
                      {option.description}
                    </p>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--fd-red)] px-5 py-4 font-black text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : null}
            Create account
          </button>
        </form>

        <div className="mt-6 border-t border-[var(--fd-blue)]/10 pt-5 text-center text-sm font-semibold">
          Already registered?{" "}
          <Link href="/login" className="font-black text-[var(--fd-red)]">
            Sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
