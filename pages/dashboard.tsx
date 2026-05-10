import { useEffect, useState } from 'react'
import Link from 'next/link'
import Layout from '../components/layout/Layout'
import Badge from '../components/ui/Badge'
import { supabase } from '../lib/supabase'
import { useProfile } from '../lib/hooks/useProfile'
import { Audit } from '../lib/types'
import { ISO_STANDARDS } from '../lib/constants'
import { formatDate } from '../lib/utils'
import { theme, gradient, shadow } from '../lib/theme'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'

const PIE_COLORS = ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#c9a227']

interface Stats {
  total: number
  completed: number
  inProgress: number
  draft: number
  failed: number
  highRisk: number
  avgScore: number
  nonConformities: number
}

export default function DashboardPage() {
  const { profile } = useProfile()
  const [audits,  setAudits]  = useState<Audit[]>([])
  const [stats,   setStats]   = useState<Stats>({
    total: 0, completed: 0, inProgress: 0, draft: 0,
    failed: 0, highRisk: 0, avgScore: 0, nonConformities: 0,
  })
  const [ncCount,  setNcCount]  = useState(0)
  const [loading,  setLoading]  = useState(true)
  const [activity, setActivity] = useState<any[]>([])

  useEffect(() => {
    if (profile) fetchData()
  }, [profile])

  const fetchData = async () => {
    try {
      // Fetch audits
      let q = supabase
        .from('audit_list_view')
        .select('*')
        .order('created_at', { ascending: false })
      if (profile?.role !== 'admin') q = q.eq('auditor_id', profile?.id)
      const { data: auditData } = await q
      const list = (auditData || []) as Audit[]
      setAudits(list)

      // Fetch non-conformities count
      const auditIds = list.map(a => a.id)
      let ncTotal = 0
      if (auditIds.length > 0) {
        const { count } = await supabase
          .from('audit_answers')
          .select('*', { count: 'exact', head: true })
          .in('audit_id', auditIds)
          .eq('status', 'non_compliant')
        ncTotal = count || 0
      }
      setNcCount(ncTotal)

      // Calculate stats
      const scores = list.filter(a => a.compliance_score != null).map(a => a.compliance_score!)
      setStats({
        total:           list.length,
        completed:       list.filter(a => a.status === 'completed').length,
        inProgress:      list.filter(a => a.status === 'in_progress').length,
        draft:           list.filter(a => a.status === 'draft').length,
        failed:          list.filter(a => a.result === 'fail').length,
        highRisk:        list.filter(a => a.risk_level === 'high' || a.risk_level === 'critical').length,
        avgScore:        scores.length
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0,
        nonConformities: ncTotal,
      })

      // Recent activity (last 5 audits as activity)
      setActivity(list.slice(0, 5).map(a => ({
        id:      a.id,
        action:  a.status === 'completed' ? 'Completed audit' : a.status === 'in_progress' ? 'Started audit' : 'Created audit',
        audit:   a.audit_number,
        client:  (a as any).company_name,
        time:    a.updated_at || a.created_at,
        status:  a.status,
      })))

    } catch (err) {
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Chart data
  const standardData = Object.entries(ISO_STANDARDS)
    .map(([key, val]) => ({
      name:  val.label,
      count: audits.filter(a => a.standard === key).length,
    }))
    .filter(d => d.count > 0)

  const pieData = [
    { name: 'Completed',   value: stats.completed  },
    { name: 'In Progress', value: stats.inProgress },
    { name: 'Draft',       value: stats.draft      },
    { name: 'Failed',      value: stats.failed     },
  ].filter(d => d.value > 0)

  const scoreColor = stats.avgScore >= 85 ? theme.success
    : stats.avgScore >= 70 ? theme.warning : theme.danger

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  // Styles
  const card: React.CSSProperties = {
    background: 'white', borderRadius: '1rem',
    border: `1px solid ${theme.border}`,
    boxShadow: shadow.md, padding: '1.5rem',
  }

  const sTitle: React.CSSProperties = {
    fontSize: '0.8rem', fontWeight: '700', color: theme.navy,
    margin: '0 0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
    textTransform: 'uppercase', letterSpacing: '0.06em',
  }

  const accent = (c: string) => (
    <span style={{ width: 4, height: 16, background: c, borderRadius: 2, display: 'inline-block', flexShrink: 0 }} />
  )

  if (loading) return (
    <Layout title="Dashboard">
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: `3px solid rgba(201,162,39,0.2)`, borderTopColor: theme.goldDark, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: theme.muted, fontSize: '0.875rem' }}>Loading dashboard...</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    </Layout>
  )

  return (
    <Layout title="Dashboard">

      {/* ── Welcome Banner ── */}
      <div style={{
        background: gradient.navy, borderRadius: '1.25rem',
        padding: '1.75rem 2.5rem', marginBottom: '1.75rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: shadow.navy, position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative */}
        <div style={{ position: 'absolute', right: '-30px', top: '-30px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(233,196,106,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: '80px', bottom: '-50px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(233,196,106,0.04)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ color: theme.gold, fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: '700', margin: '0 0 0.375rem' }}>
            ✦ Pioneers International for Business Consulting
          </p>
          <h1 style={{ color: 'white', fontSize: '1.6rem', fontWeight: '700', margin: '0 0 0.375rem', fontFamily: "'Cormorant Garamond', serif" }}>
            {greeting}, {profile?.full_name?.split(' ')[0] || 'Auditor'} 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '0.8rem' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {' · '}<span style={{ color: theme.gold, fontWeight: '600', textTransform: 'capitalize' }}>{profile?.role}</span>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
          <div style={{ width: 64, height: 64, background: 'white', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: shadow.gold }}>
            <img src="/logo.png" alt="Pioneers" style={{ width: 52, height: 52, objectFit: 'contain' }} />
          </div>
          <Link href="/audits/new" style={{
            background: gradient.gold, color: theme.navy,
            padding: '0.75rem 1.5rem', borderRadius: '0.75rem',
            textDecoration: 'none', fontWeight: '700', fontSize: '0.875rem',
            boxShadow: shadow.gold, whiteSpace: 'nowrap' as const,
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
          }}>+ New Audit</Link>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Audits',      value: stats.total,           icon: '📋', color: theme.navy,    bg: 'rgba(11,60,93,0.06)'   },
          { label: 'Completed',         value: stats.completed,       icon: '✅', color: theme.success, bg: 'rgba(22,163,74,0.06)'  },
          { label: 'In Progress',       value: stats.inProgress,      icon: '🔄', color: theme.info,    bg: 'rgba(37,99,235,0.06)'  },
          { label: 'Non-Conformities',  value: ncCount,               icon: '⚠️', color: theme.danger,  bg: 'rgba(220,38,38,0.06)'  },
        ].map(item => (
          <div key={item.label} style={{ ...card, padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
              <p style={{ color: theme.muted, fontSize: '0.72rem', fontWeight: '700', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {item.label}
              </p>
              <div style={{ width: 36, height: 36, borderRadius: '0.625rem', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                {item.icon}
              </div>
            </div>
            <p style={{ fontSize: '2.25rem', fontWeight: '800', color: item.color, margin: 0, lineHeight: 1 }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Secondary KPIs ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Draft',       value: stats.draft,      icon: '📝', color: '#6b7280' },
          { label: 'High Risk',   value: stats.highRisk,   icon: '🚨', color: theme.danger  },
          { label: 'Failed',      value: stats.failed,     icon: '❌', color: theme.danger  },
          { label: 'Avg Score',   value: `${stats.avgScore}%`, icon: '📊', color: scoreColor },
        ].map(item => (
          <div key={item.label} style={{
            background: 'white', borderRadius: '0.75rem',
            border: `1px solid ${theme.border}`, padding: '0.875rem 1.25rem',
            display: 'flex', alignItems: 'center', gap: '0.875rem',
          }}>
            <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
            <div>
              <p style={{ fontSize: '0.65rem', color: theme.muted, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' }}>{item.label}</p>
              <p style={{ fontSize: '1.25rem', fontWeight: '800', color: item.color, margin: 0 }}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>

        {/* Compliance Gauge */}
        <div style={card}>
          <p style={sTitle}>{accent(gradient.gold)} Compliance Score</p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: 140, height: 140 }}>
              <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="42" fill="none" stroke={theme.border} strokeWidth="10" />
                <circle cx="50" cy="50" r="42" fill="none"
                  stroke={scoreColor} strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${2.638 * stats.avgScore} 263.8`}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.75rem', fontWeight: '800', color: scoreColor, lineHeight: 1 }}>
                  {stats.avgScore}%
                </span>
                <span style={{ fontSize: '0.6rem', color: theme.muted, marginTop: '0.25rem' }}>Average</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1rem' }}>
              {[
                { l: 'Pass',  c: theme.success, n: audits.filter(a => a.result === 'pass').length },
                { l: 'Cond', c: theme.warning,  n: audits.filter(a => a.result === 'conditional').length },
                { l: 'Fail',  c: theme.danger,  n: audits.filter(a => a.result === 'fail').length },
              ].map(i => (
                <div key={i.l} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '1.1rem', fontWeight: '800', color: i.c, margin: 0 }}>{i.n}</p>
                  <p style={{ fontSize: '0.65rem', color: theme.muted, margin: 0 }}>{i.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pie */}
        <div style={card}>
          <p style={sTitle}>{accent(gradient.navy)} Audit Status</p>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={185}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '0.72rem' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 185, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: theme.muted, gap: '0.5rem' }}>
              <span style={{ fontSize: '2rem' }}>📊</span>
              <span style={{ fontSize: '0.8rem' }}>No data yet</span>
            </div>
          )}
        </div>

        {/* Bar */}
        <div style={card}>
          <p style={sTitle}>{accent(gradient.gold)} By Standard</p>
          {standardData.length > 0 ? (
            <ResponsiveContainer width="100%" height={185}>
              <BarChart data={standardData} layout="vertical" margin={{ left: 0, right: 12, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme.border} />
                <XAxis type="number" tick={{ fontSize: 10, fill: theme.muted }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: theme.muted }} width={60} />
                <Tooltip />
                <Bar dataKey="count" fill={theme.navy} radius={[0, 4, 4, 0] as any} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 185, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: theme.muted, gap: '0.5rem' }}>
              <span style={{ fontSize: '2rem' }}>📈</span>
              <span style={{ fontSize: '0.8rem' }}>No data yet</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Row: Recent Audits + Activity ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem' }}>

        {/* Recent Audits */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <p style={{ ...sTitle, margin: 0 }}>{accent(gradient.navy)} Recent Audits</p>
            <Link href="/audits" style={{ color: theme.goldDark, fontSize: '0.8rem', fontWeight: '600', textDecoration: 'none' }}>
              View all →
            </Link>
          </div>

          {audits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: theme.muted }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
              <p style={{ fontWeight: '600', color: theme.text, marginBottom: '0.5rem' }}>No audits yet</p>
              <Link href="/audits/new" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: gradient.navy, color: 'white', padding: '0.625rem 1.25rem', borderRadius: '0.625rem', textDecoration: 'none', fontWeight: '600', fontSize: '0.875rem', marginTop: '0.75rem' }}>
                + Start First Audit
              </Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#fafafa', borderBottom: `2px solid ${theme.border}` }}>
                    {['Audit No.','Client','Standard','Date','Score','Status',''].map(h => (
                      <th key={h} style={{ padding: '0.625rem 0.875rem', textAlign: 'left', fontSize: '0.65rem', fontWeight: '700', color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' as const }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {audits.slice(0, 7).map((audit, i) => (
                    <tr key={audit.id}
                      style={{ borderBottom: `1px solid ${theme.border}`, background: i % 2 === 0 ? 'white' : '#fafafa' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(233,196,106,0.05)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? 'white' : '#fafafa'}
                    >
                      <td style={{ padding: '0.75rem 0.875rem', whiteSpace: 'nowrap' as const }}>
                        <span style={{ fontFamily: 'monospace', color: theme.goldDark, fontWeight: '700', fontSize: '0.78rem' }}>
                          {audit.audit_number}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.875rem' }}>
                        <p style={{ fontWeight: '600', color: theme.navy, margin: 0, fontSize: '0.82rem' }}>
                          {(audit as any).company_name}
                        </p>
                        <p style={{ color: theme.muted, fontSize: '0.7rem', margin: 0 }}>
                          {(audit as any).industry}
                        </p>
                      </td>
                      <td style={{ padding: '0.75rem 0.875rem' }}>
                        <span style={{ background: 'rgba(201,162,39,0.1)', color: theme.goldDark, padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.68rem', fontWeight: '700', whiteSpace: 'nowrap' as const }}>
                          {ISO_STANDARDS[audit.standard]?.label}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.875rem', color: theme.muted, fontSize: '0.78rem', whiteSpace: 'nowrap' as const }}>
                        {formatDate(audit.audit_date)}
                      </td>
                      <td style={{ padding: '0.75rem 0.875rem' }}>
                        {audit.compliance_score != null ? (
                          <span style={{ fontWeight: '800', fontSize: '0.875rem', color: audit.compliance_score >= 85 ? theme.success : audit.compliance_score >= 70 ? theme.warning : theme.danger }}>
                            {audit.compliance_score}%
                          </span>
                        ) : <span style={{ color: '#ccc' }}>—</span>}
                      </td>
                      <td style={{ padding: '0.75rem 0.875rem' }}>
                        <Badge value={audit.status} type="status" />
                      </td>
                      <td style={{ padding: '0.75rem 0.875rem' }}>
                        <Link href={`/audits/${audit.id}`} style={{ color: theme.navy, fontWeight: '600', textDecoration: 'none', fontSize: '0.78rem', padding: '0.3rem 0.625rem', borderRadius: '0.375rem', border: `1px solid ${theme.border}`, whiteSpace: 'nowrap' as const }}>
                          Open →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div style={card}>
          <p style={{ ...sTitle, marginBottom: '1.25rem' }}>{accent(gradient.gold)} Recent Activity</p>
          {activity.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: theme.muted }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
              <p style={{ fontSize: '0.8rem' }}>No activity yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activity.map((item, i) => (
                <div key={item.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  {/* Timeline dot */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.status === 'completed' ? theme.success : item.status === 'in_progress' ? theme.info : theme.muted, marginTop: '0.25rem' }} />
                    {i < activity.length - 1 && (
                      <div style={{ width: 1, flex: 1, background: theme.border, margin: '0.25rem 0' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.78rem', fontWeight: '600', color: theme.text, margin: 0 }}>
                      {item.action}
                    </p>
                    <p style={{ fontSize: '0.72rem', color: theme.muted, margin: '0.1rem 0 0' }}>
                      <span style={{ color: theme.goldDark, fontFamily: 'monospace', fontWeight: '700' }}>{item.audit}</span>
                      {item.client ? ` · ${item.client}` : ''}
                    </p>
                    <p style={{ fontSize: '0.68rem', color: '#bbb', margin: '0.1rem 0 0' }}>
                      {formatDate(item.time)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Links */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: `1px solid ${theme.border}` }}>
            <p style={{ fontSize: '0.65rem', fontWeight: '700', color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.625rem' }}>
              Quick Actions
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {[
                { href: '/audits/new',  label: '+ New Audit',   icon: '📋' },
                { href: '/clients/new', label: '+ Add Client',  icon: '🏢' },
                { href: '/reports',     label: 'View Reports',  icon: '📄' },
              ].map(item => (
                <Link key={item.href} href={item.href} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                  textDecoration: 'none', fontSize: '0.8rem', fontWeight: '500',
                  color: theme.text, border: `1px solid ${theme.border}`,
                  transition: 'all 0.2s', background: 'white',
                }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = theme.navy; el.style.color = 'white'; el.style.borderColor = theme.navy }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'white'; el.style.color = theme.text; el.style.borderColor = theme.border }}
                >
                  <span>{item.icon}</span> {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </Layout>
  )
}