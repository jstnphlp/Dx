# Dx Permissions Model

## Purpose

This document defines the authorization model for Dx.

It answers who may perform an action, on which resource, under which relationship, and under which conditions.

It is intentionally based on the approved Dx Domain Model v1.

This document does not define business workflow, progress calculation, database schema, or UI behavior except where those concepts directly affect authorization.

---

## 1. Core Authorization Principle

Dx does not rely only on global roles.

Authorization is determined from a combination of:

```text
Actor
+
Company Role
+
Relationship to the Resource
+
Requested Action
+
Resource State
```

Example:

```text
Actor:
Nico

Company Role:
Member

Project Relationship:
Project Member

Outcome Relationship:
Outcome Participant

Requested Action:
Submit Output

Result:
Allowed, provided the Outcome is still open for contribution
```

The main authorization rule is:

> Global roles define company authority.
> Relationships define operational authority.

A person's department alone must not grant operational permissions.

A person's Project role in one Project must not automatically grant the same authority in another Project.

---

## 2. Authorization Scopes

Dx permissions operate within the following scopes:

```text
Company
Department
Project
Outcome
Execution Work
Submission and Review
Schedule
Collaboration
Activity
Audit
Reporting
```

Permissions should always be evaluated within the narrowest relevant scope.

Example:

```text
A Project Lead may manage members of Project A.

That does not mean the same Person may manage members of Project B.
```

---

## 3. Company Roles

Domain Model v1 uses a deliberately small company role model.

The initial company roles are:

```text
Admin
Member
```

More company roles should only be introduced if a real company-level responsibility cannot be represented by these roles.

---

## 4. Company Admin

A Company Admin manages company-level structure, access, and protected administrative capabilities.

An Admin may normally:

```text
View company members
Invite company members
Deactivate or remove company members
Manage company-level roles
Create and edit Departments
View company-level reporting
View security-sensitive Audit records
Manage company settings
```

Being an Admin does not automatically make the Person the Project Lead of every Project.

An Admin should not silently bypass Project workflow merely because they hold company authority.

Where emergency administrative intervention is required, the action should be explicit and auditable.

---

## 5. Company Member

A Company Member is a normal authenticated Person inside the company.

A Company Member may normally:

```text
View permitted company information
View their own profile
View their own Schedule
Edit their own availability
Participate in Projects they belong to
Participate in Outcomes they have joined or been assigned to
Use permitted Collaboration scopes
View Activity relevant to their scopes
```

A Company Member does not receive company-wide administrative capabilities by default.

---

## 6. Department Membership

Department Membership is organizational context.

It does not directly grant Project or Outcome modification rights.

Example:

```text
Nico belongs to R&D.
```

This may allow Nico to:

```text
See the R&D Department workspace
Participate in R&D Department Chat
View permitted Department Activity
```

It does not automatically allow Nico to:

```text
Edit every R&D Outcome
Join every Project involving R&D
Accept Outputs produced by R&D
Manage Project Members
```

Operational authority comes from Project and Outcome relationships.

---

## 7. Project Roles

Project authority is contextual.

Domain Model v1 defines two Project roles:

```text
Project Lead
Project Member
```

There is no Assistant Lead role.

Each Project has exactly one Project Lead.

A Person may be a Project Lead in one Project and a Project Member in another.

---

## 8. Project Lead Permissions

The Project Lead governs the Project and its expected Outcomes.

A Project Lead may normally:

```text
View the full Project
Edit Project details
Manage Project Members
Create Stages
Edit Stages
Reorder Stages
Create Outcomes
Edit Outcomes
Cancel Outcomes
Define Acceptance Criteria
Assign Responsible Departments
Add Outcome Participants
Remove Outcome Participants
Create Outcome Dependencies
Remove Outcome Dependencies
Override Outcome Dependencies
Review Output Submissions
Request revisions
Accept Output Submissions
Accept Outcomes
Pause the Project
Resume the Project
Complete the Project
Archive the Project when permitted
View Project Activity
View Project Reports
Participate in Project Chat
```

The Project Lead may also contribute directly to an Outcome when they are an Outcome Participant.

Project leadership alone should not automatically imply that every execution-level artifact is owned by the Lead.

---

## 9. Project Member Permissions

A Project Member belongs to the Project context but does not govern it.

A Project Member may normally:

```text
View the Project
View Project Stages
View Project Outcomes
View permitted Project Members
View Outcome states
View permitted Output Submissions
Participate in Project Chat
View Project Activity
Join Outcomes where self-joining is allowed
Contribute to Outcomes where they are Participants
```

A Project Member may not normally:

```text
Edit Project governance
Create or delete Project Stages
Change Project membership
Accept Outputs
Accept Outcomes
Override Dependencies
Complete the Project
Change another member's Project authority
```

---

## 10. Outcome Relationships

Outcome permissions depend on the Person's relationship to the Outcome.

Relevant relationships are:

```text
Project Lead
Project Member who is not an Outcome Participant
Outcome Participant
```

A Person may satisfy more than one relationship.

The most specific applicable permission should be used.

---

## 11. Outcome Visibility

All Project Members may normally view all Outcomes inside their Project.

This supports shared situational awareness.

A Project Member may therefore see:

```text
Outcome title
Description
Stage
State
Responsible Department
Participants
Dependencies
Acceptance Criteria
Submission status
Relevant review feedback
```

Sensitive administrative or audit-only metadata is excluded unless the Person has the necessary administrative authority.

---

## 12. Joining an Outcome

A Project Member may join an Outcome if:

```text
The Project permits self-joining

AND

The Outcome permits additional Participants

AND

The Outcome is not in a terminal state
```

Terminal states include:

```text
Accepted
Cancelled
```

Joining an Outcome adds the Person as an Outcome Participant.

Joining does not grant Project Lead permissions.

The Project Lead may add Participants directly regardless of whether self-joining is enabled.

---

## 13. Leaving an Outcome

An Outcome Participant may leave an Outcome when doing so does not violate a Project rule or leave required responsibility unresolved.

The exact business rule for mandatory participation is deferred.

Until a stronger rule exists, leaving should be permitted when:

```text
The Outcome is not Accepted

AND

The Project Lead has not explicitly locked participation
```

A Project Lead may remove a Participant.

Participant changes should appear in Activity.

Sensitive administrative intervention may also be audited.

---

## 14. Outcome Management Permissions

The Project Lead may:

```text
Create Outcome
Edit Outcome title
Edit Outcome description
Edit expected result
Edit Acceptance Criteria
Assign Responsible Department
Manage Participants
Create Dependencies
Remove Dependencies
Cancel Outcome
```

A normal Project Member may not perform these governance actions.

An Outcome Participant may suggest or discuss changes through collaboration features, but does not directly modify the Outcome definition unless separately authorized in a future model.

---

## 15. Feature Permissions

Features are execution structures inside an Outcome.

An Outcome Participant may normally:

```text
Create Features
Edit Features
Reorder Features
Archive or remove Features that are not protected by accepted history
```

The Project Lead may perform the same actions when participating in the Outcome.

The Project Lead may inspect Features even when not participating.

A Project Member who is not an Outcome Participant may view Features but may not modify them.

---

## 16. Task Permissions

Tasks may belong directly to an Outcome or to a Feature.

Outcome Participants may normally:

```text
Create Tasks
Edit Tasks
Assign Tasks to Outcome Participants
Update Task status
Complete Tasks
Reopen Tasks
Remove Tasks that are not protected by accepted history
```

A Task may only be assigned to a Person who is an Outcome Participant.

A non-participating Project Member may view Tasks but may not modify them.

Task completion does not grant acceptance authority.

---

## 17. Execution Permission Matrix

| Action | Project Lead | Project Member | Outcome Participant |
| --- | --- | --- | --- |
| View Outcome | Yes | Yes | Yes |
| Join Outcome | Yes | Conditional | Already joined |
| Add Participant | Yes | No | No |
| Remove Participant | Yes | No | Self-leave when allowed |
| Edit Outcome definition | Yes | No | No |
| Edit Acceptance Criteria | Yes | No | No |
| Create Feature | If participating | No | Yes |
| Edit Feature | If participating | No | Yes |
| Create Task | If participating | No | Yes |
| Edit Task | If participating | No | Yes |
| Complete Task | If participating | No | Yes |
| Submit Output | If participating | No | Yes |
| Review Output | Yes | No | No |
| Accept Output | Yes | No | No |
| Accept Outcome | Yes | No | No |
| Override Dependency | Yes | No | No |

Project Lead refers to Project governance authority.

Execution permissions still depend on whether the Lead is participating where appropriate.

---

## 18. Output Submission Permissions

Only Outcome Participants may normally create an Output Submission.

A submission may begin as Draft.

The creator and other Outcome Participants may edit the Draft before submission.

Once the submission enters For Review:

```text
Participants may no longer silently rewrite that submitted version.
```

Changes should instead produce a new version when revision is required.

A Project Member who is not participating may view permitted submissions but may not create or modify them.

---

## 19. Submission Review Permissions

Only the Project Lead performs final review decisions in Domain Model v1.

The Project Lead may:

```text
Review Acceptance Criteria
Record review notes
Request Revision
Accept Output Submission
Accept Outcome
```

The Project Lead should not be able to accept an Outcome without satisfying the required review rules established by the domain.

The authorization model permits the action.

The domain model determines whether the Outcome is eligible for that action.

---

## 20. Submission State Restrictions

Submission permissions depend on state.

### Draft

Outcome Participants may edit the Draft.

### For Review

Outcome Participants may view the submitted version.

They may not rewrite the submitted version in place.

The Project Lead may review it.

### Needs Revision

Outcome Participants may create the next revised submission.

The Project Lead may view revision progress but should not directly author the Participant's submission unless the Lead is also an Outcome Participant.

### Accepted

The accepted submission becomes historical Project evidence.

Normal mutation should stop.

Any exceptional modification should require a deliberate reopening or administrative process.

---

## 21. Outcome State Restrictions

Permissions are affected by Outcome state.

### Planned

Project Lead may manage governance.

Participants may organize execution if participation is already established.

### In Progress

Participants may modify execution work and create submissions.

### Blocked

Participants may still inspect and prepare permitted work.

Actions that violate the blocking Dependency must not proceed.

### For Review

Execution changes should not mutate the submitted version under review.

### Needs Revision

Participants may resume execution and create a revised submission.

### Accepted

Normal execution modification stops.

Accepted evidence becomes historical.

### Cancelled

Normal execution modification stops.

The Outcome remains visible as Project history.

---

## 22. Dependency Permissions

The Project Lead may:

```text
Create Outcome Dependencies
Remove Outcome Dependencies
Override Outcome Dependencies
```

Project Members and Outcome Participants may view Dependencies.

They may not independently bypass them.

A Dependency Override requires:

```text
Project Lead authority
Reason
Timestamp
Actor
Affected Dependency
```

The override should produce an Activity Event.

It should also produce an Audit Event when appropriate because it changes a governance constraint.

---

## 23. Project Membership Permissions

The Project Lead may normally:

```text
Add Project Members
Remove Project Members
View Project membership
```

A Project Member may view other Project Members where normal collaboration requires it.

A Project Member may not add or remove Project Members.

A Company Admin may intervene in membership for administrative reasons, but administrative intervention should be explicit and auditable rather than silently impersonating Project Lead authority.

---

## 24. Project Lifecycle Permissions

Only the Project Lead may normally:

```text
Move Project from Planning to Active
Pause Project
Resume Project
Complete Project
Archive Project when eligible
```

Company Admins may perform administrative recovery actions if necessary.

Such intervention should be recorded in Audit.

Project Members may view lifecycle state but may not change it.

---

## 25. Archived Project Restrictions

Archived Projects are effectively read-only for normal users.

Project Members may continue to view permitted historical Project information.

Normal creation, editing, joining, submission, and execution actions should be disabled.

Administrative restoration may be allowed to Company Admins if a future recovery workflow requires it.

---

## 26. Schedule Permissions

Schedule is Person-owned by default.

A Company Member may normally:

```text
View own availability
Edit own availability
View own Planned Work Blocks
Edit own Planned Work Blocks
View own Actual Work Sessions
Start or end own work session where Time In / Out exists
```

A Company Member may not normally:

```text
Edit another Person's availability
Edit another Person's Planned Work Blocks
Edit another Person's Actual Work Sessions
```

---

## 27. Team Schedule Visibility

Company Members may view team availability and planned work blocks when needed for coordination.

The default visibility should expose operational scheduling information rather than private personal data.

Examples of permitted information:

```text
Available
Scheduled
Working
Unavailable
```

Sensitive notes or personal details should not be exposed merely because schedule visibility exists.

---

## 28. Schedule Administrative Access

A Company Admin may view company-wide Schedule information.

Whether an Admin may modify another Person's Schedule should remain restricted.

Administrative edits should only be introduced for a real operational need.

If such authority is introduced, it must be explicit and auditable.

---

## 29. Actual Work Session Integrity

Actual Work Sessions represent recorded work history.

Users may create and end their own current sessions.

Historical work-session editing should be more restricted than normal schedule editing.

A user should not casually rewrite historical time records.

Any future correction workflow should preserve:

```text
Original value
Corrected value
Who made the correction
Reason
Timestamp
```

---

## 30. Collaboration Permissions

Collaboration is scoped by context.

Domain Model v1 supports:

```text
Company Chat
Department Chat
Project Chat
```

### Company Chat

Accessible to active Company Members.

### Department Chat

Accessible to active members of that Department.

### Project Chat

Accessible to Project Members of that Project.

A user who leaves a Project or Department may retain access to historical content only if the company's retention policy permits it.

The default should remove ongoing posting authority when the relationship ends.

---

## 31. Chat Moderation

Normal Company Members may send messages within scopes they belong to.

Users may edit or remove their own recent messages if the product chooses to support message editing.

Company Admin moderation authority may be introduced if required.

Project Lead status alone does not automatically make someone a company-wide chat moderator.

---

## 32. Activity Permissions

Activity is visible based on the scope of the underlying resource.

Examples:

```text
Company Activity
-> visible according to company-level visibility

Department Activity
-> visible to members of the Department

Project Activity
-> visible to Project Members

Outcome Activity
-> visible to Project Members who can view the Outcome
```

Activity must not be used to leak data the user could not otherwise access.

---

## 33. Audit Permissions

Audit is more restricted than Activity.

The default Audit audience is:

```text
Company Admin
```

Normal Company Members do not receive access to security-sensitive Audit history.

Project Leads may see Project Activity.

They do not automatically receive raw company Audit access.

Future compliance requirements may introduce narrower delegated Audit permissions.

---

## 34. Reporting Permissions

Reports inherit authorization from the data they summarize.

Examples:

```text
Project Member
-> may view permitted Project reporting

Project Lead
-> may view Project leadership reporting

Company Admin
-> may view company-wide reporting
```

A Report must not expose records that the user could not access through the underlying domains.

Reporting is not a permission bypass.

---

## 35. Own Versus Other People's Data

Dx must explicitly distinguish self-owned information from information owned by another Person.

Examples:

```text
Profile
Schedule
Actual Work Sessions
Personal settings
```

A Company Member may normally manage their own records.

Managing another Person's records requires explicit administrative authority.

---

## 36. Permission Inheritance

Permissions should not cascade broadly merely because objects are related.

Examples:

```text
Department membership
does not imply
Project membership
```

```text
Project membership
does not imply
Outcome participation
```

```text
Outcome participation
does not imply
Project leadership
```

```text
Company Admin
does not automatically imply
Outcome authorship
```

Each relationship has its own meaning.

---

## 37. Permission Precedence

Authorization should follow the principle of explicit capability rather than accumulating vague authority.

When multiple relationships apply:

```text
1. Determine whether the actor may view the resource.
2. Determine the actor's relationship to the resource.
3. Determine whether the requested action is allowed by that relationship.
4. Apply resource-state restrictions.
5. Apply explicit governance restrictions.
6. Deny by default if no rule allows the action.
```

The default result for an undefined permission is:

```text
Denied
```

---

## 38. Administrative Intervention

Company Admins may require emergency or recovery capabilities.

Administrative intervention should not be modeled as invisible universal ownership.

Instead, privileged actions should be explicit.

Examples:

```text
Remove a deactivated user from a Project
Correct broken access
Restore access after an account issue
Resolve a corrupted ownership relationship
```

Administrative intervention should be audited.

---

## 39. Permission Checks and UI

The UI may hide controls that the current user cannot use.

This improves clarity.

UI visibility is not a security boundary.

Every protected mutation and protected data request must enforce authorization at a trusted boundary.

The intended layered model is:

```text
UI capability check
        |
        v
Application authorization check
        |
        v
Database Row Level Security
```

---

## 40. Row Level Security Guidance

PostgreSQL Row Level Security should enforce the final data-access boundary for data exposed through Supabase.

RLS rules should be based on stable relationships such as:

```text
Current user identity
Company membership
Department membership
Project membership
Project Lead relationship
Outcome participation
Record ownership
```

Avoid encoding large amounts of volatile UI state inside RLS.

Business eligibility and authorization are related but separate.

Example:

```text
RLS may confirm that Rex is allowed to update an Outcome.

Domain logic must still determine whether that Outcome can transition to Accepted.
```

---

## 41. Permission Queries

Authorization logic should use canonical permission helpers rather than duplicating role checks throughout the UI.

Conceptually:

```text
canViewProject(actor, project)
canManageProject(actor, project)
canJoinOutcome(actor, outcome)
canContributeToOutcome(actor, outcome)
canSubmitOutput(actor, outcome)
canReviewOutcome(actor, outcome)
canOverrideDependency(actor, dependency)
canEditSchedule(actor, person)
canViewAudit(actor)
```

These names are conceptual.

The implementation shape may differ.

The important rule is that permission policy should have a clear canonical source of truth.

---

## 42. Permission Matrix Summary

| Capability | Admin | Project Lead | Project Member | Outcome Participant |
| --- | --- | --- | --- | --- |
| Manage company members | Yes | No | No | No |
| Manage Departments | Yes | No | No | No |
| View Project | If permitted/admin context | Yes | Yes | Yes |
| Manage Project details | Administrative only | Yes | No | No |
| Manage Project Members | Administrative only | Yes | No | No |
| Create Stage | No by default | Yes | No | No |
| Create Outcome | No by default | Yes | No | No |
| Edit Acceptance Criteria | No by default | Yes | No | No |
| Join Outcome | Same as member when in Project | Yes | Conditional | Already participating |
| Add Outcome Participant | Administrative only | Yes | No | No |
| Create Feature | Only if participating | If participating | No | Yes |
| Create Task | Only if participating | If participating | No | Yes |
| Submit Output | Only if participating | If participating | No | Yes |
| Review Output | No by default | Yes | No | No |
| Accept Outcome | No by default | Yes | No | No |
| Override Dependency | Administrative recovery only | Yes | No | No |
| Edit own Schedule | Yes | Yes | Yes | Yes |
| Edit another Schedule | Restricted | No | No | No |
| View Project Activity | If permitted | Yes | Yes | Yes |
| View Audit | Yes | No by default | No | No |
| View company reports | Yes | No by default | No by default | No by default |

Admin authority is primarily company-level.

Project Lead authority is primarily Project-level.

Outcome Participant authority is primarily execution-level.

---

## 43. State-Based Authorization Summary

| Resource State | Normal Contributor Behavior |
| --- | --- |
| Planned | May prepare work when allowed |
| In Progress | Full permitted execution |
| Blocked | View and prepare, but blocked actions cannot proceed |
| For Review | Submitted version is frozen for review |
| Needs Revision | Contributors may resume work and submit a new version |
| Accepted | Normal execution becomes read-only |
| Cancelled | Read-only historical state |
| Project Archived | Project becomes read-only for normal users |

---

## 44. Actions That Must Be Audited

At minimum, the following authorization-sensitive actions should create Audit records:

```text
Company role changes
Member activation or deactivation
Department administrative changes when sensitive
Project leadership changes
Administrative Project membership intervention
Dependency Overrides
Permission changes
Historical work-session corrections
Administrative data recovery
Access-control changes
```

Normal collaboration actions should usually create Activity rather than security Audit records.

---

## 45. Actions That Should Produce Activity

Examples include:

```text
Project created
Member joined Project
Outcome created
Participant joined Outcome
Feature created
Output submitted
Revision requested
Output accepted
Outcome accepted
Dependency overridden
Project paused
Project completed
```

Activity visibility follows the scope of the related resource.

---

## 46. Explicit Non-Permissions

The following assumptions are explicitly rejected.

```text
Department = permission role
```

```text
Company Admin = automatic Project Lead
```

```text
Project Member = automatic Outcome Participant
```

```text
Outcome Participant = allowed to accept their own Outcome
```

```text
Task assignee = allowed to modify Outcome governance
```

```text
Project Lead = company-wide administrator
```

```text
Report access = unrestricted access to source data
```

These distinctions should remain visible in both implementation and testing.

---

## 47. Deferred Permission Decisions

The following decisions are intentionally deferred.

### Additional Company Roles

Roles such as Manager, HR, Finance, or Department Lead should only be introduced when the company workflow requires them.

### Primary Outcome Owner

Domain Model v1 does not require a Primary Owner.

If one is introduced, its authority must be explicitly defined rather than assumed.

### Delegated Reviewers

Only the Project Lead accepts Outcomes in v1.

Delegated reviewer permissions may be added later.

### Department Lead

There is currently no Department Lead authorization role.

Department membership remains organizational.

### Cross-Project Visibility

The exact amount of visibility a normal Company Member has into Projects they do not belong to remains a product decision.

The safe default is that detailed Project data requires Project Membership or company administrative authority.

### Admin Schedule Editing

Admin editing of another Person's Schedule is intentionally not granted by default.

### Message Moderation

Advanced moderation and retention permissions are deferred.

### Historical Data Correction

Correction workflows for accepted work and historical time records require explicit designs before mutation permissions are granted.

---

## 48. Testing Requirements

Authorization should be tested as a matrix.

Important test dimensions include:

```text
Company Admin
Company Member
Project Lead
Project Member
Outcome Participant
Non-participant
Former member
Inactive user
```

Tests should verify both allowed and denied behavior.

High-risk tests should include:

```text
A Project Member cannot accept an Outcome
An Outcome Participant cannot override a Dependency
A member cannot edit another person's Schedule
A non-Project user cannot read private Project data
A Project Lead cannot manage another Project
A Department member does not automatically gain Project access
An Accepted Outcome cannot be normally modified
An Archived Project is read-only
A normal user cannot access Audit records
Reports do not expose unauthorized data
```

Authorization behavior should be tested at the trusted data or application boundary, not only through hidden UI controls.

Critical flows should also receive end-to-end coverage.

---

## 49. Canonical Authorization Questions

When implementing a new feature, answer these questions before writing the mutation.

```text
Who is the actor?

What company relationship do they have?

What Project relationship do they have?

What Outcome relationship do they have?

What resource are they acting on?

What action are they requesting?

What state is the resource in?

Does the action affect only their own data or someone else's?

Does the action require governance authority?

Does it require an Audit record?

What RLS rule ultimately protects the data?
```

If these questions do not have clear answers, the permission rule is not ready to implement.

---

## 50. Summary

Dx uses contextual authorization.

Company roles define company-level authority.

Project relationships define Project authority.

Outcome participation defines execution authority.

Departments provide organizational context but do not act as permission roles.

The Project Lead governs expected results, membership, dependencies, review, acceptance, and Project lifecycle.

Outcome Participants govern the execution work necessary to produce those results.

Normal Project Members have visibility and collaboration rights without receiving governance or execution authority automatically.

Schedule data is self-owned by default.

Collaboration follows Company, Department, and Project scopes.

Activity is visible operational history.

Audit is restricted accountability history.

Reporting inherits the permissions of its underlying data.

Undefined permissions are denied by default.

UI capability checks improve usability, but trusted application authorization and PostgreSQL Row Level Security remain the actual security boundaries.
