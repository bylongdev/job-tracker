import assert from "assert";
import { Pool } from "pg";
import { env } from "../config/env.js";

export const pool = new Pool({ connectionString: env.database });
