# Dx Tech Stack

## Purpose

This document defines the current technology baseline for Dx.

The product architecture and domain model are still being designed.
This document intentionally defines the technology stack without locking the system into premature business or module boundaries.

The guiding principle is to keep Dx fast, simple, modular, and easy to evolve.

---

## Core Stack

| Area | Technology |
| --- | --- |
| Frontend | React 19 |
| Language | TypeScript |
| Build Tool | Vite |
| Routing | TanStack Router |
| Server State | TanStack Query |
| Styling | Tailwind CSS |
| UI Components | shadcn-style shared components |
| Forms | React Hook Form |
| Validation | Zod |
| Backend Platform | Supabase |
| Database | PostgreSQL |
| Authentication | Supabase Auth |
| Authorization | Application permissions + PostgreSQL Row Level Security |
| File Storage | Supabase Storage |
| Realtime | Supabase Realtime |
| Privileged Backend Logic | Supabase Edge Functions |
| Unit / Component Testing | Vitest |
| End-to-End Testing | Playwright |
| Package Manager | pnpm |
| CI | GitHub Actions |

---

## High-Level Architecture

Dx will use a client-heavy web application architecture.

```text
Browser
  |
  v
React + Vite
  |
  +--> TanStack Router
  |
  +--> TanStack Query
  |
  +--> Feature Modules
  |
  v
Supabase
  |
  +--> PostgreSQL
  +--> Auth
  +--> Row Level Security
  +--> Storage
  +--> Realtime
  +--> Edge Functions
```

The frontend communicates directly with Supabase for normal authenticated operations.

Privileged operations, secret-bearing integrations, and workflows that must not execute in the browser go through Supabase Edge Functions or another trusted server-side boundary if one is introduced later.

---

## Frontend

### React

React is the primary UI framework.

Dx is expected to behave more like an interactive workspace than a content-oriented website.

The application will contain dense and highly interactive interfaces such as project workspaces, boards, schedules, collaboration tools, and realtime status updates.

React is responsible for rendering these experiences and managing local UI state.

---

### Vite

Vite is the application build tool and development server.

It replaces Next.js as the application runtime.

Vite is chosen because Dx does not currently require server-side rendering, static site generation, React Server Components, or SEO-driven application pages.

The priority is a fast development loop, simple frontend architecture, and efficient client-side application behavior.

---

### TypeScript

All application code should use TypeScript.

Avoid `any` unless a boundary genuinely cannot be typed.

Shared contracts, domain states, query results, mutations, and component interfaces should be strongly typed.

---

## Routing

### TanStack Router

TanStack Router is the preferred routing layer.

It should own:

- application routes;
- authenticated route boundaries;
- route parameters;
- URL search state;
- navigation state;
- route-level code splitting.

Route state should be used when the state must survive refreshes, deep links, or browser navigation.

Examples include:

```text
/projects
/projects/$projectId
/schedule
/team
/settings
```

Future routes should only be added when the corresponding feature actually exists.

Do not keep placeholder navigation items.

---

## Server State

### TanStack Query

TanStack Query is the canonical client-side server-state layer.

Use it for data that originates from Supabase or another external data source.

Examples include:

- projects;
- project outcomes;
- members;
- schedules;
- messages;
- reports;
- notifications.

TanStack Query should own:

- query caching;
- loading state;
- invalidation;
- refetching;
- mutations;
- optimistic updates where appropriate.

Do not use React `useEffect` as the default data-fetching architecture.

---

## Local State

Use React state for UI state that belongs only to the current interaction.

Examples include:

- whether a dialog is open;
- the currently expanded panel;
- local form state;
- temporary drag state;
- selected UI controls that do not belong in the URL.

Use TanStack Router for navigational state.

Use TanStack Query for server state.

Do not add Redux, Zustand, or another global state library unless a concrete cross-feature client-state requirement appears that cannot be handled cleanly by these three layers.

---

## Styling and Design System

### Tailwind CSS

Tailwind CSS is the primary styling system.

Use semantic design tokens and shared component styles instead of repeating arbitrary values across feature code.

---

### Shared UI Components

Dx should maintain a small shared component layer based on shadcn-style primitives.

Examples include:

- Button;
- Input;
- Textarea;
- Select;
- Dialog;
- Drawer;
- Dropdown;
- Tabs;
- Tooltip;
- Toast;
- Skeleton;
- Table.

Feature modules should reuse shared primitives before introducing new visual patterns.

---

### Prometheus Design System

The Prometheus visual identity remains the canonical interface direction.

The current principles remain:

- content surfaces are solid;
- navigation and temporary controls may use Liquid Glass;
- glass is not used for repeated content cards;
- stage and board containers remain solid;
- Prometheus orange remains the primary accent;
- the application should feel technical, calm, and restrained.

Liquid Glass should remain a shared visual primitive rather than being reimplemented inside individual features.

---

## Forms and Validation

### React Hook Form

React Hook Form is the preferred form-state library.

Use it for non-trivial forms and workflows.

---

### Zod

Zod is the canonical runtime validation layer.

Validate:

- form input;
- URL state;
- data crossing application boundaries;
- Edge Function input;
- external API responses where required.

Frontend validation improves usability.

Security-critical validation must also happen at a trusted backend or database boundary.

---

## Backend Platform

### Supabase

Supabase provides the backend infrastructure for Dx.

The initial platform responsibilities are:

```text
Supabase
├── PostgreSQL
├── Authentication
├── Row Level Security
├── Storage
├── Realtime
└── Edge Functions
```

Avoid building duplicate infrastructure when Supabase already provides the required capability.

---

## Database

### PostgreSQL

PostgreSQL is the canonical source of truth for persistent business data.

Important relationships and workflow state must not exist only inside frontend state.

Business entities should use normal relational modeling first.

Use JSON only where the data is genuinely flexible and relational modeling does not improve correctness or querying.

Database constraints should protect important invariants where practical.

---

## Authentication

### Supabase Auth

Supabase Auth manages user authentication and sessions.

The initial authentication system should support the flows required by the product without introducing custom authentication infrastructure.

Do not store passwords or implement a custom authentication system.

---

## Authorization

Authorization should use multiple boundaries.

```text
UI permission checks
        |
        v
Application permission checks
        |
        v
PostgreSQL Row Level Security
```

UI permission checks improve usability but are not security boundaries.

Row Level Security is the final data-access boundary for tables exposed through Supabase.

Project-specific permissions should remain contextual rather than becoming unnecessary global roles.

For example:

```text
Company Member
    +
Project A Lead
    +
Project B Member
```

is preferable to treating `Project Lead` as a permanent global system role.

---

## Realtime

### Supabase Realtime

Realtime should be used selectively.

Good candidates include:

- project chat;
- notifications;
- presence;
- submission events;
- review decisions;
- outcome status changes;
- schedule changes.

Do not make every database table realtime by default.

Prefer explicit project or workspace channels when possible.

Example:

```text
project:123
```

Possible events:

```text
outcome.updated
submission.created
submission.accepted
member.joined
message.created
```

Realtime is an enhancement to persisted state.

PostgreSQL remains the source of truth.

---

## File Storage

### Supabase Storage

Use Supabase Storage for uploaded files and project artifacts.

Application tables should store file metadata and ownership relationships.

Files should not be public by default.

Access should follow authenticated user and project permissions.

---

## Edge Functions

Supabase Edge Functions are used when an operation requires a trusted server-side boundary.

Examples include:

- secret API keys;
- third-party integrations;
- administrative operations;
- privileged account operations;
- webhooks;
- workflows that should not execute directly from the browser.

Normal application CRUD does not automatically require an Edge Function.

Do not create backend endpoints merely to mirror database CRUD.

---

## Testing

### Vitest

Vitest is used for:

- unit tests;
- domain behavior;
- validation;
- hooks;
- components;
- utility behavior.

Tests should focus on stable behavior rather than implementation details.

---

### Playwright

Playwright is used for critical end-to-end workflows.

Important user-facing functionality should be validated through the application as closely as possible to how a real user experiences it.

Examples include:

```text
Login
Project creation
Outcome assignment
Output submission
Review and acceptance
Schedule configuration
Permission boundaries
```

When fixing a bug, reproduce the problem through an end-to-end path first when practical.

---

## Package Management

Use pnpm as the package manager.

The repository should maintain one lockfile.

Avoid mixing npm, Yarn, and pnpm workflows.

---

## CI

GitHub Actions is the default continuous integration platform.

At minimum, the CI pipeline should eventually run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Critical end-to-end tests should also run where the CI environment supports the required Supabase setup.

Database changes should receive their own migration and database-level verification.

---

## Deployment

The initial deployment model should remain simple.

```text
GitHub
   |
   v
Frontend Host
   |
React + Vite
   |
   v
Supabase
```

Suitable frontend hosts include:

- Vercel;
- Cloudflare Pages;
- Netlify.

The specific frontend host is not yet an architectural dependency.

Supabase remains the backend platform.

---

## Proposed Source Structure

The exact domain modules are intentionally not finalized yet.

The frontend should follow a feature-oriented structure similar to:

```text
src/
├── app/
│   ├── providers/
│   └── router/
│
├── routes/
│
├── features/
│
├── components/
│   ├── ui/
│   └── shared/
│
├── lib/
│   ├── supabase/
│   └── query/
│
├── config/
│
└── types/
```

Future domain modules belong under `src/features`.

Example only:

```text
src/features/
├── auth/
├── projects/
├── schedule/
├── team/
└── collaboration/
```

These names are not a commitment to the final domain architecture.

Domain boundaries should be decided after the business concepts and workflows are sufficiently clear.

---

## Module Rules

Feature modules should own their business behavior.

A feature may contain:

```text
feature/
├── api/
├── components/
├── domain/
├── hooks/
├── schemas/
└── types/
```

Do not create every folder mechanically.

Only introduce a folder or abstraction when the feature actually needs it.

Prefer deep modules with small public interfaces.

Avoid generic dumping grounds such as:

```text
helpers/
misc/
common/
services/
```

unless they represent a real, coherent responsibility.

---

## Architecture Constraints

The current architecture is intentionally simple.

Do not introduce the following without a demonstrated need:

- microservices;
- GraphQL;
- Redux;
- Zustand;
- Redis;
- Kafka;
- RabbitMQ;
- event sourcing;
- CQRS;
- Kubernetes;
- service buses;
- dependency injection containers;
- repository layers that only wrap Supabase;
- speculative backend services.

The system should remain easy to reason about before becoming distributed.

---

## Current Architectural Position

The technology stack is decided.

```text
React
+
Vite
+
TypeScript
+
TanStack Router
+
TanStack Query
+
Supabase
```

The product architecture is not yet fully decided.

The next decisions should be made in this order:

```text
Business concepts
        |
        v
System flow
        |
        v
Domain boundaries
        |
        v
Entity relationships
        |
        v
Permissions
        |
        v
Database schema
        |
        v
Feature interfaces
        |
        v
UI implementation
```

Technology should support these decisions rather than dictate them.

---

## Summary

Dx will be built as a React and Vite application backed by Supabase.

The frontend remains modular and feature-oriented.

PostgreSQL is the source of truth.

Supabase provides authentication, authorization support through RLS, storage, realtime capabilities, and trusted Edge Functions.

TanStack Router owns navigation state.

TanStack Query owns server state.

React owns local UI state.

The system should remain simple and monolithic until real requirements justify additional infrastructure.
