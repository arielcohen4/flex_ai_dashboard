"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabaseBrowser } from "@/lib/supabase/browser";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, NetworkIcon } from "lucide-react";
import { CalendarDateRangePicker } from "./dashboard/date-range-picker";
import { SpendOverview } from "./dashboard/SpendOverview";
import { addDays, startOfDay, endOfDay, subDays, subMonths } from "date-fns";

export type DateRange = {
  from: Date;
  to: Date;
};

const UsageContent = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });

  // Query for fine-tuning costs
  const fineTuningQuery = useQuery({
    queryKey: ["tasks", "usage", dateRange],
    queryFn: async () => {
      const supabase = supabaseBrowser();
      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData.session?.user) {
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .not("cost", "is", null)
          .gte("created_at", startOfDay(dateRange?.from).toISOString())
          .lte("created_at", endOfDay(dateRange?.to).toISOString());

        if (error) throw error;
        return data;
      }
    },
  });

  // Query for inference costs
  const inferenceQuery = useQuery({
    queryKey: ["endpoints_sessions", "usage", dateRange],
    queryFn: async () => {
      const supabase = supabaseBrowser();
      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData.session?.user) {
        const { data, error } = await supabase
          .from("endpoints_sessions")
          .select("*")
          .gte("start_time", startOfDay(dateRange.from).toISOString())
          .lte("start_time", endOfDay(dateRange.to).toISOString());

        console.log(data);
        if (error) throw error;
        return data;
      }
    },
  });

  const handleDateRangeChange = (range: any) => {
    setDateRange(range);
  };

  const handleQuickDateSelect = (value: string) => {
    const today = new Date();
    switch (value) {
      case "last-day":
        setDateRange({ from: subDays(today, 1), to: today });
        break;
      case "last-week":
        setDateRange({ from: subDays(today, 7), to: today });
        break;
      case "last-month":
        setDateRange({ from: subMonths(today, 1), to: today });
        break;
    }
  };

  const calculateTotalCost = (data: any) => {
    return (
      data?.reduce((sum: number, item: any) => sum + (item.cost || 0), 0) || 0
    );
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8 pt-6">
      <div className="flex flex-wrap items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Usage</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            onValueChange={handleQuickDateSelect}
            defaultValue="last-week"
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-day">Last 24 Hours</SelectItem>
              <SelectItem value="last-week">Last 7 Days</SelectItem>
              <SelectItem value="last-month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <CalendarDateRangePicker
            dateRange={dateRange}
            setDateRange={(range: DateRange) => range && setDateRange(range)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Fine-Tuning Spend
            </CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {fineTuningQuery.isLoading ? (
              <Skeleton className="h-8 w-[100px] animate-pulse" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  ${calculateTotalCost(fineTuningQuery.data).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {fineTuningQuery.data?.length || 0} fine-tuning tasks
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inference Spend
            </CardTitle>
            <NetworkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {inferenceQuery.isLoading ? (
              <Skeleton className="h-8 w-[100px] animate-pulse" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  ${calculateTotalCost(inferenceQuery.data).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {inferenceQuery.data?.length || 0} inference sessions
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Spend Overview</CardTitle>
          <CardDescription>
            Daily cost breakdown for fine-tuning tasks and inference
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <SpendOverview dateRange={dateRange} />
        </CardContent>
      </Card>
    </div>
  );
};

export default UsageContent;
