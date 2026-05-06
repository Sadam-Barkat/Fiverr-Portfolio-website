import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import { ensureStore, normalizeProject, readStore, writeStore } from "./portfolio-store.ts";
import { normalizeCategory } from "./portfolio-store.ts";
import type { Category, Project, UseCase } from "../src/data/portfolio-defaults.ts";

const app = express();
const port = Number(process.env.PORT || 8787);
const adminUsername = process.env.ADMIN_USERNAME || "admin";
const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
const sessions = new Set<string>();

const uploadsRoot = path.resolve(process.cwd(), "public", "uploads", "projects");
const distDir = path.resolve(process.cwd(), "dist");

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "25mb" }));
app.use("/uploads", express.static(path.resolve(process.cwd(), "public", "uploads")));

app.get("/", (_req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Portfolio API</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; margin: 40px; color: #0f172a; }
      code { background: #f1f5f9; padding: 2px 6px; border-radius: 6px; }
      a { color: #2563eb; text-decoration: none; }
      a:hover { text-decoration: underline; }
      ul { line-height: 1.8; }
    </style>
  </head>
  <body>
    <h1>Portfolio API is running</h1>
    <p>Try:</p>
    <ul>
      <li><a href="/api/health"><code>/api/health</code></a></li>
      <li><a href="/api/public/projects"><code>/api/public/projects</code></a></li>
      <li><a href="/api/public/use-cases"><code>/api/public/use-cases</code></a></li>
      <li><a href="/api/public/categories"><code>/api/public/categories</code></a></li>
    </ul>
  </body>
</html>`);
});

type UploadedImage = {
  name?: string;
  mimeType?: string;
  dataUrl: string;
};

type ProjectPayload = Partial<Project> & {
  thumbnailFile?: UploadedImage | null;
  galleryFiles?: UploadedImage[];
};

type CategoryPayload = Partial<Category>;

const isAuthenticated = (req: express.Request) => {
  const sessionToken = req.cookies?.admin_session;
  return Boolean(sessionToken && sessions.has(sessionToken));
};

const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const createFallbackImage = (label: string, accent: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="${label}">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${accent}"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#g)"/>
      <text x="80" y="160" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="54" font-weight="700">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.replace(/\n\s+/g, " "))}`;
};

const palette = ["#0f766e", "#0ea5e9", "#1d4ed8", "#7c3aed", "#0f172a", "#134e4a", "#1e3a8a", "#475569"];

async function storeUploadedImage(upload: UploadedImage, slug: string, kind: string) {
  const match = upload.dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    return upload.dataUrl;
  }

  const mimeType = upload.mimeType || match[1];
  const base64 = match[2];
  const extension = mimeType.includes("png") ? "png" : mimeType.includes("webp") ? "webp" : mimeType.includes("gif") ? "gif" : "jpg";
  const folder = path.join(uploadsRoot, slug);
  await fs.mkdir(folder, { recursive: true });

  const fileName = `${kind}-${randomUUID()}.${extension}`;
  const filePath = path.join(folder, fileName);
  await fs.writeFile(filePath, Buffer.from(base64, "base64"));
  return `/uploads/projects/${slug}/${fileName}`;
}

async function resolveProjectImages(project: ProjectPayload, slug: string, existing?: Project) {
  const accent = palette[Math.abs(slug.length) % palette.length];
  const fallbackThumbnail = createFallbackImage(project.title || existing?.title || "Project", accent);

  const thumbnailUrl = project.thumbnailFile
    ? await storeUploadedImage(project.thumbnailFile, slug, "thumbnail")
    : (project.thumbnailUrl?.trim() || existing?.thumbnailUrl || fallbackThumbnail);

  const existingImages = Array.isArray(project.images) && project.images.length > 0 ? project.images : existing?.images || [];
  const galleryUploads = Array.isArray(project.galleryFiles) ? project.galleryFiles : [];
  const galleryUrls: string[] = [];

  for (const image of galleryUploads) {
    galleryUrls.push(await storeUploadedImage(image, slug, "gallery"));
  }

  const combinedImages = [thumbnailUrl, ...existingImages.filter((image) => image !== thumbnailUrl), ...galleryUrls].filter(Boolean);

  return {
    thumbnailUrl,
    images: Array.from(new Set(combinedImages)),
  };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };

  if (username !== adminUsername || password !== adminPassword) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = randomUUID();
  sessions.add(token);
  res.cookie("admin_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 1000 * 60 * 60 * 24,
  });
  res.json({ authenticated: true });
});

app.post("/api/admin/logout", (req, res) => {
  const token = req.cookies?.admin_session;
  if (token) {
    sessions.delete(token);
  }

  res.clearCookie("admin_session", { path: "/" });
  res.json({ authenticated: false });
});

app.get("/api/admin/me", (req, res) => {
  res.json({ authenticated: isAuthenticated(req) });
});

app.get("/api/public/projects", async (req, res) => {
  const store = await readStore();
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(24, Math.max(1, Number(req.query.limit || 6)));
  const category = typeof req.query.category === "string" ? req.query.category : "All";

  const filtered = category === "All" ? store.projects : store.projects.filter((project) => project.category === category);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pageProjects = filtered.slice((page - 1) * limit, page * limit);

  res.json({
    projects: pageProjects,
    pagination: { page, limit, total, totalPages },
  });
});

app.get("/api/public/projects/:slug", async (req, res) => {
  const store = await readStore();
  const project = store.projects.find((item) => item.slug === req.params.slug);

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.json({ project });
});

app.get("/api/public/use-cases", async (_req, res) => {
  const store = await readStore();
  res.json({ useCases: store.useCases });
});

app.get("/api/public/categories", async (_req, res) => {
  const store = await readStore();
  res.json({ categories: store.categories });
});

app.get("/api/admin/projects", requireAdmin, async (_req, res) => {
  const store = await readStore();
  res.json({ projects: store.projects });
});

app.get("/api/admin/use-cases", requireAdmin, async (_req, res) => {
  const store = await readStore();
  res.json({ useCases: store.useCases });
});

app.get("/api/admin/categories", requireAdmin, async (_req, res) => {
  const store = await readStore();
  res.json({ categories: store.categories });
});

app.post("/api/admin/projects", requireAdmin, async (req, res) => {
  const store = await readStore();
  const payload = req.body as ProjectPayload;
  const slug = payload.slug?.trim() || slugify(payload.title || "project") || randomUUID();
  const images = await resolveProjectImages(payload, slug);
  const productionUrl = payload.productionUrl?.trim() || "";
  const project = normalizeProject({ ...payload, slug, ...images });
  project.productionUrl = productionUrl;

  store.projects = [...store.projects, project];
  await writeStore(store);
  res.status(201).json({ project });
});

app.put("/api/admin/projects/:id", requireAdmin, async (req, res) => {
  const store = await readStore();
  const existing = store.projects.find((project) => project.id === req.params.id);

  if (!existing) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const payload = req.body as ProjectPayload;
  const slug = payload.slug?.trim() || existing.slug;
  const images = await resolveProjectImages(payload, slug, existing);
  const updated = normalizeProject({ ...existing, ...payload, slug, ...images, id: existing.id });
  updated.productionUrl = payload.productionUrl?.trim() || existing.productionUrl;

  store.projects = store.projects.map((project) => (project.id === existing.id ? updated : project));
  await writeStore(store);
  res.json({ project: updated });
});

app.delete("/api/admin/projects/:id", requireAdmin, async (req, res) => {
  const store = await readStore();
  store.projects = store.projects.filter((project) => project.id !== req.params.id);
  await writeStore(store);
  res.status(204).send();
});

app.post("/api/admin/use-cases", requireAdmin, async (req, res) => {
  const store = await readStore();
  const payload = req.body as Partial<UseCase>;
  const useCase: UseCase = {
    id: payload.id || randomUUID(),
    title: payload.title?.trim() || "Untitled Use Case",
    description: payload.description?.trim() || "",
    thumbnailUrl: payload.thumbnailUrl?.trim() || "",
  };

  store.useCases = [...store.useCases, useCase];
  await writeStore(store);
  res.status(201).json({ useCase });
});

app.put("/api/admin/use-cases/:id", requireAdmin, async (req, res) => {
  const store = await readStore();
  const payload = req.body as Partial<UseCase>;
  const updated = store.useCases.find((useCase) => useCase.id === req.params.id);

  if (!updated) {
    res.status(404).json({ error: "Use case not found" });
    return;
  }

  const next = {
    ...updated,
    title: payload.title?.trim() || updated.title,
    description: payload.description?.trim() || updated.description,
    thumbnailUrl: payload.thumbnailUrl?.trim() || updated.thumbnailUrl,
  };

  store.useCases = store.useCases.map((useCase) => (useCase.id === updated.id ? next : useCase));
  await writeStore(store);
  res.json({ useCase: next });
});

app.delete("/api/admin/use-cases/:id", requireAdmin, async (req, res) => {
  const store = await readStore();
  store.useCases = store.useCases.filter((useCase) => useCase.id !== req.params.id);
  await writeStore(store);
  res.status(204).send();
});

app.post("/api/admin/categories", requireAdmin, async (req, res) => {
  const store = await readStore();
  const payload = req.body as CategoryPayload;
  const category = normalizeCategory(payload);

  if (store.categories.some((existing) => existing.name.toLowerCase() === category.name.toLowerCase())) {
    res.status(409).json({ error: "Category already exists" });
    return;
  }

  store.categories = [...store.categories, category];
  await writeStore(store);
  res.status(201).json({ category });
});

app.put("/api/admin/categories/:id", requireAdmin, async (req, res) => {
  const store = await readStore();
  const existing = store.categories.find((category) => category.id === req.params.id);

  if (!existing) {
    res.status(404).json({ error: "Category not found" });
    return;
  }

  const payload = req.body as CategoryPayload;
  const updated = normalizeCategory({ ...existing, ...payload, id: existing.id });

  store.categories = store.categories.map((category) => (category.id === existing.id ? updated : category));
  store.projects = store.projects.map((project) => (project.category === existing.name ? { ...project, category: updated.name } : project));
  await writeStore(store);
  res.json({ category: updated });
});

app.delete("/api/admin/categories/:id", requireAdmin, async (req, res) => {
  const store = await readStore();
  const existing = store.categories.find((category) => category.id === req.params.id);

  if (!existing) {
    res.status(404).json({ error: "Category not found" });
    return;
  }

  const inUse = store.projects.some((project) => project.category === existing.name);
  if (inUse) {
    res.status(409).json({ error: "Category is in use by one or more projects" });
    return;
  }

  store.categories = store.categories.filter((category) => category.id !== existing.id);
  await writeStore(store);
  res.status(204).send();
});

app.use(async (req, res, next) => {
  if (req.path.startsWith("/api")) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const indexPath = path.join(distDir, "index.html");
  try {
    await fs.access(indexPath);
    res.sendFile(indexPath);
  } catch {
    next();
  }
});

await ensureStore();

app.listen(port, () => {
  console.log(`Portfolio API running on http://localhost:${port}`);
});