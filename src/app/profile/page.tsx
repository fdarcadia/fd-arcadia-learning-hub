"use client";

import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Baby,
  BarChart3,
  BookOpen,
  BookOpenCheck,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronRight,
  Crown,
  FileText,
  Gift,
  Home,
  ImagePlus,
  Loader2,
  LockKeyhole,
  Mail,
  Palette,
  Save,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Upload,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { ProtectedPage } from "@/components/ProtectedPage";
import { TextInput } from "@/components/TextInput";
import { type Profile, supabase, userTypeLabels } from "@/lib/supabase";

type DashboardProfile = Profile & {
  learning_hub_unlocked?: boolean | null;
  custom_worksheet_unlocked?: boolean | null;
  flashcard_modul_unlocked?: boolean | null;
  flashcard_unlocked?: boolean | null;
  math_activity_unlocked?: boolean | null;
  draw_learn_unlocked?: boolean | null;
  sifir_deck_unlocked?: boolean | null;
  freebies_unlocked?: boolean | null;
  huruf_membaca_unlocked?: boolean | null;
  package_type?: string | null;
  subscription_start?: string | null;
  subscription_end?: string | null;
  avatar_url?: string | null;
};

type ChildProfile = {
  id: string;
  child_name?: string | null;
  name?: string | null;
  full_name?: string | null;
  age?: string | number | null;
  avatar?: string | null;
  avatar_url?: string | null;
  level?: string | null;
  grade?: string | null;
};

const ADMIN_EMAIL = "fdarcadia.hello@gmail.com";
const avatarBucket = "avatars";

const packageLabels: Record<string, string> = {
  math_package: "Math Package RM25",
  learning_hub_weekly: "Learning Hub Weekly RM30",
  learning_hub_monthly: "Learning Hub Monthly RM50",
  learning_hub_6month: "Learning Hub Premium RM210",
  full_package: "Full Package RM250",
  worksheet_trial: "Worksheet Trial RM5",
  worksheet_basic: "Worksheet Basic RM15",
  worksheet_standard: "Worksheet Standard RM25",
  worksheet_premium: "Worksheet Premium RM39",
};

const defaultParentAvatars = [
  "/avatarsparent/13.svg",
  "/avatarsparent/14.svg",
  "/avatarsparent/15.svg",
  "/avatarsparent/16.svg",
  "/avatarsparent/17.svg",
  "/avatarsparent/18.svg",
  "/avatarsparent/19.svg",
  "/avatarsparent/20.svg",
];

const fallbackParentAvatar = "/avatarsparent/13.svg";

export default function ProfilePage() {
  return (
    <ProtectedPage>
      {(user) => <ProfileContent userId={user.id} email={user.email ?? ""} />}
    </ProtectedPage>
  );
}

function ProfileContent({ userId, email }: { userId: string; email: string }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [profile, setProfile] = useState<DashboardProfile | null>(null);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarMode, setAvatarMode] = useState<"default" | "upload" | "url">("url");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      setLoadingProfile(true);
      setError("");

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) {
        setError(profileError.message);
        setLoadingProfile(false);
        return;
      }

      if (!data) {
        setError("Profile not found. Please create profile row in Supabase first.");
        setLoadingProfile(false);
        return;
      }

      const nextProfile = data as DashboardProfile;
      setProfile(nextProfile);
      setFullName(nextProfile.full_name ?? "");
      setAvatarUrl(nextProfile.avatar_url || fallbackParentAvatar);
      setAvatarMode(
        nextProfile.avatar_url && defaultParentAvatars.includes(nextProfile.avatar_url)
          ? "default"
          : nextProfile.avatar_url
            ? "upload"
            : "url"
      );

      const { data: childrenData } = await supabase
        .from("children")
        .select("*")
        .eq("parent_id", userId)
        .limit(8);

      setChildren((childrenData || []) as ChildProfile[]);
      setLoadingProfile(false);
    }

    loadProfile();
  }, [userId]);

  const packageName = profile?.package_type
    ? packageLabels[profile.package_type] || profile.package_type
    : "No Active Package";

  const hasLearningHub = Boolean(profile?.learning_hub_unlocked);
  const hasCustomWorksheet = Boolean(profile?.custom_worksheet_unlocked);
  const hasFlashcard = Boolean(profile?.flashcard_unlocked);
  const hasDigitalModule = Boolean(profile?.flashcard_modul_unlocked);
  const hasHurufMembaca = Boolean(profile?.huruf_membaca_unlocked);
  const hasMath = Boolean(profile?.math_activity_unlocked);
  const hasDrawLearn = Boolean(profile?.draw_learn_unlocked);
  const hasSifir = Boolean(profile?.sifir_deck_unlocked);
  const hasFreebies = Boolean(profile?.freebies_unlocked);

  const accessCount = [
    hasLearningHub,
    hasCustomWorksheet,
    hasFlashcard,
    hasDigitalModule,
    hasHurufMembaca,
    hasMath,
    hasDrawLearn,
    hasSifir,
    hasFreebies,
  ].filter(Boolean).length;

  const completion = Math.round((accessCount / 9) * 100);

  const accountType = profile?.user_type
    ? userTypeLabels[profile.user_type] || profile.user_type
    : "Parent";

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        avatar_url: avatarUrl.trim() || fallbackParentAvatar,
      })
      .eq("id", userId);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setProfile((current) =>
      current
        ? {
            ...current,
            full_name: fullName.trim(),
            avatar_url: avatarUrl.trim() || fallbackParentAvatar,
          }
        : current
    );

    setMessage("Profile updated successfully.");
  }

  async function handleAvatarUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setMessage("");

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload PNG, JPG, WEBP or SVG file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Profile picture must be less than 2MB.");
      return;
    }

    setUploading(true);

    const fileExt = file.name.split(".").pop() || "png";
    const filePath = `${userId}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(avatarBucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      setUploading(false);
      setError(
        `${uploadError.message}. Make sure Supabase Storage bucket '${avatarBucket}' exists and is public.`
      );
      return;
    }

    const { data } = supabase.storage.from(avatarBucket).getPublicUrl(filePath);
    const nextAvatar = data.publicUrl;

    setAvatarUrl(nextAvatar);
    setAvatarMode("upload");

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: nextAvatar })
      .eq("id", userId);

    setUploading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setProfile((current) =>
      current ? { ...current, avatar_url: nextAvatar } : current
    );

    setMessage("Profile picture uploaded successfully.");
  }

  if (loadingProfile) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f8fc] px-4">
        <div className="rounded-[22px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-indigo-600" size={42} />
          <p className="mt-4 font-black text-slate-600">Loading profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <div className="grid min-h-screen xl:grid-cols-[250px_minmax(0,1fr)]">
        <ProfileSidebar
          fullName={fullName}
          avatarUrl={avatarUrl}
          packageName={packageName}
          hasLearningHub={hasLearningHub}
          hasCustomWorksheet={hasCustomWorksheet}
          hasFlashcard={hasFlashcard}
          hasDigitalModule={hasDigitalModule}
          hasHurufMembaca={hasHurufMembaca}
          hasMath={hasMath}
          hasDrawLearn={hasDrawLearn}
          hasSifir={hasSifir}
          hasFreebies={hasFreebies}
        />

        <section className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-xs font-black text-indigo-600 transition hover:text-indigo-700"
              >
                <ArrowLeft size={15} />
                Back to Dashboard
              </Link>

              <p className="mt-3 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500">
                Parent Profile
              </p>

              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                My Profile
              </h1>

              <p className="mt-1 max-w-3xl text-sm font-semibold text-slate-400">
                Manage your account, profile photo, package status and portal access.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {email === ADMIN_EMAIL ? (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-slate-800"
                >
                  <ShieldCheck size={15} />
                  Admin
                </Link>
              ) : null}

              <Link
                href="/children"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <Users size={15} />
                My Children
              </Link>
            </div>
          </header>

          {/* PREMIUM PROFILE HERO */}
          <section className="relative mt-5 overflow-hidden rounded-[26px] bg-gradient-to-br from-[#10162f] via-[#25265f] to-[#3f47a8] px-5 py-6 text-white shadow-[0_20px_55px_rgba(15,23,42,0.18)] sm:px-6">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />

            <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="flex items-center gap-4">
                <ProfileAvatar src={avatarUrl} name={fullName || "Parent"} size="lg" />

                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-300">
                    Parent Account
                  </p>

                  <h2 className="mt-1 truncate text-3xl font-black sm:text-4xl">
                    {fullName || "Parent"}
                  </h2>

                  <p className="mt-1 break-all text-sm font-semibold text-slate-300">
                    {email}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-black">
                      {accountType}
                    </span>

                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-black text-yellow-200">
                      {packageName}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 divide-x divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.06] sm:grid-cols-4 sm:divide-y-0 lg:min-w-[360px]">
                <ProfileHeroStat label="Access" value={`${completion}%`} />
                <ProfileHeroStat label="Children" value={String(children.length)} />
                <ProfileHeroStat
                  label="Package"
                  value={profile?.package_type ? "Active" : "None"}
                />
                <ProfileHeroStat label="Modules" value={String(accessCount)} />
              </div>
            </div>
          </section>

          <section className="mt-5 grid gap-5 2xl:grid-cols-[1.08fr_0.92fr]">
            {/* PROFILE EDIT */}
            <form
              onSubmit={handleSave}
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-indigo-500">
                    Profile Details
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-slate-950">
                    Parent Information
                  </h2>
                  <p className="mt-1 text-xs font-semibold text-slate-400">
                    Update your display name and profile photo.
                  </p>
                </div>

                <UserRound size={22} className="text-indigo-500" />
              </div>

              <section className="mt-5 rounded-[20px] border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
                <div className="grid gap-5 xl:grid-cols-[1fr_auto_1fr]">
                  <div>
                    <p className="text-sm font-black text-slate-700">
                      Choose default avatar
                    </p>

                    <div className="mt-4 grid grid-cols-4 gap-2.5">
                      {defaultParentAvatars.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            setAvatarUrl(item);
                            setAvatarMode("default");
                          }}
                          className={`relative overflow-hidden rounded-xl border bg-white p-2 transition ${
                            avatarUrl === item
                              ? "border-violet-500 ring-2 ring-violet-100"
                              : "border-slate-200 hover:border-indigo-300"
                          }`}
                        >
                          <div className="grid h-16 place-items-center rounded-lg bg-slate-50">
                            <img
                              src={item}
                              alt=""
                              className="h-14 w-14 rounded-lg object-contain"
                            />
                          </div>

                          {avatarUrl === item ? (
                            <span className="absolute bottom-2 left-2 grid h-6 w-6 place-items-center rounded-full bg-indigo-600 text-white shadow-sm">
                              <CheckCircle2 size={14} />
                            </span>
                          ) : null}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="hidden items-center xl:flex">
                    <div className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-[10px] font-black text-slate-400">
                      OR
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-black text-slate-700">
                      Upload your own photo
                    </p>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-4 flex min-h-[150px] w-full flex-col items-center justify-center rounded-[18px] border-2 border-dashed border-slate-200 bg-white px-4 py-5 text-center transition hover:border-violet-300 hover:bg-violet-50/40"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="animate-spin text-indigo-600" size={32} />
                          <p className="mt-3 text-sm font-black text-indigo-700">
                            Uploading photo...
                          </p>
                        </>
                      ) : (
                        <>
                          <ImagePlus className="text-indigo-500" size={34} />
                          <p className="mt-3 text-sm font-black text-slate-800">
                            Click to upload photo
                          </p>
                          <p className="mt-1 text-[10px] font-semibold text-slate-400">
                            PNG, JPG, WEBP or SVG • Max 2MB
                          </p>
                        </>
                      )}
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />

                    {avatarUrl ? (
                      <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                        <ProfileAvatar
                          src={avatarUrl}
                          name={fullName || "Parent"}
                          size="sm"
                        />

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-slate-800">
                            {avatarMode === "upload"
                              ? "Uploaded photo selected"
                              : avatarMode === "default"
                                ? "Default avatar selected"
                                : "Image URL selected"}
                          </p>
                          <p className="mt-1 truncate text-[9px] text-slate-400">
                            {avatarUrl}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setAvatarUrl(fallbackParentAvatar);
                            setAvatarMode("default");
                          }}
                          className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-5">
                  <label className="block">
                    <span className="text-xs font-black text-slate-600">
                      Profile Image URL (optional)
                    </span>

                    <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-50">
                      <Camera className="text-indigo-500" size={18} />
                      <input
                        value={avatarMode === "url" ? avatarUrl : ""}
                        onChange={(event) => {
                          setAvatarUrl(event.target.value);
                          setAvatarMode("url");
                        }}
                        placeholder="Paste image URL"
                        className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </label>
                </div>
              </section>

              <div className="mt-5 space-y-4">
                <TextInput
                  label="Full name"
                  value={fullName}
                  required
                  onChange={setFullName}
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoBox label="Email" value={email} icon={<Mail size={18} />} />
                  <InfoBox
                    label="User Type"
                    value={accountType}
                    icon={<UserRound size={18} />}
                  />
                </div>

                {error ? (
                  <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
                    {error}
                  </div>
                ) : null}

                {message ? (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">
                    {message}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  {saving ? "Saving profile..." : "Save Profile"}
                </button>
              </div>
            </form>

            {/* STATUS COLUMN - no redundant live preview */}
            <section className="space-y-5">
              <PackageStatusCard
                packageName={packageName}
                startDate={profile?.subscription_start || "-"}
                endDate={profile?.subscription_end || "-"}
              />

              <AccessSummaryCard
                hasLearningHub={hasLearningHub}
                hasCustomWorksheet={hasCustomWorksheet}
                hasFlashcard={hasFlashcard}
                hasDigitalModule={hasDigitalModule}
                hasHurufMembaca={hasHurufMembaca}
                hasMath={hasMath}
                hasDrawLearn={hasDrawLearn}
                hasSifir={hasSifir}
                hasFreebies={hasFreebies}
              />
            </section>
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.9fr]">
            <ChildrenSummaryCard children={children} />
            <AccountSettingsCard />
          </section>
          <footer className="mt-6 border-t border-slate-200 py-5 text-center text-[10px] font-semibold text-slate-400">
            FD Arcadia Parent Portal • Profile & Account Settings
          </footer>

        </section>
      </div>
    </main>
  );
}

function ProfileSidebar({
  fullName,
  avatarUrl,
  packageName,
  hasLearningHub,
  hasCustomWorksheet,
  hasFlashcard,
  hasDigitalModule,
  hasHurufMembaca,
  hasMath,
  hasDrawLearn,
  hasSifir,
  hasFreebies,
}: {
  fullName: string;
  avatarUrl: string;
  packageName: string;
  hasLearningHub: boolean;
  hasCustomWorksheet: boolean;
  hasFlashcard: boolean;
  hasDigitalModule: boolean;
  hasHurufMembaca: boolean;
  hasMath: boolean;
  hasDrawLearn: boolean;
  hasSifir: boolean;
  hasFreebies: boolean;
}) {
  return (
    <aside className="hidden border-r border-indigo-950/10 bg-[#111735] px-4 py-6 text-white xl:flex xl:flex-col">
      <Link href="/dashboard" className="flex items-center gap-3 px-2">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-indigo-950/30">
          <Sparkles size={21} />
        </div>

        <div>
          <p className="text-sm font-black tracking-[0.08em] text-white">
            FD ARCADIA
          </p>
          <p className="text-[9px] font-black tracking-[0.2em] text-violet-300">
            PARENT PROFILE
          </p>
        </div>
      </Link>

      <div className="mt-8 rounded-[20px] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-4 text-center shadow-inner">
        <div className="flex justify-center">
          <ProfileAvatar src={avatarUrl} name={fullName || "Parent"} size="lg" />
        </div>

        <h2 className="mt-3 truncate text-lg font-black text-white">
          {fullName || "Parent"}
        </h2>

        <p className="mt-1 line-clamp-2 text-[10px] font-semibold leading-5 text-slate-400">
          {packageName}
        </p>
      </div>

      <nav className="mt-6 space-y-1.5">
        <SidebarLink href="/dashboard" icon={<Home size={18} />}>
          Dashboard
        </SidebarLink>

        <SidebarLink href="/profile" icon={<UserRound size={18} />} active>
          My Profile
        </SidebarLink>

        <SidebarLink href="/children" icon={<Users size={18} />}>
          My Children
        </SidebarLink>

        {hasLearningHub ? (
          <SidebarLink href="/learning-hub" icon={<BookOpenCheck size={18} />}>
            Learning Hub
          </SidebarLink>
        ) : null}

        {hasCustomWorksheet ? (
          <SidebarLink href="/custom-worksheet" icon={<FileText size={18} />}>
            Worksheet
          </SidebarLink>
        ) : null}

        {hasFlashcard ? (
          <SidebarLink href="/flashcard-library" icon={<BookOpen size={18} />}>
            Flashcard Library
          </SidebarLink>
        ) : null}

        {hasDigitalModule ? (
          <SidebarLink href="/flashcard-modules" icon={<BookOpenCheck size={18} />}>
            Modul Digital
          </SidebarLink>
        ) : null}

        {hasHurufMembaca ? (
          <SidebarLink href="/huruf-membaca" icon={<BookOpen size={18} />}>
            Huruf & Membaca
          </SidebarLink>
        ) : null}

        {hasMath ? (
          <SidebarLink href="/math-activity" icon={<BarChart3 size={18} />}>
            Math Activity
          </SidebarLink>
        ) : null}

        {hasDrawLearn ? (
          <SidebarLink href="/worksheet" icon={<Palette size={18} />}>
            Draw & Learn
          </SidebarLink>
        ) : null}

        {hasSifir ? (
          <SidebarLink href="/sifir-deck" icon={<Star size={18} />}>
            Sifir Deck
          </SidebarLink>
        ) : null}

        {hasFreebies ? (
          <SidebarLink href="/freebies" icon={<Gift size={18} />}>
            Freebies
          </SidebarLink>
        ) : null}
      </nav>
    </aside>
  );
}

function SidebarLink({
  href,
  icon,
  active,
  children,
}: {
  href: string;
  icon: ReactNode;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-black transition ${
        active
          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-950/20"
          : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}


function ProfileHeroStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="px-3 py-4 text-center">
      <p className="text-xl font-black text-white sm:text-2xl">{value}</p>
      <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function PackageStatusCard({
  packageName,
  startDate,
  endDate,
}: {
  packageName: string;
  startDate: string;
  endDate: string;
}) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
            SUBSCRIPTION
          </p>
          <h2 className="mt-1 text-3xl font-black text-indigo-700">
            Package Status
          </h2>
        </div>
        <Crown className="text-amber-500" size={20} />
      </div>

      <div className="mt-5 rounded-[18px] bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
        <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">
          CURRENT PACKAGE
        </p>
        <p className="mt-2 text-lg font-black text-slate-900">{packageName}</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <MiniInfo label="Start Date" value={startDate} />
        <MiniInfo label="End Date" value={endDate} />
      </div>

      <Link
        href="/pricing"
        className="mt-5 flex items-center justify-between rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-xs font-black text-white shadow-sm transition hover:opacity-95"
      >
        View Package
        <ChevronRight size={18} />
      </Link>
    </section>
  );
}

function AccessSummaryCard({
  hasLearningHub,
  hasCustomWorksheet,
  hasFlashcard,
  hasDigitalModule,
  hasHurufMembaca,
  hasMath,
  hasDrawLearn,
  hasSifir,
  hasFreebies,
}: {
  hasLearningHub: boolean;
  hasCustomWorksheet: boolean;
  hasFlashcard: boolean;
  hasDigitalModule: boolean;
  hasHurufMembaca: boolean;
  hasMath: boolean;
  hasDrawLearn: boolean;
  hasSifir: boolean;
  hasFreebies: boolean;
}) {
  const accessRows = [
    { label: "Learning Hub", unlocked: hasLearningHub, icon: BookOpenCheck },
    { label: "Custom Worksheet", unlocked: hasCustomWorksheet, icon: FileText },
    { label: "Flashcard Library", unlocked: hasFlashcard, icon: BookOpen },
    { label: "Modul Membaca", unlocked: hasDigitalModule, icon: BookOpenCheck },
    { label: "Huruf & Membaca", unlocked: hasHurufMembaca, icon: BookOpen },
    { label: "Math Activity", unlocked: hasMath, icon: BarChart3 },
    { label: "Draw & Learn", unlocked: hasDrawLearn, icon: Palette },
    { label: "Sifir Deck", unlocked: hasSifir, icon: Star },
    { label: "Freebies", unlocked: hasFreebies, icon: Gift },
  ];

  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
          ACCESS
        </p>
        <h2 className="mt-1 text-3xl font-black text-indigo-700">
          Account Access
        </h2>
      </div>

      <div className="grid gap-3">
        {accessRows.map((row) => {
          const Icon = row.icon;

          return (
            <div
              key={row.label}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-xs font-black text-slate-700"
            >
              <span className="flex items-center gap-3">
                <Icon className="text-indigo-500" size={17} />
                {row.label}
              </span>

              {row.unlocked ? (
                <CheckCircle2 className="text-emerald-500" size={18} />
              ) : (
                <LockKeyhole className="text-slate-300" size={18} />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ChildrenSummaryCard({ children }: { children: ChildProfile[] }) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
            CHILDREN
          </p>
          <h2 className="mt-1 text-3xl font-black text-indigo-700">
            Child Profiles
          </h2>
        </div>
        <Baby className="text-indigo-500" size={20} />
      </div>

      {children.length === 0 ? (
        <div className="rounded-[18px] border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <Baby className="mx-auto text-slate-300" size={34} />
          <p className="mt-3 text-sm font-black text-slate-800">
            No child profile yet
          </p>
          <p className="mt-1 text-[10px] font-semibold text-slate-400">
            Add your child to start using learning features.
          </p>
          <Link
            href="/children"
            className="mt-4 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white"
          >
            Add Child
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {children.map((child) => {
            const name = child.child_name || child.name || child.full_name || "Child";
            const avatar = child.avatar_url || child.avatar || "";

            return (
              <Link
                key={child.id}
                href="/children"
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 transition hover:border-indigo-200 hover:bg-indigo-50/60"
              >
                <div className="flex items-center gap-3">
                  <ProfileAvatar src={avatar} name={name} size="sm" />
                  <div>
                    <p className="text-sm font-black text-slate-900">{name}</p>
                    <p className="text-[10px] font-semibold text-slate-400">
                      Age {child.age || "-"} • {child.level || child.grade || "Level"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="text-indigo-400" size={16} />
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

function AccountSettingsCard() {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
          SETTINGS
        </p>
        <h2 className="mt-1 text-3xl font-black text-indigo-700">
          Account Settings
        </h2>
      </div>

      <div className="grid gap-3">
        <SettingsLink
          href="/children"
          icon={<Users size={24} />}
          title="Manage Children"
          description="Add, edit or remove child profiles."
        />
        <SettingsLink
          href="/pricing"
          icon={<Crown size={24} />}
          title="View Packages"
          description="Check current plan and upgrade options."
        />
        <SettingsLink
          href="/forgot-password"
          icon={<ShieldCheck size={24} />}
          title="Reset Password"
          description="Change your login password securely."
        />
      </div>
    </section>
  );
}

function SettingsLink({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 transition hover:border-indigo-200 hover:bg-indigo-50/60"
    >
      <div className="flex items-center gap-4">
        <div className="grid h-10 w-10 place-items-center rounded-xl border border-slate-100 bg-white text-indigo-500 shadow-sm">
          {icon}
        </div>
        <div>
          <p className="text-sm font-black text-slate-900">{title}</p>
          <p className="text-[10px] text-slate-400">{description}</p>
        </div>
      </div>
      <ChevronRight className="text-indigo-400" size={16} />
    </Link>
  );
}

function ProfileAvatar({
  src,
  name,
  size,
}: {
  src: string;
  name: string;
  size: "sm" | "lg" | "xl";
}) {
  const dimension =
    size === "sm" ? "h-14 w-14" : size === "lg" ? "h-28 w-28" : "mx-auto h-36 w-36";

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full border border-slate-200 bg-indigo-50 ${dimension}`}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div className="grid h-full w-full place-items-center text-indigo-600">
          <UserRound size={size === "sm" ? 28 : 60} />
        </div>
      )}

      {size !== "sm" ? (
        <div className="absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-indigo-600 text-white shadow">
          <UserRound size={20} />
        </div>
      ) : null}
    </div>
  );
}

function InfoBox({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-indigo-600">{icon}</div>
      <p className="mt-3 text-[8px] font-black uppercase tracking-[0.14em] text-slate-400">
        {label.toUpperCase()}
      </p>
      <p className="mt-1 break-words text-sm font-black text-slate-800">
        {value}
      </p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-indigo-100 bg-white p-5 shadow-sm">
      <p className="text-sm font-black tracking-[0.18em] text-yellow-600">
        {label.toUpperCase()}
      </p>
      <p className="mt-2 text-3xl font-black text-indigo-700">{value}</p>
    </div>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-3">
      <p className="text-[8px] font-black uppercase tracking-[0.14em] text-slate-400">
        {label.toUpperCase()}
      </p>
      <p className="mt-1 text-xs font-black text-slate-800">{value}</p>
    </div>
  );
}