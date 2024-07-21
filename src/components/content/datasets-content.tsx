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
} from "@tabler/icons-react";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { roundToK } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { format } from "date-fns";

const appText = new Map<string, string>([
  ["all", "All Types"],
  ["instruction", "Instruction"],
  ["chat", "Chat"],
  ["text", "Text"],
]);

export default function AppContent() {
  const [sort, setSort] = useState("ascending");
  const [appType, setAppType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const datasetsQuery = useQuery({
    queryKey: ["datasets"],
    queryFn: async () => {
      const supabase = supabaseBrowser();
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const { data } = await supabase
          .from("datasets")
          .select("*")
          .order("created_at", { ascending: false });
        return data;
      }
    },
  });

  if (!datasetsQuery.data) {
    return <div>Loading...</div>;
  }

  const filteredApps = datasetsQuery.data
    .filter((app) => appType === "all" || appType === app.type)
    .filter((app) => app.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8 pt-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Datasets</h1>
        <p className="text-muted-foreground">View all your datasets</p>
      </div>
      <div className="my-4 flex items-end justify-between sm:my-0 sm:items-center">
        <div className="flex flex-col gap-4 sm:my-4 sm:flex-row">
          <Input
            placeholder="Filter datasets..."
            className="h-9 w-40 lg:w-[250px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={appType} onValueChange={setAppType}>
            <SelectTrigger className="w-36">
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
      <ul className="grid gap-4 pb-16 pt-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredApps.map((app) => (
          <li key={app.name} className="rounded-lg border p-4 hover:shadow-md">
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <a className="text-xl font-semibold">{app.name}</a>
                <span className="text-sm text-gray-500">
                  {format(new Date(app.created_at), "MMM dd, yyyy")}
                </span>
              </div>
              <p className="text-gray-500 text-xs">{app.id}</p>
            </div>
            <div className="space-y-2">
              <Badge variant="secondary">{app.type}</Badge>
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
          </li>
        ))}
      </ul>
    </div>
  );
}
