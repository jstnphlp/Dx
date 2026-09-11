# DX Modules Context

## Purpose

DX is a virtual office system for a small software startup.
It combines project delivery, organizational visibility, scheduling, attendance, collaboration, team visibility, and analytics in one system.

This file defines the major system modules and their boundaries.
It is intended to give AI agents a simple mental model of how DX is structured.

---

## Core System Model

The main delivery hierarchy is:

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

The most important rule is:

```text
Project Lead defines WHAT must be achieved.
Contributors define HOW the work gets done.
Project Lead verifies whether the final result satisfies the outcome.
```

An Outcome is the main planning unit.
Features and Tasks are implementation details beneath an Outcome.
An Output is the reviewable result produced from the work.

---

# Module Overview

DX is divided into the following major modules:

```text
1. Home / Command Center
2. Project Delivery
3. VisiWork
4. Schedule & Availability
5. Time & Attendance
6. Team / People
7. Reports & Analytics
8. Activity & Audit
9. Identity, Roles & Permissions
10. Settings / Administration
```

The Project Delivery module is the core operational module.
Most other modules either support it or provide another view of its data.

---

# 1. Home / Command Center

## Purpose

Home gives the user a company-wide summary.

It does not own most business logic.
It mainly reads information from other modules.

## Main Information

Home may show:

- Working Now
- Active Projects
- Outcomes waiting for review
- Revision requests
- Planned hours versus worked hours
- Needs Attention items
- Recent company activity
- Quick links to other modules

## Boundary

Home is a dashboard.
It should not become a duplicate Project, Schedule, Team, or Reports workspace.

---

# 2. Project Delivery

## Purpose

Project Delivery manages the complete project execution lifecycle.

This is the main business module of DX.

## Structure

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

---

## 2.1 Project Portfolio

### Purpose

Provides the list of company projects.

### Responsibilities

- Create project
- Search projects
- Group projects by state
- Show project summaries
- Open a project

### Project Data

A project may contain:

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

A new project starts with a blank project workspace.
Stages and outcomes are created afterward.

---

## 2.2 Project Management

### Purpose

Owns the canonical Project Workspace.

### Main Areas

```text
Project Workspace
├── Header
├── Content
├── Chat
└── Activity
```

The header contains:

- Project identity
- Project Lead
- Assistant Lead, if any
- Project state
- Project progress

Project progress is outcome-based.

Recommended calculation:

```text
Accepted Outcomes / Total Outcomes
```

Projects opened from Projects or VisiWork must use the same canonical Project Workspace.

---

## 2.3 Stage Management

### Purpose

Stages organize outcomes into visible project phases.

### Responsibilities

- Create stage
- Rename stage
- Order stages
- Display stages as Kanban columns
- Place outcomes inside stages

### Rule

Stages are organizational containers.
Stages should not become another task-management layer.

---

## 2.4 Outcome Management

### Purpose

Outcomes define the results that must become true.

This is the most important planning concept in DX.

### Outcome Structure

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

### Core Rule

```text
Outcome = WHAT must be achieved.
Feature and Task = HOW contributors achieve it.
```

### Canonical Outcome States

```text
Planned
In Progress
For Review
Accepted
Locked
Skipped
```

Needs Revision is primarily a review or output state.
When revision is requested, the Outcome returns to In Progress.

---

## 2.5 Work Planning

### Purpose

Lets contributors define the implementation work required to achieve an Outcome.

### Structure

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

### Responsibilities

- Create feature
- Edit feature
- Add task
- Delete task
- Complete task
- Reopen task
- Calculate task progress

### Rule

The Project Lead should not need to define every Feature or Task.

Contributors are responsible for deciding how to execute an assigned Outcome.

Task completion measures execution progress.
Task completion does not automatically mean the Outcome is accepted.

---

## 2.6 Output & Review

### Purpose

Manages deliverables, submissions, review, revisions, and acceptance.

### Flow

```text
Contributor
-> Working Draft
-> Submit for Review
-> Versioned Submission
-> Project Lead Review
-> Verify Acceptance Criteria
-> Accept OR Request Revision
```

### Output Responsibilities

- Save draft
- Add notes
- Add link or deliverable reference
- Create submission version
- Submit for review
- Preserve submission history

### Review Responsibilities

- Verify acceptance criteria
- Accept output
- Request revision
- Save review feedback

### Revision Rule

A revision does not overwrite the previous submission.

Example:

```text
Outcome
├── Draft
└── Submission History
    ├── v1 - Needs Revision
    ├── v2 - Needs Revision
    └── v3 - Accepted
```

Review history must remain traceable.

---

## 2.7 Dependency Management

### Purpose

Controls prerequisite relationships between Outcomes.

### Model

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

The Project Lead may also explicitly skip a blocking prerequisite.

### Important Rule

Dependencies block execution, not planning.

A contributor may prepare Features and Tasks for a Locked Outcome.
The contributor cannot complete execution work or submit an Output while the Outcome is Locked.

---

## 2.8 Project Collaboration

### Purpose

Supports communication and coordination inside a Project.

### Structure

```text
Project Collaboration
├── Project Chat
├── Announcements
└── Project Activity
```

Project Chat is for coordination, decisions, and handoffs.

Announcements are project-wide notices.

Project Activity records meaningful changes related to the Project.

---

# 3. VisiWork

## Purpose

VisiWork provides cross-project organizational visibility.

It should not duplicate Project Delivery logic.

## Structure

```text
VisiWork
├── Department View
│   ├── Bird's View
│   ├── Department Preview
│   └── Department Room
├── Project View
└── VisiWork Chat
    ├── General
    └── Department
```

## Department View

Answers:

```text
What is this department currently working on?
```

It may show:

- Department members
- Active workers
- Projects
- Stages
- Outcomes
- Work ownership

## Project View

Answers:

```text
What projects are currently moving across the company?
```

Opening a Project from VisiWork must open the same Project Workspace used by the Projects module.

---

# 4. Schedule & Availability

## Purpose

Represents planned work commitment.

## Structure

```text
Schedule
├── Team Schedule
├── My Schedule
├── Weekly Target
├── Preferred Hours
├── Rest Days
├── Schedule Generator
├── Schedule Editor
└── Date Overrides
```

## Responsibilities

- Configure personal weekly schedule
- Generate initial schedule
- Move schedule blocks
- Resize schedule blocks
- Mark rest days
- View team schedule
- Filter by person or department
- Apply date-specific overrides

## Important Rule

```text
Schedule = planned commitment.
```

Schedule does not represent actual worked time.

---

# 5. Time & Attendance

## Purpose

Records actual work sessions.

## Structure

```text
Time & Attendance
├── Time In
├── Active Work Session
├── Time Out
├── Work Session History
├── Scheduled vs Actual
├── Outside Schedule
└── Overtime
```

## Time In

```text
Time In
-> Start work session
-> Record start time
-> Mark user as Working Now
```

## Time Out

```text
Time Out
-> Record end time
-> Save work session
-> Calculate worked hours
-> Compare actual time with planned schedule
```

## Important Rule

```text
Schedule = planned work.
Attendance = actual work.
```

A user may work outside the planned schedule.
That work should be recorded rather than rejected.

---

# 6. Team / People

## Purpose

Provides the operational view of company members.

## Main Information

Each member may show:

- Name
- Role
- Department
- Current working status
- Today's planned schedule
- Weekly scheduled hours
- Weekly worked hours

## Boundary

The Team module aggregates information.

It should not own schedule logic or attendance calculations.

Example:

```text
Team Member
├── Identity       <- People
├── Department     <- People
├── Working Now    <- Time & Attendance
├── Planned Hours  <- Schedule
└── Worked Hours   <- Time & Attendance
```

---

# 7. Reports & Analytics

## Purpose

Aggregates operational data for analysis.

## Main Reports

Possible reports include:

- Average project progress
- Project health
- Accepted Outcome count
- Outcomes waiting for review
- Outcomes needing revision
- Outcome pipeline
- Team capacity
- Member capacity
- Department workload

## Boundary

Reports should mainly read and aggregate existing data.

It should not maintain a second copy of Project, Schedule, Attendance, or Team state.

---

# 8. Activity & Audit

## Purpose

Provides a shared audit trail across DX.

## Example Events

```text
Project created
Stage created
Stage renamed
Outcome created
Member joined Outcome
Feature created
Task completed
Output submitted
Output accepted
Revision requested
Dependency skipped
Announcement posted
Schedule changed
User timed in
User timed out
```

## Consumers

Activity may be used by:

- Home
- Project Activity
- Reports
- Audit views

## Important Rule

Important actions should emit Activity Events.

---

# 9. Identity, Roles & Permissions

## Purpose

Controls who can perform specific actions.

## Main Concepts

```text
Identity & Access
├── User
├── Role
├── Department Membership
├── Project Membership
├── Outcome Membership
└── Permission Evaluation
```

## Important Permission Questions

Examples:

```text
Can this user create a Stage?
Can this user create an Outcome?
Can this user edit Features and Tasks?
Can this user complete Tasks?
Can this user submit an Output?
Can this user review an Output?
Can this user skip a prerequisite?
Can this user configure this Schedule?
```

## Main Roles

### Project Lead

Typically responsible for:

- Project direction
- Stage management
- Outcome creation
- Acceptance criteria
- Outcome assignment
- Dependencies
- Review
- Acceptance
- Revision requests
- Project state

### Contributor

Typically responsible for:

- Features
- Tasks
- Execution
- Draft Output
- Submission

### Other Member

May inspect accessible work.

A non-contributor may join an Outcome if the system allows it.

---

# 10. Settings / Administration

## Purpose

Reserved for system and company configuration.

The current prototype does not yet define the Settings workflow.

Do not invent detailed Settings behavior unless new product requirements define it.

---

# Module Relationships

The main relationship between modules is:

```text
                    Home
                     |
                     v
Projects ------> Project Delivery <------ VisiWork
                     |
          +----------+----------+
          |          |          |
          v          v          v
       Outcomes    Reviews    Activity
          |                     |
          v                     v
       Reports <------------ Audit Events
          ^                     ^
          |                     |
       Schedule ------ Time & Attendance
          ^                     ^
          +-------- Team -------+
```

Projects and VisiWork are different entry points into the same Project Delivery domain.

Home, Team, and Reports mostly aggregate or display data from other modules.

---

# Canonical Project Delivery Flow

AI agents should treat the following as the standard Project workflow:

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

---

# Core System Rules

## Rule 1

Outcomes are the Project Lead's main planning unit.

## Rule 2

Features and Tasks belong close to the people doing the work.

## Rule 3

Task progress and Outcome acceptance are different concepts.

## Rule 4

Dependencies block execution, not planning.

## Rule 5

Review and submission history must never be overwritten.

## Rule 6

Schedule and Attendance are separate sources of truth.

## Rule 7

Projects and VisiWork must reuse the same canonical Project Workspace.

## Rule 8

Important actions should emit shared Activity Events.

## Rule 9

Home, Team, VisiWork, and Reports should reuse existing domain data instead of creating duplicate state.

## Rule 10

Do not introduce a new module when the behavior clearly belongs to an existing module.

---

# AI Implementation Guidance

When modifying DX, first identify which module owns the requested behavior.

Examples:

```text
"Add a new outcome"
-> Project Delivery / Outcome Management

"Add tasks under an outcome"
-> Project Delivery / Work Planning

"Submit a finished design for review"
-> Project Delivery / Output & Review

"Show all R&D work"
-> VisiWork / Department View

"Change weekly availability"
-> Schedule & Availability

"Start working now"
-> Time & Attendance

"Show worked hours for a member"
-> Team reads Time & Attendance

"Calculate department workload"
-> Reports & Analytics

"Check whether a member may accept an output"
-> Identity, Roles & Permissions
```

Prefer one canonical source of truth.

Do not duplicate project state between Projects and VisiWork.

Do not duplicate attendance data inside Schedule.

Do not duplicate review state inside Reports.

Do not treat UI pages as automatically separate business modules.

A page may compose data and behavior from several modules.

---

# Short Mental Model

For quick reasoning, use this simplified model:

```text
Project Delivery = What the company is building.

VisiWork = Who and which departments are working on it.

Schedule = When people plan to work.

Time & Attendance = When people actually worked.

Team = Who the people are and their current operational status.

Activity = What happened.

Reports = What the collected data means.

Home = What the user needs to know right now.

Permissions = Who is allowed to do what.
```
