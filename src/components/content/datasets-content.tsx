"use client";

import React, { useEffect } from "react";
import { useState } from "react";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  IconAdjustmentsHorizontal,
  IconSortAscendingLetters,
  IconSortDescendingLetters,
} from "@tabler/icons-react";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { roundToK } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import {
  ArchiveX,
  Database,
  Edit,
  MessageCircle,
  Hammer,
  FileType,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TrackService from "@/lib/client-services/track";

const appText = new Map<string, string>([
  ["all", "All Types"],
  ["instruction", "Instruction"],
  ["chat", "Chat"],
  ["text", "Text"],
]);

const typeIcons = {
  INSTRUCTION: <Hammer className="w-3 h-3 mr-1" />,
  CHAT: <MessageCircle className="w-4 h-4 mr-1" />,
  TEXT: <FileType className="w-4 h-4 mr-1" />,
};

export default function AppContent() {
  const [sort, setSort] = useState("ascending");
  const [appType, setAppType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");
  const queryClient = useQueryClient();

  const datasetsQuery = useQuery({
    queryKey: ["datasets", "datasets-content"],
    queryFn: async () => {
      const supabase = supabaseBrowser();
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const { data } = await supabase
          .from("datasets")
          .select("*")
          .eq("is_archived", false)
          .order("created_at", { ascending: false });
        return data;
      }
    },
  });

  useEffect(() => {
    const supabase = supabaseBrowser();
    const subscription = supabase
      .channel("datasets")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "datasets" },
        (payload) => {
          console.log("Change received!", payload);
          // Refetch the datasets data
          queryClient.invalidateQueries({ queryKey: ["datasets"] });
        }
      )
      .subscribe();
  }, [queryClient]);

  const filteredApps = datasetsQuery.data
    ? datasetsQuery.data
        .filter((app) => appType === "all" || appType === app.type)
        .filter((app) =>
          app.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
    : [];

  const archiveMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const supabase = supabaseBrowser();
      await supabase
        .from("datasets")
        .update({ is_archived: true })
        .eq("id", id);

      return { id };
    },
    onSuccess: ({ id }) => {
      TrackService.send({
        name: "archive_dataset",
        properties: { dataset_id: id },
      });

      queryClient.setQueryData(
        ["datasets", "datasets-content"],
        (oldData: any) => {
          return oldData.filter((dataset: any) => dataset.id !== id);
        }
      );

      queryClient.invalidateQueries({ queryKey: ["datasets"] });
    },
  });

  const editNameMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const supabase = supabaseBrowser();
      await supabase.from("datasets").update({ name }).eq("id", id);
      return { id, name };
    },
    onSuccess: ({ id, name }) => {
      TrackService.send({
        name: "edit_dataset_name",
        properties: { dataset_id: id, new_name: name },
      });

      queryClient.setQueryData(
        ["datasets", "datasets-content"],
        (oldData: any) => {
          return oldData.map((dataset: any) =>
            dataset.id === id ? { ...dataset, name } : dataset
          );
        }
      );
      queryClient.invalidateQueries({ queryKey: ["datasets"] });
    },
  });

  const handleEditName = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const handleSaveName = async (id: string) => {
    await editNameMutation.mutateAsync({ id, name: editName });
    setEditingId(null);
    toast({
      title: "Dataset Name Updated",
      description: "The dataset name has been updated successfully",
    });
  };

  const handleArchive = async ({ id, name }: { id: string; name: string }) => {
    await archiveMutation.mutateAsync({ id });

    toast({
      title: "Dataset Archived",
      description: `Dataset ${name} has been archived successfully`,
    });
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8 pt-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Datasets
          </CardTitle>
          <p className="text-muted-foreground">View and manage your datasets</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Input
                placeholder="Filter datasets..."
                className="h-9 w-full sm:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={appType} onValueChange={setAppType}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue>{appText.get(appType)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="instruction">Instruction</SelectItem>
                  <SelectItem value="chat">Chat</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue>
                  <div className="flex items-center">
                    <IconAdjustmentsHorizontal size={18} className="mr-2" />
                    <span>
                      {sort === "ascending" ? "Ascending" : "Descending"}
                    </span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ascending">
                  <div className="flex items-center gap-2">
                    <IconSortAscendingLetters size={16} />
                    <span>Ascending</span>
                  </div>
                </SelectItem>
                <SelectItem value="descending">
                  <div className="flex items-center gap-2">
                    <IconSortDescendingLetters size={16} />
                    <span>Descending</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator className="my-6" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {datasetsQuery.isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="p-4">
                    <CardContent className="p-0">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-6 w-1/4" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              : filteredApps.map((app) => (
                  <Card
                    key={app.id}
                    className="hover:shadow-md transition-shadow duration-300"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-grow mr-2">
                          {editingId === app.id ? (
                            <div className="flex items-center">
                              <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleSaveName(app.id);
                                  }
                                }}
                                className="mr-2"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSaveName(app.id)}
                              >
                                <Check size={16} />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <h3 className="text-lg font-semibold mb-1">
                                {app.name}
                              </h3>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditName(app.id, app.name)}
                                className="ml-2"
                              >
                                <Edit size={16} />
                              </Button>
                            </div>
                          )}
                          <p className="text-gray-500 text-xs">{app.id}</p>
                        </div>
                        <div className="flex items-center">
                          {app.storage_type === "AWS" && (
                            <Image
                              className="w-6 h-6 mr-2"
                              src={`/aws.svg`}
                              alt={app.name}
                              width={24}
                              height={24}
                            />
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <ArchiveX size={16} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action will archive this dataset. Are you
                                  sure you want to proceed?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleArchive({
                                      id: app.id,
                                      name: app.name,
                                    })
                                  }
                                >
                                  Yes, archive it
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Badge
                          variant="outline"
                          className="flex items-center w-fit"
                        >
                          {typeIcons[app.type]}
                          {app.type}
                        </Badge>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">
                            {roundToK(app.train_rows_count)} train rows
                          </Badge>
                          {app.eval_rows_count && (
                            <Badge variant="secondary">
                              {roundToK(app.eval_rows_count)} eval rows
                            </Badge>
                          )}
                          <Badge variant="secondary">
                            {roundToK(app.max_tokens)} max tokens
                          </Badge>
                          <Badge variant="secondary">
                            {roundToK(app.total_tokens)} tokens
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-4 text-sm text-gray-500">
                        Created:{" "}
                        {format(new Date(app.created_at), "MMM dd, yyyy")}
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
