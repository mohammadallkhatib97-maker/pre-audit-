import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/layout/Layout'
import PageHeader from '../../components/ui/PageHeader'
import { supabase } from '../../lib/supabase'
import { useProfile } from '../../lib/hooks/useProfile'
import { INDUSTRIES, COUNTRIES } from '../../lib/constants'

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
    fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const,
    fontFamily: 'inherit', transition: 'border-color 0.2s', background: 'white',
  } as React.CSSProperties,
  select: {
    width: '100%', padding: '0.625rem 0.875rem',
    border: '1px solid #e0e0e0', borderRadius: '0.625rem',
    fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const,
    fontFamily: 'inherit', background: 'white', cursor: 'pointer',
  } as React.CSSProperties,
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' } as React.CSSProperties,
  field: { marginBottom: '1rem' } as React.CSSProperties,
}

export default function NewClientPage() {
  const router      = useRouter()
  const { profile } = useProfile()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const [form, setForm] = useState({
    client_name: '', company_name: '', industry: '',
    country: '', city: '', address: '',
    email: '', phone: '', website: '',
    contact_person: '', contact_title: '', notes: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form.client_name || !form.company_name || !form.industry || !form.country) {
      setError('Please fill all required fields.')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('audit_clients').insert({
      ...form, created_by: profile?.id,
    })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/clients')
  }

  return (
    <Layout title="New Client">
      <PageHeader
        title="Add New Client"
        subtitle="Register a new audit client"
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Clients', href: '/clients' },
          { label: 'New Client' },
        ]}
      />

      {error && (
        <div style={{
          marginBottom: '1.5rem', padding: '1rem',
          background: '#fee2e2', border: '1px solid #fca5a5',
          borderRadius: '0.625rem', color: '#b91c1c', fontSize: '0.875rem',
        }}>{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>

          {/* Main */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Company Info */}
            <div style={S.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <div style={{ width: 4, height: 18, background: 'linear-gradient(135deg,#c9a227,#a8841d)', borderRadius: 2 }} />
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1a1a2e', margin: 0 }}>Company Information</h3>
              </div>
              <div style={S.row}>
                <div>
                  <label style={S.label}>Company Name <span style={{ color: '#e53e3e' }}>*</span></label>
                  <input name="company_name" style={S.input} placeholder="Acme Corporation"
                    value={form.company_name} onChange={handleChange} required
                    onFocus={e => e.target.style.borderColor = '#c9a227'}
                    onBlur={e => e.target.style.borderColor = '#e0e0e0'} />
                </div>
                <div>
                  <label style={S.label}>Contact Name <span style={{ color: '#e53e3e' }}>*</span></label>
                  <input name="client_name" style={S.input} placeholder="John Smith"
                    value={form.client_name} onChange={handleChange} required
                    onFocus={e => e.target.style.borderColor = '#c9a227'}
                    onBlur={e => e.target.style.borderColor = '#e0e0e0'} />
                </div>
              </div>
              <div style={S.row}>
                <div>
                  <label style={S.label}>Industry <span style={{ color: '#e53e3e' }}>*</span></label>
                  <select name="industry" style={S.select} value={form.industry} onChange={handleChange} required>
                    <option value="">Select industry...</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Country <span style={{ color: '#e53e3e' }}>*</span></label>
                  <select name="country" style={S.select} value={form.country} onChange={handleChange} required>
                    <option value="">Select country...</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={S.row}>
                <div>
                  <label style={S.label}>City</label>
                  <input name="city" style={S.input} placeholder="Amman"
                    value={form.city} onChange={handleChange}
                    onFocus={e => e.target.style.borderColor = '#c9a227'}
                    onBlur={e => e.target.style.borderColor = '#e0e0e0'} />
                </div>
                <div>
                  <label style={S.label}>Website</label>
                  <input name="website" style={S.input} placeholder="https://example.com"
                    value={form.website} onChange={handleChange}
                    onFocus={e => e.target.style.borderColor = '#c9a227'}
                    onBlur={e => e.target.style.borderColor = '#e0e0e0'} />
                </div>
              </div>
              <div>
                <label style={S.label}>Full Address</label>
                <input name="address" style={S.input} placeholder="Street, building, etc."
                  value={form.address} onChange={handleChange}
                  onFocus={e => e.target.style.borderColor = '#c9a227'}
                  onBlur={e => e.target.style.borderColor = '#e0e0e0'} />
              </div>
            </div>

            {/* Contact Info */}
            <div style={S.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <div style={{ width: 4, height: 18, background: 'linear-gradient(135deg,#c9a227,#a8841d)', borderRadius: 2 }} />
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1a1a2e', margin: 0 }}>Contact Information</h3>
              </div>
              <div style={S.row}>
                <div>
                  <label style={S.label}>Contact Person</label>
                  <input name="contact_person" style={S.input} placeholder="Primary contact"
                    value={form.contact_person} onChange={handleChange}
                    onFocus={e => e.target.style.borderColor = '#c9a227'}
                    onBlur={e => e.target.style.borderColor = '#e0e0e0'} />
                </div>
                <div>
                  <label style={S.label}>Contact Title</label>
                  <input name="contact_title" style={S.input} placeholder="Quality Manager"
                    value={form.contact_title} onChange={handleChange}
                    onFocus={e => e.target.style.borderColor = '#c9a227'}
                    onBlur={e => e.target.style.borderColor = '#e0e0e0'} />
                </div>
              </div>
              <div style={S.row}>
                <div>
                  <label style={S.label}>Email</label>
                  <input name="email" type="email" style={S.input} placeholder="contact@company.com"
                    value={form.email} onChange={handleChange}
                    onFocus={e => e.target.style.borderColor = '#c9a227'}
                    onBlur={e => e.target.style.borderColor = '#e0e0e0'} />
                </div>
                <div>
                  <label style={S.label}>Phone</label>
                  <input name="phone" style={S.input} placeholder="+962 79 000 0000"
                    value={form.phone} onChange={handleChange}
                    onFocus={e => e.target.style.borderColor = '#c9a227'}
                    onBlur={e => e.target.style.borderColor = '#e0e0e0'} />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Notes */}
            <div style={S.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ width: 4, height: 18, background: 'linear-gradient(135deg,#c9a227,#a8841d)', borderRadius: 2 }} />
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1a1a2e', margin: 0 }}>Notes</h3>
              </div>
              <textarea name="notes" rows={5} placeholder="Additional notes..."
                value={form.notes} onChange={handleChange}
                style={{
                  ...S.input, resize: 'none', height: 'auto',
                  lineHeight: '1.5', verticalAlign: 'top',
                }}
                onFocus={e => e.target.style.borderColor = '#c9a227'}
                onBlur={e => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            {/* Save Card */}
            <div style={{
              ...S.card,
              background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
              border: '1px solid #fde68a',
            }}>
              <p style={{ color: '#92400e', fontWeight: '700', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                ✦ Ready to save?
              </p>
              <p style={{ color: '#a16207', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                Make sure required fields are filled.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <button type="submit" disabled={loading} style={{
                  padding: '0.75rem', borderRadius: '0.625rem',
                  background: loading ? '#d4b84a' : 'linear-gradient(135deg, #c9a227, #a8841d)',
                  color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '700', fontSize: '0.875rem', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(201,162,39,0.3)',
                }}>
                  {loading ? (
                    <>
                      <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                      Saving...
                    </>
                  ) : '💾 Save Client'}
                </button>
                <button type="button" onClick={() => router.back()} style={{
                  padding: '0.625rem', borderRadius: '0.625rem',
                  background: 'white', color: '#666',
                  border: '1px solid #e0e0e0', cursor: 'pointer',
                  fontWeight: '500', fontSize: '0.875rem', fontFamily: 'inherit',
                }}>
                  ✕ Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </Layout>
  )
}