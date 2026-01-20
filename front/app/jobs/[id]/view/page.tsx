"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { JobAd } from "../../job-ads.types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecruiterSection from "@/app/recruiter/form/recruiter-card";

import ApplicationCard from "@/app/application/form/application-card";

function ViewJob() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<JobAd>();

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

  /*   useEffect(() => {
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
  }); */

  return (
    <Card className="shadow-2xl">
      {job ? (
        <>
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
                  <ApplicationCard job={job} />
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
        </>
      ) : (
        <></>
      )}
    </Card>
  );
}

export default ViewJob;
