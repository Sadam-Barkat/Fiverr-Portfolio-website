export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  technologies: string[];
  category: string;
  useCase: string;
  overview: string;
  problem: string;
  solution: string;
  impact: string;
  productionUrl: string;
  thumbnailUrl: string;
  images: string[];
}

export interface UseCase {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
}

export interface Category {
  id: string;
  name: string;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const createPlaceholderImage = (title: string, accent: string, subtitle: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="${title}">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${accent}"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#g)"/>
      <circle cx="980" cy="120" r="220" fill="rgba(255,255,255,0.08)"/>
      <circle cx="180" cy="680" r="180" fill="rgba(255,255,255,0.08)"/>
      <text x="80" y="170" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="48" font-weight="700">${title}</text>
      <text x="80" y="240" fill="rgba(255,255,255,0.82)" font-family="Inter, Arial, sans-serif" font-size="28">${subtitle}</text>
      <rect x="80" y="310" width="360" height="18" rx="9" fill="rgba(255,255,255,0.22)"/>
      <rect x="80" y="350" width="250" height="18" rx="9" fill="rgba(255,255,255,0.18)"/>
      <rect x="80" y="420" width="520" height="180" rx="28" fill="rgba(15,23,42,0.45)"/>
      <rect x="120" y="470" width="440" height="18" rx="9" fill="rgba(255,255,255,0.28)"/>
      <rect x="120" y="510" width="360" height="18" rx="9" fill="rgba(255,255,255,0.22)"/>
      <rect x="120" y="550" width="300" height="18" rx="9" fill="rgba(255,255,255,0.18)"/>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.replace(/\n\s+/g, " "))}`;
};

const projectSeeds = [
  {
    id: "1",
    title: "AI Customer Support Agent",
    description: "Intelligent conversational agent that handles customer inquiries, routes tickets, and resolves common issues autonomously using natural language understanding.",
    technologies: ["Python", "LangChain", "OpenAI", "FastAPI", "PostgreSQL"],
    category: "AI Agent",
    useCase: "Customer service automation for SaaS platforms",
    overview: "A production-ready AI agent that reduces support ticket volume by handling routine inquiries through natural conversation.",
    problem: "Growing support teams struggle to scale with customer demand, leading to slow response times and inconsistent service quality.",
    solution: "Built a multi-turn conversational agent using LangChain with retrieval-augmented generation (RAG) to access knowledge bases, integrated with existing ticketing systems via webhooks.",
    impact: "Reduced average response time from 4 hours to under 30 seconds for common inquiries, handling 60% of incoming tickets autonomously.",
    productionUrl: "https://example.com/ai-customer-support-agent",
  },
  {
    id: "2",
    title: "Automated Data Processing Pipeline",
    description: "End-to-end data pipeline that ingests, transforms, validates, and loads large datasets from multiple sources into a unified analytics warehouse.",
    technologies: ["Python", "Node.js", "PostgreSQL", "REST API", "Docker"],
    category: "Data Pipeline",
    useCase: "ETL automation for analytics teams",
    overview: "A robust data pipeline handling millions of records daily with built-in error recovery and monitoring.",
    problem: "Manual data processing was error-prone, time-consuming, and couldn't scale with increasing data volumes from multiple business sources.",
    solution: "Designed an event-driven pipeline architecture with schema validation, automatic retry logic, and real-time monitoring dashboards.",
    impact: "Processing time reduced from 8 hours of manual work to 15 minutes of automated execution with 99.9% data accuracy.",
    productionUrl: "https://example.com/automated-data-processing-pipeline",
  },
  {
    id: "3",
    title: "REST API for SaaS Platform",
    description: "Scalable RESTful API serving as the backbone for a multi-tenant SaaS application with role-based access control and rate limiting.",
    technologies: ["Node.js", "TypeScript", "PostgreSQL", "REST API", "Docker"],
    category: "Backend API",
    useCase: "Core API infrastructure for SaaS products",
    overview: "A high-performance API layer designed for multi-tenancy, handling thousands of concurrent requests with sub-100ms response times.",
    problem: "The existing monolithic backend couldn't support growing user base and required significant downtime for deployments.",
    solution: "Architected a modular API with proper separation of concerns, comprehensive middleware stack, and automated deployment pipeline.",
    impact: "Achieved 99.95% uptime, supporting 10x user growth without infrastructure changes.",
    productionUrl: "https://example.com/rest-api-for-saas-platform",
  },
  {
    id: "4",
    title: "RAG-Based Knowledge Chatbot",
    description: "Enterprise knowledge management chatbot that answers questions by retrieving and synthesizing information from internal documents and databases.",
    technologies: ["Python", "LangChain", "LangGraph", "OpenAI", "FastAPI"],
    category: "Chatbot",
    useCase: "Internal knowledge retrieval for enterprises",
    overview: "An intelligent chatbot that makes organizational knowledge accessible through natural language queries.",
    problem: "Employees spent significant time searching through scattered documentation, wikis, and databases to find information needed for their work.",
    solution: "Implemented a RAG pipeline with semantic search across multiple document stores, using LangGraph for complex multi-step reasoning workflows.",
    impact: "Reduced information retrieval time by 75%, with 92% accuracy on benchmark queries against internal knowledge bases.",
    productionUrl: "https://example.com/rag-based-knowledge-chatbot",
  },
  {
    id: "5",
    title: "Full Stack Dashboard System",
    description: "Real-time analytics dashboard with interactive visualizations, customizable widgets, and automated report generation for business stakeholders.",
    technologies: ["React", "TypeScript", "Node.js", "PostgreSQL", "REST API"],
    category: "Full Stack App",
    useCase: "Business intelligence and reporting",
    overview: "A comprehensive dashboard providing real-time insights into business metrics with drill-down capabilities and scheduled reporting.",
    problem: "Decision-makers relied on manually compiled spreadsheets that were outdated by the time they were distributed.",
    solution: "Built a real-time dashboard with WebSocket updates, configurable alert thresholds, and PDF report generation on custom schedules.",
    impact: "Enabled data-driven decision making with real-time visibility, reducing report preparation time from days to seconds.",
    productionUrl: "https://example.com/full-stack-dashboard-system",
  },
  {
    id: "6",
    title: "Workflow Automation Tool",
    description: "Configurable automation engine that connects business tools, triggers actions based on events, and eliminates manual repetitive processes.",
    technologies: ["Node.js", "TypeScript", "REST API", "PostgreSQL", "Docker"],
    category: "Automation",
    useCase: "Business process automation",
    overview: "A flexible automation platform that connects disparate business systems and automates multi-step workflows.",
    problem: "Teams wasted hours daily on repetitive tasks like data entry, status updates, and cross-platform synchronization.",
    solution: "Created an event-driven automation engine with a visual workflow builder, supporting conditional logic, error handling, and audit logging.",
    impact: "Automated 40+ recurring workflows, saving approximately 120 hours of manual work per month across the organization.",
    productionUrl: "https://example.com/workflow-automation-tool",
  },
  {
    id: "7",
    title: "Multi-Provider AI Gateway",
    description: "Unified API gateway for managing multiple AI model providers with intelligent routing, caching, fallback strategies, and usage analytics.",
    technologies: ["Python", "FastAPI", "OpenAI", "PostgreSQL", "Docker"],
    category: "AI Agent",
    useCase: "AI infrastructure management",
    overview: "A centralized gateway that abstracts AI provider complexity and optimizes cost and performance across multiple models.",
    problem: "Applications using multiple AI providers faced inconsistent APIs, no fallback mechanisms, and difficulty tracking costs across providers.",
    solution: "Built a unified gateway with provider abstraction, smart routing based on cost/latency/capability, semantic caching, and comprehensive usage dashboards.",
    impact: "Reduced AI API costs by 35% through intelligent caching and routing while improving reliability with automatic failover.",
    productionUrl: "https://example.com/multi-provider-ai-gateway",
  },
  {
    id: "8",
    title: "E-Commerce Integration Hub",
    description: "Centralized integration platform connecting e-commerce stores with inventory, shipping, accounting, and CRM systems in real-time.",
    technologies: ["Node.js", "TypeScript", "REST API", "MongoDB", "Docker"],
    category: "Integration System",
    useCase: "E-commerce operations integration",
    overview: "A middleware platform that synchronizes data across the entire e-commerce technology stack in real-time.",
    problem: "Online retailers managed multiple disconnected systems, leading to inventory discrepancies, delayed shipments, and manual reconciliation.",
    solution: "Developed a webhook-driven integration hub with bi-directional sync, conflict resolution, and comprehensive error handling across all connected platforms.",
    impact: "Eliminated inventory sync delays from hours to real-time, reducing overselling incidents by 95% and manual reconciliation effort by 80%.",
    productionUrl: "https://example.com/e-commerce-integration-hub",
  },
] as const;

const palette = ["#0f766e", "#0ea5e9", "#1d4ed8", "#7c3aed", "#0f172a", "#134e4a", "#1e3a8a", "#475569"];

export const defaultProjects: Project[] = projectSeeds.map((project, index) => {
  const slug = slugify(project.title);
  const accent = palette[index % palette.length];
  const secondary = palette[(index + 3) % palette.length];
  const thumbnailUrl = createPlaceholderImage(project.title, accent, project.category);

  return {
    ...project,
    slug,
    productionUrl: project.productionUrl,
    thumbnailUrl,
    images: [
      thumbnailUrl,
      createPlaceholderImage(`${project.title} detail`, secondary, project.useCase),
      createPlaceholderImage(`${project.title} architecture`, accent, project.technologies.slice(0, 3).join(" • ")),
    ],
  };
});

export const defaultUseCases: UseCase[] = [
  {
    id: "1",
    title: "Automating Repetitive Workflows",
    description: "Identify and eliminate manual processes by building custom automation that connects your existing tools and handles routine tasks without human intervention.",
    thumbnailUrl: createPlaceholderImage("Workflow Automation", "#0f766e", "Visual process flows, triggers, and integrations"),
  },
  {
    id: "2",
    title: "Building AI Assistants",
    description: "Create intelligent AI agents that understand your business context, interact with users naturally, and perform complex tasks using advanced language models.",
    thumbnailUrl: createPlaceholderImage("AI Assistants", "#1d4ed8", "Conversational UI, reasoning, and tool use"),
  },
  {
    id: "3",
    title: "Creating Scalable Backend APIs",
    description: "Design and implement robust API architectures that handle growing traffic, maintain high availability, and integrate seamlessly with frontend applications.",
    thumbnailUrl: createPlaceholderImage("Scalable APIs", "#0ea5e9", "High-throughput services and clean contracts"),
  },
  {
    id: "4",
    title: "Integrating Third-Party Services",
    description: "Connect disparate systems and services into unified workflows, enabling data flow between platforms and eliminating information silos.",
    thumbnailUrl: createPlaceholderImage("Service Integrations", "#7c3aed", "Sync data across tools and systems"),
  },
  {
    id: "5",
    title: "Processing Large Datasets",
    description: "Build efficient data pipelines that ingest, transform, and analyze large volumes of data, turning raw information into actionable business insights.",
    thumbnailUrl: createPlaceholderImage("Data Pipelines", "#134e4a", "ETL, validation, and analytics views"),
  },
  {
    id: "6",
    title: "Building Internal Tools",
    description: "Develop custom internal applications and dashboards tailored to your team's specific needs, improving operational efficiency and decision-making.",
    thumbnailUrl: createPlaceholderImage("Internal Tools", "#475569", "Dashboards, admin panels, and ops tooling"),
  },
];

export const technologies = [
  "Next.js", "React", "TypeScript", "Node.js", "Python", "FastAPI",
  "LangChain", "LangGraph", "OpenAI", "PostgreSQL", "MongoDB", "MySQL", "REST API",
];

export const defaultCategories: Category[] = Array.from(
  new Set(projectSeeds.map((project) => project.category)),
).map((name) => ({
  id: slugify(name),
  name,
}));