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

# Module 7 - Reports & Analytics

## Purpose

Reports & Analytics aggregates operational data for analysis.

It helps users understand company performance and workload.

## Main Reports

Possible reports include:

- Average Project progress.
- Project health.
- Accepted Outcome count.
- Outcomes waiting for review.
- Outcomes needing revision.
- Outcome pipeline.
- Team capacity.
- Member capacity.
- Department workload.

# Outcome Pipeline

The pipeline may group Outcomes into states such as:

```text
Planned
In Progress
For Review
Needs Revision
Accepted
Locked
```

# Team Capacity

Team capacity compares planned work commitment against actual recorded work.

Possible sources:

```text
Schedule & Availability
Time & Attendance
```

# Department Workload

Department workload may use Outcome ownership and open work.

Possible sources:

```text
Project Delivery
Team / People
```

## Boundary

Reports should primarily read and aggregate existing data.

Reports must not create a second copy of Project, Outcome, Schedule, Attendance, Team, or Review state.

## Data Sources

```text
Project Delivery
Schedule & Availability
Time & Attendance
Team / People
Activity & Audit
```

## AI Guidance

If a request asks for a calculation, metric, trend, summary, or operational analysis across existing records, it likely belongs here.

If the request changes the underlying record, route the change to the module that owns that record.
