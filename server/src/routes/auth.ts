import { Router } from "express";
import type { Request, Response } from "express";
import requireAuth from "./middleware/requireAuth.js";
import { pool } from "../database/db.js";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";

const router: Router = Router();

router.get("/", requireAuth, (req: Request, res: Response) => {
	res.json({
		message: "Welcome to your protected dashboard!",
		userId: req.session.userId,
	});
});

// Signup API
router.post("/signup", async (req: Request, res: Response) => {
	try {
		const { email, password, name } = req.body;

		// Check if the email exists in the table
		const exists = await prisma.user.findUnique({
			where: {
				email: email,
			},
		});

		if (exists) return res.status(409).json({ error: "User already exists" });

		// Encrypt the password
		const passwordHash = await bcrypt.hash(password, 12);

		// Add user into table
		const result = await prisma.user.create({
			data: {
				name,
				email,
				password_hash: passwordHash,
			},
		});

		if (!result) return res.sendStatus(401);

		// Create server session
		req.session.userId = result.id;

		req.session.save((err) => {
			if (err) return res.status(500).json({ error: "Session save failed" });
			return res.status(201).json({ ok: true, userId: result.id });
		});
	} catch (e: any) {
		return res.status(401).json(e.message);
	}
});

// Login API
router.post("/login", async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;

		// Authenticate user credentials here
		const user = await prisma.user.findUnique({
			where: {
				email,
			},
		});

		// Check the email if exists
		if (!user) return res.status(401).json({ error: "Invalid credentials" });

		// Check the password is matched with the encrypted one
		const isMatched = await bcrypt.compare(password, user.password_hash);
		if (!isMatched)
			return res.status(401).json({ error: "Invalid credentials" });

		// Create server session
		req.session.userId = user.id;

		req.session.save((err) => {
			if (err) return res.status(500).json({ error: "Session save failed" });
			return res.json({ ok: true });
		});
	} catch (e: any) {
		return res.status(401).json(e.message);
	}
});

// Logout API
router.post("/logout", async (req: Request, res: Response) => {
	try {
		req.session.destroy(() => {
			res.clearCookie("jobtracker.sid");
			res.json({ ok: true });
		});
	} catch (e: any) {
		return res.status(401).json(e.message);
	}
});

export default router;
