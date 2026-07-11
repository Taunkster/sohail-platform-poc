# API Documentation & Handover Strategy

## API Documentation Architecture
We utilize the OpenAPI Specification (OAS), implemented via Swagger, rather than maintaining static, hand-written endpoint lists. 
* **Machine-Readable Superiority:** A machine-readable spec allows for automated SDK generation, automated contract testing, and live API exploration. Hand-written docs inevitably drift out of sync with the actual codebase.
* **The NestJS Integration:** By utilizing the `@nestjs/swagger` module, documentation is generated directly from the abstract syntax tree and TypeScript decorators (e.g., `@ApiTags()`, `@ApiResponse()`). The documentation lives alongside the business logic, ensuring they evolve together.
* **Endpoint Requirements:** A complete endpoint contract in this platform must explicitly define:
  1. The required `Authorization: Bearer` token.
  2. The RBAC roles required to execute the action (e.g., `Admin`, `Student`).
  3. The exact DTO shapes for the Request payload and Response object.
  4. Explicit error cases (e.g., 401 Unauthorized, 403 Forbidden, 404 Not Found).

## Handover Thinking: Day One Engineer
When a new engineer joins the team, they need to understand the platform's boundaries before writing a single line of code. They need:
1. **Execution:** A single command (`docker-compose up`) to spin up the entire isolated environment.
2. **Structure:** A clear map of the modular, BLoC-inspired architecture.
3. **Security:** A conceptual understanding of how Row-Level Security (RLS) and JWTs interact to enforce tenant boundaries.
4. **Extension:** A step-by-step framework for adding resources without accidentally bypassing the security model.