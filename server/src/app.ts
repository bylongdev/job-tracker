import express, {
	type Application,
	type Request,
	type Response,
	type NextFunction,
} from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes/routes.js";
import requireAuth from "./routes/middleware/requireAuth.js";

import auth from "./routes/auth.js";

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes

app.use("/api/auth", auth);

// Mount all route under /api
app.use("/api", requireAuth, routes);

// Health check
app.use("/health", (_req: Request, res: Response, _next: NextFunction) => {
	return res.status(200).json({ msg: "OK" });
});

// 404
app.use((_req: Request, res: Response) => {
	res.status(404).json({ err: "Not Found" });
});

// error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
	console.error(err.message);
	res
		.status(err.status || 500)
		.json({ error: err.message || "Internal Error" });
});

export default app;
