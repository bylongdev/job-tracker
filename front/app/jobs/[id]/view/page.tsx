"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useParams } from "next/navigation";
import { JobAd } from "../../job-ads.types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Application } from "@/app/application/application.types";
import { ApplicationTimeline } from "@/app/application/application-timeline.types";

import RecruiterSection from "@/app/recruiter/form/recruiter-card";
import ApplicationCard from "@/app/application/cards/application-card";
import FileCard from "@/app/file/file-card";
import useFetch from "@/hooks/useFetch";
import { Recruiter } from "@/app/recruiter/recruiter.types";
import { FileType } from "@/app/file/file.types";

function ViewJob() {
  const { id } = useParams<{ id: string }>();

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
