"use client";

import ApplicationForm, {
  formSchema,
} from "@/components/forms/application-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

import React from "react";
import { toast } from "sonner";
import z from "zod";

function Application() {
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
          return `Recruiter profile created: ${values} · ${values}`;
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
    <div>
      <Card>
        <CardContent>
          <ApplicationForm onSubmit={onSubmit} onCancel={onCancel} />
        </CardContent>
      </Card>
      <Button
        onClick={(e) => {
          e.preventDefault();
          router.back();
        }}
      >
        Back
      </Button>
    </div>
  );
}

export default Application;
