import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { DataTable } from "../data-table";
import { columns } from "./columns";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription } from "@/components/ui/field";

const MAX_MB = 5;
const MAX_BYTES = MAX_MB * 1024 * 1024;

type FileType = {
  id: string;
  file_name: string;
  file_type: string;
  source: string;
  size_bytes: number;
  created_at: string;
};

async function fetchFileCol(id: string) {
  try {
    const res = await fetch(`http://localhost:4000/api/application/${id}/file`);

    if (!res.ok) throw new Error("Fetched failed!");

    const data = await res.json();

    return data;
  } catch (e) {
    console.error(e);
  }
}

function FileCard({ id }: { id?: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [fileCol, setFileCol] = useState<FileType[]>([]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;

    if (!selected) return;

    if (selected.size > MAX_BYTES) {
      e.currentTarget.value = "";
      return;
    }
    setFile(selected);
  };

  const onUpload = async () => {
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);
    fd.append("source", "manual");

    try {
      const res = await fetch(
        `http://localhost:4000/api/application/${id}/file/upload`,
        {
          method: "POST",
          body: fd,
        },
      );

      if (!res.ok) throw new Error("Upload failed");

      const fData = await fetchFileCol(id || "");
      setFileCol(fData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const data = await fetchFileCol(id);
      setFileCol(data);
    };

    fetch();
  }, [id]);

  const onDelete = async (fileId: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/file/${fileId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed!");

      const fData = await fetchFileCol(id || "");
      setFileCol(fData);
    } catch (e) {
      console.error("Error:", e);
    }
  };

  return (
    <Card>
      <CardHeader className="flex justify-end">
        <Dialog>
          {fileCol.length >= 2 ? (
            <div className="flex items-center justify-center gap-2">
              <DialogDescription className="text-destructive text-base">
                File limit is reached! (2/2)
              </DialogDescription>
              <DialogTrigger asChild>
                <Button disabled>Upload</Button>
              </DialogTrigger>
            </div>
          ) : (
            <DialogTrigger asChild>
              <Button>Upload</Button>
            </DialogTrigger>
          )}
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload File</DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <Field>
              <div className="flex gap-2">
                <Input id="file" type="file" onChange={onFileChange} />
                <DialogTrigger asChild>
                  <Button onClick={onUpload} disabled={!file}>
                    Upload
                  </Button>
                </DialogTrigger>
              </div>
              <FieldDescription>Select a file to upload.</FieldDescription>
            </Field>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns({ onDelete: (id: string) => onDelete(id) })}
          data={fileCol}
        />
      </CardContent>
    </Card>
  );
}

export default FileCard;
