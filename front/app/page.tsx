import { columns } from "./columns";
import NavBar from "./components/navBar";
import { DataTable } from "./data-table";

type JobAds = {
  company_name: string;
  job_title: string;
  published_at: Date;
  location: string;
  job_type:
    | ["Full-time", "Part-time", "Casual", "Contract", "Internship"]
    | string;
  salary_min?: string;
  salary_max?: string;
  created_at: Date;
};

const jobAds: JobAds[] = [
  {
    company_name: "A",
    job_title: "A",
    published_at: new Date(),
    location: "A",
    job_type: "Casual",
    salary_min: "100",
    salary_max: "200",
    created_at: new Date(),
  },
  {
    company_name: "B",
    job_title: "B",
    published_at: new Date(),
    location: "B",
    job_type: "C",
    salary_min: "100",
    created_at: new Date(),
  },
];

export default function Home() {
  return (
    <div className="bg-background flex min-h-screen max-w-screen">
      {/* Navbar Section */}
      <NavBar />

      {/* Content Section */}
      <main className="grow">
        <DataTable columns={columns} data={jobAds} />
      </main>
    </div>
  );
}
