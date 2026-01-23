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
import { Card, CardContent } from "@/components/ui/card";

type FileStorage = {
  id: string;
  file_name: string;
  file_type: string;
  size_bytes: number;
  created_at: string;
};

export const columns = ({
  onDelete,
}: {
  onDelete: (id: string) => void;
}): ColumnDef<FileStorage>[] => [
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

      const downloadFile = () => {
        window.open(
          `http://localhost:4000/api/file/${file.id}/download`,
          "_blank",
        );
      };

      const deleteFile = async () => {
        try {
          onDelete(file.id);
        } catch (e) {
          console.error("Error:", e);
        }
      };

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
              <DropdownMenuItem onSelect={downloadFile}>
                Download
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="font-semibold text-red-600 focus:text-red-500"
                onSelect={deleteFile}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="flex h-[80vh] min-w-4xl flex-col">
              <DialogHeader>
                <DialogTitle>{file.file_name}</DialogTitle>
                <DialogDescription>
                  {file.file_type === "doc"
                    ? "This file type can’t be previewed here. Please download to view it."
                    : "Preview"}
                </DialogDescription>
              </DialogHeader>
              {file.file_type === "doc" ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-md border p-6">
                  <p className="text-muted-foreground text-center text-sm">
                    DOC/DOCX preview isn&apos;t supported yet.
                  </p>

                  <Button
                    onClick={() =>
                      window.open(
                        `http://localhost:4000/api/file/${file.id}/download`,
                        "_blank",
                      )
                    }
                  >
                    Download
                  </Button>
                </div>
              ) : (
                <iframe
                  src={`http://localhost:4000/api/file/${file.id}/view`}
                  className="w-full grow rounded-md border"
                />
              )}
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
];
