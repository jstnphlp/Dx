# Schedule and shifts

## Outcome

- Show the reference merged weekly schedule and a person-focused shifts comparison.
- Users can filter by department, change person/week, open the local configuration dialog, and toggle a local time session.
- Dragging, persistence, payroll use, production attendance, and manager approvals are excluded pending business rules.

## Access and data

- All authenticated starter users can use the local prototype.
- Schedules and work-session state are demo data in the browser.
- No authorization-sensitive server mutation or audit event is introduced.

## Acceptance

- `/schedule` provides Team Schedule and Shifts modes.
- The weekly calendar scrolls horizontally when required.
- The floating time control uses the approved control glass; the calendar and forms are solid.
