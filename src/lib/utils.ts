import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function roundToK(value: number) {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(2) + "M";
  }
  if (value >= 10000) {
    return Math.round(value / 1000) + "k";
  }
  return value;
}

export function formatSize(mb: number) {
  const sizes = ["MB", "GB", "TB", "PB"];
  if (mb === 0) return "0 MB";
  const i = parseInt(Math.floor(Math.log(mb) / Math.log(1024)).toString());
  let value = mb / Math.pow(1024, i);

  if (i < 2) {
    value = Math.round(value); // Round for MB and GB
  } else {
    value = Math.round(value * 100) / 100; // Keep two decimal places for TB and PB
  }

  return value + " " + sizes[i];
}
