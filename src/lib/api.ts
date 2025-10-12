// app/constants/api.ts
import axios from 'axios';
import { getToken } from '../storage/storage';
export const API_BASE_URL = __DEV__
  ? "http://10.198.80.138:8000/api/v1" // if using Android emulator use http://10.0.2.2:8000
  : "https://your-domain.com/api/v1";


  //export const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

   //export const API_BASE_URL = "http://10.198.80.138:8000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Accept': 'application/json' },
});

// attach token automatically
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
