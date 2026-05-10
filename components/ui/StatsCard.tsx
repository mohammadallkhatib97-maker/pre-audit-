import { ReactNode } from 'react'

interface Props {
  label:    string
  value:    string | number
  icon?:    ReactNode
  color?:   'gold' | 'green' | 'red' | 'blue' | 'default'
  trend?:   { value: number; label: string }
}

const configs = {
  gold:    { bg: '#fffbeb', border: '#fde68a', icon: '#fef3c7', iconColor: '#92400e' },
  green:   { bg: '#f0fdf4', border: '#bbf7d0', icon: '#dcfce7', iconColor: '#15803d' },
  red:     { bg: '#fff1f2', border: '#fecdd3', icon: '#fee2e2', iconColor: '#be123c' },
  blue:    { bg: '#eff6ff', border: '#bfdbfe', icon: '#dbeafe', iconColor: '#1d4ed8' },
  default: { bg: '#ffffff', border: '#e7e7e7', icon: '#f6f6f6', iconColor: '#4f4f4f' },
}

export default function StatsCard({ label, value, icon, color = 'default', trend }: Props) {
  const c = configs[color]
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: '1rem', padding: '1.25rem',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      display: 'flex', flexDirection: 'column', gap: '0.75rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ color: '#6d6d6d', fontSize: '0.8rem', fontWeight: '500', margin: 0 }}>{label}</p>
        {icon && (
          <div style={{
            width: '38px', height: '38px', borderRadius: '0.625rem',
            background: c.icon, display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: c.iconColor,
          }}>{icon}</div>
        )}
      </div>
      <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1a1a2e', margin: 0 }}>{value}</p>
      {trend && (
        <p style={{ fontSize: '0.75rem', color: trend.value >= 0 ? '#15803d' : '#be123c', margin: 0 }}>
          {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
        </p>
      )}
    </div>
  )
}