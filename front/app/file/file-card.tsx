import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import React, { useState } from "react";

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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from "@/components/ui/empty";

const MAX_MB = 5;
const MAX_BYTES = MAX_MB * 1024 * 1024;

type FileType = {
  id: string;
  category: string;
  file_name: string;
  file_type: string;
  source: string;
  size_bytes: number;
  created_at: string;
};

function FileCard({
  id,
  fileCol,
  refetchFileCol,
}: {
  id?: string;
  fileCol: FileType[] | null;
  refetchFileCol: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [openFileId, setOpenFileId] = useState<string | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;

    if (!selected) return;

    if (selected.size > MAX_BYTES) {
      e.currentTarget.value = "";
      return;
    }
    setFile(selected);
  };

  const onUpload = async (category: string) => {
    if (!id) return;
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);
    fd.append("source", "manual");
    fd.append("category", category);

    try {
      const res = await fetch(
        `http://localhost:4000/api/application/${id}/file/upload`,
        {
          method: "POST",
          body: fd,
        },
      );

      if (!res.ok) throw new Error("Upload failed");
      setFile(null);
      refetchFileCol();
    } catch (e) {
      console.error(e);
    }
  };

  const onDelete = async (fileId: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/file/${fileId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed!");

      refetchFileCol();
    } catch (e) {
      console.error("Error:", e);
    }
  };

  const files = [
    {
      value: "resume",
      trigger: "Resume",
      content: fileCol?.filter(
        (file) => file.category.toLowerCase() == "resume",
      ),
    },
    {
      value: "cover_letter",
      trigger: "Cover Letter",
      content: fileCol?.filter(
        (file) => file.category.toLowerCase() == "cover_letter",
      ),
    },
    {
      value: "other",
      trigger: "Others",
      content: fileCol?.filter(
        (file) => file.category.toLowerCase() == "other",
      ),
    },
  ];

  return (
    <Card>
      <CardContent>
        <Accordion type="single" defaultValue="resume" className="">
          {files.map((file) => (
            <AccordionItem value={file.value} key={file.value}>
              <AccordionTrigger>{file.trigger}</AccordionTrigger>
              <AccordionContent>
                {file.content && file.content.length > 0 ? (
                  <div>
                    <div className="flex gap-6">
                      {file.content.map((file) => (
                        <div key={file.id} className="group">
                          <Dialog
                            open={openFileId === file.id}
                            onOpenChange={(isOpen) =>
                              setOpenFileId(isOpen ? file.id : null)
                            }
                          >
                            <DialogContent className="flex h-[80vh] min-w-4xl flex-col">
                              <DialogHeader>
                                <DialogTitle>{file.file_name}</DialogTitle>
                                <DialogDescription>
                                  {file.file_type === "doc"
                                    ? "This file type can't be previewed here. Please download to view it."
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
                          <Card
                            key={file.id}
                            className="bg-muted group-hover:bg-muted-foreground/30 group-hover:cursor-pointer"
                            onClick={() => {
                              setOpenFileId(file.id);
                            }}
                          >
                            <CardContent className="flex flex-col items-start">
                              <p>
                                <strong>File:</strong> {file.file_name}
                              </p>
                              <p>
                                <strong>Type:</strong> {file.file_type}
                              </p>
                              <p>
                                <strong>Size:</strong>{" "}
                                {(file.size_bytes / 1024).toFixed(2)} KB
                              </p>
                              <Button
                                onClick={() => onDelete(file.id)}
                                variant="destructive"
                                className="mt-4 w-fit cursor-pointer self-end"
                              >
                                Delete
                              </Button>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                    {file.value == "other" && (
                      <div className="flex justify-end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              className="mt-6"
                              disabled={
                                file.content.filter(
                                  (file) =>
                                    file.category.toLowerCase() === "other",
                                ).length <= 3
                              }
                            >
                              Upload
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Upload File</DialogTitle>
                              <DialogDescription></DialogDescription>
                            </DialogHeader>
                            <Field>
                              <div className="flex gap-2">
                                <Input
                                  id="file"
                                  type="file"
                                  onChange={onFileChange}
                                />
                                <DialogTrigger asChild>
                                  <Button
                                    onClick={() =>
                                      onUpload(file.value.toUpperCase())
                                    }
                                    disabled={!file}
                                  >
                                    Upload
                                  </Button>
                                </DialogTrigger>
                              </div>
                              <FieldDescription>
                                Select a file to upload.
                              </FieldDescription>
                            </Field>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                ) : (
                  <Empty>
                    <EmptyContent>
                      <EmptyTitle>
                        No {file.trigger.toLowerCase()} uploaded yet
                      </EmptyTitle>
                      <EmptyDescription>
                        Add your {file.trigger.toLowerCase()} here to keep track
                        of what you sent for this role.
                      </EmptyDescription>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="mt-6">
                            Upload {file.trigger.toLowerCase()}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Upload File</DialogTitle>
                            <DialogDescription></DialogDescription>
                          </DialogHeader>
                          <Field>
                            <div className="flex gap-2">
                              <Input
                                id="file"
                                type="file"
                                onChange={onFileChange}
                              />
                              <DialogTrigger asChild>
                                <Button
                                  onClick={() =>
                                    onUpload(file.value.toUpperCase())
                                  }
                                  disabled={!file}
                                >
                                  Upload
                                </Button>
                              </DialogTrigger>
                            </div>
                            <FieldDescription>
                              Select a file to upload.
                            </FieldDescription>
                          </Field>
                        </DialogContent>
                      </Dialog>
                    </EmptyContent>
                  </Empty>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}

export default FileCard;
