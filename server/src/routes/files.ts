import { Router, type Request, type Response } from "express";
import { pool } from "../database/db.js";
import path from "path";
import fs from "fs";
import { prisma } from "../lib/prisma.js";

const router: Router = Router();

// Health check
router.get("/health", (_req: Request, res: Response) => {
	return res.status(200).json({ status: "OK" });
});

// CRUD

// RETRIEVE

// All
router.get("/", async (_req: Request, res: Response) => {
	try {
		const result = await pool.query("SELECT * FROM files");

		const files = await prisma.files.findMany({
			orderBy: { created_at: "desc" },
		});

		if (files) {
			return res.status(404).json({ error: "Not found" });
		}
		return res.status(200).json(files);
	} catch (e: any) {
		console.error("DB ERROR:", e);

		return res.status(500).json({
			message: "Internal server error",
			detail: e.message,
		});
	}
});

router.get("/:id", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		if (!id) throw Error("Id not found");

		const result = await pool.query("SELECT * FROM files WHERE id = $1", [id]);

		const file = await prisma.files.findUnique({
			where: { id },
		});

		if (file) {
			return res.status(404).json({ error: "Not found" });
		}
		return res.status(200).json(file);
	} catch (e: any) {
		return res.status(500).json({ error: e.message });
	}
});

router.get("/:id/download", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		if (!id) throw Error("Id not found");

		const result = await pool.query(
			"SELECT file_name, storage_key, mime_type FROM files WHERE id = $1",
			[id],
		);

		const file = await prisma.files.findUnique({
			where: { id },
		});

		if (!file) {
			return res.status(404).json({ message: "File not found" });
		}

		const { file_name, storage_key, mime_type } = file;

		const filePath = path.join(process.cwd(), "uploads", storage_key);

		if (!fs.existsSync(filePath)) {
			return res.status(404).json({ message: "File missing on disk" });
		}

		res.setHeader("Content-Type", mime_type);
		res.setHeader("Content-Disposition", `attachment; filename="${file_name}"`);

		fs.createReadStream(filePath).pipe(res);
	} catch (e: any) {
		console.error("DOWNLOAD ERROR:", e);
		return res.status(500).json({ error: e.message });
	}
});

router.get("/:id/view", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		if (!id) throw Error("Id not found");

		const result = await pool.query(
			"SELECT file_name, storage_key, mime_type FROM files WHERE id = $1",
			[id],
		);

		const file = await prisma.files.findUnique({
			where: { id },
		});

		if (!file) {
			return res.status(404).json({ message: "File not found" });
		}

		const { file_name, storage_key, mime_type } = file;

		const filePath = path.join(process.cwd(), "uploads", storage_key);

		if (!fs.existsSync(filePath)) {
			return res.status(404).json({ message: "File missing on disk" });
		}

		res.setHeader("Content-Type", mime_type);
		res.setHeader("Content-Disposition", `inline; filename="${file_name}"`);

		fs.createReadStream(filePath).pipe(res);
	} catch (e: any) {
		console.error("DOWNLOAD ERROR:", e);
		return res.status(500).json({ error: e.message });
	}
});

// DELETE
router.delete("/:id", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		if (!id) throw Error("Id not found");

		const found = await pool.query(
			"SELECT id, storage_key FROM files WHERE id = $1",
			[id],
		);

		const file = await prisma.files.findUniqueOrThrow({
			where: { id },
		});

		if (!file) {
			return res.status(file).json({ error: "Not found" });
		}

		const filePathFromDb = file.storage_key as string;

		const absolutePath = path.isAbsolute(filePathFromDb)
			? filePathFromDb
			: path.join(process.cwd(), "/uploads", filePathFromDb);

		try {
			await fs.unlink(absolutePath, (err) => {
				if (err) throw err;
				console.log("path/file.txt was deleted");
			});
		} catch (err: any) {
			if (err?.code !== "ENOENT") throw err; // ENOENT = file not found
		}

		const result = await prisma.files.delete({
			where: { id },
		});

		if (!result) {
			throw Error(`Delete ${id} failed`);
		}

		return res.status(204).send();
	} catch (e: any) {
		return res.status(500).json({ error: e.message });
	}
});

export default router;
