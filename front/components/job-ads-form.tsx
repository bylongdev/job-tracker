"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState } from "react";

const formSchema = z
  .object({
    company_name: z.string().min(2).max(50),
    job_title: z.string().min(2).max(50),
    job_description: z.string().min(2),
    published_at: z.coerce.date(),
    location: z.string().min(2).max(50).optional(),
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
  );

type FormValues = z.infer<typeof formSchema>;

export function JobAdsForm({ toggleCreate }: { toggleCreate: () => void }) {
  // 1. Define a form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: "",
      job_title: "",
      job_description: "",
      published_at: new Date(), // or undefined if you want blank
      location: "",
      job_type: "",
      source: "",
      url: "",
      skill_requirements: [],
      tech_stack: [],
      expired_at: undefined,
      salary_min: undefined,
      salary_max: undefined,
    } satisfies Partial<FormValues>,
  });

  const [skillInput, setSkillInput] = useState("");
  const [stackInput, setStackInput] = useState("");
  // 2. Define a submit handler
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <div className="m-auto flex w-4/5 max-w-4xl min-w-xl flex-col justify-center gap-4 p-6">
      <div>
        <h2 className="self-center py-6 text-2xl font-semibold capitalize">
          Job Ads Form
        </h2>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          {/* Company Name */}
          <FormField
            control={form.control}
            name="company_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
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
                <FormLabel>Job Title</FormLabel>
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

          {/* Job Description */}
          <FormField
            control={form.control}
            name="job_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Description</FormLabel>
                <FormControl>
                  <Input placeholder="Paste a short summary..." {...field} />
                </FormControl>
                <FormDescription>
                  Keep it short for now — you can upgrade to a textarea later.
                </FormDescription>
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
                <FormLabel>Published At</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={
                      field.value instanceof Date
                        ? field.value.toISOString().slice(0, 10)
                        : ""
                    }
                    onChange={(e) => field.onChange(e.target.value)}
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
                <FormLabel>Job Type</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Full-time / Contract" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Source */}
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
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
              <FormItem>
                <FormLabel>URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Skill Requirements (basic: comma-separated -> array) */}
          <FormField
            control={form.control}
            name="skill_requirements"
            render={({ field }) => (
              <FormItem>
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
              <FormItem>
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
                    // value={
                    //   field.value instanceof Date
                    //     ? field.value.toISOString().slice(0, 10)
                    //     : ""
                    // }
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormDescription>Optional.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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

          <div className="mt-6 flex gap-4 self-end">
            <Button
              type="reset"
              onClick={(e) => {
                e.preventDefault();
                form.reset();
              }}
              className="w-fit hover:cursor-pointer"
              variant={"destructive"}
            >
              Reset
            </Button>
            <Button
              type="submit"
              className="w-fit hover:cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                toggleCreate();
              }}
            >
              Save
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
