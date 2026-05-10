import { ReactNode, CSSProperties } from 'react'
import { theme, gradient, shadow } from '../../lib/theme'

interface Props {
  children:  ReactNode
  onClick?:  () => void
  type?:     'button' | 'submit' | 'reset'
  variant?:  'primary' | 'secondary' | 'ghost' | 'danger' | 'gold' | 'navy'
  size?:     'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?:  boolean
  icon?:     ReactNode
  style?:    CSSProperties
  fullWidth?: boolean
}

const variants = {
  primary:   { bg: gradient.navy,  color: 'white', border: 'none', hoverBg: '#1a5276' },
  navy:      { bg: gradient.navy,  color: 'white', border: 'none', hoverBg: '#1a5276' },
  gold:      { bg: gradient.gold,  color: theme.navy,  border: 'none', hoverBg: '#d4a422' },
  secondary: { bg: 'white', color: theme.text,  border: `1px solid ${theme.border}`, hoverBg: theme.bg },
  ghost:     { bg: 'transparent', color: theme.muted, border: 'none', hoverBg: theme.bg },
  danger:    { bg: gradient.danger, color: 'white', border: 'none', hoverBg: '#b91c1c' },
}

const sizes = {
  sm: { padding: '0.4rem 0.875rem', fontSize: '0.8rem',  borderRadius: '0.5rem'  },
  md: { padding: '0.6rem 1.25rem',  fontSize: '0.875rem', borderRadius: '0.625rem' },
  lg: { padding: '0.75rem 1.75rem', fontSize: '1rem',    borderRadius: '0.75rem'  },
}

export default function Button({
  children, onClick, type = 'button', variant = 'primary',
  size = 'md', disabled, loading, icon, style, fullWidth,
}: Props) {
  const v = variants[variant]
  const s = sizes[size]

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        background:    v.bg,
        color:         v.color,
        border:        v.border || 'none',
        borderRadius:  s.borderRadius,
        padding:       s.padding,
        fontSize:      s.fontSize,
        fontWeight:    '600',
        fontFamily:    'inherit',
        cursor:        (disabled || loading) ? 'not-allowed' : 'pointer',
        opacity:       (disabled || loading) ? 0.65 : 1,
        display:       'inline-flex',
        alignItems:    'center',
        justifyContent:'center',
        gap:           '0.5rem',
        transition:    'all 0.2s ease',
        boxShadow:     variant === 'gold'  ? shadow.gold  :
                       variant === 'navy'  ? shadow.navy  :
                       variant === 'primary' ? shadow.navy : 'none',
        width:         fullWidth ? '100%' : 'auto',
        letterSpacing: '0.01em',
        ...style,
      }}
    >
      {loading ? (
        <span style={{
          width: '14px', height: '14px',
          border: '2px solid rgba(255,255,255,0.3)',
          borderTopColor: 'white',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
          display: 'inline-block', flexShrink: 0,
        }} />
      ) : icon}
      {children}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </button>
  )
}