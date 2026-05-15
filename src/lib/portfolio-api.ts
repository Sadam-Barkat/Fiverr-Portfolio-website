import type { Category, Project, UseCase } from "@/data/portfolio-data";

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProjectListResponse {
  projects: Project[];
  pagination: PaginationInfo;
}

export interface UseCaseListResponse {
  useCases: UseCase[];
}

export interface CategoryListResponse {
  categories: Category[];
}

export interface AdminSessionResponse {
  authenticated: boolean;
}

export interface UploadedImagePayload {
  name?: string;
  mimeType?: string;
  dataUrl: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export type ProjectInput = Omit<Project, "id" | "slug" | "thumbnailUrl" | "images"> & {
  id?: string;
  slug?: string;
  thumbnailUrl?: string;
  images?: string[];
  productionUrl?: string;
  thumbnailFile?: UploadedImagePayload | null;
  galleryFiles?: UploadedImagePayload[];
};

export type UseCaseInput = Omit<UseCase, "id"> & { id?: string };

const jsonHeaders = {
  "Content-Type": "application/json",
};

const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const apiUrl = (path: string) => (apiBase ? new URL(path, apiBase).toString() : path);

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(apiUrl(path), {
    credentials: "include",
    ...options,
    headers: {
      ...jsonHeaders,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function fetchPublicProjects(params: { page?: number; limit?: number; category?: string } = {}) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.category) search.set("category", params.category);
  return apiFetch<ProjectListResponse>(`/api/public/projects?${search.toString()}`);
}

export async function fetchPublicProject(slug: string) {
  const response = await apiFetch<{ project: Project }>(`/api/public/projects/${slug}`);
  return response.project;
}

export async function fetchPublicUseCases() {
  const response = await apiFetch<UseCaseListResponse>("/api/public/use-cases");
  return response.useCases;
}

export async function fetchPublicCategories() {
  const response = await apiFetch<CategoryListResponse>("/api/public/categories");
  return response.categories;
}

export async function fetchAdminSession() {
  return apiFetch<AdminSessionResponse>("/api/admin/me");
}

export async function loginAdmin(payload: LoginPayload) {
  return apiFetch<AdminSessionResponse>("/api/admin/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function logoutAdmin() {
  return apiFetch<AdminSessionResponse>("/api/admin/logout", {
    method: "POST",
  });
}

export async function fetchAdminProjects() {
  const response = await apiFetch<{ projects: Project[] }>("/api/admin/projects");
  return response.projects;
}

export async function fetchAdminUseCases() {
  const response = await apiFetch<{ useCases: UseCase[] }>("/api/admin/use-cases");
  return response.useCases;
}

export async function fetchAdminCategories() {
  const response = await apiFetch<{ categories: Category[] }>("/api/admin/categories");
  return response.categories;
}

export async function createProject(payload: ProjectInput) {
  const response = await apiFetch<{ project: Project }>("/api/admin/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.project;
}

export async function updateProject(id: string, payload: ProjectInput) {
  const response = await apiFetch<{ project: Project }>(`/api/admin/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return response.project;
}

export async function deleteProject(id: string) {
  await apiFetch<void>(`/api/admin/projects/${id}`, { method: "DELETE" });
}

export async function createUseCase(payload: UseCaseInput) {
  const response = await apiFetch<{ useCase: UseCase }>("/api/admin/use-cases", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.useCase;
}

export async function updateUseCase(id: string, payload: UseCaseInput) {
  const response = await apiFetch<{ useCase: UseCase }>(`/api/admin/use-cases/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return response.useCase;
}

export async function deleteUseCase(id: string) {
  await apiFetch<void>(`/api/admin/use-cases/${id}`, { method: "DELETE" });
}

export async function createCategory(payload: { name: string }) {
  const response = await apiFetch<{ category: Category }>("/api/admin/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.category;
}

export async function updateCategory(id: string, payload: { name: string }) {
  const response = await apiFetch<{ category: Category }>(`/api/admin/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return response.category;
}

export async function deleteCategory(id: string) {
  await apiFetch<void>(`/api/admin/categories/${id}`, { method: "DELETE" });
}

export async function fileToUploadPayload(file: File): Promise<UploadedImagePayload> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsDataURL(file);
  });

  return {
    name: file.name,
    mimeType: file.type,
    dataUrl,
  };
}

export async function filesToUploadPayloads(files: FileList | File[]) {
  return Promise.all(Array.from(files).map((file) => fileToUploadPayload(file)));
}