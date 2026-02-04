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
import { Circle, FileQuestionMark, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Application } from "../application.types";
import { JobAd } from "@/app/jobs/job-ads.types";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ApplicationTimeline } from "../application-timeline.types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import TimelineForm from "../form/timeline-form";

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
  const [timelineOpen, setTimelineOpen] = useState(false);

  useEffect(() => {
    setId(application?.id);
  }, [application?.id]);

  const createTimeline = async (value: ApplicationTimeline) => {
    if (!id) return;

    try {
      const res = await fetch(
        `http://localhost:4000/api/application/${id}/timeline`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event_type: value.event_type,
            title: value.title,
            description: value.description,
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
          status: "Applying",
          stage: "created",
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

  const updateStatusApplication = async (values: ApplicationTimeline) => {
    console.log(id);
    if (!id) return;

    try {
      const res = await fetch(`http://localhost:4000/api/application/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: values.title,
          status:
            (values.title == "accepted" && "accepted") ||
            (values.title == "rejected" && "rejected") ||
            "applying",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || err?.message || `HTTP ${res.status}`);
      }

      const updated = await res.json();

      setApplication(updated);

      await createTimeline(values);

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
                  {/*   <Badge className="px-4 text-xl uppercase">
                    {application.stage}
                  </Badge> */}
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

              <Item className="bg-background h-full w-64 shadow-xl">
                <ItemHeader className="justify-center">
                  <ItemTitle className="text-lg capitalize">Status</ItemTitle>
                </ItemHeader>
                <ItemContent className="text-center">
                  <span
                    className={`text-4xl font-bold uppercase ${application.status.toLocaleLowerCase() == "rejected" ? "text-destructive" : application.status.toLocaleLowerCase() == "accepted" ? "text-green-500" : ""}`}
                  >
                    {application.status}
                  </span>
                </ItemContent>
                <ItemFooter>
                  {/* <ItemDescription>Last updated</ItemDescription> */}
                </ItemFooter>
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
          <div className="flex gap-4">
            {/* Timeline */}
            <Card className="max-w-2/5">
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Logs</CardTitle>
                <Dialog open={timelineOpen} onOpenChange={setTimelineOpen}>
                  <DialogTrigger asChild>
                    {/* <Button variant={"outline"}>Advance</Button> */}
                    <Button variant={"outline"}>
                      <Plus />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogTitle></DialogTitle>

                    <TimelineForm
                      updateStatus={(values) => {
                        return updateStatusApplication({
                          id: "",
                          application_id: id || "",
                          created_at: new Date().toISOString(),
                          ...values,
                        } as ApplicationTimeline);
                      }}
                      setTimelineOpen={setTimelineOpen}
                    />
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="relative">
                <div className="absolute top-0 left-7 h-full border-l-2" />
                <ol className="relative max-h-100 space-y-4 overflow-y-auto">
                  {timeline ? (
                    <>
                      {[...timeline].map((e) => (
                        <li className="group relative flex w-full" key={e.id}>
                          <Circle
                            className="fill-muted-foreground group-first:fill-primary group-first:text-primary mt-1.75"
                            size={10}
                          />

                          <div className="flex w-[95%] flex-col">
                            <div className="flex w-full items-center justify-between gap-4 px-2">
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
                            </div>
                            <CardDescription className="w-full px-4 py-2 wrap-break-word">
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

            {/* Notes */}
            <Card className="w-2/3">
              <CardHeader className="flex justify-center">
                <CardTitle>Note</CardTitle>
              </CardHeader>
              <Separator />
              {application.note ? (
                <CardContent>{application.note}</CardContent>
              ) : (
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle className="capitalize">No note yet</EmptyTitle>
                  </EmptyHeader>
                  <EmptyContent>
                    <EmptyDescription>
                      Add a note to remember context or next steps.
                    </EmptyDescription>
                  </EmptyContent>
                </Empty>
              )}
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
              {/* <Dialog open={timelineOpen} onOpenChange={setTimelineOpen}>
                <DialogTrigger asChild>
                  <Button>Advance</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle></DialogTitle>

                  <TimelineForm
                    updateStatus={(values) => {
                      return updateStatusApplication({
                        id: "",
                        application_id: id || "",
                        created_at: new Date().toISOString(),
                        ...values,
                      } as ApplicationTimeline);
                    }}
                    setTimelineOpen={setTimelineOpen}
                  />
                </DialogContent>
              </Dialog> */}

              <Button
                variant={"default"}
                onClick={() =>
                  updateStatusApplication({
                    id: "",
                    application_id: id || "",
                    created_at: new Date().toISOString(),
                    event_type: "manual",
                    title: "accepted",
                    description: "",
                  })
                }
                disabled={
                  application.stage.toLocaleLowerCase() == "accepted" ||
                  application.stage.toLocaleLowerCase() != "offered"
                }
              >
                Accept
              </Button>

              <Button
                variant={"destructive"}
                onClick={() =>
                  updateStatusApplication({
                    id: "",
                    application_id: id || "",
                    created_at: new Date().toISOString(),
                    event_type: "manual",
                    title: "rejected",
                    description: "",
                  })
                }
                disabled={application.stage.toLocaleLowerCase() === "rejected"}
              >
                Reject
              </Button>
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
