import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function CreateTaskAlertDialog({
  isOpen,
  onClose,
  title,
  text,
  isError = false,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  text: string;
  isError?: boolean;
  onConfirm?: () => void;
}) {
  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open: boolean) => !open && onClose()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{text}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {isError ? (
            <AlertDialogAction onClick={onClose}>OK</AlertDialogAction>
          ) : (
            <>
              <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onConfirm}>
                Continue
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
