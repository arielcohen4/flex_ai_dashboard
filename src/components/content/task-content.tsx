"use client";
import { DataTable } from "../data-table/data-table";
import { columns } from "../data-table/columns";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import ReduxProvider from "@/lib/store/redux-provider";

export default function TaskContent() {
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const supabase = supabaseBrowser();
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const { data, error } = await supabase
          .from("tasks")
          .select("*, models(*), datasets(*), computes(*)")
          .order("created_at", { ascending: false });
        return data ?? [];
      }

      return [];
    },
  });

  useEffect(() => {
    const supabase = supabaseBrowser();
    const subscription = supabase
      .channel("tasks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        (payload) => {
          console.log("Change received!", payload);
          // Refetch the tasks data
          queryClient.invalidateQueries({ queryKey: ["tasks"] });
        }
      )
      .subscribe();
  }, [queryClient]);

  return (
    <ReduxProvider>
      <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8 pt-6">
        <div className="mb-2 flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of your tasks for this month!
            </p>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          <DataTable
            data={tasksQuery.data || []}
            columns={columns}
            loading={tasksQuery.isLoading}
          />
        </div>
      </div>
    </ReduxProvider>
  );
}
