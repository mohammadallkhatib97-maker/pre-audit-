import { AuditStatus, AnswerStatus, RiskLevel, AuditResult } from '../../lib/types'

const STATUS_MAP: Record<AuditStatus, { bg: string; color: string; label: string }> = {
  draft:       { bg: '#f3f4f6', color: '#6b7280', label: 'Draft'       },
  in_progress: { bg: '#dbeafe', color: '#1d4ed8', label: 'In Progress' },
  completed:   { bg: '#dcfce7', color: '#15803d', label: 'Completed'   },
  archived:    { bg: '#f3f4f6', color: '#9ca3af', label: 'Archived'    },
}

const ANSWER_MAP: Record<AnswerStatus, { bg: string; color: string; label: string }> = {
  compliant:      { bg: '#dcfce7', color: '#15803d', label: 'Compliant'      },
  non_compliant:  { bg: '#fee2e2', color: '#b91c1c', label: 'Non-Compliant'  },
  observation:    { bg: '#fef9c3', color: '#a16207', label: 'Observation'    },
  not_applicable: { bg: '#f3f4f6', color: '#6b7280', label: 'N/A'           },
}

const RISK_MAP: Record<RiskLevel, { bg: string; color: string }> = {
  low:      { bg: '#dcfce7', color: '#15803d' },
  medium:   { bg: '#fef9c3', color: '#a16207' },
  high:     { bg: '#ffedd5', color: '#c2410c' },
  critical: { bg: '#fee2e2', color: '#b91c1c' },
}

const RESULT_MAP: Record<AuditResult, { bg: string; color: string }> = {
  pass:        { bg: '#dcfce7', color: '#15803d' },
  fail:        { bg: '#fee2e2', color: '#b91c1c' },
  conditional: { bg: '#fef9c3', color: '#a16207' },
}

interface Props {
  value:     string
  type:      'status' | 'answer' | 'risk' | 'result'
  className?: string
}

export default function Badge({ value, type }: Props) {
  let bg = '#f3f4f6', color = '#6b7280', label = value

  if (type === 'status' && STATUS_MAP[value as AuditStatus]) {
    const m = STATUS_MAP[value as AuditStatus]; bg = m.bg; color = m.color; label = m.label
  } else if (type === 'answer' && ANSWER_MAP[value as AnswerStatus]) {
    const m = ANSWER_MAP[value as AnswerStatus]; bg = m.bg; color = m.color; label = m.label
  } else if (type === 'risk' && RISK_MAP[value as RiskLevel]) {
    const m = RISK_MAP[value as RiskLevel]; bg = m.bg; color = m.color; label = value
  } else if (type === 'result' && RESULT_MAP[value as AuditResult]) {
    const m = RESULT_MAP[value as AuditResult]; bg = m.bg; color = m.color; label = value
  }

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '0.2rem 0.625rem', borderRadius: '9999px',
      fontSize: '0.72rem', fontWeight: '600',
      background: bg, color,
      textTransform: 'capitalize', whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}