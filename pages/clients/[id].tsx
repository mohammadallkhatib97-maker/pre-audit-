import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '../../components/layout/Layout'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'
import { supabase } from '../../lib/supabase'
import { AuditClient, Audit } from '../../lib/types'
import { formatDate } from '../../lib/utils'
import { theme, gradient, shadow } from '../../lib/theme'
import { ISO_STANDARDS } from '../../lib/constants'

export default function ClientDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const [client, setClient] = useState<AuditClient | null>(null)
  const [audits, setAudits] = useState<Audit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (id) fetchData() }, [id])

  const fetchData = async () => {
    const [clientRes, auditsRes] = await Promise.all([
      supabase.from('audit_clients').select('*').eq('id', id).single(),
      supabase.from('audit_list_view').select('*').eq('client_id', id).order('created_at', { ascending: false }),
    ])
    setClient(clientRes.data)
    setAudits((auditsRes.data || []) as Audit[])
    setLoading(false)
  }

  const card: React.CSSProperties = {
    background: 'white', borderRadius: '1rem',
    border: `1px solid ${theme.border}`,
    boxShadow: shadow.md, padding: '1.5rem',
    marginBottom: '1.25rem',
  }

  if (loading) return (
    <Layout title="Client">
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
        <div style={{ width: 40, height: 40, border: `3px solid rgba(201,162,39,0.2)`, borderTopColor: theme.goldDark, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </Layout>
  )

  if (!client) return (
    <Layout title="Not Found">
      <div style={{ textAlign: 'center', padding: '5rem' }}>
        <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</p>
        <p style={{ color: theme.muted, marginBottom: '1.5rem' }}>Client not found</p>
        <Link href="/clients" style={{ background: gradient.navy, color: 'white', padding: '0.625rem 1.25rem', borderRadius: '0.625rem', textDecoration: 'none', fontWeight: '600' }}>
          ← Back to Clients
        </Link>
      </div>
    </Layout>
  )

  return (
    <Layout title={client.company_name}>
      <PageHeader
        title={client.company_name}
        subtitle={`${client.industry} · ${client.country}`}
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Clients', href: '/clients' },
          { label: client.company_name },
        ]}
        action={
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link href={`/clients/${id}/edit`} style={{
              padding: '0.625rem 1.25rem', borderRadius: '0.625rem',
              border: `1px solid ${theme.border}`, background: 'white',
              color: theme.text, textDecoration: 'none', fontWeight: '600', fontSize: '0.875rem',
            }}>✏️ Edit</Link>
            <Link href={`/audits/new?client=${id}`} style={{
              padding: '0.625rem 1.25rem', borderRadius: '0.625rem',
              background: gradient.navy, color: 'white',
              textDecoration: 'none', fontWeight: '600', fontSize: '0.875rem',
              boxShadow: shadow.navy,
            }}>+ New Audit</Link>
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
        <div>
          {/* Info */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <div style={{ width: 4, height: 18, background: gradient.gold, borderRadius: 2 }} />
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: theme.navy, margin: 0 }}>Company Details</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              {[
                { label: 'Company',  value: client.company_name   },
                { label: 'Contact',  value: client.client_name    },
                { label: 'Industry', value: client.industry        },
                { label: 'Country',  value: client.country         },
                { label: 'City',     value: client.city || '—'    },
                { label: 'Email',    value: client.email || '—'   },
                { label: 'Phone',    value: client.phone || '—'   },
                { label: 'Website',  value: client.website || '—' },
              ].map(item => (
                <div key={item.label}>
                  <p style={{ fontSize: '0.7rem', color: theme.muted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.25rem' }}>
                    {item.label}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: theme.text, fontWeight: '500', margin: 0 }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
            {client.notes && (
              <div style={{ marginTop: '1.25rem', padding: '1rem', background: theme.bg, borderRadius: '0.625rem', borderLeft: `3px solid ${theme.goldDark}` }}>
                <p style={{ fontSize: '0.7rem', color: theme.muted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.375rem' }}>Notes</p>
                <p style={{ fontSize: '0.875rem', color: theme.text, margin: 0 }}>{client.notes}</p>
              </div>
            )}
          </div>

          {/* Audits */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 4, height: 18, background: gradient.navy, borderRadius: 2 }} />
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: theme.navy, margin: 0 }}>Audit History</h3>
              </div>
              <span style={{ background: 'rgba(11,60,93,0.08)', color: theme.navy, padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700' }}>
                {audits.length} audits
              </span>
            </div>

            {audits.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: theme.muted }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
                <p style={{ marginBottom: '1rem' }}>No audits yet for this client</p>
                <Link href={`/audits/new?client=${id}`} style={{
                  background: gradient.navy, color: 'white',
                  padding: '0.625rem 1.25rem', borderRadius: '0.625rem',
                  textDecoration: 'none', fontWeight: '600', fontSize: '0.875rem',
                }}>+ Start First Audit</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {audits.map(audit => (
                  <Link key={audit.id} href={`/audits/${audit.id}`} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.875rem 1rem', borderRadius: '0.75rem',
                    border: `1px solid ${theme.border}`, textDecoration: 'none',
                    background: 'white', transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(233,196,106,0.05)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,162,39,0.3)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white'; (e.currentTarget as HTMLElement).style.borderColor = theme.border }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                      <span style={{ fontFamily: 'monospace', color: theme.goldDark, fontWeight: '700', fontSize: '0.8rem' }}>
                        {audit.audit_number}
                      </span>
                      <span style={{ background: 'rgba(201,162,39,0.1)', color: theme.goldDark, padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: '700' }}>
                        {ISO_STANDARDS[audit.standard]?.label}
                      </span>
                      <span style={{ color: theme.muted, fontSize: '0.8rem' }}>{formatDate(audit.audit_date)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      {audit.compliance_score != null && (
                        <span style={{ fontWeight: '700', fontSize: '0.875rem', color: audit.compliance_score >= 85 ? theme.success : audit.compliance_score >= 70 ? theme.warning : theme.danger }}>
                          {audit.compliance_score}%
                        </span>
                      )}
                      <Badge value={audit.status} type="status" />
                      <span style={{ color: theme.muted, fontSize: '0.8rem' }}>→</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats sidebar */}
        <div>
          <div style={{ ...card, background: gradient.navy, border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <div style={{ width: 4, height: 16, background: gradient.gold, borderRadius: 2 }} />
              <p style={{ color: 'white', fontWeight: '700', margin: 0 }}>Client Statistics</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '1rem' }}>
              {[
                { label: 'Total Audits',   value: audits.length,                                              color: 'white' },
                { label: 'Completed',      value: audits.filter(a => a.status === 'completed').length,        color: '#4ade80' },
                { label: 'In Progress',    value: audits.filter(a => a.status === 'in_progress').length,      color: '#60a5fa' },
                { label: 'High Risk',      value: audits.filter(a => a.risk_level === 'high' || a.risk_level === 'critical').length, color: '#f87171' },
              ].map(item => (
                <div key={item.label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '0.625rem', padding: '0.75rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '1.5rem', fontWeight: '800', color: item.color, margin: 0 }}>{item.value}</p>
                  <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{item.label}</p>
                </div>
              ))}
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.06)', borderRadius: '0.625rem', textAlign: 'center' }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', margin: '0 0 0.25rem' }}>Avg. Compliance</p>
              <p style={{ fontSize: '1.75rem', fontWeight: '800', color: theme.gold, margin: 0 }}>
                {audits.filter(a => a.compliance_score != null).length > 0
                  ? Math.round(audits.filter(a => a.compliance_score != null).reduce((s, a) => s + a.compliance_score!, 0) / audits.filter(a => a.compliance_score != null).length)
                  : 0}%
              </p>
            </div>
          </div>

          <div style={{ ...card, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <p style={{ color: theme.success, fontWeight: '700', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
              📅 Member Since
            </p>
            <p style={{ color: theme.text, fontWeight: '600', margin: 0 }}>
              {formatDate(client.created_at)}
            </p>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </Layout>
  )
}