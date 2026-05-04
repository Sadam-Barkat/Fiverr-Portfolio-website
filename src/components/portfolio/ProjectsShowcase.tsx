import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, Bot, Code2, Cpu, Database, Globe, Monitor, Workflow, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchPublicCategories, fetchPublicProjects } from "@/lib/portfolio-api";

const categoryIcons: Record<string, typeof Bot> = {
  "AI Agent": Bot,
  "Backend API": Cpu,
  Automation: Workflow,
  "Data Pipeline": Database,
  "Full Stack App": Monitor,
  Chatbot: Bot,
  "Integration System": Globe,
};

export default function ProjectsShowcase() {
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const deferredFilter = useDeferredValue(filter);
  const limit = 12;

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const categoriesQuery = useQuery({
    queryKey: ["public-categories"],
    queryFn: fetchPublicCategories,
  });

  const projectsQuery = useQuery({
    queryKey: ["public-projects", deferredFilter, page],
    queryFn: () => fetchPublicProjects({ category: deferredFilter, page, limit }),
    placeholderData: keepPreviousData,
  });

  const categories = useMemo(() => ["All", ...(categoriesQuery.data ?? []).map((category) => category.name)], [categoriesQuery.data]);
  const projects = projectsQuery.data?.projects ?? [];
  const pagination = projectsQuery.data?.pagination;
  const isLoading = projectsQuery.isLoading && projects.length === 0;

  return (
    <section id="projects" className="py-24 md:py-32">
      <div className="container">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">Project samples</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Work you can show buyers</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Case-style summaries with thumbnails, project pages, and lazy-loaded images so buyers can scan quickly.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-14">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                filter === cat ? "bg-foreground text-background shadow-lg" : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-border bg-card p-3 animate-pulse">
                <div className="aspect-[4/3] rounded-xl bg-secondary mb-3" />
                <div className="h-3 w-16 bg-secondary rounded-full mb-2" />
                <div className="h-5 w-3/4 bg-secondary rounded-full mb-2" />
                <div className="h-3 w-full bg-secondary rounded-full mb-2" />
                <div className="h-3 w-5/6 bg-secondary rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {projects.map((project, index) => {
            const Icon = categoryIcons[project.category] || Code2;

            return (
              <article
                key={project.id}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              >
                <div className="block h-full">
                  {project.productionUrl ? (
                    <a href={project.productionUrl} target="_blank" rel="noreferrer" className="relative block overflow-hidden">
                      <img
                        src={project.thumbnailUrl}
                        alt={project.title}
                        className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        loading={index === 0 ? "eager" : "lazy"}
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      <div className="absolute left-4 top-4 flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center">
                          <Icon size={16} className="text-white" />
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/15 text-white uppercase tracking-[0.16em]">
                          {project.category}
                        </span>
                      </div>
                      <span className="absolute bottom-4 right-4 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md">
                        Live site
                      </span>
                    </a>
                  ) : (
                    <Link to={`/projects/${project.slug}`} className="relative block overflow-hidden">
                      <img
                        src={project.thumbnailUrl}
                        alt={project.title}
                        className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        loading={index === 0 ? "eager" : "lazy"}
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      <div className="absolute left-4 top-4 flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center">
                          <Icon size={16} className="text-white" />
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/15 text-white uppercase tracking-[0.16em]">
                          {project.category}
                        </span>
                      </div>
                    </Link>
                  )}

                  <div className="p-4 md:p-5">
                    <Link to={`/projects/${project.slug}`} className="inline-block">
                    <h3 className="text-lg md:text-xl font-bold mb-2 text-foreground leading-tight line-clamp-2">{project.title}</h3>
                    </Link>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-2">{project.description}</p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <span key={tech} className="text-[11px] px-2.5 py-1 rounded-full bg-secondary text-foreground font-medium">
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="text-[11px] px-2.5 py-1 rounded-full bg-secondary text-foreground font-medium">
                          +{project.technologies.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link to={`/projects/${project.slug}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                        View details <ArrowRight size={14} />
                      </Link>
                      {project.productionUrl && (
                        <a
                          href={project.productionUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground"
                        >
                          Open live site <ArrowRight size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
          </div>
        )}

        {!isLoading && projects.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No projects found for this category.</div>
        )}

        <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {pagination ? `Showing ${projects.length} of ${pagination.total} projects` : "Loading projects..."}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground disabled:opacity-50"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <span className="text-sm text-muted-foreground">
              Page {page}{pagination ? ` of ${pagination.totalPages}` : ""}
            </span>
            <button
              onClick={() => setPage((current) => current + 1)}
              disabled={!pagination || page >= pagination.totalPages}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground disabled:opacity-50"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}