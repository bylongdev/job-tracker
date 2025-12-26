import { pool } from "./db.js";

export const initDB = async () => {
	try {
		const connected = await pool.query("SELECT 1 AS ok");
		console.log("DB connected:", connected.rows[0]);

		const cur_db = await pool.query(`
  SELECT
    current_database() AS db,
    current_user AS user,
    inet_server_addr() AS server_ip,
    inet_server_port() AS server_port;
`);
		console.log(cur_db.rows[0]);

		console.log("Building database ...");
		const res = await pool.query(`
	  BEGIN;

	  CREATE EXTENSION IF NOT EXISTS pgcrypto;

	  CREATE TABLE IF NOT EXISTS public.recruiters (
	    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	    name varchar(255) NOT NULL,
	    role varchar(255) NOT NULL DEFAULT 'Tech Recruiter',
	    working_at varchar(255) NOT NULL,
	    linkedin_url text,
	    email_address varchar(255),
	    phone_number varchar(50),
	    location varchar(255),
	    updated_at timestamptz NOT NULL DEFAULT now()
	  );

	  CREATE TABLE IF NOT EXISTS public.job_ads (
	    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	    recruiter_id uuid NOT NULL REFERENCES public.recruiters(id),
	    company_name varchar(255) NOT NULL,
	    job_title varchar(255) NOT NULL,
	    job_description text NOT NULL,
	    published_at date NOT NULL,
	    location varchar(255),
	    job_type varchar(50) NOT NULL,
	    platform varchar(50) NOT NULL,
	    url text NOT NULL,
	    skill_requirements varchar(255)[],
	    tech_stack varchar(255)[],
	    expired_at date,
	    salary_range varchar(50),
	    updated_at timestamptz NOT NULL DEFAULT now()
	  );

	  CREATE TABLE IF NOT EXISTS public.applications (
	    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	    job_ads_id uuid NOT NULL REFERENCES public.job_ads(id),
	    status varchar(50) NOT NULL,
	    applied_at date NOT NULL,
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
