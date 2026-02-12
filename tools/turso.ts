import { createClient } from "@libsql/client";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env.local") });

export const turso = createClient({
    url: process.env.TURSO_URL!,
    authToken: process.env.TURSO_TOKEN!,
});
