// src/constants/api.ts
import axios from "axios";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 1) Cuba ambil dari env dulu (senang tukar)
const ENV_BASE = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

// 2) Fallback ikut peranti
const API_PORT = 8000;
// GUNA IP PC YANG BENAR (ikut yang berfungsi di browser: 192.168.0.147)
const PC_LAN = "192.168.0.147";
const EMU_HOST = Platform.OS === "android" ? "10.0.2.2" : "127.0.0.1";

const DEV_BASE_FOR_PHONE = `http://${PC_LAN}:${API_PORT}/api/v1`;
const DEV_BASE_FOR_EMULATOR = `http://${EMU_HOST}:${API_PORT}/api/v1`;

// Pilihan akhir (ubah satu tempat je kalau perlu)
export const API_BASE_URL = ENV_BASE || DEV_BASE_FOR_PHONE;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { Accept: "application/json" },
});

// Suntik token automatik jika ada
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Log error berguna
api.interceptors.response.use(
  (r) => r,
  (e) => {
    console.log(
      "[API ERROR]",
      e?.message,
      "status:", e?.response?.status,
      "url:", e?.config?.url,
      "data:", e?.response?.data
    );
    return Promise.reject(e);
  }
);

console.log("[API] BASE =", API_BASE_URL);
