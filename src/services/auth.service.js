import { api, unwrap } from "@/lib/api";


export function identifierPayload(identifier) {
  const value = identifier.trim();
  return value.includes("@")
    ? { email: value.toLowerCase() }
    : { phone: value.replace(/[\s-]/g, "") };
}

export async function login({ identifier, password }) {
  const envelope = await api.post(
    "/auth/login",
    { ...identifierPayload(identifier), password },
    { auth: false },
  );

  return unwrap(envelope);
}

export async function register({ name, email, phone, password }) {

  const envelope = await api.post(
    "/auth/register",
    { name, email, phone, password },
    { auth: false },
  );

  return unwrap(envelope);
}

export async function sendOtp(phone) {
  return api.post("/auth/send-otp", { phone }, { auth: false });
}

export async function verifyOtp({ phone, otp }) {
  return api.post("/auth/verify-otp", { phone, otp }, { auth: false });
}
