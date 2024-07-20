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
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { CreateFinetuneRequest } from "@/lib/types";

export default function LLMTrainingTaskForm() {
  const [name, setName] = useState("");
  const [modelId, setModelId] = useState("");
  const [datasetId, setDatasetId] = useState("");
  const [nEpochs, setNEpochs] = useState(1);
  const [trainWithLora, setTrainWithLora] = useState(true);
  const [batchSize, setBatchSize] = useState<number | null>(null);
  const [learningRate, setLearningRate] = useState<number | null>(null);
  const [wandbKey, setWandbKey] = useState("");
  const [nCheckpoints, setNCheckpoints] = useState<number>(1);
  const [saveOnlyBestCheckpoint, setSaveOnlyBestCheckpoint] = useState(false);

  // LoRA configuration
  const [loraR, setLoraR] = useState(16);
  const [loraAlpha, setLoraAlpha] = useState(16);
  const [loraDropout, setLoraDropout] = useState(0);

  // Early stopping configuration
  const [useEarlyStopping, setUseEarlyStopping] = useState(false);
  const [earlyStoppingPatience, setEarlyStoppingPatience] = useState(3);
  const [earlyStoppingThreshold, setEarlyStoppingThreshold] = useState(0.001);

  const { data: models, isLoading: isLoadingModels } = useQuery({
    queryKey: ["models"],
    queryFn: async () => {
      const supabase = supabaseBrowser();
      const { data } = await supabase.from("models").select("*");
      return data ?? [];
    },
  });

  const { data: datasets, isLoading: isLoadingDatasets } = useQuery({
    queryKey: ["datasets"],
    queryFn: async () => {
      const supabase = supabaseBrowser();
      const { data } = await supabase.from("datasets").select("*");
      return data ?? [];
    },
  });

  const handleSubmit = () => {
    const fineTuneRequest: CreateFinetuneRequest = {
      name,
      model: modelId,
      datasetId,
      nEpochs,
      trainWithLora,
      batchSize,
      learningRate,
      wandbKey,
      nCheckpointsAndEvaluationsPerEpoch: nCheckpoints,
      saveOnlyBestCheckpoint,
      loraConfig: null,
      earlyStoppingConfig: null,
    };

    if (trainWithLora) {
      fineTuneRequest.loraConfig = {
        loraR,
        loraAlpha,
        loraDropout,
      };
    }

    if (useEarlyStopping) {
      fineTuneRequest.earlyStoppingConfig = {
        patience: earlyStoppingPatience,
        threshold: earlyStoppingThreshold,
      };
    }

    console.log(fineTuneRequest);
    // Here you would typically send the form data to your backend
  };

  useEffect(() => {
    if (modelId && models) {
      const selectedModel = models.find((model) => model.id === modelId);
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
  }, [modelId, models]);

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
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Select onValueChange={setModelId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingModels ? (
                  <div></div>
                ) : (
                  models?.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
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
                <Slider
                  id="loraR"
                  min={1}
                  max={64}
                  step={1}
                  value={[loraR]}
                  onValueChange={([value]) => setLoraR(value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loraAlpha">LoRA Alpha: {loraAlpha}</Label>
                <Slider
                  id="loraAlpha"
                  min={1}
                  max={128}
                  step={1}
                  value={[loraAlpha]}
                  onValueChange={([value]) => setLoraAlpha(value)}
                />
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
            <Label htmlFor="batchSize">Batch Size (optional)</Label>
            <Input
              id="batchSize"
              type="number"
              value={batchSize || ""}
              onChange={(e) =>
                setBatchSize(e.target.value ? parseInt(e.target.value) : null)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="learningRate">Learning Rate (optional)</Label>
            <Input
              id="learningRate"
              type="number"
              step="0.0001"
              value={learningRate || ""}
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
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" onClick={handleSubmit}>
          Create Task
        </Button>
      </CardFooter>
    </Card>
  );
}
