import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Invalid email or password. Please try again.')
      setLoading(false)
      return
    }
    router.push('/dashboard')
  }

  return (
    <>
      <Head><title>Login — Pioneers Audit System</title></Head>
      <div style={{
        minHeight: '100vh', display: 'flex',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        {/* Left Panel */}
        <div style={{
          width: '50%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          padding: '3rem', position: 'relative', overflow: 'hidden',
        }} className="hide-mobile">
          {/* Top gold bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
            background: 'linear-gradient(90deg, #c9a227, #e4d48e, #c9a227)',
          }} />
          {/* Bottom gold bar */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px',
            background: 'linear-gradient(90deg, #c9a227, #e4d48e, #c9a227)',
          }} />

          {/* Decorative circles */}
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: `${i * 120}px`, height: `${i * 120}px`,
              border: '1px solid rgba(201,162,39,0.08)',
              borderRadius: '50%', pointerEvents: 'none',
            }} />
          ))}

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            {/* Logo placeholder */}
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'rgba(201,162,39,0.15)',
              border: '2px solid rgba(201,162,39,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 2rem',
              fontSize: '2rem',
            }}>✦</div>

            <h1 style={{
              color: 'white', fontSize: '2.5rem', fontWeight: '600',
              marginBottom: '0.5rem', letterSpacing: '0.05em',
            }}>PIONEERS</h1>

            <div style={{
              height: '1px', width: '80px', margin: '1rem auto',
              background: 'linear-gradient(90deg, transparent, #c9a227, transparent)',
            }} />

            <p style={{ color: '#c9a227', fontSize: '0.75rem', letterSpacing: '0.3em',
              textTransform: 'uppercase', marginBottom: '3rem' }}>
              ISO Audit Management System
            </p>

            <div style={{ textAlign: 'left', maxWidth: '260px' }}>
              {[
                'Multi-Standard ISO Support',
                'Professional Report Generation',
                'Real-time Audit Tracking',
                'Enterprise-Grade Security',
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  marginBottom: '0.875rem',
                }}>
                  <span style={{ color: '#c9a227', fontSize: '0.75rem' }}>✦</span>
                  <span style={{ color: '#b0b0b0', fontSize: '0.875rem' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <p style={{
            position: 'absolute', bottom: '1.5rem',
            color: '#4f4f4f', fontSize: '0.75rem',
          }}>
            © {new Date().getFullYear()} Pioneers Consulting. All rights reserved.
          </p>
        </div>

        {/* Right Panel */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: '2rem',
          backgroundColor: 'white',
        }}>
          <div style={{ width: '100%', maxWidth: '420px' }}>

            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                marginBottom: '0.5rem',
              }}>
                <span style={{ fontSize: '0.75rem', color: '#c9a227',
                  fontWeight: '600', letterSpacing: '0.15em',
                  textTransform: 'uppercase' }}>
                  ⬡ Secure Access
                </span>
              </div>
              <h2 style={{
                fontSize: '2rem', fontWeight: '600',
                color: '#1a1a2e', marginBottom: '0.25rem',
              }}>Welcome back</h2>
              <p style={{ color: '#6d6d6d', fontSize: '0.9rem' }}>
                Sign in to your audit portal
              </p>
            </div>

            {error && (
              <div style={{
                marginBottom: '1.5rem', padding: '1rem',
                background: '#fee2e2', border: '1px solid #fca5a5',
                borderRadius: '0.5rem', color: '#b91c1c', fontSize: '0.875rem',
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{
                  display: 'block', fontSize: '0.875rem', fontWeight: '500',
                  color: '#4f4f4f', marginBottom: '0.5rem',
                }}>Email Address</label>
                <input
                  type="email"
                  placeholder="auditor@pioneers.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '0.75rem 1rem',
                    border: '1px solid #d1d1d1', borderRadius: '0.5rem',
                    fontSize: '0.875rem', outline: 'none',
                    fontFamily: 'inherit', boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#c9a227'}
                  onBlur={e => e.target.style.borderColor = '#d1d1d1'}
                />
              </div>

              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{
                  display: 'block', fontSize: '0.875rem', fontWeight: '500',
                  color: '#4f4f4f', marginBottom: '0.5rem',
                }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={{
                      width: '100%', padding: '0.75rem 3rem 0.75rem 1rem',
                      border: '1px solid #d1d1d1', borderRadius: '0.5rem',
                      fontSize: '0.875rem', outline: 'none',
                      fontFamily: 'inherit', boxSizing: 'border-box',
                    }}
                    onFocus={e => e.target.style.borderColor = '#c9a227'}
                    onBlur={e => e.target.style.borderColor = '#d1d1d1'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: 'absolute', right: '0.75rem', top: '50%',
                      transform: 'translateY(-50%)', background: 'none',
                      border: 'none', cursor: 'pointer', color: '#888',
                      fontSize: '0.875rem', padding: '0.25rem',
                    }}
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '0.875rem',
                  background: loading ? '#d4b84a' : '#a8841d',
                  color: 'white', border: 'none', borderRadius: '0.5rem',
                  fontSize: '0.9rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '0.5rem', transition: 'background 0.2s', fontFamily: 'inherit',
                }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: '16px', height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white', borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                      display: 'inline-block',
                    }} />
                    Signing in...
                  </>
                ) : '→ Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div style={{
              height: '1px', margin: '2rem 0',
              background: 'linear-gradient(to right, transparent, #c9a227, transparent)',
            }} />

            <p style={{
              textAlign: 'center', fontSize: '0.875rem', color: '#6d6d6d',
            }}>
              Don&apos;t have an account?{' '}
              <a href="/register" style={{
                color: '#a8841d', fontWeight: '600', textDecoration: 'none',
              }}>
                Request Access
              </a>
            </p>

            <p style={{
              textAlign: 'center', fontSize: '0.75rem',
              color: '#b0b0b0', marginTop: '1.5rem',
            }}>
              Protected by enterprise-grade encryption
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .hide-mobile { display: none !important; } }
      `}</style>
    </>
  )
}