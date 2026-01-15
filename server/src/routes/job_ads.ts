import { Router, type Request, type Response } from "express";
import { pool } from "../database/db.js";
import { createJobSchema } from "../schema/job_ads.js";
import z from "zod";

const router: Router = Router();

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

		const {
			company_name,
			job_title,
			job_description,
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
		} = parsed.data;

		const result = await pool.query(
			`
			INSERT INTO job_ads (
				company_name, job_title, job_description,
				published_at, location, job_type, source, url,
				skill_requirements, tech_stack, expired_at, salary_max, salary_min
				)
				VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
				RETURNING *
				`,
			[
				company_name,
				job_title,
				job_description,
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
			]
		);

		return res.status(201).json(result.rows[0]);
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
router.get("/", async (_req: Request, res: Response) => {
	try {
		// const { id, platform, job_title } = req.query;
		const result = await pool.query(
			"SELECT * FROM job_ads ORDER BY updated_at DESC"
		);

		if (result.rowCount === 0) {
			return res.status(404).json({ error: "Not found" });
		}
		return res.status(200).json(result.rows);
	} catch (e: any) {
		return res.status(500).json(e.message);
	}
});

// Retrieve data for job_ads table
router.get("/table", async (_req: Request, res: Response) => {
	try {
		const data = await pool.query(
			"SELECT id, company_name, job_title, job_type, location, source, published_at FROM job_ads ORDER BY updated_at DESC"
		);

		return res.status(200).json(data.rows);
	} catch (e: any) {
		return res.status(404).json({ msg: "Data not found!" });
	}
});

// Retrieve by id
router.get("/:id", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const data = await pool.query(
			"SELECT * FROM job_ads WHERE id = $1 ORDER BY updated_at DESC",
			[id]
		);

		return res.status(200).json(data.rows[0]);
	} catch (e: any) {
		return res.status(500).json(e.message);
	}
});

// UPDATE:

router.patch("/:id/recruiter", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { recruiter_id } = z
			.object({ recruiter_id: z.uuid() })
			.parse(req.body);

		if (recruiter_id) {
			const recruiterExists = await pool.query(
				`SELECT 1 FROM public.recruiters WHERE id = $1`,
				[recruiter_id]
			);
			if (recruiterExists.rowCount === 0) {
				return res.status(404).json({ error: "Recruiter not found" });
			}
		}

		const result = await pool.query(
			`
      UPDATE public.job_ads
      SET recruiter_id = $1, updated_at = now()
      WHERE id = $2
      RETURNING *
      `,
			[recruiter_id, id]
		);

		if (result.rowCount === 0) {
			return res.status(404).json({ error: "Job ad not found" });
		}

		return res.status(200).json({ data: result.rows[0] });
	} catch (e: any) {
		res.status(500).json({ error: e.message });
	}
});

router.patch("/:id", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
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

		// Filter out key not valid and empty value
		const entries = Object.entries(req.body).filter(
			([key, value]) => allowedList.has(key) && value != undefined
		);

		// Return if not valid fields
		if (entries.length === 0) {
			return res.status(400).json({ error: "No valid fields to update" });
		}

		const sets: string[] = []; // store the field
		const params: any[] = []; // store the value

		// loop through the entries to push the key and value into 2 array to perform sql injection
		for (const [key, value] of entries) {
			params.push(value);
			sets.push(`${key} = $${params.length}`);
		}

		// updated field updated_at to current timestamp
		sets.push("updated_at = NOW()");

		params.push(id);

		const sql = `UPDATE job_ads SET ${sets.join(", ")} WHERE id = $${
			params.length
		} RETURNING *`;

		const result = await pool.query(sql, params);

		if (result.rowCount === 0)
			return res.status(404).json({ error: "Not found" });

		return res.json(result.rows[0]);
	} catch (e: any) {
		res.status(500).json({ error: e.message });
	}
});

// DELETE:
router.delete("/:id", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const result = await pool.query(
			"DELETE FROM job_ads WHERE id = $1 RETURNING *",
			[id]
		);

		if (result.rowCount === 0) {
			return res.status(404).json({ error: "Not found" });
		}
		return res.status(204).send();
	} catch (e: any) {
		return res.status(500).json({ error: e.message });
	}
});

export default router;
