import { useState, useRef, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import PageHeader from '../components/ui/PageHeader'
import { supabase } from '../lib/supabase'
import { useProfile } from '../lib/hooks/useProfile'
import { theme, gradient, shadow } from '../lib/theme'

export default function SettingsPage() {
  const { profile, refresh } = useProfile()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef   = useRef<HTMLInputElement>(null)

  const [isDrawing, setIsDrawing] = useState(false)
  const [lastPos,   setLastPos]   = useState({ x: 0, y: 0 })
  const [hasDrawn,  setHasDrawn]  = useState(false)
  const [sigMode,   setSigMode]   = useState<'draw' | 'upload'>('draw')
  const [uploadedSig, setUploadedSig] = useState<File | null>(null)
  const [uploadedSigPreview, setUploadedSigPreview] = useState<string>('')

  const [form, setForm] = useState({
    full_name: '', title: '', department: '', phone: '',
  })

  const [saving,    setSaving]    = useState(false)
  const [savingSig, setSavingSig] = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [sigSaved,  setSigSaved]  = useState(false)
  const [error,     setError]     = useState('')
  const [success,   setSuccess]   = useState('')

  useEffect(() => {
    if (profile) {
      setForm({
        full_name:  profile.full_name          || '',
        title:      (profile as any).title      || '',
        department: (profile as any).department || '',
        phone:      (profile as any).phone      || '',
      })
    }
  }, [profile])

  // ── Canvas helpers ──
  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect  = canvas.getBoundingClientRect()
    const scaleX = canvas.width  / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top)  * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top)  * scaleY,
    }
  }

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    e.preventDefault()
    setIsDrawing(true)
    setLastPos(getPos(e, canvas))
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    e.preventDefault()
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const pos = getPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(lastPos.x, lastPos.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = '#0B3C5D'
    ctx.lineWidth   = 2.5
    ctx.lineCap     = 'round'
    ctx.lineJoin    = 'round'
    ctx.stroke()
    setLastPos(pos)
    setHasDrawn(true)
  }

  const stopDraw = () => setIsDrawing(false)

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx?.clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
  }

  // ── Upload file handler ──
  const handleSigFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.')
      return
    }
    setUploadedSig(file)
    const reader = new FileReader()
    reader.onload = ev => setUploadedSigPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
    setError('')
  }

  // ── Upload to Supabase Storage ──
  const uploadBlob = async (blob: Blob, path: string): Promise<string> => {
    // Remove old file
    await supabase.storage.from('signatures').remove([path])

    const { error: upErr } = await supabase.storage
      .from('signatures')
      .upload(path, blob, {
        upsert:      true,
        contentType: blob.type || 'image/png',
      })

    if (upErr) throw new Error(upErr.message)

    const { data } = supabase.storage.from('signatures').getPublicUrl(path)
    return `${data.publicUrl}?v=${Date.now()}`
  }

  // ── Save signature ──
  const saveSignature = async () => {
    if (!profile?.id) { setError('Profile not found. Please refresh.'); return }
    setSavingSig(true)
    setError('')
    setSuccess('')

    try {
      const path = `${profile.id}/signature.png`
      let publicUrl = ''

      if (sigMode === 'draw') {
        const canvas = canvasRef.current
        if (!canvas || !hasDrawn) {
          setError('Please draw your signature first.')
          setSavingSig(false)
          return
        }
        const blob = await new Promise<Blob>((res) =>
          canvas.toBlob(b => res(b!), 'image/png')
        )
        publicUrl = await uploadBlob(blob, path)

      } else {
        if (!uploadedSig) {
          setError('Please select a signature image.')
          setSavingSig(false)
          return
        }
        publicUrl = await uploadBlob(uploadedSig, path)
      }

      // Save URL to profile
      const { error: dbErr } = await supabase
        .from('profiles')
        .update({ signature_url: publicUrl })
        .eq('id', profile.id)

      if (dbErr) throw new Error(dbErr.message)

      await refresh()
      setSigSaved(true)
      setSuccess('Signature saved successfully!')
      setTimeout(() => { setSigSaved(false); setSuccess('') }, 3000)

    } catch (err: any) {
      setError(err.message || 'Failed to save signature.')
    } finally {
      setSavingSig(false)
    }
  }

  // ── Save profile ──
  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!profile?.id) return
    setSaving(true)
    setError('')
    setSuccess('')

    const { error: err } = await supabase
      .from('profiles')
      .update(form)
      .eq('id', profile.id)

    if (err) {
      setError(err.message)
    } else {
      await refresh()
      setSaved(true)
      setSuccess('Profile saved successfully!')
      setTimeout(() => { setSaved(false); setSuccess('') }, 3000)
    }
    setSaving(false)
  }

  // ── Styles ──
  const inp: React.CSSProperties = {
    width: '100%', padding: '0.625rem 0.875rem',
    border: `1px solid ${theme.border}`, borderRadius: '0.625rem',
    fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit',
    background: 'white', boxSizing: 'border-box', color: theme.text,
  }

  const card: React.CSSProperties = {
    background: 'white', borderRadius: '1rem',
    border: `1px solid ${theme.border}`,
    boxShadow: shadow.md, padding: '1.75rem',
    marginBottom: '1.5rem',
  }

  const lbl: React.CSSProperties = {
    display: 'block', fontSize: '0.8rem',
    fontWeight: '600', color: theme.text, marginBottom: '0.375rem',
  }

  const SectionHead = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
      <div style={{ width: 4, height: 22, background: gradient.gold, borderRadius: 2, flexShrink: 0 }} />
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: theme.navy, margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>
          {title}
        </h3>
        {subtitle && <p style={{ fontSize: '0.75rem', color: theme.muted, margin: 0 }}>{subtitle}</p>}
      </div>
    </div>
  )

  const TabBtn = ({ mode, label, icon }: { mode: 'draw'|'upload'; label: string; icon: string }) => (
    <button
      type="button"
      onClick={() => setSigMode(mode)}
      style={{
        padding: '0.5rem 1.25rem', borderRadius: '0.5rem',
        border: `2px solid ${sigMode === mode ? theme.navy : theme.border}`,
        background: sigMode === mode ? theme.navy : 'white',
        color: sigMode === mode ? 'white' : theme.muted,
        fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer',
        fontFamily: 'inherit', transition: 'all 0.2s',
        display: 'flex', alignItems: 'center', gap: '0.375rem',
      }}
    >
      {icon} {label}
    </button>
  )

  return (
    <Layout title="Settings">
      <PageHeader
        title="Account Settings"
        subtitle="Manage your profile, signature, and preferences"
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Settings' },
        ]}
      />

      {/* Alerts */}
      {error && (
        <div style={{ marginBottom: '1.25rem', padding: '0.875rem 1.25rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '0.75rem', color: theme.danger, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div style={{ marginBottom: '1.25rem', padding: '0.875rem 1.25rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.75rem', color: theme.success, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ✓ {success}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>

        {/* ── LEFT COLUMN ── */}
        <div>

          {/* Profile Form */}
          <div style={card}>
            <SectionHead title="Profile Information" subtitle="Your personal and professional details" />
            <form onSubmit={handleSaveProfile}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={lbl}>Full Name</label>
                  <input style={inp} placeholder="Your full name"
                    value={form.full_name}
                    onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                    onFocus={e => { e.target.style.borderColor = theme.goldDark; e.target.style.boxShadow = `0 0 0 3px rgba(201,162,39,0.1)` }}
                    onBlur={e => { e.target.style.borderColor = theme.border; e.target.style.boxShadow = 'none' }}
                  />
                </div>
                <div>
                  <label style={lbl}>Job Title</label>
                  <input style={inp} placeholder="e.g. Lead Auditor"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    onFocus={e => { e.target.style.borderColor = theme.goldDark; e.target.style.boxShadow = `0 0 0 3px rgba(201,162,39,0.1)` }}
                    onBlur={e => { e.target.style.borderColor = theme.border; e.target.style.boxShadow = 'none' }}
                  />
                </div>
                <div>
                  <label style={lbl}>Department</label>
                  <input style={inp} placeholder="e.g. Quality Assurance"
                    value={form.department}
                    onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                    onFocus={e => { e.target.style.borderColor = theme.goldDark; e.target.style.boxShadow = `0 0 0 3px rgba(201,162,39,0.1)` }}
                    onBlur={e => { e.target.style.borderColor = theme.border; e.target.style.boxShadow = 'none' }}
                  />
                </div>
                <div>
                  <label style={lbl}>Phone</label>
                  <input style={inp} placeholder="+962 79 000 0000"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    onFocus={e => { e.target.style.borderColor = theme.goldDark; e.target.style.boxShadow = `0 0 0 3px rgba(201,162,39,0.1)` }}
                    onBlur={e => { e.target.style.borderColor = theme.border; e.target.style.boxShadow = 'none' }}
                  />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={lbl}>Email Address</label>
                  <input
                    style={{ ...inp, background: '#f9fafb', color: theme.muted, cursor: 'not-allowed' }}
                    value={profile?.email || ''}
                    disabled
                  />
                  <p style={{ fontSize: '0.72rem', color: theme.muted, margin: '0.25rem 0 0' }}>
                    Email cannot be changed here.
                  </p>
                </div>
              </div>

              <button type="submit" disabled={saving} style={{
                padding: '0.625rem 1.75rem',
                background: saving ? '#9ca3af' : gradient.navy,
                color: 'white', border: 'none', borderRadius: '0.625rem',
                fontWeight: '700', fontSize: '0.875rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                boxShadow: saving ? 'none' : shadow.navy,
                transition: 'all 0.2s',
              }}>
                {saving ? (
                  <>
                    <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                    Saving...
                  </>
                ) : saved ? '✓ Saved!' : '💾 Save Profile'}
              </button>
            </form>
          </div>

          {/* Signature Section */}
          <div style={card}>
            <SectionHead
              title="Digital Signature"
              subtitle="Your signature will appear on all generated PDF reports"
            />

            {/* Current signature preview */}
            {profile?.signature_url && (
              <div style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem', background: '#f8f9fa', borderRadius: '0.75rem', border: `1px solid ${theme.border}` }}>
                <p style={{ fontSize: '0.7rem', color: theme.muted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                  ✓ Current Saved Signature
                </p>
                <div style={{ background: 'white', borderRadius: '0.5rem', padding: '0.75rem', border: `1px solid ${theme.border}`, display: 'inline-block' }}>
                  <img
                    src={profile.signature_url}
                    alt="Current Signature"
                    style={{ height: 64, objectFit: 'contain', maxWidth: 280, display: 'block' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                </div>
              </div>
            )}

            {/* Mode tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <TabBtn mode="draw"   label="Draw Signature"   icon="✍️" />
              <TabBtn mode="upload" label="Upload Image"     icon="📤" />
            </div>

            {/* Draw mode */}
            {sigMode === 'draw' && (
              <div>
                <div style={{
                  border: `2px dashed ${hasDrawn ? theme.goldDark : theme.border}`,
                  borderRadius: '0.875rem', overflow: 'hidden',
                  background: 'white', marginBottom: '0.875rem',
                  cursor: 'crosshair', position: 'relative',
                  transition: 'border-color 0.2s',
                }}>
                  <canvas
                    ref={canvasRef}
                    width={680}
                    height={200}
                    style={{ width: '100%', height: '200px', display: 'block', touchAction: 'none' }}
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={stopDraw}
                    onMouseLeave={stopDraw}
                    onTouchStart={startDraw}
                    onTouchMove={draw}
                    onTouchEnd={stopDraw}
                  />
                  {!hasDrawn && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ color: '#d1d5db', fontSize: '2rem', margin: '0 0 0.5rem' }}>✍️</p>
                        <p style={{ color: '#d1d5db', fontSize: '0.85rem', margin: 0 }}>Draw your signature here</p>
                        <p style={{ color: '#e5e7eb', fontSize: '0.72rem', margin: '0.25rem 0 0' }}>Use mouse or touch</p>
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
                  <button onClick={clearCanvas} type="button" style={{
                    padding: '0.5rem 1rem', background: 'white', color: theme.muted,
                    border: `1px solid ${theme.border}`, borderRadius: '0.5rem',
                    fontWeight: '500', fontSize: '0.8rem', cursor: 'pointer',
                    fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.375rem',
                  }}>
                    🗑 Clear
                  </button>
                  <p style={{ fontSize: '0.72rem', color: theme.muted, margin: 0 }}>
                    {hasDrawn ? '✓ Signature drawn' : 'Canvas is empty'}
                  </p>
                </div>
              </div>
            )}

            {/* Upload mode */}
            {sigMode === 'upload' && (
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleSigFileChange}
                />
                {uploadedSigPreview ? (
                  <div style={{ marginBottom: '0.875rem' }}>
                    <div style={{ border: `2px solid ${theme.goldDark}`, borderRadius: '0.875rem', padding: '1rem', background: '#fffbeb', display: 'inline-block', marginBottom: '0.75rem' }}>
                      <img src={uploadedSigPreview} alt="Preview" style={{ height: 80, objectFit: 'contain', maxWidth: 300, display: 'block' }} />
                    </div>
                    <br />
                    <button type="button" onClick={() => { setUploadedSig(null); setUploadedSigPreview(''); if (fileRef.current) fileRef.current.value = '' }} style={{
                      padding: '0.4rem 0.875rem', background: 'white', color: theme.muted,
                      border: `1px solid ${theme.border}`, borderRadius: '0.5rem',
                      fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                      ✕ Remove
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileRef.current?.click()}
                    style={{
                      border: `2px dashed ${theme.border}`, borderRadius: '0.875rem',
                      padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer',
                      marginBottom: '0.875rem', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = theme.goldDark; el.style.background = '#fffbeb' }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = theme.border; el.style.background = 'transparent' }}
                  >
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📤</div>
                    <p style={{ color: theme.text, fontWeight: '600', margin: '0 0 0.25rem', fontSize: '0.9rem' }}>
                      Click to upload signature image
                    </p>
                    <p style={{ color: theme.muted, fontSize: '0.78rem', margin: 0 }}>
                      PNG, JPG, GIF supported · Max 5MB
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Save signature button */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: `1px solid ${theme.border}` }}>
              <button
                type="button"
                onClick={saveSignature}
                disabled={savingSig}
                style={{
                  padding: '0.75rem 2rem',
                  background: savingSig ? '#9ca3af' : gradient.gold,
                  color: theme.navy, border: 'none', borderRadius: '0.625rem',
                  fontWeight: '700', fontSize: '0.9rem',
                  cursor: savingSig ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  boxShadow: savingSig ? 'none' : shadow.gold,
                  transition: 'all 0.2s',
                }}
              >
                {savingSig ? (
                  <>
                    <span style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: theme.navy, borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                    Saving Signature...
                  </>
                ) : sigSaved ? '✓ Signature Saved!' : '✍️ Save Signature'}
              </button>
              <p style={{ fontSize: '0.72rem', color: theme.muted, marginTop: '0.5rem' }}>
                Signature is stored securely and used in PDF reports automatically.
              </p>
            </div>
          </div>

        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Account Info */}
          <div style={{ ...card, background: gradient.navy, border: 'none', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
              <div style={{ width: 4, height: 16, background: gradient.gold, borderRadius: 2 }} />
              <p style={{ color: 'white', fontWeight: '700', fontSize: '0.875rem', margin: 0 }}>Account Info</p>
            </div>

            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: gradient.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.navy, fontWeight: '800', fontSize: '1.1rem', flexShrink: 0 }}>
                {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ color: 'white', fontWeight: '700', fontSize: '0.9rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile?.full_name || 'User'}
                </p>
                <p style={{ color: theme.gold, fontSize: '0.72rem', margin: 0, textTransform: 'capitalize' }}>
                  {profile?.role}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[
                { label: 'Email',      value: profile?.email              || '—' },
                { label: 'Title',      value: (profile as any)?.title     || '—' },
                { label: 'Department', value: (profile as any)?.department|| '—' },
                { label: 'Phone',      value: (profile as any)?.phone     || '—' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', flexShrink: 0 }}>{item.label}</span>
                  <span style={{ color: 'white', fontSize: '0.78rem', fontWeight: '500', textAlign: 'right', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: 'rgba(22,163,74,0.2)', color: '#4ade80', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: '700' }}>
                ● Active Account
              </span>
            </div>
          </div>

          {/* Signature Status */}
          <div style={{ ...card, padding: '1.25rem' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: '700', color: theme.navy, margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: 4, height: 14, background: gradient.gold, borderRadius: 2, display: 'inline-block' }} />
              Signature Status
            </p>
            {profile?.signature_url ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                  <span style={{ background: '#dcfce7', color: '#15803d', padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: '700' }}>
                    ✓ Signature Set
                  </span>
                </div>
                <div style={{ background: '#f8f9fa', borderRadius: '0.5rem', padding: '0.625rem', border: `1px solid ${theme.border}` }}>
                  <img src={profile.signature_url} alt="Sig" style={{ height: 40, objectFit: 'contain', maxWidth: '100%', display: 'block' }} />
                </div>
                <p style={{ fontSize: '0.7rem', color: theme.muted, marginTop: '0.5rem' }}>
                  Auto-inserted in PDF reports
                </p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <span style={{ background: '#fee2e2', color: theme.danger, padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: '700', display: 'inline-block', marginBottom: '0.5rem' }}>
                  ✕ No Signature
                </span>
                <p style={{ fontSize: '0.75rem', color: theme.muted }}>
                  Draw or upload your signature to include it in reports.
                </p>
              </div>
            )}
          </div>

          {/* Tips */}
          <div style={{ ...card, background: 'linear-gradient(135deg,#fffbeb,#fef3c7)', border: '1px solid #fde68a', padding: '1.25rem' }}>
            <p style={{ color: '#92400e', fontWeight: '700', fontSize: '0.825rem', marginBottom: '0.75rem' }}>
              ✦ Tips
            </p>
            {[
              'Draw slowly for best quality',
              'Use black ink style for clarity',
              'Signature appears on all PDFs',
              'You can update it at any time',
              'Upload a scanned signature image',
            ].map(tip => (
              <p key={tip} style={{ color: '#a16207', fontSize: '0.75rem', margin: '0 0 0.375rem', display: 'flex', gap: '0.375rem', alignItems: 'flex-start' }}>
                <span style={{ flexShrink: 0, marginTop: '0.1rem' }}>•</span> {tip}
              </p>
            ))}
          </div>

        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </Layout>
  )
}