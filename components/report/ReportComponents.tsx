import React from 'react'

const NAVY = '#0B3C5D'
const GOLD = '#C9A227'
const GOLDL = '#E4D48E'
const WHITE = '#FFFFFF'
const BG = '#F5F7FA'
const TEXT = '#1A1A2E'
const MUTED = '#6B7280'
const SUCCESS = '#10B981'
const WARNING = '#F59E0B'
const DANGER = '#EF4444'

export function ComplianceCard({
  score,
  label,
  icon,
  color = SUCCESS,
}: {
  score: number
  label: string
  icon: string
  color?: string
}) {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
        backdropFilter: 'blur(10px)',
        border: `2px solid ${color}30`,
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'center',
        boxShadow: `0 8px 32px rgba(0,0,0,0.08)`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(-8px)'
        el.style.boxShadow = `0 16px 48px rgba(0,0,0,0.12), inset 0 0 40px ${color}10`
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)'
      }}
    >
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>{icon}</div>
      <div
        style={{
          fontSize: '28px',
          fontWeight: '800',
          color: color,
          lineHeight: 1,
          marginBottom: '8px',
        }}
      >
        {score}%
      </div>
      <div style={{ fontSize: '12px', fontWeight: '600', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
    </div>
  )
}

export function FindingCard({
  number,
  clause,
  title,
  question,
  severity = 'high',
  notes,
}: {
  number: number
  clause: string
  title: string
  question: string
  severity?: 'high' | 'medium' | 'low'
  notes?: string
}) {
  const severityColor = severity === 'high' ? DANGER : severity === 'medium' ? WARNING : SUCCESS
  const severityLabel = severity === 'high' ? 'Critical' : severity === 'medium' ? 'Major' : 'Minor'

  return (
    <div
      style={{
        background: WHITE,
        border: `1px solid ${MUTED}20`,
        borderLeft: `4px solid ${severityColor}`,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.boxShadow = `0 8px 24px rgba(0,0,0,0.1), inset 0 0 30px ${severityColor}08`
        el.style.transform = 'translateX(4px)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'
        el.style.transform = 'translateX(0)'
      }}
    >
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: severityColor,
            color: WHITE,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: '800',
            flexShrink: 0,
          }}
        >
          {number}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: '700', color: TEXT }}>
              {clause}
            </span>
            <span
              style={{
                fontSize: '8px',
                fontWeight: '700',
                background: `${severityColor}15`,
                color: severityColor,
                padding: '3px 8px',
                borderRadius: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}
            >
              {severityLabel}
            </span>
          </div>
          <div style={{ fontSize: '11px', fontWeight: '700', color: NAVY, marginBottom: '6px' }}>
            {title}
          </div>
          <div style={{ fontSize: '9px', color: TEXT, lineHeight: '1.6', marginBottom: '8px' }}>
            {question}
          </div>
          {notes && (
            <div
              style={{
                fontSize: '9px',
                color: severityColor,
                background: `${severityColor}08`,
                padding: '8px',
                borderRadius: '6px',
                borderLeft: `2px solid ${severityColor}`,
                paddingLeft: '10px',
              }}
            >
              💭 {notes}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function StatisticBox({
  icon,
  label,
  value,
  unit = '',
  color = GOLD,
}: {
  icon: string
  label: string
  value: number | string
  unit?: string
  color?: string
}) {
  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${color}08, ${color}03)`,
        border: `1px solid ${color}30`,
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <div style={{ fontSize: '24px' }}>{icon}</div>
      <div>
        <div style={{ fontSize: '10px', fontWeight: '600', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
          {label}
        </div>
        <div style={{ fontSize: '18px', fontWeight: '800', color: color }}>
          {value}
          {unit && <span style={{ fontSize: '12px', marginLeft: '4px' }}>{unit}</span>}
        </div>
      </div>
    </div>
  )
}

export function RecommendationCard({
  icon,
  title,
  description,
  priority = 'high',
}: {
  icon: string
  title: string
  description: string
  priority?: 'high' | 'medium' | 'low'
}) {
  const priorityColor = priority === 'high' ? DANGER : priority === 'medium' ? WARNING : SUCCESS

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${WHITE}, ${priorityColor}03)`,
        border: `1px solid ${priorityColor}30`,
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '12px',
      }}
    >
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <div style={{ fontSize: '20px' }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: NAVY }}>
              {title}
            </span>
            <span
              style={{
                fontSize: '7px',
                fontWeight: '700',
                background: priorityColor,
                color: WHITE,
                padding: '2px 6px',
                borderRadius: '4px',
                textTransform: 'uppercase',
              }}
            >
              P{priority.charAt(0).toUpperCase()}
            </span>
          </div>
          <div style={{ fontSize: '9px', color: TEXT, lineHeight: '1.5' }}>
            {description}
          </div>
        </div>
      </div>
    </div>
  )
}

export function SectionDivider() {
  return (
    <div
      style={{
        height: '1px',
        background: `linear-gradient(90deg, transparent, ${GOLD}40, transparent)`,
        margin: '32px 0',
      }}
    />
  )
}

export function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.5))',
        backdropFilter: 'blur(10px)',
        border: `1px solid rgba(255,255,255,0.6)`,
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      }}
    >
      {children}
    </div>
  )
}

export function Badge({
  text,
  color = GOLD,
  icon = '',
}: {
  text: string
  color?: string
  icon?: string
}) {
  return (
    <span
      style={{
        display: 'inline-block',
        background: `${color}15`,
        color: color,
        padding: '6px 12px',
        borderRadius: '8px',
        fontSize: '10px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        border: `1px solid ${color}30`,
      }}
    >
      {icon && <span style={{ marginRight: '4px' }}>{icon}</span>}
      {text}
    </span>
  )
}
