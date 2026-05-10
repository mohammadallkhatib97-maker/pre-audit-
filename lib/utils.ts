import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, fmt = 'dd MMM yyyy') {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, fmt)
}

export function formatDateTime(date: string | Date) {
  return formatDate(date, 'dd MMM yyyy, HH:mm')
}

export function formatFileSize(bytes: number) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getComplianceColor(score: number) {
  if (score >= 85) return 'text-green-600'
  if (score >= 70) return 'text-yellow-600'
  if (score >= 50) return 'text-orange-600'
  return 'text-red-600'
}

export function getComplianceBg(score: number) {
  if (score >= 85) return 'bg-green-500'
  if (score >= 70) return 'bg-yellow-500'
  if (score >= 50) return 'bg-orange-500'
  return 'bg-red-500'
}

export function getAutoResult(score: number): 'pass' | 'conditional' | 'fail' {
  if (score >= 85) return 'pass'
  if (score >= 70) return 'conditional'
  return 'fail'
}

export function getAutoRisk(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 85) return 'low'
  if (score >= 70) return 'medium'
  if (score >= 50) return 'high'
  return 'critical'
}

export function truncate(str: string, length = 40) {
  if (!str) return ''
  return str.length > length ? str.slice(0, length) + '...' : str
}