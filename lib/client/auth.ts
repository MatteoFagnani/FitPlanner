import { User } from "@/lib/types";
import { requestJson } from "@/lib/client/http";

type SessionResponse = {
  user: User;
};

export function fetchSession() {
  return requestJson<SessionResponse>("/api/auth/session", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export function loginRequest(identity: string, password: string) {
  return requestJson<SessionResponse>("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ identity, password }),
  });
}

export function logoutRequest() {
  return requestJson<{ success: true }>("/api/auth/logout", {
    method: "POST",
  });
}
