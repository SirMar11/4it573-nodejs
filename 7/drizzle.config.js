import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./db/schema.js",
  out: "./db/migrations",
  dbCredentials: {
    url: "sqlite.db",
  },
});