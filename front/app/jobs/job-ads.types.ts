export type JobType =
  | "Full-time"
  | "Part-time"
  | "Casual"
  | "Contract"
  | "Internship";

export type JobAd = {
  id: string;
  recruiter_id?: string;
  application_id?: string;

  company_name: string;
  job_title: string;
  job_description: string;

  published_at: string; // date (ISO)
  expired_at?: string;

  location?: string;
  job_type: JobType;
  source: string;
  url?: string;

  skill_requirements?: string[];
  tech_stack?: string[];

  salary_min?: number;
  salary_max?: number;

  created_at: string;
  updated_at: string;
};
