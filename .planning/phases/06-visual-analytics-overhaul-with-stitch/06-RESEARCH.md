# Phase 6: Visual Analytics Overhaul with Stitch - Research

## Context Requirements
- **REQ-10**: Aesthetic Optimization via Stitch (Overhaul UI dynamically graphing out the new 4-dimensional metrics utilizing premium assets).

## Technical Research

### 1. Inconsistent Metric Mappings
- **Current State**: The legacy `App.jsx` maps static metrics (`relevance`, `completeness`, `token_length`) because it pre-dates the backend refactor built over `UniversalLLMJudge` (Phase 3).
- **Required State**: The backend JSON currently outputs explicit dictionaries for: `faithfulness`, `relevance`, `precision`, and `toxicity`. The UI must explicitly graph these exact values.

### 2. UI/UX Paradigm (StitchMCP)
- The tabular approach is outdated and cluttered. Instead of a tight table, we should utilize dynamic progress sliders, radar charts, or premium Glassmorphism cards bounding each LLM output independently.
- **Workflow**:
  1. Leverage `mcp_StitchMCP_create_project` connecting dynamic instances.
  2. Map `mcp_StitchMCP_generate_screen_from_text` prompting an explicit "Premium Dark Mode RAG Evaluation Dashboard" plotting the 4 specific scores.
  3. Extract generated React component definitions merging logic locally into `App.jsx` avoiding external CSS conflicts securely relying on internal layouts or Tailwind overlays.

### 3. Component Hierarchy
- Top Nav: Status indicators tracking Backend Health (200 OK) + Configuration tools.
- Left Pane: Prompt inputs bounding model comparison outputs gracefully.
- Right Pane: Evaluation History stacking distinct execution cards rendering mapped UI assets flawlessly.
