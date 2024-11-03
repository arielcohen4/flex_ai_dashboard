"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import useUser from "@/app/hook/useUser";
import { baseApiUrl } from "@/lib/constant";
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
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

interface UploadUrlsResponse {
  dataset_id: string;
  train_upload_url: string;
  eval_upload_url: string;
  storage_type: string;
}

export default function DatasetUploadForm() {
  const user = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const [name, setName] = useState("");
  const [trainFile, setTrainFile] = useState<File | null>(null);
  const [evalFile, setEvalFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Alert dialog state
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const showError = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setIsAlertOpen(true);
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void
  ) => {
    const file = event.target.files?.[0] || null;
    if (file && !file.name.endsWith(".jsonl")) {
      showError("Invalid File Type", "Please upload a .jsonl file");
      event.target.value = "";
      return;
    }
    setFile(file);
  };

  const validateFiles = () => {
    if (!name.trim()) {
      showError("Validation Error", "Please enter a dataset name");
      return false;
    }
    if (!trainFile) {
      showError("Validation Error", "Please select a training file");
      return false;
    }
    return true;
  };

  const uploadDataset = async () => {
    if (!validateFiles()) return;

    try {
      setLoading(true);
      const apiKey = user?.data?.api_key;
      if (!apiKey) throw new Error("API key not found");

      // Get upload URLs
      const urlResponse = await axios.get<UploadUrlsResponse>(
        `${baseApiUrl}/v1/datasets/generate_upload_urls`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const { dataset_id, train_upload_url, eval_upload_url, storage_type } =
        urlResponse.data;

      // Upload training file
      await axios.put(train_upload_url, trainFile, {
        headers: { "Content-Type": "application/octet-stream" },
      });

      // Upload eval file if present
      if (evalFile) {
        await axios.put(eval_upload_url, evalFile, {
          headers: { "Content-Type": "application/octet-stream" },
        });
      }

      // Create dataset
      await axios.post(
        `${baseApiUrl}/v1/datasets/create_dataset`,
        {
          id: dataset_id,
          name: name,
          storage_type: storage_type,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast({
        title: "Dataset Created",
        description: `${name} has been uploaded successfully`,
      });

      router.push("/datasets");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        showError(
          "Upload Error",
          error.response?.data?.detail || "Failed to upload dataset"
        );
      } else {
        showError("Upload Error", "An unexpected error occurred");
      }
      console.error("Error uploading dataset:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Dataset</CardTitle>
        <CardDescription>
          Upload your training and evaluation datasets in JSONL format
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Dataset Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter dataset name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trainFile">Training Dataset (Required)</Label>
            <Input
              id="trainFile"
              type="file"
              accept=".jsonl"
              onChange={(e) => handleFileChange(e, setTrainFile)}
              required
            />
            <p className="text-sm text-gray-500">
              Upload your training data in JSONL format
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="evalFile">Evaluation Dataset (Recommended)</Label>
            <Input
              id="evalFile"
              type="file"
              accept=".jsonl"
              onChange={(e) => handleFileChange(e, setEvalFile)}
            />
            <p className="text-sm text-gray-500">
              Upload your evaluation data in JSONL format
            </p>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button onClick={uploadDataset} loading={loading} disabled={loading}>
          Upload Dataset
        </Button>
      </CardFooter>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertTitle}</AlertDialogTitle>
            <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
