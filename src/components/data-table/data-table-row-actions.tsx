"use client";

import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "../ui/button";
import { TaskWithRelations } from "@/lib/types";
import { CheckpointsViewer } from "../checkpoints-viewer";
import { TrainingConfigsViewer } from "../training-config-viewer";
import { useState } from "react";
import { cancelTask } from "@/lib/actions/tasks";
import TrackService from "@/lib/client-services/track";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const task = row.original as TaskWithRelations;
  const [showCheckpoints, setShowCheckpoints] = useState(false);
  const [showTrainingConfig, setShowTrainingConfig] = useState(false);
  const [loadingCancelTask, setLoadingCancelTask] = useState<boolean>(false);

  const handleCancelTask = async () => {
    setLoadingCancelTask(true);
    try {
      const url = await cancelTask({ id: task.id });
      TrackService.send({
        name: "cancel_task",
        properties: { task_id: task.id },
      });
    } catch (error) {
      console.error("Error cancel task:", error);
    } finally {
      setLoadingCancelTask(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem>Edit</DropdownMenuItem>
          {task.wandb_url && (
            <DropdownMenuItem>
              <a href={task.wandb_url} target="_blank">
                Weights & Biases URL
              </a>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onSelect={() => {
              TrackService.send({
                name: "view_checkpoints",
                properties: { task_id: task.id },
              });
              setShowCheckpoints(true);
            }}
          >
            View checkpoints
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              TrackService.send({
                name: "view_training_config",
                properties: { task_id: task.id },
              });
              setShowTrainingConfig(true);
            }}
          >
            View training config
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleCancelTask()}>
            Cancel
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {showCheckpoints && (
        <CheckpointsViewer
          task={task}
          isOpen={showCheckpoints}
          onClose={() => setShowCheckpoints(false)}
        />
      )}
      {showTrainingConfig && (
        <TrainingConfigsViewer
          task={task}
          isOpen={showTrainingConfig}
          onClose={() => setShowTrainingConfig(false)}
        />
      )}
    </>
  );
}
