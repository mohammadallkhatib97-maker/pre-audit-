import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/layout/Layout'
import PageHeader from '../../components/ui/PageHeader'
import { supabase } from '../../lib/supabase'
import { useProfile } from '../../lib/hooks/useProfile'
import { AuditClient } from '../../lib/types'
import { ISO_STANDARDS } from '../../lib/constants'

const S = {
  card: {
    background: 'white', borderRadius: '1rem',
    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
    border: '1px solid #ebebeb', padding: '1.5rem',
  } as React.CSSProperties,
  label: {
    display: 'block', fontSize: '0.8rem', fontWeight: '600',
    color: '#555', marginBottom: '0.375rem',
  } as React.CSSProperties,
  input: {
    width: '100%', padding: '0.625rem 0.875rem',
    border: '1px solid #e0e0e0', borderRadius: '0.625rem',
    fontSize: '0.875rem', outline: 'none',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit', background: 'white',
  } as React.CSSProperties,
  select: {
    width: '100%', padding: '0.625rem 0.875rem',
    border: '1px solid #e0e0e0', borderRadius: '0.625rem',
    fontSize: '0.875rem', outline: 'none',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit', background: 'white', cursor: 'pointer',
  } as React.CSSProperties,
}

export default function NewAuditPage() {
  const router = useRouter()
  const { profile } = useProfile()
  const [clients, setClients] = useState<AuditClient[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedStd, setSelectedStd] = useState('')
  const [templateCount, setTemplateCount] = useState<number | null>(null)

  const [form, setForm] = useState({
    client_id: '',
    standard: '',
    audit_date: '',
    audit_end_date: '',
    location: '',
    overall_notes: '',
  })

  // ✅ مصحح — async/await بدل .then()
  useEffect(() => {
    const loadClients = async () => {
      const { data, error } = await supabase
        .from('audit_clients')
        .select('id, client_name, company_name')
        .eq('is_active', true)
        .order('company_name')
      if (!error && data) {
        setClients(data as AuditClient[])
      }
    }
    loadClients()
  }, [])

  // ✅ مصحح — أُزيل الـ {} الزيادة
  const handleStdSelect = async (std: string) => {
    setSelectedStd(std)
    setForm(f => ({ ...f, standard: std }))
    if (std) {
      const { count } = await supabase
        .from('iso_templates')
        .select('*', { count: 'exact', head: true })
        .eq('standard', std)
      setTemplateCount(count)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form.client_id || !form.standard || !form.audit_date) {
      setError('Please fill all required fields: Client, Standard, and Date.')
      return
    }
    if (!profile?.id) {
      setError('User profile not found. Please refresh.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 1. Create audit
      const { data: auditData, error: auditError } = await supabase
        .from('audits')
        .insert({
          client_id:      form.client_id,
          standard:       form.standard,
          audit_date:     form.audit_date,
          audit_end_date: form.audit_end_date || null,
          location:       form.location || null,
          overall_notes:  form.overall_notes || null,
          auditor_id:     profile.id,
          status:         'in_progress',
        })
        .select()
        .single()

      if (auditError) throw new Error(auditError.message)

      // 2. Load templates
      const { data: templates, error: tplError } = await supabase
        .from('iso_templates')
        .select('id')
        .eq('standard', form.standard)
        .order('sort_order')

      if (tplError) throw new Error(tplError.message)

      if (!templates || templates.length === 0) {
        throw new Error('No questions found for this standard. Make sure you ran the seed SQL.')
      }

      // 3. Create answer rows
      const answerRows = templates.map((t: { id: string }) => ({
        audit_id:    auditData.id,
        template_id: t.id,
        answered_by: profile.id,
      }))

      const { error: ansError } = await supabase
        .from('audit_answers')
        .insert(answerRows)

      if (ansError) throw new Error(ansError.message)

      // 4. Update total_questions
      await supabase
        .from('audits')
        .update({ total_questions: templates.length })
        .eq('id', auditData.id)

      // 5. Redirect
      router.push(`/audits/${auditData.id}`)

    } catch (err: any) {
      setError(err.message || 'Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <Layout title="New Audit">
      <PageHeader
        title="Create New Audit"
        subtitle="Set up a new ISO audit session"
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Audits', href: '/audits' },
          { label: 'New Audit' },
        ]}
      />

      {error && (
        <div style={{
          marginBottom: '1.5rem', padding: '1rem',
          background: '#fee2e2', border: '1px solid #fca5a5',
          borderRadius: '0.625rem', color: '#b91c1c', fontSize: '0.875rem',
        }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>

          {/* Main */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Client Selection */}
            <div style={S.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <div style={{ width: 4, height: 18, background: 'linear-gradient(135deg,#c9a227,#a8841d)', borderRadius: 2 }} />
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1a1a2e', margin: 0 }}>
                  Client Selection
                </h3>
              </div>
              <label style={S.label}>
                Select Client <span style={{ color: '#e53e3e' }}>*</span>
              </label>
              <select
                style={S.select}
                value={form.client_id}
                onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))}
                required
              >
                <option value="">Choose a client...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.company_name} — {c.client_name}
                  </option>
                ))}
              </select>
              {clients.length === 0 && (
                <p style={{ color: '#f59e0b', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  ⚠️ No clients found.{' '}
                  <a href="/clients/new" style={{ color: '#c9a227', fontWeight: '600' }}>
                    Add a client first →
                  </a>
                </p>
              )}
            </div>

            {/* ISO Standard Selection */}
            <div style={S.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <div style={{ width: 4, height: 18, background: 'linear-gradient(135deg,#c9a227,#a8841d)', borderRadius: 2 }} />
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1a1a2e', margin: 0 }}>
                  ISO Standard <span style={{ color: '#e53e3e' }}>*</span>
                </h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                {Object.entries(ISO_STANDARDS).map(([key, val]) => {
                  const active = form.standard === key
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleStdSelect(key)}
                      style={{
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        border: active ? '2px solid #c9a227' : '2px solid #e0e0e0',
                        background: active
                          ? 'linear-gradient(135deg,#fffbeb,#fef3c7)'
                          : 'white',
                        cursor: 'pointer',
                        textAlign: 'left' as const,
                        transition: 'all 0.2s',
                        boxShadow: active ? '0 4px 12px rgba(201,162,39,0.2)' : 'none',
                      }}
                    >
                      <p style={{
                        fontSize: '0.9rem', fontWeight: '800', margin: '0 0 0.25rem',
                        color: active ? '#92400e' : '#1a1a2e',
                      }}>{val.label}</p>
                      <p style={{
                        fontSize: '0.7rem', margin: 0,
                        color: active ? '#a16207' : '#888',
                        lineHeight: '1.4',
                      }}>{val.description}</p>
                    </button>
                  )
                })}
              </div>
              {templateCount !== null && (
                <div style={{
                  marginTop: '1rem', padding: '0.75rem 1rem',
                  background: '#f0fdf4', border: '1px solid #bbf7d0',
                  borderRadius: '0.625rem', color: '#15803d',
                  fontSize: '0.85rem', fontWeight: '600',
                }}>
                  ✓ {templateCount} audit questions loaded for{' '}
                  {ISO_STANDARDS[selectedStd as keyof typeof ISO_STANDARDS]?.label}
                </div>
              )}
            </div>

            {/* Dates & Location */}
            <div style={S.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <div style={{ width: 4, height: 18, background: 'linear-gradient(135deg,#c9a227,#a8841d)', borderRadius: 2 }} />
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1a1a2e', margin: 0 }}>
                  Schedule & Location
                </h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={S.label}>
                    Start Date <span style={{ color: '#e53e3e' }}>*</span>
                  </label>
                  <input
                    type="date"
                    style={S.input}
                    value={form.audit_date}
                    onChange={e => setForm(f => ({ ...f, audit_date: e.target.value }))}
                    required
                    onFocus={e => e.target.style.borderColor = '#c9a227'}
                    onBlur={e => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>
                <div>
                  <label style={S.label}>End Date</label>
                  <input
                    type="date"
                    style={S.input}
                    value={form.audit_end_date}
                    onChange={e => setForm(f => ({ ...f, audit_end_date: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = '#c9a227'}
                    onBlur={e => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>
              </div>
              <div>
                <label style={S.label}>Audit Location / Site</label>
                <input
                  type="text"
                  style={S.input}
                  placeholder="e.g. Client HQ, Factory Site A"
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  onFocus={e => e.target.style.borderColor = '#c9a227'}
                  onBlur={e => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>
            </div>

            {/* Notes */}
            <div style={S.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ width: 4, height: 18, background: 'linear-gradient(135deg,#c9a227,#a8841d)', borderRadius: 2 }} />
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1a1a2e', margin: 0 }}>
                  Pre-Audit Notes
                </h3>
              </div>
              <textarea
                rows={4}
                placeholder="Scope, objectives, areas to focus on..."
                value={form.overall_notes}
                onChange={e => setForm(f => ({ ...f, overall_notes: e.target.value }))}
                style={{
                  ...S.input,
                  resize: 'none',
                  lineHeight: '1.6',
                  verticalAlign: 'top',
                }}
                onFocus={e => e.target.style.borderColor = '#c9a227'}
                onBlur={e => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>
          </div>

          {/* Sidebar Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              background: 'linear-gradient(135deg,#1a1a2e,#16213e)',
              borderRadius: '1rem', padding: '1.5rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <div style={{ width: 4, height: 18, background: 'linear-gradient(135deg,#c9a227,#e4d48e)', borderRadius: 2 }} />
                <p style={{ color: 'white', fontWeight: '700', fontSize: '0.9rem', margin: 0 }}>
                  Audit Summary
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {[
                  {
                    label: 'Auditor',
                    value: profile?.full_name || '—',
                    color: 'white',
                  },
                  {
                    label: 'Standard',
                    value: form.standard
                      ? ISO_STANDARDS[form.standard as keyof typeof ISO_STANDARDS]?.label
                      : '— Select standard',
                    color: form.standard ? '#c9a227' : '#555',
                  },
                  {
                    label: 'Questions',
                    value: templateCount !== null ? `${templateCount} questions` : '—',
                    color: templateCount ? '#4ade80' : '#555',
                  },
                  {
                    label: 'Client',
                    value: form.client_id
                      ? clients.find(c => c.id === form.client_id)?.company_name || '—'
                      : '— Select client',
                    color: form.client_id ? 'white' : '#555',
                  },
                  {
                    label: 'Date',
                    value: form.audit_date || '—',
                    color: form.audit_date ? 'white' : '#555',
                  },
                ].map(item => (
                  <div key={item.label} style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 0',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <span style={{ color: '#666', fontSize: '0.75rem' }}>{item.label}</span>
                    <span style={{
                      color: item.color, fontSize: '0.8rem',
                      fontWeight: '600', textAlign: 'right' as const,
                      maxWidth: '160px', overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
                    }}>{item.value}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <button
                  type="submit"
                  disabled={loading || !form.client_id || !form.standard || !form.audit_date}
                  style={{
                    padding: '0.875rem',
                    background: (!form.client_id || !form.standard || !form.audit_date || loading)
                      ? '#444'
                      : 'linear-gradient(135deg,#c9a227,#a8841d)',
                    color: 'white', border: 'none',
                    borderRadius: '0.625rem',
                    cursor: (!form.client_id || !form.standard || !form.audit_date || loading)
                      ? 'not-allowed'
                      : 'pointer',
                    fontWeight: '700', fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '0.5rem',
                    boxShadow: (!form.client_id || !form.standard || !form.audit_date)
                      ? 'none'
                      : '0 4px 16px rgba(201,162,39,0.4)',
                    transition: 'all 0.2s',
                  }}
                >
                  {loading ? (
                    <>
                      <span style={{
                        width: 16, height: 16,
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'white', borderRadius: '50%',
                        animation: 'spin 0.7s linear infinite',
                        display: 'inline-block', flexShrink: 0,
                      }} />
                      Creating Audit...
                    </>
                  ) : '🚀 Start Audit Session'}
                </button>

                <button
                  type="button"
                  onClick={() => router.back()}
                  style={{
                    padding: '0.625rem',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#888', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0.625rem', cursor: 'pointer',
                    fontWeight: '500', fontSize: '0.875rem',
                    fontFamily: 'inherit',
                  }}
                >
                  ✕ Cancel
                </button>
              </div>
            </div>

            {/* Info card */}
            <div style={{
              background: '#fffbeb', border: '1px solid #fde68a',
              borderRadius: '0.75rem', padding: '1rem',
            }}>
              <p style={{ color: '#92400e', fontWeight: '700', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                ✦ How it works
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {[
                  '1. Select client & standard',
                  '2. Questions auto-load',
                  '3. Answer each clause',
                  '4. Upload evidence files',
                  '5. Generate PDF report',
                ].map(step => (
                  <p key={step} style={{ color: '#a16207', fontSize: '0.75rem', margin: 0 }}>
                    {step}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </Layout>
  )
}