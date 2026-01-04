import { Router } from "express";
import type { Request, Response } from "express";
import requireAuth from "./middleware/requireAuth.js";
import { pool } from "../database/db.js";
import bcrypt from "bcrypt";

const router: Router = Router();

router.get("/health", (_req: Request, res: Response) => {
	return res.status(200).json({ status: "OK" });
});

router.get("/", requireAuth, (req: Request, res: Response) => {
	res.json({
		message: "Welcome to your protected dashboard!",
		userId: req.session.userId,
	});
});

// Signup API
router.post("/signup", async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;

		// Check if the email exists in the table
		const exists = (
			await pool.query(`SELECT id FROM users WHERE email = $1`, [email])
		).rows[0];

		if (exists) return res.status(409).json({ error: "User already exists" });

		// Encrypt the password
		const passwordHash = await bcrypt.hash(password, 12);

		// Add user into table
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

// Signin API
router.post("/signin", async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;

		// Authenticate user credentials here
		const user = await pool.query(
			"SELECT id, password_hash FROM users WHERE email = $1",
			[email]
		);

		// Check the email if exists
		if (user.rowCount == 0)
			return res.status(401).json({ error: "Invalid credentials" });

		// Check the password is matched with the encrypted one
		const isMatched = await bcrypt.compare(
			password,
			user.rows[0].password_hash
		);
		if (!isMatched)
			return res.status(401).json({ error: "Invalid credentials" });

		// Create server session
		// console.log(user.rows[0].id);
		req.session.userId = user.rows[0].id;

		req.session.save((err) => {
			if (err) return res.status(500).json({ error: "Session save failed" });
			res.json({ ok: true });
		});

		// return res.json({ ok: true });
	} catch (e: any) {
		return res.status(401).json(e.message);
	}
});

// Logout API
router.post("/signout", async (req: Request, res: Response) => {
	try {
		req.session.destroy(() => {
			res.clearCookie("sid");
			res.json({ ok: true });
		});
	} catch (e: any) {
		return res.status(401).json(e.message);
	}
});

export default router;
