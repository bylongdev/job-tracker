import { Router, type Request, type Response } from "express";
import { pool } from "../database/db.js";

const router: Router = Router();

// Health check
router.get("/health", (_req: Request, res: Response) => {
	return res.status(200).json({ status: "OK" });
});

// CRUD:
// CREATE:
router.post("/", async (req: Request, res: Response) => {
	try {
		const {
			name,
			role,
			working_at,
			linkedIn_url,
			email_address,
			phone_number,
			location,
		} = req.body;

		const result = await pool.query(
			`INSERT INTO recruiters (name, role, working_at, linkedIn_url, email_address, phone_number, location) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
			[
				name,
				role,
				working_at,
				linkedIn_url,
				email_address,
				phone_number,
				location,
			]
		);

		return res.status(200).json(result.rows[0]);
	} catch (e: any) {
		return res.status(500).json(e.message);
	}
});

// RETRIEVE:
// Retrieve All
router.get("/", async (_req: Request, res: Response) => {
	try {
		const result = await pool.query(
			"SELECT * FROM recruiters ORDER BY updated_at DESC"
		);

		if (result.rowCount === 0) return res.status(404).json("Data Not Found!");

		return res.status(200).json(result.rows);
	} catch (e: any) {
		return res.status(500).json(e.message);
	}
});

// Retrieve by id
router.get("/:id", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const result = await pool.query("SELECT * FROM recruiters WHERE id = $1", [
			id,
		]);

		if (result.rowCount === 0) return res.status(404).json("Data Not Found!");

		return res.status(200).json(result.rows[0]);
	} catch (e: any) {
		return res.status(500).json(e.message);
	}
});

// UPDATE:
router.patch("/:id", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const allowedList = new Set([
			"role",
			"working_at",
			"linkedIn_url",
			"email_address",
			"phone_number",
			"location",
		]);

		// Filter out key not valid and empty value
		const entries = Object.entries(req.body).filter(
			([key, value]) => allowedList.has(key) && value != undefined
		);

		// Return if not valid fields
		if (entries.length === 0) {
			return res.status(400).json({ error: "No valid fields to update" });
		}

		const sets: string[] = [];
		const params: any[] = [];

		for (const [key, value] of entries) {
			params.push(value);
			sets.push(`${key} = $${params.length}`);
		}

		// updated field updated_at to current timestamp
		sets.push("updated_at = NOW()");

		params.push(id);

		const sql = `UPDATE recruiters SET ${sets.join(", ")} WHERE id = $${
			params.length
		} RETURNING *`;

		const result = await pool.query(sql, params);

		if (result.rowCount === 0)
			return res.status(404).json({ error: "Not found" });

		return res.status(200).json(result.rows[0]);
	} catch (e: any) {
		return res.status(500).json(e.message);
	}
});

// DELETE:
router.delete("/:id", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const result = await pool.query(
			"DELETE FROM recruiters WHERE id = $1 RETURNING *",
			[id]
		);

		if (result.rowCount === 0) {
			return res.status(404).json({ error: "Not found" });
		}
		return res.status(204).json({ status: "OK" });
	} catch (e: any) {
		return res.status(500).json({ error: e.message });
	}
});

export default router;
