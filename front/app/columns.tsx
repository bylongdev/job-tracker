"use client";

import { ColumnDef } from "@tanstack/react-table";

/*   company_name: string;
  job_title: string;
  job_description: string;
  published_at: Date;
  location: string;
  job_type:
    | ["Full-time", "Part-time", "Casual", "Contract", "Internship"]
    | string;
  source: string;
  url: string;
  skill_requirements?: string;
  tech_stack?: string;
  expired_at?: Date;
  salary_min?: string;
  salary_max?: string;
  created_at: Date; */

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type JobAds = {
  company_name: string;
  job_title: string;
  published_at: string;
  location: string;
  job_type:
    | ["Full-time", "Part-time", "Casual", "Contract", "Internship"]
    | string;
  salary_min?: string;
  salary_max?: string;
  created_at: string;
};

export const columns: ColumnDef<JobAds>[] = [
  {
    accessorKey: "company_name",
    header: "Company Name",
  },
  {
    accessorKey: "job_title",
    header: "Job Title",
  },
  {
    accessorKey: "published_at",
    header: "Published At",
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "job_type",
    header: "Job Type",
  },
  {
    accessorKey: "salary_min",
    header: "Salary Min",
  },
  {
    accessorKey: "salary_max",
    header: "Salary Max",
  },
  {
    accessorKey: "created_at",
    header: "Created At",
  },
];
