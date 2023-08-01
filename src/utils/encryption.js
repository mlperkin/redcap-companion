import CryptoJS from 'crypto-js';

// const secretKey = generateEncryptionKey(); // Random is more secure but lose data between app restarts
const secretKey = 'your-super-secret-key'; //Good for developing

// Function to generate a strong encryption key
export function generateEncryptionKey() {
  return CryptoJS.lib.WordArray.random(32).toString(); // 32 bytes for AES-256 encryption
}

export function encryptData(data) {
  const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
  return encryptedData;
}

export function decryptData(encryptedData) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData;
  } catch (error) {
    // console.error('Error decrypting data:', error);
    return null;
  }
}
