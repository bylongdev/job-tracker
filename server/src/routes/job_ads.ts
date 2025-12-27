import { Router, type Request, type Response } from "express";
import { pool } from "../database/db.js";

const router: Router = Router();

// Health check
router.get("/health", (_req: Request, res: Response) => {
	return res.status(200).json({ status: "OK" });
});

// CREATE: insert obj into database
router.post("/", async (req: Request, res: Response) => {
	const {
		recruiter_id,
		company_name,
		job_title,
		job_description,
		published_at,
		location,
		job_type,
		platform,
		url,
		skill_requirements,
		tech_stack,
		expired_at,
		salary_range,
	} = req.body;

	const r = await pool.query(
		`
    INSERT INTO job_ads (
      recruiter_id, company_name, job_title, job_description,
      published_at, location, job_type, platform, url,
      skill_requirements, tech_stack, expired_at, salary_range
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    RETURNING *
    `,
		[
			recruiter_id,
			company_name,
			job_title,
			job_description,
			published_at,
			location,
			job_type,
			platform,
			url,
			skill_requirements,
			tech_stack,
			expired_at,
			salary_range,
		]
	);

	res.status(201).json(r.rows[0]);
});

// RETRIEVE:

// Retrieve All
router.get("/", async (req: Request, res: Response) => {
	const { id, platform, job_title } = req.query;
	console.log(id, platform, job_title);
	try {
		const data = await pool.query(
			"SELECT * FROM job_ads ORDER BY updated_at DESC"
		);

		return res.status(200).json(data.rows);
	} catch (e) {
		return res.status(500).json(e);
	}
});

// Retrieve by id
router.get("/:id", async (req: Request, res: Response) => {
	const { id } = req.params;
	try {
		const data = await pool.query(
			"SELECT * FROM job_ads WHERE id = $1 ORDER BY updated_at DESC",
			[id]
		);

		return res.status(200).json(data.rows);
	} catch (e) {
		return res.status(500).json(e);
	}
});

// UPDATE:

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
			"platform",
			"url",
			"skill_requirements",
			"tech_stack",
			"expired_at",
			"salary_range",
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
		if (e.code === "23505")
			return res.status(409).json({ error: "URL already exists" });
		res.status(500).json({ error: e.message });
	}
});

export default router;
