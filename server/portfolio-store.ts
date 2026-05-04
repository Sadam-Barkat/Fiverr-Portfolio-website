import path from "node:path";
import { promises as fs } from "node:fs";
import { randomUUID } from "node:crypto";
import { defaultCategories, defaultProjects, defaultUseCases } from "../src/data/portfolio-defaults.ts";
import type { Category, Project, UseCase } from "../src/data/portfolio-defaults.ts";

export interface PortfolioStore {
  projects: Project[];
  useCases: UseCase[];
  categories: Category[];
}

const dataDir = path.resolve(process.cwd(), "server-data");
const dataFile = path.join(dataDir, "portfolio-store.json");

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
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, JSON.stringify(fallbackStore, null, 2), "utf-8");
  }
}

export async function readStore(): Promise<PortfolioStore> {
  await ensureStore();
  const raw = await fs.readFile(dataFile, "utf-8");
  const parsed = JSON.parse(raw) as Partial<PortfolioStore>;
  return {
    projects: Array.isArray(parsed.projects) ? parsed.projects.map((project) => normalizeProject(project)) : fallbackStore.projects,
    useCases: Array.isArray(parsed.useCases) ? parsed.useCases.map((useCase) => normalizeUseCase(useCase)) : fallbackStore.useCases,
    categories: Array.isArray(parsed.categories) ? parsed.categories.map((category) => normalizeCategory(category)) : fallbackStore.categories,
  };
}

export async function writeStore(store: PortfolioStore) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(store, null, 2), "utf-8");
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