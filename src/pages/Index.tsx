import Navbar from "@/components/portfolio/Navbar";
import HeroSection from "@/components/portfolio/HeroSection";
import TrustSection from "@/components/portfolio/TrustSection";
import ProjectsShowcase from "@/components/portfolio/ProjectsShowcase";
import UseCasesSection from "@/components/portfolio/UseCasesSection";
import TechStackSection from "@/components/portfolio/TechStackSection";
import ApproachSection from "@/components/portfolio/ApproachSection";
import Footer from "@/components/portfolio/Footer";
import Seo from "@/components/Seo";
import { useQuery } from "@tanstack/react-query";
import { fetchPublicUseCases } from "@/lib/portfolio-api";
import { defaultUseCases } from "@/data/portfolio-data";

const Index = () => {
  const useCasesQuery = useQuery({
    queryKey: ["public-use-cases"],
    queryFn: fetchPublicUseCases,
  });

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Work samples | freelance portfolio"
        description="Browse project case studies, AI systems, backend APIs, and automation work with detailed project pages and SEO-friendly previews."
      />
      <Navbar />
      <HeroSection />
      <ProjectsShowcase />
      <TrustSection />
      <UseCasesSection useCases={useCasesQuery.data ?? defaultUseCases} />
      <TechStackSection />
      <ApproachSection />
      <Footer />
    </div>
  );
};

export default Index;
