import type { Request, Response, NextFunction } from "express";

export default function requireAuth(
	req: Request,
	res: Response,
	next: NextFunction
) {
	console.log(req.session.userId);
	if (!req.session?.userId)
		return res.status(401).json({ error: "Unauthorised" });
	next();
}
