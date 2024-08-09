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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DeployCheckpointsModal = () => {
  const dispatch = useAppDispatch();
  const selectedCheckpoints = useAppSelector(
    (state) => state.endpoint.checkpoints
  );
  const [inferenceLibrary, setInferenceLibrary] = useState("VLLM");
  const [maxContextSize, setMaxContextSize] = useState<number | null>(null);
  const [editedNames, setEditedNames] = useState({});

  useEffect(() => {
    if (inferenceLibrary === "VLLM") {
      validateCheckpoints();
    }
  }, [inferenceLibrary, selectedCheckpoints]);

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

  const handleDeploy = () => {
    // console.log("Deploying checkpoints:", deployCheckpoints);
    // console.log("Inference library:", inferenceLibrary);
  };

  const checkpointType =
    selectedCheckpoints.length > 0 ? selectedCheckpoints[0].type : "N/A";

  return (
    <Dialog>
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

          {inferenceLibrary === "VLLM" && (
            <div className="mt-4">
              <p>Max VLLM Context Size: {maxContextSize}</p>
            </div>
          )}

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
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button
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
