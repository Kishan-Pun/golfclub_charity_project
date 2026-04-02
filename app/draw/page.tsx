"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";

export default function DrawPage() {
  const [result, setResult] = useState("");

  const generateDraw = async () => {
    // Generate 5 random numbers (1–45)
    const numbers = Array.from(
      { length: 5 },
      () => Math.floor(Math.random() * 45) + 1,
    );

    await supabase.from("draws").insert({
      draw_date: new Date(),
      numbers,
      status: "completed",
    });

    alert("Draw generated!");
  };

  const checkMatches = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const userId = userData.user.id;

    // Get scores
    const { data: scores } = await supabase
      .from("scores")
      .select("score")
      .eq("user_id", userId);

    // Get latest draw
    const { data: draws } = await supabase
      .from("draws")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);

    if (!draws || draws.length === 0) return;

    const draw = draws[0];
    const drawNumbers = draw.numbers;

    const userScores = (scores || []).map((s) => s.score);

    const matches = userScores.filter((n) => drawNumbers.includes(n));

    const matchCount = matches.length;

    let resultText = "No win";
    let prize = 0;

    if (matchCount === 5) {
      resultText = "🎉 Jackpot!";
      prize = 1000;
    } else if (matchCount === 4) {
      resultText = "🔥 Big Win!";
      prize = 500;
    } else if (matchCount === 3) {
      resultText = "👍 Small Win";
      prize = 100;
    }

    // ✅ Save winner if any match
    if (matchCount >= 3) {
      await supabase.from("winners").insert({
        user_id: userId,
        draw_id: draw.id,
        match_count: matchCount,
        prize,
        status: "pending",
      });
    }

    setResult(`Matched ${matchCount} → ${resultText}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <button
        onClick={generateDraw}
        className="bg-purple-600 text-white p-4 rounded-lg"
      >
        Generate Draw
      </button>

      <button
        onClick={checkMatches}
        className="bg-green-600 text-white p-4 rounded-lg"
      >
        Check Matches
      </button>

      {result && (
        <div className="text-black bg-gray-200 p-4 rounded shadow mt-4 text-center">
          {result}
        </div>
      )}
    </div>
  );
}
