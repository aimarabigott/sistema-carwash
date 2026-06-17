# Fase 3B: Adaptación del Frontend (React/Next.js) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) to implement this plan task-by-task.

**Goal:** Limpiar la plantilla Uena y preparar la conexión con la API de Backend.
**Tech Stack:** Node.js, Next.js, React, Axios.

---

### Task 1: Purga de Dependencias y Rutas Innecesarias (Clean-up)

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/pages/index.js`

- [ ] **Step 1: Write the failing test**
(No tests required for clean-up, skip step)
- [ ] **Step 2: Run test to verify it fails**
(Skip)
- [ ] **Step 3: Write minimal implementation**
Uninstall unnecessary heavy dependencies (Firebase, Editors, Galleries) from the Uena template.
Run:
```powershell
cd frontend
npm uninstall firebase @ckeditor/ckeditor5-build-classic @ckeditor/ckeditor5-react @tinymce/tinymce-react lightgallery sweetalert sweetalert2
```
Overwrite `frontend/pages/index.js` with a clean splash page:
```javascript
export default function Home() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Carwash SaaS</h1>
      <p>Bienvenido al Sistema de Gestión</p>
    </div>
  );
}
```
- [ ] **Step 4: Run test to verify it passes**
(Skip)
- [ ] **Step 5: Commit**
```powershell
git add frontend/package.json frontend/package-lock.json frontend/pages/index.js
git commit -m "chore: clean up unused frontend dependencies and pages"
```

### Task 2: Cliente API (Axios Interceptor)

**Files:**
- Create: `frontend/src/services/api.js`

- [ ] **Step 1: Write the failing test**
(Skip)
- [ ] **Step 2: Run test to verify it fails**
(Skip)
- [ ] **Step 3: Write minimal implementation**
Create `frontend/src/services/api.js` to handle all calls to the backend:
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```
- [ ] **Step 4: Run test to verify it passes**
(Skip)
- [ ] **Step 5: Commit**
```powershell
git add frontend/src/services/api.js
git commit -m "feat: setup axios api client"
```
