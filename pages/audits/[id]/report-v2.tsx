import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { ISO_STANDARDS } from '../../../lib/constants'
import { formatDate } from '../../../lib/utils'
import {
  ComplianceCard,
  FindingCard,
  StatisticBox,
  RecommendationCard,
  SectionDivider,
  GlassCard,
  Badge,
} from '../../../components/report/ReportComponents'
import {
  generateExecutiveSummary,
  generateRecommendations,
  generateComplianceInsights,
} from '../../../lib/claude-client'

// Color palette
const NAVY = '#0B3C5D'
const GOLD = '#C9A227'
const GOLDL = '#E4D48E'
const WHITE = '#FFFFFF'
const BG = '#F5F7FA'
const BORDER = '#E0E5EB'
const TEXT = '#1A1A2E'
const MUTED = '#6B7280'
const SUCCESS = '#10B981'
const DANGER = '#EF4444'
const WARNING = '#F59E0B'

interface FullAudit {
  id: string
  audit_number: string
  standard: string
  status: string
  result?: string
  risk_level?: string
  compliance_score?: number
  audit_date: string
  location?: string
  audit_scope?: string
  audit_type?: string
  executive_summary?: string
  recommendations?: string
  overall_notes?: string
  compliant_count: number
  non_compliant_count: number
  observation_count: number
  not_applicable_count: number
  company_name: string
  client_name: string
  industry: string
  country: string
  city?: string
  auditor_name: string
  auditor_title?: string
  site_photo_url?: string
  site_photo_caption?: string
  auditor_signature_url?: string
}

interface Answer {
  id: string
  status?: string
  notes?: string
  is_flagged: boolean
  template: {
    clause_number: string
    clause_title: string
    section: string
    question: string
    is_critical: boolean
    sort_order: number
  }
}

interface Note {
  id: string
  content: string
  is_critical: boolean
  created_at: string
}

export default function BeautifulReportPage() {
  const router = useRouter()
  const { id } = router.query
  const reportRef = useRef<HTMLDivElement>(null)

  const [audit, setAudit] = useState<FullAudit | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [aiSummary, setAiSummary] = useState('')
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([])
  const [aiInsights, setAiInsights] = useState({ strengths: [], improvements: [] })
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (id) fetchAll()
  }, [id])

  const fetchAll = async () => {
    try {
      const [auditRes, answersRes, notesRes] = await Promise.all([
        supabase.from('audit_list_view').select('*').eq('id', id).single(),
        supabase
          .from('audit_answers')
          .select('*, template:iso_templates(*)')
          .eq('audit_id', id)
          .order('template(sort_order)'),
        supabase
          .from('audit_notes')
          .select('*')
          .eq('audit_id', id)
          .eq('is_internal', false)
          .order('created_at'),
      ])

      if (auditRes.data) {
        setAudit(auditRes.data as FullAudit)
        setAnswers((answersRes.data as any) || [])
        setNotes(notesRes.data || [])

        // Generate AI content
        try {
          const reportData = {
            audit_number: auditRes.data.audit_number,
            company_name: auditRes.data.company_name,
            standard: auditRes.data.standard,
            compliance_score: auditRes.data.compliance_score || 0,
            audit_date: auditRes.data.audit_date,
            compliant_count: auditRes.data.compliant_count,
            non_compliant_count: auditRes.data.non_compliant_count,
            observation_count: auditRes.data.observation_count,
            answers: answersRes.data || [],
          }

          const [summary, recommendations, insights] = await Promise.all([
            generateExecutiveSummary(reportData),
            generateRecommendations(reportData, answersRes.data?.filter((a: any) => a.status === 'non_compliant') || []),
            generateComplianceInsights(reportData),
          ])

          setAiSummary(summary)
          setAiRecommendations(recommendations)
          setAiInsights(insights)
        } catch (aiError) {
          console.error('AI generation error:', aiError)
        }
      }

      setLoading(false)
    } catch (error) {
      console.error('Fetch error:', error)
      setLoading(false)
    }
  }

  const handlePDF = async () => {
    if (!reportRef.current) return
    setGenerating(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const jsPDF = (await import('jspdf')).default
      const canvas = await html2canvas(reportRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#fff',
        logging: false,
        allowTaint: true,
        imageTimeout: 15000,
      })
      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pw = pdf.internal.pageSize.getWidth()
      const ph = pdf.internal.pageSize.getHeight()
      const ih = (canvas.height * pw) / canvas.width
      let pos = 0,
        rem = ih
      pdf.addImage(imgData, 'JPEG', 0, pos, pw, ih)
      rem -= ph
      while (rem > 0) {
        pos -= ph
        pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, pos, pw, ih)
        rem -= ph
      }
      pdf.save(`${audit?.audit_number}-Beautiful-Report.pdf`)
    } catch {
      alert('PDF generation failed. Use Print (Ctrl+P) instead.')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${NAVY}, ${NAVY}cc)`,
          fontFamily: 'Inter, Arial, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 60,
              height: 60,
              border: `4px solid ${GOLDL}`,
              borderTopColor: GOLD,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 2rem',
            }}
          />
          <p style={{ color: WHITE, fontSize: '18px', fontWeight: '500' }}>
            Generating stunning report...
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!audit) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, Arial, sans-serif',
          background: BG,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '3rem' }}>📄</p>
          <p style={{ color: MUTED }}>Report not found</p>
          <Link
            href="/audits"
            style={{
              background: NAVY,
              color: '#fff',
              padding: '0.625rem 1.25rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              marginTop: '1rem',
              display: 'inline-block',
            }}
          >
            ← Back
          </Link>
        </div>
      </div>
    )
  }

  const score = audit.compliance_score ?? 0
  const ncItems = answers.filter(a => a.status === 'non_compliant')
  const obsItems = answers.filter(a => a.status === 'observation')
  const resultColor =
    audit.result === 'pass' ? SUCCESS : audit.result === 'fail' ? DANGER : WARNING
  const resultLabel =
    audit.result === 'pass'
      ? 'SUBSTANTIALLY COMPLIANT'
      : audit.result === 'fail'
        ? 'NON-COMPLIANT'
        : 'CONDITIONALLY COMPLIANT'

  const sections = answers.reduce(
    (acc, ans) => {
      const sec = ans.template?.section || 'General'
      if (!acc[sec]) acc[sec] = []
      acc[sec].push(ans)
      return acc
    },
    {} as Record<string, Answer[]>
  )

  return (
    <>
      <Head>
        <title>{audit.audit_number} — Beautiful Audit Report | Pioneers</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* ══ Control Bar ══ */}
      <div
        className="no-print"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 999,
          background: `linear-gradient(135deg, ${NAVY}, ${NAVY}dd)`,
          padding: '1rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: 'Inter, Arial, sans-serif',
          boxShadow: `0 8px 32px rgba(0,0,0,0.15)`,
          backdropFilter: 'blur(10px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link
            href={`/audits/${id}`}
            style={{
              color: 'rgba(255,255,255,0.7)',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: '500',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => ((e.target as HTMLAnchorElement).style.color = WHITE)}
            onMouseLeave={e => ((e.target as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.7)')}
          >
            ← Back
          </Link>
          <span style={{ color: GOLD, fontFamily: 'monospace', fontWeight: '700', fontSize: '0.9rem' }}>
            {audit.audit_number}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <button
            onClick={() => window.print()}
            style={{
              padding: '0.6rem 1.25rem',
              background: 'rgba(255,255,255,0.1)',
              color: WHITE,
              border: `1px solid rgba(255,255,255,0.3)`,
              borderRadius: '0.625rem',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontFamily: 'inherit',
              fontWeight: '600',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)'
            }}
            onMouseLeave={e => {
              (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)'
            }}
          >
            🖨️ Print
          </button>
          <button
            onClick={handlePDF}
            disabled={generating}
            style={{
              padding: '0.6rem 1.25rem',
              background: generating ? '#888' : `linear-gradient(135deg, ${GOLD}, ${GOLDL})`,
              color: NAVY,
              border: 'none',
              borderRadius: '0.625rem',
              cursor: generating ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem',
              fontFamily: 'inherit',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              if (!generating) {
                (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)'
                ;(e.target as HTMLButtonElement).style.boxShadow = `0 8px 20px ${GOLD}40`
              }
            }}
            onMouseLeave={e => {
              if (!generating) {
                (e.target as HTMLButtonElement).style.transform = 'translateY(0)'
                ;(e.target as HTMLButtonElement).style.boxShadow = 'none'
              }
            }}
          >
            {generating ? '⏳ Generating...' : '⬇️ Download PDF'}
          </button>
        </div>
      </div>

      {/* ══ Report Container ══ */}
      <div
        className="report-bg"
        style={{
          background: `linear-gradient(135deg, ${BG}, #e8eef5)`,
          minHeight: '100vh',
          paddingTop: '80px',
          paddingBottom: '3rem',
          fontFamily: 'Inter, Arial, sans-serif',
        }}
      >
        <div
          ref={reportRef}
          style={{
            width: '210mm',
            margin: '0 auto',
            background: WHITE,
            fontSize: '10px',
            lineHeight: '1.6',
            color: TEXT,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            overflow: 'hidden',
          }}
        >
          {/* ══════════════════════════════════
              PREMIUM COVER PAGE
          ══════════════════════════════════ */}
          <div
            style={{
              minHeight: '297mm',
              display: 'flex',
              flexDirection: 'column',
              background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY}dd 100%)`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Background Pattern */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '300px',
                height: '300px',
                background: `radial-gradient(circle, ${GOLD}15, transparent)`,
                borderRadius: '50%',
                filter: 'blur(60px)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '200px',
                height: '200px',
                background: `radial-gradient(circle, ${GOLD}10, transparent)`,
                borderRadius: '50%',
                filter: 'blur(60px)',
              }}
            />

            {/* Gold Top Bar */}
            <div
              style={{
                height: '8px',
                background: `linear-gradient(90deg, ${GOLD}, ${GOLDL}, ${GOLD})`,
                flexShrink: 0,
              }}
            />

            {/* Header */}
            <div style={{ padding: '32px 40px 0', position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <div
                  style={{
                    width: 70,
                    height: 70,
                    background: WHITE,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 12px 40px rgba(0,0,0,0.2)`,
                  }}
                >
                  <img
                    src="/logo.png"
                    alt="Pioneers"
                    style={{ width: 55, height: 55, objectFit: 'contain' }}
                    onError={e => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
                <div>
                  <div style={{ color: WHITE, fontWeight: '900', fontSize: '20px', letterSpacing: '0.1em' }}>
                    PIONEERS
                  </div>
                  <div
                    style={{
                      color: GOLD,
                      fontSize: '10px',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      opacity: 0.95,
                      fontWeight: '700',
                    }}
                  >
                    International Consulting
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, padding: '0 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
              {/* Big Score */}
              <div style={{ marginBottom: '32px' }}>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: GOLDL,
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                    marginBottom: '12px',
                  }}
                >
                  Compliance Score
                </div>
                <div
                  style={{
                    fontSize: '96px',
                    fontWeight: '900',
                    color: GOLD,
                    lineHeight: 1,
                    marginBottom: '12px',
                    textShadow: `0 4px 20px rgba(201,162,39,0.3)`,
                  }}
                >
                  {score}%
                </div>
                <div
                  style={{
                    height: '4px',
                    background: `linear-gradient(90deg, ${GOLD}, ${GOLDL})`,
                    width: '200px',
                    borderRadius: '2px',
                    marginBottom: '16px',
                  }}
                />
              </div>

              {/* Report Title */}
              <div style={{ marginBottom: '28px' }}>
                <div
                  style={{
                    color: GOLD,
                    fontSize: '10px',
                    letterSpacing: '0.25em',
                    textTransform: 'uppercase',
                    marginBottom: '12px',
                    fontWeight: '800',
                  }}
                >
                  Professional Audit Report
                </div>
                <div style={{ color: WHITE, fontSize: '36px', fontWeight: '300', lineHeight: 1.2, marginBottom: '8px' }}>
                  {ISO_STANDARDS[audit.standard as keyof typeof ISO_STANDARDS]?.label}
                </div>
                <div style={{ color: `${GOLD}cc`, fontSize: '14px', fontWeight: '400', marginBottom: '20px' }}>
                  {ISO_STANDARDS[audit.standard as keyof typeof ISO_STANDARDS]?.description}
                </div>
              </div>

              {/* Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 32px', marginBottom: '28px' }}>
                {[
                  { label: 'Organization', value: audit.company_name },
                  { label: 'Contact Person', value: audit.client_name },
                  { label: 'Location', value: `${audit.city || audit.country}` },
                  { label: 'Industry', value: audit.industry },
                  { label: 'Audit Date', value: formatDate(audit.audit_date) },
                  { label: 'Lead Auditor', value: audit.auditor_name },
                ].map(item => (
                  <div key={item.label}>
                    <div
                      style={{
                        color: GOLD,
                        fontSize: '9px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        marginBottom: '4px',
                        fontWeight: '700',
                        opacity: 0.9,
                      }}
                    >
                      {item.label}
                    </div>
                    <div style={{ color: WHITE, fontSize: '11px', fontWeight: '600', opacity: 0.95 }}>
                      {item.value || '—'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Result Badge */}
              <div
                style={{
                  textAlign: 'center',
                  padding: '18px 20px',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  border: `2px solid ${resultColor}`,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div
                  style={{
                    fontSize: '9px',
                    color: 'rgba(255,255,255,0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '8px',
                    fontWeight: '700',
                  }}
                >
                  Overall Compliance Status
                </div>
                <div
                  style={{
                    color: resultColor,
                    fontSize: '20px',
                    fontWeight: '900',
                    letterSpacing: '0.02em',
                    marginBottom: '6px',
                  }}
                >
                  {resultLabel}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ flexShrink: 0, position: 'relative', zIndex: 1 }}>
              <div style={{ height: '4px', background: `linear-gradient(90deg, ${GOLD}, ${GOLDL}, ${GOLD})` }} />
              <div
                style={{
                  padding: '12px 40px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(0,0,0,0.15)',
                }}
              >
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '8px', fontWeight: '600' }}>
                  Pioneers International | ISO {audit.standard} Audit
                </div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '8px', fontWeight: '600' }}>
                  Page 1 | Confidential
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════
              SECTION 1 — AI-POWERED EXECUTIVE SUMMARY
          ══════════════════════════════════ */}
          <div style={{ padding: '40px', borderTop: `1px solid ${BORDER}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <span style={{ fontSize: '28px' }}>📋</span>
              <div style={{ flex: 1 }}>
                <h2 style={{ color: NAVY, fontSize: '14px', fontWeight: '900', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Executive Summary
                </h2>
                <div
                  style={{
                    height: '2px',
                    background: `linear-gradient(90deg, ${GOLD}80, transparent)`,
                    marginTop: '8px',
                  }}
                />
              </div>
            </div>

            {/* Compliance Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'Compliant', n: audit.compliant_count, color: SUCCESS, icon: '✓' },
                { label: 'Non-Compliant', n: audit.non_compliant_count, color: DANGER, icon: '✕' },
                { label: 'Observations', n: audit.observation_count, color: WARNING, icon: '!' },
                { label: 'N/A', n: audit.not_applicable_count, color: MUTED, icon: '—' },
              ].map(item => (
                <ComplianceCard
                  key={item.label}
                  score={item.n}
                  label={item.label}
                  icon={item.icon}
                  color={item.color}
                />
              ))}
            </div>

            {/* AI Summary */}
            <GlassCard>
              <div style={{ fontSize: '11px', fontWeight: '700', color: GOLD, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                🤖 AI-Powered Analysis
              </div>
              <div style={{ fontSize: '10px', color: TEXT, lineHeight: '1.8' }}>
                {aiSummary || 'Generating AI analysis...'}
              </div>
            </GlassCard>

            <SectionDivider />

            {/* Strengths & Improvements */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: SUCCESS, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                  💪 Key Strengths
                </div>
                {aiInsights.strengths?.length > 0 ? (
                  aiInsights.strengths.map((strength, i) => (
                    <div key={i} style={{ fontSize: '9px', color: TEXT, marginBottom: '8px', paddingLeft: '16px', borderLeft: `2px solid ${SUCCESS}` }}>
                      {strength}
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '9px', color: MUTED }}>Loading...</div>
                )}
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: WARNING, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                  📈 Areas for Improvement
                </div>
                {aiInsights.improvements?.length > 0 ? (
                  aiInsights.improvements.map((improvement, i) => (
                    <div key={i} style={{ fontSize: '9px', color: TEXT, marginBottom: '8px', paddingLeft: '16px', borderLeft: `2px solid ${WARNING}` }}>
                      {improvement}
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '9px', color: MUTED }}>Loading...</div>
                )}
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════
              SECTION 2 — FINDINGS & NON-CONFORMITIES
          ══════════════════════════════════ */}
          {ncItems.length > 0 && (
            <div style={{ padding: '40px', borderTop: `1px solid ${BORDER}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <span style={{ fontSize: '28px' }}>⚠️</span>
                <div style={{ flex: 1 }}>
                  <h2 style={{ color: NAVY, fontSize: '14px', fontWeight: '900', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Non-Conformities ({ncItems.length})
                  </h2>
                  <div
                    style={{
                      height: '2px',
                      background: `linear-gradient(90deg, ${GOLD}80, transparent)`,
                      marginTop: '8px',
                    }}
                  />
                </div>
              </div>

              {ncItems.map((ans, i) => (
                <FindingCard
                  key={ans.id}
                  number={i + 1}
                  clause={ans.template?.clause_number}
                  title={ans.template?.clause_title}
                  question={ans.template?.question}
                  severity="high"
                  notes={ans.notes}
                />
              ))}
            </div>
          )}

          {/* ══════════════════════════════════
              SECTION 3 — AI RECOMMENDATIONS
          ══════════════════════════════════ */}
          <div style={{ padding: '40px', borderTop: `1px solid ${BORDER}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <span style={{ fontSize: '28px' }}>💡</span>
              <div style={{ flex: 1 }}>
                <h2 style={{ color: NAVY, fontSize: '14px', fontWeight: '900', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  AI-Generated Recommendations
                </h2>
                <div
                  style={{
                    height: '2px',
                    background: `linear-gradient(90deg, ${GOLD}80, transparent)`,
                    marginTop: '8px',
                  }}
                />
              </div>
            </div>

            {aiRecommendations?.length > 0 ? (
              aiRecommendations.map((rec, i) => (
                <RecommendationCard
                  key={i}
                  icon={i === 0 ? '🔴' : i === 1 ? '🟡' : '🟢'}
                  title={rec}
                  description={`Priority level ${i + 1} recommendation based on audit findings.`}
                  priority={i === 0 ? 'high' : i === 1 ? 'medium' : 'low'}
                />
              ))
            ) : (
              <div style={{ fontSize: '10px', color: MUTED }}>Generating recommendations...</div>
            )}
          </div>

          {/* ══════════════════════════════════
              SIGNATURE PAGE
          ══════════════════════════════════ */}
          <div style={{ padding: '40px', borderTop: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <span style={{ fontSize: '28px' }}>✍️</span>
              <div style={{ flex: 1 }}>
                <h2 style={{ color: NAVY, fontSize: '14px', fontWeight: '900', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Professional Certification
                </h2>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '32px' }}>
              <div>
                <div style={{ fontSize: '9px', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: '700', marginBottom: '12px' }}>
                  Lead Auditor
                </div>
                <div
                  style={{
                    height: '60px',
                    borderBottom: `2px solid ${NAVY}`,
                    marginBottom: '12px',
                  }}
                />
                <div style={{ fontWeight: '800', color: NAVY, fontSize: '11px', marginBottom: '4px' }}>
                  {audit.auditor_name}
                </div>
                <div style={{ color: MUTED, fontSize: '9px', marginBottom: '4px' }}>
                  {audit.auditor_title || 'Lead Auditor'}
                </div>
                <div style={{ color: MUTED, fontSize: '8px' }}>
                  Pioneers International
                </div>
              </div>
              <div>
                <div style={{ fontSize: '9px', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: '700', marginBottom: '12px' }}>
                  Client Representative
                </div>
                <div
                  style={{
                    height: '60px',
                    borderBottom: `2px solid ${NAVY}`,
                    marginBottom: '12px',
                  }}
                />
                <div style={{ fontWeight: '800', color: NAVY, fontSize: '11px', marginBottom: '4px' }}>
                  {audit.client_name}
                </div>
                <div style={{ color: MUTED, fontSize: '9px' }}>
                  {audit.company_name}
                </div>
              </div>
            </div>

            {/* Certificate Footer */}
            <div
              style={{
                marginTop: '40px',
                padding: '20px',
                background: `linear-gradient(135deg, ${NAVY}08, ${GOLD}08)`,
                border: `1px solid ${GOLD}30`,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: 45,
                  height: 45,
                  background: NAVY,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src="/logo.png"
                  alt="Pioneers"
                  style={{ width: 35, height: 35, objectFit: 'contain' }}
                  onError={e => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
              <div>
                <div style={{ fontWeight: '800', color: NAVY, fontSize: '11px' }}>
                  Pioneers International
                </div>
                <div style={{ color: MUTED, fontSize: '8px' }}>
                  ISO Audit & Certification Experts
                </div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontFamily: 'monospace', color: GOLD, fontWeight: '800', fontSize: '11px', marginBottom: '2px' }}>
                  {audit.audit_number}
                </div>
                <div style={{ color: MUTED, fontSize: '7px' }}>
                  {formatDate(new Date().toISOString())}
                </div>
              </div>
            </div>
          </div>
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
