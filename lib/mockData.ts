import { Program, User } from "./types";

export const MOCK_USERS: User[] = [
  {
    id: "coach-1",
    name: "Coach Marco",
    email: "coach@fitplanner.com",
    role: "coach",
    oneRMs: [],
  },
  {
    id: "athlete-1",
    name: "Marco Atleta",
    email: "athlete@fitplanner.com",
    password: "Athlete123",
    role: "athlete",
    oneRMs: [
      { exercise: "Squat", value: 180 },
      { exercise: "Panca Piana", value: 120 },
      { exercise: "Stacco da Terra", value: 210 },
    ],
  },
  {
    id: "user-matteo",
    name: "Matteop",
    email: "matteo@fitplanner.com",
    password: "Fitab123456",
    role: "coach",
    oneRMs: [],
  },
];

export const MOCK_PROGRAMS: Program[] = [
  {
    id: "prog-1",
    title: "Blocco Ipertrofia 01",
    coachId: "user-matteo",
    athleteId: "athlete-1",
    createdAt: new Date().toISOString(),
    weeks: [
      {
        id: "week-1",
        order: 1,
        sessions: [
          {
            id: "sess-1",
            title: "PARTE INFERIORE (A)",
            order: 1,
            exercises: [
              { id: "ex-1", name: "Squat", sets: 4, reps: 5, percentage: 80, load: 144 },
              { id: "ex-2", name: "Stacco Rumeno", sets: 3, reps: 10, load: 110 },
            ],
          },
        ],
      },
      {
        id: "week-2",
        order: 2,
        sessions: [],
      },
    ],
  },
];
