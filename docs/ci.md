# Continuous Integration (CI) & Pipeline Architecture

## The Role of Continuous Integration
Continuous Integration (CI) is the practice of automatically building and testing code every time a change is pushed to a shared repository. In the context of Sohail's multi-tenant platform, CI exists to catch regressions early, ensuring that no code is merged unless it mathematically proves that tenant isolation and database security hold intact. Relying on "it passes on my machine" is an anti-pattern; CI provides an immutable, centralized engineering guarantee.

## Anatomy of the GitHub Actions Workflow
Our CI pipeline is orchestrated via GitHub Actions and is structured around several key components:
* **Triggers (on: push, pull_request):** The pipeline executes automatically on any push to the repository or upon PR creation, guaranteeing zero-trust verification of all incoming code.
* **Jobs & Steps:** The workflow defines a sequential execution matrix: checking out the code, provisioning the environment, installing dependencies, and running the assertions.
* **Runners:** The ephemeral virtual machines (Ubuntu latest) that execute the jobs in a pristine, stateless environment, eliminating local caching anomalies.

## The Necessity of Real Infrastructure in Testing
Mocking the database at the application layer defeats the purpose of Row-Level Security (RLS) testing. Because our security boundary is enforced at the database level via Postgres session variables (current_setting), the CI pipeline must spin up a real PostgreSQL service container. The tests execute real HTTP requests that interact with a live SQL engine to validate that RLS policies drop unauthorized rows.

## Pipeline Design & Optimization
* **Dependency Caching:** The workflow caches 
ode_modules using the ctions/setup-node cache parameter, significantly reducing pipeline execution time and conserving compute resources.
* **Migration-Driven Execution:** Before the test suite runs, the pipeline executes the exact TypeORM schema drops and migrations that run in production. This ensures the schema tested is structurally identical to the deployment target.
* **Build Integrity (Red vs. Green):** A "green" build indicates that all RLS policies and application logic function correctly. A "red" build indicates a broken assertion, syntax error, or security leakage. A red build is treated as a hard block; the code cannot be merged until the pipeline is restored to green, protecting the main branch from regressions.
