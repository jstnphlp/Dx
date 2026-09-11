# DX Module Context

DX is a virtual office system for a small software startup.
It combines project delivery, organizational visibility, scheduling, attendance, collaboration, team visibility, and analytics.

## Core System Model

```text
Company
-> Project
-> Stage
-> Outcome
-> Feature
-> Task
-> Output
-> Project Lead Review
```

The Project Lead defines WHAT must be achieved.
Contributors define HOW the work gets done.
The Project Lead verifies whether the final result satisfies the Outcome.

An Outcome is the main planning unit.
Features and Tasks are implementation details beneath an Outcome.
An Output is the reviewable result produced from the work.

# Module 8 - Activity & Audit

## Purpose

Activity & Audit provides a shared event history across DX.

Important actions from multiple modules should emit Activity Events.

## Example Events

```text
Project created
Stage created
Stage renamed
Outcome created
Member joined Outcome
Feature created
Task completed
Output draft saved
Output submitted
Output accepted
Revision requested
Dependency skipped
Announcement posted
Schedule changed
User timed in
User timed out
```

## Event Sources

Activity may receive events from:

```text
Project Delivery
Schedule & Availability
Time & Attendance
Team / People
Identity & Permissions
```

## Consumers

Activity may be displayed by:

- Home.
- Project Activity.
- Reports.
- Audit views.

## Project Activity

Project-specific activity should be filterable to the relevant Project.

Possible Project events include:

- Project changes.
- Stage changes.
- Outcome creation.
- Feature changes.
- Task changes.
- Membership changes.
- Output submissions.
- Review decisions.
- Dependency overrides.
- Announcements.

## Company Activity

Company Activity combines meaningful events from multiple modules into one operational stream.

## Important Rule

Important state-changing actions should emit an Activity Event.

## Boundary

Activity records what happened.

It should not become the primary source of truth for the current state of Projects, Schedules, Attendance, or People.

The owning module remains the canonical source of current state.

## AI Guidance

When adding a meaningful state-changing action, consider whether an Activity Event should also be emitted.

Do not reconstruct critical current state only from activity logs unless explicitly designed as an event-sourced system.
