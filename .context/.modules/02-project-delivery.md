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

# Module 2 - Project Delivery

## Purpose

Project Delivery manages the complete project execution lifecycle.

This is the core business module of DX.

## Internal Structure

```text
Project Delivery
├── Project Portfolio
├── Project Management
├── Stage Management
├── Outcome Management
├── Work Planning
├── Output & Review
├── Dependency Management
└── Project Collaboration
```

# 2.1 Project Portfolio

## Purpose

Provides the company project list and project entry point.

## Responsibilities

- Create a Project.
- Search Projects.
- Group Projects by state.
- Show Project summaries.
- Open a Project.

## Project Structure

```text
Project
├── Name
├── Description
├── Status
├── Project Lead
├── Assistant Lead, optional
├── Departments
└── Stages
```

A new Project begins with a blank Project Workspace.
Stages and Outcomes are created afterward.

# 2.2 Project Management

## Purpose

Owns the canonical Project Workspace.

## Main Areas

```text
Project Workspace
├── Header
├── Content
├── Chat
└── Activity
```

The header may contain:

- Project identity.
- Project Lead.
- Assistant Lead, if any.
- Project state.
- Project progress.

Project progress is Outcome-based.

Recommended progress calculation:

```text
Accepted Outcomes / Total Outcomes
```

Projects opened from Projects or VisiWork must resolve to the same canonical Project Workspace.

# 2.3 Stage Management

## Purpose

Stages organize Outcomes into visible Project phases.

## Responsibilities

- Create Stage.
- Rename Stage.
- Order Stages.
- Display Stages as Kanban columns.
- Place Outcomes inside Stages.

## Rule

Stages are organizational containers.
They should not become another task-management layer.

# 2.4 Outcome Management

## Purpose

Outcomes define the results that must become true.

This is the most important planning concept in DX.

## Outcome Structure

```text
Outcome
├── Title
├── Description
├── Stage
├── Department ownership
├── Contributors
├── Primary assignee
├── Acceptance criteria
├── State
└── Optional prerequisite
```

## Core Rule

```text
Outcome = WHAT must be achieved.
Feature and Task = HOW contributors achieve it.
```

## Canonical Outcome States

```text
Planned
In Progress
For Review
Accepted
Locked
Skipped
```

Needs Revision is primarily a review or Output state.
When revision is requested, the Outcome returns to In Progress.

# 2.5 Work Planning

## Purpose

Lets contributors define the implementation work required to achieve an Outcome.

## Structure

```text
Outcome
└── Work Plan
    ├── Feature
    │   ├── Task
    │   ├── Task
    │   └── Task
    └── Feature
        ├── Task
        └── Task
```

## Responsibilities

- Create Feature.
- Edit Feature.
- Add Task.
- Delete Task.
- Complete Task.
- Reopen Task.
- Calculate task progress.

## Rule

The Project Lead should not need to define every Feature or Task.

Contributors decide how to execute an assigned Outcome.

Task completion measures execution progress.
Task completion does not automatically mean the Outcome is accepted.

# 2.6 Output & Review

## Purpose

Manages deliverables, submissions, review, revisions, and acceptance.

## Flow

```text
Contributor
-> Working Draft
-> Submit for Review
-> Versioned Submission
-> Project Lead Review
-> Verify Acceptance Criteria
-> Accept OR Request Revision
```

## Output Responsibilities

- Save Draft.
- Add notes.
- Add link or deliverable reference.
- Create submission version.
- Submit for review.
- Preserve submission history.

## Review Responsibilities

- Verify Acceptance Criteria.
- Accept Output.
- Request Revision.
- Save review feedback.

## Revision Rule

A revision must not overwrite the previous submission.

Example:

```text
Outcome
├── Draft
└── Submission History
    ├── v1 - Needs Revision
    ├── v2 - Needs Revision
    └── v3 - Accepted
```

# 2.7 Dependency Management

## Purpose

Controls prerequisite relationships between Outcomes.

## Model

```text
Outcome A
-> prerequisite for
Outcome B
```

If Outcome A is unresolved:

```text
Outcome B = Locked
```

If Outcome A is accepted:

```text
Outcome B = Planned
```

The Project Lead may explicitly skip a blocking prerequisite.

## Important Rule

Dependencies block execution, not planning.

A contributor may prepare Features and Tasks for a Locked Outcome.
The contributor cannot complete execution work or submit an Output while the Outcome is Locked.

# 2.8 Project Collaboration

## Purpose

Supports communication and coordination inside a Project.

## Structure

```text
Project Collaboration
├── Project Chat
├── Announcements
└── Project Activity
```

Project Chat is for coordination, decisions, and handoffs.

Announcements are Project-wide notices.

Project Activity records meaningful Project actions.

# Canonical Project Delivery Flow

```text
Create Project
-> Create Stages
-> Define Outcomes
-> Assign Departments and Contributors
-> Define Acceptance Criteria
-> Add Optional Dependencies
-> Contributors Define Features and Tasks
-> Contributors Execute Work
-> Prepare Output
-> Submit Versioned Output
-> Project Lead Verifies Acceptance Criteria
-> Accept OR Request Revision
-> Resolve Dependencies
-> Update Project Progress
-> Mark Project Done
-> Preserve Activity and Review History
```

## AI Guidance

Most work-management requests should first be evaluated against this module.

Do not create separate duplicate Project logic inside VisiWork, Home, Reports, or Team.
