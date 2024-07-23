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
      <div className="w-[80px]">{row.original.id.substring(0, 7)}</div>
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
              ? `${row.original.config.num_epochs} / ${row.original.current_epoch}`
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
              ? `${row.original.total_steps} / ${row.original.current_step}`
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
      const status = statuses.find(
        (status) => status.value === row.original.stage
      );

      if (!status) {
        return null;
      }

      return (
        <div className="flex w-[100px] items-center">
          {status.icon && (
            <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{status.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "timeProgress",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Time Progress" />
    ),
    cell: ({ row }) => <TimeProgressCell row={row} />,
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
        <div className="flex space-x-2">
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
