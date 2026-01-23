"use client";

import { ColumnDef } from "@tanstack/react-table";
import { filesize } from "filesize";
import { formatDistanceToNowStrict } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

type FileStorage = {
  id: string;
  file_name: string;
  file_type: string;
  size_bytes: number;
  created_at: string;
};

export const columns = ({}): ColumnDef<FileStorage>[] => [
  {
    accessorKey: "file_name",
    header: "File Name",
  },
  {
    accessorKey: "file_type",
    header: "Type",
  },
  {
    accessorKey: "size_bytes",
    header: "Size",
    cell: ({ row }) => {
      const size = row.original.size_bytes;
      const convertedSize = filesize(Number(size));

      return convertedSize;
    },
  },
  {
    accessorKey: "created_at",
    header: "Uploaded",
    cell: ({ row }) => {
      const created_at = row.original.created_at;

      const formattedDate = formatDistanceToNowStrict(new Date(created_at), {
        addSuffix: true,
      });

      return formattedDate;
    },
  },
  {
    accessorKey: "actions",
    header: "",
    cell: ({ row }) => {
      const file = row.original;

      const [open, setOpen] = useState(false);

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setOpen(true)}>
                View
              </DropdownMenuItem>
              {/* <DropdownMenuItem>Edit</DropdownMenuItem> */}
              <DropdownMenuItem>Download</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="font-semibold text-red-600 focus:text-red-500">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{file.file_name}</DialogTitle>
                <DialogDescription></DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
];
