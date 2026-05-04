import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Seo from "@/components/Seo";
import { fetchPublicProject } from "@/lib/portfolio-api";

const ProjectDetail = () => {
  const { slug = "" } = useParams();

  const projectQuery = useQuery({
    queryKey: ["project", slug],
    queryFn: () => fetchPublicProject(slug),
    enabled: Boolean(slug),
  });

  if (projectQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading project...</p>
      </div>
    );
  }

  if (projectQuery.isError || !projectQuery.data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <h1 className="text-3xl font-bold mb-4 text-foreground">Project not found</h1>
          <p className="text-muted-foreground mb-6">The project you requested does not exist or was removed.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background">
            <ArrowLeft size={16} /> Back to home
          </Link>
        </div>
      </div>
    );
  }

  const project = projectQuery.data;
  const canonical = typeof window !== "undefined" ? `${window.location.origin}/projects/${project.slug}` : undefined;

  return (
    <main className="min-h-screen bg-background">
      <Seo
        title={`${project.title} | Work samples`}
        description={project.description}
        image={project.thumbnailUrl}
        canonical={canonical}
      />

      <section className="container py-8 md:py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft size={16} /> Back to projects
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="rounded-3xl overflow-hidden border border-border bg-card shadow-xl">
              <img
                src={project.thumbnailUrl}
                alt={project.title}
                className="w-full aspect-[16/10] object-cover"
                loading="eager"
                decoding="async"
              />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {project.images.map((image, index) => (
                <div key={`${project.id}-${index}`} className="rounded-2xl overflow-hidden border border-border bg-card">
                  <img
                    src={image}
                    alt={`${project.title} image ${index + 1}`}
                    className="w-full aspect-[4/3] object-cover"
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">{project.category}</p>
              <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">{project.title}</h1>
              <p className="text-muted-foreground leading-relaxed">{project.description}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span key={tech} className="text-xs px-3 py-1.5 rounded-full bg-secondary text-foreground font-medium">
                    {tech}
                  </span>
                ))}
              </div>

              <a
                href={project.productionUrl || "mailto:hello@example.com"}
                target={project.productionUrl ? "_blank" : undefined}
                rel={project.productionUrl ? "noreferrer" : undefined}
                className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-lg gradient-accent-bg text-primary-foreground text-sm font-medium"
              >
                <ExternalLink size={16} /> {project.productionUrl ? "Open live project" : "Start a similar project"}
              </a>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-card space-y-5">
              {[
                { label: "Overview", content: project.overview },
                { label: "Problem", content: project.problem },
                { label: "Solution", content: project.solution },
                { label: "Impact", content: project.impact },
              ].map((item) => (
                <div key={item.label}>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-2">{item.label}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.content}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default ProjectDetail;