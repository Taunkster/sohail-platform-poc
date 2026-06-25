# Role-Based Access Control (RBAC) & Authorization

## Authentication vs Authorization
* **Authentication (AuthN):** Answers "Who are you?" It verifies identity. A JWT proves the user successfully logged in.
* **Authorization (AuthZ):** Answers "What are you allowed to do?" It verifies permissions. Just because a user has a valid JWT does not mean they have the right to modify system state. 
* A JWT handles AuthN by existing and being cryptographically valid. It aids AuthZ by carrying immutable claims (like a role) that the server trusts.

## RBAC and Tenant Isolation: A Two-Dimensional Matrix
Tenant isolation (RLS) and RBAC are completely independent layers. 
* **RLS (The Horizontal Axis):** Ensures data boundaries. An admin in Tenant A cannot see Tenant B's data.
* **RBAC (The Vertical Axis):** Ensures capability boundaries. A student in Tenant A cannot create new tasks, even within their own tenant.
Both are required. RLS prevents data leakage; RBAC prevents privilege escalation.

## NestJS Authorization Mechanics
* **Guards (CanActivate):** Intercept requests before they hit the controller. They return a boolean: 	rue lets the request through, alse throws a 403 Forbidden.
* **Custom Decorators (@Roles('admin')):** Attach metadata to specific route handlers. 
* **Reflector:** A NestJS utility used inside the Guard to read the metadata attached by the @Roles decorator and compare it against the user's role.

## JWT Payload Structure
Role information should live inside the JWT payload (e.g., {"sub": "123", "tenant_id": "tenant_a", "role": "admin"}). Because the JWT is cryptographically signed by the server, the user cannot tamper with their role claim without invalidating the signature. This allows stateless authorization without needing to query the database for user roles on every request.

## Why Not Controller-Level Enforcement?
If role checks are written directly into the controller body (e.g., if (user.role !== 'admin') throw Error), the architecture breaks down:
1. **DRY Violation:** The logic must be repeated in every endpoint.
2. **Poor Auditability:** Security rules are hidden in business logic rather than explicitly declared at the route level.
3. **Testing Friction:** You cannot isolate and test the security layer separately from the business logic.
