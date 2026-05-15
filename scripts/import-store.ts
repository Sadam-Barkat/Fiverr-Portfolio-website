import path from "node:path";
import { promises as fs } from "node:fs";
import type { PortfolioStore } from "../server/portfolio-store.ts";
import { writeStore } from "../server/portfolio-store.ts";

const sourcePath = process.env.STORE_JSON_PATH || path.resolve(process.cwd(), "server-data", "portfolio-store.json");

const raw = await fs.readFile(sourcePath, "utf-8");
const parsed = JSON.parse(raw) as Partial<PortfolioStore>;

const store: PortfolioStore = {
  projects: parsed.projects ?? [],
  useCases: parsed.useCases ?? [],
  categories: parsed.categories ?? [],
};

await writeStore(store);

console.log(`Imported ${store.projects.length} projects, ${store.useCases.length} use cases, ${store.categories.length} categories.`);
