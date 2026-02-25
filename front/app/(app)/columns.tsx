"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
type JobAds = {
  id: string;
  company_name: string;
  job_title: string;
  location: string;
  job_type:
    | ["Full-time", "Part-time", "Casual", "Contract", "Internship"]
    | string;
  source: string;
  published_at: string;
};

export const columns = ({
  onView,
  onEdit,
  onDelete,
}: {
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}): ColumnDef<JobAds>[] => [
  {
    accessorKey: "company_name",
    header: "Company Name",
  },
  {
    accessorKey: "job_title",
    header: "Job Title",
  },
  {
    accessorKey: "published_at",
    header: "Published At",
    cell: ({ row }) => {
      const publised_at = row.original.published_at;
      const formattedDate = new Date(publised_at).toLocaleDateString("en-AU", {
        dateStyle: "long",
      });
      return formattedDate;
    },
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "job_type",
    header: "Job Type",
  },
  {
    accessorKey: "source",
    header: "Source",
  },
  {
    accessorKey: "actions",
    header: "",
    cell: ({ row }) => {
      const job = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(job.id)}>
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(job.id)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-500"
              onClick={() => onDelete(job.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
