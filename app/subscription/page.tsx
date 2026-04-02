"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = "/login";
      } else {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const subscribe = async (plan: string) => {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) return;

    const now = new Date();
    const end = new Date();

    if (plan === "monthly") {
      end.setMonth(end.getMonth() + 1);
    } else {
      end.setFullYear(end.getFullYear() + 1);
    }

    await supabase.from("subscriptions").insert({
      user_id: userData.user.id,
      plan,
      status: "active",
      start_date: now,
      end_date: end,
    });

    alert("Subscribed successfully!");
  };

  if (loading) {
    return <p className="text-center mt-10">Checking auth...</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 md:p-8 rounded-xl shadow w-full max-w-md">
        <h1 className="text-xl md:text-2xl font-bold mb-6 text-center">
          Choose Plan
        </h1>

        <div className="space-y-4">
          <button
            onClick={() => subscribe("monthly")}
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition"
          >
            Monthly Plan
          </button>

          <button
            onClick={() => subscribe("yearly")}
            className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition"
          >
            Yearly Plan
          </button>
        </div>
      </div>
    </div>
  );
}
