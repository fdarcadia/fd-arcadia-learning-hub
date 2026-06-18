"use client";

import { Camera, Loader2, Save } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import BackToDashboardButton from "@/components/common/BackToDashboardButton";
import { emptyUserAccess, getAccountTypeLabel, type UserAccess } from "@/lib/accountAccess";
import { supabase } from "@/lib/supabase";

type Profile = {
  account_type: string | null;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  profile_image_url: string | null;
};

function ProfileContent() {
  const [userId, setUserId] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [accountType, setAccountType] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [access, setAccess] = useState<UserAccess>(emptyUserAccess());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const [{ data: profileData }, { data: accessData }] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, email, phone, account_type, profile_image_url")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("user_access")
          .select(
            "learning_hub_access, custom_worksheet_access, flashcard_modul_access, subscription_status"
          )
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      if (!isMounted) return;

      const profile = profileData as Profile | null;
      setUserId(user.id);
      setFullName(profile?.full_name || "");
      setEmail(profile?.email || user.email || "");
      setPhone(profile?.phone || "");
      setAccountType(profile?.account_type || "");
      setProfileImageUrl(profile?.profile_image_url || "");
      setAccess({
        ...emptyUserAccess(),
        ...(accessData || {}),
      } as UserAccess);
      setLoading(false);
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  async function saveProfile(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setSaving(true);

    const { error } = await supabase.from("profiles").upsert(
      {
        account_type: accountType,
        email,
        full_name: fullName,
        phone,
        profile_image_url: profileImageUrl || null,
        user_id: userId,
      },
      {
        onConflict: "user_id",
      }
    );

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Profile updated successfully.");
  }

  async function uploadProfileImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file || !userId) return;

    setUploading(true);

    const extension = file.name.split(".").pop() || "jpg";
    const cleanFileName = `${Date.now()}.${extension}`.replace(/[^a-zA-Z0-9.-]/g, "");
    const filePath = `${userId}/${cleanFileName}`;

    const { error } = await supabase.storage.from("profile-pictures").upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

    if (error) {
      setUploading(false);
      alert(error.message);
      return;
    }

    const { data } = supabase.storage.from("profile-pictures").getPublicUrl(filePath);
    const publicUrl = data.publicUrl;

    setProfileImageUrl(publicUrl);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ profile_image_url: publicUrl })
      .eq("user_id", userId);

    setUploading(false);
    event.target.value = "";

    if (updateError) {
      alert(updateError.message);
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[var(--fd-cream)] px-6 text-[var(--fd-blue)]">
        <div className="flex items-center gap-3 rounded-lg bg-white px-5 py-4 text-sm font-black shadow-lg">
          <Loader2 className="animate-spin" size={20} aria-hidden="true" />
          Loading profile
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--fd-cream)] px-4 py-5 text-[var(--fd-blue)] md:px-8 md:py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5">
          <BackToDashboardButton />
        </div>

        <section className="mb-6 rounded-lg bg-[var(--fd-blue)] p-6 text-white shadow-[0_24px_70px_rgba(76,87,169,0.22)] md:p-8">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[var(--fd-yellow)]">
            My account
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-normal md:text-5xl">Profile</h1>
          <p className="mt-3 max-w-2xl text-white/80">
            Keep parent details, subscription information, and profile picture up to date.
          </p>
        </section>

        <section className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-lg border border-[var(--fd-blue)]/10 bg-white p-5 shadow-[0_18px_48px_rgba(76,87,169,0.08)]">
            <div className="mx-auto grid size-36 place-items-center overflow-hidden rounded-lg bg-[var(--fd-cream)]">
              {profileImageUrl ? (
                <Image
                  src={profileImageUrl}
                  alt="Profile picture"
                  width={144}
                  height={144}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <Camera size={44} className="text-[var(--fd-blue)]/45" aria-hidden="true" />
              )}
            </div>

            <label className="mt-5 flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[var(--fd-green)] px-4 py-3 text-sm font-black text-white transition hover:-translate-y-0.5">
              {uploading ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : <Camera size={18} aria-hidden="true" />}
              {uploading ? "Uploading" : "Upload picture"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                hidden
                onChange={uploadProfileImage}
              />
            </label>

            <div className="mt-5 space-y-3 text-sm font-bold">
              <div className="rounded-lg bg-[var(--fd-cream)] p-3">
                <p className="text-[var(--fd-blue)]/55">Account type</p>
                <p className="mt-1">{getAccountTypeLabel(accountType)}</p>
              </div>
              <div className="rounded-lg bg-[var(--fd-cream)] p-3">
                <p className="text-[var(--fd-blue)]/55">Subscription status</p>
                <p className="mt-1 capitalize">{access.subscription_status || "inactive"}</p>
              </div>
            </div>
          </aside>

          <form
            onSubmit={saveProfile}
            className="rounded-lg border border-[var(--fd-blue)]/10 bg-white p-5 shadow-[0_18px_48px_rgba(76,87,169,0.08)] md:p-6"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-black">
                Full name
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-[var(--fd-blue)]/15 bg-[var(--fd-cream)] px-4 py-3 font-semibold outline-none transition focus:border-[var(--fd-blue)]"
                />
              </label>

              <label className="block text-sm font-black">
                Email
                <input
                  disabled
                  value={email}
                  className="mt-2 w-full rounded-lg border border-[var(--fd-blue)]/10 bg-slate-100 px-4 py-3 font-semibold text-slate-500"
                />
              </label>

              <label className="block text-sm font-black">
                Phone number
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-[var(--fd-blue)]/15 bg-[var(--fd-cream)] px-4 py-3 font-semibold outline-none transition focus:border-[var(--fd-blue)]"
                />
              </label>

              <label className="block text-sm font-black">
                Account type
                <input
                  disabled
                  value={getAccountTypeLabel(accountType)}
                  className="mt-2 w-full rounded-lg border border-[var(--fd-blue)]/10 bg-slate-100 px-4 py-3 font-semibold text-slate-500"
                />
              </label>

              <label className="block text-sm font-black md:col-span-2">
                Subscription status
                <input
                  disabled
                  value={access.subscription_status || "inactive"}
                  className="mt-2 w-full rounded-lg border border-[var(--fd-blue)]/10 bg-slate-100 px-4 py-3 font-semibold text-slate-500"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--fd-blue)] px-5 py-4 font-black text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : <Save size={18} aria-hidden="true" />}
              {saving ? "Saving" : "Save profile"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
