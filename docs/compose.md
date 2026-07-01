# Docker Compose & Infrastructure as Code

## Docker Compose vs. Single Containers
Running raw docker run commands is fine for a single application, but modern platforms require multiple interconnected services (API, Database, Redis cache). Docker Compose allows us to define the entire stack in a single docker-compose.yml file. A new engineer can run docker-compose up, and Compose will autonomously build the images, create an isolated internal network, and boot the services in the correct order.

## Internal DNS Resolution
Inside a Docker Compose network, services can talk to each other using their container names as hostnames. Our NestJS app no longer needs to use host.docker.internal or localhost to find the database. It can simply send requests to db, and Docker's internal DNS will perfectly route the traffic to the Postgres container.

## Data Persistence (Named Volumes)
Containers are ephemeral; when they are destroyed, their local file systems vanish. To ensure our database doesn't wipe its data every time we restart the stack, we use a **Named Volume**. This carves out a persistent chunk of the host machine's hard drive and mounts it into the Postgres container. Even if the container is deleted, the data survives.

## Healthchecks vs. depends_on
If we just tell the API to depend on the database, Docker will start the API the millisecond the Postgres container boots. But Postgres takes a few seconds to actually initialize and accept connections, causing our API to crash on startup. We solve this by adding a healthcheck to the Postgres container. Compose will actively ping the database, and only release the depends_on lock to start the API once Postgres explicitly confirms it is "healthy" and ready for traffic.
