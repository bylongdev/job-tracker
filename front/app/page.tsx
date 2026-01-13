"use client";

import { Button } from "@/components/ui/button";
import { columns } from "./columns";
import NavBar from "../components/navBar";
import { DataTable } from "./data-table";
import { useEffect, useState } from "react";

import { JobAdsForm } from "@/components/forms/job-ads-form";

type JobAds = {
  id: string;
  company_name: string;
  job_title: string;
  location: string;
  job_type:
    | ["Full-time", "Part-time", "Casual", "Contract", "Internship"]
    | string;
  source: string;
  published_at: string;
};

export default function Home() {
  const [isBuilding, setBuild] = useState(false);
  const [jobAds, setJobsAds] = useState<JobAds[]>([]);

  const fetchJobAds = async () => {
    const res = await fetch("http://localhost:4000/api/job_ads/table");
    if (!res.ok) {
      console.error("Fetched failed!");
      return;
    }
    const data = await res.json();
    setJobsAds(data);
  };

  useEffect(() => {
    (async () => {
      await fetchJobAds();
    })();
  }, []);

  const toggleCreateForm = () => setBuild(!isBuilding);

  // Delete the job by ID
  const deleteJob = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/job_ads/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Id not found!");
      }

      return console.log(`Successfully delete the job at ID: "${id}"`);
    } catch (e) {
      console.error("Error:", e);
    }
  };

  // View the full detailed job by ID
  const viewJob = (id: string) => {
    console.log(`View ${id}`);
  };

  // Edit the job then update it with provided ID
  const editJob = (id: string) => {
    console.log(`Edit ${id}`);
  };

  return (
    <div className="bg-background flex h-full min-h-screen max-w-screen select-none">
      {/* Navbar Section */}
      <NavBar />

      {/* Content Section */}
      <main className="flex grow flex-col gap-2 overflow-auto p-4">
        {/* Create Button */}

        {isBuilding ? (
          <JobAdsForm toggleCreate={toggleCreateForm} />
        ) : (
          <>
            <div className="group self-end">
              <Button
                className="group-hover:cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();

                  toggleCreateForm();
                }}
              >
                Create Job
              </Button>
            </div>
            <DataTable
              columns={columns({
                onView: (id) => viewJob(id),
                onEdit: (id) => editJob(id),
                onDelete: (id) => deleteJob(id),
              })}
              data={jobAds}
            />
          </>
        )}
      </main>
    </div>
  );
}
