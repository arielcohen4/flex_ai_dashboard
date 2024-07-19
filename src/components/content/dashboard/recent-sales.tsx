import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useQuery } from "@tanstack/react-query";

export function RecentSales() {
	const tasksQuery = useQuery({
    queryKey: ["tasks_sorted"],
    queryFn: async () => {
      const supabase = supabaseBrowser();
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const { data, error } = await supabase.from('tasks').select('*, models(*), datasets(*)').order('created_at', { ascending: false });
        return data ?? [];
      }

			return [];
    }
  });

	console.log(tasksQuery.data);
	
	return (
		<div className="space-y-8">
			{tasksQuery.data?.slice(-5).map((task) => (
				<div key={task.id} className="flex items-center">
					<Avatar className="h-9 w-9">
						<AvatarImage src="/avatars/01.png" alt="Avatar" />
						<AvatarFallback>OM</AvatarFallback>
					</Avatar>
					<div className="ml-4 space-y-1">
						<p className="text-sm font-medium leading-none">{task.name}</p>
						<p className="text-sm text-muted-foreground">{task.models?.name}</p>
					</div>
					<div className="ml-auto font-medium">{task.datasets?.total_tokens} Tokens</div>
				</div>
			))}
		</div>
	);
}
