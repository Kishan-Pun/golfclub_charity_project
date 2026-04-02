"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function DrawPage() {
  const [draw, setDraw] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDraw = async () => {
      const { data } = await supabase
        .from("draws")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setDraw(data);
      setLoading(false);
    };

    fetchDraw();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-bold">🎯 Latest Draw</h1>

      {draw ? (
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p className="text-gray-500 mb-2">
            {new Date(draw.draw_date).toLocaleDateString()}
          </p>

          <div className="flex gap-3 justify-center">
            {draw.numbers.map((num: number, i: number) => (
              <div
                key={i}
                className="w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-full text-lg font-bold"
              >
                {num}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>No draw yet</p>
      )}
    </div>
  );
}