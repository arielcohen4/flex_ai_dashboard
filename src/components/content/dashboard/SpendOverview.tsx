import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabaseBrowser } from "@/lib/supabase/browser";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { startOfDay, endOfDay, eachDayOfInterval } from "date-fns";

export function SpendOverview({
  dateRange,
}: {
  dateRange: { from: Date; to: Date };
}) {
  const spendQuery = useQuery({
    queryKey: ["spend", "overview", dateRange],
    queryFn: async () => {
      const supabase = supabaseBrowser();
      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData.session?.user) {
        // Fetch fine-tuning tasks
        const { data: tasks } = await supabase
          .from("tasks")
          .select("*")
          .not("cost", "is", null)
          .gte("created_at", startOfDay(dateRange.from).toISOString())
          .lte("created_at", endOfDay(dateRange.to).toISOString());

        // Fetch inference sessions
        const { data: sessions } = await supabase
          .from("endpoints_sessions")
          .select("*")
          .not("cost", "is", null)
          .gte("start_time", startOfDay(dateRange.from).toISOString())
          .lte("start_time", endOfDay(dateRange.to).toISOString());

        // Generate date range
        const dates = eachDayOfInterval({
          start: dateRange.from,
          end: dateRange.to,
        });

        // Process data
        return dates.map((date) => {
          const dateStr = date.toISOString().split("T")[0];

          const inferenceSpend = sessions?.reduce((sum, session) => {
            if (session.start_time.startsWith(dateStr)) {
              return sum + (session.cost || 0);
            }
            return sum;
          }, 0);

          const taskSpend = tasks?.reduce((sum, task) => {
            if (task.created_at.startsWith(dateStr)) {
              return sum + (task.cost || 0);
            }
            return sum;
          }, 0);

          return {
            date: dateStr,
            inference: inferenceSpend || 0,
            tasks: taskSpend || 0,
          };
        });
      }
      return [];
    },
  });

  if (spendQuery.error) return <div>Error loading data</div>;

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={spendQuery.data}>
        <XAxis
          dataKey="date"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) =>
            new Date(value).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          }
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value.toFixed(2)}`}
        />
        <Tooltip
          labelFormatter={(label) =>
            new Date(label).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          }
          formatter={(value, name) => [
            `$${typeof value === "number" ? value.toFixed(2) : value}`,
            name,
          ]}
        />
        <Legend />
        <Bar
          dataKey="inference"
          fill="#8884d8"
          stackId="stack"
          name="Inference"
        />
        <Bar
          dataKey="tasks"
          fill="#82ca9d"
          stackId="stack"
          name="Fine-tuning Tasks"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
