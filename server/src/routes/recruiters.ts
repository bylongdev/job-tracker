import { Router, type Request, type Response } from "express";
import { pool } from "../database/db.js";
import { createRecruiterSchema } from "../schema/recruiter.js";
import { prisma } from "../lib/prisma.js";

const router: Router = Router();

// Health check
router.get("/health", (_req: Request, res: Response) => {
	return res.status(200).json({ status: "OK" });
});

// CRUD:
// CREATE:
router.post("/", async (req: Request, res: Response) => {
	try {
		const parsed = createRecruiterSchema.safeParse(req.body);

		if (!parsed.success) {
			console.error(parsed.error);
			return res.status(400).json({ error: parsed.error });
		}

		const {
			name,
			role,
			working_at,
			linkedin_url,
			email,
			phone,
			location,
			note,
		} = parsed.data;

		const recruiter = await prisma.recruiter.create({
			data: {
				name: name,
				role: role,
				working_at: working_at,
				linkedin_url: linkedin_url || null,
				email: email || null,
				phone: phone || null,
				location: location || null,
				note: note || null,
			},
		});

		if (!recruiter) {
			return res.status(400).json({ error: "No valid fields to create" });
		}

		return res.status(200).json(recruiter);
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
		const recruiter = await prisma.recruiter.findMany({
			orderBy: {
				updated_at: "desc",
			},
		});

		if (recruiter) return res.status(404).json("Data Not Found!");

		return res.status(200).json(recruiter);
	} catch (e: any) {
		return res.status(500).json(e.message);
	}
});

// Retrieve by id
router.get("/:id", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		if (!id) throw Error("Id not found");

		const recruiter = await prisma.recruiter.findUnique({
			where: {
				id,
			},
		});

		if (!recruiter) return res.status(404).json("Data Not Found!");

		return res.status(200).json(recruiter);
	} catch (e: any) {
		return res.status(500).json(e.message);
	}
});

// UPDATE:
router.patch("/:id", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		if (!id) throw Error("Id not found");

		const allowed = new Set([
			"role",
			"working_at",
			"linkedin_url",
			"email",
			"phone",
			"location",
			"notes",
		]);

		// Filter out key not valid and empty value
		const data = Object.fromEntries(
			Object.entries(req.body ?? {}).filter(
				([k, v]) => allowed.has(k) && v !== undefined,
			),
		);
		// Return if not valid fields
		if (Object.keys(data).length === 0) {
			return res.status(400).json({ error: "No valid fields to update" });
		}

		const recruiter = await prisma.recruiter.update({
			where: { id },
			data: {
				...data,
			},
		});

		if (recruiter) return res.status(404).json({ error: "Not found" });

		return res.status(200).json(recruiter);
	} catch (e: any) {
		return res.status(500).json(e.message);
	}
});

// DELETE:
router.delete("/:id", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		if (!id) throw Error("Id not found");

		const recruiter = await prisma.recruiter.delete({
			where: { id },
		});

		if (recruiter) {
			return res.status(404).json({ error: "Not found" });
		}
		return res.status(204).send();
	} catch (e: any) {
		return res.status(500).json({ error: e.message });
	}
});

export default router;
