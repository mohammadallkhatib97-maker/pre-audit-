import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useProfile } from '../../lib/hooks/useProfile'
import { supabase } from '../../lib/supabase'
import { getInitials } from '../../lib/utils'
import { theme, gradient, shadow } from '../../lib/theme'

const NAV = [
  { href: '/dashboard', icon: '⊞', label: 'Dashboard',   sub: 'Overview & KPIs'    },
  { href: '/clients',   icon: '◉', label: 'Clients',     sub: 'Manage clients'     },
  { href: '/audits',    icon: '✓', label: 'Audits',      sub: 'Audit sessions'     },
  { href: '/reports',   icon: '≡', label: 'Reports',     sub: 'PDF reports'        },
  { href: '/analytics', icon: '▲', label: 'Analytics',   sub: 'Charts & insights'  },
  { href: '/settings',  icon: '⚙', label: 'Settings',    sub: 'Profile & signature'},
]

const ADMIN_NAV = [
  { href: '/admin/users', icon: '◈', label: 'Users', sub: 'Manage access' },
]

export default function Sidebar() {
  const router = useRouter()
  const { profile } = useProfile()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isActive = (href: string) =>
    router.pathname === href || router.pathname.startsWith(href + '/')

  const w = collapsed ? '72px' : '260px'

  return (
    <>
      <aside style={{
        position: 'fixed', top: 0, left: 0, height: '100vh',
        width: w, background: theme.navy,
        borderRight: `1px solid rgba(255,255,255,0.08)`,
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
        zIndex: 40, overflow: 'hidden',
        boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
      }}>

        {/* Gold top accent */}
        <div style={{ height: '3px', background: gradient.gold, flexShrink: 0 }} />

        {/* Logo */}
        <div style={{
          padding: collapsed ? '1.25rem 0' : '1.25rem 1.25rem',
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0,
          minHeight: '72px',
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '10px', overflow: 'hidden',
                background: 'white', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
                boxShadow: shadow.gold,
              }}>
                <Image src="/logo.png" alt="Pioneers" width={36} height={36}
                  style={{ objectFit: 'contain' }} />
              </div>
              <div>
                <p style={{ color: 'white', fontWeight: '700', fontSize: '0.9rem',
                  margin: 0, fontFamily: 'Cormorant Garamond, serif', letterSpacing: '0.02em' }}>
                  Pioneers
                </p>
                <p style={{ color: theme.gold, fontSize: '0.62rem', margin: 0,
                  letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.9 }}>
                  International Consulting
                </p>
              </div>
            </div>
          )}
          {collapsed && (
            <div style={{
              width: 36, height: 36, borderRadius: '8px', overflow: 'hidden',
              background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Image src="/logo.png" alt="Pioneers" width={32} height={32}
                style={{ objectFit: 'contain' }} />
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto', overflowX: 'hidden' }}>
          {!collapsed && (
            <p style={{
              color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', fontWeight: '700',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              padding: '0 0.5rem', marginBottom: '0.75rem',
            }}>Navigation</p>
          )}

          {NAV.map(item => {
            const active = isActive(item.href)
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center',
                gap: collapsed ? 0 : '0.875rem',
                padding: collapsed ? '0.75rem' : '0.625rem 0.875rem',
                borderRadius: '0.625rem', textDecoration: 'none',
                marginBottom: '0.25rem', transition: 'all 0.2s',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: active
                  ? 'linear-gradient(135deg, rgba(233,196,106,0.15), rgba(201,162,39,0.1))'
                  : 'transparent',
                borderLeft: active ? `3px solid ${theme.gold}` : '3px solid transparent',
                position: 'relative',
              }}
                onMouseEnter={e => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'
                }}
                onMouseLeave={e => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
              >
                <span style={{
                  fontSize: '1.1rem', flexShrink: 0,
                  color: active ? theme.gold : 'rgba(255,255,255,0.5)',
                  width: '20px', textAlign: 'center',
                }}>{item.icon}</span>
                {!collapsed && (
                  <div>
                    <p style={{
                      color: active ? theme.gold : 'rgba(255,255,255,0.85)',
                      fontSize: '0.875rem', fontWeight: active ? '600' : '400',
                      margin: 0, lineHeight: 1.2,
                    }}>{item.label}</p>
                    <p style={{
                      color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem',
                      margin: 0, marginTop: '0.1rem',
                    }}>{item.sub}</p>
                  </div>
                )}
              </Link>
            )
          })}

          {/* Admin */}
          {profile?.role === 'admin' && (
            <>
              {!collapsed && (
                <p style={{
                  color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', fontWeight: '700',
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                  padding: '0 0.5rem', margin: '1rem 0 0.75rem',
                }}>Administration</p>
              )}
              {ADMIN_NAV.map(item => {
                const active = isActive(item.href)
                return (
                  <Link key={item.href} href={item.href} style={{
                    display: 'flex', alignItems: 'center',
                    gap: collapsed ? 0 : '0.875rem',
                    padding: collapsed ? '0.75rem' : '0.625rem 0.875rem',
                    borderRadius: '0.625rem', textDecoration: 'none',
                    marginBottom: '0.25rem', transition: 'all 0.2s',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    background: active ? 'rgba(244,162,97,0.15)' : 'transparent',
                    borderLeft: active ? `3px solid ${theme.orange}` : '3px solid transparent',
                  }}>
                    <span style={{ fontSize: '1.1rem', color: active ? theme.orange : 'rgba(255,255,255,0.4)', width: '20px', textAlign: 'center' }}>
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <div>
                        <p style={{ color: active ? theme.orange : 'rgba(255,255,255,0.7)', fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>
                          {item.label}
                        </p>
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', margin: 0 }}>
                          {item.sub}
                        </p>
                      </div>
                    )}
                  </Link>
                )
              })}
            </>
          )}
        </nav>

        {/* Collapse btn */}
        <div style={{ padding: '0.5rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={() => setCollapsed(!collapsed)} style={{
            width: '100%', padding: '0.5rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '0.5rem', color: 'rgba(255,255,255,0.4)',
            cursor: 'pointer', fontSize: '0.75rem',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '0.375rem',
            transition: 'all 0.2s', fontFamily: 'inherit',
          }}>
            {collapsed ? '→' : '← Collapse'}
          </button>
        </div>

        {/* User */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '0.875rem 0.75rem', flexShrink: 0 }}>
          {!collapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: gradient.gold, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: theme.navy,
                fontSize: '0.75rem', fontWeight: '800', flexShrink: 0,
              }}>
                {getInitials(profile?.full_name || 'U')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: 'white', fontSize: '0.8rem', fontWeight: '600',
                  margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile?.full_name || 'User'}
                </p>
                <p style={{ color: theme.gold, fontSize: '0.65rem', margin: 0, textTransform: 'capitalize', opacity: 0.8 }}>
                  {profile?.role}
                </p>
              </div>
              <button onClick={handleLogout} title="Sign Out" style={{
                background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.2)',
                borderRadius: '0.375rem', cursor: 'pointer',
                color: '#f87171', padding: '0.375rem 0.5rem', fontSize: '0.75rem',
                flexShrink: 0, fontFamily: 'inherit',
              }}>⇥</button>
            </div>
          ) : (
            <button onClick={handleLogout} style={{
              width: '100%', background: 'none', border: 'none',
              cursor: 'pointer', color: 'rgba(255,255,255,0.4)',
              padding: '0.5rem', fontSize: '1rem',
            }}>⇥</button>
          )}
        </div>
      </aside>

      {/* Spacer */}
      <div style={{ width: w, flexShrink: 0, transition: 'width 0.3s' }} />
    </>
  )
}