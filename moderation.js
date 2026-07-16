const config = require("./config");
const BAD_WORDS = require("./badwords");

const warnings = new Map();

function containsBadWord(text = "") {
    const msg = text.toLowerCase();

    return BAD_WORDS.some(word => msg.includes(word));
}

function containsLink(text = "") {
    return /(https?:\/\/|www\.|chat\.whatsapp\.com\/)/i.test(text);
}

function addWarning(user) {
    let count = warnings.get(user) || 0;
    count++;
    warnings.set(user, count);
    return count;
}

module.exports = {
    containsBadWord,
    containsLink,
    addWarning,
    warnings
};
