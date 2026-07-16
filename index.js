const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const QRCode = require("qrcode-terminal");
const { checkMessage } = require("./moderation");
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    const phoneNumber = "918601322748"; // Apna number country code ke saath

if (!state.creds.registered) {
  const code = await sock.requestPairingCode(phoneNumber);
  console.log("\n==========================");
  console.log("PAIRING CODE:", code);
  console.log("==========================\n");
}
    version,
    auth: state,
    logger: pino({ level: "silent" }),
    browser: ["WhatsApp Bot", "Chrome", "1.0.0"],
    printQRInTerminal: false
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, qr, lastDisconnect } = update;

    

    if (connection === "open") {
      console.log("✅ Bot Connected");
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;

      console.log("❌ Connection Closed");

      if (shouldReconnect) {
        startBot();
      }
    }
        if (lastDisconnect) {
      console.log(lastDisconnect);
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];

    if (!msg.message) return;
    if (msg.key.fromMe) return;
await checkMessage(sock, msg);
    const from = msg.key.remoteJid;

    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      msg.message.videoMessage?.caption ||
      "";

    console.log("━━━━━━━━━━━━━━━━━━━━");
    console.log("📩 From :", from);
    console.log("💬 Text :", body);
    console.log("━━━━━━━━━━━━━━━━━━━━");
  });

  return sock;
}

startBot().catch(err => {
  console.error("Bot Error:", err);
});
