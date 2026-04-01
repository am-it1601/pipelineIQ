import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function run() {
  const { data, error } = await supabase.from("lead_logs").select("*, assignee:profiles!assigned_to_id(full_name, avatar_initials)").limit(1);
  if (error) console.error("Error with !assigned_to_id:", error.message);
  else console.log("Success with !assigned_to_id");

  const { data: data2, error: error2 } = await supabase.from("lead_logs").select("*, assignee:profiles!lead_logs_assigned_to_id_fkey(full_name, avatar_initials)").limit(1);
  if (error2) console.error("Error with !lead_logs_assigned_to_id_fkey:", error2.message);
  else console.log("Success with !lead_logs_assigned_to_id_fkey");
  
  const { data: data3, error: error3 } = await supabase.from("lead_logs").select("*, assignee:profiles(full_name, avatar_initials)").limit(1);
  if (error3) console.error("Error with just profiles:", error3.message);
  else console.log("Success with just profiles");
}
run();
