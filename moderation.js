const config = require("./config");
const BAD_WORDS = require("./badwords");

const warnings = new Map();

function containsBadWord(text = "") {
  const msg = text.toLowerCase();
  return BAD_WORDS.some(word => msg.includes(word));
}

function containsLink(text = "") {
  return /(https?:\/\/|www\.|chat\.whatsapp\.com)/i.test(text);
}

function addWarning(user) {
  let count = warnings.get(user) || 0;
  count++;
  warnings.set(user, count);
  return count;
}

async function checkMessage(sock, msg) {
  if (!msg.key.remoteJid.endsWith("@g.us")) return;

  const group = msg.key.remoteJid;
  const sender = msg.key.participant;

  const text =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    msg.message?.videoMessage?.caption ||
    "";

  if (!text) return;

  const metadata = await sock.groupMetadata(group);
  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id);

  if (config.IGNORE_OWNER && sender === config.OWNER) return;
  if (config.IGNORE_ADMINS && admins.includes(sender)) return;
  let violated = false;

  if (config.ANTILINK && containsLink(text)) {
    violated = true;
  }

  if (config.ANTIBADWORD && containsBadWord(text)) {
    violated = true;
  }

  if (!violated) return;

  if (config.AUTO_DELETE) {
    await sock.sendMessage(group, {
      delete: msg.key
    });
  }

  const warning = addWarning(sender);

  await sock.sendMessage(group, {
    text: `⚠️ @${sender.split("@")[0]} Warning ${warning}/${config.WARNING_LIMIT}`,
    mentions: [sender]
  });

  if (config.AUTO_KICK && warning >= config.WARNING_LIMIT) {
    await sock.groupParticipantsUpdate(group, [sender], "remove");
    warnings.delete(sender);
  }
}

module.exports = {
  containsBadWord,
  containsLink,
  addWarning,
  warnings,
  checkMessage
};
