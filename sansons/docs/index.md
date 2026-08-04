# Sansons Enterprise Documentation

Welcome to the Sansons project repository. This document outlines the core architecture and development workflow for the enterprise ecommerce platform.

## Architecture Overview

This project is a monorepo managed with **pnpm workspaces** and **Turborepo**.

### Applications

- **`apps/web`**: Frontend application built with Next.js 15, React 19, Tailwind CSS, and shadcn/ui.
- **`apps/api`**: Backend application built with NestJS, using Prisma (PostgreSQL) and BullMQ (Redis).

### Shared Packages

- **`packages/ui`**: Shared React components.
- **`packages/types`**: Shared TypeScript definitions and DTOs.
- **`packages/validation`**: Shared Zod schemas.
- **`packages/config`**: Shared configurations (ESLint, TSConfig, etc.).

## Development Workflow

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker and Docker Compose

### Getting Started

1. Copy `.env.example` to `.env` and configure your environment variables.
2. Run `docker-compose up -d` to start the PostgreSQL and Redis containers.
3. Run `pnpm install` to install dependencies.
4. Run `pnpm dev` to start the development servers for all applications and packages.

### Database Management

The backend uses Prisma as the ORM.

- Generate client: `pnpm run generate` (from `apps/api`)
- Run migrations: `pnpm run migrate` (from `apps/api`)

### CI/CD

Continuous Integration is configured via GitHub Actions in `.github/workflows/ci.yml`. It runs linting, typechecking, and builds on every push to `main` and `develop`.

---

*This documentation will be expanded in future sprints as features are implemented.*
