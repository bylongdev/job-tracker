import { Router } from "express";
import type { Request, Response } from "express";
import requireAuth from "./middleware/requireAuth.js";
import { signToken } from "./auth/jwt.js";
import { pool } from "../database/db.js";
import bcrypt from "bcrypt";

const router: Router = Router();

router.get("/health", (_req: Request, res: Response) => {
	return res.status(200).json({ status: "OK" });
});

router.get("/", requireAuth, (req: Request, res: Response) => {
	res.json({
		message: "Welcome to your protected dashboard!",
		userId: req.user.userId,
	});
});

router.post("/signup", async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;

		const exists = (
			await pool.query(`SELECT id FROM users WHERE email = $1`, [email])
		).rows[0];

		if (exists) return res.status(409).json({ error: "User already exists" });

		const passwordHash = await bcrypt.hash(password, 12);

		const result = await pool.query(
			"INSERT INTO users(email, password_hash) VALUES($1, $2) RETURNING *",
			[email, passwordHash]
		);

		if (result.rowCount == 0) return res.sendStatus(401);

		return res.status(201).json({ msg: "User Created!" });
	} catch (e: any) {
		return res.status(401).json(e.message);
	}
});

router.post("/signin", async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;

		// 1. Authenticate user credentials here
		const user = await pool.query(
			"SELECT id, password_hash FROM users WHERE email = $1",
			[email]
		);

		if (user.rowCount == 0)
			return res.status(401).json({ error: "Invalid credentials" });

		const isMatched = await bcrypt.compare(
			password,
			user.rows[0].password_hash
		);
		if (!isMatched)
			return res.status(401).json({ error: "Invalid credentials" });

		// 2. Generate Token
		const token = signToken({ userId: user.rows[0].id });

		return res.json({ token });
	} catch (e: any) {
		return res.status(401).json(e.message);
	}
});

export default router;
