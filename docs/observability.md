# Platform Observability & Request Tracing

## The Case for Structured Logging
Standard console.log('User logged in') creates flat text that is virtually impossible to search at scale. Structured logging outputs events as JSON objects (e.g., {"level": "info", "message": "User logged in", "tenant_id": "tenant_a"}). This allows log aggregators like Datadog, ELK, or AWS CloudWatch to index the fields, meaning you can instantly query: "Show me all 403 errors for Tenant A in the last hour."

## Log Levels
* **DEBUG:** Verbose information for local development (e.g., raw SQL queries).
* **INFO:** Normal system operation milestones (e.g., successful HTTP requests, cron job completions).
* **WARN:** Unexpected states that the system recovered from (e.g., a deprecated API endpoint was called).
* **ERROR:** Failures requiring attention (e.g., 500 Server Errors, 403 Privilege Escalation attempts).

## The Redaction Rule (Security Boundary)
Logs are a massive vulnerability vector. You must **never** log:
1. Raw JWTs or session tokens.
2. Passwords or cryptographic hashes.
3. Full PII (Personally Identifiable Information).
If an engineer has access to the logs, they should not be able to impersonate a user or steal tenant data.

## Request Tracing & Correlation IDs
A multi-tenant system handles hundreds of concurrent requests. A **Correlation ID** is a unique UUID generated the moment a request hits the server. This ID is attached to every single log emitted during that request's lifecycle. If an error occurs, you search the Correlation ID and immediately see the exact sequence of events that led to the crash.

## Tenant Context in Logs
By extracting the 	enant_id and ole from the JWT and appending them to the structured log, an incident can be isolated. We can debug a failure for Tenant B without accidentally pulling up logs for Tenant A, preserving data compliance.

## NestJS Mechanics: Middleware vs. Interceptors
While the NestJS ecosystem offers both Middleware and Interceptors, **Middleware** is the mathematically correct layer for HTTP request logging. Because NestJS Guards (which throw 401s and 403s) execute *before* Interceptors, an Interceptor will never see a request that a Guard rejects. Middleware sits at the absolute edge of the application, wrapping the entire lifecycle, ensuring every success and failure is caught and logged.
