import { Tables } from "./types/supabase";

export type TaskWithRelations = Tables<"tasks"> & {
  models: Tables<"models"> | null;
  datasets: Tables<"datasets"> | null;
};
