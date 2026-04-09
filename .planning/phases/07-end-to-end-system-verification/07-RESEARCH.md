# Phase 7: End-to-End System Verification - Research

## Context Requirements
- **REQ-11**: System Health Validations (End-to-End manual/programmatic checks ensuring Docker outputs UI layers accurately extracting Postgres saves parsing 4D arrays smoothly).

## Technical Research

### 1. Verification Vector
- **Docker Integration**: The entire microservice binds over Nginx `80`, mapping down to backend `8000`, hooking to Postgres `5432`.
- **Testing Logic**: To finalize the milestone, the system must deploy `docker-compose up -d --build`. We must confirm that hitting `localhost:80` reliably serves the `Aether Glass` Dashboard, the API indicates it is ONLINE, and evaluation history fetches trigger `200 OK` status without `403` intercepts.

### 2. Manual vs Programmatic Validation
- While Phase 4 handled backend structural assertions programmatically via `pytest`, Phase 7 acts as the User Acceptance Test (UAT) mapping deployment overlays.
- A functional test verifies that `X-API-Key` headers bind dynamically inside Docker layers resolving actual inputs.

### 3. Execution Standard
- Verify the following flows locally:
  - System Initialization: Containers boot without exit code 1.
  - Proxy Navigation: Nginx `try_files` loads the Vite static build properly.
  - Evaluation Chain: Firing an explicit evaluation prompt resolves and renders the new Stitch multi-colored bars elegantly.
