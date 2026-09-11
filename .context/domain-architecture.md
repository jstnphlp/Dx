# Dx Domain Architecture

## Purpose

This document defines the approved Domain Model v1 for Dx.

It describes the business concepts, ownership boundaries, relationships, and workflow rules of the product.

It does not define the final database schema, API shape, or implementation structure.

Those should be derived from this model rather than deciding the model around technical constraints.

---

## 1. Core Principle

Dx is organized around outcomes.

The primary planning hierarchy is:

```text
Project
  |
  v
Stage
  |
  v
Outcome
```

An Outcome represents a result that must exist.

Features and Tasks describe how participants produce that result.

Output Submissions represent what participants produced to satisfy the Outcome.

The Project Lead reviews those submissions against the Outcome's acceptance criteria.

---

## 2. Top-Level Domains

Dx currently has the following business domains.

| Domain | Responsibility |
| --- | --- |
| Projects | Defines initiatives, stages, memberships, and project-level lifecycle |
| Work | Defines outcomes, participants, features, tasks, submissions, reviews, and dependencies |
| People & Departments | Defines company members and organizational grouping |
| Schedule | Defines availability, planned work blocks, and actual work sessions |
| Collaboration | Defines company, department, and project communication |
| Activity | Records meaningful user-visible actions and changes |
| Audit | Records security-sensitive and accountability events |
| Reporting | Reads data from other domains and produces summaries and metrics |

VisiWork is not a separate business domain.

VisiWork is a product view that combines information from People, Departments, Projects, Schedule, Activity, and active Work.

---

## 3. Company

The Company is the top organizational context.

It contains People, Departments, Projects, and company-level collaboration.

Conceptually:

```text
Company
├── People
├── Departments
├── Projects
├── Company Collaboration
└── Company Activity
```

Dx currently assumes a single-company operating model unless a future requirement explicitly introduces multi-company tenancy.

---

## 4. Person

A Person represents a company member.

A Person can independently participate in organizational and project relationships.

A person's department membership is separate from project membership.

Conceptually:

```text
Person
├── Department Membership
├── Project Memberships
├── Outcome Participations
├── Schedule
└── Work Sessions
```

A person's department does not determine what projects they are allowed to participate in.

A person's role in one project does not determine their role in another project.

---

## 5. Department

A Department is an organizational grouping of People.

Examples may include:

```text
R&D
Creatives
Sales & Marketing
```

Departments answer organizational questions such as:

```text
Where does this person belong?
Which department is responsible for this outcome?
Which departments are involved in this project?
```

Departments do not directly own Tasks.

Departments do not directly determine project permissions.

Actual work is performed by People participating in Projects and Outcomes.

---

## 6. Project

A Project represents a client or internal initiative that the company is trying to complete.

A Project contains:

```text
Name
Description
Project Lead
Project Members
Departments involved
Stages
Status
Created date
Target dates when needed
```

The current Project lifecycle is:

```text
Planning
Active
Paused
Completed
Archived
```

Archived represents a non-active historical Project.

Completion is an explicit Project Lead decision.

The system should not silently complete a Project when its calculated progress reaches 100 percent.

---

## 7. Project Lead

Every Project has exactly one Project Lead.

The Project Lead is responsible for defining and governing the expected results of the Project.

Primary responsibilities include:

```text
Define Stages
Define Outcomes
Define acceptance expectations
Assign or manage Outcome participants
Manage Outcome dependencies
Review Output Submissions
Request revisions
Accept Outcomes
Override dependencies when justified
Complete the Project
```

There is no Assistant Lead role in Domain Model v1.

---

## 8. Project Member

A Project Member is a Person participating in a Project.

Project Membership is contextual.

For example:

```text
Nico

Company Department:
R&D

Project A:
Project Member

Project B:
Project Lead
```

Being a Project Member means the Person belongs to the Project context.

It does not automatically mean the Person participates in every Outcome.

Outcome participation is modeled separately.

---

## 9. Project Stage

A Stage organizes related Outcomes into a meaningful Project phase.

Examples may include:

```text
Discovery & Planning
Experience Design
Core Development
Testing & Release
```

Stages provide structure and readability.

Stages are not rigid waterfall gates.

The existence of a later Stage does not automatically mean work in that Stage must wait for every earlier Stage to finish.

Actual execution constraints are represented through Outcome Dependencies.

Therefore:

```text
Stage = organization
Dependency = execution constraint
```

---

## 10. Outcome

The Outcome is the central work object in Dx.

An Outcome describes a result that must exist.

An Outcome should be written as a completed or verifiable result rather than an activity.

Good:

```text
Working authentication and role access
```

Less desirable:

```text
Implement authentication
```

Good:

```text
Approved application UI/UX
```

Less desirable:

```text
Design the UI
```

An Outcome may contain:

```text
Title
Description
Expected result
Acceptance criteria
Stage
Responsible department
Participants
State
Dependencies
Features
Tasks
Output Submissions
Review history
```

---

## 11. Outcome Responsibility

An Outcome may identify one Responsible Department.

This represents the organizational group primarily responsible for the result.

Actual work is performed by People.

An Outcome may have multiple Participants.

Conceptually:

```text
Outcome
├── Responsible Department
└── Participants
```

The Responsible Department does not replace participant-level accountability.

---

## 12. Outcome Participants

Outcome Participants are Project Members actively contributing to a specific Outcome.

Participation may begin in two ways:

```text
Project Lead assigns the member

or

Project Member joins the Outcome where permissions allow
```

The system may later introduce a Primary Owner distinction if a real need emerges.

Domain Model v1 does not require one mandatory Outcome owner.

An Outcome can therefore be collaborative.

Example:

```text
Outcome:
Functional client dashboard

Participants:
Nico
Justin
Rex
```

---

## 13. Joining an Outcome

A Project Member may join an Outcome when Project permissions allow self-joining.

Joining an Outcome adds the Project Member as a Participant.

A Project Lead may also explicitly add or remove Participants.

Joining an Outcome should not silently grant Project-level leadership permissions.

---

## 14. Acceptance Criteria

Acceptance Criteria define the conditions that must be satisfied before an Outcome can be accepted.

Example:

```text
Outcome:
Working authentication and role access

Acceptance Criteria:
- User can sign in
- Invalid credentials show feedback
- User session persists
- Unauthorized routes are blocked
- Password reset works
```

Acceptance Criteria may remain incomplete during early planning.

They must be sufficiently defined before final acceptance.

The Project Lead reviews Output Submissions against these criteria.

---

## 15. Feature

A Feature is an optional subdivision of an Outcome.

Features describe meaningful implementation areas used by Participants to organize execution.

Example:

```text
Outcome:
Working authentication and role access

Features:
- Login
- Password reset
- Role guards
- Session management
```

Features are not mandatory.

A small Outcome may be executed without creating any Features.

Outcome Participants define Features because Features describe how the result will be produced.

The Project Lead defines the expected result.

Participants define the implementation structure.

If the Project Lead is also a Participant, the same Person may perform both responsibilities.

---

## 16. Task

A Task is a lightweight execution item.

Tasks may belong directly to an Outcome or to a Feature.

Conceptually:

```text
Outcome
├── Task
└── Feature
    └── Task
```

This avoids forcing unnecessary hierarchy for small Outcomes.

A Task may contain:

```text
Title
Status
Optional assignee
Outcome
Optional Feature
Created by
Completion state
```

Tasks should remain lightweight.

Dx should not introduce Jira-style complexity such as story points, epic hierarchies, or nested task systems unless a real requirement emerges.

---

## 17. Relationship Between Outcome, Feature, and Task

The canonical relationship is:

```text
Outcome
├── Feature
│   └── Task
└── Task
```

Outcome defines what result must exist.

Feature describes a meaningful implementation area.

Task describes a concrete action needed during execution.

Tasks and Features support the Outcome.

They do not replace it as the primary measure of Project progress.

---

## 18. Output Submission

An Output Submission represents what Participants produced to satisfy an Outcome.

The Outcome represents the expected result.

The Output Submission represents the actual delivered result.

Example:

```text
Outcome:
Approved application UI/UX

Output Submission:
Figma Prototype v3
```

Another example:

```text
Outcome:
Working authentication and role access

Output Submission:
Auth Build v2
```

An Output Submission may contain:

```text
Title
Description or notes
Files
Links
Submitted by
Submitted at
Version
Review state
Reviewer feedback
```

---

## 19. Submission Versioning

An Outcome may have multiple Output Submissions.

Each new submission represents another version or attempt.

Conceptually:

```text
Outcome
├── Submission v1
├── Submission v2
└── Submission v3
```

Older submissions remain part of the Outcome history.

A revision does not overwrite the previous submission.

---

## 20. Submission Review States

Output Submissions use the following review states:

```text
Draft
For Review
Needs Revision
Accepted
```

Draft means the submission has not yet been formally submitted for review.

For Review means the Project Lead must review it.

Needs Revision means the Project Lead rejected the current version and requested changes.

Accepted means the submitted result satisfies the Outcome.

---

## 21. Outcome Workflow

The default Outcome workflow is:

```text
Outcome created
      |
      v
Planned
      |
      v
In Progress
      |
      v
Output submitted
      |
      v
For Review
      |
      v
Project Lead reviews acceptance criteria
      |
      +------------------+
      |                  |
      v                  v
Accepted          Needs Revision
                         |
                         v
                    In Progress
                         |
                         v
                  New Submission
```

Only the Project Lead performs final Outcome acceptance in Domain Model v1.

A future version may support designated reviewers if a real requirement appears.

---

## 22. Outcome States

The standardized Outcome states are:

```text
Planned
In Progress
Blocked
For Review
Needs Revision
Accepted
Cancelled
```

Planned means execution has not started.

In Progress means Participants are actively working toward the result.

Blocked means execution cannot proceed because of an unresolved constraint.

For Review means an Output Submission is waiting for Project Lead review.

Needs Revision means the latest review requires more work.

Accepted means the Outcome has satisfied its acceptance criteria.

Cancelled means the Outcome is intentionally no longer required.

Dx does not use separate Locked and Blocked states in Domain Model v1.

Blocked is the canonical constraint state.

---

## 23. Outcome Dependencies

Dependencies exist between Outcomes.

Conceptually:

```text
Outcome B
depends on
Outcome A
```

Dependencies may exist within the same Stage or across different Stages.

Stage boundaries do not restrict dependency relationships.

Example:

```text
Stage 2:
Approved application UI/UX

        |
        v

Stage 3:
Implemented approved interface
```

The dependent Outcome may be blocked until the required Outcome is accepted.

---

## 24. Dependency Resolution

The default dependency rule is:

```text
Dependency Outcome Accepted
        |
        v
Dependent Outcome becomes available
```

Task completion does not resolve an Outcome Dependency.

A progress percentage does not resolve an Outcome Dependency.

Acceptance is the meaningful dependency-resolution event.

---

## 25. Dependency Override

A Project Lead may override an Outcome Dependency when the Project can safely continue without waiting for the dependency to be accepted.

This action should be explicit.

Use the term:

```text
Override Dependency
```

rather than a casual Skip action.

An override should record:

```text
Who performed the override
When it happened
Why it was overridden
Which dependency was affected
```

Dependency overrides are meaningful Project decisions and should appear in Activity and Audit where appropriate.

---

## 26. Planned Versus Blocked

Planned and Blocked are distinct.

Planned means:

```text
The Outcome has not started.
```

Blocked means:

```text
The Outcome would otherwise proceed, but a constraint currently prevents execution.
```

An Outcome should not be marked Blocked merely because it is scheduled for later.

---

## 27. Outcome Progress

Outcome progress should not be represented primarily as a synthetic percentage.

Task completion may be shown as supporting execution information.

Example:

```text
5 / 8 tasks complete
```

This does not automatically mean:

```text
62.5 percent complete
```

Tasks vary in size and importance.

The Outcome state is the primary representation of progress.

---

## 28. Stage Progress

Stage progress is based on Outcome acceptance.

Default calculation:

```text
Accepted active Outcomes
/
Total active Outcomes in Stage
```

Cancelled Outcomes are excluded from the active denominator.

Example:

```text
Stage:
Experience Design

3 active Outcomes
2 Accepted

Stage Progress:
67 percent
```

---

## 29. Project Progress

Project progress is based primarily on Outcome acceptance.

Default calculation:

```text
Accepted active Outcomes
/
Total active Outcomes in Project
```

Task counts do not determine Project progress.

Cancelled Outcomes are excluded from the active denominator.

This keeps Project progress explainable and prevents many small Tasks from outweighing critical unfinished Outcomes.

Weighted Outcomes may be introduced later only if a real business need appears.

---

## 30. Project Completion

A Project becomes eligible for completion when all required active Outcomes are either:

```text
Accepted

or

Cancelled
```

Eligibility does not automatically complete the Project.

The Project Lead explicitly performs the Complete Project action.

This preserves human control over the final business decision.

---

## 31. Schedule Domain

Schedule is independent from Projects.

A Person may have:

```text
Availability
Planned Work Blocks
Actual Work Sessions
```

Conceptually:

```text
Person
├── Availability
├── Planned Work Blocks
└── Actual Work Sessions
```

Projects may read Schedule information when useful.

Projects do not own Schedule records.

---

## 32. Availability

Availability describes when a Person expects or prefers to be available for work.

It is planning information.

Availability should not be treated as proof that work actually occurred.

---

## 33. Planned Work Blocks

Planned Work Blocks represent scheduled working periods.

Example:

```text
Monday
2:00 PM - 6:00 PM
```

These may later support staffing and assignment decisions.

---

## 34. Actual Work Sessions

Actual Work Sessions represent recorded work periods.

Example:

```text
Scheduled:
2:00 PM - 6:00 PM

Actual:
2:14 PM - 5:48 PM
```

Planned Work Blocks and Actual Work Sessions remain separate concepts.

This allows Dx to compare intended work with actual work without corrupting Schedule data.

---

## 35. Collaboration Domain

Collaboration handles communication inside meaningful scopes.

Domain Model v1 supports:

```text
Company Chat
Department Chat
Project Chat
```

Outcome-level Chat is not part of Domain Model v1.

Detailed Outcome discussion should initially be handled through Outcome activity, review feedback, and related comments if comments are introduced.

This avoids fragmenting communication across too many chat rooms.

---

## 36. Activity Domain

Activity records meaningful user-visible events.

Examples:

```text
Bea submitted Prototype v3
Rex accepted Prototype v3
Nico joined Dashboard outcome
Marco created Client Approval outcome
```

An Activity Event may contain:

```text
Actor
Action
Entity type
Entity ID
Project ID when applicable
Timestamp
Metadata
```

One canonical Activity model may be filtered into different views.

Examples:

```text
Company Activity
Project Activity
Person Activity
Outcome Activity
```

Activity represents collaboration history.

---

## 37. Audit Domain

Audit is separate from Activity.

Activity is user-visible operational history.

Audit is accountability and security history.

Example Activity:

```text
Rex accepted UI Prototype.
```

Example Audit event:

```text
Rex changed Bea's Project role from Member to Lead.
```

Audit may have stricter retention and visibility requirements than Activity.

The two concepts should not be collapsed solely because some events may appear in both.

---

## 38. Reporting Domain

Reporting reads from the operational domains.

Reporting does not own core business state.

It may consume data from:

```text
Projects
Work
People
Schedule
Activity
```

Possible reports include:

```text
Project completion
Accepted Outcomes
Blocked Outcomes
Review turnaround
Scheduled versus actual work
Work distribution
Department participation
```

Reporting should begin with direct read models and database queries.

A separate analytics architecture should only be introduced when scale or reporting complexity actually requires it.

---

## 39. VisiWork

VisiWork is a product view rather than a business domain.

It presents an operational view of the company.

Conceptually:

```text
VisiWork
├── People
├── Departments
├── Projects
├── Active Outcomes
├── Schedule
└── Activity
```

VisiWork should reuse canonical data from those domains.

It must not create duplicate Project, Department, Schedule, or Work models.

---

## 40. Primary Domain Relationships

The approved high-level relationship model is:

```text
Company
│
├── Person
│   ├── Department Membership
│   ├── Project Membership
│   ├── Outcome Participation
│   ├── Availability
│   ├── Planned Work Blocks
│   └── Actual Work Sessions
│
├── Department
│
└── Project
    │
    ├── Project Lead
    ├── Project Members
    │
    ├── Stage
    │   │
    │   └── Outcome
    │       │
    │       ├── Responsible Department
    │       ├── Participants
    │       ├── Acceptance Criteria
    │       │
    │       ├── Feature
    │       │   └── Task
    │       │
    │       ├── Task
    │       │
    │       ├── Dependencies
    │       │
    │       └── Output Submission
    │           └── Review
    │
    ├── Project Chat
    └── Activity
```

---

## 41. Ownership Boundaries

The current ownership model is:

```text
Company
owns organizational context

People & Departments
own organizational membership

Projects
own project lifecycle and membership

Work
owns Outcomes and execution structures

Schedule
owns availability and time records

Collaboration
owns conversations

Activity
owns user-visible event history

Audit
owns accountability records

Reporting
owns read models and summaries
```

A domain may reference another domain's identifiers.

It should not duplicate another domain's canonical records.

---

## 42. Important Domain Rules

The following rules are approved for Domain Model v1.

1. Every Project has exactly one Project Lead.
2. There is no Assistant Lead role.
3. Project Lead is a contextual Project role rather than a global company role.
4. Outcome is the primary unit of Project work.
5. Stages organize Outcomes but do not enforce waterfall execution.
6. Outcome Dependencies control actual execution constraints.
7. Dependencies may cross Stage boundaries.
8. Outcome Participants must belong to the Project.
9. Outcome Participants may define Features and Tasks.
10. Features are optional.
11. Tasks may belong directly to an Outcome.
12. Tasks may alternatively belong to a Feature.
13. Task completion does not determine Outcome acceptance.
14. Output Submissions are versioned.
15. Acceptance Criteria determine whether an Outcome is satisfied.
16. Only the Project Lead performs final acceptance in v1.
17. Accepted Outcomes resolve their dependent Outcome Dependencies.
18. Project Leads may explicitly override Dependencies with a recorded reason.
19. Project and Stage progress are primarily based on accepted active Outcomes.
20. Cancelled Outcomes do not count against active progress.
21. Project completion is an explicit Project Lead action.
22. Departments are organizational structures, not permission boundaries.
23. Schedule is independent from Projects.
24. Planned work and actual work remain separate.
25. Activity and Audit remain separate concepts.
26. Reporting reads operational data rather than owning it.
27. VisiWork is a view over canonical domains and does not own duplicate business state.

---

## 43. Intentionally Deferred Decisions

The following decisions are not part of Domain Model v1 and should not be invented during implementation.

### Outcome Primary Owner

Outcomes support multiple Participants.

A special Primary Owner role should only be added if a real workflow requires it.

### Weighted Outcomes

Project progress currently treats active Outcomes equally.

Weighted progress should only be added if equal weighting proves insufficient.

### Designated Reviewers

Only the Project Lead accepts Outcomes in v1.

Reviewer delegation may be introduced later if necessary.

### Outcome Chat

Outcome-level chat is intentionally excluded.

Project Chat plus Outcome activity and review feedback should be evaluated first.

### Sprint or Agile Planning Objects

Sprint, Epic, Story Point, Backlog, and similar concepts are not part of the approved domain.

They may be introduced later if the company actually adopts workflows that require them.

### Advanced Capacity Planning

Schedule data may eventually influence assignments.

Automated capacity allocation is not part of Domain Model v1.

### Multi-Company Tenancy

The current model assumes one company context.

Multi-company tenancy should only be introduced with an explicit requirement.

---

## 44. Domain Design Guidance

Implementation should preserve the meaning of this model.

Do not collapse distinct concepts merely because they could share one UI.

Do not create new domain concepts solely because a framework or library makes them convenient.

Do not expose database tables directly as the product model without checking whether they represent the domain correctly.

Prefer stable business terminology throughout the codebase.

The canonical vocabulary is:

```text
Project
Project Lead
Project Member
Stage
Outcome
Outcome Participant
Responsible Department
Acceptance Criterion
Feature
Task
Output Submission
Review
Outcome Dependency
Activity Event
Audit Event
Availability
Planned Work Block
Actual Work Session
```

Avoid introducing synonyms for these concepts without a real semantic distinction.

---

## 45. What Comes Next

With the technology stack and Domain Model v1 defined, the next architecture work should proceed in this order:

```text
Domain Model v1
      |
      v
Permissions Model
      |
      v
Entity Relationships
      |
      v
Database Schema
      |
      v
Feature Module Boundaries
      |
      v
Application Flows
      |
      v
Implementation
```

The next document should define the Permissions Model.

That document should answer who may view, create, modify, join, submit, review, accept, override, cancel, and complete each domain object.

---

## Summary

Dx is an outcome-centered virtual office and project execution system.

Projects are organized into Stages.

Stages contain Outcomes.

Outcomes define results.

Participants organize execution through optional Features and lightweight Tasks.

Participants submit versioned Outputs.

Project Leads review those Outputs against Acceptance Criteria.

Outcome Dependencies represent real execution constraints and may cross Stage boundaries.

People and Departments describe the organization.

Schedule describes planned and actual working time independently from Projects.

Collaboration provides scoped communication.

Activity provides operational history.

Audit provides accountability.

Reporting reads from the operational domains.

VisiWork is an integrated view over these domains rather than a separate source of business truth.
