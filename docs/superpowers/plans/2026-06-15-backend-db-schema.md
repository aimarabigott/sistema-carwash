# Base de Datos y Backend (Fase 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configurar el backend en Node.js, inicializar Prisma y modelar la estructura de tablas de la Fase 2 mediante TDD.

**Architecture:** Usaremos Express para el backend con Jest para TDD. Prisma ORM modelará las entidades del negocio, asegurando que las tablas mapeen perfectamente con el diseño aprobado.

**Tech Stack:** Node.js, Express, Prisma, PostgreSQL, Jest.

---

### Task 1: Inicialización del Backend y Entorno de Pruebas

**Files:**
- Create: `backend/package.json`
- Create: `backend/tests/setup.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
// backend/tests/setup.test.js
describe('Backend Setup', () => {
  it('should have Prisma Client installed', () => {
    const { PrismaClient } = require('@prisma/client');
    expect(PrismaClient).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && npx jest tests/setup.test.js`
Expected: FAIL (Cannot find module)

- [ ] **Step 3: Write minimal implementation**

```bash
mkdir backend
cd backend
npm init -y
npm install express cors dotenv
npm install --save-dev jest supertest prisma
npx prisma init
npm install @prisma/client
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && npx jest tests/setup.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/
git commit -m "chore: setup backend project with jest and prisma"
```

### Task 2: Definir el Esquema Maestro en Prisma

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/tests/schema.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
// backend/tests/schema.test.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Prisma Schema Validation', () => {
  it('debería instanciar todos los modelos correctamente', () => {
    expect(prisma.user).toBeDefined();
    expect(prisma.business).toBeDefined();
    expect(prisma.location).toBeDefined();
    expect(prisma.product).toBeDefined();
    expect(prisma.transaction).toBeDefined();
    expect(prisma.expense).toBeDefined();
  });
  
  afterAll(async () => {
    await prisma.$disconnect();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && npx jest tests/schema.test.js`
Expected: FAIL (models are undefined)

- [ ] **Step 3: Write minimal implementation**
Reemplazar `backend/prisma/schema.prisma` con el siguiente código:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  role      Role     @default(WORKER)
  createdAt DateTime @default(now())

  ownedBusinesses Business[]
  workerProfile   WorkerProfile?
  managedLocation Location? @relation("LocationManager")
}

enum Role {
  SUPER_ADMIN
  OWNER
  MANAGER
  WORKER
}

model WorkerProfile {
  id             String  @id @default(uuid())
  userId         String  @unique
  user           User    @relation(fields: [userId], references: [id])
  locationId     String
  location       Location @relation(fields: [locationId], references: [id])
  commissionType CommissionType @default(NONE)
  commissionValue Float @default(0)
}

enum CommissionType {
  PER_CAR
  PERCENTAGE_TOTAL
  FIXED_AMOUNT
  NONE
}

model Business {
  id               String   @id @default(uuid())
  ownerId          String
  owner            User     @relation(fields: [ownerId], references: [id])
  subscriptionEnd  DateTime?
  isTrial          Boolean  @default(true)
  locations        Location[]
}

model Location {
  id          String   @id @default(uuid())
  businessId  String
  business    Business @relation(fields: [businessId], references: [id])
  name        String
  managerId   String?  @unique
  manager     User?    @relation("LocationManager", fields: [managerId], references: [id])
  
  workers     WorkerProfile[]
  products    Product[]
  transactions Transaction[]
  expenses    Expense[]
}

model Product {
  id          String   @id @default(uuid())
  locationId  String
  location    Location @relation(fields: [locationId], references: [id])
  name        String
  category    Category
  price       Float
  stock       Int?
  
  items       TransactionItem[]
}

enum Category {
  LAVADO
  SERVICIO_ADICIONAL
  PRODUCTO_AUTO
  SNACK
}

model Transaction {
  id           String   @id @default(uuid())
  locationId   String
  location     Location @relation(fields: [locationId], references: [id])
  workerId     String
  customerPhone String?
  customerPlate String?
  paymentMethod PaymentMethod
  totalAmount   Float
  status       Status   @default(COMPLETED)
  cancellationReason String?
  createdAt    DateTime @default(now())

  items        TransactionItem[]
}

enum PaymentMethod {
  CASH
  YAPE
  PLIN
  CARD
}

enum Status {
  IN_PROGRESS
  COMPLETED
  CANCELLED
  PENDING_CANCELLATION
}

model TransactionItem {
  id            String   @id @default(uuid())
  transactionId String
  transaction   Transaction @relation(fields: [transactionId], references: [id])
  productId     String
  product       Product @relation(fields: [productId], references: [id])
  quantity      Int @default(1)
  priceAtSale   Float
}

model Expense {
  id          String   @id @default(uuid())
  locationId  String
  location    Location @relation(fields: [locationId], references: [id])
  workerId    String
  amount      Float
  concept     String
  createdAt   DateTime @default(now())
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && npx prisma generate && npx jest tests/schema.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/prisma/schema.prisma backend/tests/schema.test.js
git commit -m "feat: implement prisma schema based on database design"
```
