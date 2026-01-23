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
import { Circle, FileQuestionMark } from "lucide-react";
import { useEffect, useState } from "react";
import { Application } from "../application.types";
import { JobAd } from "@/app/jobs/job-ads.types";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ApplicationTimeline } from "../application-timeline.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ApplicationStatus =
  | "created"
  | "applied"
  | "screening"
  | "interview"
  | "final_interview"
  | "offer";

/* Helper */

// Update application id to job_ads
async function updateApplicationId(id: string, job_id: string) {
  try {
    const res = await fetch(
      `http://localhost:4000/api/job_ads/${job_id}/application`,
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

    return data.id;
  } catch (e) {
    console.error(`Error: ${e}`);
  }
}

// Create application

const createApplictaion = async (job_id: string) => {
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

    updateApplicationId(data.id, job_id);

    return data.id;
  } catch (e) {
    console.error(`Error: ${e}`);
  }
};

async function fetchApplicationHelper(id: string) {
  try {
    const res = await fetch(`http://localhost:4000/api/application/${id}`);

    if (!res.ok) {
      console.error("Fetched failed!");
    }

    const data = await res.json();
    return data;
  } catch (e) {
    console.error("Error: ", e);
  }
}

async function fetchTimelineHelper(id: string) {
  try {
    const res = await fetch(
      `http://localhost:4000/api/application/${id}/timeline`,
    );

    if (!res.ok) {
      console.error("Fetched failed!");
    }

    const data = await res.json();
    return data;
  } catch (e) {
    console.error("Error: ", e);
  }
}

/* Main */
function ApplicationCard({
  job,
  onApplicationCreated,
}: {
  job: JobAd;
  onApplicationCreated: (id: string) => void;
}) {
  const [application, setApplication] = useState<Application>();
  const [timeline, setTimeline] = useState<ApplicationTimeline[]>();
  const [id, setId] = useState(job.application_id);

  // Fetch App + timeline
  useEffect(() => {
    if (!id) return;

    try {
      const fetch = async () => {
        const applicationResult = await fetchApplicationHelper(id);
        setApplication(applicationResult);
        onApplicationCreated(applicationResult.id);

        const timelineResult = await fetchTimelineHelper(id);
        setTimeline(timelineResult);
      };

      fetch();
    } catch (e) {
      console.error("Error: ", e);
    }
  }, [id, onApplicationCreated]);

  /* Status */
  const STATUS_ORDER: ApplicationStatus[] = [
    "created",
    "applied",
    "screening",
    "interview",
    "final_interview",
    "offer",
  ];

  // Filter out the default "created"
  const VISIBLE_STATUSES = STATUS_ORDER.filter((s) => s !== "created");

  // Match the current index with the status
  const currentIndex = application
    ? STATUS_ORDER.indexOf(application.status as ApplicationStatus)
    : -1;

  // Disable all the status already passed
  const isDisabled = (status: ApplicationStatus) =>
    STATUS_ORDER.indexOf(status) <= currentIndex;

  const createTimeline = async (status: string) => {
    if (!id) return;

    try {
      const res = await fetch(
        `http://localhost:4000/api/application/${id}/timeline`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event_type: "system",
            title: status,
          }),
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || err?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();

      const timeline = await fetchTimelineHelper(id);
      setTimeline(timeline);

      return data;
    } catch (e) {
      console.error(`Error: ${e}`);
    }
  };

  const updateStatusApplication = async (status: string) => {
    if (!id) return;

    try {
      const res = await fetch(`http://localhost:4000/api/application/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: status,
          stage: "applying",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || err?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();

      createTimeline(status);
      setApplication(data);

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
            {/*  <div className="flex grow flex-col items-center not-last:border-r">
              <div className="bg-muted flex w-full justify-center border-b p-2">
                <CardTitle>Next Step</CardTitle>
              </div>
              <div className="flex w-full grow items-center justify-center py-6">
                <CardDescription className="text-base font-semibold capitalize">
                  {application.stage}
                </CardDescription>
              </div>
            </div> */}
            <div className="flex grow flex-col items-center not-last:border-r">
              <div className="bg-muted flex w-full justify-center border-b p-2">
                <CardTitle>Match</CardTitle>
              </div>
              <div className="flex w-full grow items-center justify-center py-6">
                <CardDescription className="text-base font-semibold capitalize">
                  80%
                </CardDescription>
              </div>
            </div>
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
            <Card>
              <CardContent>
                <ol className="relative max-h-100 space-y-4 overflow-auto">
                  {timeline ? (
                    <>
                      {[...timeline].reverse().map((e) => (
                        <li className="group relative flex" key={e.id}>
                          <Circle
                            className="fill-muted-foreground mt-1 group-first:fill-green-500 group-first:text-green-500"
                            size={14}
                          />

                          <div className="px-2">
                            <CardDescription className="p-0.5">
                              {new Date(e.created_at).toLocaleDateString(
                                "en-AU",
                                {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hourCycle: "h24",
                                },
                              )}
                            </CardDescription>

                            <div className="p-2">
                              <Badge
                                variant={"outline"}
                                className="bg-muted text-[10px] font-bold tracking-wide uppercase"
                              >
                                {e.event_type}
                              </Badge>
                              <CardTitle className="text-base font-semibold capitalize">
                                {e.title}
                              </CardTitle>
                              <CardDescription>{e.description}</CardDescription>
                            </div>
                          </div>
                        </li>
                      ))}
                    </>
                  ) : (
                    <></>
                  )}
                  {/* <Separator
                  className="bg-muted-foreground/60 absolute top-0 left-0 h-full -translate-x-1/2"
                  orientation="vertical"
                /> */}
                </ol>
              </CardContent>
            </Card>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={"default"}>Advance</Button>
                </DropdownMenuTrigger>

                {application.status == "offer" && <Button>Accept</Button>}
                <DropdownMenuContent side={"top"}>
                  <DropdownMenuItem>Add note</DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        {VISIBLE_STATUSES.map((status) => (
                          <DropdownMenuItem
                            key={status}
                            disabled={isDisabled(status)}
                            onClick={() => updateStatusApplication(status)}
                            className="capitalize"
                          >
                            {status.replace("_", " ")}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>
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
                  onClick={async (e) => {
                    e.preventDefault();
                    const res = await createApplictaion(job.id);
                    setId(res);
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
