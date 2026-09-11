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

# Module 6 - Team / People

## Purpose

Team / People provides the operational view of company members.

It combines identity and selected operational information from other modules.

## Main Information

A member may show:

- Name.
- Role.
- Department.
- Current working status.
- Today's planned schedule.
- Weekly scheduled hours.
- Weekly worked hours.

## Structure

```text
Team Member
├── Identity
├── Role
├── Department
├── Presence
├── Planned Schedule
└── Worked Hours
```

## Data Ownership

The Team module should aggregate data rather than own all of it.

Example:

```text
Identity       <- Team / People
Department     <- Team / People
Working Now    <- Time & Attendance
Planned Hours  <- Schedule & Availability
Worked Hours   <- Time & Attendance
```

## Responsibilities

- Show company members.
- Show roles.
- Show department membership.
- Show current operational status.
- Provide access to a member's schedule detail.
- Summarize planned and worked hours.

## Boundary

Team should not calculate or store duplicate Schedule or Attendance records.

It should read those values from the modules that own them.

## AI Guidance

Requests about member identity, role, department, or member directory belong here.

Requests about planned working time belong to Schedule.

Requests about actual work sessions belong to Time & Attendance.
