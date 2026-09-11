# VisiWork

## Outcome

- Provide an authenticated, local-demo company view grouped by department or project.
- Users can preview or enter a department office, inspect project/stage/outcome responsibilities, switch the root view, open the canonical project workspace, and use room-specific local chat.
- Database persistence, production permissions, presence, and message delivery are excluded until business ownership is defined.

## Access and data

- All authenticated starter users can view and interact with the prototype.
- Departments, people, projects, presence, and messages share the validated per-user browser demo store.
- No mutation is durable and no audit event is emitted.

## Acceptance

- `/visiwork` includes department bird's view, project view, department detail, and chat.
- Content surfaces are solid; global navigation remains Liquid Glass.
- The layout remains usable on narrow screens.
