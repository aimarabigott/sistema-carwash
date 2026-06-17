const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { sendMessage } = require('../services/whatsapp');
const router = express.Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const { locationId, workerId, paymentMethod, totalAmount, customerPhone } = req.body;
  const transaction = await prisma.transaction.create({
    data: { locationId, workerId, paymentMethod, totalAmount, customerPhone }
  });

  // Disparador de WhatsApp
  if (customerPhone) {
    try {
      const location = await prisma.location.findUnique({ where: { id: locationId } });
      if (location && location.whatsappConnected && location.whatsappMessage) {
        // Intentamos enviar el mensaje sin bloquear la respuesta de la API al frontend
        sendMessage(locationId, customerPhone, location.whatsappMessage).catch(err => {
          console.error('Error enviando WhatsApp en segundo plano:', err.message);
        });
      }
    } catch(e) {
      console.error('Error consultando config de WhatsApp:', e.message);
    }
  }

  res.status(201).json({ transaction });
});

module.exports = router;
