"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { JobAd } from "../../job-ads.types";
import { Button } from "@/components/ui/button";

function ViewJob() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<JobAd>();

  useEffect(() => {
    const fetchJobAds = async () => {
      const res = await fetch(`http://localhost:4000/api/job_ads/${id}`);

      if (!res.ok) {
        console.error("Fetched failed!");
        return;
      }
      const data = await res.json();
      console.log(data);
      setJob(data);
    };

    fetchJobAds();

    return;
  }, [id]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          {/* Title */}
          <div>
            <CardTitle>{job?.job_title}</CardTitle>
            <CardDescription>
              {job?.company_name} • {job?.location}
            </CardDescription>
          </div>

          {/* Action buttons */}
          <div className="flex">
            <Button>Edit</Button>
            <Button variant={"destructive"}>Delete</Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

export default ViewJob;
