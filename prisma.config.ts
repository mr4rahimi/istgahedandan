import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL!,
    // Only used by `prisma migrate dev` / `migrate diff --from-migrations` to
    // verify the migrations folder reproduces the schema. Never used at runtime,
    // and not needed in production.
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
