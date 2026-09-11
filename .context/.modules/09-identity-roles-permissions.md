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

# Module 9 - Identity, Roles & Permissions

## Purpose

Identity, Roles & Permissions controls who a user is and what that user may do.

## Structure

```text
Identity & Access
├── User
├── Role
├── Department Membership
├── Project Membership
├── Outcome Membership
└── Permission Evaluation
```

# Main Roles

## Project Lead

The Project Lead typically owns:

- Project direction.
- Project state.
- Stage management.
- Outcome creation.
- Acceptance Criteria.
- Outcome assignment.
- Dependencies.
- Review.
- Acceptance.
- Revision requests.

The Project Lead may also be a contributor when personally assigned to an Outcome.

## Contributor

A contributor typically owns:

- Feature planning.
- Task planning.
- Task execution.
- Draft Output.
- Output submission.

## Other Member

An Other Member may inspect accessible work.

A non-contributor may join an Outcome if the system allows joining.

# Permission Questions

Permission logic should answer questions such as:

```text
Can this user create a Stage?
Can this user rename a Stage?
Can this user create an Outcome?
Can this user define Acceptance Criteria?
Can this user edit Features and Tasks?
Can this user complete Tasks?
Can this user submit an Output?
Can this user review an Output?
Can this user accept an Output?
Can this user request revision?
Can this user skip a prerequisite?
Can this user configure this Schedule?
Can this user inspect this Project?
```

# Recommended Permission Interface

Prefer centralized permission checks rather than scattered UI-only conditions.

Example conceptual checks:

```text
canCreateStage(user, project)
canCreateOutcome(user, project)
canEditWorkPlan(user, outcome)
canCompleteTask(user, outcome)
canSubmitOutput(user, outcome)
canReviewOutput(user, outcome)
canSkipDependency(user, outcome)
canConfigureSchedule(user, targetUser)
```

## Important Rule

UI visibility is not sufficient permission enforcement.

Business actions should validate permission at the owning domain boundary.

## AI Guidance

Whenever implementing an action that changes state, identify the required permission before implementing the UI.

Avoid duplicating permission rules across multiple pages.
