# Concurrency & Connection Pooling Risks

## The Connection Pool Leak Scenario
PostgreSQL Row-Level Security (RLS) relies on session variables (e.g., SET app.current_tenant). However, modern web frameworks like NestJS use connection pooling to recycle database connections for performance. 
1. Request A (Tenant A) checks out Connection #1 and sets the tenant context.
2. Request A completes and returns Connection #1 to the pool without resetting the context.
3. Request B (Tenant B) checks out Connection #1. If Request B experiences a slight delay or error before setting its own context, it will execute queries under Tenant A's context.
This silent data bleed completely bypasses RLS and isolation boundaries.

## The Mitigation Strategy
To prevent session state leaks across pooled connections, we have two primary defenses:
1. **The Cleanup Approach:** Explicitly executing RESET app.current_tenant before returning the connection to the pool. (Prone to failure if the application crashes mid-request).
2. **The Transactional Approach (SET LOCAL):** Wrapping the request in a database transaction and using SET LOCAL app.current_tenant. PostgreSQL automatically drops all LOCAL variables the millisecond the transaction commits or rolls back. This is the gold standard for RLS pooling safety.

## Correctness vs. Throughput
A single-request test proves RLS works in a vacuum. A **Concurrency Correctness Test** fires dozens of interleaved requests simultaneously to aggressively force the connection pool to recycle connections, proving that context does not leak. A **Raw Throughput Benchmark** (using tools like Autocannon) measures the system's performance limits (Requests/Sec, Latency) under stress, independent of logical correctness.
