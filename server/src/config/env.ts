import dotenv from "dotenv";
import path from "path";

// Extract the .env file from the parent folder
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

// Function: Return any match Key from the .env
const get = (key: string, fallback?: string) => {
	const value = process.env[key];
	if (value === undefined) {
		if (fallback !== undefined) return fallback;
		throw new Error(`Missing env: ${key}`);
	}

	return value;
};

export const env = {
	port: Number(get("PORT", "3000")),
	database: get("POSTGRES_URL", "postgresql://postgres:admin@127.0.0.1:5432"),
	SESSION_KEY: get("SESSION_SECRET"),
	NODE_ENV: get("NODE_ENV", "production"),
};
