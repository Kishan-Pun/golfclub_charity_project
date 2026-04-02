"use client";
// app/page.tsx
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default async function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, []);

  const { data, error } = await supabase.from("test").select("*");

  console.log("DATA:", data);
  console.log("ERROR:", error);

  return <p className="text-center mt-10">Loading...</p>;
}
