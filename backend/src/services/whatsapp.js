const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');

const sessions = {};

async function startWhatsAppSession(locationId, onQrCallback) {
  const sessionPath = path.join(__dirname, `../../sessions/${locationId}`);
  if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, qr } = update;
    if (qr && onQrCallback) {
      onQrCallback(qr);
    }
    if (connection === 'open') {
      sessions[locationId] = sock;
      console.log(`WhatsApp connected for location: ${locationId}`);
    } else if (connection === 'close') {
      delete sessions[locationId];
      console.log(`WhatsApp disconnected for location: ${locationId}`);
    }
  });

  sessions[locationId] = sock;
  return sock;
}

async function sendMessage(locationId, phone, message) {
  const sock = sessions[locationId];
  if (sock) {
    const jid = `${phone}@s.whatsapp.net`;
    await sock.sendMessage(jid, { text: message });
  } else {
    throw new Error('WhatsApp not connected for this location');
  }
}

module.exports = { startWhatsAppSession, sendMessage };
