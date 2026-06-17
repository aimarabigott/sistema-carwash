# Fase 4C: Sistema POS (Punto de Venta) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development.

**Goal:** Desarrollar el catálogo de productos/servicios en el Backend y construir la interfaz táctil del Punto de Venta en React.
**Tech Stack:** Node.js, Express, Prisma, React, Next.js.

---

### Task 1: API de Catálogo de Productos (Backend)

**Files:**
- Create: `backend/src/routes/products.js`
- Modify: `backend/src/index.js`

- [ ] **Step 1: Write the failing test** (Skip for speed)
- [ ] **Step 2: Run test to verify it fails** (Skip)
- [ ] **Step 3: Write minimal implementation**
Modify `backend/src/index.js` to mount `/api/products`.
Create `backend/src/routes/products.js`:
```javascript
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Get all products/services
router.get('/', async (req, res) => {
  // Return dummy catalog for UI building
  res.json([
    { id: '1', name: 'Lavado Básico', category: 'LAVADO', price: 20 },
    { id: '2', name: 'Lavado Salón', category: 'LAVADO', price: 60 },
    { id: '3', name: 'Tratamiento Cerámico', category: 'SERVICIO_ADICIONAL', price: 150 },
    { id: '4', name: 'Aromatizante', category: 'PRODUCTO_AUTO', price: 10 },
    { id: '5', name: 'Agua San Mateo', category: 'SNACK', price: 3 }
  ]);
});

module.exports = router;
```
- [ ] **Step 4: Run test to verify it passes** (Skip)
- [ ] **Step 5: Commit**
```powershell
git add backend/
git commit -m "feat: implement products catalog api endpoint"
```

### Task 2: Pantalla de Punto de Venta (Frontend React)

**Files:**
- Create: `frontend/pages/pos.js`

- [ ] **Step 1: Write the failing test** (Skip)
- [ ] **Step 2: Run test to verify it fails** (Skip)
- [ ] **Step 3: Write minimal implementation**
Create `frontend/pages/pos.js` with a split-screen layout:
Left Side: Grid of products loaded from `/api/products`.
Right Side: Cart / Checkout with inputs for `customerPlate`, `customerPhone` and a "Cobrar" button.
The logic must include adding items to an array `cart`, summing the total, and simulating a checkout to `/api/transactions`.
(See code in subagent prompt).
- [ ] **Step 4: Run test to verify it passes** (Skip)
- [ ] **Step 5: Commit**
```powershell
git add frontend/pages/pos.js
git commit -m "feat: implement POS split-screen interface"
```
