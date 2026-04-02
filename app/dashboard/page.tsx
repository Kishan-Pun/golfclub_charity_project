"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [avg, setAvg] = useState(0);
  const [winners, setWinners] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [charityAmount, setCharityAmount] = useState(0);
  const [selectedCharity, setSelectedCharity] = useState<any>(null);

  const fetchData = async () => {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) return;

    setUser(userData.user);

    const { data } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false });

    setScores(data || []);

    if (data && data.length > 0) {
      const total = data.reduce((sum, s) => sum + s.score, 0);
      setAvg(Math.round(total / data.length));
    }

    // 🔥 Fetch winners
    const { data: winData } = await supabase
      .from("winners")
      .select("*")
      .eq("user_id", userData.user.id);

    setWinners(winData || []);

    if (winData && winData.length > 0) {
      const totalPrize = winData.reduce((sum, w) => sum + w.prize, 0);
      setTotal(totalPrize);
    }

    // 🔥 Fetch selected charity (WITH JOIN)
    const { data: charityData } = await supabase
      .from("user_charities")
      .select("*, charities(name)")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    setSelectedCharity(charityData);

    let charityPercent = charityData?.percentage || 0;

    let totalCharity = 0;

    if (winData && winData.length > 0) {
      totalCharity = winData.reduce(
        (sum, w) => sum + (w.prize * charityPercent) / 100,
        0,
      );
    }

    setCharityAmount(totalCharity);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-4 md:p-10 max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Dashboard
        </h1>
        {/* User Card */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow">
          <h2 className="text-black text-xl font-bold">Welcome</h2>
          <p className="text-gray-600">{user?.email}</p>
        </div>

        {/* 🔥 Selected Charity */}
        {selectedCharity && (
          <div className="bg-white p-4 md:p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-2">Your Charity</h3>

            <p className="text-gray-600">{selectedCharity.charities?.name}</p>

            <p className="text-gray-500 text-sm">
              Contribution: {selectedCharity.percentage}%
            </p>
          </div>
        )}

        <div className="bg-white p-4 md:p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4">Earnings Breakdown</h3>

          <div className="flex justify-between">
            <span>Total Won</span>
            <span className="font-bold text-green-600">₹ {total}</span>
          </div>

          <div className="flex justify-between mt-2">
            <span>Charity</span>
            <span className="font-bold text-purple-600">₹ {charityAmount}</span>
          </div>

          <div className="flex justify-between mt-2 border-t pt-2">
            <span>You Keep</span>
            <span className="font-bold text-blue-600">
              ₹ {total - charityAmount}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-linear-to-r from-blue-500 to-blue-700 text-white p-4 rounded-xl">
            <p>Total Scores</p>
            <h2 className="text-2xl font-bold">{scores.length}</h2>
          </div>

          <div className="bg-linear-to-r from-green-500 to-green-700 text-white p-4 rounded-xl">
            <p>Average</p>
            <h2 className="text-2xl font-bold">{avg}</h2>
          </div>

          <div className="bg-linear-to-r from-purple-500 to-purple-700 text-white p-4 rounded-xl">
            <p>Total Earnings</p>
            <h2 className="text-2xl font-bold">₹ {total}</h2>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4">Winnings</h3>

          <div className="mb-4">
            <p className="text-gray-500">Total Earnings</p>
            <p className="text-2xl font-bold text-green-600">₹ {total}</p>
          </div>

          {winners.length === 0 ? (
            <p className="text-gray-500">No winnings yet</p>
          ) : (
            winners.map((w) => (
              <div
                key={w.id}
                className="flex flex-col sm:flex-row sm:justify-between border-b py-2 gap-1"
              >
                <span>Match: {w.match_count}</span>
                <span className="text-green-600">₹ {w.prize}</span>
              </div>
            ))
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4">Charity Contribution</h3>

          <p className="text-gray-500">Your Contribution</p>
          <p className="text-2xl font-bold text-purple-600">
            ₹ {charityAmount}
          </p>
        </div>

        {/* Scores List */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow">
          <h3 className="text-black text-lg font-semibold mb-4">
            Recent Scores
          </h3>

          {scores.map((s) => (
            <div
              key={s.id}
              className="text-gray-500 flex flex-col sm:flex-row sm:justify-between border-b py-2 gap-1"
            >
              <span>Score: {s.score}</span>
              <span className="text-sm text-gray-500">
                {new Date(s.date).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>

        {/* Button */}
        <a
          href="/score"
          className="block text-center bg-blue-600 text-white p-3 rounded-lg w-full md:w-auto"
        >
          Add Score
        </a>
      </div>
    </div>
  );
}
