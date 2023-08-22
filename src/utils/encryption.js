
import CryptoJS from 'crypto-js';
const { ipcRenderer } = window.require("electron");
let secretKey = null;

// Function to initialize the secret key
export async function initializeEncryptionKey() {
  secretKey = await ipcRenderer.invoke('generate-unique-id');
  if (!secretKey) {
    console.error('Failed to generate a unique machine ID');
  }
}

export function encryptData(data) {
  if (!secretKey) {
    // console.error('Secret key not initialized');
    return null;
  }

  const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
  return encryptedData;
}

export function decryptData(encryptedData) {
  if (!secretKey) {
    // console.error('Secret key not initialized');
    return null;
  }

  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData;
  } catch (error) {
    return null;
  }
}

// Ensure to call initializeEncryptionKey() when the application starts
initializeEncryptionKey();
