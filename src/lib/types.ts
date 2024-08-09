import { Tables, Enums } from "./types/supabase";

export type TaskWithRelations = Tables<"tasks"> & {
  models: Tables<"models"> | null;
  datasets: Tables<"datasets"> | null;
};

// Define the type for your joined query result
export type JoinedCheckpoint = Tables<"checkpoints"> & {
  tasks:
    | null
    | (Tables<"tasks"> & {
        models: Tables<"models"> | null;
        datasets: Tables<"datasets"> | null;
      });
};

export type LoraConfig = {
  lora_r: number;
  lora_alpha: number;
  lora_dropout: number;
};

export type EarlyStoppingConfig = {
  patience: number;
  threshold: number;
};

export type CreateFinetuneRequest = {
  name: string;
  dataset_id: string;
  model: string;
  n_epochs: number;
  batch_size?: number;
  learning_rate?: number;
  n_checkpoints_and_evaluations_per_epoch?: number;
  save_only_best_checkpoint: boolean;
  train_with_lora: boolean;
  lora_config?: LoraConfig;
  early_stopping_config?: EarlyStoppingConfig;
  wandb_key?: string;
};

export type CreateEndpointRequest = {
  name: string;
  type: Enums<"CHECKPOINT_TYPE">;
  lora_checkpoints?: { name: string; id: string }[];
  model_name?: string;
  checkpoint_id?: string;
};
