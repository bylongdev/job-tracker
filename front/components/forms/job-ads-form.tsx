"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Tiptap from "../ui/tiptap";

const formSchema = z
  .object({
    company_name: z.string().min(2).max(50),
    job_title: z.string().min(2).max(50),
    job_description: z.string().min(2),
    published_at: z.coerce.date(),
    location: z.string().max(50).optional(),
    job_type: z.string().min(2).max(50),
    source: z.string().min(2).max(50),
    url: z.url().optional(),
    skill_requirements: z.array(z.string()).optional(),
    tech_stack: z.array(z.string()).optional(),
    expired_at: z.coerce.date().optional(),
    salary_min: z.coerce.number().positive().optional(),
    salary_max: z.coerce.number().positive().optional(),
  })
  .refine(
    (d) => !d.salary_min || !d.salary_max || d.salary_min <= d.salary_max,
    { path: ["salary_max"], message: "Salary max must be >= min" },
  )
  .refine(
    (d) => !d.published_at || !d.expired_at || d.published_at <= d.expired_at,
    {
      path: ["expired_at"],
      message: "Expired date must further that published date",
    },
  );

type FormValues = z.infer<typeof formSchema>;

export function JobAdsForm() {
  const router = useRouter();

  // 1. Define a form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: "",
      job_title: "",
      job_description: "",
      published_at: new Date(), // or undefined if you want blank
      location: undefined,
      job_type: "",
      source: "",
      url: "",
      skill_requirements: undefined,
      tech_stack: undefined,
      expired_at: undefined,
      salary_min: undefined,
      salary_max: undefined,
    } satisfies Partial<FormValues>,
  });

  const [skillInput, setSkillInput] = useState("");
  const [stackInput, setStackInput] = useState("");
  // 2. Define a submit handler

  async function createJobAd(values: unknown) {
    const res = await fetch("http://localhost:4000/api/job_ads/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.detail || err?.message || `HTTP ${res.status}`);
    }

    return res.json();
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      toast.promise(createJobAd(values), {
        loading: "Creating job ad…",
        success: () => {
          router.push("/");
          return `Job ad created: ${values.company_name} · ${values.job_title}`;
        },
        error: (e) => e.message,
      });
    } catch (e) {
      console.error("Error:", e);
    }
  }

  return (
    <div className="m-auto flex w-4/5 max-w-4xl min-w-xl flex-col justify-center gap-4 py-6">
      <div>
        <h2 className="self-center py-6 text-2xl font-semibold capitalize">
          Job Ads Form
        </h2>
      </div>
      <div className="border border-black/10 p-6 shadow-2xl">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="row-auto grid grid-cols-2 gap-6"
          >
            {/* Info Section seperate */}
            <div className="border-foreground col-span-2 border-b p-2 text-xl font-semibold tracking-wide">
              Basics
            </div>

            {/* Company Name */}
            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Company Name <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Atlassian" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Job Title */}
            <FormField
              control={form.control}
              name="job_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Job Title<span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Junior Software Engineer"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location (optional) */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Melbourne, VIC (optional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Job Type */}
            <FormField
              control={form.control}
              name="job_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Job Type<span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Full-time / Contract" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Job Description */}
            <FormField
              control={form.control}
              name="job_description"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>
                    Job Description<span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <Tiptap
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Info Section seperate */}
            <div className="border-foreground col-span-2 border-b p-2 text-xl font-semibold tracking-wide">
              Posting Info
            </div>

            {/* Source */}
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>
                    Source<span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. LinkedIn / Seek" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* URL (optional in your schema) */}
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>
                    URL<span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Published At */}
            <FormField
              control={form.control}
              name="published_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Published At<span className="text-red-600">*</span>
                  </FormLabel>

                  <FormControl>
                    <Input
                      type="date"
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder=""
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Expired At (optional) */}
            <FormField
              control={form.control}
              name="expired_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expired At</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Info Section seperate */}
            <div className="border-foreground col-span-2 border-b p-2 text-xl font-semibold tracking-wide">
              Requirements
            </div>

            {/* Skill Requirements (basic: comma-separated -> array) */}
            <FormField
              control={form.control}
              name="skill_requirements"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Skill Requirements</FormLabel>

                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        placeholder="e.g. React"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      onClick={() => {
                        if (!skillInput.trim()) return;
                        field.onChange([
                          ...(field.value ?? []),
                          skillInput.trim(),
                        ]);
                        setSkillInput("");
                      }}
                      variant={"secondary"}
                    >
                      Add
                    </Button>
                  </div>

                  {/* Display added skills */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(field.value ?? []).map((skill, i) => (
                      <div
                        key={i}
                        className="bg-mute items-center rounded-md text-sm"
                      >
                        {/* <span className="">{stack}</span> */}
                        <Button
                          type="button"
                          variant={"ghost"}
                          className="hover:bg-muted hover:text-foreground h-fit capitalize hover:cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();

                            const next = (field.value ?? []).filter(
                              (val) => val !== skill,
                            );

                            field.onChange(next);
                          }}
                        >
                          {skill}
                        </Button>
                      </div>
                    ))}
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tech Stack (basic: comma-separated -> array) */}
            <FormField
              control={form.control}
              name="tech_stack"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Tech Stack</FormLabel>

                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        placeholder="e.g. Next.js, PostgreSQL, Docker"
                        value={stackInput}
                        onChange={(e) => setStackInput(e.target.value)}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      onClick={() => {
                        if (!stackInput.trim()) return;
                        field.onChange([
                          ...(field.value ?? []),
                          stackInput.trim(),
                        ]);
                        setStackInput("");
                      }}
                      variant={"secondary"}
                    >
                      Add
                    </Button>
                  </div>

                  {/* Display added stack */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(field.value ?? []).map((stack, i) => (
                      <div
                        key={i}
                        className="bg-mute items-center rounded-md text-sm"
                      >
                        {/* <span className="">{stack}</span> */}
                        <Button
                          type="button"
                          variant={"ghost"}
                          className="hover:bg-muted hover:text-foreground h-fit capitalize hover:cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();

                            const next = (field.value ?? []).filter(
                              (val) => val !== stack,
                            );

                            field.onChange(next);
                          }}
                        >
                          {stack}
                        </Button>
                      </div>
                    ))}
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Info Section seperate */}
            <div className="border-foreground col-span-2 border-b p-2 text-xl font-semibold tracking-wide">
              Others
            </div>

            {/* Salary Min (optional) */}
            <FormField
              control={form.control}
              name="salary_min"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salary Min</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g. 70000"
                      min={0}
                      // value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? undefined : e.target.value,
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Salary Max (optional) */}
            <FormField
              control={form.control}
              name="salary_max"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salary Max</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="e.g. 90000"
                      // value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? undefined : e.target.value,
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="col-start-2 mt-6 flex justify-end gap-2">
              <Button
                type="reset"
                onClick={() => {
                  form.reset();
                  router.push("/jobs");
                }}
                className="hover:cursor-pointer"
                variant={"destructive"}
              >
                Cancel
              </Button>
              <Button type="submit" className="hover:cursor-pointer">
                Save
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
