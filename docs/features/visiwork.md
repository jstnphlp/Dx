# VisiWork

## Outcome

- Provide an authenticated, local-demo company view grouped by department or project.
- Users can enter a department office, inspect its project responsibilities, switch the root view, and use a local team chat.
- Database persistence, production permissions, presence, and message delivery are excluded until business ownership is defined.

## Access and data

- All authenticated starter users can view and interact with the prototype.
- Departments, people, projects, presence, and messages are in-memory demo data.
- No mutation is durable and no audit event is emitted.

## Acceptance

- `/visiwork` includes department bird's view, project view, department detail, and chat.
- Content surfaces are solid; global navigation remains Liquid Glass.
- The layout remains usable on narrow screens.
