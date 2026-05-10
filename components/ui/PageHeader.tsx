import Link from 'next/link'
import { theme, gradient } from '../../lib/theme'
import { ReactNode } from 'react'

interface Props {
  title:       string
  subtitle?:   string
  action?:     ReactNode
  breadcrumb?: { label: string; href?: string }[]
  badge?:      { label: string; color?: string }
}

export default function PageHeader({ title, subtitle, action, breadcrumb, badge }: Props) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      {breadcrumb && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem' }}>
          {breadcrumb.map((item, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              {i > 0 && <span style={{ color: theme.border, fontSize: '0.8rem' }}>/</span>}
              {item.href
                ? <Link href={item.href} style={{ color: theme.muted, fontSize: '0.75rem', textDecoration: 'none',
                    fontWeight: '500', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = theme.navy}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = theme.muted}
                  >{item.label}</Link>
                : <span style={{ color: '#ccc', fontSize: '0.75rem' }}>{item.label}</span>}
            </span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h1 style={{
              fontSize: '1.625rem', fontWeight: '700',
              color: theme.navy, margin: 0,
              fontFamily: 'Cormorant Garamond, serif',
              letterSpacing: '-0.01em',
            }}>{title}</h1>
            {badge && (
              <span style={{
                background: badge.color || gradient.gold,
                color: theme.navy, padding: '0.2rem 0.625rem',
                borderRadius: '9999px', fontSize: '0.7rem', fontWeight: '700',
              }}>{badge.label}</span>
            )}
          </div>
          {subtitle && (
            <p style={{ color: theme.muted, fontSize: '0.875rem', margin: 0 }}>{subtitle}</p>
          )}
        </div>
        {action && <div style={{ flexShrink: 0 }}>{action}</div>}
      </div>

      {/* Elegant divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.25rem' }}>
        <div style={{ width: '32px', height: '3px', background: gradient.gold, borderRadius: '9999px' }} />
        <div style={{ flex: 1, height: '1px', background: theme.border }} />
      </div>
    </div>
  )
}