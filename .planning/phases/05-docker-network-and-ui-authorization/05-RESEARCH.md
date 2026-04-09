# Phase 5: Docker Network and UI Authorization - Research

## Context Requirements
- **REQ-08**: React Dashboard Auth (Natively inject `X-API-Key` headers into UI `fetch` requests tracing `import.meta.env`).
- **REQ-09**: Docker Nginx Proxy (Rewrite nginx constraints bridging UI routes bypassing 404s matching `/api/` upstream).

## Technical Research

### 1. Hardcoded URL Deficiencies
- **Problem**: In `frontend/src/App.jsx`, `API_BASE_URL` is hardcoded as `http://localhost:8000/api/v1`. This guarantees CORS errors during production deployments scaling over IPs or Docker networking, bypassing Nginx entirely.
- **Solution**: Strip the absolute host domain. Transition to a relative path `const API_BASE_URL = "/api/v1";`. Nginx will orchestrate mapping the requests correctly to `http://backend:8000/api/v1` natively. 

### 2. FastApi 403 Crashes
- **Problem**: Our integrations correctly lock FastAPI via `APIKeyHeader`. Our `fetch` chains in `.jsx` lack any headers passing the key resulting in `Not Authenticated` blocks.
- **Solution**: Inject `{ "X-API-Key": import.meta.env.VITE_API_KEY }` dynamically mapping headers over `$VITE_API_KEY` injections during local testing or Nginx Docker deployments.

### 3. Nginx Reverse Proxy
- **Problem**: The existing `frontend/Dockerfile` utilizes `nginx:alpine` statically. Nginx inherently blocks `http://localhost/api` generating 404 codes locally since we lack `proxy_pass`.
- **Solution**: Write a custom `nginx.conf` utilizing `location /api/ { proxy_pass http://backend:8000/api/; }`. Modify the `Dockerfile` enforcing its deployment `COPY nginx.conf /etc/nginx/conf.d/default.conf`. 

### 4. Vite Dev Overrides
- **Problem**: Transitioning to relative `/api/v1` paths destroys immediate local testing via `npm run dev` since no Nginx container routes standard dev ports.
- **Solution**: Create `vite.config.js` mapping `server.proxy` explicitly proxying `/api` natively handling standard environments correctly.
