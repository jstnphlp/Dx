# Schedule and shifts

## Outcome

- Show the reference merged weekly schedule and a person-focused shifts comparison.
- Users can filter people/department, change person/week, configure and adjust their schedule, inspect a day, add date overrides, and toggle a global local time session.
- Pointer dragging, payroll use, production attendance, and manager approvals are excluded pending business rules; accessible move/resize controls provide equivalent prototype behavior.

## Access and data

- All authenticated starter users can use the local prototype.
- Schedules and work-session state persist in validated, per-user browser demo data and feed Home, Reports, and Team.
- No authorization-sensitive server mutation or audit event is introduced.

## Acceptance

- `/schedule` provides Team Schedule and Shifts modes.
- The weekly calendar scrolls horizontally when required.
- The floating time control uses the approved control glass; the calendar and forms are solid.
- Person shifts compare planned, worked, variance, and overlap values and expose a daily override inspector.
- Override times use the shared Prometheus time chooser and submit normalized 24-hour values without invoking a browser-native time picker.
