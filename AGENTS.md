# Application coding conventions

- Read `docs/business-context.md`, root `DESIGN.md`, and the relevant `docs/features/<feature>.md` before client feature work. Use `docs/feature-spec.md` for new specifications; resolve access and ownership decisions first.
- Treat `DESIGN.md` as the UI source of truth. Reuse shared primitives and the approved Liquid Glass hierarchy instead of creating feature-local visual systems.

- Put product capabilities under `src/features/<feature>`; keep routes focused on routing, data loading, and composition.
- Keep business and authorization logic out of React components.
- Prefer Server Components. Add `"use client"` only for browser state, events, or client-only libraries.
- Reuse existing feature and shared primitives before creating another abstraction or component.
- Keep the application a modular monolith; do not add service boundaries without a measured need.

## Data and security

- Represent every schema, function, trigger, grant, and RLS change in a checked-in Supabase migration.
- Create migrations with `pnpm exec supabase migration new <name>` and regenerate `src/types/database.generated.ts` after schema changes.
- Enable RLS on every exposed table and add indexes for policy filter columns.
- Validate all user input, URL state, file data, and external data with Zod.
- Authenticate and authorize protected operations on the server with the canonical `requirePermission()` pattern.
- `PermissionGuard` controls UI visibility only; it never replaces server authorization or RLS.
- Never expose secret/service-role keys or authorize from user-editable auth metadata.
- Audit important creates, updates, deletes, role/permission changes, approvals, and sensitive exports; do not audit cosmetic UI events.

## Canonical patterns

- Copy `src/features/customers` for database-backed CRUD features.
- Use `AppDataTable` for standard searchable, sortable, paginated tables.
- Use React Hook Form plus `zodResolver`, while repeating validation inside the Server Action.
- Return the shared `ActionResult` shape from Server Actions; expose safe messages and log no secrets.
- Revalidate every affected route after a successful mutation.
- Keep tenant scope explicit and optional. Use `organization_id`, organization context, scoped permission checks, and RLS only for tenant-owned data.
- Add tests for permission matrices, validation, and important domain behavior. Add pgTAP coverage when changing RLS.

Before completion, run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`. For database changes also run `pnpm db:reset`, `pnpm db:types`, `pnpm db:test`, and local database advisors.


# AGENTS.md

## Purpose

This file defines how AI coding agents must work in this repository.

The repository is the system of record.

This file is the mandatory entrypoint for substantial implementation, refactoring, debugging, database, architecture, and documentation tasks.

The agent must use the `.context/` directory to understand the system before changing it.

The goal is not only to produce working code.

The goal is to leave the repository with correct code, verified behavior, current documentation, and reusable knowledge from mistakes and discoveries.

---

## 1. Mandatory Start Sequence

Before making a substantial change, the agent must:

1. Read this `AGENTS.md`.
2. Inspect `.context/` and identify the canonical documents relevant to the task.
3. Read the relevant canonical documents before proposing or changing implementation.
4. Read the relevant module document under `.context/.modules/` when the task affects a specific product module.
5. Inspect the affected code and nearby tests.
6. Check the current Git branch and working tree.
7. Create a task worklog for substantial work.
8. Write a short implementation plan before editing.

Do not start implementation from assumptions when the repository already contains code or documentation that can answer the question.

Do not ask the user to repeat information that is already available in the repository.

---

## 2. Documentation Directory

The project context lives under:

```text
.context/
```

Current documentation includes:

```text
.context/
├── tech-stack.md
├── domain-architecture.md
├── permissions-model.md
├── entity-relationships.md
├── database-schema.md
├── feature-module-boundaries.md
├── systemflow.md
├── modules-context.md
└── .modules/
    ├── 01-home-command-center.md
    ├── 02-project-delivery.md
    ├── 03-visiwork.md
    ├── 04-schedule-availability.md
    ├── 05-time-attendance.md
    ├── 06-team-people.md
    ├── 07-reports-analytics.md
    ├── 08-activity-audit.md
    ├── 09-identity-roles-permissions.md
    └── 10-settings-administration.md
```

Additional knowledge-management directories may be created under `.context/` as described later in this file.

---

## 3. Documentation Authority

Not every document has equal authority.

When documents disagree, use the following precedence.

### Level 1 - Canonical architecture

These documents define the approved current architecture:

```text
.context/domain-architecture.md
.context/permissions-model.md
.context/entity-relationships.md
.context/database-schema.md
.context/feature-module-boundaries.md
.context/tech-stack.md
```

### Level 2 - Product flow context

This document describes the broader system flow:

```text
.context/systemflow.md
```

Use it for product intent and flow context.

Do not allow it to override newer canonical architecture decisions.

### Level 3 - Module and UI context

These documents describe product modules and module-specific behavior:

```text
.context/modules-context.md
.context/.modules/*.md
```

Use them when working on a corresponding product area.

They may contain older product concepts and must be reconciled against Level 1 canonical architecture before implementation.

---

## 4. Known Legacy Conflicts

Some existing context documents may still contain older concepts.

The currently approved domain model takes precedence.

In particular:

```text
There is no Assistant Lead role in the approved Domain Model v1.
```

```text
There is no mandatory Outcome Owner role in the approved Domain Model v1.
```

The approved model uses:

```text
Project Lead
Project Member
Outcome Participant
```

An Outcome may have multiple Participants.

A special Primary Owner may only be introduced later if the canonical domain architecture is explicitly changed.

If `systemflow.md`, `modules-context.md`, or a module document contradicts this, treat the conflicting wording as stale product context rather than current architecture.

Record and correct the documentation conflict when it is in scope.

---

## 5. Core Product Model

Dx is outcome-centered.

The core planning hierarchy is:

```text
Project
  ↓
Stage
  ↓
Outcome
```

The Outcome is the primary unit of project accountability.

Features and Tasks describe execution beneath an Outcome.

Output Submissions represent what Participants produced to satisfy an Outcome.

The Project Lead reviews submitted work against Acceptance Criteria.

Do not replace this with a task-first or Jira-style model unless the canonical domain architecture is deliberately changed.

---

## 6. Current Technology Baseline

The approved baseline is defined by `.context/tech-stack.md`.

The current direction is:

```text
React
Vite
TypeScript
TanStack Router
TanStack Query
Supabase
PostgreSQL
Supabase Auth
Supabase Storage
Supabase Realtime
React Hook Form
Zod
Vitest
Playwright
pnpm
GitHub Actions
```

Do not introduce another major framework, state-management system, backend platform, or infrastructure service without a demonstrated requirement and an explicit architecture decision.

---

## 7. Module Ownership

The canonical module boundaries are defined in:

```text
.context/feature-module-boundaries.md
```

The primary feature modules are:

```text
Auth
People
Departments
Projects
Work
Schedule
Collaboration
Activity
Audit
Reporting
```

VisiWork is a composition surface.

VisiWork is not a separate source of business truth.

Routes compose feature modules.

Routes do not own domain logic.

The module that owns an entity owns its mutations.

Do not update another module's data directly merely because it is convenient.

---

## 8. Engineering Principles

Prefer:

- simple architecture;
- explicit relationships;
- deep modules with small public interfaces;
- one canonical source of truth;
- strong PostgreSQL constraints;
- contextual authorization;
- narrow RLS policies;
- vertical slices;
- incremental verification;
- immutable historical evidence where required;
- clear domain errors;
- small coherent commits when commits are requested;
- deletion of obsolete code instead of compatibility shims.

Avoid:

- speculative abstractions;
- generic repository layers that only wrap Supabase;
- giant `services/` folders;
- duplicate domain models;
- global state without a demonstrated need;
- generic ACL engines;
- application-wide event buses;
- premature microservices;
- Redis without a demonstrated requirement;
- CQRS without a demonstrated requirement;
- event sourcing without a demonstrated requirement;
- stale wrappers;
- commented-out obsolete implementations;
- placeholder business logic;
- hidden duplicate sources of truth.

Quality and maintainability take priority over minimizing implementation effort.

---

# TASK WORKFLOW

## 9. Classify the Task

Before editing, classify the task.

Typical categories include:

```text
Feature implementation
Bug fix
Refactor
Database change
Permission change
Architecture change
UI change
Performance improvement
Documentation-only change
```

The category determines which canonical documents must be read and which verification steps are required.

---

## 10. Documentation Reference Map

### Technology or framework work

Read:

```text
.context/tech-stack.md
.context/feature-module-boundaries.md
```

### Business concept or domain behavior

Read:

```text
.context/domain-architecture.md
.context/systemflow.md
```

### Authorization or access-control work

Read:

```text
.context/permissions-model.md
.context/domain-architecture.md
.context/database-schema.md
```

### Entity relationship work

Read:

```text
.context/entity-relationships.md
.context/domain-architecture.md
.context/database-schema.md
```

### Database, migration, RLS, or storage work

Read:

```text
.context/database-schema.md
.context/entity-relationships.md
.context/permissions-model.md
```

### Feature ownership or module-boundary work

Read:

```text
.context/feature-module-boundaries.md
.context/domain-architecture.md
```

### Product flow work

Read:

```text
.context/systemflow.md
.context/domain-architecture.md
.context/permissions-model.md
```

### Product-module-specific work

Also read the corresponding file under:

```text
.context/.modules/
```

### Cross-module work

Read:

```text
.context/modules-context.md
```

plus all canonical documents directly affected by the change.

---

## 11. Understand Before Editing

Before implementation:

1. Identify the current source of truth.
2. Inspect the affected module.
3. Inspect neighboring modules at the seam being changed.
4. Identify existing tests.
5. Identify permission boundaries.
6. Identify relevant database invariants.
7. Identify state transitions.
8. Identify historical data that must remain immutable.
9. Identify generated files that must not be manually edited.
10. Identify documentation that may become stale after the change.

Do not modify code until the current behavior is understood.

---

## 12. Bug Fix Rule

For a bug fix, reproduce the failure before implementing the fix whenever practical.

The preferred sequence is:

```text
Reproduce
  ↓
Identify root cause
  ↓
Add or update regression coverage
  ↓
Implement fix
  ↓
Verify original failure is gone
  ↓
Verify neighboring behavior
  ↓
Document reusable learning
```

Do not stop at making the visible symptom disappear.

---

## 13. Plan Before Editing

For substantial work, create a short plan.

The plan should identify:

```text
Goal
Affected modules
Affected entities
Permission implications
Database implications
State transitions
Expected files
Test strategy
Documentation likely to change
```

Prefer the smallest complete vertical slice.

Do not spread partially implemented architecture across many modules when one complete slice can be delivered first.

---

# WORKLOG SYSTEM

## 14. Create a Worklog

For substantial tasks, create:

```text
.context/.worklogs/YYYY-MM-DD-short-task-name.md
```

Create `.context/.worklogs/` if it does not exist.

A Worklog is not required for:

- typo fixes;
- formatting-only changes;
- obvious one-line refactors;
- generated-file refreshes with no behavioral change.

The Worklog should be created before significant implementation begins.

---

## 15. Worklog Template

Use this structure when relevant:

```markdown
# Task Name

## Goal

## Relevant Canonical Docs

## Initial Assumptions

## Plan

## Findings

## Problems Encountered

## Failed Approaches

## Root Cause

## Final Solution

## Verification

## Tests Added or Updated

## Lessons Learned

## Knowledge Promoted

## Remaining Risks

## Follow-Up
```

Do not fill sections with meaningless placeholders.

Omit sections that genuinely do not apply.

---

## 16. What Belongs in a Worklog

Record information with future value.

Good entries include:

```text
An important assumption that affected implementation
An unexpected relationship between modules
A permission rule that was easy to misunderstand
A failed implementation approach and why it failed
A race condition
A database constraint that prevented a bad state
A root cause of a defect
A non-obvious testing technique
A reusable implementation lesson
A newly discovered documentation inconsistency
```

Do not record every command, file save, import change, or minor edit.

The Worklog should remain readable.

---

## 17. Failed Approach Template

When a failed approach teaches something useful, record:

```markdown
### Problem

Describe the observed behavior.

### Attempt

Describe what was tried.

### Why It Failed

Describe the incorrect assumption, missing constraint, or technical limitation.

### Root Cause

Describe what was actually wrong.

### Solution

Describe the final fix.

### Verification

Describe how the fix was proven correct.

### Prevention

Describe what should prevent recurrence.
```

Do not hide meaningful mistakes.

The purpose is to prevent future developers and agents from repeating them.

---

# IMPLEMENTATION RULES

## 18. Preserve Canonical Ownership

Before writing a mutation, identify which feature module owns it.

Examples:

```text
Project membership -> Projects
Outcome participation -> Work
Messages -> Collaboration
Availability -> Schedule
Activity events -> Activity
Audit events -> Audit
```

Do not bypass a module's ownership boundary.

---

## 19. Preserve Sources of Truth

Do not duplicate canonical state.

Examples:

```text
Project Lead
-> project membership role

Project membership
-> project memberships

Department membership
-> Person profile relationship

Outcome Project
-> Outcome -> Stage -> Project

Outcome participation
-> outcome participants

Submission version history
-> output submissions

Review decision
-> reviews

Dependency
-> outcome dependencies

Dependency override
-> dependency overrides
```

Derived values should remain derived unless there is a measured reason to persist them.

For example, do not store mutable Project progress when it can be derived from accepted Outcomes.

---

## 20. Authorization

UI permission checks improve usability.

They are not security boundaries.

Protected operations must enforce authorization at a trusted boundary.

The intended layers are:

```text
UI capability check
        ↓
Trusted application/domain check
        ↓
PostgreSQL Row Level Security
```

Undefined permissions are denied by default.

Always test both allowed and denied paths.

---

## 21. Database Changes

For every database change:

1. Use a migration.
2. Preserve the approved domain model.
3. Add or update constraints.
4. Add or update RLS.
5. Add or update database tests.
6. Verify allowed behavior.
7. Verify forbidden behavior.
8. Reset the local database when supported.
9. Regenerate database types.
10. Run application type checking afterward.

Do not manually edit generated database types.

Do not rewrite migration history unless the repository explicitly permits it.

Do not weaken RLS to make application code easier.

---

## 22. Historical Integrity

Preserve historical evidence.

Do not casually mutate or delete:

```text
Submitted Output versions
Reviews
Criterion Verifications
Dependency Overrides
Audit Events
Historical Activity Events
Historical Work Sessions
```

Use status changes, archival, new versions, or explicit correction flows where the domain requires history.

---

## 23. Concurrency

Assume important operations can happen concurrently.

Use database constraints and transactions for invariants such as:

```text
Exactly one active Project Lead
Unique active Project Membership
Unique active Outcome Participation
Unique Submission version per Outcome
One final Review per Submission
One open Work Session per Person
No duplicate Dependency
No dependency cycle
```

Do not rely solely on a previous client-side read.

---

## 24. UI State

Use:

```text
TanStack Query
-> server state

TanStack Router
-> URL and navigation state

React local state
-> local interaction state
```

Do not introduce Redux, Zustand, or another global state library unless a concrete requirement cannot be handled cleanly by the existing model.

---

## 25. Realtime

Realtime enhances collaboration.

Realtime does not become the source of truth.

Persist the canonical state in PostgreSQL first.

Use realtime selectively for behavior such as:

```text
Messages
Review status
Submission status
Activity
Time In / Time Out presence
```

Do not subscribe to every table by default.

---

# VERIFICATION

## 26. Verify Incrementally

Run focused checks after meaningful implementation steps.

Do not wait until the end of a large change to discover basic failures.

Use the repository's actual scripts.

Typical checks may include:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Critical user workflows should also run:

```bash
pnpm test:e2e
```

Database changes may require scripts such as:

```bash
pnpm db:reset
pnpm db:types
pnpm db:test
pnpm db:advisors
```

Do not invent a script that is not defined by the repository.

---

## 27. Verification Order

Prefer:

```text
Focused unit/domain test
  ↓
Affected integration test
  ↓
Typecheck
  ↓
Lint
  ↓
Database verification when applicable
  ↓
E2E critical path when applicable
  ↓
Production build
```

Adjust when the repository's tooling requires another order.

---

## 28. Permission Tests

Authorization changes must verify both sides.

Example:

```text
Project Lead can accept an Outcome.
Project Member cannot accept an Outcome.
```

```text
Outcome Participant can submit Output.
Non-participant cannot submit Output.
```

```text
Person can edit their own Schedule.
Person cannot edit another Person's Schedule.
```

A hidden or disabled button is not sufficient authorization verification.

---

## 29. Regression Tests

When fixing a non-trivial bug, add a regression test when practical.

A regression test should fail before the fix and pass after it.

If a regression test cannot reasonably be added, explain why in the Worklog.

---

# KNOWLEDGE PROMOTION

## 30. Reflect After Verification

After the implementation passes verification, review what was learned.

Ask:

```text
Was an initial assumption wrong?
Did the actual implementation reveal a new invariant?
Did a module boundary change?
Did authorization behavior change?
Was there a reusable engineering lesson?
Did a meaningful failure occur?
Did current system behavior change?
Did any canonical documentation become stale?
```

Do this before reporting the task complete.

---

## 31. Promote Durable Knowledge

Do not leave important knowledge only inside a Worklog.

Promote durable knowledge to the appropriate permanent location.

Use the following destinations.

### Architecture decision

Create:

```text
.context/.decisions/ADR-XXXX-short-title.md
```

### Reusable engineering lesson

Update:

```text
.context/.engineering/playbook.md
```

### Repeated or dangerous pitfall

Update:

```text
.context/.engineering/known-pitfalls.md
```

### Reusable troubleshooting procedure

Update:

```text
.context/.engineering/troubleshooting.md
```

### Significant incident

Create:

```text
.context/.incidents/YYYY-MM-DD-short-name.md
```

### Current architecture or system behavior changed

Update the relevant canonical `.context/*.md` document.

### One-off implementation detail

Leave it in the Worklog.

Create these directories or files only when they are first needed.

---

## 32. Knowledge Promotion Decision

Use this decision flow:

```text
Did architecture change?
    |
   yes
    v
ADR + canonical architecture update


Is the lesson reusable?
    |
   yes
    v
Engineering Playbook


Is it a repeated or dangerous mistake?
    |
   yes
    v
Known Pitfalls


Was it a significant failure?
    |
   yes
    v
Incident Record


Did current system behavior change?
    |
   yes
    v
Canonical documentation


Was it only useful for this task?
    |
   yes
    v
Keep in Worklog
```

---

# ARCHITECTURE DECISIONS

## 33. When to Create an ADR

Create an Architecture Decision Record when making a meaningful choice such as:

```text
Changing the primary framework
Changing module ownership
Changing a canonical domain relationship
Introducing major infrastructure
Changing persistence strategy
Changing authorization strategy
Changing the core workflow
Replacing an approved architectural pattern
```

Do not create ADRs for ordinary implementation details.

---

## 34. ADR Template

Use:

```markdown
# ADR-XXXX: Decision Title

## Status

Accepted

## Context

Explain the problem or constraint.

## Options Considered

List realistic alternatives.

## Decision

State the chosen direction.

## Rationale

Explain why it was chosen.

## Tradeoffs

Explain costs and limitations.

## Consequences

Explain what changes because of the decision.

## Related Documents

List affected canonical documents and modules.
```

---

# ENGINEERING PLAYBOOK

## 35. Playbook Standard

A good Playbook entry is:

- reusable;
- proven by implementation;
- actionable;
- concise;
- independent of one specific debugging session.

Example:

```markdown
## Atomic Ownership Creation

When an entity is invalid without a required ownership relationship, create both inside the same transaction.

Project creation must create the initial Project Lead membership atomically.

Do not create the Project and Lead membership through independent client requests.
```

---

# INCIDENTS

## 36. When to Create an Incident Record

Create an Incident record for meaningful failures such as:

```text
Security issue
Authorization leak
Data-integrity failure
Production-impacting defect
Historical-data corruption
Significant migration failure
Repeated architectural mistake with real impact
```

Do not create Incident records for ordinary debugging.

---

## 37. Incident Template

Use:

```markdown
# Incident: Short Name

## What Happened

## Impact

## Expected Behavior

## Root Cause

## Incorrect Assumption

## Failed Approaches

## Solution

## Verification

## Prevention

## Tests Added

## Related Files

## Related ADRs
```

---

# DOCUMENTATION CONSISTENCY

## 38. Canonical Docs Describe Current Truth

Canonical architecture documents describe how the system works now.

Do not fill canonical docs with:

```text
failed attempts
debugging history
obsolete implementations
old role names
temporary alternatives
session notes
```

Historical reasoning belongs in Worklogs, ADRs, and Incident records.

---

## 39. Resolve Documentation Drift

If implementation and documentation disagree:

1. Inspect both.
2. Determine which one reflects the approved current system.
3. Do not guess.
4. Correct the stale source when it is in scope.
5. Record an architectural change if the implementation intentionally changes the approved system.

Do not automatically assume code is correct.

Do not automatically assume documentation is correct.

The goal is one coherent source of truth.

---

## 40. Terminology

Use canonical domain terminology.

Current preferred terms include:

```text
Project
Project Lead
Project Member
Stage
Outcome
Outcome Participant
Responsible Department
Acceptance Criterion
Feature
Task
Output Submission
Review
Outcome Dependency
Dependency Override
Activity Event
Audit Event
Availability Window
Planned Work Block
Actual Work Session
```

Do not introduce synonyms unless they represent a real semantic distinction.

---

# GIT AND GENERATED FILES

## 41. Git Safety

Before substantial work:

```bash
git branch --show-current
git status
```

Do not assume a specific repository branch name.

Do not assume the default branch is named `main`.

Do not force-push unless explicitly required by the repository workflow and the consequences are understood.

Do not commit or push automatically unless the user explicitly requests it.

Before a requested commit, review:

```bash
git status
git diff --stat
git diff
```

Do not add an AI agent as a commit co-author.

---

## 42. Generated Files

Do not manually edit generated files.

Examples may include:

```text
Generated database types
Generated router trees
Generated API clients
Build artifacts
```

Use the repository's supported generation command.

Do not manually edit an autogenerated `CHANGELOG.md`.

---

# COMPLETION GATE

## 43. Mandatory End-of-Task Checklist

Before reporting a substantial task complete, verify:

```text
[ ] Relevant canonical docs were read.
[ ] Relevant module docs were read.
[ ] Worklog was created or updated when required.
[ ] Existing behavior was understood before modification.
[ ] The implementation respects module ownership.
[ ] Canonical sources of truth were preserved.
[ ] Permission behavior was verified.
[ ] Database invariants were verified when applicable.
[ ] Relevant tests were added or updated.
[ ] Focused tests pass.
[ ] Typecheck passes.
[ ] Lint passes.
[ ] Database verification passes when applicable.
[ ] Critical E2E flow passes when applicable.
[ ] Production build passes when applicable.
[ ] Meaningful failed approaches were recorded.
[ ] Root cause was recorded for non-trivial bugs.
[ ] Reusable lessons were promoted.
[ ] ADR was created if architecture changed.
[ ] Canonical docs were updated if current behavior changed.
[ ] Documentation conflicts introduced by the task were resolved.
[ ] Git diff was reviewed when Git changes are being finalized.
```

If a required check cannot run, report that explicitly.

Do not claim verification that was not performed.

---

## 44. Final Worklog Update

Before completion, update the Worklog with:

```text
Final Solution
Verification
Tests Added or Updated
Lessons Learned
Knowledge Promoted
Remaining Risks
Follow-Up
```

The Worklog should make it possible for another developer or agent to understand the important decisions without replaying the entire session.

---

## 45. Final Response Standard

When reporting completion, summarize:

```text
What changed
Why it changed
What was verified
What documentation was updated
What knowledge was promoted
Any remaining risk or follow-up
```

Do not dump low-value implementation details.

Do not hide unresolved failures.

---

# AGENT SELF-CHECK

## 46. Before Changing Architecture

Ask:

```text
Is this required by the task?
Does a canonical document already define this?
Am I changing architecture to solve a local implementation inconvenience?
Can the existing model support the requirement cleanly?
```

If the existing architecture works, preserve it.

---

## 47. Before Adding a Dependency

Ask:

```text
What concrete problem does this package solve?
Can the existing stack solve it simply?
Will it become a new architectural dependency?
Does it duplicate something already provided by React, TanStack, Supabase, PostgreSQL, or existing project tooling?
```

Avoid dependencies added only for convenience.

---

## 48. Before Adding an Abstraction

Ask:

```text
Is there already repeated complexity?
Does the abstraction have a coherent responsibility?
Will callers have a smaller and clearer interface?
Am I hiding domain behavior behind generic infrastructure?
```

Prefer duplication briefly over the wrong abstraction.

Extract only when the shared responsibility is real.

---

## 49. Before Declaring Done

Ask:

```text
Does the user-facing flow actually work?
Could an unauthorized user bypass the UI?
Could concurrent requests violate an invariant?
Did I leave stale documentation?
Did I leave old code paths?
Did I learn something that the next agent would otherwise have to rediscover?
```

If the answer reveals a problem within scope, address it before completion.

---

## 50. Guiding Principle

Every substantial task should improve both the product and the repository's institutional memory.

The desired loop is:

```text
Understand
  ↓
Plan
  ↓
Implement
  ↓
Verify
  ↓
Reflect
  ↓
Document
  ↓
Promote reusable knowledge
  ↓
Complete
```

Worklogs explain what happened.

ADRs explain why architectural decisions were made.

Incident records explain significant failures and prevention.

The Engineering Playbook captures reusable lessons.

Canonical context documents explain how the system works now.

Code remains the actual implementation.

The agent is responsible for keeping these sources coherent.
