import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { supabase } from '../../lib/supabase'
import Sidebar from './Sidebar'
import { theme } from '../../lib/theme'

interface Props {
  children:  React.ReactNode
  title?:    string
  noPad?:    boolean
}

export default function Layout({ children, title, noPad }: Props) {
  const [loading, setLoading] = useState(true)
  const [authed,  setAuthed]  = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.replace('/login')
      else setAuthed(true)
      setLoading(false)
    })
  }, [router])

  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: theme.bg, flexDirection: 'column', gap: '1rem',
    }}>
      <div style={{
        width: 48, height: 48,
        border: `3px solid rgba(201,162,39,0.2)`,
        borderTopColor: theme.goldDark,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: theme.muted, fontSize: '0.875rem' }}>Loading...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!authed) return null

  return (
    <>
      <Head>
        <title>{title ? `${title} — Pioneers` : 'Pioneers Audit System'}</title>
      </Head>
      <div style={{ display: 'flex', minHeight: '100vh', background: theme.bg }}>
        <Sidebar />
        <main style={{
          flex: 1, minHeight: '100vh',
          padding: noPad ? 0 : '2rem 2.5rem',
          overflowX: 'hidden',
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
    </>
  )
}