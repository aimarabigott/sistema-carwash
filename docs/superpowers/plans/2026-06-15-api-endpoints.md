# Fase 3: Rutas API Core (Auth y Transacciones) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir los endpoints REST básicos de Autenticación y Transacciones sobre el backend Express existente usando TDD.

**Architecture:** Express Router para manejar endpoints. Jest + Supertest para integraciones. Prisma Client para interactuar con la BD.

**Tech Stack:** Node.js, Express, Jest, Supertest, Prisma.

---

### Task 1: Rutas de Autenticación (Registro Básico)

**Files:**
- Create: `backend/src/routes/auth.js`
- Create: `backend/src/index.js`
- Create: `backend/tests/auth.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
// backend/tests/auth.test.js
const request = require('supertest');
const app = require('../src/index');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Auth API', () => {
  beforeAll(async () => { await prisma.user.deleteMany(); });
  afterAll(async () => { await prisma.$disconnect(); });

  it('debería registrar un nuevo Dueño', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'owner@test.com', password: '123' });
    expect(res.statusCode).toBe(201);
    expect(res.body.user.role).toBe('OWNER');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `cd backend; npx jest tests/auth.test.js`

- [ ] **Step 3: Write minimal implementation**
Create `backend/src/index.js`:
```javascript
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
module.exports = app;
if (require.main === module) {
  app.listen(3000, () => console.log('Server running'));
}
```

Create `backend/src/routes/auth.js`:
```javascript
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.create({
    data: { email, password, role: 'OWNER' }
  });
  res.status(201).json({ user });
});

module.exports = router;
```

- [ ] **Step 4: Run test to verify it passes**
Run: `cd backend; npx jest tests/auth.test.js`

- [ ] **Step 5: Commit**
```powershell
git add backend/src/ backend/tests/
git commit -m "feat: implement basic auth register route"
```

### Task 2: Rutas de Operaciones (Transacciones)

**Files:**
- Create: `backend/src/routes/transactions.js`
- Create: `backend/tests/transactions.test.js`
- Modify: `backend/src/index.js`

- [ ] **Step 1: Write the failing test**

```javascript
// backend/tests/transactions.test.js
const request = require('supertest');
const app = require('../src/index');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Transactions API', () => {
  let locationId;
  beforeAll(async () => {
    const owner = await prisma.user.create({ data: { email: 'tx@test.com', password: '123', role: 'OWNER' } });
    const business = await prisma.business.create({ data: { ownerId: owner.id } });
    const loc = await prisma.location.create({ data: { businessId: business.id, name: 'Sede 1' } });
    locationId = loc.id;
  });
  afterAll(async () => { await prisma.$disconnect(); });

  it('debería crear una transacción', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .send({ locationId, workerId: 'dummy', paymentMethod: 'CASH', totalAmount: 50 });
    expect(res.statusCode).toBe(201);
    expect(res.body.transaction.totalAmount).toBe(50);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `cd backend; npx jest tests/transactions.test.js`

- [ ] **Step 3: Write minimal implementation**
Modify `backend/src/index.js` to add `const transactionRoutes = require('./routes/transactions');` and `app.use('/api/transactions', transactionRoutes);`.

Create `backend/src/routes/transactions.js`:
```javascript
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const { locationId, workerId, paymentMethod, totalAmount } = req.body;
  const transaction = await prisma.transaction.create({
    data: { locationId, workerId, paymentMethod, totalAmount }
  });
  res.status(201).json({ transaction });
});

module.exports = router;
```

- [ ] **Step 4: Run test to verify it passes**
Run: `cd backend; npx jest tests/transactions.test.js`

- [ ] **Step 5: Commit**
```powershell
git add backend/src/ backend/tests/
git commit -m "feat: implement basic transaction creation route"
```
