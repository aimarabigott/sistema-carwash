# Fase 5: Integración Multi-sede de WhatsApp (Baileys) - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development.

**Goal:** Implementar el motor multisesión de Baileys, persistir las configuraciones de mensajes y enganchar el envío automático al flujo de cobros.
**Tech Stack:** Node.js, Express, Prisma, Baileys, qrcode, React.

---

### Task 1: Actualización de Base de Datos
**Files:**
- Modify: `backend/prisma/schema.prisma`

- [ ] **Step 3: Write minimal implementation**
Añadir al modelo `Location`:
```prisma
  whatsappMessage String?
  whatsappImage   String?
  whatsappConnected Boolean @default(false)
```
Run: `npx prisma db push` o `npx prisma generate` (para ambiente local).
- [ ] **Step 5: Commit**
`git add backend/prisma`
`git commit -m "feat: add whatsapp config fields to Location model"`

### Task 2: Servicio de Baileys (Backend)
**Files:**
- Create: `backend/src/services/whatsapp.js`
- Create: `backend/src/routes/whatsapp.js`

- [ ] **Step 3: Write minimal implementation**
Install dependencies: `npm install @whiskeysockets/baileys qrcode pino`
Create `whatsapp.js` con una clase o función que maneje diccionarios de conexiones (`const sessions = {}`) y la lógica de `makeWASocket`.
Create `routes/whatsapp.js` con endpoints:
`GET /qr/:locationId` -> Devuelve un string en base64 del QR para esa sede.
`POST /config/:locationId` -> Guarda el `whatsappMessage` en la DB.
- [ ] **Step 5: Commit**
`git add backend/src`
`git commit -m "feat: implement baileys multisesion whatsapp service"`

### Task 3: Trigger Automático en Transacciones
**Files:**
- Modify: `backend/src/routes/transactions.js`

- [ ] **Step 3: Write minimal implementation**
En la ruta POST de transacciones, una vez que la venta se guarda:
```javascript
if (customerPhone) {
  const location = await prisma.location.findUnique({where: {id: locationId}});
  if (location && location.whatsappConnected && location.whatsappMessage) {
     // Enviar asíncronamente
     whatsappService.sendMessage(locationId, customerPhone, location.whatsappMessage);
  }
}
```
- [ ] **Step 5: Commit**
`git add backend/src/routes/transactions.js`
`git commit -m "feat: add whatsapp trigger on successful transaction"`

### Task 4: Panel de Configuración (Frontend)
**Files:**
- Create: `frontend/pages/settings/whatsapp.js`

- [ ] **Step 3: Write minimal implementation**
Interfaz para el Manager donde puede:
1. Solicitar y ver el QR de su sede (`<img src={qrBase64} />`).
2. Escribir su mensaje de texto personalizado y guardarlo.
- [ ] **Step 5: Commit**
`git add frontend/pages/settings`
`git commit -m "feat: add whatsapp configuration screen"`
