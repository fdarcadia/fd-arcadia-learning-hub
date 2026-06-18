"use client";

import {
  CheckCircle2,
  Loader2,
  Lock,
  RefreshCw,
  ShieldCheck,
  Unlock,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import BrandLogo from "@/components/common/BrandLogo";
import {
  accessOptions,
  emptyUserAccess,
  getAccountTypeLabel,
  type AccessKey,
  type UserAccess,
} from "@/lib/accountAccess";
import { supabase } from "@/lib/supabase";

type BuyerProfile = {
  account_type: string | null;
  email: string | null;
  full_name: string | null;
  id: string;
  phone: string | null;
  user_id: string;
};

type LegacyParent = {
  email?: string | null;
  full_name?: string | null;
  id: string;
  package_type?: string | null;
  phone?: string | null;
  user_id: string;
};

type AdminBuyer = BuyerProfile & {
  access: UserAccess;
};

function normalizeLegacyPackage(packageType?: string | null) {
  if (packageType === "learninghub") return "learning_hub";
  if (packageType === "custom_worksheet") return "custom_worksheet";
  if (packageType === "flashcard_modul") return "flashcard_modul";

  return packageType || null;
}

export default function AdminPage() {
  const [buyers, setBuyers] = useState<AdminBuyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [adminError, setAdminError] = useState("");
  const [search, setSearch] = useState("");

  const filteredBuyers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return buyers;

    return buyers.filter((buyer) =>
      [buyer.full_name, buyer.email, buyer.phone, getAccountTypeLabel(buyer.account_type)]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query))
    );
  }, [buyers, search]);

  async function ensureAdminAccess() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return false;
    }

    const { data, error } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      setAdminError(
        "Admin table belum ready. Run SQL admin_users policy dalam supabase/schema.sql dulu."
      );
      return false;
    }

    if (!data) {
      setAdminError("Akaun ini belum diberi akses admin.");
      return false;
    }

    return true;
  }

  async function loadBuyers() {
    setLoading(true);
    setAdminError("");

    const isAdmin = await ensureAdminAccess();

    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const [{ data: profileData, error: profileError }, { data: accessData, error: accessError }] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("id, user_id, full_name, email, phone, account_type")
          .order("created_at", { ascending: false }),
        supabase.from("user_access").select("*"),
      ]);

    if (accessError) {
      setAdminError(
        accessError.message.includes("does not exist")
          ? "Database setup belum lengkap. Run migration SQL dalam supabase/schema.sql untuk update table user_access."
          : accessError.message || "Cannot load buyer access."
      );
      setLoading(false);
      return;
    }

    const accessByUserId = new Map<string, UserAccess>();

    (accessData || []).forEach((item) => {
      const accessItem = item as { user_id: string } & UserAccess;

      accessByUserId.set(accessItem.user_id, {
        custom_worksheet_access: Boolean(accessItem.custom_worksheet_access),
        flashcard_modul_access: Boolean(accessItem.flashcard_modul_access),
        learning_hub_access: Boolean(accessItem.learning_hub_access),
        subscription_status: accessItem.subscription_status || "inactive",
      });
    });

    let buyerProfiles = (profileData || []) as BuyerProfile[];

    if (profileError) {
      const { data: legacyParents, error: legacyError } = await supabase
        .from("parents")
        .select("id, user_id, full_name, phone, package_type");

      if (legacyError) {
        setAdminError(legacyError.message || profileError.message || "Cannot load buyers.");
        setLoading(false);
        return;
      }

      buyerProfiles = ((legacyParents || []) as LegacyParent[]).map((parent) => ({
        account_type: normalizeLegacyPackage(parent.package_type),
        email: parent.email || null,
        full_name: parent.full_name || null,
        id: parent.id,
        phone: parent.phone || null,
        user_id: parent.user_id,
      }));
    }

    setBuyers(
      buyerProfiles.map((profile) => ({
        ...profile,
        access: accessByUserId.get(profile.user_id) || emptyUserAccess(),
      }))
    );
    setLoading(false);
  }

  useEffect(() => {
    // Admin buyer access is loaded once when this portal opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadBuyers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateBuyerAccess(userId: string, nextAccess: UserAccess) {
    setSavingUserId(userId);

    const { error } = await supabase.from("user_access").upsert(
      {
        custom_worksheet_access: nextAccess.custom_worksheet_access,
        flashcard_modul_access: nextAccess.flashcard_modul_access,
        learning_hub_access: nextAccess.learning_hub_access,
        subscription_status: nextAccess.subscription_status || "inactive",
        user_id: userId,
      },
      {
        onConflict: "user_id",
      }
    );

    if (error) {
      alert(error.message);
      setSavingUserId(null);
      return;
    }

    setBuyers((currentBuyers) =>
      currentBuyers.map((buyer) =>
        buyer.user_id === userId
          ? {
              ...buyer,
              access: nextAccess,
            }
          : buyer
      )
    );
    setSavingUserId(null);
  }

  function toggleAccess(buyer: AdminBuyer, accessKey: AccessKey) {
    const nextValue = !buyer.access[accessKey];
    const nextAccess = {
      ...buyer.access,
      [accessKey]: nextValue,
      subscription_status: nextValue ? "active" : buyer.access.subscription_status || "inactive",
    };

    updateBuyerAccess(buyer.user_id, nextAccess);
  }

  function setAllAccess(buyer: AdminBuyer, isUnlocked: boolean) {
    updateBuyerAccess(buyer.user_id, {
      custom_worksheet_access: isUnlocked,
      flashcard_modul_access: isUnlocked,
      learning_hub_access: isUnlocked,
      subscription_status: isUnlocked ? "active" : "inactive",
    });
  }

  function setSubscriptionStatus(buyer: AdminBuyer, subscriptionStatus: string) {
    updateBuyerAccess(buyer.user_id, {
      ...buyer.access,
      subscription_status: subscriptionStatus,
    });
  }

  const activeBuyerCount = buyers.filter((buyer) => buyer.access.subscription_status === "active").length;

  return (
    <main className="premium-page-bg min-h-screen px-4 py-5 text-[var(--fd-blue)] md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 rounded-lg border border-white/80 bg-white/88 p-4 shadow-[0_18px_48px_rgba(56,66,130,0.1)] md:flex-row md:items-center md:justify-between">
          <BrandLogo imageClassName="h-12 w-24" subtitle="Admin Portal" />

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="premium-button-shadow inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm font-black text-[var(--fd-blue)] transition hover:-translate-y-0.5"
            >
              Dashboard
            </Link>
            <button
              type="button"
              onClick={loadBuyers}
              className="premium-button-shadow inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--fd-blue)] px-4 py-3 text-sm font-black text-white transition hover:-translate-y-0.5"
            >
              <RefreshCw size={17} aria-hidden="true" />
              Refresh
            </button>
          </div>
        </header>

        <section className="mb-6 rounded-lg bg-[var(--fd-blue)] p-6 text-white shadow-[0_24px_70px_rgba(56,66,130,0.22)] md:p-8">
          <p className="font-kindergarten text-lg text-[var(--fd-yellow)]">Buyer access control</p>
          <h1 className="font-blank-space mt-3 text-4xl tracking-normal md:text-6xl">
            Parent Purchase Portal
          </h1>
          <p className="font-kindergarten mt-4 max-w-2xl text-xl leading-8 text-white/82">
            Unlock or lock Learning Hub, Custom Worksheet, and Flashcard & Modul for each buyer.
          </p>
        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          {[
            { label: "Total parents", value: buyers.length, icon: UserRound },
            { label: "Active buyers", value: activeBuyerCount, icon: CheckCircle2 },
            { label: "Locked/inactive", value: Math.max(buyers.length - activeBuyerCount, 0), icon: Lock },
          ].map((stat) => (
            <article
              key={stat.label}
              className="premium-card-shadow rounded-lg border border-white/85 bg-white/90 p-5"
            >
              <stat.icon size={24} className="text-[var(--fd-green)]" aria-hidden="true" />
              <p className="font-kindergarten mt-4 text-lg text-[var(--fd-blue)]/70">{stat.label}</p>
              <p className="font-blank-space mt-1 text-4xl">{stat.value}</p>
            </article>
          ))}
        </section>

        <section className="premium-card-shadow rounded-lg border border-white/85 bg-white/92 p-5 md:p-6">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-kindergarten text-lg text-[var(--fd-green)]">Buyer list</p>
              <h2 className="font-blank-space mt-1 text-4xl">Lock and unlock products</h2>
            </div>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-[var(--fd-blue)]/15 bg-[var(--fd-cream)] px-4 py-3 font-semibold outline-none transition focus:border-[var(--fd-blue)] md:max-w-sm"
              placeholder="Search parent name, email, phone..."
            />
          </div>

          {adminError && (
            <div className="mb-5 rounded-lg border border-[var(--fd-red)]/25 bg-[#fff0f4] p-4 text-sm font-bold text-[var(--fd-red)]">
              {adminError}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-3 rounded-lg bg-[var(--fd-cream)] p-8 font-black">
              <Loader2 className="animate-spin" size={22} aria-hidden="true" />
              Loading buyers
            </div>
          ) : filteredBuyers.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[var(--fd-blue)]/20 bg-[var(--fd-cream)] p-8 text-center">
              <p className="font-kindergarten text-2xl">No buyer found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBuyers.map((buyer) => {
                const isSaving = savingUserId === buyer.user_id;
                const unlockedCount = accessOptions.filter((option) => buyer.access[option.accessKey]).length;

                return (
                  <article
                    key={buyer.user_id}
                    className="rounded-lg border border-[var(--fd-blue)]/10 bg-[var(--fd-cream)] p-4 md:p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-kindergarten text-3xl text-[var(--fd-blue)]">
                            {buyer.full_name || "Unnamed Parent"}
                          </h3>
                          <span
                            className={`rounded-lg px-3 py-1 text-xs font-black uppercase ${
                              buyer.access.subscription_status === "active"
                                ? "bg-[#edf9f3] text-[var(--fd-green)]"
                                : "bg-[#fff0f4] text-[var(--fd-red)]"
                            }`}
                          >
                            {buyer.access.subscription_status || "inactive"}
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-bold text-[var(--fd-blue)]/70">
                          {buyer.email || "No email"} {buyer.phone ? `- ${buyer.phone}` : ""}
                        </p>
                        <p className="mt-1 text-sm font-bold text-[var(--fd-blue)]/55">
                          Registered package: {getAccountTypeLabel(buyer.account_type)} - {unlockedCount}/3 unlocked
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => setAllAccess(buyer, true)}
                          className="inline-flex items-center gap-2 rounded-lg bg-[var(--fd-green)] px-4 py-2 text-sm font-black text-white shadow-[0_12px_28px_rgba(111,174,145,0.24)] transition hover:-translate-y-0.5 disabled:opacity-60"
                        >
                          <Unlock size={16} aria-hidden="true" />
                          Unlock all
                        </button>
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => setAllAccess(buyer, false)}
                          className="inline-flex items-center gap-2 rounded-lg bg-[var(--fd-red)] px-4 py-2 text-sm font-black text-white shadow-[0_12px_28px_rgba(191,63,85,0.24)] transition hover:-translate-y-0.5 disabled:opacity-60"
                        >
                          <Lock size={16} aria-hidden="true" />
                          Lock all
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                      {accessOptions.map((option) => {
                        const Icon = option.icon;
                        const isUnlocked = Boolean(buyer.access[option.accessKey]);

                        return (
                          <button
                            key={option.accessKey}
                            type="button"
                            disabled={isSaving}
                            onClick={() => toggleAccess(buyer, option.accessKey)}
                            className={`rounded-lg border p-4 text-left transition hover:-translate-y-0.5 disabled:opacity-60 ${
                              isUnlocked
                                ? "border-[var(--fd-green)]/35 bg-white"
                                : "border-[var(--fd-blue)]/10 bg-white/55"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <Icon
                                size={22}
                                className={isUnlocked ? "text-[var(--fd-green)]" : "text-slate-400"}
                                aria-hidden="true"
                              />
                              <span
                                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-black ${
                                  isUnlocked
                                    ? "bg-[#edf9f3] text-[var(--fd-green)]"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {isUnlocked ? <Unlock size={13} aria-hidden="true" /> : <Lock size={13} aria-hidden="true" />}
                                {isUnlocked ? "Unlocked" : "Locked"}
                              </span>
                            </div>
                            <p className="font-kindergarten mt-4 text-2xl text-[var(--fd-blue)]">{option.label}</p>
                            <p className="mt-1 text-xs font-bold text-[var(--fd-blue)]/60">
                              Click to {isUnlocked ? "lock" : "unlock"} this purchase.
                            </p>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-black text-[var(--fd-blue)]/65">Subscription:</span>
                      {["active", "inactive", "cancelled"].map((status) => (
                        <button
                          key={status}
                          type="button"
                          disabled={isSaving}
                          onClick={() => setSubscriptionStatus(buyer, status)}
                          className={`rounded-lg px-3 py-2 text-xs font-black uppercase transition hover:-translate-y-0.5 disabled:opacity-60 ${
                            buyer.access.subscription_status === status
                              ? "bg-[var(--fd-blue)] text-white"
                              : "bg-white text-[var(--fd-blue)]"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                      {isSaving && (
                        <span className="inline-flex items-center gap-2 text-xs font-black text-[var(--fd-blue)]/60">
                          <Loader2 className="animate-spin" size={14} aria-hidden="true" />
                          Saving
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-lg border border-[var(--fd-blue)]/10 bg-white/75 p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 shrink-0 text-[var(--fd-green)]" size={22} aria-hidden="true" />
            <div>
              <p className="font-black">First-time setup</p>
              <p className="mt-1 text-sm font-semibold leading-6 text-[var(--fd-blue)]/65">
                To use this portal, add your own login user into the Supabase `admin_users` table.
                The SQL is included in `supabase/schema.sql`.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
