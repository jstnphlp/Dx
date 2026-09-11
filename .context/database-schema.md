# Dx Database Schema Plan

## Purpose

This document defines the proposed PostgreSQL schema plan for Dx.

It is derived from the approved:

- Tech Stack
- Domain Architecture
- Permissions Model
- Entity Relationships

This document translates the conceptual model into concrete database structures while preserving the approved business rules.

It is still a schema plan rather than a migration file.

Implementation should use Supabase migrations and generated database types.

Do not manually edit generated database types.

---

## 1. Database Principles

The database is the canonical source of truth for persistent Dx business data.

The schema should prioritize:

- explicit relationships;
- strong foreign keys;
- clear ownership;
- historical integrity;
- append-only audit records;
- contextual authorization;
- simple query paths;
- predictable deletion behavior;
- minimal duplication.

Use relational modeling by default.

Use JSONB only where the structure is intentionally flexible or event-oriented.

---

## 2. Naming Conventions

Use PostgreSQL `snake_case`.

Table names should be plural nouns.

Examples:

```text
profiles
departments
projects
project_memberships
stages
outcomes
output_submissions
```

Primary keys should use:

```text
id uuid primary key
```

unless a supporting table clearly benefits from a composite key.

Foreign keys should follow:

```text
person_id
project_id
outcome_id
```

Timestamp columns should use:

```text
timestamptz
```

and standard timestamp names:

```text
created_at
updated_at
archived_at
submitted_at
reviewed_at
```

---

## 3. UUID Strategy

Use UUID primary keys for domain entities.

Recommended default:

```sql
id uuid primary key default gen_random_uuid()
```

Supabase Auth user IDs are already UUIDs.

The application profile record should use the Auth user ID directly where practical.

---

## 4. Shared Timestamp Pattern

Mutable domain entities should normally include:

```text
created_at
updated_at
```

Historical or append-only entities may only need:

```text
created_at
```

Do not automatically add `updated_at` to immutable history tables.

---

## 5. Profiles

### Table

```text
profiles
```

### Purpose

Represents a Person in Dx and extends the Supabase Auth user.

### Proposed Columns

```text
id uuid primary key
department_id uuid nullable
display_name text not null
email text not null
avatar_path text nullable
company_role company_role not null default 'member'
status person_status not null default 'active'
created_at timestamptz not null
updated_at timestamptz not null
```

### Foreign Keys

```text
profiles.id
-> auth.users.id

profiles.department_id
-> departments.id
```

### Notes

The profile ID should match the Supabase Auth user ID.

A Person may have zero or one primary Department.

Email may also exist in Auth, but keeping a profile-level copy can be useful for display and querying if synchronization is handled deliberately.

Avoid treating profile email as the authentication source of truth.

---

## 6. Departments

### Table

```text
departments
```

### Proposed Columns

```text
id uuid primary key
name text not null
description text nullable
status department_status not null default 'active'
created_at timestamptz not null
updated_at timestamptz not null
archived_at timestamptz nullable
```

### Constraints

```text
name should be unique among active Departments
```

A partial unique index is preferable if archived Departments may reuse names later.

---

## 7. Projects

### Table

```text
projects
```

### Proposed Columns

```text
id uuid primary key
name text not null
description text nullable
status project_status not null default 'planning'
created_by uuid not null
start_date date nullable
target_date date nullable
created_at timestamptz not null
updated_at timestamptz not null
archived_at timestamptz nullable
completed_at timestamptz nullable
```

### Foreign Keys

```text
created_by
-> profiles.id
```

### Important Rule

Do not store a separate `lead_id` column.

The Project Lead is defined through `project_memberships`.

This prevents duplicate sources of truth.

---

## 8. Project Memberships

### Table

```text
project_memberships
```

### Purpose

Connects People to Projects and stores contextual Project authority.

### Proposed Columns

```text
id uuid primary key
project_id uuid not null
person_id uuid not null
role project_role not null
status membership_status not null default 'active'
joined_at timestamptz not null
left_at timestamptz nullable
created_by uuid nullable
```

### Foreign Keys

```text
project_id
-> projects.id

person_id
-> profiles.id

created_by
-> profiles.id
```

### Constraints

A Person cannot have duplicate active membership in the same Project.

Recommended uniqueness:

```text
unique active membership on
(project_id, person_id)
```

### Project Lead Constraint

Every active Project must have exactly one active membership with:

```text
role = 'lead'
```

PostgreSQL can enforce "at most one active lead" with a partial unique index.

The "at least one lead" rule is harder to enforce with a normal constraint and should be protected transactionally during Project creation and leadership transfer.

---

## 9. Project Departments

### Table

```text
project_departments
```

### Proposed Columns

```text
project_id uuid not null
department_id uuid not null
created_at timestamptz not null
```

### Primary Key

A composite key is sufficient:

```text
primary key (project_id, department_id)
```

### Foreign Keys

```text
project_id
-> projects.id

department_id
-> departments.id
```

This is a pure relationship table.

A generated UUID is unnecessary unless future metadata requires it.

---

## 10. Stages

### Table

```text
stages
```

### Proposed Columns

```text
id uuid primary key
project_id uuid not null
name text not null
description text nullable
position integer not null
created_at timestamptz not null
updated_at timestamptz not null
```

### Foreign Key

```text
project_id
-> projects.id
```

### Constraints

```text
position >= 0
```

Recommended unique constraint:

```text
(project_id, position)
```

Stage names do not need to be globally unique.

---

## 11. Outcomes

### Table

```text
outcomes
```

### Proposed Columns

```text
id uuid primary key
stage_id uuid not null
responsible_department_id uuid nullable
title text not null
description text nullable
expected_result text nullable
state outcome_state not null default 'planned'
self_join_enabled boolean not null default true
created_by uuid not null
created_at timestamptz not null
updated_at timestamptz not null
accepted_at timestamptz nullable
cancelled_at timestamptz nullable
```

### Foreign Keys

```text
stage_id
-> stages.id

responsible_department_id
-> departments.id

created_by
-> profiles.id
```

### Project Ownership

Do not duplicate `project_id` unless profiling later proves the join path too expensive.

Canonical relationship:

```text
outcome
-> stage
-> project
```

If a denormalized `project_id` is later introduced, it must be guarded so it cannot disagree with the Stage.

---

## 12. Outcome Participants

### Table

```text
outcome_participants
```

### Proposed Columns

```text
id uuid primary key
outcome_id uuid not null
person_id uuid not null
source participation_source not null
added_by uuid nullable
joined_at timestamptz not null
left_at timestamptz nullable
status participation_status not null default 'active'
```

### Foreign Keys

```text
outcome_id
-> outcomes.id

person_id
-> profiles.id

added_by
-> profiles.id
```

### Constraints

A Person cannot have duplicate active participation in the same Outcome.

Important cross-table invariant:

```text
The Person must already be an active Project Member
of the Outcome's Project.
```

This cannot be expressed cleanly with a simple foreign key because Project ownership is reached through Stage.

Enforce through trusted mutation logic and transactionally validated database functions where appropriate.

---

## 13. Acceptance Criteria

### Table

```text
acceptance_criteria
```

### Proposed Columns

```text
id uuid primary key
outcome_id uuid not null
description text not null
position integer not null
created_at timestamptz not null
updated_at timestamptz not null
```

### Foreign Key

```text
outcome_id
-> outcomes.id
```

### Constraints

```text
position >= 0
```

Recommended uniqueness:

```text
(outcome_id, position)
```

---

## 14. Features

### Table

```text
features
```

### Proposed Columns

```text
id uuid primary key
outcome_id uuid not null
title text not null
description text nullable
position integer not null
created_by uuid not null
created_at timestamptz not null
updated_at timestamptz not null
archived_at timestamptz nullable
```

### Foreign Keys

```text
outcome_id
-> outcomes.id

created_by
-> profiles.id
```

### Constraints

```text
position >= 0
```

A Feature belongs to exactly one Outcome.

---

## 15. Tasks

### Table

```text
tasks
```

### Proposed Columns

```text
id uuid primary key
outcome_id uuid not null
feature_id uuid nullable
assignee_id uuid nullable
title text not null
description text nullable
state task_state not null default 'todo'
position integer nullable
created_by uuid not null
created_at timestamptz not null
updated_at timestamptz not null
completed_at timestamptz nullable
archived_at timestamptz nullable
```

### Foreign Keys

```text
outcome_id
-> outcomes.id

feature_id
-> features.id

assignee_id
-> profiles.id

created_by
-> profiles.id
```

### Important Invariants

If `feature_id` is present:

```text
feature.outcome_id = task.outcome_id
```

If `assignee_id` is present:

```text
assignee must be an active Outcome Participant
```

These are cross-table invariants and require trusted mutation validation.

---

## 16. Output Submissions

### Table

```text
output_submissions
```

### Proposed Columns

```text
id uuid primary key
outcome_id uuid not null
submitted_by uuid not null
version integer not null
title text not null
notes text nullable
state submission_state not null default 'draft'
created_at timestamptz not null
updated_at timestamptz not null
submitted_at timestamptz nullable
```

### Foreign Keys

```text
outcome_id
-> outcomes.id

submitted_by
-> profiles.id
```

### Constraints

```text
version >= 1
```

Unique:

```text
(outcome_id, version)
```

### Author Rule

The submitting Person must be an active Outcome Participant.

### Immutability

Once a Submission enters:

```text
for_review
needs_revision
accepted
```

the submitted version should not be destructively rewritten.

A new revision should create a new version.

Drafts may remain editable.

---

## 17. Submission Artifacts

### Table

```text
submission_artifacts
```

### Proposed Columns

```text
id uuid primary key
submission_id uuid not null
artifact_type artifact_type not null
label text nullable
storage_path text nullable
external_url text nullable
metadata jsonb not null default '{}'
created_at timestamptz not null
```

### Foreign Key

```text
submission_id
-> output_submissions.id
```

### Check Constraint

Exactly one primary artifact locator should normally exist.

For example:

```text
artifact_type = 'file'
requires storage_path

artifact_type = 'link'
requires external_url
```

Avoid storing uploaded file bytes in PostgreSQL.

Use Supabase Storage.

---

## 18. Reviews

### Table

```text
reviews
```

### Proposed Columns

```text
id uuid primary key
submission_id uuid not null
reviewer_id uuid not null
decision review_decision not null
feedback text nullable
created_at timestamptz not null
```

### Foreign Keys

```text
submission_id
-> output_submissions.id

reviewer_id
-> profiles.id
```

### Constraints

One final Review per Submission:

```text
unique (submission_id)
```

### Permission Rule

In v1, the reviewer must be the active Project Lead for the related Project.

This is best validated through trusted mutation logic plus RLS authorization.

---

## 19. Criterion Verifications

### Table

```text
criterion_verifications
```

### Proposed Columns

```text
review_id uuid not null
criterion_id uuid not null
satisfied boolean not null
note text nullable
created_at timestamptz not null
```

### Primary Key

```text
primary key (review_id, criterion_id)
```

### Foreign Keys

```text
review_id
-> reviews.id

criterion_id
-> acceptance_criteria.id
```

### Important Invariant

The Criterion must belong to the same Outcome as the reviewed Submission.

Enforce during review creation.

---

## 20. Outcome Dependencies

### Table

```text
outcome_dependencies
```

### Proposed Columns

```text
id uuid primary key
prerequisite_outcome_id uuid not null
dependent_outcome_id uuid not null
created_by uuid not null
created_at timestamptz not null
```

### Foreign Keys

```text
prerequisite_outcome_id
-> outcomes.id

dependent_outcome_id
-> outcomes.id

created_by
-> profiles.id
```

### Constraints

The two Outcome IDs must differ.

```text
prerequisite_outcome_id <> dependent_outcome_id
```

Unique:

```text
(prerequisite_outcome_id, dependent_outcome_id)
```

### Cross-Table Invariants

Both Outcomes must belong to the same Project.

Dependency cycles are prohibited.

Cycle detection requires transactional application or database function logic.

---

## 21. Dependency Overrides

### Table

```text
dependency_overrides
```

### Proposed Columns

```text
id uuid primary key
dependency_id uuid not null
overridden_by uuid not null
reason text not null
created_at timestamptz not null
revoked_at timestamptz nullable
revoked_by uuid nullable
```

### Foreign Keys

```text
dependency_id
-> outcome_dependencies.id

overridden_by
-> profiles.id

revoked_by
-> profiles.id
```

### Constraint

Only one active Override should exist per Dependency.

Use a partial unique index on:

```text
dependency_id
where revoked_at is null
```

The original Dependency remains intact.

---

## 22. Conversations

### Table

```text
conversations
```

### Proposed Columns

```text
id uuid primary key
scope_type conversation_scope not null
department_id uuid nullable
project_id uuid nullable
created_at timestamptz not null
```

### Foreign Keys

```text
department_id
-> departments.id

project_id
-> projects.id
```

### Scope Rules

For:

```text
company
```

both foreign keys must be null.

For:

```text
department
```

`department_id` must be present and `project_id` null.

For:

```text
project
```

`project_id` must be present and `department_id` null.

Use CHECK constraints.

### Uniqueness

At most one canonical conversation per scope in v1.

Use partial unique indexes.

---

## 23. Messages

### Table

```text
messages
```

### Proposed Columns

```text
id uuid primary key
conversation_id uuid not null
author_id uuid not null
body text not null
created_at timestamptz not null
edited_at timestamptz nullable
deleted_at timestamptz nullable
```

### Foreign Keys

```text
conversation_id
-> conversations.id

author_id
-> profiles.id
```

### Notes

Prefer soft deletion for messages if deletion is supported.

This preserves conversation continuity and moderation history.

---

## 24. Availability Windows

### Table

```text
availability_windows
```

### Proposed Columns

```text
id uuid primary key
person_id uuid not null
day_of_week smallint not null
start_time time not null
end_time time not null
timezone text not null
created_at timestamptz not null
updated_at timestamptz not null
```

### Foreign Key

```text
person_id
-> profiles.id
```

### Constraints

```text
day_of_week between 0 and 6
start_time < end_time
```

The product should define the canonical day numbering convention.

---

## 25. Planned Work Blocks

### Table

```text
planned_work_blocks
```

### Proposed Columns

```text
id uuid primary key
person_id uuid not null
starts_at timestamptz not null
ends_at timestamptz not null
note text nullable
created_at timestamptz not null
updated_at timestamptz not null
```

### Foreign Key

```text
person_id
-> profiles.id
```

### Constraint

```text
starts_at < ends_at
```

Project references are intentionally excluded in v1.

---

## 26. Actual Work Sessions

### Table

```text
actual_work_sessions
```

### Proposed Columns

```text
id uuid primary key
person_id uuid not null
started_at timestamptz not null
ended_at timestamptz nullable
created_at timestamptz not null
corrected_at timestamptz nullable
```

### Foreign Key

```text
person_id
-> profiles.id
```

### Constraints

If `ended_at` exists:

```text
started_at < ended_at
```

A Person should normally have at most one open Work Session at a time.

Use a partial unique index:

```text
person_id
where ended_at is null
```

Historical corrections should be handled deliberately and audited rather than casually overwritten.

---

## 27. Activity Events

### Table

```text
activity_events
```

### Proposed Columns

```text
id uuid primary key
actor_id uuid nullable
action text not null
project_id uuid nullable
entity_type text not null
entity_id uuid nullable
metadata jsonb not null default '{}'
created_at timestamptz not null
```

### Foreign Keys

```text
actor_id
-> profiles.id

project_id
-> projects.id
```

### Notes

Activity is append-only.

`entity_type` and `entity_id` are intentionally generic because Activity spans multiple domains.

Do not create hard foreign keys from `entity_id` to polymorphic domain tables.

Historical Activity should remain when the referenced object is archived.

---

## 28. Audit Events

### Table

```text
audit_events
```

### Proposed Columns

```text
id uuid primary key
actor_id uuid nullable
action text not null
resource_type text not null
resource_id uuid nullable
before_state jsonb nullable
after_state jsonb nullable
metadata jsonb not null default '{}'
created_at timestamptz not null
```

### Foreign Key

```text
actor_id
-> profiles.id
```

### Notes

Audit is append-only.

No normal application role should be able to update or delete Audit rows.

---

## 29. Proposed PostgreSQL Enums

Use PostgreSQL enums only for small, stable state sets.

Suggested enums:

```text
company_role
person_status
department_status
project_status
project_role
membership_status
outcome_state
participation_source
participation_status
task_state
submission_state
review_decision
artifact_type
conversation_scope
```

---

## 30. Proposed Enum Values

### company_role

```text
admin
member
```

### person_status

```text
active
inactive
```

### department_status

```text
active
archived
```

### project_status

```text
planning
active
paused
completed
archived
```

### project_role

```text
lead
member
```

### membership_status

```text
active
inactive
```

### outcome_state

```text
planned
in_progress
blocked
for_review
needs_revision
accepted
cancelled
```

### participation_source

```text
assigned
self_joined
```

### participation_status

```text
active
inactive
```

### task_state

```text
todo
in_progress
done
```

### submission_state

```text
draft
for_review
needs_revision
accepted
```

### review_decision

```text
needs_revision
accepted
```

### artifact_type

```text
file
link
```

### conversation_scope

```text
company
department
project
```

Do not add enum values for speculative future states.

---

## 31. Index Strategy

Add indexes around actual query and permission paths.

Recommended baseline indexes include:

```text
profiles(department_id)

project_memberships(project_id)
project_memberships(person_id)

project_departments(department_id)

stages(project_id, position)

outcomes(stage_id)
outcomes(responsible_department_id)
outcomes(state)

outcome_participants(outcome_id)
outcome_participants(person_id)

acceptance_criteria(outcome_id, position)

features(outcome_id, position)

tasks(outcome_id)
tasks(feature_id)
tasks(assignee_id)
tasks(state)

output_submissions(outcome_id, version desc)
output_submissions(submitted_by)

submission_artifacts(submission_id)

reviews(submission_id)
reviews(reviewer_id)

criterion_verifications(criterion_id)

outcome_dependencies(prerequisite_outcome_id)
outcome_dependencies(dependent_outcome_id)

messages(conversation_id, created_at)

availability_windows(person_id)
planned_work_blocks(person_id, starts_at)
actual_work_sessions(person_id, started_at)

activity_events(project_id, created_at desc)
activity_events(actor_id, created_at desc)

audit_events(actor_id, created_at desc)
audit_events(resource_type, resource_id)
```

Do not add indexes mechanically to every column.

Validate index usefulness against real queries as the application grows.

---

## 32. Deletion Strategy

The schema should distinguish disposable execution data from historical evidence.

### Prefer Archive or Status Transition

Use archive/status transitions for:

```text
Departments
Projects
Outcomes
Features
Tasks when they already matter historically
```

### Preserve Historical Records

Avoid destructive deletion of:

```text
Submitted Output Submissions
Reviews
Criterion Verifications
Dependency Overrides
Activity Events
Audit Events
Historical Work Sessions
```

### Relationship Cleanup

Pure relationship rows may be removed or marked inactive depending on whether history matters.

Examples:

```text
project_departments
```

may be safely removed if no historical meaning is required.

For:

```text
project_memberships
outcome_participants
```

prefer status plus timestamps because historical membership is operationally meaningful.

---

## 33. Foreign Key Deletion Behavior

Avoid broad `ON DELETE CASCADE` across historical structures.

Recommended general approach:

### Project -> Stage

Do not normally hard-delete Projects.

If hard deletion is supported only for never-used drafts, controlled cascade may be acceptable.

### Stage -> Outcome

Avoid destructive cascade for active or historical Projects.

### Outcome -> Submission

Never automatically erase submitted evidence during normal application workflows.

### Submission -> Review

If a draft Submission is physically deleted before formal submission, controlled cascade is acceptable.

Once formally submitted, prefer preservation.

### User/Profile References

Avoid deleting Profile rows for former employees.

Use:

```text
status = inactive
```

to preserve authorship and history.

---

## 34. Project Lead Invariant

The database should enforce:

```text
At most one active Project Lead per Project
```

with a partial unique index conceptually equivalent to:

```sql
unique(project_id)
where role = 'lead'
  and status = 'active'
```

Project creation should insert:

```text
Project
+
Lead Membership
```

inside one transaction.

Project Lead transfer should be atomic.

The system must never pass through a durable state with two active Leads or no active Lead.

---

## 35. Outcome Participant Membership Invariant

Before creating active Outcome Participation:

```text
person must be an active member
of the related Project
```

Because this spans:

```text
outcome
-> stage
-> project
-> project_membership
```

use a trusted database function or server-side transactional mutation.

Do not rely only on the UI.

---

## 36. Task Feature Invariant

If a Task references a Feature:

```text
task.feature_id
```

the Feature's Outcome must equal:

```text
task.outcome_id
```

This should be validated on Task create/update.

---

## 37. Task Assignee Invariant

If a Task has an assignee:

```text
assignee must be an active Outcome Participant
```

This should be enforced by trusted mutation logic.

---

## 38. Submission Author Invariant

Before creating or submitting an Output Submission:

```text
submitted_by
```

must be an active Participant in the related Outcome.

Draft ownership behavior should follow the same rule in v1.

---

## 39. Review Invariants

Before creating a Review:

1. The reviewer must be the active Project Lead.
2. The Submission must be `for_review`.
3. The Review must reference the current immutable Submission version.
4. Criterion Verifications must refer only to Criteria from the same Outcome.
5. An Accepted Review must satisfy the domain's Acceptance Criteria rules.

These should be handled transactionally.

---

## 40. Dependency Invariants

Before creating an Outcome Dependency:

1. prerequisite and dependent Outcomes must differ;
2. both Outcomes must belong to the same Project;
3. the exact relationship must not already exist;
4. the new edge must not create a cycle.

Cycle detection should happen inside the same transaction that creates the Dependency.

---

## 41. Outcome State Transitions

The database schema stores Outcome state.

The application/domain layer controls valid transitions.

Suggested state transition graph:

```text
planned
  |
  v
in_progress
  |
  +------> blocked
  |           |
  |           v
  |      in_progress
  |
  v
for_review
  |
  +------> needs_revision
  |             |
  |             v
  |        in_progress
  |
  v
accepted
```

`cancelled` may be reached through authorized governance actions from non-terminal active states.

Do not allow arbitrary state updates from the browser.

Use trusted mutation functions for important workflow transitions.

---

## 42. Submission State Transitions

Suggested Submission lifecycle:

```text
draft
  |
  v
for_review
  |
  +------> needs_revision
  |
  v
accepted
```

A revised attempt normally creates:

```text
new Submission version
```

rather than transitioning the old Submission back into Draft.

---

## 43. RLS Strategy

Enable Row Level Security on all application tables exposed through the Supabase API.

RLS should answer:

```text
Can the authenticated user read or modify this row?
```

Business workflow eligibility should remain in trusted domain logic.

The RLS policy model should primarily use:

```text
auth.uid()
profile identity
company role
project membership
project lead relationship
outcome participation
self ownership
department membership
```

---

## 44. RLS Helper Functions

Avoid duplicating large relational subqueries across dozens of policies.

Create small, stable PostgreSQL helper functions when necessary.

Conceptual helpers:

```text
is_company_admin(user_id)

is_project_member(user_id, project_id)

is_project_lead(user_id, project_id)

is_outcome_participant(user_id, outcome_id)

can_view_conversation(user_id, conversation_id)
```

These functions should be:

- security reviewed;
- narrow;
- deterministic where practical;
- designed to avoid recursive RLS behavior.

Do not build a generic permission engine in SQL unless a real need appears.

---

## 45. Profiles RLS

Suggested behavior:

### Read

Authenticated Company Members may read the profile information necessary for collaboration.

### Update

Users may update permitted fields on their own Profile.

Company role and account status must not be self-editable.

### Administrative Updates

Company Admins may perform explicitly permitted account-management actions.

---

## 46. Departments RLS

Suggested behavior:

### Read

Active Company Members may view active Departments.

### Write

Only Company Admins may create, edit, archive, or restore Departments.

Department membership does not grant Department administration in v1.

---

## 47. Projects RLS

Suggested behavior:

### Read

Detailed private Project data should require:

```text
active Project Membership
OR
Company Admin administrative access
```

The final level of non-member Project visibility is intentionally conservative.

### Write

Project governance changes require:

```text
active Project Lead
```

Company Admin intervention should be restricted to explicit administrative actions.

---

## 48. Project Membership RLS

### Read

Project Members may read membership within their Project.

### Write

Project Lead may manage normal Project Membership.

Company Admin may perform administrative intervention.

Users cannot grant themselves Project Membership through direct row insertion.

---

## 49. Outcome RLS

### Read

Active Project Members may read Outcomes belonging to their Project.

### Governance Write

Only active Project Lead may modify Outcome definition, Acceptance Criteria, Department responsibility, or Dependencies.

### Execution Write

Outcome Participants may modify allowed execution structures such as Features, Tasks, Draft Submissions, and related records.

---

## 50. Schedule RLS

Schedule is self-owned by default.

### Own Records

A Person may read and modify their own:

```text
availability_windows
planned_work_blocks
actual_work_sessions
```

subject to historical restrictions.

### Team Visibility

Team scheduling views may require read policies or controlled views that expose only the operational fields needed for coordination.

Do not expose sensitive schedule metadata by default.

---

## 51. Conversation RLS

Conversation access depends on scope.

### Company

Active Company Member.

### Department

Active Person whose `department_id` matches the Conversation Department.

### Project

Active Project Member of the Conversation Project.

Message insert requires access to the parent Conversation.

---

## 52. Activity RLS

Activity visibility should match the related resource scope.

Project Activity should be visible only to users who may view the Project.

Department Activity should be visible only within the Department scope.

Company Activity should expose only events intended for company-wide visibility.

Avoid treating the generic Activity table as automatically readable by everyone.

---

## 53. Audit RLS

Audit should be highly restricted.

Suggested default:

```text
Company Admin read
No normal update
No normal delete
```

Audit writes should happen through trusted server-side or database operations.

---

## 54. Storage Model

Use Supabase Storage for uploaded artifacts.

Recommended bucket concept:

```text
project-artifacts
```

Keep the bucket private.

Store canonical ownership metadata in PostgreSQL through `submission_artifacts`.

Example storage path:

```text
projects/<project-id>/outcomes/<outcome-id>/submissions/<submission-id>/<file>
```

The path is an implementation convention, not an authorization mechanism.

Storage policies must still verify access.

---

## 55. Storage Authorization

Users should only access stored artifacts when they can access the related Submission and Project.

Avoid making files public and relying on unguessable URLs.

Signed URLs may be used for controlled temporary access.

---

## 56. Database Functions

Use PostgreSQL functions sparingly for transactional domain operations that benefit from database-level consistency.

Good candidates include:

```text
create_project_with_lead
transfer_project_lead
join_outcome
assign_outcome_participant
create_outcome_dependency
override_dependency
submit_output
review_submission
complete_project
```

These names are conceptual.

Do not move all business logic into stored procedures.

Use database functions where multiple dependent writes or invariants must succeed atomically.

---

## 57. Realtime

Do not enable Realtime for every table.

Good candidates may include:

```text
messages
activity_events
outcomes
output_submissions
```

Use Realtime selectively based on actual user experience requirements.

Persisted PostgreSQL data remains the source of truth.

---

## 58. Reporting Views

Reporting should begin with database Views rather than duplicated reporting tables.

Possible future Views:

```text
project_progress_view
stage_progress_view
blocked_outcomes_view
person_schedule_summary_view
project_member_activity_view
```

These should be introduced only when the corresponding report is needed.

Do not create speculative reporting Views during initial schema setup.

---

## 59. Project Progress Query

Project progress is derived from active Outcomes.

Conceptually:

```text
accepted active outcomes
/
total active outcomes
```

Cancelled Outcomes are excluded.

Because Outcomes reach Projects through Stages, the query joins:

```text
projects
-> stages
-> outcomes
```

Do not store a mutable `progress` percentage on `projects`.

Derived progress avoids stale duplicate state.

---

## 60. Stage Progress Query

Stage progress is also derived:

```text
accepted active outcomes
/
total active outcomes in stage
```

Do not store Stage progress as canonical mutable state.

---

## 61. Historical Identity

Do not physically delete former employees from `profiles`.

Use:

```text
status = 'inactive'
```

This preserves:

```text
submission authors
reviewers
activity actors
audit actors
message authors
historical schedule records
```

The application can hide inactive People from normal assignment interfaces.

---

## 62. Migration Strategy

Every schema change must be represented by a Supabase migration.

Recommended development flow:

```text
Create migration
        |
        v
Apply locally
        |
        v
Reset local database
        |
        v
Run database tests
        |
        v
Regenerate database types
        |
        v
Run application tests
```

Never edit production schema manually as the canonical workflow.

Never hand-edit generated TypeScript database types.

---

## 63. Suggested Migration Phases

Do not create the entire schema in one giant migration.

Recommended order:

### Phase 1 - Identity and Organization

```text
profiles
departments
```

### Phase 2 - Projects

```text
projects
project_memberships
project_departments
stages
```

### Phase 3 - Outcomes and Execution

```text
outcomes
outcome_participants
acceptance_criteria
features
tasks
```

### Phase 4 - Submission and Review

```text
output_submissions
submission_artifacts
reviews
criterion_verifications
```

### Phase 5 - Dependencies

```text
outcome_dependencies
dependency_overrides
```

### Phase 6 - Collaboration

```text
conversations
messages
```

### Phase 7 - Schedule

```text
availability_windows
planned_work_blocks
actual_work_sessions
```

### Phase 8 - History

```text
activity_events
audit_events
```

### Phase 9 - Policies and Functions

```text
RLS policies
permission helpers
transactional domain functions
storage policies
```

Each phase should remain independently testable.

---

## 64. Database Tests

Use database-level tests for invariants and policies.

Important tests include:

```text
A Project cannot have two active Leads

An Outcome Participant must be a Project Member

A Task Feature must belong to the same Outcome

A Task assignee must participate in the Outcome

Submission versions cannot duplicate within one Outcome

A non-participant cannot submit Output

A non-Lead cannot Review or Accept

Dependencies cannot connect Outcomes from different Projects

Dependency cycles are rejected

A user cannot edit another user's Schedule

A normal Member cannot read Audit events

A non-Project Member cannot read private Project rows
```

Also test allowed paths.

Authorization testing must prove both:

```text
allowed behavior works

and

forbidden behavior fails
```

---

## 65. Tables Summary

The proposed v1 schema contains:

```text
profiles
departments

projects
project_memberships
project_departments
stages

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

conversations
messages

availability_windows
planned_work_blocks
actual_work_sessions

activity_events
audit_events
```

No Reporting table is required initially.

---

## 66. Relationship Summary

```text
auth.users
    |
    v
profiles
    |
    +---- department
    |
    +---- project_memberships ---- projects
    |                                |
    |                                +---- project_departments ---- departments
    |                                |
    |                                +---- stages
    |                                      |
    |                                      v
    |                                   outcomes
    |                                      |
    |                       +--------------+--------------+
    |                       |              |              |
    |                       v              v              v
    |              outcome_participants features   output_submissions
    |                                      |              |
    |                                      v              +---- submission_artifacts
    |                                     tasks           |
    |                                                     v
    |                                                   reviews
    |                                                     |
    |                                                     v
    |                                           criterion_verifications
    |
    +---- availability_windows
    +---- planned_work_blocks
    +---- actual_work_sessions


outcomes
    |
    +---- acceptance_criteria
    |
    +---- outcome_dependencies ---- outcomes
                   |
                   v
          dependency_overrides


company / department / project
          |
          v
     conversations
          |
          v
       messages


cross-domain history
    |
    +---- activity_events
    +---- audit_events
```

---

## 67. Decisions Intentionally Deferred

The schema must not introduce these yet:

```text
Multi-company tenancy
Multi-department Person membership
Assistant Lead
Department Lead
Primary Outcome Owner
Delegated reviewers
Outcome Chat
Sprints
Epics
Story Points
Project-linked time sessions
Cross-Project Dependencies
Weighted Outcome progress
Separate analytics warehouse
Redis-backed job infrastructure
Generic ACL tables
```

Introduce them only when product requirements justify them.

---

## 68. Canonical Source of Truth Rules

The database must avoid duplicate truth.

Canonical ownership should be:

```text
Project Lead
-> project_memberships.role

Project membership
-> project_memberships

Department membership
-> profiles.department_id

Outcome project
-> outcomes.stage_id -> stages.project_id

Outcome participation
-> outcome_participants

Task Outcome
-> tasks.outcome_id

Submission version
-> output_submissions

Review decision
-> reviews

Dependency relationship
-> outcome_dependencies

Dependency override
-> dependency_overrides

Schedule ownership
-> person-specific schedule tables
```

Do not duplicate these values elsewhere merely for convenience.

---

## 69. Final Schema Philosophy

The v1 database should remain a straightforward relational model.

Do not introduce:

```text
generic entity tables
generic ACL engines
event sourcing
CQRS
polymorphic ownership for core domain entities
microservice-oriented identifiers
premature reporting warehouses
```

The important relationships should remain visible and enforceable.

Where a business invariant spans multiple tables, use trusted transactional mutations and database tests instead of weakening the domain model to fit a simpler constraint.

---

## 70. Next Architecture Step

After this schema plan is approved, the next artifact should define Feature Module Boundaries.

That document should map the domain and database into the React + Vite application without coupling UI routes directly to tables.

The module plan should define:

```text
auth
people
departments
projects
work
schedule
collaboration
activity
audit
reporting
```

and explicitly state:

```text
which module owns which entities

which module may call which other module

what each module exposes publicly

what remains private implementation detail
```

Only after those boundaries are stable should implementation begin.

---

## Summary

Dx will use a normalized PostgreSQL schema backed by Supabase.

Profiles extend Supabase Auth.

Departments define organizational grouping.

Project Membership defines contextual Project authority and is the source of truth for Project Lead.

Stages organize Outcomes.

Outcomes are the central unit of work.

Outcome Participation defines execution membership.

Features and Tasks organize execution.

Output Submissions are versioned and become immutable once formally submitted.

Reviews evaluate one Submission version against Acceptance Criteria.

Dependencies connect Outcomes within the same Project and cannot form cycles.

Schedule data remains Person-owned and independent from Project execution.

Collaboration uses scoped Conversations.

Activity and Audit are append-only history.

RLS protects row access.

Trusted transactional mutations preserve cross-table domain invariants.

The schema should remain simple, relational, explicit, and architecture-neutral beyond the approved Dx domain model.
