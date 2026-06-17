const express = require('express');
const cors = require('cors');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const QRCode = require('qrcode');

const app = express();
app.use(cors());
app.use(express.json());

let sock;
let currentQR = '';
let isConnected = false;

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info');
    
    sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' })
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            currentQR = await QRCode.toDataURL(qr);
            console.log('Nuevo QR generado. Puedes verlo abriendo /qr en el navegador.');
        }

        if (connection === 'close') {
            isConnected = false;
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Conexión cerrada. Re-conectar:', shouldReconnect);
            if (shouldReconnect) connectToWhatsApp();
        } else if (connection === 'open') {
            isConnected = true;
            currentQR = '';
            console.log('¡WhatsApp conectado y listo!');
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

// Iniciar WhatsApp al arrancar el servidor
connectToWhatsApp();

// --- RUTAS DEL WORKER ---

app.get('/', (req, res) => {
    res.json({ 
        service: 'Carwash WhatsApp Worker', 
        status: isConnected ? 'Online' : 'Esperando escanear QR' 
    });
});

app.get('/qr', (req, res) => {
    if (isConnected) return res.send('<h1 style="font-family:sans-serif; text-align:center; margin-top:50px;">✅ WhatsApp ya está conectado.</h1>');
    if (!currentQR) return res.send('<h1 style="font-family:sans-serif; text-align:center; margin-top:50px;">⏳ Generando QR... recarga en unos segundos.</h1>');
    
    res.send(`
        <div style="font-family:sans-serif; text-align:center; margin-top:50px;">
            <h1>Escanea este QR con el WhatsApp de tu negocio</h1>
            <img src="${currentQR}" style="width: 300px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);" />
            <p>El código cambiará cada 30 segundos.</p>
        </div>
    `);
});

app.post('/send-ticket', async (req, res) => {
    const { phone, text, apiKey } = req.body;
    
    // Seguridad básica: Solo Next.js conoce esta llave
    const secretKey = process.env.API_KEY || 'CARWASH_SECRET_123';
    if (apiKey !== secretKey) {
        return res.status(401).json({ error: 'No autorizado' });
    }

    if (!isConnected) {
        return res.status(503).json({ error: 'WhatsApp no está conectado. Avisa al administrador.' });
    }

    try {
        // Asegurarse de que el número empiece con el código de país (ej. 51 para Perú)
        // En un caso real habría que limpiar el número de espacios y signos +
        const cleanPhone = phone.replace(/\D/g, ''); 
        const jid = `${cleanPhone}@s.whatsapp.net`;
        
        await sock.sendMessage(jid, { text });
        res.json({ success: true, message: 'Ticket de cobro enviado exitosamente al ' + cleanPhone });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Falló el envío del mensaje en Baileys' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Worker de WhatsApp corriendo en el puerto ${PORT}`);
});
