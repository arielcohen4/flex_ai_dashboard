"use client";

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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tag,
  Users,
  Settings,
  Bookmark,
  SquarePen,
  BookCheck,
  LayoutGrid,
  LucideIcon,
  Brain,
  KeyRound,
  ShieldAlert,
  Grid2X2,
  ScrollText,
  SquareArrowOutUpRightIcon,
  CircleFadingPlusIcon,
  NetworkIcon,
  BarChart,
  MessageSquare,
} from "lucide-react";

export default function DashboardContent() {
  const tasksCountQuery = useQuery({
    queryKey: ["tasks", "dashboard-content"],
    queryFn: async () => {
      const supabase = supabaseBrowser();
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const { data, error } = await supabase.from("tasks").select("*");
        return data;
      }
    },
  });

  const datasetsCountQuery = useQuery({
    queryKey: ["datasets", "dashboard-content"],
    queryFn: async () => {
      const supabase = supabaseBrowser();
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const { data, error } = await supabase
          .from("datasets")
          .select("*")
          .eq("is_archived", false);
        return data;
      }
    },
  });

  const checkpointsCountQuery = useQuery({
    queryKey: ["checkpoints", "dashboard-content"],
    queryFn: async () => {
      const supabase = supabaseBrowser();
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const { data, error } = await supabase.from("checkpoints").select("*");
        return data;
      }
    },
  });

  const endpointsCountQuery = useQuery({
    queryKey: ["endpoints", "dashboard-content"],
    queryFn: async () => {
      const supabase = supabaseBrowser();
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const { data, error } = await supabase
          .from("endpoints")
          .select("*")
          .eq("is_archived", false);
        return data;
      }
    },
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8 pt-6">
      <div className="flex flex-wrap items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        {/* <div className="flex flex-wrap items-center space-x-2">
          <CalendarDateRangePicker />
          <Button>Download</Button>
        </div> */}
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
                <BookCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {tasksCountQuery.isLoading ? (
                  <Skeleton className="h-8 w-[100px] animate-pulse" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {tasksCountQuery.data?.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +{tasksCountQuery.data?.length} from last month
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Datasets</CardTitle>
                <Grid2X2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {datasetsCountQuery.isLoading ? (
                  <Skeleton className="h-8 w-[100px] animate-pulse" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {datasetsCountQuery.data?.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +{datasetsCountQuery.data?.length} from last month
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Checkpoints
                </CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {checkpointsCountQuery.isLoading ? (
                  <Skeleton className="h-8 w-[100px] animate-pulse" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {checkpointsCountQuery.data?.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +{checkpointsCountQuery.data?.length} from last month
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Endpoints</CardTitle>
                <NetworkIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {endpointsCountQuery.isLoading ? (
                  <Skeleton className="h-8 w-[100px] animate-pulse" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {endpointsCountQuery.data?.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +{endpointsCountQuery.data?.length} since last month
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Usage</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            <Card className="col-span-3 overflow-x-auto">
              <CardHeader>
                <CardTitle>Recent Tasks</CardTitle>
                <CardDescription>
                  {tasksCountQuery.isLoading ? (
                    <Skeleton className="h-4 w-[200px] animate-pulse" />
                  ) : (
                    `You made ${tasksCountQuery.data?.length} tasks this month.`
                  )}
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
