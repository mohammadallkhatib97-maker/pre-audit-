import { CSSProperties, forwardRef } from 'react'
import { theme } from '../../lib/theme'

interface Props {
  label?:       string
  placeholder?: string
  value?:       string
  onChange?:    (e: React.ChangeEvent<HTMLInputElement>) => void
  type?:        string
  required?:    boolean
  disabled?:    boolean
  error?:       string
  hint?:        string
  icon?:        React.ReactNode
  name?:        string
  style?:       CSSProperties
}

const Input = forwardRef<HTMLInputElement, Props>(({
  label, placeholder, value, onChange, type = 'text',
  required, disabled, error, hint, icon, name, style,
}, ref) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      {label && (
        <label style={{
          fontSize: '0.8rem', fontWeight: '600', color: theme.text,
          display: 'flex', alignItems: 'center', gap: '0.25rem',
        }}>
          {label}
          {required && <span style={{ color: theme.danger }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <div style={{
            position: 'absolute', left: '0.75rem', top: '50%',
            transform: 'translateY(-50%)', color: theme.muted,
            display: 'flex', alignItems: 'center',
          }}>{icon}</div>
        )}
        <input
          ref={ref}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          style={{
            width: '100%', padding: icon ? '0.625rem 0.875rem 0.625rem 2.5rem' : '0.625rem 0.875rem',
            border: `1px solid ${error ? theme.danger : theme.border}`,
            borderRadius: '0.625rem', fontSize: '0.875rem',
            background: disabled ? theme.bg : 'white',
            color: theme.text, outline: 'none',
            transition: 'all 0.2s', fontFamily: 'inherit',
            boxSizing: 'border-box',
            ...style,
          }}
          onFocus={e => {
            e.target.style.borderColor = error ? theme.danger : theme.goldDark
            e.target.style.boxShadow = `0 0 0 3px ${error ? 'rgba(220,38,38,0.1)' : 'rgba(201,162,39,0.1)'}`
          }}
          onBlur={e => {
            e.target.style.borderColor = error ? theme.danger : theme.border
            e.target.style.boxShadow = 'none'
          }}
        />
      </div>
      {error && <p style={{ color: theme.danger, fontSize: '0.75rem', margin: 0 }}>⚠ {error}</p>}
      {hint && !error && <p style={{ color: theme.muted, fontSize: '0.75rem', margin: 0 }}>{hint}</p>}
    </div>
  )
})

Input.displayName = 'Input'
export default Input