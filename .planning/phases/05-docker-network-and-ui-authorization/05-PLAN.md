---
wave: 1
depends_on: []
files_modified:
  - ai-eval/frontend/src/App.jsx
  - ai-eval/frontend/vite.config.js
  - ai-eval/frontend/nginx.conf
  - ai-eval/frontend/Dockerfile
autonomous: true
requirements: REQ-08, REQ-09
---

# Plan 05: UI Authorization and Proxy Binding

<objective>
To securely rewrite UI requests navigating explicit reverse proxy domains safely injecting environment Auth tokens terminating 403 pipeline blocks.
</objective>

<tasks>
<task>
  <description>Refactor UI HTTP Logic (Headers & Relative Paths)</description>
  <read_first>
    - ai-eval/frontend/src/App.jsx
  </read_first>
  <action>
    1. Adjust `API_BASE_URL` statically mapping `const API_BASE_URL = "/api/v1";`.
    2. Overhaul `/explore`, `/evaluate`, and `/health` fetches injecting the auth header cleanly tracking `import.meta.env.VITE_API_KEY`:
       ```javascript
       headers: { 
         "Content-Type": "application/json",
         "X-API-Key": import.meta.env.VITE_API_KEY || "test_key"
       }
       ```
  </action>
  <acceptance_criteria>
    - Hardcoded `http://localhost:8000` is entirely excised executing functional dynamic fetch bounds perfectly.
    - Security headers match backend assertions securely bridging routes dynamically.
  </acceptance_criteria>
</task>

<task>
  <description>Generate Vite Environment Proxy Definitions</description>
  <read_first>
    - (None)
  </read_first>
  <action>
    Create `ai-eval/frontend/vite.config.js` deploying server definitions proxying relative `/api` bindings towards FastAPI dynamically handling local environment states correctly bypassing constraints entirely:
    `server: { proxy: { '/api': { target: 'http://localhost:8000', changeOrigin: true } } }`
  </action>
  <acceptance_criteria>
    - Code seamlessly spins local instances without crashing Nginx proxies simulating downstream bridges natively.
  </acceptance_criteria>
</task>

<task>
  <description>Overhaul Docker Nginx Implementations</description>
  <read_first>
    - ai-eval/frontend/Dockerfile
  </read_first>
  <action>
    1. Write `ai-eval/frontend/nginx.conf` tracking logic mimicking upstream Docker variables:
       ```nginx
       server {
           listen 80;
           location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; }
           location /api/ { proxy_pass http://backend:8000/api/; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; }
       }
       ```
    2. Update `ai-eval/frontend/Dockerfile` scaling execution configurations natively triggering:
       `COPY nginx.conf /etc/nginx/conf.d/default.conf`
  </action>
  <acceptance_criteria>
    - Native container compiles bypass default `nginx:alpine` behaviors seamlessly mapping robust networks bridging standard HTTP outputs fluently tracking integration topologies accurately.
  </acceptance_criteria>
</task>
</tasks>

<verification>
Execute `docker-compose up --build -d` dynamically checking integration logic manually hitting `http://localhost:3000` mapping network outputs evaluating standard HTTP status variables tracking active 403 resolutions cleanly avoiding routing collisions natively mapping schemas securely.
</verification>

<must_haves>
- Vite Dev mappings mirror Nginx routes cleanly mapping `/api` bounds exclusively preventing cross-origin policies crashing implementations synchronously.
</must_haves>
