import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function roundToK(value: number) {
  if (value >= 10000) {
    return Math.round(value / 1000) + "k";
  }
  return value;
}
