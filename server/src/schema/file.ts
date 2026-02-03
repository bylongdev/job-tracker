import z from "zod";

export const createFileSchema = z.object({
	source: z.enum(["manual", "auto"]).default("manual"),
	category: z.enum(["OTHER", "RESUME", "COVER_LETTER"]).default("OTHER"),
});
