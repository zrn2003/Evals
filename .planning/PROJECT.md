# AI Evals Production Upgrade

**Status**: Milestone v1.0 Complete
**Current State**: v1.0 API Microservice with dynamic LLM bounding and Docker overlays completed successfully.
**Next Milestone Goals**: Resolve Frontend Authentication and UI regression topologies blocking Docker Compose builds across static domains.

<what_this_is>
## What This Is

AI-Eval Production Framework is an industry-grade evaluation system for Large Language Models (LLMs). The upgrade targets creating a resilient, parallel-capable, Dockerized microservice architecture utilizing a relational database (Postgres) and expanding metric engines (multi-model, advanced RAG validation).
</what_this_is>

<why_it_matters>
## Why It Matters

The current iteration suffers from execution fragility (race conditions with local JSON scaling), confined metrics, and hardcoded local runtimes. Expanding to Postgres, configuring environment portability (Docker / .env), and wiring multi-model APIs prepares the codebase for actual production adoption and realistic enterprise analysis.
</why_it_matters>

## Requirements

### Validated

- ✓ Local API Execution Engine — existing
- ✓ Local UI Dashboard (React) — existing
- ✓ Basic Faithfulness metric check logic — existing
- ✓ Reconfigure and migrate history persistence to utilize PostgreSQL mapped by SQLAlchemy (Validated in Phase 1: Storage and Environment Foundation).
- ✓ Implement `.env` management schemas (`pydantic-settings`) for runtime parameters (Validated in Phase 1: Storage and Environment Foundation).
- ✓ Add Docker scaffolding (`Dockerfile` and `docker-compose.yml`) uniting the DB, backend and frontend under one stack (Validated in Phase 2).
- ✓ Wrap FastAPI endpoints in basic authentication bounds (API Keys/Bearer Tokens) (Validated in Phase 2).
- ✓ Construct expanded metrics covering RAG precision, Relevance, and safety Toxicity (Validated in Phase 3: Advanced Pipeline Scaling).
- ✓ Build interchangeable LLM handler adapters granting optional multi-model API access (OpenAI, Anthropic, Gemini) (Validated in Phase 3: Advanced Pipeline Scaling).
- ✓ Write integration test assertions for `judge.py` models bounding the pipelines against failure (Validated in Phase 4: Integration and Quality Assurance).
- ✓ Refactor frontend logic parsing API Keys matching Docker mappings avoiding FastApi crash overrides (Validated in Phase 5: Docker Network and UI Authorization).
- ✓ Construct explicit React reverse proxy configurations generating direct API translations seamlessly (Validated in Phase 5: Docker Network and UI Authorization).
- ✓ Design and implement highly responsive dashboard metrics natively mapping new evaluation scores `precision`, `relevance`, and `toxicity` leveraging Stitch designs natively (Validated in Phase 6: Visual Analytics Overhaul with Stitch).

### Active

- [ ] Conduct comprehensive end-to-end user validations mapping deployed frontend outputs tracking Docker networks executing transparently against DB saves.

### Out of Scope

- Cloud native orchestration (e.g. Helm/Kubernetes manifests) beyond structural `docker-compose`. 
- Deep Single-Sign On / User account portals for the dashboard (API tokenization stands adequate for now).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| PostgreSQL Implementation | Needed to guarantee atomic consistency during async parallel batch runs | — Pending |
| Expanding evaluation metrics | A framework solely processing "faithfulness" is insufficient for modern RAG audits | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-09 after initialization*
