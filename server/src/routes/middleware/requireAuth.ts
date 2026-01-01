import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

declare global {
	namespace Express {
		interface Request {
			user?: any;
		}
	}
}

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
	const header = req.headers.authorization;
	const token = header?.split(" ")[1];

	if (!token) return res.status(401).json({ error: "No token" });

	try {
		jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
			if (err) {
				return res.sendStatus(403); // If token is invalid or expired, forbidden
			}
			req.user = user; // Add decoded user payload to the request object
			next(); // Proceed to the next middleware or route handler
		});
	} catch {
		return res.status(401).json({ error: "Invalid token" });
	}
};

export default requireAuth;
