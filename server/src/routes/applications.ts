import { Router, type Request, type Response } from "express";
import { pool } from "../database/db.js";
import { createApplicationSchema } from "../schema/application.js";
import { createApplicationTimelineSchema } from "../schema/application-timeline.js";
import { createFileSchema } from "../schema/file.js";
import { uploadSingle } from "./middleware/uploadFile.js";

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

		// Function to initialise the timeline for the application
		const initTimeline = async (applicationId: string) => {
			const res = await pool.query(
				"INSERT INTO application_timeline (application_id, event_type, title) VALUES ($1,$2,$3)",
				[applicationId, "system", "Application Created"],
			);
			return res.rows[0];
		};

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

		initTimeline(result.rows[0].id);

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

// Create a new timeline for the application
router.post("/:id/timeline", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const parsed = createApplicationTimelineSchema.safeParse(req.body);

		if (!parsed.success) {
			console.error(parsed.error);
			return res.status(400).json({ error: parsed.error });
		}

		const { event_type, title, description } = parsed.data;

		const result = await pool.query(
			"INSERT INTO application_timeline (application_id, event_type, title, description) values ($1,$2,$3,$4) RETURNING *",
			[id, event_type, title, description],
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

router.post(
	"/:id/file/upload",
	uploadSingle,
	async (req: Request, res: Response) => {
		try {
			const { id } = req.params;

			if (!req.file)
				return res.status(400).json({ message: "file is required" });

			const parsed = createFileSchema.safeParse(req.body);

			if (!parsed.success) {
				console.error(parsed.error);
				return res.status(400).json({ error: parsed.error });
			}

			const file_name = req.file.originalname;
			const mime_type = req.file.mimetype;
			const size_bytes = req.file.size;
			const storage_key = req.file.filename;
			const file_type =
				mime_type === "application/pdf"
					? "pdf"
					: mime_type.startsWith("image/")
						? "image"
						: mime_type === "application/msword" ||
							  mime_type ===
									"application/vnd.openxmlformats-officedocument.wordprocessingml.document"
							? "doc"
							: "other";

			const { source } = parsed.data;

			const result = await pool.query(
				"INSERT INTO files (application_id, file_name, file_type, mime_type, size_bytes, source, storage_key) values ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
				[id, file_name, file_type, mime_type, size_bytes, source, storage_key],
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
	},
);

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

// Retrive the timeline list base on application ID
router.get("/:id/timeline", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const result = await pool.query(
			"SELECT * FROM application_timeline WHERE application_id = $1",
			[id],
		);

		if (result.rowCount === 0) return res.status(404).json("Not Found");

		return res.status(200).json(result.rows);
	} catch (e: any) {
		return res.status(500).json(e.message);
	}
});

// Retrive the timeline list base on application ID
router.get("/:id/file", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const result = await pool.query(
			"SELECT * FROM files WHERE application_id = $1",
			[id],
		);

		return res.status(200).json(result.rows);
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
