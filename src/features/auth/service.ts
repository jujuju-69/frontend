// app/auth/service.ts
import { clearToken, saveToken } from '../../../storage/storage';
// Update the import path below to the correct location of your api module.
// For example, if api.ts is in src/lib/api.ts, use:
import { api } from '../../constants/api';

export type AuthUser = { id:number; name:string; email:string };

export async function register(payload: {
  name:string; email:string; password:string; password_confirmation:string; device_name?:string;
}) {
  const { data } = await api.post('/auth/register', payload);
  await saveToken(data.token);
  return data.user as AuthUser;
}

export async function login(payload: {
  email:string; password:string; device_name?:string;
}) {
  const { data } = await api.post('/auth/login', payload);
  await saveToken(data.token);
  return data.user as AuthUser;
}

export async function logout() {
  try { await api.post('/auth/logout'); } catch {}
  await clearToken();
}
