const express = require('express');
const qrcode = require('qrcode');
const { startWhatsAppSession } = require('../services/whatsapp');
const router = express.Router();

router.get('/qr/:locationId', async (req, res) => {
  const { locationId } = req.params;
  
  await startWhatsAppSession(locationId, async (qrString) => {
    try {
      const qrBase64 = await qrcode.toDataURL(qrString);
      res.json({ qr: qrBase64 });
    } catch (err) {
      res.status(500).json({ error: 'Failed to generate QR' });
    }
  });
});

module.exports = router;
