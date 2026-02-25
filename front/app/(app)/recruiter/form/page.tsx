"use client";

import RecruiterForm from "@/components/forms/recruiter-form";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({
  name: z.string().min(2).max(50),
  role: z.string().min(2).max(50),
  working_at: z.string().min(2).max(50),
  linkedin_url: z.string().optional(),
  email: z.email().optional(),
  phone: z
    .string()
    .min(10, { message: "Must be a valid mobile number" })
    .max(14, { message: "Must be a valid mobile number" })
    .optional(),
  location: z.string().min(2).max(50).optional(),
  note: z.string().optional().optional(),
});

function CreateRecruiter() {
  const router = useRouter();

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

    return res.json();
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      toast.promise(createRecruiter(values), {
        loading: "Creating recruiter…",
        success: () => {
          router.push("/");
          return `Recruiter profile created: ${values.name} · ${values.working_at}`;
        },
        error: (e) => e.message,
      });
    } catch (e) {
      console.error("Error:", e);
    }
  }

  const onCancel = () => {
    router.push("/jobs");
  };

  return (
    <div className="m-auto flex w-4/5 max-w-4xl min-w-xl flex-col justify-center gap-4 py-6">
      <div>
        <h2 className="self-center py-6 text-2xl font-semibold capitalize">
          Recruiter Form
        </h2>
      </div>
      <div className="border border-black/10 p-6 shadow-2xl">
        <RecruiterForm onSubmit={onSubmit} onSuccess={onCancel} />
      </div>
    </div>
  );
}

export default CreateRecruiter;
