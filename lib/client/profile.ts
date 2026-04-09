import { User } from "@/lib/types";
import { requestJson } from "@/lib/client/http";

type ProfileResponse = {
  user: User;
};

type OneRMResponse = {
  oneRMs: User["oneRMs"];
};

export function fetchProfile() {
  return requestJson<ProfileResponse>("/api/profile", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export function saveOneRM(exercise: string, value: number) {
  return requestJson<OneRMResponse>("/api/profile/one-rm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ exercise, value }),
  });
}

export function deleteOneRM(exercise: string) {
  return requestJson<OneRMResponse>("/api/profile/one-rm", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ exercise }),
  });
}
