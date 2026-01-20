"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Dot, FileQuestionMark } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Application } from "../application.types";
import { JobAd } from "@/app/jobs/job-ads.types";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

function ApplicationCard({ job }: { job: JobAd }) {
  const [id, setID] = useState<string>();
  const [application, setApplication] = useState<Application>();

  useEffect(() => {
    if (!job.application_id) return;

    setID(job.application_id);
  }, [job.application_id]);

  useEffect(() => {
    if (!id) return;

    try {
      const fetchApplication = async () => {
        const res = await fetch(`http://localhost:4000/api/application/${id}`);

        if (!res.ok) {
          console.error("Fetched failed!");
        }

        const data = await res.json();
        setApplication(data);
        console.log(data);
      };
      fetchApplication();
    } catch (e) {
      console.error("Error: ", e);
    }
  }, [id]);

  const updateApplicationId = async (id: string) => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/job_ads/${job.id}/application`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ application_id: id }),
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

  const createApplictaion = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/application/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "created",
          stage: "initial",
          last_follow_up_at: "",
          next_follow_up_at: "",
          applied_at: "",
          note: "",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || err?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();

      updateApplicationId(data.id);

      return data;
    } catch (e) {
      console.error(`Error: ${e}`);
    }
  };

  return (
    <Card className="h-full">
      {application ? (
        <CardContent className="flex flex-col gap-8">
          <div className="flex grow justify-around rounded-sm border shadow-md">
            <div className="flex grow flex-col items-center not-last:border-r">
              <div className="bg-muted flex w-full justify-center border-b p-2">
                <CardTitle>Status</CardTitle>
              </div>
              <div className="flex w-full grow items-center justify-center py-6">
                <CardDescription className="text-base font-semibold capitalize">
                  {application.status}
                </CardDescription>
              </div>
            </div>
            <div className="flex grow flex-col items-center not-last:border-r">
              <div className="bg-muted flex w-full justify-center border-b p-2">
                <CardTitle>Next Step</CardTitle>
              </div>
              <div className="flex w-full grow items-center justify-center py-6">
                <CardDescription className="text-base font-semibold capitalize">
                  {application.stage}
                </CardDescription>
              </div>
            </div>
            {/* <div className="flex grow flex-col items-center not-last:border-r">
              <div className="bg-muted flex w-full justify-center border-b p-2">
                <CardTitle>Match</CardTitle>
              </div>
              <div className="flex w-full grow items-center justify-center py-6">
                <CardDescription className="capitalize font-semibold text-base">80%</CardDescription>
              </div>
            </div> */}
            <div className="flex grow flex-col items-center not-last:border-r">
              <div className="bg-muted flex w-full justify-center border-b p-2">
                <CardTitle>last updated</CardTitle>
              </div>
              <div className="flex w-full grow items-center justify-center py-6">
                <CardDescription className="text-base font-semibold capitalize">
                  {application.updated_at
                    ? new Date(job.updated_at).toLocaleDateString("en-AU", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "-"}
                </CardDescription>
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
      ) : (
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
                    createApplictaion();
                    // console.log("Create application");
                  }}
                >
                  Create Application
                </Button>
              </div>
            </EmptyContent>
          </Empty>
        </CardContent>
      )}
    </Card>
  );
}

export default ApplicationCard;
