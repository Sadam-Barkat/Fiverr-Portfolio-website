import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Plus, Trash2, X } from "lucide-react";
import { usePortfolioData } from "@/hooks/use-portfolio-data";
import { fileToUploadPayload, filesToUploadPayloads, logoutAdmin } from "@/lib/portfolio-api";
import type { Project, UseCase } from "@/data/portfolio-data";

type ProjectForm = {
  id?: string;
  title: string;
  description: string;
  technologiesText: string;
  category: string;
  useCase: string;
  overview: string;
  problem: string;
  solution: string;
  impact: string;
  productionUrl: string;
  slug: string;
  thumbnailUrl: string;
  imageUrlsText: string;
  thumbnailFile?: File | null;
  galleryFiles?: File[];
};

type UseCaseForm = Partial<UseCase>;
type CategoryForm = { id?: string; name: string };

const emptyProjectForm: ProjectForm = {
  title: "",
  description: "",
  technologiesText: "",
  category: "",
  useCase: "",
  overview: "",
  problem: "",
  solution: "",
  impact: "",
  productionUrl: "",
  slug: "",
  thumbnailUrl: "",
  imageUrlsText: "",
  thumbnailFile: null,
  galleryFiles: [],
};

const toProjectForm = (project?: Project | null): ProjectForm => {
  if (!project) {
    return emptyProjectForm;
  }

  return {
    id: project.id,
    title: project.title,
    description: project.description,
    technologiesText: project.technologies.join(", "),
    category: project.category,
    useCase: project.useCase,
    overview: project.overview,
    problem: project.problem,
    solution: project.solution,
    impact: project.impact,
    productionUrl: project.productionUrl,
    slug: project.slug,
    thumbnailUrl: project.thumbnailUrl,
    imageUrlsText: project.images.join("\n"),
    thumbnailFile: null,
    galleryFiles: [],
  };
};

const toCategoryForm = (name?: string): CategoryForm => ({ name: name ?? "" });

export default function AdminDashboard() {
  const navigate = useNavigate();
  const {
    projects,
    useCases,
    categories,
    addProject,
    updateProject,
    deleteProject,
    addUseCase,
    updateUseCase,
    deleteUseCase,
    addCategory,
    updateCategory,
    deleteCategory,
    isAuthenticated,
    isLoading,
  } = usePortfolioData();
  const [tab, setTab] = useState<"projects" | "usecases" | "categories">("projects");
  const [editingProject, setEditingProject] = useState<ProjectForm | null>(null);
  const [editingUseCase, setEditingUseCase] = useState<UseCaseForm | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryForm | null>(null);
  const [saving, setSaving] = useState(false);

  const categoryNames = useMemo(() => categories.map((category) => category.name), [categories]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/admin");
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (editingProject && !editingProject.category && categoryNames.length > 0) {
      setEditingProject((current) => (current ? { ...current, category: categoryNames[0] } : current));
    }
  }, [categoryNames, editingProject]);

  const handleSaveProject = async () => {
    if (!editingProject?.title) return;
    setSaving(true);

    try {
      const galleryFiles = editingProject.galleryFiles && editingProject.galleryFiles.length > 0
        ? await filesToUploadPayloads(editingProject.galleryFiles)
        : [];
      const thumbnailFile = editingProject.thumbnailFile ? await fileToUploadPayload(editingProject.thumbnailFile) : null;
      const imageUrls = editingProject.imageUrlsText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      const payload = {
        title: editingProject.title,
        description: editingProject.description,
        technologies: editingProject.technologiesText.split(",").map((item) => item.trim()).filter(Boolean),
        category: editingProject.category,
        useCase: editingProject.useCase,
        overview: editingProject.overview,
        problem: editingProject.problem,
        solution: editingProject.solution,
        impact: editingProject.impact,
        productionUrl: editingProject.productionUrl,
        slug: editingProject.slug,
        thumbnailUrl: editingProject.thumbnailUrl,
        images: imageUrls,
        thumbnailFile,
        galleryFiles,
      };

      if (editingProject.id) {
        await updateProject(editingProject.id, payload);
      } else {
        await addProject(payload);
      }

      setEditingProject(null);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveUseCase = async () => {
    if (!editingUseCase?.title) return;
    setSaving(true);

    try {
      const data = {
        title: editingUseCase.title || "",
        description: editingUseCase.description || "",
        thumbnailUrl: editingUseCase.thumbnailUrl || "",
      };
      if (editingUseCase.id) {
        await updateUseCase(editingUseCase.id, data);
      } else {
        await addUseCase(data);
      }

      setEditingUseCase(null);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCategory = async () => {
    if (!editingCategory?.name.trim()) return;
    setSaving(true);

    try {
      const payload = { name: editingCategory.name.trim() };
      if (editingCategory.id) {
        await updateCategory(editingCategory.id, payload);
      } else {
        await addCategory(payload);
      }

      setEditingCategory(null);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    navigate("/admin");
  };

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading admin panel...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground">
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-lg font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <button onClick={handleLogout} className="text-sm text-muted-foreground hover:text-foreground">
            Logout
          </button>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex flex-wrap gap-2 mb-8">
          {(["projects", "usecases", "categories"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === t ? "gradient-accent-bg text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}
            >
              {t === "projects" ? "Projects" : t === "usecases" ? "Use Cases" : "Categories"}
            </button>
          ))}
        </div>

        {tab === "projects" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Projects ({projects.length})</h2>
              <button
                onClick={() => setEditingProject(toProjectForm(null))}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg gradient-accent-bg text-primary-foreground text-sm font-medium"
              >
                <Plus size={16} /> Add Project
              </button>
            </div>

            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.id} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{project.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {project.category} · {project.technologies.length} technologies
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setEditingProject(toProjectForm(project))} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => deleteProject(project.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "usecases" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Use Cases ({useCases.length})</h2>
              <button
                onClick={() => setEditingUseCase({})}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg gradient-accent-bg text-primary-foreground text-sm font-medium"
              >
                <Plus size={16} /> Add Use Case
              </button>
            </div>

            <div className="space-y-3">
              {useCases.map((useCase) => (
                <div key={useCase.id} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{useCase.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{useCase.description}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setEditingUseCase(useCase)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => deleteUseCase(useCase.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "categories" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Categories ({categories.length})</h2>
              <button
                onClick={() => setEditingCategory(toCategoryForm())}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg gradient-accent-bg text-primary-foreground text-sm font-medium"
              >
                <Plus size={16} /> Add Category
              </button>
            </div>

            <div className="space-y-3">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{category.name}</h3>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setEditingCategory({ id: category.id, name: category.name })} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => deleteCategory(category.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {editingProject !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground">{editingProject.id ? "Edit" : "Add"} Project</h3>
              <button onClick={() => setEditingProject(null)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {(["title", "slug", "useCase"] as const).map((field) => (
                <div key={field}>
                  <label className="text-sm font-medium text-foreground block mb-1.5 capitalize">
                    {field === "useCase" ? "Use Case" : field}
                  </label>
                  <input
                    value={editingProject[field]}
                    onChange={(e) => setEditingProject((current) => (current ? { ...current, [field]: e.target.value } : current))}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              ))}

              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Category</label>
                <select
                  value={editingProject.category}
                  onChange={(e) => setEditingProject((current) => (current ? { ...current, category: e.target.value } : current))}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categoryNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground block mb-1.5">Production URL</label>
                <input
                  value={editingProject.productionUrl}
                  onChange={(e) => setEditingProject((current) => (current ? { ...current, productionUrl: e.target.value } : current))}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground block mb-1.5">Description</label>
                <textarea
                  value={editingProject.description}
                  onChange={(e) => setEditingProject((current) => (current ? { ...current, description: e.target.value } : current))}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              {(["overview", "problem", "solution", "impact"] as const).map((field) => (
                <div key={field} className="md:col-span-2">
                  <label className="text-sm font-medium text-foreground block mb-1.5 capitalize">{field}</label>
                  <textarea
                    value={editingProject[field]}
                    onChange={(e) => setEditingProject((current) => (current ? { ...current, [field]: e.target.value } : current))}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>
              ))}

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground block mb-1.5">Technologies (comma-separated)</label>
                <input
                  value={editingProject.technologiesText}
                  onChange={(e) => setEditingProject((current) => (current ? { ...current, technologiesText: e.target.value } : current))}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground block mb-1.5">Thumbnail URL</label>
                <input
                  value={editingProject.thumbnailUrl}
                  onChange={(e) => setEditingProject((current) => (current ? { ...current, thumbnailUrl: e.target.value } : current))}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Upload thumbnail file</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditingProject((current) => (current ? { ...current, thumbnailFile: e.target.files?.[0] || null } : current))}
                  className="w-full text-sm text-muted-foreground"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Upload gallery files</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setEditingProject((current) => (current ? { ...current, galleryFiles: e.target.files ? Array.from(e.target.files) : [] } : current))}
                  className="w-full text-sm text-muted-foreground"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground block mb-1.5">Gallery image URLs</label>
                <textarea
                  value={editingProject.imageUrlsText}
                  onChange={(e) => setEditingProject((current) => (current ? { ...current, imageUrlsText: e.target.value } : current))}
                  rows={4}
                  placeholder="One URL per line"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              <div className="md:col-span-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {editingProject.imageUrlsText
                  .split("\n")
                  .map((image) => image.trim())
                  .filter(Boolean)
                  .slice(0, 6)
                  .map((image, index) => (
                    <div key={`${image}-${index}`} className="rounded-xl overflow-hidden border border-border bg-secondary/40">
                      <img src={image} alt={`Gallery preview ${index + 1}`} className="w-full aspect-[4/3] object-cover" />
                    </div>
                  ))}
              </div>

              <div className="md:col-span-2 flex gap-3 pt-2">
                <button onClick={handleSaveProject} disabled={saving} className="px-6 py-2.5 rounded-lg gradient-accent-bg text-primary-foreground text-sm font-medium disabled:opacity-60">
                  {saving ? "Saving..." : "Save"}
                </button>
                <button onClick={() => setEditingProject(null)} className="px-6 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingUseCase !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground">{editingUseCase.id ? "Edit" : "Add"} Use Case</h3>
              <button onClick={() => setEditingUseCase(null)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Title</label>
                <input
                  value={editingUseCase.title || ""}
                  onChange={(e) => setEditingUseCase({ ...editingUseCase, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Thumbnail URL</label>
                <input
                  value={editingUseCase.thumbnailUrl || ""}
                  onChange={(e) => setEditingUseCase({ ...editingUseCase, thumbnailUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Description</label>
                <textarea
                  value={editingUseCase.description || ""}
                  onChange={(e) => setEditingUseCase({ ...editingUseCase, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSaveUseCase} disabled={saving} className="px-6 py-2.5 rounded-lg gradient-accent-bg text-primary-foreground text-sm font-medium disabled:opacity-60">
                  {saving ? "Saving..." : "Save"}
                </button>
                <button onClick={() => setEditingUseCase(null)} className="px-6 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingCategory !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground">{editingCategory.id ? "Edit" : "Add"} Category</h3>
              <button onClick={() => setEditingCategory(null)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Name</label>
                <input
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSaveCategory} disabled={saving} className="px-6 py-2.5 rounded-lg gradient-accent-bg text-primary-foreground text-sm font-medium disabled:opacity-60">
                  {saving ? "Saving..." : "Save"}
                </button>
                <button onClick={() => setEditingCategory(null)} className="px-6 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}