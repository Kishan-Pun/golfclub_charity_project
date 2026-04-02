// app/page.tsx
import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data, error } = await supabase.from("test").select("*");

  console.log("DATA:", data);
  console.log("ERROR:", error);

  return <div>Supabase Connected ✅</div>;
}