"use client"

import Link from "next/link";
import Image from "next/image";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { CalendarDateRangePicker } from "./dashboard/date-range-picker";
import { RecentSales } from "./dashboard/recent-sales";
import { Overview } from "./dashboard/overview";
import { useQuery } from "@tanstack/react-query";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function DashboardContent() {
	const tasksCountQuery = useQuery({
    queryKey: ["tasks_count"],
    queryFn: async () => {
      const supabase = supabaseBrowser();
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const { data, error } = await supabase.from('tasks').select('*');
        return data;
      }
    }
  });

	const datasetsCountQuery = useQuery({
    queryKey: ["datasets_count"],
    queryFn: async () => {
      const supabase = supabaseBrowser();
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const { data, error } = await supabase.from('datasets').select('*');
        return data;
      }
    }
  });

	const checkpointsCountQuery = useQuery({
    queryKey: ["checkpoints_count"],
    queryFn: async () => {
      const supabase = supabaseBrowser();
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const { data, error } = await supabase.from('checkpoints').select('*');
        return data;
      }
    }
  });

	const modelsCountQuery = useQuery({
    queryKey: ["models_count"],
    queryFn: async () => {
      const supabase = supabaseBrowser();
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const { data, error } = await supabase.from('models').select('*');
        return data;
      }
    }
  });


	console.log(tasksCountQuery.data)


	return (
		<div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8 pt-6">
			<div className="flex flex-wrap items-center justify-between space-y-2">
				<h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
				<div className="flex flex-wrap items-center space-x-2">
					<CalendarDateRangePicker />
					<Button>Download</Button>
				</div>
			</div>
			<Tabs defaultValue="overview" className="space-y-4">
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="analytics" disabled>
						Analytics
					</TabsTrigger>
					<TabsTrigger value="reports" disabled>
						Reports
					</TabsTrigger>
					<TabsTrigger value="notifications" disabled>
						Notifications
					</TabsTrigger>
				</TabsList>
				<TabsContent value="overview" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<Card className="overflow-hidden">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Total Tasks
								</CardTitle>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									className="h-4 w-4 text-muted-foreground"
								>
									<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
								</svg>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{tasksCountQuery.data?.length}</div>
								<p className="text-xs text-muted-foreground">
									+20.1% from last month
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Datasets
								</CardTitle>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									className="h-4 w-4 text-muted-foreground"
								>
									<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
									<circle cx="9" cy="7" r="4" />
									<path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
								</svg>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{datasetsCountQuery.data?.length}</div>
								<p className="text-xs text-muted-foreground">
									+180.1% from last month
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Checkpoints</CardTitle>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									className="h-4 w-4 text-muted-foreground"
								>
									<rect width="20" height="14" x="2" y="5" rx="2" />
									<path d="M2 10h20" />
								</svg>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{checkpointsCountQuery.data?.length}</div>
								<p className="text-xs text-muted-foreground">
									+19% from last month
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Supported Models
								</CardTitle>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									className="h-4 w-4 text-muted-foreground"
								>
									<path d="M22 12h-4l-3 9L9 3l-3 9H2" />
								</svg>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">+{modelsCountQuery.data?.length}</div>
								<p className="text-xs text-muted-foreground">
									+201 since last hour
								</p>
							</CardContent>
						</Card>
					</div>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
						<Card className="col-span-4">
							<CardHeader>
								<CardTitle>Overview</CardTitle>
							</CardHeader>
							<CardContent className="pl-2">
								<Overview />
							</CardContent>
						</Card>
						<Card className="col-span-3 overflow-x-auto">
							<CardHeader>
								<CardTitle>Recent Tasks</CardTitle>
								<CardDescription>
									You made {tasksCountQuery.data?.length} tasks this month.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<RecentSales />
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
