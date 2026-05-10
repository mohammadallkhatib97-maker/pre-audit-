import { useEffect, useState } from 'react'
import Link from 'next/link'
import Layout from '../../components/layout/Layout'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'
import { supabase } from '../../lib/supabase'
import { useProfile } from '../../lib/hooks/useProfile'
import { Audit, AuditStatus, IsoStandard } from '../../lib/types'
import { ISO_STANDARDS } from '../../lib/constants'
import { formatDate } from '../../lib/utils'
import { theme, gradient, shadow } from '../../lib/theme'

export default function AuditsPage() {
  const { profile }   = useProfile()
  const [audits,   setAudits]   = useState<Audit[]>([])
  const [filtered, setFiltered] = useState<Audit[]>([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [statusF,  setStatusF]  = useState<AuditStatus | ''>('')
  const [stdF,     setStdF]     = useState<IsoStandard | ''>('')

  useEffect(() => { if (profile) fetchAudits() }, [profile])

  useEffect(() => {
    let data = audits
    if (search)  data = data.filter(a =>
      (a as any).company_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.audit_number?.toLowerCase().includes(search.toLowerCase())
    )
    if (statusF) data = data.filter(a => a.status === statusF)
    if (stdF)    data = data.filter(a => a.standard === stdF)
    setFiltered(data)
  }, [search, statusF, stdF, audits])

  const fetchAudits = async () => {
    let q = supabase
      .from('audit_list_view')
      .select('*')
      .order('created_at', { ascending: false })
    if (profile?.role !== 'admin') q = q.eq('auditor_id', profile?.id)
    const { data } = await q
    setAudits((data || []) as Audit[])
    setFiltered((data || []) as Audit[])
    setLoading(false)
  }

  const sel: React.CSSProperties = {
    padding: '0.5rem 0.875rem',
    border: `1px solid ${theme.border}`,
    borderRadius: '0.5rem',
    fontSize: '0.8rem',
    outline: 'none',
    background: 'white',
    color: theme.text,
    fontFamily: 'inherit',
    cursor: 'pointer',
    height: '36px',
  }

  return (
    <Layout title="Audits">
      <PageHeader
        title="Audit Management"
        subtitle={`${audits.length} total audits`}
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Audits' },
        ]}
        action={
          <Link href="/audits/new" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: gradient.navy, color: 'white',
            padding: '0.625rem 1.25rem', borderRadius: '0.625rem',
            textDecoration: 'none', fontWeight: '700', fontSize: '0.875rem',
            boxShadow: shadow.navy,
          }}>+ New Audit</Link>
        }
      />

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '360px' }}>
          <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: theme.muted, fontSize: '0.875rem', pointerEvents: 'none' }}>
            🔍
          </span>
          <input
            placeholder="Search by audit no. or client..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', height: '36px',
              padding: '0 0.875rem 0 2.25rem',
              border: `1px solid ${theme.border}`, borderRadius: '0.5rem',
              fontSize: '0.8rem', outline: 'none', background: 'white',
              fontFamily: 'inherit', boxSizing: 'border-box', color: theme.text,
            }}
            onFocus={e => e.target.style.borderColor = theme.goldDark}
            onBlur={e => e.target.style.borderColor = theme.border}
          />
        </div>

        {/* Status filter */}
        <select style={sel} value={statusF} onChange={e => setStatusF(e.target.value as any)}>
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>

        {/* Standard filter */}
        <select style={sel} value={stdF} onChange={e => setStdF(e.target.value as any)}>
          <option value="">All Standards</option>
          {Object.entries(ISO_STANDARDS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>

        {/* Clear */}
        {(search || statusF || stdF) && (
          <button
            onClick={() => { setSearch(''); setStatusF(''); setStdF('') }}
            style={{ height: '36px', padding: '0 0.875rem', border: `1px solid ${theme.border}`, borderRadius: '0.5rem', background: 'white', color: theme.muted, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            ✕ Clear
          </button>
        )}

        <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: theme.muted }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
          <div style={{ width: 40, height: 40, border: `3px solid rgba(201,162,39,0.2)`, borderTopColor: theme.goldDark, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '1rem', border: `1px solid ${theme.border}`, boxShadow: shadow.md, padding: '5rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📋</div>
          <p style={{ color: theme.navy, fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            {search || statusF || stdF ? 'No audits match your filters' : 'No audits yet'}
          </p>
          <p style={{ color: theme.muted, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {search || statusF || stdF ? 'Try different search terms or clear filters' : 'Create your first ISO audit session'}
          </p>
          {!search && !statusF && !stdF && (
            <Link href="/audits/new" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: gradient.navy, color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.625rem', textDecoration: 'none', fontWeight: '700', fontSize: '0.875rem', boxShadow: shadow.navy }}>
              + Create First Audit
            </Link>
          )}
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '1rem', border: `1px solid ${theme.border}`, boxShadow: shadow.md, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', minWidth: '900px' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: `2px solid ${theme.border}` }}>
                  {[
                    { label: 'Audit No.',  w: '130px' },
                    { label: 'Client',     w: '200px' },
                    { label: 'Standard',   w: '110px' },
                    { label: 'Auditor',    w: '160px' },
                    { label: 'Date',       w: '110px' },
                    { label: 'Score',      w: '90px'  },
                    { label: 'Risk',       w: '80px'  },
                    { label: 'Status',     w: '110px' },
                    { label: 'Result',     w: '100px' },
                    { label: '',           w: '80px'  },
                  ].map(col => (
                    <th key={col.label} style={{
                      padding: '0.875rem 1rem',
                      textAlign: 'left',
                      fontSize: '0.68rem',
                      fontWeight: '700',
                      color: theme.muted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      whiteSpace: 'nowrap' as const,
                      width: col.w,
                    }}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((audit, i) => (
                  <tr
                    key={audit.id}
                    style={{
                      borderBottom: `1px solid ${theme.border}`,
                      background: i % 2 === 0 ? 'white' : '#fafafa',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(233,196,106,0.05)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? 'white' : '#fafafa'}
                  >
                    {/* Audit No. */}
                    <td style={{ padding: '1rem', whiteSpace: 'nowrap' as const }}>
                      <span style={{ fontFamily: 'monospace', color: theme.goldDark, fontWeight: '800', fontSize: '0.8rem' }}>
                        {audit.audit_number}
                      </span>
                    </td>

                    {/* Client */}
                    <td style={{ padding: '1rem' }}>
                      <p style={{ fontWeight: '700', color: theme.navy, margin: 0, fontSize: '0.875rem', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '190px' }}>
                        {(audit as any).company_name}
                      </p>
                      <p style={{ color: theme.muted, fontSize: '0.72rem', margin: '0.15rem 0 0', whiteSpace: 'nowrap' as const }}>
                        {(audit as any).country}
                      </p>
                    </td>

                    {/* Standard */}
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        display: 'inline-block',
                        background: 'rgba(201,162,39,0.1)',
                        color: theme.goldDark,
                        padding: '0.25rem 0.625rem',
                        borderRadius: '9999px',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        whiteSpace: 'nowrap' as const,
                      }}>
                        {ISO_STANDARDS[audit.standard]?.label}
                      </span>
                    </td>

                    {/* Auditor */}
                    <td style={{ padding: '1rem' }}>
                      <p style={{ color: theme.text, fontSize: '0.8rem', margin: 0, whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
                        {(audit as any).auditor_name}
                      </p>
                    </td>

                    {/* Date */}
                    <td style={{ padding: '1rem', whiteSpace: 'nowrap' as const }}>
                      <p style={{ color: theme.muted, fontSize: '0.8rem', margin: 0 }}>
                        {formatDate(audit.audit_date)}
                      </p>
                    </td>

                    {/* Score */}
                    <td style={{ padding: '1rem' }}>
                      {audit.compliance_score != null ? (
                        <div>
                          <p style={{
                            fontWeight: '800', fontSize: '0.9rem', margin: '0 0 3px',
                            color: audit.compliance_score >= 85 ? theme.success
                              : audit.compliance_score >= 70 ? theme.warning : theme.danger,
                          }}>
                            {audit.compliance_score}%
                          </p>
                          <div style={{ width: '52px', height: '4px', background: theme.border, borderRadius: '9999px', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', borderRadius: '9999px',
                              width: `${audit.compliance_score}%`,
                              background: audit.compliance_score >= 85 ? theme.success
                                : audit.compliance_score >= 70 ? theme.warning : theme.danger,
                            }} />
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#d1d5db', fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>

                    {/* Risk */}
                    <td style={{ padding: '1rem' }}>
                      {audit.risk_level ? (
                        <Badge value={audit.risk_level} type="risk" />
                      ) : (
                        <span style={{ color: '#d1d5db', fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '1rem' }}>
                      <Badge value={audit.status} type="status" />
                    </td>

                    {/* Result */}
                    <td style={{ padding: '1rem' }}>
                      {audit.result ? (
                        <Badge value={audit.result} type="result" />
                      ) : (
                        <span style={{ color: '#d1d5db', fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>

                    {/* Action */}
                    <td style={{ padding: '1rem' }}>
                      <Link
                        href={`/audits/${audit.id}`}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                          color: theme.navy, fontWeight: '700', textDecoration: 'none',
                          fontSize: '0.8rem', padding: '0.375rem 0.75rem',
                          borderRadius: '0.5rem', border: `1px solid ${theme.border}`,
                          background: 'white', transition: 'all 0.2s',
                          whiteSpace: 'nowrap' as const,
                        }}
                        onMouseEnter={e => {
                          const el = e.currentTarget as HTMLElement
                          el.style.background = theme.navy
                          el.style.color = 'white'
                          el.style.borderColor = theme.navy
                        }}
                        onMouseLeave={e => {
                          const el = e.currentTarget as HTMLElement
                          el.style.background = 'white'
                          el.style.color = theme.navy
                          el.style.borderColor = theme.border
                        }}
                      >
                        Open →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div style={{ padding: '0.875rem 1rem', borderTop: `1px solid ${theme.border}`, background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '0.78rem', color: theme.muted, margin: 0 }}>
              Showing <strong>{filtered.length}</strong> of <strong>{audits.length}</strong> audits
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[
                { label: 'Completed',   count: audits.filter(a => a.status === 'completed').length,  color: theme.success },
                { label: 'In Progress', count: audits.filter(a => a.status === 'in_progress').length, color: theme.info   },
                { label: 'Draft',       count: audits.filter(a => a.status === 'draft').length,       color: theme.muted  },
              ].map(item => (
                <span key={item.label} style={{ fontSize: '0.72rem', color: item.color, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                  {item.label}: {item.count}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </Layout>
  )
}