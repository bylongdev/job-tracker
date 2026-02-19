"use client";

import { JobAdsForm } from "@/components/forms/job-ads-form";
import { formSchema } from "@/utils/schema/job-ad";
import { useRouter } from "next/navigation";

import { toast } from "sonner";
import z from "zod";

async function createJobAd(values: unknown) {
  const res = await fetch("http://localhost:4000/api/job_ads/", {
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

function CreateJobAds() {
  const router = useRouter();

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      toast.promise(createJobAd(values), {
        loading: "Creating job ad…",
        success: () => {
          router.push("/");
          return `Job ad created: ${values.company_name} · ${values.job_title}`;
        },
        error: (e) => e.message,
      });
    } catch (e) {
      console.error("Error:", e);
    }
  }

  function onCancel() {
    router.push("/jobs");
  }

  return (
    <div className="m-auto flex w-4/5 max-w-4xl min-w-xl flex-col justify-center gap-4 py-6">
      <div>
        <h2 className="self-center py-6 text-2xl font-semibold capitalize">
          Job Ads Form
        </h2>
      </div>
      <div className="border border-black/10 p-6 shadow-2xl">
        <JobAdsForm onSubmit={onSubmit} onCancel={onCancel} />
      </div>
    </div>
  );
}

export default CreateJobAds;
