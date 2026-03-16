# edtronaut-live-code-engine

Backend service for asynchronous live code execution. The system lets clients create code sessions, update source code, trigger executions, and retrieve execution results after background processing.

## 1. Project Overview

`edtronaut-live-code-engine` is a NestJS backend designed for live coding workflows where execution should not block API requests.

Typical use cases:

- online coding playgrounds
- interview platforms
- educational coding products
- internal tools that need async code execution

Service goals:

- persist code sessions and execution history
- enqueue execution requests asynchronously
- process executions in a separate worker process
- isolate execution orchestration from language-specific runners
- provide a foundation that can later move from mock runners to real sandboxed execution

## 2. System Architecture

The system is split into API, queue, worker, sandbox, and persistence layers.

```text
+-----------+      +-------------+      +-----------------+      +------------------+
|  Client   | ---> | API Server  | ---> | BullMQ / Redis  | ---> | Worker Process   |
+-----------+      +-------------+      +-----------------+      +------------------+
       |                    |                     |                         |
       |                    v                     |                         v
       |             PostgreSQL <-----------------+                 SandboxService
       |                                                                  |
       |                                                                  v
       +----------------------------------------------------------> Language Runner
```

Execution path:

```text
POST /code-sessions/:sessionId/run
  -> create executions row with status QUEUED
  -> enqueue BullMQ job
  -> worker picks job
  -> worker loads session + execution
  -> worker calls SandboxService
  -> SandboxService chooses runner by language
  -> runner returns normalized result
  -> worker updates execution row
```

Component roles:

- `API Server`: validates requests, writes sessions and execution records, enqueues jobs
- `PostgreSQL`: stores sessions, executions, and execution lifecycle data
- `Redis / BullMQ`: stores asynchronous execution jobs
- `Worker`: processes queued executions without blocking API traffic
- `SandboxService`: language-agnostic orchestration layer for code execution
- `SandboxRunner`: language-specific execution adapter

## 3. Project Structure

```text
src/
├── app.module.ts
├── main.ts
├── infrastructure/
│   ├── database/
│   │   └── typeorm.config.ts
│   ├── queue/
│   │   ├── queue.constants.ts
│   │   ├── queue.module.ts
│   │   └── queue.service.ts
│   └── redis/
│       ├── redis.client.ts
│       └── redis.constants.ts
├── modules/
│   ├── code-sessions/
│   │   ├── dto/
│   │   │   ├── create-code-session.dto.ts
│   │   │   └── update-code-session.dto.ts
│   │   ├── entities/
│   │   │   ├── code-session-status.enum.ts
│   │   │   └── code-session.entity.ts
│   │   ├── code-sessions.controller.ts
│   │   ├── code-sessions.module.ts
│   │   └── code-sessions.service.ts
│   └── executions/
│       ├── entities/
│       │   ├── execution-event.entity.ts
│       │   ├── execution-status.enum.ts
│       │   └── execution.entity.ts
│       ├── executions.controller.ts
│       ├── executions.module.ts
│       └── executions.service.ts
├── sandbox/
│   ├── runners/
│   │   ├── javascript.runner.ts
│   │   ├── python.runner.ts
│   │   ├── sandbox-runner.interface.ts
│   │   └── typescript.runner.ts
│   ├── sandbox.module.ts
│   ├── sandbox.service.ts
│   └── sandbox.types.ts
├── shared/
│   └── config/
│       ├── app.config.ts
│       ├── database.config.ts
│       ├── environment.validation.ts
│       └── redis.config.ts
└── workers/
    └── code-execution.worker.ts
```

## 4. Local Setup

### Prerequisites

- Node.js 20+
- npm
- Docker Desktop or Docker Engine

### Start local dependencies

```bash
docker compose up -d
docker compose ps
```

This starts:

- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`

### Install dependencies

```bash
npm install
```

### Environment variables

Create `.env` from `.env.example` if needed. The local defaults are:

```env
PORT=3000

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=edtronaut_live_code_engine

REDIS_HOST=localhost
REDIS_PORT=6379
```

### Run the API server

```bash
npm run start:dev
```

### Build the project

```bash
npm run build
```

### Run the worker

Use either command:

```bash
npm run start:worker
```

or:

```bash
node dist/workers/code-execution.worker.js
```

## 5. API Documentation

Base URL:

```text
http://localhost:3000
```

### POST /code-sessions

Create a new code session.

Request:

```http
POST /code-sessions
Content-Type: application/json
```

```json
{
  "language": "python"
}
```

Response:

```json
{
  "id": "6bca9764-931b-4ea1-ab0d-a36d7a626bc3",
  "language": "python",
  "sourceCode": "",
  "status": "ACTIVE",
  "createdAt": "2026-03-16T13:35:01.725Z",
  "updatedAt": "2026-03-16T13:35:01.725Z"
}
```

### PATCH /code-sessions/:sessionId

Update language and/or source code for an existing session.

Request:

```http
PATCH /code-sessions/:sessionId
Content-Type: application/json
```

```json
{
  "sourceCode": "print('hello from test')"
}
```

Response:

```json
{
  "id": "6bca9764-931b-4ea1-ab0d-a36d7a626bc3",
  "language": "python",
  "sourceCode": "print('hello from test')",
  "status": "ACTIVE",
  "createdAt": "2026-03-16T13:35:01.725Z",
  "updatedAt": "2026-03-16T13:35:01.871Z"
}
```

### POST /code-sessions/:sessionId/run

Create an execution record and enqueue the execution job.

Request:

```http
POST /code-sessions/:sessionId/run
```

Response:

```json
{
  "executionId": "57d8f300-49df-4b33-b30a-18cba467a1d1",
  "status": "QUEUED"
}
```

### GET /executions/:executionId

Get the current execution state and result.

Request:

```http
GET /executions/:executionId
```

Response after worker completion:

```json
{
  "id": "57d8f300-49df-4b33-b30a-18cba467a1d1",
  "sessionId": "627bddcc-e9c6-45be-b3dc-352e22601da1",
  "status": "COMPLETED",
  "stdout": "Hello from Python sandbox",
  "stderr": null,
  "executionTimeMs": 1000,
  "exitCode": 0,
  "queuedAt": "2026-03-16T13:35:25.305Z",
  "startedAt": "2026-03-16T13:35:25.345Z",
  "finishedAt": "2026-03-16T13:35:25.354Z",
  "retryCount": 0,
  "events": [],
  "createdAt": "2026-03-16T13:35:25.309Z",
  "updatedAt": "2026-03-16T13:35:25.362Z"
}
```

## 6. Execution Flow

Execution lifecycle:

```text
QUEUED -> RUNNING -> COMPLETED
                 \-> FAILED
```

Detailed flow:

1. API receives `POST /code-sessions/:sessionId/run`
2. API loads the session
3. API creates an `Execution` record with:
   - `status = QUEUED`
   - `queuedAt = now()`
4. API enqueues BullMQ job `run-code`
5. Worker receives the job
6. Worker marks execution as `RUNNING`
7. Worker calls `SandboxService.runCode(language, sourceCode)`
8. Runner returns `stdout`, `stderr`, `exitCode`, `executionTimeMs`
9. Worker updates the execution:
   - `COMPLETED` when `exitCode === 0`
   - `FAILED` when `exitCode !== 0`

## 7. Queue & Worker Design

Why use a queue:

- execution should not block HTTP requests
- API response should be fast even when execution takes time
- queue decouples request handling from execution processing
- background processing is easier to scale later

Why a separate worker process:

- isolates execution orchestration from the API server
- prevents long-running jobs from impacting request latency
- allows independent scaling of API and execution capacity
- creates a clean boundary for future sandbox hardening

Why asynchronous execution:

- client receives an `executionId` immediately
- result can be polled independently
- safer foundation for heavy or slow workloads

Queue details:

- queue name: `code-execution`
- job name: `run-code`
- job payload:

```json
{
  "executionId": "uuid"
}
```

## 8. Sandbox Design

The sandbox layer hides language-specific execution details behind a stable abstraction.

Design:

```text
Worker
  -> SandboxService
      -> SandboxRunner interface
          -> PythonRunner
          -> JavascriptRunner
          -> TypescriptRunner
```

Responsibilities:

- `SandboxService`
  - normalizes language input
  - selects the correct runner
  - throws a clear error if no runner supports the language
- `SandboxRunner`
  - defines the contract for execution adapters
- language runners
  - implement environment-specific execution behavior

Current state:

- runners are mock implementations
- they return normalized `SandboxExecutionResult`
- no real containerized execution yet

This design keeps the worker simple and makes it easy to add:

- `GoRunner`
- `JavaRunner`
- `CppRunner`
- real Docker-backed runners

## 9. Assumptions

Current assumptions in this phase:

- execution happens in a trusted development environment
- sandbox runners are mock implementations
- one worker instance is enough for local development
- clients poll `GET /executions/:executionId` for results
- PostgreSQL and Redis are available locally via Docker Compose

## 10. Trade-offs

Current trade-offs are intentional to keep the foundation small and extensible.

- no real sandbox isolation yet
- no Docker-based code execution yet
- no CPU or memory limits
- no per-language compilation pipeline
- no execution timeout enforcement at runner level
- no rate limiting or abuse protection
- no multi-tenant isolation
- no advanced retry or dead-letter handling

## 11. Future Improvements

Likely next steps:

- replace mock runners with Docker-based sandbox execution
- add hard execution timeouts
- enforce CPU, memory, and filesystem limits
- support compiled languages and build steps
- persist `execution_events` during lifecycle transitions
- add worker autoscaling
- add dead-letter queue and retry policy
- add container pooling and warm runtimes
- add result streaming or websocket updates
- add observability and job metrics

## 12. Development Notes

Important local behavior:

- the API server and worker are separate processes
- if the worker is not running, executions will remain in `QUEUED`
- `npm run start:dev` starts only the API server
- `npm run start:worker` starts only the worker

Recommended local workflow:

Terminal 1:

```bash
npm run start:dev
```

Terminal 2:

```bash
npm run build
npm run start:worker
```

Terminal 3:

```bash
xh --ignore-stdin POST http://127.0.0.1:3000/code-sessions language=python
```

If you call `POST /code-sessions/:sessionId/run` and the execution never leaves `QUEUED`, the first thing to check is whether the worker process is running.
