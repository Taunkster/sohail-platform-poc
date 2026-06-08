# Sohail Platform — Multi-Tenant Backend Foundation

## Overview
This repository contains the Phase 1 backend foundation for Sohail's multi-tenant student data layer. It utilizes NestJS, PostgreSQL, and Docker to enforce strict tenant isolation via Row-Level Security (RLS) architecture.

## Setup Instructions
1. Run `docker-compose up -d` to start the PostgreSQL database.
2. Run `npm install` to install dependencies.
3. Add a `.env` file based on the default configurations.
4. Run `npm run typeorm migration:run -- -d src/data-source.ts` to execute the database schema migrations.
5. Connect to the database via `localhost:5432` to verify table creation.
