"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { TaskWithRelations } from "@/lib/types";
import { Button } from "@/components/custom/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatSize } from "@/lib/utils";
import { getDownloadUrl } from "@/lib/actions/checkpoints";
import { Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { setCheckpointsState, endpointSlice } from "@/lib/store/endpointSlice";
import { useAppDispatch, useAppSelector } from "@/lib/store/store";
import { JoinedCheckpoint } from "@/lib/types";

const REMOVE_LOGS_KEYS = [
  "step",
  "epoch",
  "eval_runtime",
  "eval_steps_per_second",
  "eval_samples_per_second",
];

export function CheckpointsViewer({
  task,
  isOpen,
  onClose,
}: {
  task: TaskWithRelations;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [loadingCheckpoints, setLoadingCheckpoints] = useState<{
    [key: string]: boolean;
  }>({});
  const [openTooltips, setOpenTooltips] = useState<{ [key: string]: boolean }>(
    {}
  );
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const selectedCheckpoints = useAppSelector(
    (state) => state.endpoint.checkpoints
  );

  const checkpointsQuery = useQuery({
    queryKey: ["checkpoints", task.id],
    queryFn: async () => {
      const supabase = supabaseBrowser();
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user) {
        const { data, error } = await supabase
          .from("checkpoints")
          .select("*, tasks(*, models(*), datasets(*))")
          .eq("task_id", task.id)
          .order("created_at", { ascending: true });
        return data ?? [];
      }
      return [];
    },
  });

  useEffect(() => {
    const supabase = supabaseBrowser();
    const subscription = supabase
      .channel("checkpoints")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "checkpoints" },
        (payload) => {
          const newPayload = payload.new as { task_id?: string };
          console.log("Change received!", payload);
          // Refetch the checkpoints data
          queryClient.invalidateQueries({
            queryKey: ["checkpoints", newPayload?.task_id],
          });
        }
      )
      .subscribe();
  }, [queryClient]);

  const downloadCheckpoint = async ({ id }: { id: string }) => {
    setLoadingCheckpoints((prev) => ({ ...prev, [id]: true }));
    try {
      const url = await getDownloadUrl({ id });
      if (url) {
        window.open(url, "_blank");
      } else {
        console.error("Failed to generate download URL");
      }
    } catch (error) {
      console.error("Error downloading checkpoint:", error);
    } finally {
      setLoadingCheckpoints((prev) => ({ ...prev, [id]: false }));
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log("Text copied to clipboard");
      // Optionally, you can show a success message to the user here
    } catch (err) {
      console.error("Failed to copy text: ", err);
      // Optionally, you can show an error message to the user here
    }
  };

  const downloadCliCheckpoint = async ({
    id,
    name,
    checkpointNumber,
  }: {
    id: string;
    name: string;
    checkpointNumber: number;
  }) => {
    try {
      const url = await getDownloadUrl({ id });
      if (url) {
        const fileName = `${id}_${name}_checkpoint-${checkpointNumber}.tar.gz`;
        const downloadCommand = `wget -O ${fileName} "${url}" && tar -xzvf "${fileName}"`;
        copyToClipboard(downloadCommand);

        console.log("Download command copied to clipboard:", downloadCommand);
        // Open the tooltip for this specific button
        setOpenTooltips((prev) => ({ ...prev, [id]: true }));

        // Close the tooltip after 2 seconds
        setTimeout(() => {
          setOpenTooltips((prev) => ({ ...prev, [id]: false }));
        }, 500);
      } else {
        console.error("Failed to generate download URL");
      }
    } catch (error) {
      console.error("Error downloading checkpoint:", error);
    }
  };

  const toggleCheckpoint = (checkpoint: JoinedCheckpoint, checked: boolean) => {
    const updatedCheckpoints = checked
      ? [...selectedCheckpoints, checkpoint]
      : selectedCheckpoints.filter((x) => x.id !== checkpoint.id);
    dispatch(setCheckpointsState(updatedCheckpoints));
  };

  const isCheckpointSelected = (checkpointId: string) => {
    return selectedCheckpoints.some((c) => c.id === checkpointId);
  };

  const validateDeployCheckpoint = (checkpoint: JoinedCheckpoint) => {
    if (checkpoint.stage !== "FINISHED") {
      return {
        message: "Checkpoint must be finished before it can be deployed",
        valid: false,
      };
    }
    if (!checkpoint.tasks?.models?.vllm_support) {
      return {
        message: `${checkpoint.tasks?.models?.name} is not supported by VLLM or nay other library we have now`,
        valid: false,
      };
    }
    if (
      checkpoint.type == "LORA" &&
      !checkpoint.tasks?.models?.vllm_lora_support
    ) {
      return {
        message: `${checkpoint.tasks?.models?.name} is not supported by VLLM with Lora Adapters or nay other library we have now`,
        valid: false,
      };
    }
    if (
      checkpoint.type == "LORA" &&
      (checkpoint.tasks?.config as any)?.lora_config?.lora_r > 64
    ) {
      return {
        message: `VLLM doesn't support Lora Adapters with r > 64`,
        valid: false,
      };
    } else if (
      selectedCheckpoints.length > 0 &&
      selectedCheckpoints[0].type == "REGULAR"
    ) {
      return {
        message:
          "You already selected full fine tune checkpoint, you cant deploy it with other",
        valid: false,
      };
    } else if (
      selectedCheckpoints.length > 0 &&
      selectedCheckpoints[0].type == "LORA" &&
      checkpoint.type !== "LORA"
    ) {
      return {
        message:
          "You cant deploy full fine tune checkpoint with the lora you already selected",
        valid: false,
      };
    } else if (
      selectedCheckpoints.length > 0 &&
      selectedCheckpoints[0].type == "LORA" &&
      checkpoint.type === "LORA" &&
      selectedCheckpoints[0]?.tasks?.models?.id !==
        checkpoint?.tasks?.models?.id
    ) {
      return {
        message: `You already selected the lora with base model ${selectedCheckpoints[0]?.tasks?.models?.name}. You cant deploy lora adapters that doesn't have the same base model`,
        valid: false,
      };
    } else {
      return {
        message: `Select the checkpoint to add it to the deployment endpoint`,
        valid: true,
      };
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Checkpoints for {task.name}</DialogTitle>
          <DialogDescription>
            View details of saved checkpoints for this fine-tuning task.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          {checkpointsQuery.data?.length == 0 ? (
            <div className="flex justify-center items-center">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              <span>Waiting for first checkpoints...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Step</TableHead>
                  <TableHead>Epoch</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Metrics</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Download</TableHead>
                  <TableHead>Download CLI</TableHead>
                  <TableHead>Deploy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checkpointsQuery.data?.map((checkpoint) => (
                  <TableRow key={checkpoint.id}>
                    <TableCell>{checkpoint.step}</TableCell>
                    <TableCell>
                      {(
                        (checkpoint.step / task.total_steps) *
                        (task.config as { num_epochs: number }).num_epochs
                      ).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {checkpoint.size ? formatSize(checkpoint.size) : "N/A"}
                    </TableCell>
                    <TableCell>
                      {checkpoint.type === "LORA" ? "LoRA" : "Regular"}
                    </TableCell>
                    <TableCell>
                      {checkpoint?.logs &&
                        Object.entries(
                          checkpoint.logs as Record<string, string | number>
                        ).map(([key, value]) => {
                          if (!REMOVE_LOGS_KEYS.includes(key)) {
                            let formattedValue = value;
                            if (typeof value === "number") {
                              if (Math.abs(value) < 0.0001) {
                                // 1e-4
                                formattedValue = value.toExponential(0);
                              } else {
                                formattedValue = value.toFixed(4);
                              }
                            }

                            return (
                              <Badge
                                key={key}
                                variant="secondary"
                                className="mr-1 mb-1"
                              >
                                {key}: {formattedValue}
                              </Badge>
                            );
                          }
                        })}
                    </TableCell>
                    <TableCell>
                      {checkpoint.stage === "FINISHED" ? (
                        <Badge variant="secondary">Finished</Badge>
                      ) : (
                        <div className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span>{checkpoint.stage}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        loading={loadingCheckpoints[checkpoint.id]}
                        variant="secondary"
                        onClick={() =>
                          downloadCheckpoint({ id: checkpoint.id })
                        }
                        disabled={checkpoint.stage !== "FINISHED"}
                      >
                        Download
                      </Button>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip
                          open={
                            openTooltips[checkpoint.id] == undefined
                              ? false
                              : openTooltips[checkpoint.id]
                          }
                        >
                          <TooltipTrigger asChild>
                            <Button
                              variant="secondary"
                              onClick={() =>
                                downloadCliCheckpoint({
                                  id: checkpoint.id,
                                  name: checkpoint.tasks?.name as string,
                                  checkpointNumber: checkpoint.step,
                                })
                              }
                              disabled={checkpoint.stage !== "FINISHED"}
                            >
                              Copy
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copied</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Checkbox
                                checked={isCheckpointSelected(checkpoint.id)}
                                onCheckedChange={(checked) =>
                                  toggleCheckpoint(
                                    checkpoint,
                                    checked as boolean
                                  )
                                }
                                disabled={
                                  validateDeployCheckpoint(checkpoint).valid ==
                                  false
                                }
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {validateDeployCheckpoint(checkpoint).message}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
