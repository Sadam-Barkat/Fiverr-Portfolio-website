import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { defaultCategories, defaultProjects, defaultUseCases } from "../src/data/portfolio-defaults.ts";
import type { Category, Project, UseCase } from "../src/data/portfolio-defaults.ts";

export interface PortfolioStore {
  projects: Project[];
  useCases: UseCase[];
  categories: Category[];
}

type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  technologies: unknown;
  category: string | null;
  use_case: string | null;
  overview: string | null;
  problem: string | null;
  solution: string | null;
  impact: string | null;
  production_url: string | null;
  thumbnail_url: string | null;
  images: unknown;
};

type UseCaseRow = {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
};

type CategoryRow = {
  id: string;
  name: string;
};

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
const databaseSsl = process.env.DATABASE_SSL === "true";

const pool = new Pool({
  connectionString: databaseUrl || undefined,
  ssl: databaseSsl ? { rejectUnauthorized: false } : undefined,
});

let schemaReady = false;

const fallbackStore: PortfolioStore = {
  projects: defaultProjects,
  useCases: defaultUseCases,
  categories: defaultCategories,
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const defaultProjectBySlug = new Map(defaultProjects.map((project) => [project.slug, project]));
const defaultUseCaseByTitle = new Map(defaultUseCases.map((useCase) => [useCase.title.toLowerCase(), useCase]));

const parseJsonArray = (value: unknown) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const ensureSchema = async () => {
  if (schemaReady) return;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for the portfolio store.");
  }

  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        technologies JSONB,
        category TEXT,
        use_case TEXT,
        overview TEXT,
        problem TEXT,
        solution TEXT,
        impact TEXT,
        production_url TEXT,
        thumbnail_url TEXT,
        images JSONB
      );

      CREATE TABLE IF NOT EXISTS use_cases (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        thumbnail_url TEXT
      );

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL
      );
    `);
    schemaReady = true;
  } finally {
    client.release();
  }
};

export function normalizeUseCase(useCase: Partial<UseCase>): UseCase {
  const fallback = useCase.title ? defaultUseCaseByTitle.get(useCase.title.trim().toLowerCase()) : undefined;
  return {
    id: useCase.id || randomUUID(),
    title: useCase.title?.trim() || "Untitled Use Case",
    description: useCase.description?.trim() || fallback?.description || "",
    thumbnailUrl: useCase.thumbnailUrl?.trim() || fallback?.thumbnailUrl || "",
  };
}

export async function ensureStore() {
  await ensureSchema();

  const client = await pool.connect();
  try {
    const projectCount = await client.query("SELECT COUNT(*)::int AS count FROM projects");
    const useCaseCount = await client.query("SELECT COUNT(*)::int AS count FROM use_cases");
    const categoryCount = await client.query("SELECT COUNT(*)::int AS count FROM categories");
    const total = projectCount.rows[0].count + useCaseCount.rows[0].count + categoryCount.rows[0].count;

    if (total === 0) {
      await writeStore(fallbackStore);
    }
  } finally {
    client.release();
  }
}

export async function readStore(): Promise<PortfolioStore> {
  await ensureStore();

  const client = await pool.connect();
  try {
    const projectsResult = await client.query<ProjectRow>("SELECT * FROM projects");
    const useCasesResult = await client.query<UseCaseRow>("SELECT * FROM use_cases");
    const categoriesResult = await client.query<CategoryRow>("SELECT * FROM categories");

    return {
      projects: projectsResult.rows.map((row) =>
        normalizeProject({
          id: row.id,
          slug: row.slug,
          title: row.title,
          description: row.description ?? "",
          technologies: parseJsonArray(row.technologies),
          category: row.category ?? "",
          useCase: row.use_case ?? "",
          overview: row.overview ?? "",
          problem: row.problem ?? "",
          solution: row.solution ?? "",
          impact: row.impact ?? "",
          productionUrl: row.production_url ?? "",
          thumbnailUrl: row.thumbnail_url ?? "",
          images: parseJsonArray(row.images),
        })
      ),
      useCases: useCasesResult.rows.map((row) =>
        normalizeUseCase({
          id: row.id,
          title: row.title,
          description: row.description ?? "",
          thumbnailUrl: row.thumbnail_url ?? "",
        })
      ),
      categories: categoriesResult.rows.map((row) =>
        normalizeCategory({
          id: row.id,
          name: row.name,
        })
      ),
    };
  } finally {
    client.release();
  }
}

export async function writeStore(store: PortfolioStore) {
  await ensureSchema();

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM projects");
    await client.query("DELETE FROM use_cases");
    await client.query("DELETE FROM categories");

    for (const category of store.categories.map((item) => normalizeCategory(item))) {
      await client.query("INSERT INTO categories (id, name) VALUES ($1, $2)", [category.id, category.name]);
    }

    for (const project of store.projects.map((item) => normalizeProject(item))) {
      await client.query(
        `INSERT INTO projects (
          id,
          slug,
          title,
          description,
          technologies,
          category,
          use_case,
          overview,
          problem,
          solution,
          impact,
          production_url,
          thumbnail_url,
          images
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          project.id,
          project.slug,
          project.title,
          project.description,
          JSON.stringify(project.technologies),
          project.category,
          project.useCase,
          project.overview,
          project.problem,
          project.solution,
          project.impact,
          project.productionUrl,
          project.thumbnailUrl,
          JSON.stringify(project.images),
        ]
      );
    }

    for (const useCase of store.useCases.map((item) => normalizeUseCase(item))) {
      await client.query("INSERT INTO use_cases (id, title, description, thumbnail_url) VALUES ($1, $2, $3, $4)", [
        useCase.id,
        useCase.title,
        useCase.description,
        useCase.thumbnailUrl,
      ]);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export function normalizeProject(project: Partial<Project>): Project {
  const title = project.title?.trim() || "Untitled Project";
  const slug = project.slug?.trim() || slugify(title) || randomUUID();
  const fallback = defaultProjectBySlug.get(slug) || defaultProjects.find((item) => item.title.toLowerCase() === title.toLowerCase());
  const thumbnailUrl = project.thumbnailUrl?.trim() || project.images?.[0] || "";
  const images = Array.isArray(project.images) ? project.images.filter(Boolean) : [];

  return {
    id: project.id || randomUUID(),
    slug,
    title,
    description: project.description?.trim() || "",
    technologies: Array.isArray(project.technologies) ? project.technologies.filter(Boolean) : [],
    category: project.category?.trim() || "",
    useCase: project.useCase?.trim() || "",
    overview: project.overview?.trim() || "",
    problem: project.problem?.trim() || "",
    solution: project.solution?.trim() || "",
    impact: project.impact?.trim() || "",
    productionUrl: project.productionUrl?.trim() || fallback?.productionUrl || "",
    thumbnailUrl: thumbnailUrl || fallback?.thumbnailUrl || "",
    images: images.length > 0 ? images : (thumbnailUrl || fallback?.thumbnailUrl ? [thumbnailUrl || fallback?.thumbnailUrl || ""] : []),
  };
}

export function normalizeCategory(category: Partial<Category>): Category {
  const name = category.name?.trim() || "Untitled Category";
  return {
    id: category.id || slugify(name) || randomUUID(),
    name,
  };
}