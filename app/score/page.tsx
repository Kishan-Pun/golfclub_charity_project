"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ScorePage() {
  const [score, setScore] = useState("");
  const [scores, setScores] = useState<any[]>([]);

  const fetchScores = async () => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const { data } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", user.data.user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    setScores(data || []);
  };

  useEffect(() => {
    fetchScores();
  }, []);

  const handleAddScore = async () => {
    const user = await supabase.auth.getUser();

    if (!user.data.user) {
      alert("Not logged in");
      return;
    }

    const userId = user.data.user.id;

    // update
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active");

    if (!sub || sub.length === 0) {
      alert("Please subscribe first");
      return;
    }

    // ❌ Validation (important)
    if (Number(score) < 1 || Number(score) > 45) {
      alert("Score must be between 1 and 45");
      return;
    }

    // ✅ 1. Insert new score FIRST
    await supabase.from("scores").insert({
      user_id: userId,
      score: Number(score),
      date: new Date(),
      created_at: new Date(),
    });

    // ✅ 2. Fetch all scores (oldest first)
    const { data: allScores } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    // ✅ 3. Delete extra (keep only 5)
    if (allScores && allScores.length > 5) {
      const extra = allScores.slice(0, allScores.length - 5);

      for (let s of extra) {
        await supabase.from("scores").delete().eq("id", s.id);
        console.log("Deleting:", s.id);
      }
    }

    console.log("ALL SCORES:", allScores);
    setScore("");
    fetchScores();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-4 md:p-10 max-w-xl mx-auto">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow">
          <h1 className="text-black text-xl md:text-2xl font-bold mb-4">
            Your Scores
          </h1>

          {/* Input */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              type="number"
              placeholder="Enter score"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="text-black flex-1 border p-2 rounded"
            />

            <button
              onClick={handleAddScore}
              className="bg-green-500 text-white px-4 py-2 rounded w-full sm:w-auto"
            >
              Add
            </button>
          </div>

          {/* Score List */}
          <div className="space-y-2">
            {scores.length === 0 ? (
              <p className="text-gray-500 text-center">No scores yet</p>
            ) : (
              scores.map((s) => (
                <div
                  key={s.id}
                  className="text-gray-500 flex flex-col sm:flex-row sm:justify-between bg-gray-50 p-2 rounded"
                >
                  <span>Score: {s.score}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(s.date).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
