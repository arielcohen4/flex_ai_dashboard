import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/store/store";
import { setCheckpointsState } from "@/lib/store/endpointSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/custom/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useUser from "@/app/hook/useUser";
import { baseApiUrl } from "@/lib/constant";
import { CreateEndpointRequest } from "@/lib/types";
import axios from "axios";
import { toast } from "./ui/use-toast";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import TrackService from "@/lib/client-services/track";

const DeployCheckpointsModal = () => {
  const supabase = supabaseBrowser();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const selectedCheckpoints = useAppSelector(
    (state) => state.endpoint.checkpoints
  );
  const [inferenceLibrary, setInferenceLibrary] = useState("VLLM");
  const [maxContextSize, setMaxContextSize] = useState<number | null>(null);
  const [computeType, setComputeType] = useState("A100-40GB");
  const [editedNames, setEditedNames] = useState({});
  const [loadingCreateEndpoint, setLoadingCreateEndpoint] = useState(false);
  const [endpointName, setEndpointName] = useState(""); // New state for endpoint name
  const [regularModelName, setRegularModelName] = useState(
    selectedCheckpoints[0].tasks?.name + "-step-" + selectedCheckpoints[0].step
  ); // New state for endpoint name
  const [endpointNameError, setEndpointNameError] = useState("");
  const [idleTimeoutSeconds, setIdleTimeoutSeconds] = useState(60); // 1 minute default
  const [idleTimeoutError, setIdleTimeoutError] = useState("");
  const [open, setOpen] = useState(false);

  const user = useUser();
  const router = useRouter();
  const checkpointType = selectedCheckpoints[0].type;

  useEffect(() => {
    if (inferenceLibrary === "VLLM") {
      validateCheckpoints();
    }
  }, [inferenceLibrary, selectedCheckpoints]);

  const computesQuery = useQuery({
    queryKey: ["computes"],
    queryFn: async () => {
      const supabase = supabaseBrowser();
      const { data, error } = await supabase
        .from("computes")
        .select(`*`)
        .eq("type", "MODAL");

      if (error) {
        console.error("Error fetching data:", error);
        return [];
      }

      return data ?? [];
    },
  });

  const validateCheckpoints = () => {
    if (selectedCheckpoints.length > 1) {
      const contextLength =
        selectedCheckpoints[0]?.tasks?.models?.vllm_context_length;
      setMaxContextSize(
        typeof contextLength === "number" ? contextLength : null
      );
    }
  };

  const removeCheckpoint = (checkpointId: string) => {
    const updatedCheckpoints = selectedCheckpoints.filter(
      (c) => c.id !== checkpointId
    );
    dispatch(setCheckpointsState(updatedCheckpoints));
  };

  const handleNameChange = (checkpointId: string, newName: string) => {
    setEditedNames((prev) => ({ ...prev, [checkpointId]: newName }));
  };

  const handleRegularModelNameChange = (newName: string) => {
    setRegularModelName(newName);
  };

  const handleDeploy = async () => {
    const ifExists = await checkEndpointNameExists(
      user.data?.id as string,
      endpointName
    );
    if (ifExists) {
      setEndpointNameError("An endpoint with this name already exists");
      return;
    } else {
      setEndpointNameError("");
    }

    if (!computeType) {
      setEndpointNameError("Please select a compute type");
      return;
    }

    if (idleTimeoutSeconds < 2 || idleTimeoutSeconds > 1200) {
      setIdleTimeoutError(
        "Idle timeout must be between 2 seconds and 20 minutes"
      );
      return;
    }

    const apiKey = user?.data?.api_key;

    const url =
      checkpointType == "LORA"
        ? `${baseApiUrl}/v1/endpoints/create_multi_lora_endpoint`
        : `${baseApiUrl}/v1/endpoints/create_regular_endpoint`;
    const headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };

    const payload: CreateEndpointRequest = {
      name: endpointName,
      compute: computeType,
      idle_timeout_seconds: idleTimeoutSeconds,
    };

    if (checkpointType == "LORA") {
      payload.lora_checkpoints = selectedCheckpoints.map((c) => ({
        name: (editedNames as any)[c.id] || c.tasks?.name + "-step-" + c.step,
        id: c.id,
      }));
    } else {
      payload.checkpoint_id = selectedCheckpoints[0].id;
      payload.model_name = regularModelName;
    }

    try {
      setLoadingCreateEndpoint(true);
      const response = await axios.post(url, payload, { headers });
      queryClient.invalidateQueries({ queryKey: ["endpoints"] });

      TrackService.send({
        name: "create_endpoint_success",
        properties: {
          endpoint_name: endpointName,
          type: checkpointType,
        },
      });

      // move to tasks page
      toast({
        title: "New Endpoint created",
        description: `${endpointName} has been created successfully`,
      });
      router.push("/endpoints");
      dispatch(setCheckpointsState([]));

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error creating fine-tune:", error);
      } else {
        console.error("Unexpected error:", error);
      }
    } finally {
      setLoadingCreateEndpoint(false);
    }
  };

  const checkEndpointNameExists = async (id: string, name: string) => {
    const { data, error } = await supabase
      .from("endpoints")
      .select("*")
      .eq("is_archived", false)
      .eq("name", id.substring(0, 5) + "_" + name)
      .single();

    if (error) {
      console.error("Error checking endpoint name:", error);
      return false;
    }

    return !!data;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          Deploy {selectedCheckpoints.length} Checkpoints
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Deploy LORA Checkpoints to Endpoint</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Total checkpoints to deploy: {selectedCheckpoints.length}</p>
          <p>Endpoint type: {checkpointType}</p>

          <div className="mt-4">
            <label
              htmlFor="endpoint-name"
              className="block text-sm font-medium text-gray-700"
            >
              Endpoint Name
            </label>
            <Input
              id="endpoint-name"
              value={endpointName}
              onChange={(e) => setEndpointName(e.target.value)}
              placeholder="Enter endpoint name"
              className={`mt-1 ${endpointNameError ? "border-red-500" : ""}`}
            />
            {endpointNameError && (
              <p className="mt-1 text-sm text-red-500">{endpointNameError}</p>
            )}
          </div>

          <div className="mt-4">
            <label
              htmlFor="inference-library"
              className="block text-sm font-medium text-gray-700"
            >
              Select Inference Library
            </label>
            <Select
              onValueChange={setInferenceLibrary}
              value={inferenceLibrary}
            >
              <SelectTrigger id="inference-library">
                <SelectValue placeholder="Select inference library" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VLLM">VLLM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4">
            <label
              htmlFor="compute-type"
              className="block text-sm font-medium text-gray-700"
            >
              Compute Type
            </label>
            <Select onValueChange={setComputeType} value={computeType}>
              <SelectTrigger id="compute-type">
                <SelectValue placeholder="Select compute type" />
              </SelectTrigger>
              <SelectContent>
                {computesQuery.data?.map((compute) => (
                  <SelectItem
                    key={compute.identifier}
                    value={compute.identifier}
                  >
                    {compute.name} / {compute.price_per_second + " per second"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4">
            <label
              htmlFor="idle-timeout"
              className="block text-sm font-medium text-gray-700"
            >
              Idle Timeout (seconds)
            </label>
            <Input
              id="idle-timeout"
              type="number"
              value={idleTimeoutSeconds}
              onChange={(e) => setIdleTimeoutSeconds(Number(e.target.value))}
              placeholder="Enter idle timeout in seconds"
              min={2}
              max={1200}
              className={`mt-1 ${idleTimeoutError ? "border-red-500" : ""}`}
            />
            {idleTimeoutError && (
              <p className="mt-1 text-sm text-red-500">{idleTimeoutError}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Time in seconds before the endpoint goes down when inactive
              (2-1200 seconds)
            </p>
          </div>

          {inferenceLibrary === "VLLM" && (
            <div className="mt-4">
              <p>Max VLLM Context Size: {maxContextSize}</p>
            </div>
          )}

          {checkpointType == "LORA" && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700">
                Selected Checkpoints
              </h3>
              <ul className="mt-2 space-y-4">
                {selectedCheckpoints.map((checkpoint) => (
                  <li
                    key={checkpoint.id}
                    className="flex items-center justify-between py-2 border-b"
                  >
                    <div className="flex-grow mr-4">
                      <Input
                        value={
                          (editedNames as any)[checkpoint.id] ||
                          checkpoint.tasks?.name + "-step-" + checkpoint.step
                        }
                        onChange={(e) =>
                          handleNameChange(checkpoint.id, e.target.value)
                        }
                        placeholder="Enter model name"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        <span>Task: {checkpoint.tasks?.name}</span>
                        <span className="mx-2">|</span>
                        <span>Dataset: {checkpoint.tasks?.datasets?.name}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => removeCheckpoint(checkpoint.id)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {checkpointType == "REGULAR" && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700">Model Name</h3>
              <ul className="mt-2 space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex-grow mr-4">
                    <Input
                      value={regularModelName}
                      onChange={(e) =>
                        handleRegularModelNameChange(e.target.value)
                      }
                      placeholder="Enter model name"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      <span>Task: {selectedCheckpoints[0].tasks?.name}</span>
                      <span className="mx-2">|</span>
                      <span>
                        Dataset: {selectedCheckpoints[0].tasks?.datasets?.name}
                      </span>
                    </div>
                  </div>
                </div>
              </ul>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            loading={loadingCreateEndpoint}
            onClick={handleDeploy}
            disabled={selectedCheckpoints.length === 0}
          >
            Deploy with vLLM
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeployCheckpointsModal;
