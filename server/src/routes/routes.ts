import { Router, type Request, type Response } from "express";

import job_ads from "./job_ads.js";
import recruiter from "./recruiters.js";
import application from "./applications.js";
import auth from "./auth.js";

const router: Router = Router();

// Health Check
router.get("/health", (_req: Request, res: Response) => {
	return res.status(200).json({ status: "OK" });
});

// Redirect to job_ads
router.use("/job_ads", job_ads);

// Redirect to recruiters
router.use("/recruiter", recruiter);

// Redirect to applications
router.use("/application", application);

// Redirect to Auth
router.use("/auth", auth);

export default router;
