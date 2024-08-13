"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { CodeViewer } from "@/components/code-viewer";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { roundToK } from "@/lib/utils";
import { familyToLogo } from "@/lib/constant";

const appText = new Map([
  ["all", "Family"],
  ["qwen2", "phi3"],
]);

export default function AppContent() {
  const [sort, setSort] = useState("ascending");
  const [appType, setAppType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const modelsQuery = useQuery({
    queryKey: ["models_tasks_count"],
    queryFn: async () => {
      const supabase = supabaseBrowser();
      const { data } = await supabase
        .from("models")
        .select(
          `
          *,
          tasks:tasks(count)
        `
        )

        .order("created_at", { ascending: false });

      // Sort the data by task count after fetching
      const sortedData = data?.sort((a, b) => {
        const countA = a.tasks[0]?.count ?? 0;
        const countB = b.tasks[0]?.count ?? 0;
        return countB - countA; // Descending order
      });

      return sortedData ?? [];

      console.log(sortedData);
    },
  });

  const filteredApps = modelsQuery.data ? modelsQuery.data : [];

  const SkeletonCard = () => (
    <div className="rounded-lg border p-4">
      <div className="mb-8 flex items-center justify-between">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-8" />
      </div>
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8 pt-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Models Hub</h1>
        <p className="text-muted-foreground">
          Select the open source LLM you want to train
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
          <Select value={appType} onValueChange={setAppType}>
            <SelectTrigger className="w-36">
              <SelectValue>{appText.get(appType)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Family</SelectItem>
              <SelectItem value="llama3.1">llama3.1</SelectItem>
              <SelectItem value="gemma2">gemma2</SelectItem>
              <SelectItem value="qwen2">qwen2</SelectItem>
              <SelectItem value="llama3">llama3</SelectItem>
              <SelectItem value="tinyllama">tinyllama</SelectItem>
              <SelectItem value="mistral">mistral</SelectItem>
              <SelectItem value="internlm2.5">internlm2.5</SelectItem>
              <SelectItem value="jamba">jamba</SelectItem>
              <SelectItem value="yi-1.5">yi-1.5</SelectItem>
              <SelectItem value="deepseek-coder-v2">
                deepseek-coder-v2
              </SelectItem>
            </SelectContent>
          </Select>
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
        {modelsQuery.isLoading
          ? Array(12)
              .fill(0)
              .map((_, index) => (
                <li key={index}>
                  <SkeletonCard />
                </li>
              ))
          : filteredApps?.map((app) => (
              <li
                key={app.name}
                className="rounded-lg border p-4 hover:shadow-md"
              >
                <div className="mb-8 flex items-center justify-between">
                  <div
                    className={`items-center justify-center rounded-lg bg-muted p-2`}
                  >
                    {app.family && familyToLogo.hasOwnProperty(app.family) ? (
                      <Image
                        src={`/model_families/${familyToLogo[app.family]}`}
                        alt={app.name}
                        width={20}
                        height={20}
                      />
                    ) : null}
                  </div>
                  <Badge variant="secondary">
                    {roundToK(app.context_length)} context size
                  </Badge>
                  <Badge variant="secondary">
                    {roundToK(app.params_count)}b params
                  </Badge>
                  <CodeViewer model={app} />
                </div>
                <div>
                  <a
                    href={`https://huggingface.co/${app.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-1 font-semibold"
                  >
                    {app.name}
                  </a>
                  <p className="line-clamp-2 text-gray-500 text-sm">
                    {app.tasks[0].count + " Total community finetunes"}
                  </p>
                  <p className="line-clamp-2 text-gray-500 text-sm">
                    Inference:
                    {app.vllm_support && (
                      <Badge variant="outline" className="ml-1">
                        vLLM
                        {app.vllm_lora_support && " & LoRA"}
                      </Badge>
                    )}
                  </p>
                </div>
              </li>
            ))}
      </ul>
    </div>
  );
}
