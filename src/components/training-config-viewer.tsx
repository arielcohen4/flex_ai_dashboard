import React from "react";
import { TaskWithRelations } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import JsonView from "@uiw/react-json-view";

export function TrainingConfigsViewer({
  task,
  isOpen,
  onClose,
}: {
  task: TaskWithRelations;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Training config for {task.name}</DialogTitle>
          <DialogDescription>
            View full details of your training run
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <JsonView collapsed={true} value={task.config as object} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
