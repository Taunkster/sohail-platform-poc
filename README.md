# Sohail Platform – Handover Document

> **Purpose**: This document is your entry point to understand, run, and extend the Sohail Platform – a secure, multi‑tenant task management API built with NestJS, PostgreSQL, and deployed on Render.

## Table of Contents
- [What is the Sohail Platform?](#what-is-the-sohail-platform)
- [Architecture Overview](#architecture-overview)
- [Getting Started Locally](#getting-started-locally)
- [Deployment](#deployment)
- [Security Model](#security-model)
- [How to Add a New Resource](#how-to-add-a-new-resource)
- [Live Documentation](#live-documentation)
- [Troubleshooting](#troubleshooting)

## What is the Sohail Platform?
The Sohail Platform is a backend service that manages students and tasks for multiple universities (tenants). It enforces:
- **Row‑Level Security (RLS)** – Data is isolated per tenant; no tenant can see another's data.
- **Role‑Based Access Control (RBAC)** – Two roles: `admin` (full CRUD) and `student` (read‑only access to assigned tasks).
- **Containerised deployment** – Runs anywhere with Docker.

## Architecture Overview
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL (managed via Neon)
- **Deployment**: Containerised, deployed on Render (auto‑deploy from GitHub `main` branch)
- **CI/CD**: GitHub Actions runs tests and deploys on green builds.
- **Security**: JWT‑like bearer tokens (simplified for demo) carry tenant and role information.

**Key ADRs** (Architecture Decision Records):  
See `docs/adr/` for decisions on multi‑tenancy, connection pooling, and deployment strategy.

**Mermaid Diagram** (simple):