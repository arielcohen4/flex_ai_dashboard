"use client";
import { tasks } from "@/constants/data/task/tasks";
import { DataTable } from "../data-table/data-table";
import { columns } from "../data-table/columns";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useQuery } from "@tanstack/react-query";

export default function TaskContent() {
	const tasksQuery = useQuery({
		queryKey: ["tasks"],
		queryFn: async () => {
			const supabase = supabaseBrowser();
			const { data } = await supabase.auth.getSession();
			if (data.session?.user) {

				const { data, error } = await supabase.from('tasks').select('*, models(*), datasets(*)');
				return data ?? [];
			}

			return [];
		}
  });

	if (tasksQuery.isLoading) {
		return <div>Loading...</div>;
	}

	console.log(tasksQuery.data);

	return (
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
				<DataTable data={tasksQuery.data || []} columns={columns} />
			</div>
		</div>
	);
}
