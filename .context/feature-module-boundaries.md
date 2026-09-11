# Dx Feature Module Boundaries

## Purpose

This document defines the Feature Module Boundaries for Dx.

It translates the approved:

- Tech Stack
- Domain Architecture
- Permissions Model
- Entity Relationships
- Database Schema Plan

into application-level module boundaries for the React + Vite codebase.

The goal is to keep the codebase modular without introducing unnecessary layers, services, repositories, or distributed architecture.

Dx remains one application and one database.

---

## 1. Architectural Principle

Dx uses a modular monolith on the frontend and backend platform.

The system is one product, but major business capabilities are separated into feature modules.

Conceptually:

```text
React + Vite Application
        |
        +-- Auth
        +-- People
        +-- Departments
        +-- Projects
        +-- Work
        +-- Schedule
        +-- Collaboration
        +-- Activity
        +-- Audit
        +-- Reporting
        |
        v
Supabase
```

Each module owns its business concepts and exposes a small public interface.

A module should not expose its internal file structure as a public API.

---

## 2. Core Rule

Feature boundaries follow business ownership, not pages.

Do not create modules such as:

```text
dashboard
settings-page
project-screen
sidebar
```

unless they represent a real reusable business capability.

Pages compose modules.

Modules own domain behavior.

---

## 3. Proposed Source Structure

```text
src/
├── app/
│   ├── providers/
│   ├── router/
│   └── shell/
│
├── routes/
│
├── features/
│   ├── auth/
│   ├── people/
│   ├── departments/
│   ├── projects/
│   ├── work/
│   ├── schedule/
│   ├── collaboration/
│   ├── activity/
│   ├── audit/
│   └── reporting/
│
├── components/
│   ├── ui/
│   └── shared/
│
├── lib/
│   ├── supabase/
│   ├── query/
│   ├── validation/
│   └── permissions/
│
├── config/
└── types/
```

This is the architectural target.

Not every module needs every internal folder.

---

## 4. Module Internal Structure

A feature may use a structure such as:

```text
features/projects/
├── api/
├── components/
├── domain/
├── hooks/
├── schemas/
├── types/
└── index.ts
```

Only create folders that the module actually needs.

Avoid mechanical boilerplate.

The module's `index.ts` acts as the intentional public surface.

Other modules should avoid importing deep internal files.

---

## 5. Public Interface Rule

Other modules should prefer:

```ts
import {
  ProjectSummary,
  useProject,
  canManageProject
} from "@/features/projects";
```

rather than:

```ts
import { something } from "@/features/projects/internal/random-file";
```

Deep imports create accidental coupling.

The public interface should remain small.

---

# Module Definitions

## 6. Auth Module

### Owns

The Auth module owns authentication state and account session behavior.

Concepts:

```text
Authenticated user
Session
Sign in
Sign out
Password recovery
Session refresh
Auth guards
```

### Database / Platform Ownership

Auth primarily owns interaction with:

```text
Supabase Auth
```

It does not own `profiles` as a business domain.

`profiles` belong to People.

### Public Responsibilities

The Auth module may expose:

```text
current authenticated user
current session
sign in
sign out
require authenticated user
auth loading state
```

### Does Not Own

Auth does not own:

```text
Company role policy
Project role policy
Profile editing
Department membership
Project membership
```

---

## 7. People Module

### Owns

The People module owns the Person concept.

Database ownership:

```text
profiles
```

### Responsibilities

```text
Profile retrieval
Profile editing
Person status
Display identity
Avatar metadata
Company role visibility
Inactive Person handling
```

### Public Interface Examples

```text
getPerson
getPeople
getCurrentPerson
updateOwnProfile
getPersonDisplayName
isPersonActive
```

### Does Not Own

People does not own:

```text
Department management
Project roles
Outcome participation
Schedule records
```

It may expose Person identity to those modules.

---

## 8. Departments Module

### Owns

Database ownership:

```text
departments
```

Department membership is represented through:

```text
profiles.department_id
```

The Departments module owns the business interpretation of that relationship.

### Responsibilities

```text
List Departments
Create Department
Edit Department
Archive Department
View Department members
Assign Person to primary Department
Department-level visibility
```

### Public Interface Examples

```text
getDepartments
getDepartment
getDepartmentMembers
createDepartment
updateDepartment
archiveDepartment
assignPersonDepartment
```

### Does Not Own

Departments does not own:

```text
Project access
Outcome contribution
Project permissions
Task assignment
```

Department membership is organizational context only.

---

## 9. Projects Module

### Owns

The Projects module owns Project governance.

Database ownership:

```text
projects
project_memberships
project_departments
stages
```

### Responsibilities

```text
Project lifecycle
Project creation
Project details
Project membership
Project roles
Project Lead
Project Departments
Stage creation
Stage ordering
Project status
Project completion
Project archival
```

### Public Interface Examples

```text
createProject
getProject
getProjectsForPerson
getProjectMembers
addProjectMember
removeProjectMember
transferProjectLead
createStage
reorderStages
pauseProject
resumeProject
completeProject
archiveProject
```

### Important Boundary

Projects owns the container and governance.

Projects does not own the detailed execution model inside an Outcome.

That belongs to Work.

---

## 10. Work Module

### Owns

The Work module owns Outcome execution.

Database ownership:

```text
outcomes
outcome_participants
acceptance_criteria
features
tasks
output_submissions
submission_artifacts
reviews
criterion_verifications
outcome_dependencies
dependency_overrides
```

### Responsibilities

```text
Outcome creation and state
Outcome participation
Responsible Department assignment
Acceptance Criteria
Features
Tasks
Task assignment
Output Submissions
Submission versioning
Submission Artifacts
Review
Revision requests
Acceptance
Dependencies
Dependency overrides
Outcome execution rules
```

### Public Interface Examples

```text
getOutcome
getOutcomesForProject
createOutcome
updateOutcome
cancelOutcome
joinOutcome
assignOutcomeParticipant
leaveOutcome
createAcceptanceCriterion
createFeature
createTask
assignTask
submitOutput
reviewSubmission
acceptSubmission
createDependency
overrideDependency
```

### Important Boundary

Work may reference:

```text
Project ID
Stage ID
Person ID
Department ID
```

but it should not duplicate Project, Person, or Department business logic.

---

## 11. Projects and Work Relationship

This is the most important seam in the application.

Projects owns:

```text
Project
Project Membership
Project Role
Stage
Project Lifecycle
```

Work owns:

```text
Outcome
Outcome Participation
Acceptance Criteria
Feature
Task
Submission
Review
Dependency
```

Conceptually:

```text
Projects
   |
   v
Stage
   |
   v
Work
   |
   v
Outcome execution
```

The Projects module may render Work module components.

The Work module may query Project relationships through approved Projects interfaces.

Do not merge both modules into one giant `projects` feature.

---

## 12. Schedule Module

### Owns

Database ownership:

```text
availability_windows
planned_work_blocks
actual_work_sessions
```

### Responsibilities

```text
Availability
Planned work schedule
Time In
Time Out
Actual work sessions
Own schedule editing
Team schedule visibility
Planned-versus-actual data
```

### Public Interface Examples

```text
getOwnAvailability
updateAvailability
getPlannedWorkBlocks
createPlannedWorkBlock
startWorkSession
endWorkSession
getTeamSchedule
getPersonSchedule
```

### Does Not Own

Schedule does not own:

```text
Project assignments
Task ownership
Outcome participation
Project progress
```

Do not connect Schedule directly to Project entities unless a later requirement explicitly requires Project-specific time allocation.

---

## 13. Collaboration Module

### Owns

Database ownership:

```text
conversations
messages
```

### Responsibilities

```text
Company Chat
Department Chat
Project Chat
Conversation visibility
Message retrieval
Message sending
Message editing if supported
Message deletion if supported
Realtime message subscription
```

### Public Interface Examples

```text
getConversationForProject
getConversationForDepartment
getCompanyConversation
getMessages
sendMessage
editMessage
deleteMessage
subscribeToConversation
```

### Does Not Own

Collaboration does not own:

```text
Project membership
Department membership
Company membership
```

It asks the relevant module or relies on authorized data boundaries.

---

## 14. Activity Module

### Owns

Database ownership:

```text
activity_events
```

### Responsibilities

```text
User-visible operational history
Project Activity
Outcome Activity
Person Activity
Company Activity where permitted
```

### Public Interface Examples

```text
getProjectActivity
getOutcomeActivity
getPersonActivity
recordActivity
```

### Important Rule

Most feature modules may emit Activity.

They should not directly format or query Activity internals themselves.

Example:

```text
Work
   |
   v
recordActivity(...)
```

The Activity module owns event presentation and query behavior.

---

## 15. Audit Module

### Owns

Database ownership:

```text
audit_events
```

### Responsibilities

```text
Security-sensitive history
Administrative intervention history
Permission changes
Project Lead changes
Dependency override audit
Historical correction audit
```

### Public Interface Examples

```text
recordAuditEvent
getAuditEvents
getAuditEventsForResource
```

### Important Rule

Audit is not a general event bus.

It exists for accountability.

Normal application collaboration should use Activity instead.

---

## 16. Reporting Module

### Owns

Reporting owns no canonical transactional table in v1.

It owns:

```text
Reporting queries
Derived read models
Report components
Report formatting
Metrics composition
```

### Reads From

```text
Projects
Work
People
Departments
Schedule
Activity
```

### Public Interface Examples

```text
getProjectProgress
getStageProgress
getBlockedOutcomeReport
getScheduleSummary
getProjectActivitySummary
```

### Important Rule

Reporting must not create duplicate writable copies of operational state.

It reads canonical data.

---

# Shared Application Infrastructure

## 17. App Module

The `app` area is not a business feature.

It owns application composition.

```text
src/app/
├── providers/
├── router/
└── shell/
```

Responsibilities include:

```text
TanStack Query provider
TanStack Router setup
Auth provider composition
Global error boundaries
Application shell
Global toast provider
Theme and design system setup
```

Business rules must not live here.

---

## 18. Routes

Routes compose features.

Example:

```text
routes/projects/$projectId.tsx
```

may compose:

```text
ProjectHeader
StageBoard
OutcomeCards
ProjectActivity
ProjectChat
```

from several modules.

Route files should focus on:

```text
Route parameters
Page composition
Route-level loading
Route-level authorization boundary
```

They should not contain:

```text
Supabase CRUD
Domain transition logic
Permission matrices
Large business queries
```

---

## 19. Shared UI Components

`components/ui` owns generic design-system primitives.

Examples:

```text
Button
Dialog
Input
Select
Tabs
Tooltip
Table
Drawer
```

These components know nothing about business concepts.

---

## 20. Shared Components

`components/shared` may contain cross-feature visual composition that is still business-neutral enough to be reused.

Examples:

```text
AppShell
EmptyState
LoadingState
ErrorState
PageHeader
UserAvatar
```

Avoid placing domain-specific components here merely because multiple pages use them.

If a component understands an Outcome, it probably belongs to Work.

If a component understands a Project, it probably belongs to Projects.

---

# Shared Libraries

## 21. Supabase Library

`lib/supabase` owns low-level Supabase client setup.

Responsibilities:

```text
Browser client
Auth client configuration
Shared Supabase typing
Storage client access
```

Feature modules may use this infrastructure.

Do not place business queries here.

Bad:

```text
lib/supabase/getProjects.ts
```

Good:

```text
features/projects/api/get-projects.ts
```

---

## 22. Query Library

`lib/query` owns TanStack Query infrastructure.

Responsibilities:

```text
QueryClient setup
Shared cache configuration
Generic query utilities
```

Feature-specific query keys belong inside their feature modules.

---

## 23. Permissions Library

`lib/permissions` should contain only cross-feature authorization infrastructure.

It may contain shared permission types or helpers used by multiple modules.

However, domain-specific permission policy should remain close to the owning domain.

Example:

```text
Project permission logic
-> Projects

Outcome contribution rules
-> Work
```

Do not build one giant centralized ACL engine.

---

## 24. Validation Library

`lib/validation` may hold generic validation primitives.

Examples:

```text
URL validation
file limits
generic identifiers
shared date helpers
```

Feature-specific Zod schemas belong inside the feature module.

---

# Allowed Dependencies

## 25. Dependency Direction

Preferred dependency direction:

```text
Routes
  |
  v
Feature Modules
  |
  v
Shared Infrastructure
  |
  v
Supabase
```

Feature modules may depend on other feature modules only through explicit public interfaces.

---

## 26. Recommended Feature Dependency Graph

```text
Auth
  |
  v
People
  |
  +--------------+
  |              |
  v              v
Departments   Projects
                 |
                 v
                Work

People -------> Schedule

People -------> Collaboration
Departments --> Collaboration
Projects -----> Collaboration

Projects -----> Activity
Work ---------> Activity
Schedule -----> Activity
Collaboration -> Activity when useful

Admin actions -> Audit

Projects -----> Reporting
Work ---------> Reporting
Schedule -----> Reporting
People -------> Reporting
Activity -----> Reporting
```

This is conceptual, not a requirement to import each module directly in every case.

---

## 27. Auth Dependency Rule

All authenticated business modules may depend on Auth for current identity or session context.

Auth should not depend on business modules.

```text
Auth
   ^
   |
People
Projects
Work
Schedule
...
```

---

## 28. People Dependency Rule

Business modules may reference People identities.

People should not know about every business module.

Good:

```text
Work asks People for display identity
```

Bad:

```text
People imports Work to calculate whether a Person is busy
```

That belongs to Reporting or composition.

---

## 29. Departments Dependency Rule

Projects and Work may reference Departments.

Departments should not import Projects or Work simply to understand Department existence.

Cross-domain summaries belong in composition or Reporting.

---

## 30. Projects Dependency Rule

Work may depend on Projects for:

```text
Project membership
Project Lead relationship
Stage ownership
Project status
```

Projects should not depend deeply on Work internals.

Projects may request high-level progress summaries from Work or Reporting.

This prevents a circular domain dependency.

---

## 31. Work Dependency Rule

Work may depend on:

```text
People
Departments
Projects
Activity
Audit for sensitive governance actions
```

Work should not depend on:

```text
Schedule
Reporting
Collaboration
```

unless a future requirement creates a real domain rule.

---

## 32. Schedule Dependency Rule

Schedule may depend on People.

Schedule should remain independent from Projects and Work in v1.

This prevents accidental coupling between time tracking and project execution.

---

## 33. Collaboration Dependency Rule

Collaboration may require identity and scope IDs.

It should not own membership logic.

Access should rely on:

```text
People
Departments
Projects
```

or database RLS.

Collaboration should not alter Project or Department membership.

---

## 34. Reporting Dependency Rule

Reporting is allowed to read broadly.

It should generally be a dependency leaf.

Other feature modules should not depend on Reporting for domain behavior.

Bad:

```text
Projects asks Reporting whether Project can complete
```

Good:

```text
Projects determines eligibility itself
Reporting reads Projects and Work to display progress
```

---

# Public APIs by Module

## 35. Auth Public Surface

Conceptually:

```text
useAuth
getCurrentAuthUser
signIn
signOut
requireSession
```

---

## 36. People Public Surface

Conceptually:

```text
getPerson
getPeople
getCurrentPerson
updateOwnProfile
getPersonDisplay
```

---

## 37. Departments Public Surface

Conceptually:

```text
getDepartments
getDepartment
getDepartmentMembers
createDepartment
updateDepartment
archiveDepartment
assignPrimaryDepartment
```

---

## 38. Projects Public Surface

Conceptually:

```text
getProjectsForPerson
getProject
getProjectMembers
createProject
updateProject
addProjectMember
removeProjectMember
transferProjectLead
createStage
updateStage
reorderStages
pauseProject
resumeProject
completeProject
archiveProject
```

---

## 39. Work Public Surface

Conceptually:

```text
getOutcome
getProjectOutcomes
createOutcome
updateOutcome
cancelOutcome

joinOutcome
addOutcomeParticipant
removeOutcomeParticipant

createAcceptanceCriterion
updateAcceptanceCriterion

createFeature
updateFeature

createTask
updateTask
assignTask
completeTask

createDraftSubmission
submitOutput
addSubmissionArtifact

reviewSubmission
requestRevision
acceptSubmission

createDependency
removeDependency
overrideDependency
```

---

## 40. Schedule Public Surface

Conceptually:

```text
getOwnSchedule
getPersonSchedule
getTeamSchedule

updateAvailability

createPlannedWorkBlock
updatePlannedWorkBlock
deletePlannedWorkBlock

startWorkSession
endWorkSession
```

---

## 41. Collaboration Public Surface

Conceptually:

```text
getProjectConversation
getDepartmentConversation
getCompanyConversation

getMessages
sendMessage
editMessage
deleteMessage

subscribeToConversation
```

---

## 42. Activity Public Surface

Conceptually:

```text
recordActivity
getProjectActivity
getOutcomeActivity
getPersonActivity
```

---

## 43. Audit Public Surface

Conceptually:

```text
recordAuditEvent
getAuditEvents
getAuditEventsForResource
```

---

## 44. Reporting Public Surface

Conceptually:

```text
getProjectProgress
getStageProgress
getBlockedOutcomes
getScheduleSummary
getProjectWorkSummary
```

---

# Mutation Ownership

## 45. Important Rule

The module that owns an entity owns its mutations.

Example:

```text
Project membership
-> Projects

Outcome participation
-> Work

Messages
-> Collaboration

Availability
-> Schedule
```

Do not update another module's tables directly because it is convenient.

---

## 46. Cross-Module Workflow Example

Creating an Outcome:

```text
Route / UI
   |
   v
Work.createOutcome(...)
   |
   +--> validate Project and Stage relationship
   +--> verify Project Lead authority through Projects
   +--> write Outcome
   +--> write Acceptance Criteria if supplied
   +--> Activity.recordActivity(...)
   |
   v
Return Outcome
```

The route does not coordinate every table write itself.

---

## 47. Output Submission Example

```text
Outcome Participant
        |
        v
Work.submitOutput(...)
        |
        +--> verify participation
        +--> verify Outcome state
        +--> create immutable Submission version
        +--> attach Artifacts
        +--> move Outcome to For Review
        +--> record Activity
        |
        v
Project Lead sees review queue
```

---

## 48. Review Example

```text
Project Lead
    |
    v
Work.reviewSubmission(...)
    |
    +--> verify Lead through Projects
    +--> verify Submission state
    +--> create Review
    +--> create Criterion Verifications
    +--> transition Submission
    +--> transition Outcome
    +--> record Activity
    |
    v
Result returned
```

---

# Query Ownership

## 49. Query Rule

A feature should own the queries that return its domain objects.

Examples:

```text
getProject
-> Projects

getOutcome
-> Work

getMessages
-> Collaboration
```

Composite page queries may be composed at the route or dedicated application query layer if necessary.

Do not duplicate domain query logic in routes.

---

## 50. Composite Views

Some screens combine multiple domains.

Example Project Workspace:

```text
Project Workspace
├── Project details
├── Stage board
├── Outcomes
├── Project Activity
├── Project Chat
└── Member availability
```

This does not mean one module should own all of those entities.

The route or page composition layer combines:

```text
Projects
Work
Activity
Collaboration
Schedule
```

Each module still owns its domain data.

---

# VisiWork

## 51. VisiWork Is a Composition Surface

VisiWork remains a product view, not a feature domain.

Recommended location:

```text
routes/visiwork/
```

or a page-composition feature if its UI becomes substantial.

VisiWork reads from:

```text
People
Departments
Projects
Work
Schedule
Activity
```

It must not own duplicate business state.

---

## 52. VisiWork Rule

If VisiWork needs a new metric or view:

```text
first identify the canonical source module
```

Do not add a VisiWork-specific duplicate table.

Example:

```text
"Active Outcomes by Department"

source:
Work + Departments

not:
visiwork_outcomes
```

---

# Realtime Boundaries

## 53. Realtime Ownership

Each feature owns realtime subscriptions for its own data.

Examples:

```text
Collaboration
-> messages

Activity
-> activity_events

Work
-> Outcome / Submission updates when required
```

Do not create one application-wide realtime manager that understands every feature.

Shared Supabase subscription primitives may live in infrastructure.

---

# Cache Boundaries

## 54. TanStack Query Keys

Query keys should be feature-owned.

Examples:

```text
projects.list(...)
projects.detail(projectId)

work.projectOutcomes(projectId)
work.outcome(outcomeId)

schedule.person(personId)

collaboration.messages(conversationId)
```

Avoid generic global keys such as:

```text
["data"]
["items"]
["records"]
```

---

## 55. Cache Invalidation

The owning module defines invalidation rules.

Example:

```text
Work.submitOutput
```

may invalidate:

```text
work.outcome(outcomeId)
work.projectOutcomes(projectId)
```

It should not randomly invalidate every application query.

---

# Permission Boundaries

## 56. Permission Ownership

Permission checks should remain close to the domain that owns the action.

Examples:

```text
canManageProject
-> Projects

canJoinOutcome
-> Work

canEditOwnSchedule
-> Schedule

canAccessConversation
-> Collaboration
```

Shared low-level permission primitives may live in `lib/permissions`.

---

## 57. UI Permission Rule

Components may use permission helpers to decide whether to show controls.

Example:

```text
if canReviewOutcome(...)
show Review button
```

The underlying mutation must still enforce authorization.

UI checks are convenience, not security.

---

# Error Boundaries

## 58. Domain Errors

Modules should expose meaningful domain errors rather than leaking raw database errors.

Examples:

```text
PROJECT_NOT_FOUND
NOT_PROJECT_LEAD
OUTCOME_BLOCKED
NOT_OUTCOME_PARTICIPANT
SUBMISSION_ALREADY_REVIEWED
DEPENDENCY_CYCLE
```

The UI can map these errors to user-facing messages.

Avoid spreading raw Postgres error handling throughout components.

---

# Domain Types

## 59. Type Ownership

Each module owns its domain-facing TypeScript types.

Examples:

```text
Project
ProjectMembership
ProjectStage

Outcome
Task
Submission
Review
```

Generated Supabase database types are infrastructure types.

Do not make raw generated row shapes the only public domain interface.

Domain types may be derived from them where useful.

---

# What Not to Create

## 60. No Generic Repository Layer

Do not create:

```text
BaseRepository
ProjectRepository
TaskRepository
GenericRepository<T>
```

solely to wrap Supabase.

Direct, feature-owned query modules are simpler.

---

## 61. No Giant Services Folder

Avoid:

```text
src/services/
```

containing unrelated business logic.

Business operations belong in their owning feature.

---

## 62. No Global Store by Default

Do not introduce Redux or Zustand for server state.

Use:

```text
TanStack Query
-> server state

TanStack Router
-> URL and navigation state

React state
-> local interaction state
```

---

## 63. No Event Bus

Do not introduce an application event bus in v1.

Activity and Audit are persisted business history, not an in-process event architecture.

Direct module calls are easier to trace.

---

# Initial Build Order

## 64. Recommended Module Implementation Sequence

Build modules in dependency order.

### Phase 1

```text
Auth
People
Departments
```

### Phase 2

```text
Projects
```

### Phase 3

```text
Work
```

### Phase 4

```text
Schedule
```

### Phase 5

```text
Collaboration
```

### Phase 6

```text
Activity
Audit
```

Activity may receive minimal infrastructure earlier if Projects and Work need to emit events.

### Phase 7

```text
Reporting
VisiWork composition
```

Do not begin with Reporting.

Build it after canonical operational data exists.

---

# Testing Boundaries

## 65. Unit and Domain Tests

Each module should test its own behavior.

Examples:

### Projects

```text
Project Lead transfer
Project lifecycle permissions
Membership rules
```

### Work

```text
Participant rules
Task assignment
Submission versioning
Review eligibility
Dependency cycle detection
```

### Schedule

```text
Own-record permissions
Open session rules
Time interval validation
```

---

## 66. Integration Tests

Integration tests should cover cross-module workflows.

Examples:

```text
Create Project with Lead
Add Member
Create Outcome
Join Outcome
Create Task
Submit Output
Review Output
Accept Outcome
Complete Project
```

These verify seams between modules without collapsing their ownership.

---

## 67. End-to-End Tests

Critical user workflows should be covered with Playwright.

Priority scenarios:

```text
Login
Create Project
Add Project Member
Create Stage
Create Outcome
Join Outcome
Create execution work
Submit Output
Request Revision
Submit revised Output
Accept Outcome
Dependency blocking
Dependency override
Project completion
Schedule configuration
Time In / Time Out
Project Chat
```

---

# Canonical Ownership Matrix

## 68. Entity Ownership

| Entity | Owning Module |
| --- | --- |
| Supabase Auth session | Auth |
| Profile | People |
| Department | Departments |
| Project | Projects |
| Project Membership | Projects |
| Project Department | Projects |
| Stage | Projects |
| Outcome | Work |
| Outcome Participant | Work |
| Acceptance Criterion | Work |
| Feature | Work |
| Task | Work |
| Output Submission | Work |
| Submission Artifact | Work |
| Review | Work |
| Criterion Verification | Work |
| Outcome Dependency | Work |
| Dependency Override | Work |
| Availability Window | Schedule |
| Planned Work Block | Schedule |
| Actual Work Session | Schedule |
| Conversation | Collaboration |
| Message | Collaboration |
| Activity Event | Activity |
| Audit Event | Audit |
| Reporting read model | Reporting |

This table is the canonical module ownership map.

---

# Allowed Cross-Module References

## 69. Stable IDs

Modules may reference other domains through stable identifiers.

Examples:

```text
person_id
project_id
department_id
stage_id
outcome_id
```

Referencing another module's ID does not transfer ownership.

Example:

```text
Work stores stage_id
```

but Stage remains owned by Projects.

---

## 70. Avoid Duplicate Models

Do not create:

```text
WorkProject
SchedulePerson
CollaborationProject
ReportingOutcome
```

as duplicate domain entities.

Use canonical IDs and read models.

---

# Deferred Module Decisions

## 71. Do Not Introduce Yet

The following modules are not approved for v1:

```text
notifications
billing
client portal
integrations
sprints
epics
capacity planning
workflow engine
automation engine
search
knowledge base
```

They may become valid modules later if real requirements emerge.

---

## 72. Notifications

Notifications are intentionally deferred.

Activity and Realtime should be evaluated first.

If notifications become necessary, they should be designed as a distinct delivery concern rather than mixed into Activity.

---

# Architectural Rules

## 73. Module Rule Summary

1. Modules follow business ownership.
2. Routes compose modules.
3. Routes do not own business logic.
4. Modules expose small public interfaces.
5. Avoid deep imports across modules.
6. The owning module owns mutations.
7. The owning module owns domain queries.
8. Cross-module references use stable IDs and public interfaces.
9. Reporting may read broadly but owns no transactional truth.
10. Schedule remains independent from Projects and Work.
11. Departments do not control Project permissions.
12. Work depends on Projects for Project context.
13. Projects should not depend deeply on Work internals.
14. Auth remains infrastructure-level and dependency-light.
15. UI permission checks do not replace trusted authorization.
16. Supabase is infrastructure, not the domain model.
17. Generated database types are not the entire domain API.
18. Avoid speculative layers.
19. Avoid generic repositories.
20. Avoid a global event bus.
21. Avoid a giant services folder.
22. Preserve canonical ownership.

---

# Final Architecture View

## 74. Application Architecture

```text
                        Routes
                          |
                          v
                 Page Composition Layer
                          |
       +------------------+------------------+
       |                  |                  |
       v                  v                  v
    Projects             Work             Schedule
       |                  |                  |
       +------------------+------------------+
                          |
       +------------------+------------------+
       |                  |                  |
       v                  v                  v
     People          Collaboration        Activity
       |
       v
  Departments

                    Reporting
                       ^
                       |
            reads across domains

                       Audit
                        ^
                        |
            sensitive governance events

                       Auth
                        ^
                        |
                identity/session
```

---

## 75. Next Step

The technology stack, domain model, permissions, entity relationships, database schema, and module boundaries are now defined.

The next architecture artifact should define Application Flows.

That document should describe the exact end-to-end mutation and state flows for major user actions, including:

```text
Create Project
Add Project Member
Create Stage
Create Outcome
Join Outcome
Create Feature
Create Task
Submit Output
Request Revision
Accept Output
Create Dependency
Override Dependency
Complete Project
Configure Schedule
Time In
Time Out
Send Project Message
```

Each flow should define:

```text
actor
preconditions
permission check
validation
writes
state transitions
activity
audit when required
cache invalidation
realtime update
failure cases
```

After those flows are approved, implementation can begin in vertical slices.

---

## Summary

Dx uses business-focused feature modules.

Projects owns Project governance.

Work owns Outcome execution.

People owns Person identity.

Departments owns organizational structure.

Schedule owns availability and work sessions.

Collaboration owns Conversations and Messages.

Activity owns user-visible operational history.

Audit owns sensitive accountability history.

Reporting reads across domains without becoming a second source of truth.

Routes compose these modules into product experiences such as Project Workspace and VisiWork.

The codebase should remain one modular application with explicit seams, small public interfaces, and no unnecessary architectural layers.
