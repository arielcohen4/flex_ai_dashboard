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
} from "recharts";

export function Overview() {
  const tasksQuery = useQuery({
    queryKey: ["tasks", "dashboard->overview"],
    queryFn: async () => {
      const supabase = supabaseBrowser();
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data, error } = await supabase
          .from("tasks")
          .select("created_at")
          .gte("created_at", thirtyDaysAgo.toISOString())
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error fetching tasks:", error);
          return [];
        }

        // Process data to count tasks per day
        const taskCounts = data.reduce<Record<string, number>>((acc, task) => {
          const date = new Date(task.created_at).toISOString().split("T")[0];
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});

        // Convert to array and fill in missing dates
        const result = [];
        for (
          let d = new Date(thirtyDaysAgo);
          d <= new Date();
          d.setDate(d.getDate() + 1)
        ) {
          const dateStr = d.toISOString().split("T")[0];
          result.push({
            date: dateStr,
            count: taskCounts[dateStr] || 0,
          });
        }

        return result;
      }

      return [];
    },
  });

  console.log(tasksQuery.data);

  if (tasksQuery.isLoading) return <div></div>;
  if (tasksQuery.error) return <div>Error loading data</div>;

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={tasksQuery.data}>
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
          tickFormatter={(value) => Math.round(value).toString()}
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
          formatter={(value) => [`${value} tasks`, "Count"]}
        />
        <Bar
          dataKey="count"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
