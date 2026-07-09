# Docker & Platform Portability

## Containers vs. The "Works on My Machine" Trap
My current setup relies on my host machine having Node.js installed, specific environment variables configured in memory, and a local PostgreSQL instance listening on port 5432. If I hand this to another developer, it breaks. 
* **Virtual Machine:** Virtualizes the hardware, running a full, heavy guest operating system.
* **Container:** Virtualizes the operating system. It packages the application code, the exact Node.js runtime, and all dependencies into a single, isolated process that shares the host's kernel. 
Containers solve the "works on my machine" trap because the execution environment travels with the code. 

## Core Concepts
* **Image:** The immutable blueprint. It contains the OS libraries, runtime, and application code.
* **Container:** The running instance of an image.
* **Registry:** The distribution server (e.g., Docker Hub, AWS ECR) where images are stored and pulled from.

## Dockerfile Anatomy & Layer Caching
* **FROM**: Defines the base image (e.g., Node 18 Alpine).
* **WORKDIR**: Sets the execution directory inside the container.
* **COPY package*.json ./ & RUN npm ci**: We copy the package files and install dependencies *before* copying the rest of the source code. Docker caches layers; if our source code changes but our dependencies do not, Docker skips the 
pm ci step, drastically speeding up builds.
* **EXPOSE**: Documents the port the container listens on.
* **CMD**: The default executable command when the container starts.

## Multi-Stage Builds & Security
A production image should be small and secure. 
1. **Build Stage:** Contains the full TypeScript compiler, NestJS CLI, and all devDependencies. It compiles the .ts files to plain JavaScript.
2. **Runtime Stage:** Starts fresh from a slim base image. It copies *only* the compiled JavaScript from the build stage and installs *only* production dependencies. 
This reduces the image size (cheaper to host, faster to pull) and minimizes the attack surface by excluding tools like compilers that hackers could weaponize.
