# Authorization Testing & Task API Design

## Testing Authorization
Testing a guarded endpoint requires simulating the full HTTP lifecycle while injecting specific identity claims. We authenticate as different roles (Admin vs. Student) within the same tenant by swapping the JWT provided in the Authorization header and asserting the HTTP response codes.

## The Necessity of the Negative Test
A test suite that only checks the "happy path" (e.g., an Admin successfully creating a task) proves the feature works, but it does not prove the system is secure. You must write explicit negative tests (e.g., asserting a Student receives a 403 Forbidden on the same endpoint). If a negative test fails, it means unauthorized users have breached the security perimeter.

## The Security Testing Matrix
A complete enterprise platform must validate the intersection of two security axes:
* **The Actors:** Admin vs. Student
* **The Boundaries:** Tenant A vs. Tenant B
* **The Matrix:** {Admin, Student} × {Own Tenant, Other Tenant} × {Allowed Action, Forbidden Action}

## API Design for Tasks
Tasks represent a standard RESTful resource:
* POST /tasks - Creates a new task (Restricted to Admins).
* GET /tasks - Retrieves tasks.

## Ownership Intersection (RLS + RBAC)
When querying GET /tasks:
1. **Horizontal (RLS):** The PostgreSQL engine intercepts the query and strips out any tasks belonging to Tenant B. The application never even sees them.
2. **Vertical (RBAC):** The application logic determines scope. An Admin is returned the entire remaining dataset (all Tenant A tasks). A Student is returned a dynamically filtered subset (only Tenant A tasks where ssignee_id == student_id).
