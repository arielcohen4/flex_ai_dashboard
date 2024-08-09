import { Tables } from "./supabase";

// Define the type for your joined query result
export type JoinedCheckpoint = Tables<"checkpoints"> & {
  tasks:
    | null
    | (Tables<"tasks"> & {
        models: Tables<"models"> | null;
      });
};
