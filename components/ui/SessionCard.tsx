"use client";

import WorkoutSession from "@/components/ui/WorkoutSession";
import { Exercise } from "@/lib/types";

interface SessionCardProps {
  sessionNumber: number;
  title: string;
  status: "completed" | "upcoming" | "locked";
  exercises: Exercise[];
}

export default function SessionCard({
  title,
  status,
  exercises,
}: SessionCardProps) {
  return (
    <WorkoutSession
      title={title}
      completed={status === "completed"}
      exercises={exercises}
    />
  );
}
