import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { ISO_STANDARDS } from '../../../lib/constants'
import { formatDate } from '../../../lib/utils'

// ── Premium Design Tokens ──
const NAVY    = '#1a3a52'
const ACCENT  = '#0066cc'
const ACCENT2 = '#00b4d8'
const WHITE   = '#FFFFFF'
const BG      = '#F5F7FA'
const BORDER  = '#E0E5EB'
const TEXT    = '#1A1A2E'
const MUTED   = '#6B7280'
const SUCCESS = '#10B981'
const DANGER  = '#EF4444'
const WARNING = '#F59E0B'
const INFO    = '#3B82F6'

// ── Shared Styles ──
const thS: React.CSSProperties = {
  padding: '10px 14px', fontWeight: '700', fontSize: '9px',
  textTransform: 'uppercase', letterSpacing: '0.12em',
  borderBottom: `2px solid ${ACCENT}`,
}
const tdS: React.CSSProperties = {
  padding: '10px 14px', verticalAlign: 'top', fontSize: '9px',
}

function RPSection({ number, title, children, icon }: {
  number?: string
  title: string
  children: React.ReactNode
  icon?: string
}) {
  return (
    <div style={{ padding: '24px 32px', borderTop: `1px solid ${BORDER}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
        {icon && <span style={{ fontSize: '20px' }}>{icon}</span>}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {number && (
              <span style={{ color: ACCENT, fontWeight: '800', fontSize: '11px', minWidth: '24px' }}>
                {number}.
              </span>
            )}
            <h2 style={{ color: NAVY, fontSize: '12px', fontWeight: '800', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {title}
            </h2>
          </div>
          <div style={{ height: '2px', background: `linear-gradient(90deg,${ACCENT}80,transparent)`, marginTop: '8px' }} />
        </div>
      </div>
      {children}
    </div>
  )
}

interface FullAudit {
  id: string; audit_number: string; standard: string; status: string
  result?: string; risk_level?: string; compliance_score?: number
  audit_date: string; location?: string; audit_scope?: string; audit_type?: string
  executive_summary?: string; recommendations?: string; overall_notes?: string
  compliant_count: number; non_compliant_count: number
  observation_count: number; not_applicable_count: number
  company_name: string; client_name: string; industry: string
  country: string; city?: string; auditor_name: string; auditor_title?: string
  site_photo_url?: string; site_photo_caption?: string
  auditor_signature_url?: string
}

interface Answer {
  id: string; status?: string; notes?: string; is_flagged: boolean
  template: {
    clause_number: string; clause_title: string; section: string
    question: string; is_critical: boolean; sort_order: number
  }
}

interface Note { id: string; content: string; is_critical: boolean; created_at: string }
interface AuditFile { id: string; file_name: string; file_url: string; file_type: string; file_size?: number; description?: string }
interface CA { id: string; ref_number: string; finding: string; corrective_action: string; responsibility: string; status: string }

export default function ReportPage() {
  const router = useRouter()
  const { id } = router.query
  const reportRef = useRef<HTMLDivElement>(null)

  const [audit, setAudit] = useState<FullAudit | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [files, setFiles] = useState<AuditFile[]>([])
  const [cas, setCas] = useState<CA[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => { if (id) fetchAll() }, [id])

  const fetchAll = async () => {
    const [auditRes, answersRes, notesRes, filesRes, casRes, userRes] = await Promise.all([
      supabase.from('audit_list_view').select('*').eq('id', id).single(),
      supabase.from('audit_answers')
        .select('*, template:iso_templates(*)')
        .eq('audit_id', id)
        .order('template(sort_order)'),
      supabase.from('audit_notes')
        .select('*').eq('audit_id', id)
        .eq('is_internal', false).order('created_at'),
      supabase.from('audit_files').select('*').eq('audit_id', id).order('created_at'),
      supabase.from('audit_corrective_actions').select('*').eq('audit_id', id).order('created_at'),
      supabase.auth.getUser(),
    ])
    setAudit(auditRes.data as FullAudit)
    setAnswers((answersRes.data as any) || [])
    setNotes(notesRes.data || [])
    setFiles(filesRes.data || [])
    setCas(casRes.data || [])
    if (userRes.data.user) {
      const { data: prof } = await supabase
        .from('profiles').select('*')
        .eq('id', userRes.data.user.id).single()
      setProfile(prof)
    }
    setLoading(false)
  }

  const handlePDF = async () => {
    if (!reportRef.current) return
    setGenerating(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const jsPDF = (await import('jspdf')).default
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, useCORS: true, backgroundColor: '#fff',
        logging: false, allowTaint: true, imageTimeout: 15000,
      })
      const imgData = canvas.toDataURL('image/jpeg', 0.92)
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pw = pdf.internal.pageSize.getWidth()
      const ph = pdf.internal.pageSize.getHeight()
      const ih = (canvas.height * pw) / canvas.width
      let pos = 0, rem = ih
      pdf.addImage(imgData, 'JPEG', 0, pos, pw, ih)
      rem -= ph
      while (rem > 0) {
        pos -= ph; pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, pos, pw, ih)
        rem -= ph
      }
      pdf.save(`${audit?.audit_number}-Audit-Report.pdf`)
    } catch {
      alert('PDF generation failed. Use Print (Ctrl+P) instead.')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG, fontFamily: 'Inter, Arial, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: `4px solid ${BORDER}`, borderTopColor: ACCENT, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: MUTED }}>Preparing professional report...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!audit) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, Arial, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '3rem' }}>📄</p>
        <p style={{ color: MUTED }}>Report not found</p>
        <Link href="/audits" style={{ background: NAVY, color: '#fff', padding: '0.625rem 1.25rem', borderRadius: '0.5rem', textDecoration: 'none', marginTop: '1rem', display: 'inline-block' }}>← Back</Link>
      </div>
    </div>
  )

  // ── Computed Values ──
  const score = audit.compliance_score ?? 0
  const ncItems = answers.filter(a => a.status === 'non_compliant')
  const obsItems = answers.filter(a => a.status === 'observation')
  const imageFiles = files.filter(f => f.file_type?.startsWith('image/'))
  const critNotes = notes.filter(n => n.is_critical)

  const resultColor = audit.result === 'pass' ? SUCCESS : audit.result === 'fail' ? DANGER : WARNING
  const resultLabel = audit.result === 'pass'
    ? 'SUBSTANTIALLY COMPLIANT'
    : audit.result === 'fail' ? 'NON-COMPLIANT' : 'CONDITIONALLY COMPLIANT'
  const scoreLabel = score >= 90 ? 'EXCELLENT' : score >= 85 ? 'VERY GOOD' : score >= 75 ? 'GOOD' : score >= 60 ? 'FAIR' : 'NEEDS IMPROVEMENT'

  const auditorName = profile?.full_name || audit.auditor_name
  const auditorTitle = profile?.title || audit.auditor_title || 'Lead Auditor'
  const auditorSig = profile?.signature_url || audit.auditor_signature_url

  // ── Group by section ──
  const sections = answers.reduce((acc, ans) => {
    const sec = ans.template?.section || 'General'
    if (!acc[sec]) acc[sec] = []
    acc[sec].push(ans)
    return acc
  }, {} as Record<string, Answer[]>)

  const sectionSummary = Object.entries(sections).map(([section, items]) => {
    const total = items.filter(a => a.status && a.status !== 'not_applicable').length
    const cnt = items.filter(a => a.status === 'compliant').length
    const sScore = total > 0 ? Math.round((cnt / total) * 100) : 0
    const status = sScore >= 85 ? 'Compliant' : sScore >= 70 ? 'Partially Compliant' : total === 0 ? 'Not Assessed' : 'Non-Compliant'
    return { section, sScore, status, total, cnt }
  })

  let sectionNum = 0
  const nextNum = () => { sectionNum++; return String(sectionNum) }

  return (
    <>
      <Head>
        <title>{audit.audit_number} — Professional Audit Report | Pioneers</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      {/* ══ Control Bar ══ */}
      <div className="no-print" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
        background: `linear-gradient(135deg, ${NAVY}, #0f2940)`, padding: '0.75rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontFamily: 'Inter, Arial, sans-serif',
        boxShadow: `0 8px 24px rgba(0,0,0,0.2)`,
        borderBottom: `3px solid ${ACCENT}`
      }}>
        {/* Left: Logo + Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: 70, height: 70,
            background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`,
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 12px 24px rgba(0,102,204,0.35), inset 0 1px 0 rgba(255,255,255,0.2)`,
            border: `2px solid rgba(0,180,216,0.5)`,
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background glow */}
            <div style={{
              position: 'absolute',
              width: '100%', height: '100%',
              background: 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />
            <img
              src="/logo.png"
              alt="Pioneers"
              style={{
                width: 55, height: 55,
                objectFit: 'contain',
                filter: 'brightness(0) invert(1) drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                position: 'relative',
                zIndex: 1
              }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </div>
          <div>
            <div style={{ color: WHITE, fontWeight: '900', fontSize: '1.1rem', lineHeight: 1 }}>PIONEERS</div>
            <div style={{ color: ACCENT2, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: '700' }}>International Consulting</div>
          </div>
        </div>

        {/* Center: Audit Number */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto', marginRight: 'auto' }}>
          <Link href={`/audits/${id}`} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '500', transition: 'color 0.2s' }} onMouseEnter={e => { (e.target as HTMLAnchorElement).style.color = WHITE }} onMouseLeave={e => { (e.target as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.7)' }}>← Back</Link>
          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)' }} />
          <span style={{ color: ACCENT2, fontFamily: 'monospace', fontWeight: '700', fontSize: '0.95rem' }}>{audit.audit_number}</span>
        </div>

        {/* Right: Buttons */}
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <button onClick={() => window.print()} style={{
            padding: '0.5rem 1.25rem', background: 'rgba(255,255,255,0.1)',
            color: WHITE, border: `1px solid rgba(255,255,255,0.3)`,
            borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit',
            fontWeight: '600', transition: 'all 0.2s',
          }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)' }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}>
            🖨️ Print
          </button>
          <button onClick={handlePDF} disabled={generating} style={{
            padding: '0.5rem 1.25rem',
            background: generating ? '#666' : `linear-gradient(135deg,${ACCENT},${ACCENT2})`,
            color: WHITE, border: 'none', borderRadius: '0.5rem',
            cursor: generating ? 'not-allowed' : 'pointer',
            fontSize: '0.85rem', fontFamily: 'inherit', fontWeight: '700',
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            transition: 'all 0.2s'
          }} onMouseEnter={e => { if (!generating) e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseLeave={e => { if (!generating) e.currentTarget.style.transform = 'translateY(0)' }}>
            {generating ? '⏳ Generating...' : '⬇️ Download PDF'}
          </button>
        </div>
      </div>

      {/* ══ Report Wrapper ══ */}
      <div className="report-bg" style={{ background: '#d0d0d0', minHeight: '100vh', paddingTop: '70px', paddingBottom: '3rem' }}>
        <div ref={reportRef} style={{
          width: '210mm', margin: '0 auto', background: WHITE,
          fontFamily: 'Inter, Arial, sans-serif',
          fontSize: '10px', lineHeight: '1.6', color: TEXT,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>

          {/* ══════════════════════════════════
              COVER PAGE - PREMIUM DESIGN
          ══════════════════════════════════ */}
          <div style={{ minHeight: '297mm', display: 'flex', flexDirection: 'column', background: `linear-gradient(135deg, #1a3a52 0%, #0f2940 100%)`, position: 'relative', overflow: 'hidden' }}>

            {/* ── Decorative Background Gradient ── */}
            <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,100,204,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, background: 'radial-gradient(circle, rgba(0,180,216,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

            {/* ── Accent Top Bar ── */}
            <div style={{ height: '6px', background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2}, ${ACCENT})`, flexShrink: 0, boxShadow: '0 4px 12px rgba(0,102,204,0.3)' }} />

            {/* ── Header with Logo ── */}
            <div style={{ padding: '32px 40px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: 70, height: 70, background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 12px 32px rgba(0,102,204,0.3)` }}>
                  <img src="/logo.png" alt="Pioneers" style={{ width: 55, height: 55, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </div>
                <div>
                  <div style={{ color: WHITE, fontWeight: '900', fontSize: '20px', letterSpacing: '0.1em' }}>PIONEERS</div>
                  <div style={{ color: ACCENT2, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.95, fontWeight: '700' }}>
                    International Consulting
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '8px', marginTop: '3px', fontWeight: '500' }}>
                    ISO Audit & Certification Experts
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right', position: 'relative', zIndex: 1 }}>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px', fontWeight: '700' }}>Reference</div>
                <div style={{ color: ACCENT2, fontFamily: 'monospace', fontWeight: '900', fontSize: '14px', letterSpacing: '0.05em' }}>{audit.audit_number}</div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '8px', marginTop: '3px' }}>{formatDate(new Date().toISOString())}</div>
              </div>
            </div>

            {/* ── Site Photo with Overlay ── */}
            {audit.site_photo_url && (
              <div style={{ margin: '24px 40px 0', borderRadius: '16px', overflow: 'hidden', position: 'relative', zIndex: 1, boxShadow: `0 16px 40px rgba(0,0,0,0.3)` }}>
                <img src={audit.site_photo_url} alt="Site" crossOrigin="anonymous"
                  style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} />
                {audit.site_photo_caption && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(15,41,64,0.9))', padding: '16px 20px' }}>
                    <div style={{ color: WHITE, fontSize: '10px', fontStyle: 'italic', fontWeight: '500' }}>
                      📍 {audit.site_photo_caption}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Central Logo Section ── */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 40px 60px', position: 'relative', zIndex: 1 }}>
              {/* Large Logo Box */}
              <div style={{
                width: 160, height: 160,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(0,180,216,0.1))',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: `0 20px 50px rgba(0,102,204,0.2), inset 0 1px 0 rgba(255,255,255,0.2)`,
                border: `2px solid rgba(0,180,216,0.3)`,
                marginBottom: '24px',
                backdropFilter: 'blur(10px)'
              }}>
                <img
                  src="/logo.png"
                  alt="Pioneers Logo"
                  style={{ width: 140, height: 140, objectFit: 'contain', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.2))' }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              </div>

              {/* Company Name */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: WHITE, fontWeight: '900', fontSize: '32px', letterSpacing: '0.12em', marginBottom: '8px' }}>
                  PIONEERS
                </div>
                <div style={{ color: ACCENT2, fontSize: '13px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: '700', marginBottom: '6px' }}>
                  International Consulting
                </div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontStyle: 'italic', fontWeight: '500', letterSpacing: '0.05em' }}>
                  ISO Audit & Certification Experts
                </div>
              </div>
            </div>

            {/* ── Title Block ── */}
            <div style={{ flex: 1, padding: '0 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
              <div style={{ width: 60, height: '4px', background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})`, marginBottom: '20px', borderRadius: '2px' }} />
              <div style={{ color: ACCENT2, fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '800', opacity: 0.95 }}>
                Professional Audit Report
              </div>
              <div style={{ color: WHITE, fontSize: '40px', fontWeight: '300', lineHeight: 1.1, marginBottom: '8px', letterSpacing: '-0.02em' }}>
                {ISO_STANDARDS[audit.standard as keyof typeof ISO_STANDARDS]?.label}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', fontWeight: '400', marginBottom: '32px', lineHeight: '1.6' }}>
                {ISO_STANDARDS[audit.standard as keyof typeof ISO_STANDARDS]?.description}
              </div>

              {/* ── Info Grid ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 32px', marginBottom: '28px' }}>
                {[
                  { label: 'Organization', value: audit.company_name },
                  { label: 'Contact Person', value: audit.client_name },
                  { label: 'Location', value: `${audit.city || audit.country}` },
                  { label: 'Industry', value: audit.industry },
                  { label: 'Audit Date', value: formatDate(audit.audit_date) },
                  { label: 'Lead Auditor', value: auditorName },
                  { label: 'Compliance Score', value: `${score}%` },
                  { label: 'Overall Status', value: resultLabel },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ color: ACCENT2, fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '4px', fontWeight: '700', opacity: 0.9 }}>
                      {item.label}
                    </div>
                    <div style={{ color: WHITE, fontSize: '11px', fontWeight: '600', opacity: 0.98 }}>
                      {item.value || '—'}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Result Badge ── */}
              {audit.result && (
                <div style={{ textAlign: 'center', padding: '20px', background: 'linear-gradient(135deg, rgba(0,102,204,0.1), rgba(0,180,216,0.1))', borderRadius: '12px', border: `2px solid ${ACCENT}`, backdropFilter: 'blur(10px)' }}>
                  <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', fontWeight: '700' }}>
                    Compliance Status
                  </div>
                  <div style={{ color: resultColor, fontSize: '20px', fontWeight: '800', letterSpacing: '0.02em', marginBottom: '6px' }}>
                    {resultLabel}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', fontStyle: 'italic' }}>
                    Score: {score}% | Level: {scoreLabel}
                  </div>
                </div>
              )}
            </div>

            {/* ── Bottom Footer ── */}
            <div style={{ flexShrink: 0, position: 'relative', zIndex: 1 }}>
              <div style={{ height: '4px', background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2}, ${ACCENT})` }} />
              <div style={{ padding: '12px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0, 0, 0, 0.2)' }}>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '8px', fontWeight: '600' }}>
                  Pioneers International | ISO {audit.standard} Audit
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '8px', fontWeight: '600' }}>
                  Page 1 | Confidential
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════
              SECTION 1 — EXECUTIVE SUMMARY
          ══════════════════════════════════ */}
          <RPSection number={nextNum()} title="Executive Summary" icon="📋">
            {/* ── Enhanced Stats Cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'Compliant', n: audit.compliant_count || 0, color: SUCCESS, bg: '#F0FDF4', icon: '✓' },
                { label: 'Non-Compliant', n: audit.non_compliant_count || 0, color: DANGER, bg: '#FEF2F2', icon: '✕' },
                { label: 'Observations', n: audit.observation_count || 0, color: WARNING, bg: '#FFFBEB', icon: '!' },
                { label: 'N/A', n: audit.not_applicable_count || 0, color: MUTED, bg: '#F9FAFB', icon: '—' },
              ].map(item => {
                const total = answers.length || 1
                const percentage = Math.round((item.n / total) * 100)
                return (
                  <div key={item.label} style={{
                    background: item.bg,
                    borderRadius: '12px',
                    padding: '16px 12px',
                    textAlign: 'center',
                    border: `2px solid ${item.color}40`,
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: `0 2px 8px ${item.color}15`
                  }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: item.color }} />
                    <div style={{ fontSize: '28px', fontWeight: '900', color: item.color, lineHeight: 1, marginBottom: '6px' }}>
                      {item.icon} {item.n}
                    </div>
                    <div style={{ fontSize: '8px', color: MUTED, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '7px', color: item.color, fontWeight: '600' }}>
                      {percentage}% of total
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ── Enhanced Compliance Score ── */}
            <div style={{ marginBottom: '18px', padding: '16px', background: 'linear-gradient(135deg, #f0f7ff, #f8fbff)', borderRadius: '12px', border: `2px solid ${resultColor}30` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <span style={{ fontSize: '9px', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall Compliance Score</span>
                  <div style={{ fontSize: '28px', fontWeight: '900', color: resultColor, marginTop: '4px' }}>
                    {score}%
                  </div>
                </div>
                <div style={{
                  width: '80px', height: '80px',
                  borderRadius: '50%',
                  background: 'conic-gradient(' + resultColor + ' ' + (score * 3.6) + 'deg, #e5e7eb 0deg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 12px ${resultColor}20`
                }}>
                  <div style={{
                    width: '70px', height: '70px',
                    borderRadius: '50%',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: '800',
                    color: resultColor
                  }}>
                    {score}%
                  </div>
                </div>
              </div>
              <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: '9999px', width: `${score}%`, background: `linear-gradient(90deg, ${resultColor}, ${resultColor}99)`, transition: 'width 0.5s ease-out' }} />
              </div>
              <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '8px', color: MUTED, fontWeight: '600' }}>{scoreLabel}</span>
                <span style={{ fontSize: '8px', color: TEXT, fontWeight: '600' }}>
                  {score >= 90 ? '🟢 Excellent' : score >= 85 ? '🟢 Very Good' : score >= 75 ? '🟡 Good' : score >= 60 ? '🟠 Fair' : '🔴 Needs Improvement'}
                </span>
              </div>
            </div>

            {/* ── Summary Box ── */}
            <div style={{ padding: '16px 18px', borderRadius: '12px', background: `linear-gradient(135deg, ${ACCENT}08, ${ACCENT2}08)`, borderLeft: `5px solid ${ACCENT}`, border: `1px solid ${ACCENT}20` }}>
              <div style={{ fontSize: '8px', fontWeight: '700', color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
                📋 Executive Summary
              </div>
              <div style={{ fontSize: '9.5px', color: TEXT, lineHeight: '1.8', fontWeight: '500' }}>
                {audit.executive_summary || (
                  <>This comprehensive audit was conducted in accordance with ISO {audit.standard} standards by <strong>Pioneers International</strong> to assess <strong>{audit.company_name}'s</strong> compliance and management system maturity. The organization achieved a compliance score of <strong>{score}%</strong>, demonstrating a <strong>{scoreLabel.toLowerCase()}</strong> level of conformity. A total of {answers.length} criteria were evaluated across {Object.keys(sections).length} key sections.</>
                )}
              </div>
            </div>
          </RPSection>

          {/* ══════════════════════════════════
              SECTION 2 — COMPLIANCE OVERVIEW
          ══════════════════════════════════ */}
          <RPSection number={nextNum()} title="Compliance Overview by Section" icon="📊">
            <div style={{ borderRadius: '12px', border: `1px solid ${BORDER}`, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
                <thead>
                  <tr style={{ background: `linear-gradient(135deg, ${NAVY}, #0f2940)` }}>
                    <th style={{ ...thS, color: WHITE, width: '50%', textAlign: 'left', padding: '14px' }}>Section</th>
                    <th style={{ ...thS, color: WHITE, width: '20%', textAlign: 'center', padding: '14px' }}>Score</th>
                    <th style={{ ...thS, color: WHITE, width: '30%', textAlign: 'left', padding: '14px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sectionSummary.map((row, i) => {
                    const sc = row.sScore >= 85 ? SUCCESS : row.sScore >= 70 ? WARNING : row.total === 0 ? MUTED : DANGER
                    return (
                      <tr key={row.section} style={{
                        background: i % 2 === 0 ? WHITE : '#f9fafb',
                        borderBottom: `1px solid ${BORDER}`,
                        transition: 'background 0.2s'
                      }} onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = `${ACCENT}08` }} onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? WHITE : '#f9fafb' }}>
                        <td style={{ ...tdS, fontWeight: '700', color: NAVY, padding: '14px' }}>{row.section}</td>
                        <td style={{ ...tdS, textAlign: 'center', padding: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <div style={{ width: '60px', height: '4px', background: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${row.sScore}%`, background: sc, borderRadius: '9999px' }} />
                            </div>
                            <span style={{ fontWeight: '800', color: sc, fontSize: '10px', minWidth: '40px' }}>{row.sScore}%</span>
                          </div>
                        </td>
                        <td style={{ ...tdS, padding: '14px' }}>
                          <span style={{ color: sc, fontWeight: '700', fontSize: '9px', display: 'inline-block', padding: '4px 10px', background: `${sc}15`, borderRadius: '6px' }}>
                            {row.status}
                          </span>
                          <span style={{ color: MUTED, fontSize: '8px', marginLeft: '8px' }}>({row.cnt}/{row.total})</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </RPSection>

          {/* ══════════════════════════════════
              SECTION 3 — DETAILED FINDINGS
          ══════════════════════════════════ */}
          <RPSection number={nextNum()} title="Detailed Findings by Section" icon="🔍">
            {Object.entries(sections).map(([section, sAnswers]) => {
              const total = sAnswers.filter(a => a.status && a.status !== 'not_applicable').length
              const cnt = sAnswers.filter(a => a.status === 'compliant').length
              const sScore = total > 0 ? Math.round((cnt / total) * 100) : 0
              const sc = sScore >= 85 ? SUCCESS : sScore >= 70 ? WARNING : total === 0 ? MUTED : DANGER

              return (
                <div key={section} style={{ marginBottom: '16px', borderRadius: '8px', border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: NAVY, borderRadius: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: 4, height: 14, background: ACCENT, borderRadius: 2 }} />
                      <span style={{ color: WHITE, fontWeight: '700', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{section}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '50px', height: '5px', background: 'rgba(255,255,255,0.2)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${sScore}%`, background: sc, borderRadius: '9999px' }} />
                      </div>
                      <span style={{ color: ACCENT, fontSize: '9px', fontWeight: '800', minWidth: '40px', textAlign: 'right' }}>{sScore}%</span>
                    </div>
                  </div>

                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {sAnswers.map((ans, idx) => {
                      const sm: Record<string, { bg: string; color: string; label: string; icon: string }> = {
                        compliant: { bg: '#F0FDF4', color: SUCCESS, label: '✓ Compliant', icon: '✓' },
                        non_compliant: { bg: '#FEF2F2', color: DANGER, label: '✕ Non-Compliant', icon: '✕' },
                        observation: { bg: '#FFFBEB', color: WARNING, label: '! Observation', icon: '!' },
                        not_applicable: { bg: '#F9FAFB', color: MUTED, label: '— N/A', icon: '—' },
                      }
                      const s = ans.status ? sm[ans.status] : { bg: '#FAFAFA', color: MUTED, label: '? Unanswered', icon: '?' }

                      return (
                        <div key={ans.id} style={{ padding: '10px 14px', background: idx % 2 === 0 ? s.bg : WHITE, borderBottom: idx < sAnswers.length - 1 ? `1px solid ${BORDER}` : 'none', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <div style={{ color: s.color, fontWeight: '800', fontSize: '10px', minWidth: '20px', marginTop: '1px' }}>
                            {s.icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '700', color: NAVY, fontSize: '9px', marginBottom: '2px' }}>
                              {ans.template?.clause_number} — {ans.template?.clause_title}
                            </div>
                            <div style={{ fontSize: '8.5px', color: TEXT, marginBottom: '2px', lineHeight: '1.4' }}>
                              {ans.template?.question}
                            </div>
                            {ans.notes && (
                              <div style={{ fontSize: '8px', color: s.color, marginTop: '3px', fontStyle: 'italic', borderLeft: `2px solid ${s.color}`, paddingLeft: '6px' }}>
                                💬 {ans.notes}
                              </div>
                            )}
                          </div>
                          <span style={{ fontSize: '8px', fontWeight: '700', background: s.bg, color: s.color, padding: '2px 8px', borderRadius: '9999px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                            {s.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </RPSection>

          {/* ══════════════════════════════════
              SECTION 4 — NON-CONFORMITIES
          ══════════════════════════════════ */}
          {(ncItems.length > 0 || obsItems.length > 0) && (
            <RPSection number={nextNum()} title="Non-Conformities & Observations" icon="⚠️">
              {ncItems.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: DANGER }} />
                    <span style={{ fontWeight: '700', color: DANGER, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Non-Conformities ({ncItems.length})
                    </span>
                  </div>
                  {ncItems.map((ans, i) => (
                    <div key={ans.id} style={{ display: 'flex', gap: '10px', padding: '10px 12px', background: '#FEF2F2', borderRadius: '6px', border: `1px solid #FECACA`, marginBottom: '6px' }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: DANGER, color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: '800', flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', color: '#991B1B', fontSize: '9px', marginBottom: '2px' }}>
                          {ans.template?.clause_number} — {ans.template?.clause_title}
                        </div>
                        <div style={{ fontSize: '8.5px', color: TEXT, marginBottom: '2px' }}>
                          {ans.template?.question}
                        </div>
                        {ans.notes && (
                          <div style={{ fontSize: '8px', color: DANGER, marginTop: '3px', fontWeight: '500' }}>
                            🔴 Finding: {ans.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {obsItems.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: WARNING }} />
                    <span style={{ fontWeight: '700', color: WARNING, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Observations ({obsItems.length})
                    </span>
                  </div>
                  {obsItems.map((ans, i) => (
                    <div key={ans.id} style={{ display: 'flex', gap: '10px', padding: '10px 12px', background: '#FFFBEB', borderRadius: '6px', border: `1px solid #FDE68A`, marginBottom: '6px' }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: WARNING, color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: '800', flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', color: '#92400E', fontSize: '9px', marginBottom: '2px' }}>
                          {ans.template?.clause_number} — {ans.template?.clause_title}
                        </div>
                        <div style={{ fontSize: '8.5px', color: TEXT, marginBottom: '2px' }}>
                          {ans.template?.question}
                        </div>
                        {ans.notes && (
                          <div style={{ fontSize: '8px', color: WARNING, marginTop: '3px', fontWeight: '500' }}>
                            🟡 Observation: {ans.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </RPSection>
          )}

          {/* ══════════════════════════════════
              SECTION — SITE PHOTOS
          ══════════════════════════════════ */}
          {imageFiles.length > 0 && (
            <RPSection number={nextNum()} title="Site Photos & Evidence" icon="📸">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                {imageFiles.map((file, i) => (
                  <div key={file.id} style={{ borderRadius: '8px', overflow: 'hidden', border: `1px solid ${BORDER}`, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <img src={file.file_url} alt={file.file_name} crossOrigin="anonymous"
                      style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }} />
                    <div style={{ padding: '6px 8px', background: BG }}>
                      <div style={{ fontSize: '8px', color: TEXT, fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {file.description || file.file_name}
                      </div>
                      <div style={{ fontSize: '7.5px', color: MUTED }}>Photo {i + 1}</div>
                    </div>
                  </div>
                ))}
              </div>
            </RPSection>
          )}

          {/* ══════════════════════════════════
              SECTION — AUDIT NOTES
          ══════════════════════════════════ */}
          {notes.length > 0 && (
            <RPSection number={nextNum()} title="Audit Notes & Key Findings" icon="📝">
              {critNotes.length > 0 && (
                <div style={{ marginBottom: '16px', padding: '14px', background: 'linear-gradient(135deg, #FEF2F2, #FEF5F5)', borderRadius: '12px', border: `2px solid ${DANGER}30`, boxShadow: `0 2px 8px ${DANGER}10` }}>
                  <div style={{ fontSize: '8px', fontWeight: '800', color: DANGER, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🔴 Critical Findings ({critNotes.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {critNotes.map(note => (
                      <div key={note.id} style={{ borderLeft: `4px solid ${DANGER}`, paddingLeft: '12px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', background: WHITE, borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '8.5px', color: TEXT, lineHeight: '1.6', fontWeight: '500' }}>
                          {note.content}
                        </div>
                        <div style={{ fontSize: '7px', color: MUTED, marginTop: '4px' }}>
                          Added: {formatDate(note.created_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {notes.filter(n => !n.is_critical).length > 0 && (
                <div>
                  <div style={{ fontSize: '9px', fontWeight: '800', color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                    ℹ️ General Notes ({notes.filter(n => !n.is_critical).length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {notes.filter(n => !n.is_critical).map(note => (
                      <div key={note.id} style={{ padding: '12px', borderRadius: '8px', borderLeft: `4px solid ${ACCENT}`, background: `${ACCENT}08`, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <div style={{ fontSize: '8.5px', color: TEXT, lineHeight: '1.6' }}>{note.content}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </RPSection>
          )}

          {/* ══════════════════════════════════
              SECTION — CORRECTIVE ACTIONS
          ══════════════════════════════════ */}
          {cas.length > 0 && (
            <RPSection number={nextNum()} title="Corrective Action Plan" icon="⚡">
              <div style={{ borderRadius: '12px', border: `1px solid ${BORDER}`, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5px' }}>
                  <thead>
                    <tr style={{ background: `linear-gradient(135deg, ${NAVY}, #0f2940)` }}>
                      {['Ref', 'Finding', 'Action', 'Responsibility', 'Status'].map(h => (
                        <th key={h} style={{ ...thS, color: WHITE, textAlign: 'left', padding: '12px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cas.map((ca, i) => {
                      const statusColor = ca.status === 'CLOSED' ? SUCCESS : ca.status === 'IN_PROGRESS' ? INFO : DANGER
                      const statusBg = ca.status === 'CLOSED' ? '#F0FDF4' : ca.status === 'IN_PROGRESS' ? '#EFF6FF' : '#FEF2F2'
                      return (
                        <tr key={ca.id} style={{
                          background: i % 2 === 0 ? WHITE : '#f9fafb',
                          borderBottom: `1px solid ${BORDER}`,
                          transition: 'background 0.2s'
                        }} onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = `${ACCENT}08` }} onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? WHITE : '#f9fafb' }}>
                          <td style={{ ...tdS, fontFamily: 'monospace', fontWeight: '700', color: ACCENT, padding: '12px' }}>{ca.ref_number}</td>
                          <td style={{ ...tdS, color: TEXT, padding: '12px', fontSize: '8px' }}>{ca.finding}</td>
                          <td style={{ ...tdS, color: TEXT, padding: '12px', fontSize: '8px' }}>{ca.corrective_action}</td>
                          <td style={{ ...tdS, color: MUTED, padding: '12px', fontSize: '8px' }}>{ca.responsibility}</td>
                          <td style={{ ...tdS, fontWeight: '800', color: statusColor, padding: '12px' }}>
                            <span style={{ display: 'inline-block', padding: '3px 10px', background: statusBg, borderRadius: '6px', fontSize: '8px' }}>
                              {ca.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </RPSection>
          )}

          {/* ══════════════════════════════════
              SECTION — RECOMMENDATIONS
          ══════════════════════════════════ */}
          {audit.recommendations && (
            <RPSection number={nextNum()} title="Recommendations" icon="💡">
              <div style={{
                padding: '16px 18px',
                background: `linear-gradient(135deg, ${ACCENT}08, ${ACCENT2}08)`,
                borderRadius: '12px',
                border: `2px solid ${ACCENT}20`,
                borderLeft: `5px solid ${ACCENT}`,
                boxShadow: `0 2px 8px ${ACCENT}10`
              }}>
                <div style={{ fontSize: '9px', color: TEXT, lineHeight: '1.8', whiteSpace: 'pre-line', fontWeight: '500' }}>
                  {audit.recommendations}
                </div>
              </div>
            </RPSection>
          )}

          {/* ══════════════════════════════════
              FINAL PAGE — CONCLUSION & SIGNATURE
          ══════════════════════════════════ */}
          <RPSection number="" title="Final Assessment & Conclusions" icon="✅">
            <div style={{ textAlign: 'center', marginBottom: '20px', padding: '16px', background: `${resultColor}10`, borderRadius: '8px', border: `2px solid ${resultColor}` }}>
              <div style={{ fontSize: '9px', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px', fontWeight: '700' }}>
                Overall Compliance Score
              </div>
              <div style={{ fontSize: '36px', fontWeight: '800', color: resultColor, lineHeight: 1, marginBottom: '4px' }}>
                {score}%
              </div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: resultColor, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                {resultLabel}
              </div>
              <div style={{ fontSize: '9px', color: MUTED }}>
                {ISO_STANDARDS[audit.standard as keyof typeof ISO_STANDARDS]?.label}
              </div>
            </div>

            <div style={{ padding: '14px 16px', background: BG, borderRadius: '8px', fontSize: '9px', color: TEXT, lineHeight: '1.7', marginBottom: '16px' }}>
              {audit.overall_notes || `Based on the comprehensive audit conducted, ${audit.company_name} has demonstrated a ${scoreLabel.toLowerCase()} level of management system maturity and ISO ${audit.standard} compliance. The organization has successfully implemented ${audit.compliant_count || 0} compliant criteria and is addressing ${ncItems.length} non-conformities through corrective actions. With a compliance score of ${score}%, the organization is ${score >= 85 ? 'well-positioned to pursue formal ISO certification' : 'recommended to implement improvements before pursuing certification'}.`}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '12px', background: '#E8F5E9', borderRadius: '6px', border: `1px solid ${SUCCESS}30` }}>
                <div style={{ fontSize: '8px', fontWeight: '700', color: SUCCESS, textTransform: 'uppercase', marginBottom: '4px' }}>✓ Strengths</div>
                <div style={{ fontSize: '8.5px', color: TEXT, lineHeight: '1.5' }}>
                  Strong performance in documentation and procedural compliance. Effective implementation of management system principles across key processes.
                </div>
              </div>
              <div style={{ padding: '12px', background: '#FFF3E0', borderRadius: '6px', border: `1px solid ${WARNING}30` }}>
                <div style={{ fontSize: '8px', fontWeight: '700', color: WARNING, textTransform: 'uppercase', marginBottom: '4px' }}>⚠ Improvement Areas</div>
                <div style={{ fontSize: '8.5px', color: TEXT, lineHeight: '1.5' }}>
                  Focus on continuous improvement and staff training. Regular management reviews and monitoring are recommended for optimal performance.
                </div>
              </div>
            </div>
          </RPSection>

          {/* ══════════════════════════════════
              SIGNATURE PAGE
          ══════════════════════════════════ */}
          <RPSection number="" title="Professional Certification & Sign-Off" icon="✍️">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '8px', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: '700', marginBottom: '10px' }}>
                  Lead Auditor
                </div>
                <div style={{ height: '70px', borderBottom: `2px solid ${NAVY}`, marginBottom: '8px', display: 'flex', alignItems: 'flex-end', paddingBottom: '4px' }}>
                  {auditorSig ? (
                    <img src={auditorSig} alt="Signature" crossOrigin="anonymous" style={{ height: '60px', maxWidth: '180px', objectFit: 'contain', display: 'block' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  ) : (
                    <span style={{ color: '#D1D5DB', fontSize: '9px', fontStyle: 'italic' }}>[Digital Signature]</span>
                  )}
                </div>
                <div style={{ fontWeight: '800', color: NAVY, fontSize: '10px', marginBottom: '2px' }}>{auditorName}</div>
                <div style={{ color: MUTED, fontSize: '8.5px', marginBottom: '2px' }}>{auditorTitle}</div>
                <div style={{ color: MUTED, fontSize: '8px', marginBottom: '2px' }}>Pioneers International for Business Consulting</div>
                <div style={{ color: MUTED, fontSize: '7.5px' }}>{formatDate(new Date().toISOString())}</div>
              </div>
              <div>
                <div style={{ fontSize: '8px', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: '700', marginBottom: '10px' }}>
                  Client Representative
                </div>
                <div style={{ height: '70px', borderBottom: `2px solid ${NAVY}`, marginBottom: '8px' }} />
                <div style={{ fontWeight: '800', color: NAVY, fontSize: '10px', marginBottom: '2px' }}>{audit.client_name}</div>
                <div style={{ color: MUTED, fontSize: '8.5px', marginBottom: '2px' }}>{audit.company_name}</div>
                <div style={{ color: MUTED, fontSize: '8px' }}>Date: _______________________</div>
              </div>
            </div>

            <div style={{ borderTop: `2px solid ${BORDER}`, paddingTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: `linear-gradient(135deg, ${NAVY}05, ${ACCENT}05)`, padding: '14px', borderRadius: '8px', marginTop: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 40, height: 40, background: NAVY, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/logo.png" alt="Pioneers" style={{ width: 30, height: 30, objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </div>
                <div>
                  <div style={{ fontWeight: '800', color: NAVY, fontSize: '10px' }}>Pioneers International</div>
                  <div style={{ color: MUTED, fontSize: '7.5px' }}>ISO Audit & Certification Experts</div>
                  <div style={{ color: MUTED, fontSize: '7.5px' }}>info@pioneersint.com | www.pioneersint.com</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'monospace', color: ACCENT, fontWeight: '800', fontSize: '10px', marginBottom: '2px' }}>
                  {audit.audit_number}
                </div>
                <div style={{ color: MUTED, fontSize: '7px' }}>
                  Generated: {formatDate(new Date().toISOString())}
                </div>
                <div style={{ color: MUTED, fontSize: '7px' }}>
                  Confidential — For Authorized Use Only
                </div>
              </div>
            </div>
          </RPSection>

        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media print {
          .no-print { display: none !important; }
          .report-bg { background: white !important; padding: 0 !important; }
          body { margin: 0 !important; }
          @page { margin: 0; size: A4; }
        }
      `}</style>
    </>
  )
}
