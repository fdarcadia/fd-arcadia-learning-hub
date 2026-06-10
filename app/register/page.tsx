"use client";

import { useState } from "react";
import BrandLogo from "@/components/BrandLogo";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [packageType, setPackageType] =
    useState("learninghub");

  const handleRegister = async () => {
    const { data, error } =
      await supabase.auth.signUp({
        email,
        password,
      });

    if (error) {
      alert(error.message);
      return;
    }

    const userId = data.user?.id;

    if (!userId) {
      alert("Registration failed");
      return;
    }

    const { error: parentError } =
      await supabase
        .from("parents")
        .insert([
          {
            user_id: userId,
            full_name: fullName,
            phone: phone,
            subscription_type: "trial",
            package_type: packageType,
            current_week: 1,
          },
        ]);

    if (parentError) {
      alert(parentError.message);
      return;
    }

    alert("Account created successfully!");

    if (packageType === "learninghub") {
      window.location.href =
        "/learninghub";
    } else {
      window.location.href =
        "/tuition";
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--fd-cream)] p-6">

      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg">

        <BrandLogo
          className="mb-6 justify-center"
          imageClassName="h-24 w-44"
          label="FD Arcadia"
          subtitle="Parent Registration"
        />

        <p className="text-center text-gray-500 mb-8">
          Create Parent Account
        </p>

        <input
          placeholder="Full Name"
          value={fullName}
          onChange={(e) =>
            setFullName(e.target.value)
          }
          className="w-full border p-4 rounded-xl mb-4"
        />

        <input
          placeholder="Phone Number"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value)
          }
          className="w-full border p-4 rounded-xl mb-4"
        />

        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full border p-4 rounded-xl mb-4"
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="w-full border p-4 rounded-xl mb-6"
        />

        <label className="font-bold mb-3 block">
          Select Package
        </label>

        <select
          value={packageType}
          onChange={(e) =>
            setPackageType(
              e.target.value
            )
          }
          className="w-full border p-4 rounded-xl mb-6"
        >
          <option value="learninghub">
            📚 Learning Hub
          </option>

          <option value="tuition">
            🎓 Tuition Portal
          </option>
        </select>

        <button
          onClick={handleRegister}
          className="w-full bg-[var(--fd-blue)] text-white py-4 rounded-xl font-bold text-lg"
        >
          Create Account
        </button>

      </div>

    </main>
  );
}
