import { application, Router, type Request, type Response } from "express";
import { pool } from "../database/db.js";
import { createApplicationSchema } from "../schema/application.js";
import { createApplicationTimelineSchema } from "../schema/application-timeline.js";
import { createFileSchema } from "../schema/file.js";
import { uploadSingle } from "./middleware/uploadFile.js";

import { prisma } from "../lib/prisma.js";

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
			if (!applicationId) return;

			const timeline = await prisma.applicationTimeline.create({
				data: {
					application_id: applicationId,
					event_type: "system",
					title: "Created",
				},
			});
			return timeline;
		};

		if (!parsed.success) {
			console.error(parsed.error);
			return res.status(400).json({ error: parsed.error });
		}

		const {
			job_ads_id,
			status,
			stage,
			last_follow_up_at,
			next_follow_up_at,
			applied_at,
			note,
		} = parsed.data;

		const application = await prisma.application.create({
			data: {
				job_ad_id: job_ads_id,
				status: status,
				stage: stage,
				last_follow_up_at: last_follow_up_at || null,
				next_follow_up_at: next_follow_up_at || null,
				applied_at: applied_at || null,
				note: note,
			},
		});

		initTimeline(application.id);

		return res.status(200).json(application);
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

		if (!id) throw Error("Id not found");

		const parsed = createApplicationTimelineSchema.safeParse(req.body);

		if (!parsed.success) {
			console.error(parsed.error);
			return res.status(400).json({ error: parsed.error });
		}

		const { event_type, title, description } = parsed.data;

		const timeline = await prisma.applicationTimeline.create({
			data: {
				application_id: id,
				event_type: event_type,
				title: title,
				description: description || null,
			},
		});

		return res.status(200).json(timeline);
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

			if (!id) throw Error("Id not found");

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

			const { source, category } = parsed.data;

			const file = await prisma.file.create({
				data: {
					application_id: id,
					file_name: file_name,
					file_type: file_type,
					mime_type: mime_type,
					size_bytes: size_bytes,
					source: source,
					category: category,
					storage_key: storage_key,
				},
			});

			return res.status(201).json(file);
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
		const application = await prisma.application.findMany({
			orderBy: {
				updated_at: "desc",
			},
		});

		if (!application) return res.status(404).json("Not Found");

		return res.status(200).json(application);
	} catch (e: any) {
		return res.status(500).json(e.message);
	}
});

// Retrieve by id
router.get("/:id", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		if (!id) throw Error("Id not found");

		const application = await prisma.application.findUniqueOrThrow({
			where: {
				id,
			},
		});

		return res.status(200).json(application);
	} catch (e: any) {
		if (e.code) return res.status(e.code).json(e.message);
		return res.status(500).json(e.message);
	}
});

// Retrive the timeline list base on application ID
router.get("/:id/timeline", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		if (!id) throw Error("Id not found");

		const timelines = await prisma.applicationTimeline.findMany({
			where: {
				application_id: id,
			},
			orderBy: {
				created_at: "desc",
			},
		});

		if (!timelines) return res.status(404).json("Not Found");

		return res.status(200).json(timelines);
	} catch (e: any) {
		return res.status(500).json(e.message);
	}
});

// Retrive the timeline list base on application ID
router.get("/:id/file", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		if (!id) throw Error("Id not found");

		const files = await prisma.file.findMany({
			where: {
				application_id: id,
			},
			orderBy: {
				created_at: "desc",
			},
		});

		return res.status(200).json(files);
	} catch (e: any) {
		return res.status(500).json(e.message);
	}
});

// UPDATE
router.patch("/:id", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		if (!id) throw Error("Id not found");

		const allowed = new Set([
			"status",
			"stage",
			"last_follow_up_at",
			"next_follow_up_at",
			"applied_at",
			"note",
		]);

		// keep allowed keys + drop undefined
		const data = Object.fromEntries(
			Object.entries(req.body ?? {}).filter(
				([k, v]) => allowed.has(k) && v !== undefined,
			),
		);

		if (Object.keys(data).length === 0) {
			return res.status(400).json({ error: "No valid fields to update" });
		}

		const application = await prisma.application.update({
			where: { id },
			data: {
				...data,
			},
		});

		if (!application) return res.status(404).json({ error: "Not found" });

		return res.json(application);
	} catch (e: any) {
		return res.status(500).json(e.message);
	}
});

// DELETE:
router.delete("/:id", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		if (!id) throw Error("Id not found");

		const application = await prisma.application.delete({
			where: { id },
		});

		if (!application) {
			return res.status(404).json({ error: "Not found" });
		}
		return res.status(204).send();
	} catch (e: any) {
		return res.status(500).json({ error: e.message });
	}
});

export default router;
