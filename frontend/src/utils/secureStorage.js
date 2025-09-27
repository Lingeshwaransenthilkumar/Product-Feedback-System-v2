import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.REACT_APP_SECRET_KEY || "default_secret";

// Save with encryption + expiry
export const setSecureItem = (key, value, expirySeconds) => {
  try {
    const data = {
      value,
      expiry: Date.now() + expirySeconds * 1000,
    };
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      SECRET_KEY
    ).toString();

    localStorage.setItem(key, encrypted);
  } catch (err) {
    console.error("Error encrypting:", err);
  }
};

// Read with decryption + expiry check
export const getSecureItem = (key) => {
  try {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;

    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    if (Date.now() > decrypted.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return decrypted.value;
  } catch (err) {
    console.error("Error decrypting:", err);
    return null;
  }
};
