"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { JobAd } from "../../job-ads.types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dot, FileQuestionMark } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import RecruiterSection from "@/app/recruiter/form/recruiter-card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

function ViewJob() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<JobAd>();
  const [application, setApplication] = useState<JobAd>();

  const router = useRouter();

  useEffect(() => {
    try {
      const fetchJobAds = async () => {
        const res = await fetch(`http://localhost:4000/api/job_ads/${id}`);

        if (!res.ok) {
          throw new Error("Fetched failed!");
        }

        const data = await res.json();
        setJob(data);
      };
      fetchJobAds();
    } catch (e) {
      console.error("Error: ", e);
    }
  }, [id]);

  useEffect(() => {
    if (!job) return;
    if (!job.application_id) return;

    try {
      const id = job.application_id;
      const fetchApplication = async () => {
        const res = await fetch(`http://localhost:4000/api/application/${id}`);

        if (!res.ok) {
          throw new Error("Fetched failed!");
        }

        const data = await res.json();

        setApplication(data);
      };
      fetchApplication();
    } catch (e) {
      console.error("Error: ", e);
    }
  });

  return (
    <Card className="shadow-2xl">
      <CardHeader>
        <div className="flex justify-between">
          {/* Title */}

          <div className="flex flex-col gap-2">
            <CardTitle>{job?.job_title}</CardTitle>
            <CardDescription>
              {job?.company_name} • {job?.location}
            </CardDescription>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button variant={"outline"}>Edit</Button>
            <Button variant={"destructive"}>Delete</Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex w-full justify-between gap-2 py-4">
          <div className="bg-card flex grow flex-col items-center gap-4 rounded-sm border p-4 shadow-md">
            <CardDescription>Job Type</CardDescription>
            <CardTitle>{job?.job_title}</CardTitle>
          </div>
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
              <TabsTrigger value="files">Files</TabsTrigger>
            </TabsList>

            {/* Content for Application */}
            <TabsContent value="application">
              {application ? (
                <Card className="h-full">
                  <CardContent className="flex flex-col gap-8">
                    <div className="flex grow justify-around rounded-sm border shadow-md">
                      <div className="flex grow flex-col items-center not-last:border-r">
                        <div className="bg-muted flex w-full justify-center border-b p-2">
                          <h3>Status</h3>
                        </div>
                        <div className="flex w-full grow items-center justify-center py-6">
                          <div>Applied</div>
                        </div>
                      </div>
                      <div className="flex grow flex-col items-center not-last:border-r">
                        <div className="bg-muted flex w-full justify-center border-b p-2">
                          <h3>Next Step</h3>
                        </div>
                        <div className="flex w-full grow items-center justify-center py-6">
                          <div>Phone Screening</div>
                        </div>
                      </div>
                      <div className="flex grow flex-col items-center not-last:border-r">
                        <div className="bg-muted flex w-full justify-center border-b p-2">
                          <h3>Match</h3>
                        </div>
                        <div className="flex w-full grow items-center justify-center py-6">
                          <div>80%</div>
                        </div>
                      </div>
                      <div className="flex grow flex-col items-center not-last:border-r">
                        <div className="bg-muted flex w-full justify-center border-b p-2">
                          <h3>last updated</h3>
                        </div>
                        <div className="flex w-full grow items-center justify-center py-6">
                          <div>
                            {job?.updated_at
                              ? new Date(job.updated_at).toLocaleDateString(
                                  "en-AU",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  },
                                )
                              : "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <CardTitle>Application Timeline</CardTitle>
                      <CardContent>
                        <ol className="relative space-y-4">
                          <li className="group relative flex pl-4">
                            <Dot className="absolute top-0 left-0 -translate-x-1/2 scale-150 group-first:text-green-500" />

                            <span>test</span>
                          </li>
                          <li className="group relative flex pl-4">
                            <Dot className="absolute top-0 left-0 -translate-x-1/2 scale-150 group-first:text-green-500" />

                            <span>test</span>
                          </li>
                          <Separator
                            className="bg-muted-foreground/60 absolute top-0 left-0 -translate-x-1/2"
                            orientation="vertical"
                          />
                        </ol>
                      </CardContent>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap gap-2">
                        {job?.tech_stack ? (
                          job.tech_stack.map((tech, index) => (
                            <Badge
                              key={index}
                              variant={"outline"}
                              className="bg-secondary/20 text-primary rounded-md border px-4 py-1 text-base"
                            >
                              {tech}
                            </Badge>
                          ))
                        ) : (
                          <></>
                        )}
                      </div>
                      <Separator />
                      <div className="flex justify-end gap-2 p-2">
                        <Button variant={"default"}>Advance</Button>
                        <Button variant={"destructive"}>Rejected</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full">
                  <CardContent>
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant={"icon"}>
                          <FileQuestionMark />
                        </EmptyMedia>
                        <EmptyTitle>No Application Yet</EmptyTitle>
                        <EmptyDescription>
                          Create an application to start.
                        </EmptyDescription>
                      </EmptyHeader>
                      <EmptyContent>
                        <div>
                          <Button
                            onClick={(e) => {
                              e.preventDefault();
                              router.push(`/application`);
                            }}
                          >
                            Create Application
                          </Button>
                        </div>
                      </EmptyContent>
                    </Empty>
                  </CardContent>
                </Card>
              )}
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
          </Tabs>
          <RecruiterSection recruiter_id={job?.recruiter_id} job_id={id} />
        </div>
      </CardContent>
    </Card>
  );
}

export default ViewJob;
