import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskWithRelations } from "@/lib/types";

export function RecentSales() {
  const tasksQuery = useQuery({
    queryKey: ["tasks_sorted"],
    queryFn: async () => {
      const supabase = supabaseBrowser();
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const { data, error } = await supabase
          .from("tasks")
          .select("*, models(*), datasets(*)")
          .order("created_at", { ascending: false });
        return data ?? [];
      }

      return [];
    },
  });

  const isLoading = tasksQuery.isLoading;
  const tasks = tasksQuery.data ?? [];

  const SkeletonItem = () => (
    <div className="flex items-center">
      <Skeleton className="h-9 w-9 rounded-full" />
      <div className="ml-4 space-y-1">
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-4 w-[100px]" />
      </div>
      <Skeleton className="h-4 w-[50px] ml-auto" />
    </div>
  );

  const TaskItem = ({ task }: { task: TaskWithRelations }) => (
    <div className="flex items-center">
      <Avatar className="h-9 w-9">
        <AvatarImage src="/avatars/01.png" alt="Avatar" />
        <AvatarFallback>OM</AvatarFallback>
      </Avatar>
      <div className="ml-4 space-y-1">
        <p className="text-sm font-medium leading-none">{task.name}</p>
        <p className="text-sm text-muted-foreground">{task.models?.name}</p>
      </div>
      <div className="ml-auto font-medium">
        {task.datasets?.total_tokens} Tokens
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {isLoading || tasks.length === 0
        ? Array(5)
            .fill(0)
            .map((_, index) => <SkeletonItem key={index} />)
        : tasks
            .slice(0, 5)
            .map((task) => <TaskItem key={task.id} task={task} />)}
    </div>
  );
}
