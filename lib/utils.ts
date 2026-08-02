import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



export function isBillDue(nextDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(nextDate);
  due.setHours(0, 0, 0, 0);

  return due <= today;
}

export function getNextDate(
  currentDate: string,
  frequency: "Daily" | "Weekly" | "Monthly"
): string {
  const date = new Date(currentDate);

  if (frequency === "Daily") {
    date.setDate(date.getDate() + 1);
  } else if (frequency === "Weekly") {
    date.setDate(date.getDate() + 7);
  } else if (frequency === "Monthly") {
    date.setMonth(date.getMonth() + 1);
  }

  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}