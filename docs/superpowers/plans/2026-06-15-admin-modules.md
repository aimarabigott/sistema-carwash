# Fase 6: Módulos Administrativos (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development.

**Goal:** Implementar Endpoints CRUD y las pantallas de Frontend para Inventario, Gastos y Trabajadores.
**Tech Stack:** Node.js, Express, Prisma, React, Next.js.

---

### Task 1: Módulo de Inventario (API + UI)
**Files:**
- Modify: `backend/src/routes/products.js`
- Create: `frontend/pages/inventory.js`

- [ ] **Step 3: Write minimal implementation**
En `products.js`, añadir ruta `POST /` que reciba `locationId, name, category, price, stock` y lo guarde usando Prisma (`await prisma.product.create(...)`). Retornar los productos desde DB en el `GET /` en vez del mockup.
En `frontend/pages/inventory.js`, crear una tabla sencilla con un formulario superior para crear nuevos productos (Nombre, Precio, Categoría).

- [ ] **Step 5: Commit**
`git add .`
`git commit -m "feat: implement inventory module"`

### Task 2: Módulo de Gastos (API + UI)
**Files:**
- Create: `backend/src/routes/expenses.js`
- Create: `frontend/pages/expenses.js`
- Modify: `backend/src/index.js`

- [ ] **Step 3: Write minimal implementation**
Crear ruta `POST /` en `expenses.js` para registrar un gasto (`locationId, workerId, amount, concept`).
Montarlo en `index.js` (`app.use('/api/expenses')`).
En `frontend/pages/expenses.js`, crear formulario para ingresar egresos y listarlos en una tabla inferior.

- [ ] **Step 5: Commit**
`git add .`
`git commit -m "feat: implement expenses module"`

### Task 3: Módulo de Trabajadores/Comisiones (API + UI)
**Files:**
- Create: `backend/src/routes/workers.js`
- Create: `frontend/pages/workers.js`
- Modify: `backend/src/index.js`

- [ ] **Step 3: Write minimal implementation**
Crear ruta `POST /` en `workers.js` que reciba `userId, locationId, commissionType, commissionValue` y guarde en `WorkerProfile`.
Montarlo en `index.js`.
En `frontend/pages/workers.js`, crear lista de trabajadores y selector de tipo de comisión (PER_CAR, PERCENTAGE_TOTAL, FIXED_AMOUNT).

- [ ] **Step 5: Commit**
`git add .`
`git commit -m "feat: implement workers and commissions module"`
