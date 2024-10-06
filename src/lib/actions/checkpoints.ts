"use server";
import { supabaseServer } from "@/lib/supabase/server";
import { generatePresignedUrl } from "../server-services/s3";

export async function getDownloadUrl({ id }: { id: string }) {
  const supabase = supabaseServer();

  const checkpoint = await supabase
    .from("checkpoints")
    .select("*")
    .eq("id", id)
    .single();

  const url = await generatePresignedUrl({
    bucket: "checkpoints",
    key: checkpoint.data?.storage_key as string,
  });

  return url;
}

export async function getGGUFDownloadUrl({ id }: { id: string }) {
  const supabase = supabaseServer();

  const checkpoint = await supabase
    .from("checkpoints")
    .select("*")
    .eq("id", id)
    .single();

  const url = await generatePresignedUrl({
    bucket: "checkpoints",
    key: checkpoint.data?.gguf_storage_key as string,
  });

  return url;
}
