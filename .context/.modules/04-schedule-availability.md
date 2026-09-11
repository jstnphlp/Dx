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

# Module 4 - Schedule & Availability

## Purpose

Schedule & Availability represents planned work commitment.

It answers:

```text
When does a member plan to work?
```

## Structure

```text
Schedule & Availability
├── Team Schedule
├── My Schedule
├── Weekly Target
├── Preferred Hours
├── Rest Days
├── Schedule Generator
├── Schedule Editor
└── Date Overrides
```

# Team Schedule

## Purpose

Displays member schedules together in a shared calendar.

## Responsibilities

- Show weekly schedules.
- Filter by member.
- Filter by department.
- Arrange overlapping schedule blocks.

# My Schedule

## Purpose

Allows the current user to configure their own default weekly plan.

## User Inputs

A user may define:

- Weekly target hours.
- Preferred hours per day.
- Number of rest days.

The system may generate an initial weekly schedule from these values.

The user may then adjust the generated blocks.

## Schedule Editing

Possible actions include:

- Move a schedule block.
- Resize a schedule block.
- Mark a rest day.
- Review weekly target progress.

# Schedule Overrides

## Purpose

Allows a date-specific change without modifying the normal weekly schedule.

An override applies only to the selected date.

A day detail may show:

- Default plan.
- Override.
- Actual sessions.
- Scheduled hours.
- Worked hours.
- Overlap.
- Work outside schedule.

## Important Rule

```text
Schedule = planned commitment.
```

Schedule is not the source of truth for actual worked time.

## Boundary

Actual work sessions belong to Time & Attendance.

Do not store Time In or Time Out sessions as Schedule records.

## AI Guidance

Requests that change future or planned working hours belong here.

Requests that record what actually happened belong to Time & Attendance.
