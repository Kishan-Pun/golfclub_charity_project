"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [winners, setWinners] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getUser();

      const user = data.user;

      // ❌ Not logged in
      if (!user) {
        router.push("/login");
        return;
      }

      // ✅ SIMPLE ADMIN CHECK (WORKS ALWAYS)
      if (user.email === "admin@gmail.com") {
        setIsAdmin(true);
        fetchData();
      } else {
        router.push("/dashboard");
      }

      setLoading(false);
    };

    checkAdmin();
  }, []);

  const fetchData = async () => {
    const { data: usersData } = await supabase.from("profiles").select("*");
    const { data: winnersData } = await supabase.from("winners").select("*");

    setUsers(usersData || []);
    setWinners(winnersData || []);
  };

  const generateDraw = async () => {
    const numbers = Array.from(
      { length: 5 },
      () => Math.floor(Math.random() * 45) + 1,
    );

    await supabase.from("draws").insert({
      numbers,
      draw_date: new Date(),
      status: "completed",
    });

    alert("Draw created!");
  };

  const runWinners = async () => {
    const { data: drawData } = await supabase
      .from("draws")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);

    if (!drawData?.length) {
      alert("No draw found");
      return;
    }

    const draw = drawData[0];
    const drawNumbers = draw.numbers;

    // 🔥 Get all scores grouped by user
    const { data: scores } = await supabase.from("scores").select("*");

    const userMap: any = {};

    // group scores by user
    scores?.forEach((s) => {
      if (!userMap[s.user_id]) {
        userMap[s.user_id] = [];
      }
      userMap[s.user_id].push(s.score);
    });

    for (let userId in userMap) {
      const userScores = userMap[userId];

      const matches = userScores.filter((n: number) => drawNumbers.includes(n));

      const matchCount = matches.length;

      let prize = 0;

      if (matchCount === 5) prize = 1000;
      else if (matchCount === 4) prize = 500;
      else if (matchCount === 3) prize = 100;

      if (matchCount >= 3) {
        await supabase.from("winners").insert({
          user_id: userId,
          draw_id: draw.id,
          match_count: matchCount,
          prize,
          status: "pending",
        });
      }
    }

    alert("Winners generated!");
    fetchData();
  };

  if (loading) return <p className="text-center mt-10">Checking admin...</p>;

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-10">
      <h1 className="text-2xl font-bold mb-6">Admin Panel 👑</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <button
          onClick={generateDraw}
          className="bg-blue-600 text-white p-3 rounded"
        >
          Generate Draw
        </button>

        <button
          onClick={runWinners}
          className="bg-green-600 text-white p-3 rounded"
        >
          Run Winners
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="font-semibold mb-4">👥 Users</h2>

        {users.length === 0 ? (
          <p className="text-gray-500">No users found</p>
        ) : (
          users.map((u) => (
            <div key={u.id} className="flex justify-between border-b py-2">
              <span>{u.email}</span>
              <span className="text-gray-400 text-sm">{u.id.slice(0, 6)}</span>
            </div>
          ))
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-semibold mb-4">🏆 Winners</h2>

        {winners.length === 0 ? (
          <p className="text-gray-500">No winners yet</p>
        ) : (
          winners.map((w) => (
            <div key={w.id} className="flex justify-between border-b py-2">
              <span>User: {w.user_id.slice(0, 6)}</span>
              <span className="text-green-600 font-semibold">₹ {w.prize}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
