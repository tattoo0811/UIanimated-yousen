import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local from parent directory
config({ path: resolve(__dirname, '../../.env.local') });

export default defineConfig({
    out: './drizzle',
    schema: './schema.ts',
    dialect: 'turso',
    dbCredentials: {
        url: process.env.TURSO_URL!,
        authToken: process.env.TURSO_TOKEN!,
    },
});
