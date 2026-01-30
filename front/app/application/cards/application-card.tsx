"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
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
import { Field, FieldContent, FieldDescription } from "@/components/ui/field";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";

type ApplicationStatus =
  | "created"
  | "applied"
  | "screening"
  | "interview"
  | "final_interview"
  | "offer";

/* Helper */
// Create application

/* Main */
function ApplicationCard({
  job,
  application,
  refetchApp,
  setApplication,
  timeline,
  refetchTimeline,
}: {
  job: JobAd;
  application: Application | null;
  refetchApp: () => void;
  setApplication: (data: Application) => void;
  timeline: ApplicationTimeline[] | null;
  refetchTimeline: () => void;
}) {
  const [id, setId] = useState(job.application_id);

  useEffect(() => {
    setId(application?.id);
  }, [application?.id]);

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

      await refetchTimeline();

      return data;
    } catch (e) {
      console.error(`Error: ${e}`);
    }
  };

  const createApplictaion = async () => {
    if (!job.id) return;
    try {
      const res = await fetch(`http://localhost:4000/api/application/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_ads_id: job.id,
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

      await refetchApp();

      return data.id;
    } catch (e) {
      console.error(`Error: ${e}`);
    }
  };

  const updateStatusApplication = async (status: string) => {
    console.log(id);
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

      const updated = await res.json();

      setApplication(updated);

      await createTimeline(status);

      await refetchApp();

      return updated;
    } catch (e) {
      console.error(`Error: ${e}`);
    }
  };

  return (
    <Card className="h-full">
      {application ? (
        <CardContent className="flex flex-col gap-8">
          {/* Hero Card for application */}
          <Card className="to-background/30 bg-linear-to-br from-blue-300/60">
            <CardContent className="flex w-full justify-between gap-2">
              <div className="grow">
                <div className="flex flex-col gap-4">
                  <Badge className="px-4 text-xl capitalize">Applied</Badge>
                  <CardTitle className="text-3xl">{job.job_title}</CardTitle>
                  <Item className="from-background border-0 bg-linear-to-r from-20% to-80%">
                    <ItemContent className="flex flex-row items-center gap-4">
                      <ItemTitle className="text-lg capitalize">
                        {timeline && timeline[0].title}
                      </ItemTitle>

                      <div className="text-xl font-semibold">&gt;</div>

                      <ItemDescription className="text-base">
                        {timeline &&
                          new Date(timeline[0].created_at).toLocaleDateString(
                            "en-AU",
                            {
                              dateStyle: "medium",
                            },
                          )}
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                </div>
              </div>

              <Item className="bg-background w-64 shadow-xl">
                <ItemContent className="h-full items-center justify-around">
                  <ItemTitle className="text-xl font-normal">Match</ItemTitle>

                  <ItemDescription className="text-foreground text-4xl font-semibold">
                    80%
                  </ItemDescription>

                  <ItemDescription>
                    {`Last updated at ${new Date(
                      application.updated_at,
                    ).toLocaleDateString("en-AU", {
                      dateStyle: "medium",
                    })}`}
                  </ItemDescription>
                </ItemContent>
              </Item>
            </CardContent>
          </Card>

          {/* <div className="flex grow justify-around rounded-sm border shadow-md">
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
          </div> */}
          <div className="flex flex-col gap-4">
            <CardTitle>Application Timeline</CardTitle>
            <Card>
              <CardContent className="relative">
                <div className="border-muted absolute top-0 left-7.5 h-full border-l-2" />
                <ol className="relative max-h-100 space-y-4 overflow-y-auto">
                  {timeline ? (
                    <>
                      {[...timeline].map((e) => (
                        <li className="group relative flex" key={e.id}>
                          <Circle
                            className="fill-muted-foreground mt-1 group-first:fill-green-500 group-first:text-green-500"
                            size={14}
                          />

                          <div>
                            <div className="flex items-center justify-center gap-4 px-2">
                              <CardTitle className="group-not-first:text-muted-foreground! text-base capitalize group-not-first:font-normal!">
                                {e.title}
                              </CardTitle>
                              <CardDescription className="p-0.5 text-xs">
                                {new Date(e.created_at).toLocaleDateString(
                                  "en-AU",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "2-digit",
                                  },
                                )}
                              </CardDescription>

                              <Badge
                                variant={"outline"}
                                className="bg-muted scale-75 font-bold tracking-wide uppercase"
                              >
                                {e.event_type}
                              </Badge>

                              {/* <div className="p-2"> */}
                              {/*   <Badge
                                variant={"outline"}
                                className="bg-muted text-[10px] font-bold tracking-wide uppercase"
                              >
                                {e.event_type}
                              </Badge>
                              <CardTitle className="text-base capitalize group-not-first:font-normal!">
                                {e.title}
                              </CardTitle> */}
                              {/* </div> */}
                            </div>
                            <CardDescription className="px-4 py-2">
                              {e.description}
                            </CardDescription>
                          </div>
                        </li>
                      ))}
                    </>
                  ) : (
                    <></>
                  )}
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
                    const res = await createApplictaion();
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
