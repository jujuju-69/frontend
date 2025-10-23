// config/network.ts
import { Platform } from "react-native";

// Boleh override pakai env (ngrok/production)
const ENV_BASE = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

// IP PC kau (untuk test di telefon sebenar)
const PC_LAN_IP = "192.168.0.147";

// Phone sebenar = true, Emulator = false
const USE_PC_LAN = true;

function resolveDevBase() {
  if (ENV_BASE) return ENV_BASE;                          // env menang
  if (USE_PC_LAN) return `http://${PC_LAN_IP}:8000/api/v1`; // telefon
  const host = Platform.OS === "android" ? "10.0.2.2" : "127.0.0.1"; // emulator
  return `http://${host}:8000/api/v1`;
}

// ===== Satu-satunya nilai yang disebarkan =====
export const API_BASE_URL = __DEV__
  ? resolveDevBase()
  : (ENV_BASE || "https://your-domain.com/api/v1");

// (opsyen debug)
export const debugApiBase = () => console.log("[API_BASE_URL]", API_BASE_URL);
