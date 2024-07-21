"use server";
import { supabaseServer } from "@/lib/supabase/server";
import { cancelJobId } from "../server-services/runpod";

export async function cancelTask({ id }: { id: string }) {
  const supabase = supabaseServer();

  const task = await supabase.from("tasks").select("*").eq("id", id).single();

  await cancelJobId({ id: (task.data?.engine_data as any).runpod_run_id });

  await supabase
    .from("tasks")
    .update({ stage: "CANCELED", end_time: new Date().toISOString() })
    .eq("id", id);

  return true;
}
