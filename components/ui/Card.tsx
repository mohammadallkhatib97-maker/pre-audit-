import { useState, ReactNode, CSSProperties } from 'react'
import { theme } from '../../lib/theme'

interface Props {
  children:  ReactNode
  style?:    CSSProperties
  padding?:  string
  hover?:    boolean
  onClick?:  () => void
}

export default function Card({ children, style, padding = '1.5rem', hover, onClick }: Props) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background:    theme.white,
        borderRadius:  '1rem',
        border:        `1px solid ${hovered ? 'rgba(201,162,39,0.3)' : theme.border}`,
        boxShadow:     hovered
          ? '0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(201,162,39,0.1)'
          : '0 2px 12px rgba(0,0,0,0.06)',
        padding,
        transition:    'all 0.25s ease',
        cursor:        onClick ? 'pointer' : 'default',
        transform:     hovered && hover ? 'translateY(-2px)' : 'translateY(0)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}