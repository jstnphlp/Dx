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

# Module 5 - Time & Attendance

## Purpose

Time & Attendance records actual work sessions.

It answers:

```text
When did a member actually work?
```

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

# Time In

## Flow

```text
Time In
-> Start work session
-> Record start time
-> Mark user as Working Now
```

The active work session belongs to the current user.

# Time Out

## Flow

```text
Time Out
-> Record end time
-> Save work session
-> Calculate worked hours
-> Compare actual work against planned schedule
```

# Work Session History

Completed sessions should remain available as historical records.

A work session may contain:

- Member.
- Start time.
- End time.
- Duration.
- Scheduled overlap.
- Outside-schedule duration.
- Overtime information.

# Planned vs Actual

Schedule and Attendance are separate sources of truth.

```text
Schedule = planned work.
Attendance = actual work.
```

Variance is useful operational information.

# Outside Schedule

A user may work when no shift is planned.

The work should still be recorded.

It should be classified as work outside schedule rather than rejected.

# Overtime

Actual work may exceed planned hours.

The system may surface that difference as overtime.

## Integration

Time & Attendance may feed:

- Home Working Now.
- Team presence.
- Weekly worked hours.
- Reports.
- Activity & Audit.

## AI Guidance

Do not modify the user's default schedule when recording attendance.

Actual work sessions must remain independent from planned Schedule blocks.
