# Fase 4A: Autenticación Full-Stack (Login y Registro) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development.

**Goal:** Completar el flujo de autenticación, creando el endpoint de Login en el Backend y adaptando las pantallas de la plantilla Next.js.
**Tech Stack:** Node.js, Express, Prisma, Next.js, React, Axios.

---

### Task 1: Endpoint de Login en Backend

**Files:**
- Modify: `backend/src/routes/auth.js`
- Modify: `backend/tests/auth.test.js`

- [ ] **Step 1: Write the failing test**
In `backend/tests/auth.test.js`, add:
```javascript
  it('debería hacer login y devolver un token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'owner@test.com', password: '123' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('owner@test.com');
  });
```
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Write minimal implementation**
Install `jsonwebtoken`: `cd backend; npm install jsonwebtoken`
Modify `backend/src/routes/auth.js`:
```javascript
// At top
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'supersecretcarwash'; // Dummy secret for now

// Add new route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
  res.status(200).json({ token, user });
});
```
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**
`git add backend/src/routes/auth.js backend/tests/auth.test.js backend/package.json`
`git commit -m "feat: implement backend login endpoint with jwt"`

### Task 2: Pantallas de Frontend (React)

**Files:**
- Move/Rename: `frontend/pages/pages/login1.js` -> `frontend/pages/login.js`
- Move/Rename: `frontend/pages/pages/register.js` -> `frontend/pages/register.js`

- [ ] **Step 1: Write the failing test** (Skip)
- [ ] **Step 2: Run test to verify it fails** (Skip)
- [ ] **Step 3: Write minimal implementation**
Using PowerShell, move the files:
`mv frontend/pages/pages/login1.js frontend/pages/login.js`
`mv frontend/pages/pages/register.js frontend/pages/register.js`

Replace imports inside those moved files if they break, or keep them minimal for now (just structural moving).
- [ ] **Step 4: Run test to verify it passes** (Skip)
- [ ] **Step 5: Commit**
`git add frontend/pages/`
`git commit -m "feat: setup frontend authentication pages structure"`
