import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  const d = new Date(date)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function timeAgo(date: Date | string) {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const seconds = Math.floor(diff/1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds/60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes/60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours/24)
  if (days < 7) return `${days}d ago`
  return formatDate(d)
}
