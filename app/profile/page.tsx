"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [packageType, setPackageType] = useState("");
  const [currentWeek, setCurrentWeek] = useState(1);
  const [loading, setLoading] = useState(false);
  const [childrenCount, setChildrenCount] = useState(0);
const [rewardPoints, setRewardPoints] = useState(0);
const [subscriptionEnd, setSubscriptionEnd] = useState("");
const [email, setEmail] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

const loadProfile = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  setEmail(user.email || "");

  const { data } = await supabase
    .from("parents")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (data) {
    setFullName(data.full_name || "");
    setPhone(data.phone || "");
    setPackageType(data.package_type || "Tuition");
    setCurrentWeek(data.current_week || 1);
    setRewardPoints(data.reward_points || 0);
    setSubscriptionEnd(data.subscription_end || "");
  }

  const { count } = await supabase
    .from("children")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("parent_id", data.id);

  setChildrenCount(count || 0);
};

  const saveProfile = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("parents")
      .upsert(
        {
          user_id: user.id,
          full_name: fullName,
          phone: phone,
          
        },
        {
          onConflict: "user_id",
        }
      );

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Profile Updated Successfully");
  };

  return (
    <main className="min-h-screen bg-[var(--fd-cream)] p-8">
      <div className="max-w-5xl mx-auto">

        {/* HERO */}

        <div className="bg-[var(--fd-blue)] text-white rounded-3xl p-8 shadow-2xl mb-8">

          <h1 className="text-5xl font-bold">
            👤 My Profile
          </h1>

          <p className="mt-3 text-lg">
            Manage your FD Arcadia account
          </p>

        </div>

        {/* STATS */}

        <div className="grid md:grid-cols-5 gap-6 mb-8">

  <div className="bg-white rounded-3xl p-6 shadow-xl">
    <h3 className="text-gray-500 font-bold">
      🎓 Package
    </h3>

    <p className="text-2xl font-bold text-[var(--fd-blue)] mt-3">
      {packageType}
    </p>
  </div>

  <div className="bg-white rounded-3xl p-6 shadow-xl">
    <h3 className="text-gray-500 font-bold">
      📚 Current Week
    </h3>

    <p className="text-2xl font-bold text-blue-600 mt-3">
      {currentWeek}
    </p>
  </div>

  <div className="bg-white rounded-3xl p-6 shadow-xl">
    <h3 className="text-gray-500 font-bold">
      👶 Children
    </h3>

    <p className="text-2xl font-bold text-[var(--fd-mauve)] mt-3">
      {childrenCount}
    </p>
  </div>

  <div className="bg-white rounded-3xl p-6 shadow-xl">
    <h3 className="text-gray-500 font-bold">
      ⭐ Points
    </h3>

    <p className="text-2xl font-bold text-yellow-500 mt-3">
      {rewardPoints}
    </p>
  </div>

  <div className="bg-white rounded-3xl p-6 shadow-xl">
    <h3 className="text-gray-500 font-bold">
      ⏰ Expiry
    </h3>

    <p className="text-sm font-bold text-red-500 mt-3">
      {subscriptionEnd || "Active"}
    </p>
  </div>

</div>

        {/* PROFILE FORM */}

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">

          <h2 className="text-3xl font-bold mb-6">
            Personal Information
          </h2>

          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border p-4 rounded-xl mb-4"
          />

          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border p-4 rounded-xl mb-6"
          />

          <input
  type="text"
  value={email}
  disabled
  className="w-full border p-4 rounded-xl mb-4 bg-[var(--fd-cream)]"
/>

          <button
            onClick={saveProfile}
            disabled={loading}
            className="w-full bg-[var(--fd-blue)] text-white py-4 rounded-xl font-bold"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>

        </div>

        <button
  onClick={async () => {
    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo:
            window.location.origin +
            "/reset-password",
        }
      );

    if (error) {
      alert(error.message);
    } else {
      alert(
        "Password reset email sent."
      );
    }
  }}
  className="w-full mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-xl font-bold"
>
  🔒 Change Password
</button>

        {/* SUPPORT */}

        <div className="bg-[var(--fd-blue)] text-white rounded-3xl p-8 shadow-2xl">

  <h2 className="text-3xl font-bold mb-6">
    FD Arcadia Premium Support
  </h2>

  <div className="space-y-4">

    <p>
      📧 Email:
      fdarcadia.hello@gmail.com
    </p>

    <p>
      💬 WhatsApp:
      011-4073 1757
    </p>

    <p>
      🕒 Support Hours:
      9:00 AM - 6:00 PM
    </p>

    <p>
      🎓 Premium Learning Hub &
      Tuition Portal
    </p>

</div>

</div>

</div>

</main>
);
}