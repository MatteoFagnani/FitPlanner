import { Program, User } from "@/lib/types";

export function isAssignedToProgram(program: Program, userId: number) {
  return (
    (program.athleteIds && program.athleteIds.includes(userId)) ||
    program.athleteId === userId
  );
}

export function canCoachManageProgram(program: { coachId: number }, user: Pick<User, "id" | "role">) {
  return user.role === "coach" && program.coachId === user.id;
}

export function canUserToggleProgramSession(program: Program, user: Pick<User, "id" | "role">) {
  return canCoachManageProgram(program, user) || (user.role === "athlete" && isAssignedToProgram(program, user.id));
}
