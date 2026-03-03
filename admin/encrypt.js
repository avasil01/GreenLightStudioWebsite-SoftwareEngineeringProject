async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message); // Encode the string into bytes
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);  // Hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // Convert to hex string
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.toUpperCase();
}

module.exports = sha256;
