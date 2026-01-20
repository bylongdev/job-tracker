"use client";

import RecruiterForm from "@/components/forms/recruiter-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Separator } from "@/components/ui/separator";
import { FaLinkedin } from "react-icons/fa";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { Recruiter } from "../recruiter.types";
import Link from "next/link";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const formSchema = z.object({
  name: z.string().min(2).max(50),
  role: z.string().min(2).max(50),
  working_at: z.string().min(2).max(50),
  linkedin_url: z.url().optional(),
  email: z.email().optional(),
  phone: z
    .string()
    .min(10, { message: "Must be a valid mobile number" })
    .max(14, { message: "Must be a valid mobile number" })
    .optional(),
  location: z.string().min(2).max(50).optional(),
  note: z.string().optional().optional(),
});

function RecruiterCard({
  recruiter_id,
  job_id,
}: {
  recruiter_id: string | undefined;
  job_id: string;
}) {
  const [recruiter, setRecruiter] = useState<Recruiter>();
  const [id, setID] = useState(recruiter_id);

  useEffect(() => {
    setID(recruiter_id);
  }, [recruiter_id]);

  useEffect(() => {
    if (!id) return;

    try {
      const fetchRecruiter = async () => {
        const res = await fetch(`http://localhost:4000/api/recruiter/${id}`);

        if (!res.ok) {
          console.error("Fetched failed!");
        }

        const data_recruiter = await res.json();
        setRecruiter(data_recruiter);
      };
      fetchRecruiter();
    } catch (e) {
      console.error("Error: ", e);
    }
  }, [id]);

  const updateRecruiterId = async (id: string) => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/job_ads/${job_id}/recruiter`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recruiter_id: id }),
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || err?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      console.log("Updated!", id);

      setID(id);

      return data;
    } catch (e) {
      console.error(`Error: ${e}`);
    }
  };

  const detachRecruiter = async () => {
    const res = await fetch(
      `http://localhost:4000/api/job_ads/${job_id}/recruiter`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recruiter_id: null }),
      },
    );

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.detail || err?.message || `HTTP ${res.status}`);
    }

    setID(undefined);
    setRecruiter(undefined);
    return;
  };

  async function createRecruiter(values: z.infer<typeof formSchema>) {
    const res = await fetch("http://localhost:4000/api/recruiter/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.detail || err?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();

    updateRecruiterId(data.id);

    return data;
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      toast.promise(createRecruiter(values), {
        loading: "Creating recruiter…",
        success: () => {
          return `Recruiter profile created: ${values.name} · ${values.working_at}`;
        },
        error: (e) => e.message,
      });
    } catch (e) {
      console.error("Error:", e);
    }
  }

  return (
    <Card className="h-fit w-fit max-w-xs min-w-2xs">
      <CardHeader className="justify-center">
        <CardTitle className="text-lg font-semibold">Recruiter</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent>
        {recruiter ? (
          <>
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <CardTitle>Name:</CardTitle>
                <CardDescription>{recruiter.name}</CardDescription>
              </div>
              <div className="flex gap-4">
                <CardTitle>Role:</CardTitle>
                <CardDescription>{recruiter.role}</CardDescription>
              </div>
              <div className="flex gap-4">
                <CardTitle>Workplace:</CardTitle>
                <CardDescription>{recruiter.working_at}</CardDescription>
              </div>
              <div className="flex gap-4">
                <CardTitle>Email:</CardTitle>
                <CardDescription>{recruiter.email}</CardDescription>
              </div>
              <div className="flex gap-4">
                <CardTitle>Phone:</CardTitle>
                <CardDescription>{recruiter.phone}</CardDescription>
              </div>

              {/* Social Links */}
              <div className="flex">
                <Link href={recruiter.linkedin_url} target="_blank">
                  <FaLinkedin size={24} />
                </Link>
              </div>

              <div className="flex justify-end">
                <Button
                  variant={"destructive"}
                  onClick={(e) => {
                    e.preventDefault();
                    detachRecruiter();
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant={"icon"}>
                  <User />
                </EmptyMedia>
                <EmptyTitle>No Recruiter Yet</EmptyTitle>
                <EmptyDescription>
                  You haven&apos;t added any recruiter yet.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Add Recruiter</Button>
                  </DialogTrigger>
                  <DialogContent className="w-full">
                    <DialogHeader>
                      <DialogTitle className="flex justify-center">
                        Recruiter Form
                      </DialogTitle>
                    </DialogHeader>
                    <DialogDescription></DialogDescription>
                    <RecruiterForm onSubmit={onSubmit} />
                  </DialogContent>
                </Dialog>
              </EmptyContent>
            </Empty>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RecruiterCard;
