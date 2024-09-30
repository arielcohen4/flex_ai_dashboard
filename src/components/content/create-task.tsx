"use client";
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabaseBrowser } from "@/lib/supabase/browser";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/custom/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { CreateFinetuneRequest } from "@/lib/types";
import useUser from "@/app/hook/useUser";
import { baseApiUrl, familyToLogo } from "@/lib/constant";
import axios, { AxiosError } from "axios";

import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { CreateTaskAlertDialog } from "@/components/create-task-alert-dialog";
import { Tables } from "@/lib/types/supabase";
import SearchableSelect from "@/components/searchable-select";

export default function LLMTrainingTaskForm() {
  const user = useUser();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [modelName, setModelName] = useState("");
  const [datasetId, setDatasetId] = useState("");
  const [nEpochs, setNEpochs] = useState(1);
  const [trainWithLora, setTrainWithLora] = useState(true);
  const [batchSize, setBatchSize] = useState<number | null>(null);
  const [learningRate, setLearningRate] = useState<number | null>(null);
  const [wandbKey, setWandbKey] = useState(user.data?.wandb_key);
  const [nCheckpoints, setNCheckpoints] = useState<number>(1);
  const [saveOnlyBestCheckpoint, setSaveOnlyBestCheckpoint] = useState(false);
  const [targetInferenceLibrary, setTargetInferenceLibrary] = useState("vllm");

  // LoRA configuration
  const [loraR, setLoraR] = useState(64);
  const [loraAlpha, setLoraAlpha] = useState(16);
  const [loraDropout, setLoraDropout] = useState(0);

  // Early stopping configuration
  const [useEarlyStopping, setUseEarlyStopping] = useState(false);
  const [earlyStoppingPatience, setEarlyStoppingPatience] = useState(3);
  const [earlyStoppingThreshold, setEarlyStoppingThreshold] = useState(0.001);

  const [loadingCreateTask, setLoadingCreateTask] = useState(false);

  // New state for the alert dialog
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertText, setAlertText] = useState("");
  const [canProceed, setCanProceed] = useState(false);
  const [isAlertError, setIsAlertError] = useState(false);

  const router = useRouter();

  const { data: models, isLoading: isLoadingModels } = useQuery({
    queryKey: ["models"],
    queryFn: async () => {
      const supabase = supabaseBrowser();
      const { data } = await supabase
        .from("models")
        .select(
          `
          *,
          tasks:tasks(count)
        `
        )

        .order("created_at", { ascending: false });

      // Sort the data by task count after fetching
      const sortedData = data?.sort((a, b) => {
        const countA = a.tasks[0]?.count ?? 0;
        const countB = b.tasks[0]?.count ?? 0;
        return countB - countA; // Descending order
      });

      return sortedData ?? [];
    },
  });

  const { data: datasets, isLoading: isLoadingDatasets } = useQuery({
    queryKey: ["datasets"],
    queryFn: async () => {
      const supabase = supabaseBrowser();
      const { data } = await supabase
        .from("datasets")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  useEffect(() => {
    if (user.data?.wandb_key) {
      setWandbKey(user.data.wandb_key)
    }
  }, [user.data?.wandb_key])

  const validate = async () => {
    const model = models?.find(
      (model) => model.name === modelName
    ) as Tables<"models">;
    const dataset = datasets?.find(
      (dataset) => dataset.id === datasetId
    ) as Tables<"datasets">;

    if (targetInferenceLibrary == "vllm") {
      if (!model?.vllm_support) {
        setAlertTitle(`vLLM Inference Not Supported for ${modelName}`);
        setAlertText(
          "Please select a model that supports vLLM inference or remove LLM as the target inference library."
        );
        setIsAlertError(true);
        setIsAlertOpen(true);
        return false;
      }

      if (!model?.vllm_lora_support && trainWithLora) {
        setAlertTitle(
          `vLLM Inference Not Supported for ${modelName} with Multi LoRA Adapters`
        );
        setAlertText(
          "You can still train this model but merge the lora adapter weights to the model at the end. Do you want to continue?"
        );
        setIsAlertOpen(true);
        setIsAlertError(false);
        return false;
      }

      if (model?.vllm_lora_support && trainWithLora && loraR > 64) {
        setAlertTitle(
          `vLLM Inference Not Supported for ${modelName} with Multi LoRA Adapters with LoRA Rank more then 64`
        );
        setAlertText(
          `You can still train this model with ${loraR}, but in order to inference  you will need to merge the lora adapter weights to the model at the end. Do you want to continue?`
        );
        setIsAlertOpen(true);
        setIsAlertError(false);
        return false;
      }

      if (model?.context_length < dataset?.max_tokens) {
        setAlertTitle(
          `Model max context size is not enough for your dataset for ${modelName}`
        );
        setAlertText(
          `Model max context size for ${modelName} is ${model.context_length} and your dataset has max tokens of ${dataset.max_tokens}. You should train different model or reduce the dataset max context size.`
        );
        setIsAlertOpen(true);
        setIsAlertError(true);
        return false;
      }

      if (
        model?.vllm_context_length &&
        model?.vllm_context_length < dataset?.max_tokens
      ) {
        setAlertTitle(
          `vLLM Inference will reduce the context length for ${modelName} to ${model.vllm_context_length}`
        );
        setAlertText(
          `vLLM Inference will reduce the context length for ${modelName} to ${model.vllm_context_length} and your dataset has max tokens of ${dataset.max_tokens}. So training will be fine, but on inference you wont be able to use that context size, Do you want to continue?`
        );
        setIsAlertOpen(true);
        setIsAlertError(true);
        return false;
      }

      if (
        model?.vllm_lora_context_length &&
        model?.vllm_lora_context_length < dataset?.max_tokens
      ) {
        setAlertTitle(
          `vLLM Inference with Multi Lora adapters will reduce the context length for ${modelName} to ${model.vllm_lora_context_length}`
        );
        setAlertText(
          `vLLM Inference with Multi Lora adapters will reduce the context length for ${modelName} to ${model.vllm_lora_context_length} and your dataset has max tokens of ${dataset.max_tokens}. So training will be fine, but on inference you wont be able to use that context size, Do you want to continue?`
        );
        setIsAlertOpen(true);
        setIsAlertError(false);
        return false;
      }
    }

    return true;
  };

  const validateAndSubmit = async () => {
    const validated = await validate();

    if (!validated) {
      return;
    }

    handleSubmit();
  };

  const handleSubmit = async () => {
    const apiKey = user?.data?.api_key;

    const url = `${baseApiUrl}/v1/fine_tunes/create_finetune`;
    const headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };

    const payload: CreateFinetuneRequest = {
      name,
      dataset_id: datasetId,
      model: modelName,
      n_epochs: nEpochs,
      train_with_lora: trainWithLora,
      save_only_best_checkpoint: false,
    };

    if (batchSize) payload.batch_size = batchSize;
    if (learningRate) payload.learning_rate = learningRate;
    if (nCheckpoints)
      payload.n_checkpoints_and_evaluations_per_epoch = nCheckpoints;
    if (saveOnlyBestCheckpoint)
      payload.save_only_best_checkpoint = saveOnlyBestCheckpoint;
    if (trainWithLora)
      payload.lora_config = {
        lora_alpha: loraAlpha,
        lora_dropout: loraDropout,
        lora_r: loraR,
      };
    if (wandbKey) payload.wandb_key = wandbKey;
    if (useEarlyStopping)
      payload.early_stopping_config = {
        patience: earlyStoppingPatience,
        threshold: earlyStoppingThreshold,
      };

    try {
      setLoadingCreateTask(true);
      const response = await axios.post(url, payload, { headers });
      // move to tasks page
      toast({
        title: "New Training Task created",
        description: `${name} has been created successfully`,
      });
      router.push("/tasks");
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Type guard to check if it's an AxiosError
        const axiosError = error as AxiosError<any>; // Cast to AxiosError
        setAlertTitle(
          `${axiosError.response?.data?.detail || "An error occurred"}`
        );
        setAlertText(
          `${axiosError.response?.data?.detail || "Please try again later"}`
        );
        setIsAlertOpen(true);
        setIsAlertError(true);
        console.error("Error creating fine-tune:", axiosError);
      } else {
        // Handle non-Axios errors
        setAlertTitle("An unexpected error occurred");
        setAlertText("Please try again later");
        setIsAlertOpen(true);
        setIsAlertError(true);
        console.error("Unexpected error:", error);
      }
    } finally {
      setLoadingCreateTask(false);
    }
  };

  const handleAlertClose = () => {
    setIsAlertOpen(false);
    if (!isAlertError) {
      router.push("/tasks");
    }
  };

  const handleAlertConfirm = () => {
    setIsAlertOpen(false);
    handleSubmit();
  };

  useEffect(() => {
    if (modelName && models) {
      const selectedModel = models.find((model) => model.name === modelName);
      if (
        selectedModel &&
        typeof selectedModel.default_config === "object" &&
        selectedModel.default_config !== null
      ) {
        const config = selectedModel.default_config as {
          gradient_accumulation_steps?: number;
          learning_rate?: number;
        };

        setBatchSize(config.gradient_accumulation_steps ?? 8);
        setLearningRate(config.learning_rate ?? null);
      }
    }
  }, [modelName, models]);

  const handleCheckboxChange = (checked: boolean | "indeterminate") => {
    setSaveOnlyBestCheckpoint(checked === true);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create LLM Training Task</CardTitle>
        <CardDescription>
          Set up a new training task for your LLM model
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Task Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <SearchableSelect
              options={models || []}
              onValueChange={setModelName}
              placeholder="Select a model"
              familyToLogo={familyToLogo}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataset">Dataset</Label>
            <Select onValueChange={setDatasetId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a dataset" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingDatasets ? (
                  <div></div>
                ) : (
                  datasets?.map((dataset) => (
                    <SelectItem key={dataset.id} value={dataset.id}>
                      {dataset.name}
                      {dataset.storage_type === "AWS" && (
                        <Image
                          className="w-6 h-6 ml-2 inline-block"
                          src={`/aws.svg`}
                          alt={dataset.name}
                          width={50}
                          height={50}
                        />
                      )}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="epochs">Number of Epochs: {nEpochs}</Label>
            <Slider
              id="epochs"
              min={1}
              max={100}
              step={1}
              value={[nEpochs]}
              onValueChange={([value]) => setNEpochs(value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="lora"
              checked={trainWithLora}
              onCheckedChange={setTrainWithLora}
            />
            <Label htmlFor="lora">Train with LoRA</Label>
          </div>

          {trainWithLora && (
            <div className="space-y-4 p-4 border rounded">
              <h4 className="font-semibold">LoRA Configuration</h4>
              <div className="space-y-2">
                <Label htmlFor="loraR">LoRA R: {loraR}</Label>
                <Select
                  onValueChange={(value) => setLoraR(Number(value))}
                  value={loraR.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select LoRA R value" />
                  </SelectTrigger>
                  <SelectContent>
                    {[8, 16, 32, 64, 128].map((value) => (
                      <SelectItem key={value} value={value.toString()}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="loraAlpha">LoRA Alpha: {loraAlpha}</Label>
                <Select
                  onValueChange={(value) => setLoraAlpha(Number(value))}
                  value={loraAlpha.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select LoRA Alpha value" />
                  </SelectTrigger>
                  <SelectContent>
                    {[8, 16].map((value) => (
                      <SelectItem key={value} value={value.toString()}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="loraDropout">LoRA Dropout: {loraDropout}</Label>
                <Slider
                  id="loraDropout"
                  min={0}
                  max={1}
                  step={0.01}
                  value={[loraDropout]}
                  onValueChange={([value]) => setLoraDropout(value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="batchSize">Batch Size</Label>
            <Select
              onValueChange={(value) => setBatchSize(Number(value))}
              value={batchSize?.toString() || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select batch size" />
              </SelectTrigger>
              <SelectContent>
                {[4, 16, 32, 64, 128].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="learningRate">Learning Rate (optional)</Label>
            <Input
              id="learningRate"
              type="number"
              step="0.0001"
              value={learningRate != null ? learningRate : ""}
              onChange={(e) =>
                setLearningRate(
                  e.target.value ? parseFloat(e.target.value) : null
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wandbKey">Weights & Biases Key (optional)</Label>
            <Input
              id="wandbKey"
              value={wandbKey}
              onChange={(e) => setWandbKey(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nCheckpoints">
              Checkpoints per Epoch (optional)
            </Label>
            <Input
              id="nCheckpoints"
              type="number"
              value={nCheckpoints || ""}
              onChange={(e) => setNCheckpoints(parseInt(e.target.value))}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="bestCheckpoint"
              checked={saveOnlyBestCheckpoint}
              onCheckedChange={handleCheckboxChange}
            />
            <Label htmlFor="bestCheckpoint">Save only best checkpoint</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="earlyStopping"
              checked={useEarlyStopping}
              onCheckedChange={setUseEarlyStopping}
            />
            <Label htmlFor="earlyStopping">Use Early Stopping</Label>
          </div>

          {useEarlyStopping && (
            <div className="space-y-4 p-4 border rounded">
              <h4 className="font-semibold">Early Stopping Configuration</h4>
              <div className="space-y-2">
                <Label htmlFor="earlyStoppingPatience">
                  Patience: {earlyStoppingPatience}
                </Label>
                <Slider
                  id="earlyStoppingPatience"
                  min={1}
                  max={20}
                  step={1}
                  value={[earlyStoppingPatience]}
                  onValueChange={([value]) => setEarlyStoppingPatience(value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="earlyStoppingThreshold">
                  Threshold: {earlyStoppingThreshold}
                </Label>
                <Slider
                  id="earlyStoppingThreshold"
                  min={0.001}
                  max={0.1}
                  step={0.001}
                  value={[earlyStoppingThreshold]}
                  onValueChange={([value]) => setEarlyStoppingThreshold(value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="targetInferenceLibrary">
              Target Inference Library (For validation)
            </Label>
            <Select
              onValueChange={setTargetInferenceLibrary}
              value={targetInferenceLibrary}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select target inference library" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vllm">vLLM</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          loading={loadingCreateTask}
          type="submit"
          onClick={() => validateAndSubmit()}
        >
          Create Task
        </Button>
      </CardFooter>
      <CreateTaskAlertDialog
        isOpen={isAlertOpen}
        onClose={handleAlertClose}
        onConfirm={handleAlertConfirm}
        title={alertTitle}
        text={alertText}
        isError={isAlertError}
      />
    </Card>
  );
}
