import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function format(date: Date, formatStr: string): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const day = date.getDate()
  const month = months[date.getMonth()]
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours >= 12 ? "pm" : "am"
  const formattedHours = hours % 12 || 12
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes

  return formatStr
    .replace("MMM", month)
    .replace("d", day.toString())
    .replace("h", formattedHours.toString())
    .replace("mm", formattedMinutes.toString())
    .replace("a", ampm)
}
