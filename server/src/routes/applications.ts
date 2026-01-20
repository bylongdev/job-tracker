import { Router, type Request, type Response } from "express";
import { pool } from "../database/db.js";
import { createApplicationSchema } from "../schema/application.js";

const router: Router = Router();

// Health check
router.get("/health", (_req: Request, res: Response) => {
	return res.status(200).json({ status: "OK" });
});

// CRUD
// CREATE
router.post("/", async (req: Request, res: Response) => {
	try {
		const parsed = createApplicationSchema.safeParse(req.body);

		if (!parsed.success) {
			console.error(parsed.error);
			return res.status(400).json({ error: parsed.error });
		}

		const {
			status,
			stage,
			last_follow_up_at,
			next_follow_up_at,
			applied_at,
			note,
		} = parsed.data;

		const result = await pool.query(
			"INSERT INTO applications (status, stage, last_follow_up_at, next_follow_up_at, applied_at, note) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
			[status, stage, last_follow_up_at, next_follow_up_at, applied_at, note],
		);

		return res.status(200).json(result.rows[0]);
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

// RETRIEVE
// Retrieve all
router.get("/", async (_req: Request, res: Response) => {
	try {
		const result = await pool.query(
			"SELECT * FROM applications ORDER BY updated_at DESC",
		);

		if (result.rowCount === 0) return res.status(404).json("Not Found");

		return res.status(200).json(result.rows);
	} catch (e: any) {
		return res.status(500).json(e.message);
	}
});

// Retrieve by id
router.get("/:id", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const result = await pool.query(
			"SELECT * FROM applications WHERE id = $1 ORDER BY updated_at DESC",
			[id],
		);

		if (result.rowCount === 0) return res.status(404).json("Not Found");

		return res.status(200).json(result.rows[0]);
	} catch (e: any) {
		return res.status(500).json(e.message);
	}
});

// UPDATE
router.patch("/:id", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const allowedList = new Set([
			"status",
			"stage",
			"last_follow_up_at",
			"next_follow_up_at",
			"applied_at",
			"notes",
		]);

		const entries = Object.entries(req.body).filter(
			([key, value]) => allowedList.has(key) && value != undefined,
		);

		if (entries.length === 0)
			return res.status(400).json({ error: "No valid fields to update" });

		const sets: string[] = [];
		const params: any[] = [];

		for (const [key, value] of entries) {
			params.push(value);
			sets.push(`${key} = $${params.length}`);
		}

		sets.push("updated_at = NOW()");

		params.push(id);

		const sql = `UPDATE applications SET ${sets.join(", ")} WHERE id = $${
			params.length
		} RETURNING *`;

		const result = await pool.query(sql, params);

		if (result.rowCount === 0)
			return res.status(404).json({ error: "Not found" });

		return res.json(result.rows[0]);
	} catch (e: any) {
		return res.status(500).json(e.message);
	}
});

// DELETE:
router.delete("/:id", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const result = await pool.query(
			"DELETE FROM applications WHERE id = $1 RETURNING *",
			[id],
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
