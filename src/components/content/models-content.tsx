"use client";
import React, { useState, useMemo } from "react";
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
  IconLock,
} from "@tabler/icons-react";
import { Separator } from "../ui/separator";
import { Badge } from "@/components/ui/badge";
import { CodeViewer } from "@/components/code-viewer";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { roundToK } from "@/lib/utils";
import { familyToLogo } from "@/lib/constant";
import useUser from "@/app/hook/useUser";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
const appText = new Map([
  ["all", "All Families"],
  ["qwen2", "Qwen2"],
  ["llama3", "LLaMA 3"],
  // Add other families here
]);

export default function AppContent() {
  const [sort, setSort] = useState("descending");
  const [appType, setAppType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const user = useUser();

  const modelsQuery = useQuery({
    queryKey: ["models", "models-content"],
    queryFn: async () => {
      const supabase = supabaseBrowser();
      const { data, error } = await supabase
        .from("models")
        .select(
          `
          *,
          tasks:tasks(count)
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching data:", error);
        return [];
      }

      return data ?? [];
    },
  });

  const filteredApps = useMemo(() => {
    if (!modelsQuery.data) return [];

    return modelsQuery.data
      .filter((app) => {
        const matchesSearch =
          app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (app.family &&
            app.family.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFamily = appType === "all" || app.family === appType;
        return matchesSearch && matchesFamily;
      })
      .sort((a, b) => {
        const countA = a.tasks[0]?.count ?? 0;
        const countB = b.tasks[0]?.count ?? 0;
        return sort === "ascending" ? countA - countB : countB - countA;
      });
  }, [modelsQuery.data, searchTerm, appType, sort]);

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

      {/* Improved mobile responsiveness for the filter section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Input
            placeholder="Search..."
            className="h-9 w-full sm:w-40 lg:w-[250px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={appType} onValueChange={setAppType}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue>{appText.get(appType) || appType}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Families</SelectItem>
              <SelectItem value="llama3.2">LLaMA 3.2</SelectItem>
              <SelectItem value="llama3.1">LLaMA 3.1</SelectItem>
              <SelectItem value="llama3">LLaMA 3</SelectItem>
              <SelectItem value="gemma2">Gemma 2</SelectItem>
              <SelectItem value="phi3">Phi 3</SelectItem>
              <SelectItem value="qwen2.5">Qwen 2.5</SelectItem>
              <SelectItem value="qwen2">Qwen 2</SelectItem>
              <SelectItem value="tinyllama">Tiny LLaMA</SelectItem>
              <SelectItem value="mistral">Mistral</SelectItem>
              <SelectItem value="internlm2.5">InternLM 2.5</SelectItem>
              <SelectItem value="jamba">Jamba</SelectItem>
              <SelectItem value="yi-1.5">Yi 1.5</SelectItem>
              <SelectItem value="deepseek-coder-v2">
                Deepseek Coder v2
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full sm:w-16">
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
          : filteredApps.map((app) => {
              const isLocked = (user.data?.subscription_level ?? 0) < app.min_subscription_level;
              return (
                <li
                  key={app.name}
                  className={`rounded-lg border p-4 hover:shadow-md relative ${
                    isLocked ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="mb-8 flex flex-wrap items-center justify-between gap-2">
                    <div className="items-center justify-center rounded-lg bg-muted p-2">
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
                    <div className={isLocked ? 'pointer-events-none opacity-60' : ''}>
                      <CodeViewer model={app} />
                    </div>
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
                    <p className="line-clamp-2 text-sm text-gray-500">
                      {app.tasks[0].count + " Total community finetunes"}
                    </p>
                    <p className="line-clamp-2 text-sm text-gray-500">
                      Inference:
                      {app.vllm_support && (
                        <Badge variant="outline" className="ml-1">
                          vLLM
                          {app.vllm_lora_support && " & LoRA"}
                        </Badge>
                      )}
                    </p>
                  </div>
                  {isLocked && (
                    <div className="absolute bottom-4 right-4">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="cursor-help">
                              <IconLock size={24} className="text-gray-500" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent 
                            side="bottom" 
                            className="z-[9999] text-base p-4 border border-gray-200 shadow-lg rounded-lg bg-popover text-popover-foreground"
                          >
                            <div className="flex flex-col gap-2">
                              <p className="font-medium">Locked model</p>
                              <p className="text-sm text-gray-600">To use this model, contact us on the chat at <a href="https://getflex.ai" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">getflex.ai</a></p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </li>
              );
            })}
      </ul>
    </div>
  );
}
