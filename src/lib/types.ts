import { Tables } from "./types/supabase";

export type TaskWithRelations = Tables<"tasks"> & {
  models: Tables<"models"> | null;
  datasets: Tables<"datasets"> | null;
};

export type LoraConfig = {
  loraR: number;
  loraAlpha: number;
  loraDropout: number;
};

export type EarlyStoppingConfig = {
  patience: number;
  threshold: number;
};

export type CreateFinetuneRequest = {
  name: string;
  datasetId: string;
  model: string;
  nEpochs: number;
  batchSize: number | null;
  learningRate: number | null;
  nCheckpointsAndEvaluationsPerEpoch: number;
  saveOnlyBestCheckpoint: boolean;
  trainWithLora: boolean;
  loraConfig: LoraConfig | null;
  earlyStoppingConfig: EarlyStoppingConfig | null;
  wandbKey: string | null;
};
