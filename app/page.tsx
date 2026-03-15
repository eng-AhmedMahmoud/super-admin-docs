"use client";

import { useEffect, useState, useRef, useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const sections = [
  { id: "hero", label: "Introduction" },
  { id: "overview", label: "Project Overview" },
  { id: "architecture", label: "Architecture" },
  { id: "tech-stack", label: "Tech Stack" },
  { id: "journey", label: "My Journey" },
  { id: "features", label: "Features Deep Dive" },
  { id: "security", label: "Security & Governance" },
  { id: "next-steps", label: "Next Steps" },
  { id: "api-reference", label: "API Reference" },
];

const techStack = [
  {
    tech: "Next.js 16",
    purpose: "Framework",
    why: "App Router, React 19 support, matches Yosemite-Crew monorepo conventions",
  },
  {
    tech: "React 19",
    purpose: "UI Library",
    why: "Latest features, concurrent rendering, improved server components",
  },
  {
    tech: "Tailwind CSS v4",
    purpose: "Styling",
    why: "Design tokens via @theme directive, utility-first, zero-runtime",
  },
  {
    tech: "Zustand",
    purpose: "State Management",
    why: "Lightweight per-feature stores, no boilerplate, excellent DevTools",
  },
  {
    tech: "Recharts",
    purpose: "Data Visualization",
    why: "Composable, React-native chart primitives for analytics dashboards",
  },
  {
    tech: "Axios",
    purpose: "HTTP Client",
    why: "Interceptors for auth tokens, matches Yosemite-Crew service layer patterns",
  },
  {
    tech: "TypeScript",
    purpose: "Type Safety",
    why: "Strict mode enabled, full type coverage across stores, hooks, and components",
  },
];

const features = [
  {
    name: "Authentication",
    description:
      "AWS Cognito integration with mandatory MFA. Handles sign-in, token refresh, session management, and MFA verification flows.",
    components: ["LoginPage", "MFAVerification", "AuthGuard", "SessionProvider"],
    endpoints: ["/v1/super-admin/auth/config", "/v1/super-admin/auth/mfa/verify"],
  },
  {
    name: "Leads Management",
    description:
      "Full CRUD for inbound leads with assignment workflows, status tracking (new, contacted, qualified, converted, lost), and bulk operations.",
    components: ["LeadsTable", "LeadDetailModal", "LeadStatusBadge", "AssignLeadDialog"],
    endpoints: [
      "/v1/super-admin/leads",
      "/v1/super-admin/leads/:id/status",
      "/v1/super-admin/leads/:id/assign",
    ],
  },
  {
    name: "Business Management",
    description:
      "Approve, suspend, or deactivate tenant businesses. Filter by status including invited businesses awaiting onboarding. View business details and operational metrics.",
    components: [
      "BusinessTable",
      "BusinessDetailDrawer",
      "StatusToggle",
      "InviteFilter",
    ],
    endpoints: [
      "/v1/super-admin/businesses",
      "/v1/super-admin/businesses/:id/status",
    ],
  },
  {
    name: "Support Tickets",
    description:
      "Manage customer support tickets across all tenants. Assign agents, set priority levels, track resolution status, and view conversation threads.",
    components: [
      "TicketTable",
      "TicketDetailView",
      "PriorityBadge",
      "AssignAgentDialog",
    ],
    endpoints: [
      "/v1/super-admin/support/tickets",
      "/v1/super-admin/support/tickets/:id/assign",
      "/v1/super-admin/support/tickets/:id/status",
    ],
  },
  {
    name: "Team Management",
    description:
      "Create and remove super-admin team members. Assign roles with granular RBAC permissions per feature module.",
    components: ["TeamTable", "InviteMemberModal", "RoleSelector", "PermissionMatrix"],
    endpoints: [
      "/v1/super-admin/team",
      "/v1/super-admin/team/:id/role",
    ],
  },
  {
    name: "Analytics Dashboard",
    description:
      "KPI tiles showing key metrics (total businesses, active users, revenue trends, support volume). Trend charts with configurable time ranges.",
    components: ["KPITile", "TrendChart", "DateRangeSelector", "MetricGrid"],
    endpoints: ["/v1/super-admin/analytics/kpis", "/v1/super-admin/analytics/trends"],
  },
  {
    name: "Users",
    description:
      "Unified read model combining Cognito identities with Firebase user profiles. Search, filter, and view detailed user information across all tenants.",
    components: ["UserTable", "UserDetailDrawer", "UserSearchBar", "TenantFilter"],
    endpoints: ["/v1/super-admin/users"],
  },
  {
    name: "Developers",
    description:
      "Developer portal management. View registered developers, their apps, API key usage, and rate limit configurations.",
    components: [
      "DeveloperTable",
      "AppDetailView",
      "APIKeyManager",
      "RateLimitConfig",
    ],
    endpoints: ["/v1/super-admin/developers", "/v1/super-admin/developers/:id/apps"],
  },
  {
    name: "Break Glass",
    description:
      "Time-bound, audited emergency access grants. Every grant requires a reason, ticket ID, expiry window, and approver. Automatically revoked on expiry.",
    components: [
      "BreakGlassForm",
      "ActiveGrantsTable",
      "GrantAuditLog",
      "ExpiryCountdown",
    ],
    endpoints: [
      "/v1/super-admin/break-glass",
      "/v1/super-admin/break-glass/:id/revoke",
    ],
  },
  {
    name: "Audit Log",
    description:
      "Immutable activity trail for all super-admin actions. Filterable by actor, action type, resource, and date range. Supports export for compliance.",
    components: ["AuditTable", "AuditFilterBar", "AuditDetailModal", "ExportButton"],
    endpoints: ["/v1/super-admin/audit-logs"],
  },
];

const apiEndpoints = [
  { method: "GET", endpoint: "/v1/super-admin/auth/config", purpose: "Cognito pool metadata & client configuration" },
  { method: "POST", endpoint: "/v1/super-admin/auth/mfa/verify", purpose: "Verify MFA token during sign-in" },
  { method: "GET", endpoint: "/v1/super-admin/leads", purpose: "List all leads with pagination & filters" },
  { method: "POST", endpoint: "/v1/super-admin/leads", purpose: "Create a new lead record" },
  { method: "PATCH", endpoint: "/v1/super-admin/leads/:id/status", purpose: "Update lead status (new, contacted, qualified, converted, lost)" },
  { method: "PATCH", endpoint: "/v1/super-admin/leads/:id/assign", purpose: "Assign a lead to a team member" },
  { method: "GET", endpoint: "/v1/super-admin/businesses", purpose: "List all tenant businesses with status filters" },
  { method: "PATCH", endpoint: "/v1/super-admin/businesses/:id/status", purpose: "Approve, suspend, or deactivate a business" },
  { method: "GET", endpoint: "/v1/super-admin/support/tickets", purpose: "List support tickets across all tenants" },
  { method: "PATCH", endpoint: "/v1/super-admin/support/tickets/:id/assign", purpose: "Assign a ticket to a support agent" },
  { method: "PATCH", endpoint: "/v1/super-admin/support/tickets/:id/status", purpose: "Update ticket resolution status" },
  { method: "GET", endpoint: "/v1/super-admin/team", purpose: "List super-admin team members" },
  { method: "POST", endpoint: "/v1/super-admin/team", purpose: "Invite a new team member" },
  { method: "PATCH", endpoint: "/v1/super-admin/team/:id/role", purpose: "Update a member's role and permissions" },
  { method: "DELETE", endpoint: "/v1/super-admin/team/:id", purpose: "Remove a team member" },
  { method: "GET", endpoint: "/v1/super-admin/analytics/kpis", purpose: "Fetch KPI summary tiles" },
  { method: "GET", endpoint: "/v1/super-admin/analytics/trends", purpose: "Fetch trend data for charts" },
  { method: "GET", endpoint: "/v1/super-admin/users", purpose: "Unified user list (Cognito + Firebase)" },
  { method: "GET", endpoint: "/v1/super-admin/developers", purpose: "List registered developers" },
  { method: "GET", endpoint: "/v1/super-admin/developers/:id/apps", purpose: "List apps for a developer" },
  { method: "POST", endpoint: "/v1/super-admin/break-glass", purpose: "Create an emergency access grant" },
  { method: "DELETE", endpoint: "/v1/super-admin/break-glass/:id/revoke", purpose: "Revoke an active break-glass grant" },
  { method: "GET", endpoint: "/v1/super-admin/audit-logs", purpose: "Query immutable audit log entries" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function Badge({ children, variant = "brand" }: { children: React.ReactNode; variant?: "brand" | "success" | "warning" | "danger" | "neutral" }) {
  const styles: Record<string, string> = {
    brand: "bg-brand-100 text-brand-950",
    success: "bg-success-100 text-success-600",
    warning: "bg-warning-100 text-warning-600",
    danger: "bg-danger-100 text-danger-600",
    neutral: "bg-neutral-50 text-neutral-700",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-neutral-950 text-neutral-100 rounded-2xl p-6 overflow-x-auto text-sm leading-relaxed font-mono">
      <code>{children}</code>
    </pre>
  );
}

function SectionHeading({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="text-2xl font-bold text-neutral-950 border-l-4 border-brand-950 pl-4 scroll-mt-24">
      {children}
    </h2>
  );
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-success-100 text-success-600",
    POST: "bg-brand-100 text-brand-950",
    PATCH: "bg-warning-100 text-warning-600",
    DELETE: "bg-danger-100 text-danger-600",
    PUT: "bg-brand-100 text-brand-950",
  };
  return (
    <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded text-xs font-bold font-mono min-w-[60px] ${colors[method] || "bg-neutral-50 text-neutral-700"}`}>
      {method}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("hero");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleSectionChange = useCallback((id: string) => {
    setActiveSection(id);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const topEntry = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b
          );
          handleSectionChange(topEntry.target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [handleSectionChange]);

  const scrollTo = (id: string) => {
    setMobileNavOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-neutral-0">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-neutral-0/95 backdrop-blur border-b border-neutral-100 px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-neutral-950 text-lg">Super Admin Docs</span>
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-2 rounded-lg hover:bg-neutral-50 transition-colors"
          aria-label="Toggle navigation"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {mobileNavOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </header>

      {/* Mobile nav dropdown */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-40 pt-14">
          <div className="absolute inset-0 bg-neutral-950/20" onClick={() => setMobileNavOpen(false)} />
          <nav className="relative bg-neutral-0 border-b border-neutral-100 shadow-lg p-4 space-y-1">
            {sections.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  activeSection === id
                    ? "bg-brand-100 text-brand-950 font-medium"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 w-64 h-screen border-r border-neutral-100 bg-neutral-0 z-40 overflow-y-auto">
        <div className="p-6 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-950 flex items-center justify-center">
              <span className="text-white font-bold text-sm">SA</span>
            </div>
            <div>
              <div className="font-bold text-neutral-950 text-sm">Super Admin</div>
              <div className="text-xs text-neutral-500">Documentation</div>
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {sections.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                activeSection === id
                  ? "bg-brand-100 text-brand-950 font-medium"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-100">
          <div className="text-xs text-neutral-500">Yosemite Crew</div>
          <div className="text-xs text-neutral-500 mt-0.5">v1.0.0</div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 py-12 lg:py-16">

          {/* ===== HERO ===== */}
          <section id="hero" className="mb-20">
            <div className="flex gap-2 mb-6">
              <Badge>Next.js 16</Badge>
              <Badge>React 19</Badge>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-neutral-950 leading-tight mb-4">
              Super Admin Dashboard
            </h1>
            <p className="text-xl text-neutral-600 mb-6 leading-relaxed max-w-2xl">
              Technical Documentation &amp; Project Journey
            </p>
            <p className="text-neutral-700 leading-relaxed max-w-3xl">
              A production-grade admin dashboard for the Yosemite Crew platform, built with Next.js 16,
              React 19, and Tailwind CSS v4. This document covers the architecture, tech decisions,
              implementation journey, and everything a new developer needs to understand the system.
            </p>
          </section>

          {/* ===== PROJECT OVERVIEW ===== */}
          <section id="overview" className="mb-20">
            <SectionHeading>Project Overview</SectionHeading>

            <p className="mt-6 text-neutral-700 leading-relaxed max-w-3xl">
              The Super Admin Dashboard is the central governance tool for the Yosemite Crew pet care
              ecosystem. It provides a single pane of glass for managing businesses, users, leads,
              support tickets, and platform operations. The project is designed to merge into the
              Yosemite-Crew monorepo as <code className="text-brand-950 bg-brand-100 px-1.5 py-0.5 rounded text-sm">apps/super-admin</code>.
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="border border-neutral-100 rounded-2xl p-6">
                <h3 className="font-semibold text-neutral-950 mb-2">Multi-Tenant Governance</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Manage all tenant businesses from a single dashboard with deny-by-default permissions.
                  Every action is scoped, logged, and auditable.
                </p>
              </div>
              <div className="border border-neutral-100 rounded-2xl p-6">
                <h3 className="font-semibold text-neutral-950 mb-2">Monorepo-Ready</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Built to slot into the Yosemite-Crew monorepo. Folder structure, state patterns,
                  and HTTP client conventions deliberately mirror existing apps.
                </p>
              </div>
              <div className="border border-neutral-100 rounded-2xl p-6">
                <h3 className="font-semibold text-neutral-950 mb-2">Strict Security Model</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Break-glass access with mandatory reason + ticket + expiry + approver. MFA enforced
                  for all super-admin users via AWS Cognito.
                </p>
              </div>
              <div className="border border-neutral-100 rounded-2xl p-6">
                <h3 className="font-semibold text-neutral-950 mb-2">Complete Audit Trail</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Every sensitive action writes to an immutable audit log. Filterable by actor,
                  action type, resource, and date range with export support.
                </p>
              </div>
            </div>

            <h3 className="mt-10 text-lg font-semibold text-neutral-950">Core Capabilities</h3>
            <div className="mt-4 space-y-3 max-w-3xl">
              {[
                ["Authentication", "AWS Cognito integration with mandatory MFA verification"],
                ["Leads Management", "Full CRUD with assignment, status tracking, and bulk operations"],
                ["Business Management", "Approve, suspend, deactivate tenants; filter invited businesses"],
                ["Support Tickets", "Cross-tenant ticket management with agent assignment and priority"],
                ["Team Management", "Create/remove members with granular RBAC permissions"],
                ["Analytics", "KPI tiles, trend charts, and configurable date ranges"],
                ["Users", "Unified read model combining Cognito identities + Firebase profiles"],
                ["Developers", "Developer portal, app management, API key and rate limit configuration"],
                ["Break Glass", "Time-bound audited emergency access grants with auto-revocation"],
                ["Audit Log", "Immutable activity trail with filtering and export"],
              ].map(([title, desc]) => (
                <div key={title} className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-950 mt-2 shrink-0" />
                  <div>
                    <span className="font-medium text-neutral-950">{title}</span>
                    <span className="text-neutral-600"> — {desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ===== ARCHITECTURE ===== */}
          <section id="architecture" className="mb-20">
            <SectionHeading>Architecture &amp; Project Structure</SectionHeading>

            <p className="mt-6 text-neutral-700 leading-relaxed max-w-3xl mb-6">
              The project follows a feature-based architecture where each domain module is self-contained.
              This makes the codebase predictable: if you understand one feature, you understand them all.
            </p>

            <CodeBlock>{`apps/admin/src/app/
├── (routes)/
│   ├── (public)/          # Login, MFA verification
│   └── (app)/             # Protected dashboard routes
│       ├── dashboard/     # Overview with KPIs
│       ├── leads/         # Lead management
│       ├── businesses/    # Business governance
│       ├── support/       # Ticket management
│       ├── team/          # Team & RBAC
│       ├── analytics/     # Charts & metrics
│       ├── users/         # User directory
│       ├── developers/    # Developer portal
│       ├── break-glass/   # Emergency access
│       └── audit/         # Audit log viewer
├── features/              # Feature modules (10 features)
│   ├── auth/
│   ├── dashboard/
│   ├── leads/
│   ├── businesses/
│   ├── support/
│   ├── team/
│   ├── analytics/
│   ├── users/
│   ├── developers/
│   ├── break-glass/
│   └── audit/
├── ui/                    # Reusable component library
│   ├── Button.tsx
│   ├── GenericTable.tsx
│   ├── Modal.tsx
│   ├── Badge.tsx
│   ├── StatCard.tsx
│   └── ...
├── services/              # HTTP client + mock API layer
├── stores/                # Zustand state per feature
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities, permissions, validators
├── types/                 # TypeScript type definitions
├── constants/             # Route config, enums
└── config/                # Application config`}</CodeBlock>

            <h3 className="mt-10 text-lg font-semibold text-neutral-950 mb-4">
              The Feature Pattern: Store → Hook → Feature Page → Route Page
            </h3>

            <p className="text-neutral-700 leading-relaxed max-w-3xl mb-6">
              Each feature follows a consistent 4-layer architecture. This makes the codebase predictable
              and easy to extend. A new developer can build a new feature by copying an existing one and
              adapting the types, store, and UI.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border border-neutral-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-brand-950 bg-brand-100 px-2 py-0.5 rounded">Layer 1</span>
                  <h4 className="font-semibold text-neutral-950">Zustand Store</h4>
                </div>
                <p className="text-sm text-neutral-600">
                  Manages all state for the feature: data, loading/error states, pagination, filters.
                  Each store is isolated and independently testable.
                </p>
              </div>
              <div className="border border-neutral-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-brand-950 bg-brand-100 px-2 py-0.5 rounded">Layer 2</span>
                  <h4 className="font-semibold text-neutral-950">Custom Hook</h4>
                </div>
                <p className="text-sm text-neutral-600">
                  Bridges the store and UI. Handles side effects like data fetching on mount,
                  provides derived state, and exposes action handlers.
                </p>
              </div>
              <div className="border border-neutral-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-brand-950 bg-brand-100 px-2 py-0.5 rounded">Layer 3</span>
                  <h4 className="font-semibold text-neutral-950">Feature Page</h4>
                </div>
                <p className="text-sm text-neutral-600">
                  The main UI component for the feature. Composes UI primitives (tables, modals, badges)
                  with data from the hook. Lives in <code className="text-xs bg-neutral-50 px-1 rounded">features/</code>.
                </p>
              </div>
              <div className="border border-neutral-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-brand-950 bg-brand-100 px-2 py-0.5 rounded">Layer 4</span>
                  <h4 className="font-semibold text-neutral-950">Route Page</h4>
                </div>
                <p className="text-sm text-neutral-600">
                  The Next.js App Router page that wraps the feature component with layout,
                  auth guards, and permission gates. Lives in <code className="text-xs bg-neutral-50 px-1 rounded">app/(routes)/</code>.
                </p>
              </div>
            </div>
          </section>

          {/* ===== TECH STACK ===== */}
          <section id="tech-stack" className="mb-20">
            <SectionHeading>Tech Stack &amp; Design Decisions</SectionHeading>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="text-left py-3 pr-4 font-semibold text-neutral-950">Technology</th>
                    <th className="text-left py-3 pr-4 font-semibold text-neutral-950">Purpose</th>
                    <th className="text-left py-3 font-semibold text-neutral-950">Why This Choice</th>
                  </tr>
                </thead>
                <tbody>
                  {techStack.map((row, i) => (
                    <tr key={row.tech} className={`border-b border-neutral-100 ${i % 2 === 0 ? "bg-neutral-50/50" : ""}`}>
                      <td className="py-3 pr-4">
                        <Badge variant="brand">{row.tech}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-neutral-700">{row.purpose}</td>
                      <td className="py-3 text-neutral-600">{row.why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="mt-10 text-lg font-semibold text-neutral-950 mb-4">Key Design Decisions</h3>

            <div className="space-y-6 max-w-3xl">
              <div>
                <h4 className="font-semibold text-neutral-950 mb-1">Feature-based architecture over page-based</h4>
                <p className="text-neutral-600 leading-relaxed text-sm">
                  Each feature is self-contained with its own store, hook, components, and pages. This makes
                  it easy to extract, test, and maintain features independently. When the codebase grows,
                  features can even be split into separate packages.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-neutral-950 mb-1">Mock API layer mirroring real contracts</h4>
                <p className="text-neutral-600 leading-relaxed text-sm">
                  All data flows through a mock service layer that mirrors the planned <code className="text-brand-950 bg-brand-100 px-1 py-0.5 rounded text-xs">/v1/super-admin/*</code> API
                  contracts. Swapping to real APIs requires only changing the service implementation, not the UI.
                  This enabled full UI development without waiting for backend endpoints.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-neutral-950 mb-1">Yosemite-Crew pattern matching</h4>
                <p className="text-neutral-600 leading-relaxed text-sm">
                  Deliberately matched folder structure, state management patterns, HTTP client setup, and
                  component conventions to minimize friction when merging into the main monorepo. The goal
                  was zero surprises during code review.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-neutral-950 mb-1">Design token system via Tailwind v4 @theme</h4>
                <p className="text-neutral-600 leading-relaxed text-sm">
                  Used CSS custom properties via the <code className="text-brand-950 bg-brand-100 px-1 py-0.5 rounded text-xs">@theme</code> directive
                  to define all colors, typography, and spacing. This ensures visual consistency across the
                  entire application and makes theming changes trivial.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-neutral-950 mb-1">Deny-by-default permissions</h4>
                <p className="text-neutral-600 leading-relaxed text-sm">
                  RBAC with granular permissions per feature. The <code className="text-brand-950 bg-brand-100 px-1 py-0.5 rounded text-xs">PermissionGate</code> component
                  conditionally renders UI based on user permissions. If a permission is not explicitly granted,
                  access is denied. This is the safest default for an admin tool.
                </p>
              </div>
            </div>
          </section>

          {/* ===== JOURNEY ===== */}
          <section id="journey" className="mb-20">
            <SectionHeading>My Journey &amp; Approach</SectionHeading>

            <p className="mt-6 text-neutral-700 leading-relaxed max-w-3xl mb-8">
              Building the Super Admin Dashboard was a deliberate exercise in production-grade engineering.
              Here is how I approached it:
            </p>

            <div className="space-y-8 max-w-3xl">
              {/* Phase 1 */}
              <div className="relative pl-8 border-l-2 border-brand-100">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-brand-950" />
                <h4 className="font-semibold text-neutral-950 text-lg mb-2">Phase 1: Research &amp; Analysis</h4>
                <ul className="space-y-2 text-neutral-600 text-sm leading-relaxed">
                  <li className="flex gap-2">
                    <span className="text-brand-950 mt-0.5">&#8226;</span>
                    Studied the existing Yosemite-Crew codebase to extract code patterns, design tokens, and architectural conventions
                  </li>
                  <li className="flex gap-2">
                    <span className="text-brand-950 mt-0.5">&#8226;</span>
                    Analyzed the implementation plan to map requirements to technical decisions
                  </li>
                  <li className="flex gap-2">
                    <span className="text-brand-950 mt-0.5">&#8226;</span>
                    Identified what infrastructure existed (Cognito auth, Mongoose models, RBAC middleware) vs what needed to be built from scratch
                  </li>
                </ul>
              </div>

              {/* Phase 2 */}
              <div className="relative pl-8 border-l-2 border-brand-100">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-brand-950" />
                <h4 className="font-semibold text-neutral-950 text-lg mb-2">Phase 2: Foundation First</h4>
                <ul className="space-y-2 text-neutral-600 text-sm leading-relaxed">
                  <li className="flex gap-2">
                    <span className="text-brand-950 mt-0.5">&#8226;</span>
                    Restructured the project from a flat layout to match Yosemite-Crew&apos;s <code className="text-brand-950 bg-brand-100 px-1 py-0.5 rounded text-xs">src/app/</code> convention
                  </li>
                  <li className="flex gap-2">
                    <span className="text-brand-950 mt-0.5">&#8226;</span>
                    Set up the complete design system: Satoshi font, color tokens, typography scale, elevation utilities
                  </li>
                  <li className="flex gap-2">
                    <span className="text-brand-950 mt-0.5">&#8226;</span>
                    Built the UI component library before any feature work — Button variants, GenericTable, Modal system, Badge, StatCard, and more
                  </li>
                  <li className="flex gap-2">
                    <span className="text-brand-950 mt-0.5">&#8226;</span>
                    This upfront investment paid off: every feature page was built from composable, tested primitives
                  </li>
                </ul>
              </div>

              {/* Phase 3 */}
              <div className="relative pl-8 border-l-2 border-brand-100">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-brand-950" />
                <h4 className="font-semibold text-neutral-950 text-lg mb-2">Phase 3: Pattern Establishment</h4>
                <ul className="space-y-2 text-neutral-600 text-sm leading-relaxed">
                  <li className="flex gap-2">
                    <span className="text-brand-950 mt-0.5">&#8226;</span>
                    Built Auth, Dashboard, and Leads first to establish the Store → Hook → Feature → Route pattern
                  </li>
                  <li className="flex gap-2">
                    <span className="text-brand-950 mt-0.5">&#8226;</span>
                    Once the pattern was proven, remaining features could be built efficiently with no architectural decisions left
                  </li>
                </ul>
              </div>

              {/* Phase 4 */}
              <div className="relative pl-8 border-l-2 border-brand-100">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-brand-950" />
                <h4 className="font-semibold text-neutral-950 text-lg mb-2">Phase 4: Parallel Execution</h4>
                <ul className="space-y-2 text-neutral-600 text-sm leading-relaxed">
                  <li className="flex gap-2">
                    <span className="text-brand-950 mt-0.5">&#8226;</span>
                    With patterns established, built Businesses + Support + Team in one batch
                  </li>
                  <li className="flex gap-2">
                    <span className="text-brand-950 mt-0.5">&#8226;</span>
                    Then Analytics + Users + Developers, and finally Break Glass + Audit
                  </li>
                  <li className="flex gap-2">
                    <span className="text-brand-950 mt-0.5">&#8226;</span>
                    Each feature followed the exact same architecture, making code reviews predictable and fast
                  </li>
                </ul>
              </div>

              {/* Phase 5 */}
              <div className="relative pl-8 border-l-2 border-brand-100">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-brand-950" />
                <h4 className="font-semibold text-neutral-950 text-lg mb-2">Phase 5: Quality Gates</h4>
                <ul className="space-y-2 text-neutral-600 text-sm leading-relaxed">
                  <li className="flex gap-2">
                    <span className="text-brand-950 mt-0.5">&#8226;</span>
                    Fixed all 14 lint errors: prefer-const, unused imports, React 19 set-state-in-effect patterns
                  </li>
                  <li className="flex gap-2">
                    <span className="text-brand-950 mt-0.5">&#8226;</span>
                    Achieved zero-error builds across lint, type-check, and production build
                  </li>
                  <li className="flex gap-2">
                    <span className="text-brand-950 mt-0.5">&#8226;</span>
                    Added responsive design for mobile, tablet, and large desktop screens
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-10 bg-brand-100 rounded-2xl p-6 max-w-3xl">
              <h4 className="font-semibold text-brand-950 mb-2">Key Principle: &quot;Measure twice, cut once&quot;</h4>
              <ul className="space-y-1.5 text-sm text-neutral-700 leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-brand-950">&#8226;</span>
                  Spent time understanding existing conventions before writing code
                </li>
                <li className="flex gap-2">
                  <span className="text-brand-950">&#8226;</span>
                  Built infrastructure before features
                </li>
                <li className="flex gap-2">
                  <span className="text-brand-950">&#8226;</span>
                  Established patterns before scaling
                </li>
              </ul>
            </div>
          </section>

          {/* ===== FEATURES DEEP DIVE ===== */}
          <section id="features" className="mb-20">
            <SectionHeading>Features Deep Dive</SectionHeading>

            <p className="mt-6 text-neutral-700 leading-relaxed max-w-3xl mb-8">
              The Super Admin contains 10 feature modules. Each follows the same Store → Hook → Feature → Route
              architecture. Below is a summary of each feature, its key components, and the mock API endpoints
              it will consume once the backend is wired up.
            </p>

            <div className="space-y-4">
              {features.map((feature) => (
                <div key={feature.name} className="border border-neutral-100 rounded-2xl p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h4 className="font-semibold text-neutral-950 text-lg">{feature.name}</h4>
                    <Badge variant="neutral">{feature.components.length} components</Badge>
                  </div>
                  <p className="text-sm text-neutral-600 leading-relaxed mb-4">{feature.description}</p>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                        Key Components
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {feature.components.map((c) => (
                          <span key={c} className="text-xs font-mono bg-neutral-50 text-neutral-700 px-2 py-1 rounded">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                        API Endpoints
                      </div>
                      <div className="space-y-1">
                        {feature.endpoints.map((e) => (
                          <div key={e} className="text-xs font-mono text-brand-950 bg-brand-100 px-2 py-1 rounded">
                            {e}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ===== SECURITY ===== */}
          <section id="security" className="mb-20">
            <SectionHeading>Security &amp; Governance</SectionHeading>

            <p className="mt-6 text-neutral-700 leading-relaxed max-w-3xl mb-8">
              Security is not an afterthought in the Super Admin — it is the foundation. Every design
              decision prioritizes the principle of least privilege and complete auditability.
            </p>

            <div className="grid gap-4 sm:grid-cols-2 max-w-3xl">
              <div className="border border-neutral-100 rounded-2xl p-5">
                <div className="w-10 h-10 rounded-xl bg-danger-100 flex items-center justify-center mb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger-600)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h4 className="font-semibold text-neutral-950 mb-1">Deny-by-Default Permissions</h4>
                <p className="text-sm text-neutral-600">
                  Access to every feature and action requires an explicit permission grant.
                  The PermissionGate component enforces this at the UI level.
                </p>
              </div>
              <div className="border border-neutral-100 rounded-2xl p-5">
                <div className="w-10 h-10 rounded-xl bg-warning-100 flex items-center justify-center mb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning-600)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-neutral-950 mb-1">Field-Level Allowlists</h4>
                <p className="text-sm text-neutral-600">
                  API responses filter fields through tenant-sensitive allowlists. Operational
                  financials and PII are hidden by default.
                </p>
              </div>
              <div className="border border-neutral-100 rounded-2xl p-5">
                <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center mb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-950)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                </div>
                <h4 className="font-semibold text-neutral-950 mb-1">Break-Glass Protocol</h4>
                <p className="text-sm text-neutral-600">
                  Emergency grants require: reason, associated ticket ID, expiry window, and
                  approver. Grants auto-revoke on expiry. Every action is logged.
                </p>
              </div>
              <div className="border border-neutral-100 rounded-2xl p-5">
                <div className="w-10 h-10 rounded-xl bg-success-100 flex items-center justify-center mb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-success-600)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <h4 className="font-semibold text-neutral-950 mb-1">Immutable Audit Log</h4>
                <p className="text-sm text-neutral-600">
                  All sensitive actions are recorded to an append-only audit trail. Entries
                  capture actor, action, resource, timestamp, and metadata.
                </p>
              </div>
              <div className="border border-neutral-100 rounded-2xl p-5">
                <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center mb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-950)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    <circle cx="12" cy="16" r="1" />
                  </svg>
                </div>
                <h4 className="font-semibold text-neutral-950 mb-1">AWS Cognito + MFA</h4>
                <p className="text-sm text-neutral-600">
                  All super-admin users authenticate through AWS Cognito with mandatory
                  multi-factor authentication. No password-only access is permitted.
                </p>
              </div>
              <div className="border border-neutral-100 rounded-2xl p-5">
                <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center mb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-neutral-700)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-neutral-950 mb-1">Tenant Data Isolation</h4>
                <p className="text-sm text-neutral-600">
                  Tenant operational financials are hidden by default. Access to sensitive
                  tenant data requires explicit break-glass authorization.
                </p>
              </div>
            </div>
          </section>

          {/* ===== NEXT STEPS ===== */}
          <section id="next-steps" className="mb-20">
            <SectionHeading>Next Steps</SectionHeading>

            <div className="mt-6 space-y-10 max-w-3xl">
              {/* Merge */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-950 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-brand-950 text-white text-xs font-bold flex items-center justify-center">1</span>
                  Merge into Yosemite-Crew Monorepo
                </h3>
                <div className="space-y-3 pl-8">
                  {[
                    "Move apps/admin to apps/super-admin in the Yosemite-Crew monorepo",
                    "Update import paths and package name to @yosemite-crew/super-admin",
                    "Connect to shared @yosemite-crew/types package for cross-app type safety",
                    "Wire up the existing Cognito auth (same user pool as web PMS)",
                    "Replace mock service layer with real /v1/super-admin/* API calls",
                  ].map((step, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="text-xs font-bold text-neutral-500 bg-neutral-50 w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-neutral-700">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Backend */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-950 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-brand-950 text-white text-xs font-bold flex items-center justify-center">2</span>
                  Backend Work Required
                </h3>
                <div className="space-y-3 pl-8">
                  {[
                    "Add super-admin router/controllers/services in apps/backend/src",
                    "Implement all 23 API endpoints from the contract specification",
                    "Add SUPER_ADMIN role to existing RBAC system with granular permissions",
                    "Implement break-glass grant lifecycle + audit middleware",
                    "Configure Cognito MFA policy for super-admin user pool",
                  ].map((step, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="text-xs font-bold text-neutral-500 bg-neutral-50 w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-neutral-700">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Production */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-950 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-brand-950 text-white text-xs font-bold flex items-center justify-center">3</span>
                  Production Readiness
                </h3>
                <div className="space-y-3 pl-8">
                  {[
                    "Replace all mock data with real API integration",
                    "Add Jest unit tests targeting 80% coverage across stores and hooks",
                    "Add Playwright E2E tests for critical flows (auth, lead lifecycle, break-glass)",
                    "Configure SonarQube quality gates for continuous code quality monitoring",
                    "Set up Metabase embed for analytics-heavy pages",
                    "Add real-time updates via WebSocket/SSE for tickets and audit log",
                    "Implement data export functionality (CSV/PDF) for reports and audit logs",
                  ].map((step, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="text-xs font-bold text-neutral-500 bg-neutral-50 w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-neutral-700">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ===== API REFERENCE ===== */}
          <section id="api-reference" className="mb-20">
            <SectionHeading>API Contract Reference</SectionHeading>

            <p className="mt-6 text-neutral-700 leading-relaxed max-w-3xl mb-6">
              The Super Admin will consume 23 API endpoints under the <code className="text-brand-950 bg-brand-100 px-1.5 py-0.5 rounded text-sm">/v1/super-admin/</code> namespace.
              All endpoints require a valid Cognito JWT with the <code className="text-brand-950 bg-brand-100 px-1.5 py-0.5 rounded text-sm">SUPER_ADMIN</code> role claim.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="text-left py-3 pr-3 font-semibold text-neutral-950 w-20">Method</th>
                    <th className="text-left py-3 pr-3 font-semibold text-neutral-950">Endpoint</th>
                    <th className="text-left py-3 font-semibold text-neutral-950">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {apiEndpoints.map((row, i) => (
                    <tr key={`${row.method}-${row.endpoint}`} className={`border-b border-neutral-100 ${i % 2 === 0 ? "bg-neutral-50/50" : ""}`}>
                      <td className="py-2.5 pr-3">
                        <MethodBadge method={row.method} />
                      </td>
                      <td className="py-2.5 pr-3 font-mono text-xs text-neutral-700">{row.endpoint}</td>
                      <td className="py-2.5 text-neutral-600 text-xs">{row.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ===== FOOTER ===== */}
          <footer className="border-t border-neutral-100 pt-8 pb-12">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-neutral-600">
                Built by <span className="font-medium text-neutral-950">Ahmed Mahmoud</span> for Yosemite Crew
              </div>
              <div className="text-sm text-neutral-500">
                &copy; 2025 Yosemite Crew. All rights reserved.
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
