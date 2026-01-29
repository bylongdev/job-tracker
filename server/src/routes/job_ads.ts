import { Router, type Request, type Response } from "express";
import { pool } from "../database/db.js";
import { createJobSchema } from "../schema/job_ads.js";
import z from "zod";
import DOMPurify from "isomorphic-dompurify";

import { prisma } from "../lib/prisma.js";

const router: Router = Router();

// ✅ PATCH should allow partial updates
const patchJobSchema = createJobSchema.partial();

// ✅ Allowed fields for update
const allowedList = new Set([
	"recruiter_id",
	"company_name",
	"job_title",
	"job_description",
	"published_at",
	"location",
	"job_type",
	"source",
	"url",
	"skill_requirements",
	"tech_stack",
	"expired_at",
	"salary_min",
	"salary_max",
]);

// Optional helper: reject unknown keys (nice for security/clean API)
function rejectUnknownKeys(body: Record<string, unknown>) {
	const keys = Object.keys(body);
	const unknown = keys.filter((k) => !allowedList.has(k));
	return unknown;
}

// Health check
router.get("/health", (_req: Request, res: Response) => {
	return res.status(200).json({ status: "OK" });
});

// CREATE: insert obj into database
router.post("/", async (req: Request, res: Response) => {
	try {
		const parsed = createJobSchema.safeParse(req.body);

		if (!parsed.success) {
			console.error(parsed.error);
			return res.status(400).json({ error: parsed.error });
		}

		// ✅ sanitise rich text HTML
		const cleanDescription = DOMPurify.sanitize(parsed.data.job_description);

		const {
			company_name,
			job_title,
			published_at,
			location,
			job_type,
			source,
			url,
			skill_requirements,
			tech_stack,
			expired_at,
			salary_max,
			salary_min,
			note,
		} = parsed.data;

		const jobAd = await prisma.jobAd.create({
			data: {
				company_name: company_name,
				job_title: job_title,
				job_description: cleanDescription,
				published_at: published_at,
				location: location ?? null,
				job_type: job_type,
				source: source,
				url: url,
				skill_requirements: skill_requirements ?? [],
				tech_stack: tech_stack ?? [],
				expired_at: expired_at ?? null,
				salary_max: salary_max ?? null,
				salary_min: salary_min ?? null,
				note: note,
			},
		});

		return res.status(201).json(jobAd);
	} catch (e: any) {
		console.error("DB ERROR:", e); // keep this

		// Unique violation (url dup)
		if (e.code === "23505") {
			return res.status(409).json({
				message: "Duplicate value",
				field: e.constraint, // e.g. job_ads_url_key
				detail: e.detail, // shows which value duplicated
			});
		}

		// Not-null violation
		if (e.code === "23502") {
			return res.status(400).json({
				message: "Missing required field",
				detail: e.detail,
			});
		}

		return res.status(500).json({
			message: "Internal server error",
			detail: e.message,
		});
	}
});

// RETRIEVE:

// Retrieve All
/* router.get("/", async (_req: Request, res: Response) => {
	try {
		const jobAds = await prisma.jobAd.findMany();

		if (!jobAds) {
			return res.status(404).json({ error: "Not found" });
		}
		return res.status(200).json(jobAds);
	} catch (e: any) {
		return res.status(500).json(e.message);
	}
});
 */

router.get("/", async (_req: Request, res: Response) => {
	try {
		const jobAds = await prisma.jobAd.findMany({
			orderBy: {
				updated_at: "desc",
			},
		});

		if (!jobAds) {
			return res.status(404).json({ error: "Not found" });
		}

		return res.status(200).json(jobAds);
	} catch (e: any) {
		return res.status(404).json({ msg: "Data not found!" });
	}
});

// Retrieve by id
router.get("/:id", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		if (!id) throw Error("Id not found");

		const jobAd = await prisma.jobAd.findUnique({
			where: {
				id: id,
			},
		});

		if (!jobAd) {
			return res.status(404).json({ error: "Not found" });
		}

		return res.status(200).json(jobAd);
	} catch (e: any) {
		return res.status(500).json(e.message);
	}
});

// Retrieve application from job_ad_id
router.get("/:id/application", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		if (!id) throw Error("Id not found");

		const jobAd = await prisma.application.findUnique({
			where: {
				job_ad_id: id,
			},
		});

		if (!jobAd) {
			return res.status(404).json({ error: "Not found" });
		}

		return res.status(200).json(jobAd);
	} catch (e: any) {
		return res.status(404).json({ msg: "Data not found!" });
	}
});

// UPDATE:

router.patch("/:id/recruiter", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		if (!id) throw Error("Id not found");

		const { recruiter_id } = z
			.object({ recruiter_id: z.uuid().nullable() })
			.parse(req.body);

		if (recruiter_id == null) {
			const jobAd = await prisma.jobAd.update({
				where: { id },
				data: { recruiter_id: null },
			});
			return res.status(200).json({ data: jobAd });
		}

		await prisma.recruiter.findUniqueOrThrow({
			where: { id: recruiter_id },
		});

		const jobAd = await prisma.jobAd.update({
			where: { id },
			data: {
				recruiter_id: recruiter_id,
			},
		});

		if (!jobAd) return res.status(404).json({ error: "Job ad not found" });

		return res.status(200).json({ data: jobAd });
	} catch (e: any) {
		res.status(500).json({ error: e.message });
	}
});

/* router.patch("/:id/application", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { application_id } = z
			.object({ application_id: z.uuid().nullable() })
			.parse(req.body);

		if (application_id) {
			const applicationExists = await pool.query(
				`SELECT 1 FROM public.application WHERE id = $1`,
				[application_id],
			);
			if (applicationExists.rowCount === 0) {
				return res.status(404).json({ error: "Application not found" });
			}
		}

		const result = await pool.query(
			`
      UPDATE public.job_ads
      SET application_id = $1, updated_at = now()
      WHERE id = $2
      RETURNING *
      `,
			[application_id, id],
		);

		if (result.rowCount === 0) {
			return res.status(404).json({ error: "Job ad not found" });
		}

		return res.status(200).json({ data: result.rows[0] });
	} catch (e: any) {
		res.status(500).json({ error: e.message });
	}
}); */

router.patch("/:id", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		if (!id) throw Error("Id not found");

		// 1) Reject unknown keys early
		const unknownKeys = rejectUnknownKeys(req.body ?? {});
		if (unknownKeys.length > 0) {
			return res.status(400).json({
				error: `Unknown field(s): ${unknownKeys.join(", ")}`,
			});
		}

		// 2) Validate as partial
		const parsed = patchJobSchema.safeParse(req.body);
		if (!parsed.success) {
			return res.status(400).json({
				error: z.treeifyError(parsed.error),
			});
		}

		const data = parsed.data;

		// 3) Sanitise only if provided
		if (data.job_description !== undefined) {
			data.job_description = DOMPurify.sanitize(data.job_description);
		}

		// 4) Build update entries (ignore undefined)
		const updateData = Object.fromEntries(
			Object.entries(data).filter(([, v]) => v !== undefined),
		);

		if (Object.keys(updateData).length === 0) {
			return res.status(400).json({ error: "No valid fields to update" });
		}

		// 5) Create parameterised SQL
		const jobAd = await prisma.jobAd.update({
			where: { id },
			data: updateData,
		});

		if (!jobAd) {
			return res.status(404).json({ error: "Not found" });
		}

		return res.json(jobAd);
	} catch (e: any) {
		return res.status(500).json({ error: e.message ?? "Server error" });
	}
});

// DELETE:
router.delete("/:id", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		if (!id) throw Error("Id not found");

		const jobAd = await prisma.jobAd.delete({
			where: {
				id: id,
			},
		});

		if (!jobAd) {
			return res.status(404).json({ error: "Not found" });
		}
		return res.status(204).send();
	} catch (e: any) {
		return res.status(500).json({ error: e.message });
	}
});

export default router;
