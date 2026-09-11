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

# Module 3 - VisiWork

## Purpose

VisiWork provides cross-project organizational visibility.

It gives users department-centric and project-centric views of work across the company.

VisiWork should not duplicate Project Delivery logic.

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

# Department View

## Purpose

Answers:

```text
What is this department currently working on?
```

## Possible Information

- Department members.
- Active workers.
- Projects.
- Stages.
- Outcomes.
- Department work ownership.

## Bird's View

Bird's View provides a summarized view of all departments.

A user may preview a department or enter its Department Room.

## Department Room

A Department Room provides a deeper view of Projects, Stages, and Outcomes owned by that department.

# Project View

## Purpose

Answers:

```text
What Projects are currently moving across the company?
```

A Project shown here may include:

- Project progress.
- Departments involved.
- Active workers.
- Active Stages.
- Open Outcomes.

Opening a Project must use the same canonical Project Workspace used by the Projects module.

# VisiWork Chat

VisiWork may contain:

```text
General Chat
Department Chat
```

Entering a Department Room may change chat scope to that department.
Leaving the Department Room may return chat scope to General.

## Boundary

VisiWork is a visibility and navigation module.

It does not own separate Project, Outcome, Feature, Task, Output, or Review state.

## AI Guidance

When implementing a VisiWork feature, reuse Project Delivery data.

Do not introduce a second Project Workspace or alternate Project state model.

Treat VisiWork as another lens over company work.
