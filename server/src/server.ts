import app from "./app.js";
import dotenv from "dotenv";
import { initDB } from "./database/initDB.js";

dotenv.config();
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
	await initDB();
	console.log(`🚀 Server running on http://localhost:${PORT}`);
});
