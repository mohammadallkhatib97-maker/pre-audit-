import { useEffect, useState } from 'react'
import Link from 'next/link'
import Layout from '../../components/layout/Layout'
import PageHeader from '../../components/ui/PageHeader'
import { supabase } from '../../lib/supabase'
import { AuditClient } from '../../lib/types'
import { formatDate } from '../../lib/utils'
import { theme, gradient, shadow } from '../../lib/theme'

export default function ClientsPage() {
  const [clients,  setClients]  = useState<AuditClient[]>([])
  const [filtered, setFiltered] = useState<AuditClient[]>([])
  const [search,   setSearch]   = useState('')
  const [loading,  setLoading]  = useState(true)

  useEffect(() => { fetchClients() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(
      clients.filter(c =>
        c.company_name?.toLowerCase().includes(q) ||
        c.client_name?.toLowerCase().includes(q)  ||
        c.industry?.toLowerCase().includes(q)     ||
        c.country?.toLowerCase().includes(q)
      )
    )
  }, [search, clients])

  const fetchClients = async () => {
    const { data } = await supabase
      .from('audit_clients').select('*')
      .eq('is_active', true).order('created_at', { ascending: false })
    setClients(data || [])
    setFiltered(data || [])
    setLoading(false)
  }

  const deleteClient = async (id: string) => {
    if (!confirm('Delete this client?')) return
    await supabase.from('audit_clients').update({ is_active: false }).eq('id', id)
    fetchClients()
  }

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <Layout title="Clients">
      <PageHeader
        title="Audit Clients"
        subtitle={`${clients.length} clients registered`}
        breadcrumb={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Clients' }]}
        action={
          <Link href="/clients/new" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: gradient.navy, color: 'white',
            padding: '0.625rem 1.25rem', borderRadius: '0.625rem',
            textDecoration: 'none', fontWeight: '700', fontSize: '0.875rem',
            boxShadow: shadow.navy,
          }}>+ Add Client</Link>
        }
      />

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: '420px', marginBottom: '1.75rem' }}>
        <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: theme.muted, fontSize: '0.875rem' }}>🔍</span>
        <input
          placeholder="Search by name, company, industry..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '0.625rem 1rem 0.625rem 2.5rem',
            border: `1px solid ${theme.border}`, borderRadius: '0.75rem',
            fontSize: '0.875rem', outline: 'none', background: 'white',
            fontFamily: 'inherit', boxSizing: 'border-box', color: theme.text,
          }}
          onFocus={e => e.target.style.borderColor = theme.goldDark}
          onBlur={e => e.target.style.borderColor = theme.border}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
          <div style={{ width: 40, height: 40, border: `3px solid rgba(201,162,39,0.2)`, borderTopColor: theme.goldDark, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '1rem', border: `1px solid ${theme.border}`, boxShadow: shadow.md, padding: '5rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🏢</div>
          <p style={{ color: theme.navy, fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            {search ? 'No clients found' : 'No clients yet'}
          </p>
          <p style={{ color: theme.muted, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {search ? 'Try a different search term' : 'Add your first audit client to get started'}
          </p>
          {!search && (
            <Link href="/clients/new" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: gradient.navy, color: 'white',
              padding: '0.75rem 1.5rem', borderRadius: '0.625rem',
              textDecoration: 'none', fontWeight: '700', fontSize: '0.875rem',
              boxShadow: shadow.navy,
            }}>+ Add First Client</Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {filtered.map(client => (
            <div key={client.id} style={{
              background: 'white', borderRadius: '1rem',
              border: `1px solid ${theme.border}`,
              boxShadow: shadow.md, overflow: 'hidden',
              transition: 'all 0.25s ease',
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.boxShadow = '0 8px 32px rgba(11,60,93,0.12)'
                el.style.transform = 'translateY(-2px)'
                el.style.borderColor = 'rgba(201,162,39,0.3)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.boxShadow = shadow.md
                el.style.transform = 'translateY(0)'
                el.style.borderColor = theme.border
              }}
            >
              {/* Card top accent */}
              <div style={{ height: '4px', background: gradient.navy }} />

              <div style={{ padding: '1.25rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: '0.75rem',
                      background: gradient.navy,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: theme.gold, fontSize: '0.875rem', fontWeight: '800', flexShrink: 0,
                    }}>
                      {getInitials(client.company_name)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: '700', color: theme.navy, margin: 0, fontSize: '0.95rem',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                        {client.company_name}
                      </p>
                      <p style={{ color: theme.muted, fontSize: '0.78rem', margin: 0 }}>
                        {client.client_name}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
                    <Link href={`/clients/${client.id}/edit`}
                      title="Edit"
                      style={{
                        width: 30, height: 30, borderRadius: '0.5rem',
                        border: `1px solid ${theme.border}`, background: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        textDecoration: 'none', fontSize: '0.75rem', color: theme.muted,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = theme.bg; el.style.color = theme.navy }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'white'; el.style.color = theme.muted }}
                    >✏️</Link>
                    <button
                      onClick={() => deleteClient(client.id)}
                      title="Delete"
                      style={{
                        width: 30, height: 30, borderRadius: '0.5rem',
                        border: `1px solid ${theme.border}`, background: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', fontSize: '0.75rem', color: theme.muted,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#fee2e2'; el.style.borderColor = '#fca5a5'; el.style.color = theme.danger }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'white'; el.style.borderColor = theme.border; el.style.color = theme.muted }}
                    >🗑️</button>
                  </div>
                </div>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <span style={{ width: 20, textAlign: 'center', fontSize: '0.8rem', flexShrink: 0 }}>🏭</span>
                    <span style={{ fontSize: '0.8rem', color: theme.muted }}>{client.industry}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <span style={{ width: 20, textAlign: 'center', fontSize: '0.8rem', flexShrink: 0 }}>📍</span>
                    <span style={{ fontSize: '0.8rem', color: theme.muted }}>
                      {client.city ? `${client.city}, ` : ''}{client.country}
                    </span>
                  </div>
                  {client.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <span style={{ width: 20, textAlign: 'center', fontSize: '0.8rem', flexShrink: 0 }}>✉️</span>
                      <span style={{ fontSize: '0.8rem', color: theme.muted,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>
                        {client.email}
                      </span>
                    </div>
                  )}
                  {client.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <span style={{ width: 20, textAlign: 'center', fontSize: '0.8rem', flexShrink: 0 }}>📞</span>
                      <span style={{ fontSize: '0.8rem', color: theme.muted }}>{client.phone}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  paddingTop: '0.875rem', borderTop: `1px solid ${theme.border}`,
                }}>
                  <span style={{ fontSize: '0.75rem', color: theme.muted }}>
                    Since {formatDate(client.created_at)}
                  </span>
                  <Link href={`/clients/${client.id}`} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                    color: theme.navy, fontWeight: '700', textDecoration: 'none',
                    fontSize: '0.8rem', padding: '0.375rem 0.75rem',
                    borderRadius: '0.5rem', border: `1px solid ${theme.border}`,
                    transition: 'all 0.2s', background: 'white',
                  }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = theme.navy; el.style.color = 'white'; el.style.borderColor = theme.navy }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'white'; el.style.color = theme.navy; el.style.borderColor = theme.border }}
                  >View →</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </Layout>
  )
}