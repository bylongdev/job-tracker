import { z } from "zod";

const dateOpt = z.preprocess(
	(v) => (v === "" || v == null ? undefined : v),
	z.coerce.date().optional(),
);

export const createApplicationSchema = z
	.object({
		status: z.string(),
		stage: z.string(),
		last_follow_up_at: dateOpt,
		next_follow_up_at: dateOpt,
		applied_at: dateOpt,
		note: z.string(),
	})
	.refine(
		(d) =>
			!d.last_follow_up_at ||
			!d.next_follow_up_at ||
			d.last_follow_up_at <= d.next_follow_up_at,
		{
			path: ["next_follow_up_at"],
			message: "Next follow up date must further that last follow up date",
		},
	);
