"use client";
import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Badge } from "@/components/ui/badge";
import { ApiViewer } from "@/components/api-viewer";
import Image from "next/image";
import { familyToLogo } from "@/lib/constant";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { roundToK } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppContent() {
  const [sort, setSort] = useState("ascending");
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = supabaseBrowser();
    const subscription = supabase
      .channel("endpoints")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "endpoints" },
        (payload) => {
          const newPayload = payload.new as { task_id?: string };
          console.log("Change received!", payload);
          // Refetch the checkpoints data
          queryClient.invalidateQueries({
            queryKey: ["endpoints"],
          });
        }
      )
      .subscribe();
  }, [queryClient]);

  const endpointsQuery = useQuery({
    queryKey: ["endpoints"],
    queryFn: async () => {
      const supabase = supabaseBrowser();
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const { data } = await supabase
          .from("endpoints")
          .select(`*, models(*)`)
          .order("created_at", { ascending: false });
        return data ?? [];
      }
    },
  });

  const filteredApps = endpointsQuery.data
    ? endpointsQuery.data.filter((app) =>
        app.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8 pt-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Serverless Endpoints
        </h1>
        <p className="text-muted-foreground">
          Your serverless endpoints for fine-tuned models. Pay only for what you
          use per request
        </p>
      </div>
      <div className="my-4 flex items-end justify-between sm:my-0 sm:items-center">
        <div className="flex flex-col gap-4 sm:my-4 sm:flex-row">
          <Input
            placeholder="Filter apps..."
            className="h-9 w-40 lg:w-[250px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-16">
            <SelectValue>
              <IconAdjustmentsHorizontal size={18} />
            </SelectValue>
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="ascending">
              <div className="flex items-center gap-4">
                <IconSortAscendingLetters size={16} />
                <span>Ascending</span>
              </div>
            </SelectItem>
            <SelectItem value="descending">
              <div className="flex items-center gap-4">
                <IconSortDescendingLetters size={16} />
                <span>Descending</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Separator className="shadow" />
      <ul className="faded-bottom no-scrollbar grid gap-4 overflow-auto pb-16 pt-4 md:grid-cols-2 lg:grid-cols-3">
        {endpointsQuery.isLoading
          ? // Skeleton loading
            Array.from({ length: 6 }).map((_, index) => (
              <li key={index} className="rounded-lg border p-4">
                <div className="mb-8 flex items-center justify-between">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-4 w-3/4 mt-2" />
                  <Skeleton className="h-4 w-2/3 mt-2" />
                  <Skeleton className="h-4 w-3/4 mt-2" />
                </div>
              </li>
            ))
          : filteredApps.map((app) => (
              <li
                key={app.name}
                className="rounded-lg border p-4 hover:shadow-md"
              >
                <div className="mb-8 flex items-center justify-between">
                  <div
                    className={`items-center justify-center rounded-lg bg-muted p-2`}
                  >
                    {app.models?.family &&
                    familyToLogo.hasOwnProperty(app.models.family) ? (
                      <Image
                        src={`/model_families/${
                          familyToLogo[app.models.family]
                        }`}
                        alt={app.models?.name}
                        width={20}
                        height={20}
                      />
                    ) : null}
                  </div>
                  {app.type == "LORA" &&
                  app.models?.vllm_lora_context_length != null ? (
                    <Badge variant="secondary">
                      {roundToK(app.models?.vllm_lora_context_length ?? 0)} vLLM
                      Lora context size
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      {roundToK(app.models?.vllm_context_length ?? 0)} vLLM
                      context size
                    </Badge>
                  )}
                  <Badge variant="secondary">
                    {roundToK(app.models?.params_count ?? 0)}b params
                  </Badge>
                  <ApiViewer endpoint={app} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <a target="_blank" className="font-semibold">
                      {app.name.split("_")[1]}{" "}
                      <Badge variant="outline" className="ml-1">
                        Serverless
                      </Badge>
                    </a>
                    {app.stage === "INITIALIZING" ? (
                      <Badge variant="outline" className="animate-pulse">
                        Initializing
                      </Badge>
                    ) : app.stage === "LIVE" ? (
                      <Badge
                        variant="default"
                        className="bg-green-500 text-white"
                      >
                        Ready
                      </Badge>
                    ) : null}
                  </div>
                  <p className="line-clamp-2 text-gray-500 text-sm">
                    Type: {app.type}
                  </p>
                  <p className="line-clamp-2 text-gray-500 text-sm">
                    Inference Lib:
                    {app.inference_library == "VLLM" && (
                      <Badge variant="outline" className="ml-1">
                        vLLM
                      </Badge>
                    )}
                  </p>
                  <p className="line-clamp-2 text-gray-500 text-sm">
                    Base Model: {app.models?.name}
                  </p>
                  {app.type == "LORA" && (
                    <p className="line-clamp-2 text-gray-500 text-sm">
                      Lora Adapters Models:{" "}
                      {(app.lora_checkpoints as any[])?.map(
                        (c: any, index: number) => (
                          <span key={index}>
                            {c.name}
                            {index < (app.lora_checkpoints as any[])?.length - 1
                              ? ", "
                              : ""}
                          </span>
                        )
                      )}
                    </p>
                  )}
                </div>
              </li>
            ))}
      </ul>
    </div>
  );
}
