import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateLoad(percentage: number, oneRM: number): number {
  if (!percentage || !oneRM) return 0;
  // Round to nearest 2.5kg (standard plate increment)
  return Math.round((oneRM * (percentage / 100)) / 2.5) * 2.5;
}

