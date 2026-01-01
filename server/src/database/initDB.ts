import { pool } from "./db.js";

export const initDB = async () => {
	try {
		// Check the connection
		const connected = await pool.query("SELECT 1 AS ok");
		console.log("DB connected:", connected.rows[0]);

		// Check access to the correct database
		const cur_db = await pool.query(`
			SELECT
				current_database() AS db,
				current_user AS user,
				inet_server_addr() AS server_ip,
				inet_server_port() AS server_port;
		`);
		console.log(cur_db.rows[0]);

		// Handle all the missing tables
		console.log("Building database ...");
		await pool.query(`
			CREATE EXTENSION IF NOT EXISTS pgcrypto;
			
			BEGIN;

			CREATE TABLE IF  NOT EXISTS public.users (
				id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
				email TEXT UNIQUE NOT NULL,
				password_hash TEXT NOT NULL,
				created_at TIMESTAMPTZ DEFAULT now()
			);

			CREATE TABLE IF NOT EXISTS public.recruiters (
				id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
				name varchar(255) NOT NULL,
				role varchar(255) NOT NULL DEFAULT 'Tech Recruiter',
				working_at varchar(255) NOT NULL,
				linkedin_url text,
				email varchar(255),
				phone varchar(50),
				location varchar(255),
				notes text,
				created_at timestamptz NOT NULL DEFAULT now(),
				updated_at timestamptz NOT NULL DEFAULT now()
			);

			CREATE TABLE IF NOT EXISTS public.job_ads (
				id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
				recruiter_id uuid REFERENCES public.recruiters(id),
				company_name varchar(255) NOT NULL,
				job_title varchar(255) NOT NULL,
				job_description text NOT NULL,
				published_at date NOT NULL,
				location varchar(255),
				job_type varchar(50) NOT NULL,
				source varchar(50) NOT NULL,
				url text NOT NULL UNIQUE,
				skill_requirements varchar(255)[],
				tech_stack varchar(255)[],
				expired_at date,
				salary_min integer,
				salary_max integer,
				created_at timestamptz NOT NULL DEFAULT now(),
				updated_at timestamptz NOT NULL DEFAULT now()
			);

			CREATE TABLE IF NOT EXISTS public.applications (
				id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
				job_ads_id uuid NOT NULL UNIQUE REFERENCES public.job_ads(id),
				status varchar(50) NOT NULL,
				stage varchar(50) NOT NULL,
				last_follow_up_at date,
				next_follow_up_at date,
				applied_at date NOT NULL,
				notes text,
				created_at timestamptz NOT NULL DEFAULT now(),
				updated_at timestamptz NOT NULL DEFAULT now()
			);

			COMMIT;
	  `);
		console.log("Successfully building database.");
	} catch (e) {
		console.error("DB connect test failed:", e);
		process.exit(1);
	}
};
