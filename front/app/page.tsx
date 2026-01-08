"use client";

import { Button } from "@/components/ui/button";
import { columns } from "./columns";
import NavBar from "./components/navBar";
import { DataTable } from "./data-table";
import { useState } from "react";

import { JobAdsForm } from "@/components/job-ads-form";

type JobAds = {
  company_name: string;
  job_title: string;
  published_at: string;
  location: string;
  job_type:
    | ["Full-time", "Part-time", "Casual", "Contract", "Internship"]
    | string;

  created_at: string;
};

const jobAds: JobAds[] = [
  {
    company_name: "A",
    job_title: "A",
    published_at: new Date().toLocaleDateString(),
    location: "A",
    job_type: "Casual",

    created_at: new Date().toLocaleDateString(),
  },
  {
    company_name: "B",
    job_title: "B",
    published_at: new Date().toLocaleDateString(),
    location: "B",
    job_type: "C",
    created_at: new Date().toLocaleDateString(),
  },
];

export default function Home() {
  const [isBuilding, setBuild] = useState(false);

  const toggleCreateForm = () => setBuild(!isBuilding);

  return (
    <div className="bg-background flex min-h-screen max-w-screen select-none">
      {/* Navbar Section */}
      <NavBar />

      {/* Content Section */}
      <main className="flex grow flex-col gap-2 overflow-auto p-4">
        {/* Create Button */}

        {isBuilding ? (
          <div>
            <JobAdsForm toggleCreate={toggleCreateForm} />
          </div>
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
            <DataTable columns={columns} data={jobAds} />
          </>
        )}
      </main>
    </div>
  );
}
