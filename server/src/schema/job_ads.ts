import { z } from "zod";

const dateOpt = z.preprocess(
	(v) => (v === "" || v == null ? undefined : v),
	z.coerce.date().optional(),
);

export const createJobSchema = z
	.object({
		company_name: z.string().min(2).max(50),
		job_title: z.string().min(2).max(50),
		job_description: z.string().min(2),
		published_at: z.coerce.date(),
		location: z.string().max(50).optional(),
		job_type: z.string().min(2).max(50),
		source: z.string().min(2).max(50),
		url: z.url(),
		skill_requirements: z.array(z.string()).optional(),
		tech_stack: z.array(z.string()).optional(),
		expired_at: dateOpt,
		salary_min: z.coerce.number().nonnegative().optional(),
		salary_max: z.coerce.number().nonnegative().optional(),
		note: z.string(),
	})
	.refine(
		(d) =>
			d.salary_min == undefined ||
			d.salary_max == undefined ||
			d.salary_min <= d.salary_max,
		{ path: ["salary_max"], message: "Salary max must be >= min" },
	)
	.refine(
		(d) => !d.published_at || !d.expired_at || d.published_at <= d.expired_at,
		{
			path: ["expired_at"],
			message: "Expired date must further that published date",
		},
	);
