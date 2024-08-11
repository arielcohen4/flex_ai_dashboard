"use client";
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
  IconCheck,
} from "@tabler/icons-react";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useQuery } from "@tanstack/react-query";
import { Database, Tables, Enums } from "@/lib/types/supabase";
import { Badge } from "@/components/ui/badge";
import { roundToK } from "@/lib/utils";
import { ApiViewer } from "@/components/api-viewer";
import Image from "next/image";
import { familyToLogo } from "@/lib/constant";

const appText = new Map<string, string>([
  ["all", "Family"],
  ["qwen2", "phi3"],
  ["qwen2", "phi3"],
]);

export default function AppContent() {
  const [sort, setSort] = useState("ascending");
  const [appType, setAppType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const endpointsQuery = useQuery({
    queryKey: ["endpoints_count"],
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

  console.log(endpointsQuery.data);

  if (!endpointsQuery.data) {
    return <div>Loading...</div>;
  }

  const filteredApps = endpointsQuery.data
    .sort((a, b) =>
      sort === "ascending"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    )
    .filter((app) => app.name.toLowerCase().includes(searchTerm.toLowerCase()));
  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8 pt-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Serverless Endpoints
        </h1>
        <p className="text-muted-foreground">
          All your serverless endpoints of your finetune models. Pay as you go
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
        {filteredApps.map((app) => (
          <li key={app.name} className="rounded-lg border p-4 hover:shadow-md">
            <div className="mb-8 flex items-center justify-between">
              <div
                className={`items-center justify-center rounded-lg bg-muted p-2`}
              >
                {app.models?.family &&
                familyToLogo.hasOwnProperty(app.models.family) ? (
                  <Image
                    src={`/model_families/${familyToLogo[app.models.family]}`}
                    alt={app.models?.name}
                    width={20}
                    height={20}
                  />
                ) : null}
              </div>
              <Badge variant="secondary">
                {roundToK(app.models?.vllm_context_length ?? 0)} vLLM context
                size
              </Badge>
              <Badge variant="secondary">
                {roundToK(app.models?.params_count ?? 0)}b params
              </Badge>
              <ApiViewer endpoint={app} />
            </div>
            <div>
              <a target="_blank" className="mb-1 font-semibold">
                {app.name.split("_")[1]}
              </a>
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
