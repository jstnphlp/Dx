# Projects workspace

## Outcome

- User and business problem: provide a structured workspace for viewing project stages, expected outcomes, ownership, dependencies, outputs, and lead review in one board.
- Success criteria: an authenticated user can understand project progress, inspect an outcome, compare its output with the expected outcome, and use the migrated V5 interaction patterns without losing the starter application's shell/auth conventions.
- Included behavior: grouped project portfolio and search, one canonical project workspace, My Work/Whole Work scope, local project/stage/outcome creation, outcome feature/task planning, dependencies, membership, versioned output submission and review, project chat, announcements, activity filters, responsive horizontal board, and the approved Liquid Glass visual hierarchy.
- Excluded behavior: database persistence, real artifact/file opening, notifications, department/calendar/review modules, production authorization rules for project mutations, and audit events. These require product decisions before implementation.

## Workflow

1. The user opens `/projects` from the authenticated sidebar and sees projects grouped by state.
2. The user searches the portfolio or opens a project workspace.
3. The project header communicates lead, assistant lead, state, and accepted-outcome count.
4. The board shows stages horizontally; each stage contains outcomes.
5. Selecting an outcome opens its full workspace without losing the project context.
6. Members plan features/tasks, save drafts, and submit versioned outputs for review.
7. Reviewers verify every acceptance criterion before acceptance or provide feedback before requesting revision.
8. Project chat, pinned announcements, and activity history remain synchronized with the other operational routes.
9. All mutations persist only in validated, per-user browser state.

Failure/correction behavior in this migration is limited to required field checks in local forms. Persistence, concurrent edits, duplicate prevention, irreversible actions, and rollback behavior are intentionally unresolved because the source business context does not yet define them.

## Data

This migration does not introduce database schema or Supabase changes.

| Field or relationship | Type and constraints                                    | Validation/default     | Ownership  |
| --------------------- | ------------------------------------------------------- | ---------------------- | ---------- |
| Project               | In-memory demo object                                   | Name required in UI    | Unresolved |
| Stage                 | In-memory demo object                                   | Generated local ID     | Unresolved |
| Outcome               | In-memory demo object                                   | Title required in UI   | Unresolved |
| Outcome state         | Accepted / For review / In progress / Blocked / Planned | Planned by default     | Unresolved |
| Department/member     | Display strings                                         | Local prototype values | Unresolved |
| Output/dependency     | Optional display strings                                | None                   | Unresolved |

Deletion, retention, tenancy, concurrency, and uniqueness are not specified yet. Do not infer production rules from this UI demo.

## Permissions and audit

The route inherits the authenticated dashboard shell, but production project permissions are not defined by `docs/business-context.md` yet.

| Operation                          | Allowed roles                   | Scope                       | Audit event                        |
| ---------------------------------- | ------------------------------- | --------------------------- | ---------------------------------- |
| Read demo board                    | Authenticated starter users     | Current app                 | None                               |
| Local prototype create/edit/accept | All authenticated starter users | Per-user browser state only | Local activity history only        |
| Production create/update/approve   | Unresolved                      | Unresolved                  | Must be defined before persistence |

Before connecting these controls to Server Actions, define permissions in the feature specification and enforce them server-side plus RLS as required by `AGENTS.md`.

## Acceptance and verification

- Given an authenticated user, when `/projects` loads, then the project board renders inside the existing authenticated application shell.
- Given the project portfolio, then search filters cards and opening a card enters its workspace.
- Given a normal content card or stage, then it uses a solid warm surface rather than Liquid Glass.
- Given navigation, compact floating controls, or the inspector, then the approved Liquid Glass shared component may be used.
- Given an outcome card is selected, then its plan, ownership, dependency, output, and history workspace opens.
- Given an output is under review, acceptance requires every criterion and revision requires feedback.
- Given an accepted prerequisite, dependent blocked outcomes become planned.
- No database migrations are required for this migration.
- Production project persistence must receive a follow-up specification covering authorization, tenancy, validation, RLS, audit, concurrency, and recovery.
