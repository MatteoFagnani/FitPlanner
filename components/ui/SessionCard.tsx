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
  sessionNumber,
  title,
  status,
  exercises,
}: SessionCardProps) {
  return (
    <WorkoutSession
      sessionNumber={sessionNumber}
      title={title}
      status={status}
      exercises={exercises}
    />
  );
}