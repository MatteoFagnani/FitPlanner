import { Program, User } from "@/lib/types";
import { requestJson } from "@/lib/client/http";

type ProgramsResponse = {
  programs: Program[];
};

type ProgramResponse = {
  program: Program;
};

type UsersResponse = {
  users: User[];
};

export function fetchUsers() {
  return requestJson<UsersResponse>("/api/users", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export function fetchPrograms() {
  return requestJson<ProgramsResponse>("/api/programs", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export function createProgramRequest(program: Program) {
  return requestJson<ProgramResponse>("/api/programs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      program: { ...program, status: program.status ?? "active" },
    }),
  });
}

export function updateProgramRequest(program: Program) {
  return requestJson<ProgramResponse>(`/api/programs/${program.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ program }),
  });
}

export function deleteProgramRequest(id: string) {
  return requestJson<{ success: true }>(`/api/programs/${id}`, {
    method: "DELETE",
  });
}

export function patchProgramStatusRequest(id: string, status: NonNullable<Program["status"]>, expectedUpdatedAt: string) {
  return requestJson<ProgramResponse>(`/api/programs/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status, expectedUpdatedAt }),
  });
}

export function toggleProgramSessionCompletionRequest(
  programId: string,
  weekId: string,
  sessionId: string,
  expectedUpdatedAt: string
) {
  return requestJson<ProgramResponse>(`/api/programs/${programId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "toggle-session-completion",
      weekId,
      sessionId,
      expectedUpdatedAt,
    }),
  });
}
