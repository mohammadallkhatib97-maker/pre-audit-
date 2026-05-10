import { useEffect, useState } from 'react'
import Layout from '../components/layout/Layout'
import PageHeader from '../components/ui/PageHeader'
import Badge from '../components/ui/Badge'
import { supabase } from '../lib/supabase'
import { useProfile } from '../lib/hooks/useProfile'
import { Audit } from '../lib/types'
import { ISO_STANDARDS } from '../lib/constants'
import { formatDate } from '../lib/utils'
import Link from 'next/link'

const S = {
  card: {
    background: 'white', borderRadius: '1rem',
    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
    border: '1px solid #ebebeb', padding: '1.5rem',
  } as React.CSSProperties,
  th: {
    padding: '0.75rem 1rem', textAlign: 'left' as const,
    fontSize: '0.7rem', fontWeight: '700', color: '#888',
    textTransform: 'uppercase' as const, letterSpacing: '0.08em',
    borderBottom: '1px solid #ebebeb', background: '#fafafa',
  },
  td: { padding: '0.875rem 1rem', borderBottom: '1px solid #f5f5f5', color: '#444', verticalAlign: 'middle' as const },
}

export default function ReportsPage() {
  const { profile } = useProfile()
  const [audits, setAudits]   = useState<Audit[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

  useEffect(() => { if (profile) fetchAudits() }, [profile])

  const fetchAudits = async () => {
    let q = supabase
      .from('audit_list_view')
      .select('*')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })

    if (profile?.role !== 'admin') q = q.eq('auditor_id', profile?.id)
    const { data } = await q
    setAudits(data || [])
    setLoading(false)
  }

  const filtered = audits.filter(a =>
    a.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.audit_number?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout title="Reports">
      <PageHeader
        title="Audit Reports"
        subtitle={`${audits.length} completed audits`}
        breadcrumb={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Reports' }]}
      />

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: '400px', marginBottom: '1.5rem' }}>
        <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }}>🔍</span>
        <input
          placeholder="Search reports..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '0.625rem 1rem 0.625rem 2.5rem',
            border: '1px solid #e0e0e0', borderRadius: '0.625rem',
            fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
            fontFamily: 'inherit', background: 'white',
          }}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div style={{ width: 36, height: 36, border: '3px solid #f0e9c5', borderTopColor: '#c9a227', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ ...S.card, textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
          <p style={{ color: '#666', fontWeight: '600', marginBottom: '0.5rem' }}>No reports found</p>
          <p style={{ color: '#aaa', fontSize: '0.875rem' }}>Complete an audit to generate a report</p>
          <Link href="/audits" style={{
            display: 'inline-flex', marginTop: '1.5rem',
            background: 'linear-gradient(135deg,#c9a227,#a8841d)', color: 'white',
            padding: '0.625rem 1.25rem', borderRadius: '0.625rem',
            textDecoration: 'none', fontWeight: '600', fontSize: '0.875rem',
          }}>Go to Audits →</Link>
        </div>
      ) : (
        <div style={S.card}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr>
                  {['Audit No.', 'Client', 'Standard', 'Date', 'Score', 'Result', 'Risk', 'Actions'].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((audit, i) => (
                  <tr key={audit.id}
                    style={{ background: i % 2 === 0 ? 'white' : '#fafafa' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fffbeb'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? 'white' : '#fafafa'}
                  >
                    <td style={S.td}>
                      <span style={{ fontFamily: 'monospace', color: '#c9a227', fontWeight: '700', fontSize: '0.8rem' }}>
                        {audit.audit_number}
                      </span>
                    </td>
                    <td style={S.td}>
                      <p style={{ fontWeight: '600', color: '#1a1a2e', margin: 0, fontSize: '0.875rem' }}>{audit.company_name}</p>
                      <p style={{ color: '#999', fontSize: '0.75rem', margin: 0 }}>{audit.country}</p>
                    </td>
                    <td style={S.td}>
                      <span style={{
                        background: '#fef3c7', color: '#92400e',
                        padding: '0.2rem 0.625rem', borderRadius: '9999px',
                        fontSize: '0.72rem', fontWeight: '700',
                      }}>{ISO_STANDARDS[audit.standard]?.label}</span>
                    </td>
                    <td style={{ ...S.td, whiteSpace: 'nowrap' as const }}>{formatDate(audit.audit_date)}</td>
                    <td style={S.td}>
                      {audit.compliance_score != null ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '60px', height: '6px', background: '#f0f0f0', borderRadius: '9999px', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', borderRadius: '9999px',
                              background: audit.compliance_score >= 85 ? '#16a34a' : audit.compliance_score >= 70 ? '#d97706' : '#dc2626',
                              width: `${audit.compliance_score}%`,
                            }} />
                          </div>
                          <span style={{
                            fontWeight: '700', fontSize: '0.875rem',
                            color: audit.compliance_score >= 85 ? '#15803d' : audit.compliance_score >= 70 ? '#a16207' : '#b91c1c',
                          }}>{audit.compliance_score}%</span>
                        </div>
                      ) : '—'}
                    </td>
                    <td style={S.td}>{audit.result ? <Badge value={audit.result} type="result" /> : '—'}</td>
                    <td style={S.td}>{audit.risk_level ? <Badge value={audit.risk_level} type="risk" /> : '—'}</td>
                    <td style={S.td}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link href={`/audits/${audit.id}`} style={{
                          padding: '0.375rem 0.75rem', borderRadius: '0.5rem',
                          border: '1px solid #e0e0e0', color: '#555',
                          textDecoration: 'none', fontSize: '0.75rem', fontWeight: '500',
                        }}>View</Link>
                        <Link href={`/audits/${audit.id}/report`} style={{
                          padding: '0.375rem 0.75rem', borderRadius: '0.5rem',
                          background: 'linear-gradient(135deg,#c9a227,#a8841d)',
                          color: 'white', textDecoration: 'none',
                          fontSize: '0.75rem', fontWeight: '600',
                        }}>📄 Report</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  )
}