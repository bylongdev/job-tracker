"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useParams, useRouter } from "next/navigation";
import { JobAd } from "../../../../../components/types/job-ads.types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Application } from "@/components/types/application.types";
import { ApplicationTimeline } from "@/components/types/application-timeline.types";

import RecruiterSection from "@/components/recruiter-card";
import ApplicationCard from "@/components/application-card";
import FileCard from "@/components/file-card";
import useFetch from "@/hooks/useFetch";
import { Recruiter } from "@/components/types/recruiter.types";
import { FileType } from "@/components/types/file.types";

import { JobAdsForm } from "@/components/forms/job-ads-form";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { formSchema } from "@/utils/schema/job-ad";
import z from "zod";
import { useState } from "react";

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

// Main
function ViewJob() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [jobAdOpen, setJobAdOpen] = useState(false);

  const { data: job, refetch: refetchJob } = useFetch<JobAd>(
    `http://localhost:4000/api/job_ads/${id}`,
  );

  const appUrl = job?.id
    ? `http://localhost:4000/api/job_ads/${job.id}/application`
    : undefined;

  const recUrl = job?.recruiter_id
    ? `http://localhost:4000/api/recruiter/${job.recruiter_id}`
    : undefined;

  const { data: recruiter } = useFetch<Recruiter>(recUrl);

  const {
    data: application,
    refetch: refetchApp,
    setData: setApplication,
  } = useFetch<Application>(appUrl);

  // Urls base on Application ID
  const timeUrl = application?.id
    ? `http://localhost:4000/api/application/${application.id}/timeline`
    : undefined;

  const { data: timeline, refetch: refetchTimeline } =
    useFetch<ApplicationTimeline[]>(timeUrl);

  const fileUrl = application?.id
    ? `http://localhost:4000/api/application/${application.id}/file`
    : undefined;

  const { data: files, refetch: refetchFiles } = useFetch<FileType[]>(fileUrl);

  const deleteJobHandler = async () => {
    const res = await fetch(`http://localhost:4000/api/job_ads/${id}`, {
      method: "DELETE",
    });

    return res;
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      toast.promise(createJobAd(values), {
        loading: "Creating job ad…",
        success: () => {
          setJobAdOpen(false);
          return `Job ad updated: ${values.company_name} · ${values.job_title}`;
        },
        error: (e) => e.message,
      });
    } catch (e) {
      console.error("Error:", e);
    }
  }

  function onCancel() {
    setJobAdOpen(false);
  }

  return (
    <Card className="mx-auto w-full max-w-7xl shadow-2xl">
      {job ? (
        <>
          <CardHeader>
            <div className="flex justify-between">
              {/* Title */}

              <div className="flex flex-col gap-2">
                <CardTitle className="text-2xl tracking-wide select-text">
                  {job?.job_title}
                </CardTitle>
                <CardDescription className="text-base select-text">
                  {job?.company_name} • {job?.location}
                </CardDescription>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Dialog open={jobAdOpen} onOpenChange={setJobAdOpen}>
                  <DialogTrigger asChild>
                    <Button variant={"outline"}>Edit</Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[80%] overflow-auto">
                    <DialogTitle>
                      {new Date(job.published_at).toLocaleDateString("en-Au", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </DialogTitle>
                    <JobAdsForm
                      onSubmit={onSubmit}
                      onCancel={onCancel}
                      initialData={{
                        company_name: job.company_name,
                        job_title: job.job_title,
                        location: job.location,
                        job_type: job.job_type,
                        job_description: job.job_description,
                        source: job.source,
                        url: job.url,
                        published_at: new Date(job.published_at)
                          .toISOString()
                          .slice(0, 10),
                        expired_at: job.expired_at
                          ? new Date(job.expired_at).toISOString().slice(0, 10)
                          : undefined,
                        skill_requirements: job.skill_requirements,
                        tech_stack: job.tech_stack,
                        salary_min: job.salary_min,
                        salary_max: job.salary_max,
                        note: job.note,
                      }}
                    />
                  </DialogContent>
                </Dialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant={"destructive"}>Delete</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your application from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        variant={"destructive"}
                        onClick={(e) => {
                          e.preventDefault();
                          deleteJobHandler();
                          router.push("/jobs");
                        }}
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex w-full justify-between gap-2 py-4 select-text">
              {/* <div className="bg-card flex grow flex-col items-center gap-4 rounded-sm border p-4 shadow-md">
                <CardDescription>Job Type</CardDescription>
                <CardTitle>{job?.job_title}</CardTitle>
              </div> */}
              <div className="bg-card flex grow flex-col items-center gap-4 rounded-sm border p-4 shadow-md">
                <CardDescription>Work Mode</CardDescription>
                <CardTitle>{job?.job_type}</CardTitle>
              </div>
              <div className="bg-card flex grow flex-col items-center gap-4 rounded-sm border p-4 shadow-md">
                <CardDescription>Salary</CardDescription>
                <CardTitle>
                  ${job?.salary_min} - ${job?.salary_max}
                </CardTitle>
              </div>
              <div className="bg-card flex grow flex-col items-center gap-4 rounded-sm border p-4 shadow-md">
                <CardDescription>Source</CardDescription>
                <CardTitle>{job?.source}</CardTitle>
              </div>
              <div className="bg-card flex grow flex-col items-center gap-4 rounded-sm border p-4 shadow-md">
                <CardDescription>Published</CardDescription>
                <CardTitle>
                  {job?.published_at
                    ? new Date(job.published_at).toLocaleDateString("en-AU", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "-"}
                </CardTitle>
              </div>
              <div className="bg-card flex grow flex-col items-center gap-4 rounded-sm border p-4 shadow-md">
                <CardDescription>Closing</CardDescription>
                <CardTitle>
                  {job?.expired_at
                    ? new Date(job.expired_at).toLocaleDateString("en-AU", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "-"}
                </CardTitle>
              </div>
            </div>
            <div className="flex gap-4">
              <Tabs defaultValue="application" className="grow">
                <TabsList>
                  {/* <TabsTrigger value="overview">Overview</TabsTrigger> */}
                  <TabsTrigger value="application">Application</TabsTrigger>
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="files" disabled={!files}>
                    Files
                  </TabsTrigger>
                </TabsList>

                {/* Content for Application */}
                <TabsContent value="application">
                  <ApplicationCard
                    job={job}
                    application={application}
                    refetchApp={refetchApp}
                    setApplication={setApplication}
                    timeline={timeline}
                    refetchTimeline={refetchTimeline}
                  />
                </TabsContent>

                <TabsContent value="description">
                  <Card>
                    <CardContent>
                      <div
                        className="prose max-w-none select-text"
                        dangerouslySetInnerHTML={{
                          __html: job?.job_description ?? "",
                        }}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="files">
                  <FileCard
                    id={application?.id}
                    fileCol={files}
                    refetchFileCol={refetchFiles}
                  />
                </TabsContent>
              </Tabs>
              <RecruiterSection
                job_id={id}
                recruiter={recruiter}
                refetchJob={refetchJob}
              />
            </div>
          </CardContent>
        </>
      ) : (
        <></>
      )}
    </Card>
  );
}

export default ViewJob;
