import express from 'express';
import cors from 'cors';
import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

const SESSIONS_DIR = path.join(__dirname, '..', 'sessions');
if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR);
}

// Mapa de sesiones en memoria
const activeSessions = new Map<string, any>();
const qrCodes = new Map<string, string>();

async function connectToWhatsApp(locationId: string) {
  const sessionPath = path.join(SESSIONS_DIR, locationId);
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }) as any
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      // Convertir QR a Base64 para el frontend
      const qrDataUrl = await QRCode.toDataURL(qr);
      qrCodes.set(locationId, qrDataUrl);
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        connectToWhatsApp(locationId);
      } else {
        // Logged out
        console.log(`Sede ${locationId} DESCONECTADA (Logged Out). Eliminando sesión...`);
        activeSessions.delete(locationId);
        qrCodes.delete(locationId);
        fs.rmSync(sessionPath, { recursive: true, force: true });
        
        // TODO: Enviar webhook al frontend Next.js para actualizar la base de datos a whatsappConnected: false
      }
    } else if (connection === 'open') {
      console.log(`Sede ${locationId} CONECTADA exitosamente!`);
      activeSessions.set(locationId, sock);
      qrCodes.delete(locationId);
      
      // TODO: Enviar webhook al frontend Next.js para actualizar la base de datos a whatsappConnected: true
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

// Iniciar sesiones guardadas al arrancar
fs.readdirSync(SESSIONS_DIR).forEach(locationId => {
  if (fs.statSync(path.join(SESSIONS_DIR, locationId)).isDirectory()) {
    console.log(`Iniciando sesión guardada para sede: ${locationId}`);
    connectToWhatsApp(locationId);
  }
});

// Endpoint para pedir/ver QR
app.get('/qr/:locationId', async (req, res) => {
  const { locationId } = req.params;
  
  if (activeSessions.has(locationId)) {
    return res.json({ connected: true, message: 'Ya está conectado.' });
  }

  // Si no está conectado y no hay QR, iniciar el proceso
  if (!qrCodes.has(locationId)) {
    connectToWhatsApp(locationId);
    return res.json({ connected: false, status: 'GENERATING', message: 'Generando QR, intente en unos segundos.' });
  }

  return res.json({ 
    connected: false, 
    status: 'QR_READY',
    qr: qrCodes.get(locationId) 
  });
});

// Endpoint para enviar mensaje
app.post('/send/:locationId', async (req, res) => {
  const { locationId } = req.params;
  const { phone, message } = req.body;

  const sock = activeSessions.get(locationId);
  if (!sock) {
    return res.status(400).json({ success: false, error: 'Sede no tiene WhatsApp vinculado.' });
  }

  try {
    const formattedPhone = `${phone.replace(/\D/g, '')}@s.whatsapp.net`;
    await sock.sendMessage(formattedPhone, { text: message });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Desvincular manualmente
app.post('/logout/:locationId', async (req, res) => {
  const { locationId } = req.params;
  const sock = activeSessions.get(locationId);
  if (sock) {
    sock.logout();
    res.json({ success: true, message: 'Sesión cerrada exitosamente.' });
  } else {
    res.json({ success: false, message: 'No había sesión activa.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor Multi-Tenant WhatsApp ejecutándose en el puerto ${PORT}`);
});
