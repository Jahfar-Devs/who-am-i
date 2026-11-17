// Seed content for the whole site. Everything here is editable from /admin.
// The shape of this object is the content schema: `Content` is derived from it.

export const SECTION_IDS = [
  "stats",
  "marquee",
  "about",
  "services",
  "projects",
  "experience",
  "skills",
  "credentials",
  "testimonials",
  "contact",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

/** A labelled screen in a project's gallery. */
type Shot = { image: string; label: string };

export const defaultContent = {
  site: {
    name: "Jahfar Swadikh K",
    logoText: "jsk",
    logoAccent: ".dev",
    logoImage: "/logo.png",
    title: "Jahfar Swadikh K — MERN Stack Developer",
    description:
      "MERN stack developer building multi-tenant SaaS and ERP platforms end to end: schema, APIs, auth, payments and deployment.",
    accent: "#C8F751",
    cursor: true,
    smoothScroll: true,
  },
  loader: {
    enabled: true,
    durationMs: 2600,
    topLeft: "JAHFAR SWADIKH K — PORTFOLIO",
    topRight: "BOOT SEQUENCE · V 2026",
    lines: [
      { text: "resolving tenant", detail: "jahfar.dev" },
      { text: "connecting database", detail: "mongodb://atlas" },
      { text: "verifying session", detail: "jwt · rbac ok" },
      { text: "mounting routes", detail: "490 endpoints" },
    ],
    finalLine: "rendering portfolio",
    footer: "GET / → 200 OK",
  },
  nav: {
    links: [
      { label: "/about", href: "#about" },
      { label: "/work", href: "#projects" },
      { label: "/experience", href: "#experience" },
      { label: "/stack", href: "#skills" },
      { label: "/contact", href: "#contact" },
    ],
    ctaLabel: "Start a project",
    ctaHref: "#contact",
  },
  hero: {
    status: "200 OK — Available for new work · Calicut, Kerala",
    firstLine: "Jahfar",
    outlineWord: "Swadikh",
    lastWord: "K",
    tagline:
      "MERN stack developer building multi-tenant SaaS and ERP platforms end to end — schema, APIs, auth, payments and deployment.",
    primaryLabel: "See selected work",
    primaryHref: "#projects",
    secondaryLabel: "Download CV",
    secondaryHref: "#contact",
    logTitle: "request.log",
    logLines: [
      { method: "GET", path: "/tenants/resolve", meta: "200 · 12ms" },
      { method: "POST", path: "/auth/otp/verify", meta: "200 · 38ms" },
      { method: "POST", path: "/payments/webhook", meta: "200 · 21ms" },
      { method: "PATCH", path: "/checkin/:passId", meta: "200 · 9ms" },
      { method: "GET", path: "/reports/ledger.pdf", meta: "200 · 64ms" },
      { method: "POST", path: "/forms/:id/submit", meta: "201 · 27ms" },
      { method: "GET", path: "/rbac/permissions", meta: "200 · 6ms" },
    ],
    logFooter: "490+ endpoints mounted",
    scrollHint: "Scroll to explore",
  },
  stats: {
    visible: true,
    items: [
      { value: "2+", label: "Years shipping production" },
      { value: "490+", label: "Endpoints in one platform" },
      { value: "1,800+", label: "Automated test cases" },
      { value: "47", label: "Models tenant-isolated" },
    ],
  },
  marquee: {
    visible: true,
    items: [
      "MongoDB",
      "Express.js",
      "React",
      "Node.js",
      "TypeScript",
      "Next.js",
      "Socket.IO",
      "PostgreSQL",
      "Tailwind CSS",
      "Drizzle ORM",
    ],
  },
  about: {
    visible: true,
    label: "GET /about",
    heading: "I own features from the database schema to the deploy button.",
    paragraphs: [
      "I am a MERN stack developer at D4DX Innovations in Calicut, building ERP, SaaS and event platforms that many organisations share at once. Tenant isolation, role-based access and money movement are the parts I care most about getting right.",
      "My work covers RESTful API design, JWT and OTP authentication, payment gateway and WhatsApp integrations, and cloud deployment. I back it with integration tests, so the next release does not break the last one.",
    ],
    snippetComment: "// the short version",
    snippet: "tenant.resolve() → rbac.check() → ship()",
    photo: "/placeholders/portrait.svg",
    photoCaption: "FIG. 01 — Jahfar Swadikh K",
    facts: [
      { label: "Based in", value: "Calicut, Kerala" },
      { label: "Currently", value: "D4DX Innovations LLP" },
      { label: "Focus", value: "Multi-tenant SaaS and ERP" },
      { label: "Degree", value: "B.Tech Computer Science" },
    ],
  },
  services: {
    visible: true,
    label: "GET /services",
    heading: "Four things I do well",
    items: [
      {
        title: "Multi-tenant SaaS and ERP",
        text: "Tenant resolution by domain or subdomain, data isolation enforced at the model layer, and modules that scale from one organisation to many.",
      },
      {
        title: "API design and documentation",
        text: "Layered controller and service architecture, RESTful endpoints in the hundreds, each documented in Swagger and covered by integration tests.",
      },
      {
        title: "Authentication and security",
        text: "JWT sessions with revocation, OTP login over WhatsApp and SMS, two-factor authentication, RBAC with granular permissions, and hardened request handling.",
      },
      {
        title: "Payments and integrations",
        text: "Payment gateways with webhook verification, WhatsApp messaging, push notifications, S3 storage, PDF and Excel reporting, and LLM tool calling.",
      },
    ],
  },
  projects: {
    visible: true,
    label: "GET /work",
    heading: "Selected work",
    detailLabel: "Open case study",
    galleryLabel: "System gallery",
    items: [
      {
        title: "NGO Welfare ERP Platform",
        kind: "Multi-tenant ERP",
        summary:
          "A multi-tenant ERP with tenant resolution by custom domain or subdomain, a dynamic form builder with a scoring engine and a multi-stage approval workflow.",
        image: "/placeholders/project-1.svg",
        frameLabel: "welfare-erp / tenants",
        metrics: [
          { value: "490+", label: "REST endpoints" },
          { value: "47", label: "Isolated models" },
          { value: "90+", label: "Permissions" },
        ],
        tags: ["Node.js", "Express", "MongoDB", "Easebuzz", "WhatsApp OTP", "Swagger"],
        highlights: [
          "Tenant resolution by custom domain or subdomain, with a Mongoose plugin enforcing data isolation across 47 models.",
          "RBAC with 9 hierarchical roles and 90+ granular permissions.",
          "Dynamic form builder with a scoring engine and a configurable multi-stage approval workflow.",
          "Easebuzz payments with hash verification, webhooks and recurring donations.",
          "WhatsApp and SMS OTP login, push notifications, cron reminders and audit logging.",
        ],
        // Sample shot. As the first project it is also the shape every saved gallery is checked against (shape.ts).
        gallery: [{ image: "/placeholders/project-1.svg", label: "Tenant dashboard" }] as Shot[],
        liveUrl: "",
        repoUrl: "",
      },
      {
        title: "Mahallu Management",
        kind: "Community SaaS",
        summary:
          "A TypeScript API and React admin panel across 40 feature modules, with idempotent ledger posting, atomic wallet updates and an AI assistant limited to tenant-scoped queries.",
        image: "/placeholders/project-2.svg",
        frameLabel: "mahallu / admin",
        metrics: [
          { value: "400+", label: "Endpoints" },
          { value: "80+", label: "Mongoose models" },
          { value: "1,800+", label: "Test cases" },
        ],
        tags: ["TypeScript", "React", "Vite", "MongoDB transactions", "LLM tool calling"],
        highlights: [
          "TypeScript REST API with 400+ endpoints and 80+ Mongoose models using row-level tenant isolation.",
          "Accounting with idempotent ledger posting and reversal, and atomic wallet updates.",
          "MongoDB transactions with compensation rollback, plus PDF certificates with QR verification.",
          "Token versioning and revocation, timing-safe OTP verification, NoSQL injection guards and rate limiting.",
          "AI assistant using LLM tool calling, limited to read-only tenant-scoped aggregate queries.",
        ],
        gallery: [] as Shot[],
        liveUrl: "",
        repoUrl: "",
      },
      {
        title: "DX-ERP — HR, Payroll, CRM, Finance",
        kind: "Company ERP",
        summary:
          "A full-stack Next.js App Router application covering attendance, leave, payroll, projects, CRM and invoicing, delivered as a PWA with two-factor authentication.",
        image: "/placeholders/project-3.svg",
        frameLabel: "dx-erp / payroll",
        metrics: [
          { value: "80", label: "Pages" },
          { value: "200+", label: "Server actions" },
          { value: "60+", label: "Permission keys" },
        ],
        tags: ["Next.js", "Server Actions", "PostgreSQL", "Drizzle", "TOTP 2FA", "AES-256-GCM"],
        highlights: [
          "80 pages, 200+ server actions and 50 database tables.",
          "Permission engine with 60+ keys and custom roles enforced server-side.",
          "Payroll engine with loss-of-pay and pro-rating rules, with export to CSV, Excel and PDF.",
          "JWT sessions, Google OAuth, TOTP two-factor authentication and a Content Security Policy.",
          "AES-256-GCM encrypted secrets vault, login rate limiting, shipped as a PWA.",
        ],
        gallery: [] as Shot[],
        liveUrl: "",
        repoUrl: "",
      },
      {
        title: "Order and Inventory Management",
        kind: "Operations",
        summary:
          "A role-based order lifecycle across six user roles with real-time stock updates, a reorder-level engine and Tally accounting sync.",
        image: "/placeholders/project-4.svg",
        frameLabel: "inventory / orders",
        metrics: [
          { value: "150", label: "Endpoints" },
          { value: "6", label: "User roles" },
          { value: "8,000", label: "Orders migrated" },
        ],
        tags: ["React", "Socket.IO", "MongoDB aggregation", "Tally sync", "Firestore migration"],
        highlights: [
          "REST API with 150 endpoints and a React admin dashboard.",
          "Role-based order lifecycle across six user roles, with MongoDB transactions keeping stock consistent.",
          "Real-time stock updates over Socket.IO and a reorder-level engine built on aggregation.",
          "Tally accounting sync through API-key-secured endpoints.",
          "About 8,000 orders migrated from Firebase Firestore to MongoDB with an idempotent script.",
        ],
        gallery: [] as Shot[],
        liveUrl: "",
        repoUrl: "",
      },
    ],
  },
  experience: {
    visible: true,
    label: "GET /experience",
    heading: "Where I have worked",
    items: [
      {
        role: "MERN Stack Developer",
        company: "D4DX Innovations LLP",
        period: "03/2025 — Present",
        location: "Calicut, Kerala",
        bullets: [
          "Build and maintain production MERN applications for ERP, SaaS and event management clients, from schema design to deployment.",
          "Designed RESTful APIs for multi-tenant platforms with 400+ endpoints each, documented in Swagger.",
          "Implemented JWT auth, OTP login through WhatsApp and SMS, session revocation and RBAC.",
          "Integrated Easebuzz payments with webhooks, WhatsApp messaging, push notifications, S3 storage and the OpenAI API.",
          "Built event check-in with HMAC-signed QR passes and atomic updates, covered by 150+ integration tests.",
          "Migrated production data between platforms and deployed on DigitalOcean, Netlify and Cloudflare Workers.",
        ],
        tags: ["MongoDB", "Express", "React", "Node.js", "Easebuzz", "WhatsApp API"],
      },
      {
        role: "Full Stack Intern",
        company: "TechMaghi",
        period: "07/2024 — 02/2025",
        location: "Kochi, Kerala",
        bullets: [
          "Developed full-stack features with React components, Express REST APIs and MongoDB schemas.",
          "Implemented user authentication, CRUD operations and API integration, tested with Postman.",
          "Collaborated with the development team using Git version control workflows.",
        ],
        tags: ["React", "Express", "MongoDB", "Postman", "Git"],
      },
    ],
  },
  skills: {
    visible: true,
    label: "GET /stack",
    heading: "The toolkit behind the work",
    groups: [
      { title: "Languages", items: ["JavaScript (ES6+)", "TypeScript", "SQL", "HTML5", "CSS3", "C++"] },
      {
        title: "Frontend",
        items: ["React", "Next.js", "Vite", "Tailwind CSS", "shadcn/ui", "TanStack Query", "Zustand", "React Hook Form", "Zod", "Recharts", "PWA"],
      },
      {
        title: "Backend",
        items: ["Node.js", "Express", "REST API design", "Socket.IO", "Webhooks", "Cron jobs", "Swagger", "Multi-tenant architecture"],
      },
      {
        title: "Databases",
        items: ["MongoDB", "Mongoose", "Aggregation pipelines", "Transactions", "PostgreSQL", "MySQL", "SQLite", "Drizzle ORM"],
      },
      {
        title: "Auth and security",
        items: ["JWT", "OAuth 2.0", "OTP", "2FA (TOTP)", "RBAC", "bcrypt", "Helmet", "Rate limiting", "AES-256"],
      },
      {
        title: "Integrations",
        items: ["WhatsApp API", "SMS gateway", "Easebuzz", "Firebase Cloud Messaging", "OneSignal", "AWS S3", "Nodemailer", "OpenAI API"],
      },
      { title: "Cloud", items: ["DigitalOcean", "Cloudflare Workers", "Netlify", "Vercel", "MongoDB Atlas"] },
      { title: "Tools", items: ["Git", "GitHub", "Postman", "VS Code", "pnpm", "Claude Code"] },
    ],
  },
  credentials: {
    visible: true,
    label: "GET /credentials",
    heading: "Education and awards",
    education: [
      {
        title: "B.Tech Computer Science Engineering",
        place: "APJ Abdul Kalam Technological University",
        period: "2020 — 2024",
        location: "Malappuram, Kerala",
      },
    ],
    awards: [
      { title: "AI for All Advanced", issuer: "Intel, Digital India", year: "2024" },
      { title: "Excellence in Modern Development", issuer: "TechMaghi", year: "2024" },
    ],
  },
  testimonials: {
    // Hidden until real quotes are added from the admin panel.
    visible: false,
    label: "GET /testimonials",
    heading: "What people say",
    items: [
      {
        quote: "Placeholder quote. Replace this with a real client or colleague testimonial from the admin panel.",
        name: "Client name",
        role: "Role, Company",
        avatar: "",
      },
      {
        quote: "Placeholder quote. Replace this with a real client or colleague testimonial from the admin panel.",
        name: "Colleague name",
        role: "Role, Company",
        avatar: "",
      },
    ],
  },
  contact: {
    visible: true,
    label: "POST /contact",
    headingLine1: "Let's build",
    headingLine2: "something",
    headingAccent: "solid.",
    intro: "Have a platform to build, an API to untangle or a role to fill? Send a message and I will reply within a day.",
    email: "jahfarswadikh1010@gmail.com",
    phone: "+91 75920 46146",
    resumeUrl: "",
    formEnabled: true,
    socials: [
      { label: "LinkedIn", href: "https://www.linkedin.com/" },
      { label: "GitHub", href: "https://github.com/" },
    ],
  },
  footer: {
    left: "© 2026 Jahfar Swadikh K",
    center: "11.2588° N / 75.7804° E · Calicut",
    right: "Built with Next.js",
    timeZone: "Asia/Kolkata",
  },
  layout: [...SECTION_IDS] as string[],
};

export type Content = typeof defaultContent;
