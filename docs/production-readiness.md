# Operational Hardening & Production-Readiness Framework

## 1. Operational Essentials

### Liveness vs. Readiness Probes
An orchestrator (such as Kubernetes or AWS ECS) requires discrete insights to manage a container's lifecycle responsibly:
* **Liveness (/health/live):** Determines if the application process is dead, gridlocked, or stuck in an infinite loop. If this endpoint fails, the orchestrator kills the container and provisions a fresh instance.
* **Readiness (/health/ready):** Determines if the application is fully capable of serving user traffic. A process can be alive but unable to serve requests if it is still initializing data caches, running migrations, or experiencing a database connection timeout. If this endpoint fails, the orchestrator preserves the container but dynamically reroutes incoming traffic away from it until it returns to a healthy state. Relying solely on a "process is up" check means users will experience 502 Bad Gateway errors during service interruptions.

### Graceful Shutdown (SIGTERM Mechanics)
When an orchestrator rolls out an update or scales down infrastructure, it sends a SIGTERM signal to the containerized application. 
* **The Naive Approach:** Instantly killing the process. This drops all active TCP connections mid-execution, causing in-flight payments, mutations, or database writes to abort abnormally, generating user-facing errors.
* **The Graceful Approach:** Catching the SIGTERM signal, halting new network traffic consumption, allowing all current in-flight requests to complete execution up to an allocated timeout window, and explicitly draining and closing the database connection pool.

### Cryptographic Secrets Hygiene
Baking connection strings, private API keys, or JWT secrets directly into a Docker image layer turns an immutable artifact into a security vulnerability. Images are pushed to registries where unauthorized entities can reverse-engineer layers to extract plaintext credentials. Committing passwords directly to a public or private docker-compose.yml file leaks secrets to version control history. 

Production environments require **Runtime Injection**: images remain completely environment-agnostic, and configuration parameters are loaded dynamically into system memory at the container's instantiation phase via an external Secrets Manager (such as AWS Secrets Manager, HashiCorp Vault, or environment injection).
