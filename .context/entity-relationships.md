# Dx Entity Relationships

## Purpose

This document defines the approved conceptual Entity Relationship Model v1 for Dx.

It translates the approved Domain Model and Permissions Model into concrete entities, ownership boundaries, cardinalities, and integrity rules.

This document does not yet define SQL types, migrations, indexes, RLS policies, or physical database implementation details.

Those should be derived from this model.

---

## 1. Logical Root

Dx currently operates within one logical Company.

Conceptually:

```text
Company
├── People
├── Departments
├── Projects
├── Collaboration
└── Activity
```

Multi-company tenancy is intentionally deferred.

The Company is therefore a logical product boundary in v1 and does not need to appear as a foreign key on every entity unless the database design later introduces a concrete Company table.

---

## 2. Person and Department

A Person may belong to zero or one primary Department.

A Department may contain zero or many People.

```text
Department
    1
    │
    │
   0..N
 Person
```

From the Person side:

```text
Person
  0..1
    │
 Department
```

A Person may temporarily have no Department, such as during onboarding or transition.

Multi-department membership is not part of Entity Relationship Model v1.

Cross-department collaboration happens through Projects and Outcomes rather than through multi-department Person membership.

---

## 3. Person and Project

People and Projects have a many-to-many relationship through Project Membership.

```text
Person
   N
   │
Project Membership
   │
   N
Project
```

A Project Membership records the Person's contextual role in the Project.

Allowed Project roles in v1 are:

```text
lead
member
```

Every Project must have exactly one active Project Lead.

Project Membership is the canonical source of truth for Project role.

The Project entity should not independently store a second Project Lead reference that could conflict with Project Membership.

---

## 4. Project and Department

Projects and Departments have a many-to-many relationship.

```text
Project
   N
   │
Project Department
   │
   N
Department
```

A Project may involve zero or many Departments during early planning.

A Department may participate in many Projects.

Project Department participation is organizational context.

Actual work is still performed by People through Project Membership and Outcome Participation.

---

## 5. Project and Stage

A Project has one or many Stages once planning begins.

A Stage belongs to exactly one Project.

```text
Project
   1
   │
   N
Stage
```

A Stage should include an explicit ordering value.

Conceptually:

```text
Stage
├── project
├── name
└── position
```

Stage names are Project-specific.

There is no global Stage catalog in v1.

---

## 6. Stage and Outcome

A Stage contains zero or many Outcomes.

An Outcome belongs to exactly one Stage.

```text
Stage
   1
   │
  0..N
Outcome
```

An Outcome does not exist outside a Stage.

Moving an Outcome between Stages changes its Stage relationship rather than recreating the Outcome.

Because every Stage belongs to one Project, every Outcome also belongs to exactly one Project indirectly through its Stage.

---

## 7. Outcome and Responsible Department

An Outcome may have zero or one Responsible Department.

A Department may be responsible for many Outcomes.

```text
Department
    1
    │
   0..N
 Outcome
```

From the Outcome side:

```text
Outcome
  0..1
    │
Responsible Department
```

Zero is allowed during early planning.

One Responsible Department is the maximum in v1.

Collaboration across multiple Departments should occur through Outcome Participants rather than multiple Responsible Department relationships.

---

## 8. Outcome Participants

People and Outcomes have a many-to-many relationship through Outcome Participation.

```text
Person
   N
   │
Outcome Participant
   │
   N
Outcome
```

An Outcome Participant must also be a Project Member of the Outcome's Project.

Outcome Participation may later record supporting metadata such as:

```text
joined_at
joined_by
participation_source
```

Possible participation sources include:

```text
assigned
self_joined
```

These values are implementation details and may be finalized during schema design.

---

## 9. Outcome and Acceptance Criterion

An Outcome has zero or many Acceptance Criteria during planning.

Before final acceptance, the Outcome must have sufficiently defined Acceptance Criteria.

Each Acceptance Criterion belongs to exactly one Outcome.

```text
Outcome
   1
   │
  0..N
Acceptance Criterion
```

Acceptance Criteria should support explicit ordering.

Conceptually:

```text
Acceptance Criterion
├── outcome
├── description
└── position
```

---

## 10. Outcome and Feature

Features are optional subdivisions of an Outcome.

An Outcome may have zero or many Features.

A Feature belongs to exactly one Outcome.

```text
Outcome
   1
   │
  0..N
Feature
```

A Feature cannot be shared across Outcomes.

---

## 11. Outcome, Feature, and Task

Every Task belongs to exactly one Outcome.

A Task may optionally belong to one Feature.

```text
Outcome
   │
   ├──────── Task
   │
   └── Feature
          │
          └── Task
```

Conceptually:

```text
Task
├── outcome REQUIRED
└── feature OPTIONAL
```

If a Task references a Feature, that Feature must belong to the same Outcome.

The direct Outcome relationship remains canonical even when the Task also belongs to a Feature.

This keeps Outcome-level Task queries simple and explicit.

---

## 12. Task Assignee

A Task may have zero or one assignee.

The assignee must be a Person who is already an Outcome Participant.

```text
Task
   │
  0..1
   │
Person
```

A Person does not become assignable to a Task merely by belonging to the Company or Department.

They must be an Outcome Participant.

---

## 13. Outcome and Output Submission

An Outcome may receive many Output Submissions over time.

An Output Submission belongs to exactly one Outcome.

```text
Outcome
   1
   │
  0..N
Output Submission
```

Submissions are versioned.

Example:

```text
Outcome
├── Submission v1
├── Submission v2
└── Submission v3
```

A formally submitted version becomes immutable.

A revision creates a new Submission rather than overwriting the previous one.

---

## 14. Submission Versioning

Submission version numbers are unique within an Outcome.

Example:

```text
Outcome A
├── v1
├── v2
└── v3

Outcome B
├── v1
└── v2
```

The conceptual uniqueness rule is:

```text
(outcome, version)
```

Submission versioning is scoped to the Outcome rather than globally across the system.

---

## 15. Submission Author

Every Output Submission has exactly one submitting Person.

A Person may submit many Output Submissions.

```text
Person
   1
   │
   N
Output Submission
```

The submitting Person must be an Outcome Participant of the related Outcome.

Multiple People may contribute to the work, but one Person performs the submission action.

---

## 16. Submission Artifact

An Output Submission may contain zero or many Submission Artifacts.

Each Submission Artifact belongs to exactly one Output Submission.

```text
Output Submission
       1
       │
      0..N
Submission Artifact
```

A Submission Artifact may represent a deliverable such as:

```text
Uploaded file
External URL
Repository reference
Figma link
Deployment URL
Document
```

Artifact type should be modeled as a property of one Submission Artifact concept rather than separate submission systems for each deliverable type.

---

## 17. Output Submission and Review

A formally reviewed Submission has zero or one final Review decision.

```text
Output Submission
       1
       │
      0..1
     Review
```

A Review belongs to exactly one Output Submission.

The v1 final review decisions are:

```text
Needs Revision
Accepted
```

A revision does not create multiple final Reviews for the same Submission.

Instead:

```text
Submission v1
    ↓
Needs Revision

Submission v2
    ↓
Reviewed separately
```

This preserves review history through immutable Submission versions.

---

## 18. Review and Acceptance Criterion Verification

A Review may verify many Acceptance Criteria.

Each Criterion Verification belongs to exactly one Review and refers to exactly one Acceptance Criterion.

```text
Review
   1
   │
   N
Criterion Verification
   N
   │
   1
Acceptance Criterion
```

This relationship preserves which criteria were checked during a particular review.

Example:

```text
Review of Auth Submission v2

✓ Login works
✓ Invalid credentials handled
✓ Session persists
✗ Password reset works
```

Historical Criterion Verification should remain stable even if Acceptance Criteria later evolve.

---

## 19. Outcome Dependencies

Outcomes have a self-referencing many-to-many relationship through Outcome Dependency.

```text
Outcome
   N
   │
Outcome Dependency
   │
   N
Outcome
```

Each Outcome Dependency contains two distinct Outcome roles:

```text
Outcome Dependency
├── prerequisite_outcome
└── dependent_outcome
```

The prerequisite Outcome must be satisfied before the dependent Outcome proceeds unless an override exists.

---

## 20. Dependency Scope

Dependencies may cross Stage boundaries.

Dependencies may not cross Project boundaries in v1.

Valid:

```text
Project A
Stage 2 Outcome
      ↓
Stage 3 Outcome
```

Invalid:

```text
Project A Outcome
      ↓
Project B Outcome
```

Both Outcomes in a Dependency must belong to the same Project.

---

## 21. Dependency Cycles

Dependency cycles are prohibited.

Invalid example:

```text
A depends on B
B depends on C
C depends on A
```

Cycle detection is a domain invariant.

The database and application layer should preserve this rule during implementation.

---

## 22. Dependency Override

An Outcome Dependency may have zero or one active Dependency Override.

```text
Outcome Dependency
       1
       │
      0..1
Dependency Override
```

A Dependency Override records an explicit Project Lead decision to continue despite an unresolved Dependency.

Conceptually:

```text
Dependency Override
├── dependency
├── actor
├── reason
└── created_at
```

Creating an Override does not delete the original Dependency.

The Dependency remains visible as part of Project history.

---

## 23. Conversation

Dx uses one Conversation concept for supported chat scopes.

A Conversation belongs to exactly one allowed scope.

Supported scopes in v1 are:

```text
Company
Department
Project
```

Conceptually:

```text
Conversation
├── scope_type
└── scope
```

There is no Outcome Chat scope in v1.

---

## 24. Conversation and Message

A Conversation contains zero or many Messages.

A Message belongs to exactly one Conversation.

```text
Conversation
    1
    │
   0..N
Message
```

Every Message has exactly one authoring Person.

```text
Person
   1
   │
   N
Message
```

Conversation visibility is determined by the scope relationship defined in the Permissions Model.

---

## 25. Project Conversation

Each Project has at most one canonical Project Conversation in v1.

```text
Project
   1
   │
  0..1
Conversation
```

The Conversation should be created when Project Chat is initialized.

Project Chat does not create separate chat systems per Stage or Outcome.

---

## 26. Department Conversation

Each Department has at most one canonical Department Conversation in v1.

```text
Department
    1
    │
   0..1
Conversation
```

Department Chat access follows active Department membership.

---

## 27. Company Conversation

The Company may have one canonical Company Conversation.

Because the v1 product has one logical Company, this relationship can be represented without introducing unnecessary multi-company infrastructure.

---

## 28. Activity Event

Activity Events record meaningful user-visible operational history.

Activity is append-only.

Conceptually:

```text
Activity Event
├── actor
├── action
├── project OPTIONAL
├── entity_type
├── entity_id
├── metadata
└── created_at
```

Activity may refer to different entity types such as:

```text
Project
Project Membership
Outcome
Outcome Participation
Submission
Dependency
```

Generic entity references are acceptable here because Activity intentionally records history across domains.

Deleting or archiving a domain object should not automatically erase its historical Activity.

---

## 29. Audit Event

Audit Events record security-sensitive and accountability history.

Audit is append-only and remains separate from Activity.

Conceptually:

```text
Audit Event
├── actor
├── action
├── resource_type
├── resource_id
├── before_state OPTIONAL
├── after_state OPTIONAL
├── metadata
└── created_at
```

Generic resource references are appropriate because Audit records may need to outlive mutable business entities.

---

## 30. Schedule Entities

Schedule is modeled using three separate concepts:

```text
Person
├── Availability Window
├── Planned Work Block
└── Actual Work Session
```

These entities remain independent from Project work in v1.

---

## 31. Availability Window

A Person may have many Availability Windows.

Each Availability Window belongs to exactly one Person.

```text
Person
   1
   │
   N
Availability Window
```

Availability describes expected or recurring working availability.

It does not prove that work occurred.

---

## 32. Planned Work Block

A Person may have many Planned Work Blocks.

Each Planned Work Block belongs to exactly one Person.

```text
Person
   1
   │
   N
Planned Work Block
```

Planned Work Blocks represent scheduled work periods for specific dates or time ranges.

---

## 33. Actual Work Session

A Person may have many Actual Work Sessions.

Each Actual Work Session belongs to exactly one Person.

```text
Person
   1
   │
   N
Actual Work Session
```

Actual Work Sessions represent recorded working time.

Planned Work Blocks and Actual Work Sessions remain separate to preserve planned-versus-actual comparison.

---

## 34. Schedule and Project Separation

Schedule records do not directly belong to Projects in v1.

The following relationships are intentionally excluded for now:

```text
work_session.project
task.schedule
project_schedule
```

Schedule answers:

```text
When is this Person available or working?
```

Projects answer:

```text
What is this Person responsible for?
```

A future requirement may connect these domains if Project-specific time allocation becomes necessary.

---

## 35. Reporting

Reporting owns no transactional business entity in v1.

Reporting reads canonical operational entities.

Conceptually:

```text
Operational Entities
        ↓
Queries / Views
        ↓
Reporting
```

Future database Views, Materialized Views, or summary structures may be introduced when reporting complexity or performance justifies them.

---

## 36. Conceptual ERD

```text
                           Department
                           │        │
                           │        └──── Project Department ──── Project
                           │                                      │
                           ▼                                      │
                         Person                                   │
                           │                                      │
              ┌────────────┼───────────────┐                      │
              │            │               │                      │
              ▼            ▼               ▼                      ▼
        Availability   Work Session   Project Membership ───── Project
              │                            │                       │
              │                            │                       ▼
              │                            │                     Stage
              │                            │                       │
              │                            │                       ▼
              │                            └───────────────►    Outcome
              │                                                    │
              │             ┌─────────────────┬────────────────────┼────────────────────┐
              │             │                 │                    │                    │
              │             ▼                 ▼                    ▼                    ▼
              │      Outcome Participant  Acceptance Criterion   Feature         Output Submission
              │                                                    │                    │
              │                                                    ▼                    ▼
              │                                                   Task         Submission Artifact
              │                                                                         │
              │                                                                         ▼
              │                                                                       Review
              │                                                                         │
              │                                                                         ▼
              │                                                           Criterion Verification
              │
              └── Planned Work Block


Outcome ───────────── Outcome Dependency ───────────── Outcome
                              │
                              ▼
                    Dependency Override


Company / Department / Project
             │
             ▼
       Conversation
             │
             ▼
          Message


Relevant Domains
      │
      ├── Activity Event
      └── Audit Event
```

---

## 37. Cardinality Summary

| Relationship | Cardinality |
| --- | --- |
| Department -> Person | 1 to 0..N |
| Person -> Department | 0..1 |
| Person <-> Project | N to N through Project Membership |
| Project <-> Department | N to N through Project Department |
| Project -> Stage | 1 to N |
| Stage -> Outcome | 1 to 0..N |
| Outcome -> Responsible Department | 0..1 |
| Person <-> Outcome | N to N through Outcome Participant |
| Outcome -> Acceptance Criterion | 1 to 0..N |
| Outcome -> Feature | 1 to 0..N |
| Outcome -> Task | 1 to 0..N |
| Feature -> Task | 1 to 0..N |
| Task -> Person assignee | 0..1 |
| Outcome -> Output Submission | 1 to 0..N |
| Output Submission -> Submission Artifact | 1 to 0..N |
| Output Submission -> Review | 1 to 0..1 |
| Review -> Criterion Verification | 1 to 0..N |
| Acceptance Criterion -> Criterion Verification | 1 to 0..N |
| Outcome <-> Outcome | N to N through Outcome Dependency |
| Outcome Dependency -> Dependency Override | 1 to 0..1 |
| Conversation -> Message | 1 to 0..N |
| Person -> Message | 1 to 0..N |
| Person -> Availability Window | 1 to 0..N |
| Person -> Planned Work Block | 1 to 0..N |
| Person -> Actual Work Session | 1 to 0..N |

---

## 38. Integrity Rules

The following rules are part of Entity Relationship Model v1.

1. Every Project has exactly one active Project Lead.
2. A Person cannot have duplicate active membership in the same Project.
3. Project Membership is the canonical Project role relationship.
4. An Outcome belongs to exactly one Stage.
5. Every Stage belongs to exactly one Project.
6. An Outcome therefore belongs to exactly one Project through its Stage.
7. An Outcome may have at most one Responsible Department.
8. An Outcome Participant must also be a Project Member.
9. A Feature belongs to exactly one Outcome.
10. A Task always belongs to exactly one Outcome.
11. A Task may optionally belong to one Feature.
12. A Task's Feature must belong to the Task's Outcome.
13. A Task assignee must be an Outcome Participant.
14. An Output Submission belongs to exactly one Outcome.
15. An Output Submission author must be an Outcome Participant.
16. Submission versions are unique within an Outcome.
17. A formally submitted Submission version is immutable.
18. A Submission Artifact belongs to exactly one Output Submission.
19. A Review belongs to exactly one Output Submission.
20. A Submission has at most one final Review decision.
21. A Criterion Verification belongs to exactly one Review.
22. A Criterion Verification refers to one Acceptance Criterion from the reviewed Outcome.
23. An Outcome Dependency connects two different Outcomes.
24. Both Outcomes in a Dependency must belong to the same Project.
25. Dependency cycles are prohibited.
26. A Dependency Override does not delete the original Dependency.
27. Project Membership and Department membership remain separate concepts.
28. Accepted or Cancelled Outcomes do not accept normal execution mutations.
29. Conversations are scoped only to Company, Department, or Project in v1.
30. Schedule records remain Person-owned and independent from Project execution records.
31. Activity Events are append-only.
32. Audit Events are append-only.
33. Reporting does not become a second source of transactional truth.

---

## 39. Deletion and Historical Integrity Principles

Physical deletion behavior is not yet finalized, but the following principles should guide the database schema.

Historical evidence should not disappear merely because a parent object becomes inactive.

Examples include:

```text
Accepted Output Submissions
Reviews
Criterion Verifications
Dependency Overrides
Activity Events
Audit Events
Historical Work Sessions
```

Where historical integrity matters, prefer archival or status transitions over destructive deletion.

Deletion behavior should be decided explicitly during database schema design.

---

## 40. Canonical Entity List

The current conceptual entity set is:

```text
Person
Department

Project
Project Membership
Project Department
Stage

Outcome
Outcome Participant
Acceptance Criterion
Feature
Task

Output Submission
Submission Artifact
Review
Criterion Verification

Outcome Dependency
Dependency Override

Conversation
Message

Availability Window
Planned Work Block
Actual Work Session

Activity Event
Audit Event
```

Reporting currently adds no transactional entity.

Company is a logical root and may become a concrete entity only if future tenancy or company-level configuration requires it.

---

## 41. Intentionally Deferred Relationship Decisions

The following are deliberately not part of Entity Relationship Model v1.

### Multi-Department Person Membership

A Person has at most one primary Department in v1.

### Cross-Project Dependencies

Outcome Dependencies cannot cross Project boundaries.

### Outcome-Level Chat

There is no Outcome Conversation scope.

### Project-Specific Work Sessions

Actual Work Sessions do not directly reference Projects or Tasks.

### Primary Outcome Owner

Outcome Participation supports multiple Participants without requiring one Primary Owner.

### Delegated Reviewers

Review authority remains with the Project Lead.

### Multi-Company Tenancy

The system assumes one logical Company.

### Advanced Reporting Entities

Reporting-specific transactional or warehouse entities are deferred.

---

## 42. Next Step

The Entity Relationship Model is now defined conceptually.

The next architecture artifact should be the PostgreSQL database schema plan.

That document should derive concrete tables from this model and define:

```text
Primary keys
Foreign keys
Unique constraints
Check constraints
State enums
Ordering columns
Nullability
Indexes
Deletion behavior
Archival behavior
RLS-relevant relationships
Audit requirements
Migration strategy
```

The database schema must preserve the relationships and invariants defined here rather than redefining the domain around SQL convenience.

---

## Summary

Dx uses a relationship model centered on Projects, Stages, and Outcomes.

People join Projects through Project Membership.

Departments provide organizational context.

Stages contain Outcomes.

People participate in Outcomes through Outcome Participation.

Acceptance Criteria define expected results.

Features and Tasks organize execution.

Output Submissions provide immutable, versioned evidence.

Reviews evaluate individual Submission versions against Acceptance Criteria.

Outcome Dependencies represent execution constraints and may be explicitly overridden without erasing history.

Collaboration uses one Conversation model scoped to Company, Department, or Project.

Schedule remains Person-owned and independent from Project execution.

Activity and Audit are append-only historical systems.

Reporting reads from canonical operational entities rather than becoming another source of truth.
