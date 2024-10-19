import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { labels, priorities, statuses } from "@/constants/data/task/data";
import { roundToK } from "@/lib/utils";
import { TaskWithRelations } from "@/lib/types";
import { TimeProgressCell } from "./TimeProgressCell";
import { PriceEstimationCell } from "./PriceEstimationCell";
import Image from "next/image";
import { familyToLogo } from "@/lib/constant";
import { Progress } from "@/components/ui/progress";

// Define a type for stage colors
type StageColorMap = {
  [key: string]: string;
};

// Define colors for each stage
const stageColors: StageColorMap = {
  DOWNLOADING_MODEL: "bg-blue-500",
  DOWNLOADING_DATA: "bg-purple-500",
  TRAINING: "bg-yellow-500",
  COMPLETED: "bg-green-500",
  ERRORED: "bg-red-500",
  PENDING: "bg-gray-500",
  CANCELED: "bg-orange-500",
};

export const columns: ColumnDef<TaskWithRelations>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Task" />
    ),
    cell: ({ row }) => (
      <div
        className="w-[80px] cursor-pointer hover:text-blue-500"
        title="Click to copy full ID"
        onClick={() => {
          navigator.clipboard.writeText(row.original.id);
          // Optionally, you can add a visual feedback here, like a tooltip
        }}
      >
        {row.original.id.substring(0, 7)}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.created_at);

      // Format the date
      // Format the date
      const options: Intl.DateTimeFormatOptions = {
        year: "2-digit",
        month: "numeric",
        day: "numeric",
      };
      const formattedDate =
        date.toLocaleDateString("en-US", options) +
        " " +
        date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });

      return (
        <div className="flex space-x-2">
          <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
            {formattedDate}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <a className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
            {row.original?.name}
          </a>
        </div>
      );
    },
  },
  {
    accessorKey: "epochs",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Epochs" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
            {row.original.current_epoch &&
            row.original.config &&
            typeof row.original.config === "object" &&
            "num_epochs" in row.original.config
              ? `${row.original.current_epoch}/${row.original.config.num_epochs}`
              : ""}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "steps",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Steps" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
            {row.original.current_step
              ? `${row.original.current_step}/${row.original.total_steps}`
              : ""}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stage" />
    ),
    cell: ({ row }) => {
      const stage = row.original.stage as keyof typeof stageColors;
      const color = stageColors[stage] || "bg-gray-500";

      return (
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${color}`}></div>
          <span className="text-sm font-medium">{stage}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "progress",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Time Progress" />
    ),
    cell: ({ row }) => {
      const progress = row.original.current_step
        ? (row.original.current_step / row.original.total_steps) * 100
        : 0;
      return (
        <div className="w-[100px]">
          <TimeProgressCell row={row} />
          <Progress value={progress} className="w-full mt-1" />
          <span className="text-xs text-muted-foreground">
            {progress.toFixed(1)}%
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estimation $" />
    ),
    cell: ({ row }) => <PriceEstimationCell row={row} />,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "model",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Model" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-2">
          <div
            className={`items-center justify-center rounded-lg bg-muted p-1`}
          >
            {row.original?.models?.family &&
            familyToLogo.hasOwnProperty(row.original.models.family) ? (
              <Image
                src={`/model_families/${
                  familyToLogo[row.original.models.family]
                }`}
                alt={row.original.models.name}
                width={10}
                height={10}
              />
            ) : null}
          </div>
          <a className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
            {row.original.models?.name}
          </a>
        </div>
      );
    },
  },
  {
    accessorKey: "dataset",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Dataset" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <a className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
            {`${row.original.datasets?.name}`}
          </a>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
