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
  const hasFlashcard = Boolean(profile?.flashcard_modul_unlocked || profile?.flashcard_unlocked);
  const hasMath = Boolean(profile?.math_activity_unlocked);
  const hasDrawLearn = Boolean(profile?.draw_learn_unlocked);
  const hasSifir = Boolean(profile?.sifir_deck_unlocked);
  const hasFreebies = profile?.freebies_unlocked !== false;

  const accessCount = [
    hasLearningHub,
    hasCustomWorksheet,
    hasFlashcard,
    hasMath,
    hasDrawLearn,
    hasSifir,
    hasFreebies,
  ].filter(Boolean).length;

  const completion = Math.round((accessCount / 7) * 100);

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
      <main className="grid min-h-screen place-items-center bg-[#fbfaf7] px-4">
        <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-indigo-600" size={42} />
          <p className="mt-4 font-black text-slate-600">Loading profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-slate-900">
      <div className="grid min-h-screen xl:grid-cols-[280px_1fr]">
        <ProfileSidebar
          fullName={fullName}
          avatarUrl={avatarUrl}
          packageName={packageName}
        />

        <section className="px-4 py-6 lg:px-8">
          <header className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <Link
                href="/dashboard"
                className="mb-4 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-indigo-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <ArrowLeft size={20} />
                Back Dashboard
              </Link>

              <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
                PARENT PROFILE
              </p>

              <h1 className="mt-1 text-4xl font-black text-indigo-700 sm:text-5xl">
                My Profile
              </h1>

              <p className="mt-2 max-w-3xl text-slate-600">
                Manage your parent account, profile photo, package status and FD
                Arcadia access.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {email === ADMIN_EMAIL ? (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-black text-white shadow-sm transition hover:bg-indigo-700"
                >
                  <ShieldCheck size={18} />
                  Admin
                </Link>
              ) : null}

              <Link
                href="/children"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-indigo-700 shadow-sm transition hover:bg-indigo-50"
              >
                <Users size={18} />
                My Children
              </Link>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-4">
            <StatCard label="Access" value={`${completion}%`} />
            <StatCard label="Children" value={String(children.length)} />
            <StatCard label="Package" value={profile?.package_type ? "Active" : "None"} />
            <StatCard label="Modules" value={String(accessCount)} />
          </section>

          <section className="mt-6 grid gap-6 2xl:grid-cols-[0.9fr_1.1fr]">
            <form
              onSubmit={handleSave}
              className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm"
            >
              <div className="mb-6">
                <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
                  PROFILE DETAILS
                </p>
                <h2 className="mt-1 text-3xl font-black text-indigo-700">
                  Parent Information
                </h2>
              </div>

              <section className="rounded-[2rem] border border-indigo-200 bg-white p-5">
                <div className="grid gap-6 xl:grid-cols-[1fr_auto_1fr]">
                  <div>
                    <p className="font-black text-slate-700">Choose default avatar</p>

                    <div className="mt-4 grid grid-cols-4 gap-3">
                      {defaultParentAvatars.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            setAvatarUrl(item);
                            setAvatarMode("default");
                          }}
                          className={`relative overflow-hidden rounded-2xl border bg-slate-50 p-2 transition ${
                            avatarUrl === item
                              ? "border-indigo-600 ring-4 ring-indigo-100"
                              : "border-indigo-100 hover:border-indigo-300"
                          }`}
                        >
                          <div className="grid h-20 place-items-center rounded-xl bg-white">
                            <img
                              src={item}
                              alt=""
                              className="h-16 w-16 rounded-xl object-contain"
                            />
                          </div>

                          {avatarUrl === item ? (
                            <span className="absolute bottom-2 left-2 grid h-7 w-7 place-items-center rounded-full bg-indigo-600 text-white">
                              <CheckCircle2 size={16} />
                            </span>
                          ) : null}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="hidden items-center xl:flex">
                    <div className="grid h-12 w-12 place-items-center rounded-full border border-indigo-100 bg-white text-xs font-black text-slate-500">
                      OR
                    </div>
                  </div>

                  <div>
                    <p className="font-black text-slate-700">Upload your own photo</p>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-4 flex min-h-[160px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/40 px-4 py-6 text-center transition hover:bg-indigo-50"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="animate-spin text-indigo-600" size={38} />
                          <p className="mt-3 font-black text-indigo-700">
                            Uploading photo...
                          </p>
                        </>
                      ) : (
                        <>
                          <ImagePlus className="text-indigo-600" size={44} />
                          <p className="mt-3 font-black text-indigo-700">
                            Click to upload photo
                          </p>
                          <p className="mt-1 text-sm font-bold text-slate-500">
                            PNG, JPG, WEBP or SVG. Max 2MB.
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
                      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-indigo-100 bg-white p-3">
                        <ProfileAvatar src={avatarUrl} name={fullName || "Parent"} size="sm" />
                        <div className="flex-1">
                          <p className="font-black text-indigo-700">
                            {avatarMode === "upload"
                              ? "Uploaded photo selected"
                              : avatarMode === "default"
                                ? "Default avatar selected"
                                : "Image URL selected"}
                          </p>
                          <p className="break-all text-xs text-slate-500">
                            {avatarUrl}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setAvatarUrl(fallbackParentAvatar);
                            setAvatarMode("default");
                          }}
                          className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-500"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block">
                    <span className="text-sm font-black text-slate-600">
                      Profile Image URL (optional)
                    </span>
                    <div className="mt-2 flex items-center gap-2 rounded-2xl border border-indigo-100 bg-white px-4 py-3 transition focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100">
                      <Camera className="text-indigo-600" size={20} />
                      <input
                        value={avatarMode === "url" ? avatarUrl : ""}
                        onChange={(event) => {
                          setAvatarUrl(event.target.value);
                          setAvatarMode("url");
                        }}
                        placeholder="Paste image URL e.g. https://example.com/profile.png"
                        className="w-full bg-transparent font-bold text-slate-800 outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </label>
                </div>
              </section>

              <div className="mt-6 space-y-5">
                <TextInput
                  label="Full name"
                  value={fullName}
                  required
                  onChange={setFullName}
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <InfoBox label="Email" value={email} icon={<Mail size={22} />} />
                  <InfoBox label="User Type" value={accountType} icon={<UserRound size={22} />} />
                </div>

                {error ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-700">
                    {error}
                  </div>
                ) : null}

                {message ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-bold text-emerald-700">
                    {message}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 text-xl font-black text-white transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={22} />
                  ) : (
                    <Save size={22} />
                  )}
                  {saving ? "Saving profile..." : "Save profile"}
                </button>
              </div>
            </form>

            <section className="space-y-6">
              <ProfilePreviewCard
                fullName={fullName}
                email={email}
                avatarUrl={avatarUrl}
                packageName={packageName}
                accountType={accountType}
              />

              <PackageStatusCard
                packageName={packageName}
                startDate={profile?.subscription_start || "-"}
                endDate={profile?.subscription_end || "-"}
              />

              <AccessSummaryCard
                hasLearningHub={hasLearningHub}
                hasCustomWorksheet={hasCustomWorksheet}
                hasFlashcard={hasFlashcard}
                hasMath={hasMath}
                hasDrawLearn={hasDrawLearn}
                hasSifir={hasSifir}
                hasFreebies={hasFreebies}
              />
            </section>
          </section>

          <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
            <ChildrenSummaryCard children={children} />
            <AccountSettingsCard />
          </section>
        </section>
      </div>
    </main>
  );
}

function ProfileSidebar({
  fullName,
  avatarUrl,
  packageName,
}: {
  fullName: string;
  avatarUrl: string;
  packageName: string;
}) {
  return (
    <aside className="hidden border-r border-indigo-100 bg-white p-6 xl:block">
      <Link href="/dashboard" className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600 text-yellow-200 shadow-lg">
          <Sparkles size={26} />
        </div>

        <div>
          <p className="text-xl font-black tracking-[0.18em] text-slate-900">
            FD ARCADIA
          </p>
          <p className="text-sm font-black tracking-[0.25em] text-indigo-600">
            PROFILE
          </p>
        </div>
      </Link>

      <div className="mt-10 flex flex-col items-center rounded-[2rem] bg-indigo-50 p-6 text-center">
        <ProfileAvatar src={avatarUrl} name={fullName || "Parent"} size="lg" />
        <h2 className="mt-4 text-2xl font-black text-indigo-700">
          {fullName || "Parent"}
        </h2>
        <p className="mt-1 text-sm font-bold text-slate-500">{packageName}</p>
      </div>

      <nav className="mt-8 space-y-2">
        <SidebarLink href="/dashboard" icon={<Home size={22} />}>
          Dashboard
        </SidebarLink>
        <SidebarLink href="/profile" icon={<UserRound size={22} />} active>
          My Profile
        </SidebarLink>
        <SidebarLink href="/children" icon={<Users size={22} />}>
          My Children
        </SidebarLink>
        <SidebarLink href="/learning-hub" icon={<BookOpenCheck size={22} />}>
          Learning Hub
        </SidebarLink>
        <SidebarLink href="/custom-worksheet" icon={<FileText size={22} />}>
          Worksheet
        </SidebarLink>
        <SidebarLink href="/freebies" icon={<Gift size={22} />}>
          Freebies
        </SidebarLink>
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
      className={`flex items-center gap-4 rounded-2xl px-4 py-3 font-black transition ${
        active
          ? "bg-indigo-50 text-indigo-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-indigo-700"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}

function ProfilePreviewCard({
  fullName,
  email,
  avatarUrl,
  packageName,
  accountType,
}: {
  fullName: string;
  email: string;
  avatarUrl: string;
  packageName: string;
  accountType: string;
}) {
  return (
    <section className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
          LIVE PREVIEW
        </p>
        <h2 className="mt-1 text-3xl font-black text-indigo-700">
          Parent Card
        </h2>
      </div>

      <div className="rounded-[2rem] bg-gradient-to-br from-indigo-50 to-yellow-50 p-6 text-center">
        <ProfileAvatar src={avatarUrl} name={fullName || "Parent"} size="xl" />
        <h3 className="mt-4 text-3xl font-black text-indigo-700">
          {fullName || "Parent"}
        </h3>
        <p className="mt-1 break-all text-sm font-bold text-slate-500">{email}</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <MiniInfo label="Account" value={accountType} />
          <MiniInfo label="Package" value={packageName} />
        </div>
      </div>
    </section>
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
    <section className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
            SUBSCRIPTION
          </p>
          <h2 className="mt-1 text-3xl font-black text-indigo-700">
            Package Status
          </h2>
        </div>
        <Crown className="text-yellow-500" size={34} />
      </div>

      <div className="mt-5 rounded-2xl bg-indigo-50 p-5">
        <p className="text-sm font-black tracking-[0.18em] text-yellow-600">
          CURRENT PACKAGE
        </p>
        <p className="mt-2 text-2xl font-black text-indigo-700">{packageName}</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <MiniInfo label="Start Date" value={startDate} />
        <MiniInfo label="End Date" value={endDate} />
      </div>

      <Link
        href="/pricing"
        className="mt-5 flex items-center justify-between rounded-2xl bg-indigo-600 px-5 py-4 font-black text-white transition hover:bg-indigo-700"
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
  hasMath,
  hasDrawLearn,
  hasSifir,
  hasFreebies,
}: {
  hasLearningHub: boolean;
  hasCustomWorksheet: boolean;
  hasFlashcard: boolean;
  hasMath: boolean;
  hasDrawLearn: boolean;
  hasSifir: boolean;
  hasFreebies: boolean;
}) {
  const accessRows = [
    { label: "Learning Hub", unlocked: hasLearningHub, icon: BookOpenCheck },
    { label: "Custom Worksheet", unlocked: hasCustomWorksheet, icon: FileText },
    { label: "Flashcard Library", unlocked: hasFlashcard, icon: BookOpen },
    { label: "Math Activity", unlocked: hasMath, icon: BarChart3 },
    { label: "Draw & Learn", unlocked: hasDrawLearn, icon: Palette },
    { label: "Sifir Deck", unlocked: hasSifir, icon: Star },
    { label: "Freebies", unlocked: hasFreebies, icon: Gift },
  ];

  return (
    <section className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm">
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
              className="flex items-center justify-between rounded-2xl bg-indigo-50 px-4 py-3 font-black text-slate-700"
            >
              <span className="flex items-center gap-3">
                <Icon className="text-indigo-600" size={21} />
                {row.label}
              </span>

              {row.unlocked ? (
                <CheckCircle2 className="text-emerald-600" size={22} />
              ) : (
                <LockKeyhole className="text-slate-400" size={22} />
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
    <section className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
            CHILDREN
          </p>
          <h2 className="mt-1 text-3xl font-black text-indigo-700">
            Child Profiles
          </h2>
        </div>
        <Baby className="text-indigo-600" size={34} />
      </div>

      {children.length === 0 ? (
        <div className="rounded-2xl bg-indigo-50 p-6 text-center">
          <Baby className="mx-auto text-indigo-400" size={40} />
          <p className="mt-3 font-black text-indigo-700">No child profile yet</p>
          <Link
            href="/children"
            className="mt-4 inline-flex rounded-2xl bg-indigo-600 px-5 py-3 font-black text-white"
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
                className="flex items-center justify-between rounded-2xl bg-indigo-50 px-4 py-4 transition hover:bg-indigo-100"
              >
                <div className="flex items-center gap-3">
                  <ProfileAvatar src={avatar} name={name} size="sm" />
                  <div>
                    <p className="font-black text-indigo-700">{name}</p>
                    <p className="text-sm font-bold text-slate-500">
                      Age {child.age || "-"} • {child.level || child.grade || "Level"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="text-indigo-600" size={20} />
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
    <section className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm">
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
      className="flex items-center justify-between rounded-2xl bg-indigo-50 px-4 py-4 transition hover:bg-indigo-100"
    >
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-indigo-600">
          {icon}
        </div>
        <div>
          <p className="font-black text-indigo-700">{title}</p>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <ChevronRight className="text-indigo-600" size={20} />
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
      className={`relative shrink-0 overflow-hidden rounded-[2rem] bg-sky-100 ${dimension}`}
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
        <div className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-2xl bg-white text-indigo-600 shadow">
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
    <div className="rounded-2xl bg-indigo-50 p-4">
      <div className="flex items-center gap-2 text-indigo-600">{icon}</div>
      <p className="mt-3 text-sm font-black tracking-[0.18em] text-yellow-600">
        {label.toUpperCase()}
      </p>
      <p className="mt-2 break-words text-lg font-black text-indigo-700">
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
    <div className="rounded-2xl bg-white px-4 py-3">
      <p className="text-xs font-black tracking-[0.16em] text-yellow-600">
        {label.toUpperCase()}
      </p>
      <p className="mt-1 text-sm font-black text-indigo-700">{value}</p>
    </div>
  );
}
