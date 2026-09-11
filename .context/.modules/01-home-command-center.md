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

# Module 1 - Home / Command Center

## Purpose

Home gives the user a company-wide operational summary.

Home is primarily a read-oriented dashboard.
It should not duplicate the detailed workflows that belong to Projects, Schedule, Team, or Reports.

## Main Information

Home may show:

- Working Now.
- Active Projects.
- Outcomes waiting for review.
- Revision requests.
- Planned hours versus worked hours.
- Needs Attention items.
- Recent company activity.
- Quick links to other modules.

## Responsibilities

Home should:

- Summarize important information from other modules.
- Surface urgent or actionable items.
- Show what is currently happening across the company.
- Give the current user quick access to relevant work.

## Data Sources

Home may read from:

```text
Project Delivery
Schedule & Availability
Time & Attendance
Team / People
Activity & Audit
```

## Boundary

Home does not own core Project, Schedule, Attendance, or Team state.

If a user clicks an item from Home, the detailed action should normally continue inside the module that owns that data.

## AI Guidance

When a request is about summarizing company activity, current work, pending reviews, or attention signals, it may belong to Home.

When a request changes the underlying Project, Schedule, Attendance, or Team state, route that behavior to the owning module instead of implementing it directly inside Home.
