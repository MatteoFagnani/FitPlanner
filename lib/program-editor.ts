import { Exercise, Program, Session, Week } from "@/lib/types";

function cloneValue<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

export function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createEmptyExercise(): Exercise {
  return {
    id: createId("ex"),
    name: "",
    sets: 3,
    reps: 10,
    method: "",
    percentageReference: "oneRM",
    notes: "",
  };
}

export function cloneSessionWithFreshIds(session: Session, order: number): Session {
  const sessionClone = cloneValue(session);

  return {
    ...sessionClone,
    id: createId("s"),
    order,
    completed: false,
    exercises: session.exercises.map((exercise) => ({ ...exercise, id: createId("ex") })),
  };
}

export function createInitialWeeks(): Week[] {
  return [
    {
      id: createId("w"),
      order: 1,
      completed: false,
      sessions: [
        {
          id: createId("s"),
          title: "Sessione A",
          order: 1,
          completed: false,
          exercises: [
            {
              id: createId("ex"),
              name: "Squat",
              sets: 3,
              reps: 10,
              method: "RPE 8",
              percentage: 70,
              percentageReference: "oneRM",
              notes: "",
            },
          ],
        },
      ],
    },
  ];
}

export function addWeekToProgram(weeks: Week[]) {
  const lastWeek = weeks[weeks.length - 1];
  const newWeek: Week = {
    ...cloneValue(lastWeek),
    id: createId("w"),
    order: weeks.length + 1,
    completed: false,
    sessions: lastWeek.sessions.map((session, index) => cloneSessionWithFreshIds(session, index + 1)),
  };

  return [...weeks, newWeek];
}

export function removeLastWeekFromProgram(weeks: Week[]) {
  if (weeks.length <= 1) {
    return weeks;
  }

  return weeks.slice(0, -1);
}

export function addSessionToWeek(week: Week): Week {
  return {
    ...week,
    completed: false,
    sessions: [
      ...week.sessions,
      {
        id: createId("s"),
        title: `Sessione ${String.fromCharCode(65 + week.sessions.length)}`,
        order: week.sessions.length + 1,
        completed: false,
        exercises: [createEmptyExercise()],
      },
    ],
  };
}

export function cloneSessionInWeek(week: Week, sessionId: string): Week {
  const sessionToClone = week.sessions.find((session) => session.id === sessionId);
  if (!sessionToClone) {
    return week;
  }

  return {
    ...week,
    completed: false,
    sessions: [
      ...week.sessions,
      {
        ...cloneSessionWithFreshIds(sessionToClone, week.sessions.length + 1),
        title: `${sessionToClone.title} (COPIA)`,
      },
    ],
  };
}

export function addExerciseToWeekSession(week: Week, sessionId: string): Week {
  return {
    ...week,
    sessions: week.sessions.map((session) =>
      session.id === sessionId
        ? { ...session, completed: false, exercises: [...session.exercises, createEmptyExercise()] }
        : session
    ),
  };
}

export function removeLastExerciseFromWeekSession(week: Week, sessionId: string): Week {
  return {
    ...week,
    sessions: week.sessions.map((session) =>
      session.id === sessionId
        ? {
            ...session,
            completed: false,
            exercises:
              session.exercises.length > 1
                ? session.exercises.slice(0, -1)
                : session.exercises,
          }
        : session
    ),
  };
}

export function updateExerciseInWeekSession(
  week: Week,
  sessionId: string,
  exerciseIdx: number,
  field: keyof Exercise,
  value: Exercise[keyof Exercise]
): Week {
  return {
    ...week,
    sessions: week.sessions.map((session) =>
      session.id === sessionId
        ? {
            ...session,
            completed: false,
            exercises: session.exercises.map((exercise, index) =>
              index === exerciseIdx ? { ...exercise, [field]: value } : exercise
            ),
          }
        : session
    ),
  };
}

export function deleteSessionFromWeek(week: Week, sessionId: string): Week {
  if (week.sessions.length <= 1) {
    return week;
  }

  const sessions = week.sessions
    .filter((session) => session.id !== sessionId)
    .map((session, index) => ({ ...session, order: index + 1 }));

  return {
    ...week,
    completed: sessions.length > 0 && sessions.every((session) => session.completed),
    sessions,
  };
}

export function normalizeWeeks(weeks: Week[]): Week[] {
  return weeks.map((week, idx) => {
    const sessions = week.sessions.map((session, sessionIdx) => ({
      ...session,
      order: sessionIdx + 1,
    }));

    return {
      ...week,
      order: idx + 1,
      completed: sessions.length > 0 && sessions.every((session) => session.completed),
      sessions,
    };
  });
}

export function createProgramAthleteIds(program: Program) {
  return program.athleteIds || (program.athleteId ? [program.athleteId] : []);
}
