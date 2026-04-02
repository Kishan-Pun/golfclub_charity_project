"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";

export default function CharityPage() {
  const [charities, setCharities] = useState<any[]>([]);
  const [selected, setSelected] = useState("");
  const [percentage, setPercentage] = useState(10);
  const [current, setCurrent] = useState<any>(null);
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

  // 🔥 Fetch charities list
  const fetchCharities = async () => {
    const { data, error } = await supabase.from("charities").select("*");

    setCharities(data || []);
  };

  // 🔥 Fetch user's selected charity
  const fetchUserCharity = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data } = await supabase
      .from("user_charities")
      .select("*, charities(name)")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (data) {
      setCurrent(data);
      setSelected(data.charity_id);
      setPercentage(data.percentage);
    }
  };

  useEffect(() => {
    fetchCharities();
    fetchUserCharity();
  }, []);

  // 🔥 Save or update
  const handleSave = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    if (!selected) {
      alert("Please select a charity");
      return;
    }

    if (percentage < 10) {
      alert("Minimum 10%");
      return;
    }

    await supabase.from("user_charities").upsert({
      user_id: userData.user.id,
      charity_id: selected,
      percentage,
    });

    alert("Saved successfully!");
    fetchUserCharity();
  };

  if (loading) {
    return <p className="text-center mt-10">Checking auth...</p>;
  }
  return (
    <div className="text-gray-600 min-h-screen bg-gray-100">
      <div className="md:p-10 max-w-xl mx-auto space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Charity Selection
        </h1>

        {/* Current Selection */}
        {current && (
          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="font-semibold mb-2">Current Selection</h2>
            <p className="text-gray-600">Charity: {current.charities?.name}</p>
            <p className="text-gray-600">Contribution: {current.percentage}%</p>
          </div>
        )}

        {/* Charity List */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow">
          <label className="block mb-2 font-medium">Select Charity</label>

          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full border p-2 rounded mb-4"
          >
            <option value="">Choose charity</option>
            {charities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <label className="block mb-2 font-medium">
            Contribution Percentage
          </label>

          <input
            type="number"
            value={percentage}
            onChange={(e) => setPercentage(Number(e.target.value))}
            className="w-full border p-2 rounded mb-4"
          />

          <button
            onClick={handleSave}
            className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
