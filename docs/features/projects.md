# Projects workspace

## Outcome

- User and business problem: provide a structured workspace for viewing project stages, expected outcomes, ownership, dependencies, outputs, and lead review in one board.
- Success criteria: an authenticated user can understand project progress, inspect an outcome, compare its output with the expected outcome, and use the migrated V5 interaction patterns without losing the starter application's shell/auth conventions.
- Included behavior: grouped project portfolio and search, project board UI, local create/edit project state, local stage/outcome creation, outcome inspector, local accept action, responsive horizontal board, and the approved Liquid Glass visual hierarchy.
- Excluded behavior: database persistence, real artifact/file opening, notifications, department/calendar/review modules, production authorization rules for project mutations, and audit events. These require product decisions before implementation.

## Workflow

1. The user opens `/projects` from the authenticated sidebar and sees projects grouped by state.
2. The user searches the portfolio or opens a project workspace.
3. The project header communicates lead, assistant lead, state, and accepted-outcome count.
4. The board shows stages horizontally; each stage contains outcomes.
5. Selecting an outcome opens the right-hand inspector without replacing the board context.
6. `Compare with outcome` exposes a lead-review section.
7. `Accept outcome` updates the local demo state and closes the comparison section.
8. `+ Stage`, `+ Outcome`, project settings, and new-project forms update local browser state only in this migration.

Failure/correction behavior in this migration is limited to required field checks in local forms. Persistence, concurrent edits, duplicate prevention, irreversible actions, and rollback behavior are intentionally unresolved because the source business context does not yet define them.

## Data

This migration does not introduce database schema or Supabase changes.

| Field or relationship | Type and constraints | Validation/default | Ownership |
| --- | --- | --- | --- |
| Project | In-memory demo object | Name required in UI | Unresolved |
| Stage | In-memory demo object | Generated local ID | Unresolved |
| Outcome | In-memory demo object | Title required in UI | Unresolved |
| Outcome state | Accepted / For review / In progress / Blocked / Planned | Planned by default | Unresolved |
| Department/member | Display strings | Local prototype values | Unresolved |
| Output/dependency | Optional display strings | None | Unresolved |

Deletion, retention, tenancy, concurrency, and uniqueness are not specified yet. Do not infer production rules from this UI demo.

## Permissions and audit

The route inherits the authenticated dashboard shell, but production project permissions are not defined by `docs/business-context.md` yet.

| Operation | Allowed roles | Scope | Audit event |
| --- | --- | --- | --- |
| Read demo board | Authenticated starter users | Current app | None |
| Local prototype create/edit/accept | Authenticated starter users | Browser state only | None |
| Production create/update/approve | Unresolved | Unresolved | Must be defined before persistence |

Before connecting these controls to Server Actions, define permissions in the feature specification and enforce them server-side plus RLS as required by `AGENTS.md`.

## Acceptance and verification

- Given an authenticated user, when `/projects` loads, then the project board renders inside the existing authenticated application shell.
- Given the project portfolio, then search filters cards and opening a card enters its workspace.
- Given a normal content card or stage, then it uses a solid warm surface rather than Liquid Glass.
- Given navigation, compact floating controls, or the inspector, then the approved Liquid Glass shared component may be used.
- Given an outcome card is selected, then a right-hand inspector opens and the board remains visible underneath.
- Given `Compare with outcome` is selected, then lead review actions appear.
- Given `Accept outcome` is selected, then the local outcome state becomes Accepted.
- No database migrations are required for this migration.
- Production project persistence must receive a follow-up specification covering authorization, tenancy, validation, RLS, audit, concurrency, and recovery.
