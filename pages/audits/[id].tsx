import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/layout/Layout'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'
import { supabase } from '../../lib/supabase'
import { useProfile } from '../../lib/hooks/useProfile'
import { AuditAnswer, IsoTemplate, AuditNote, AuditFile } from '../../lib/types'
import { ISO_STANDARDS } from '../../lib/constants'
import { formatDate, formatDateTime, formatFileSize, getAutoResult, getAutoRisk } from '../../lib/utils'
import { theme, gradient, shadow } from '../../lib/theme'
import Link from 'next/link'

type AnswerStatus = 'compliant' | 'non_compliant' | 'observation' | 'not_applicable'

interface CorrectiveAction {
  id: string; audit_id: string; ref_number: string
  finding: string; corrective_action: string; responsibility: string
  status: 'OPEN' | 'CLOSED' | 'IN_PROGRESS'; due_date?: string; created_at: string
}

interface GroupedSection {
  section: string
  items: (AuditAnswer & { template: IsoTemplate })[]
}

const ANSWER_CONFIG = {
  compliant:      { label: 'Compliant',     emoji: '✅', bg: '#f0fdf4', border: '#86efac', color: '#15803d' },
  non_compliant:  { label: 'Non-Compliant', emoji: '❌', bg: '#fff1f2', border: '#fda4af', color: '#be123c' },
  observation:    { label: 'Observation',   emoji: '👁️', bg: '#fefce8', border: '#fde047', color: '#a16207' },
  not_applicable: { label: 'N/A',           emoji: '➖', bg: '#f9fafb', border: '#e5e7eb', color: '#6b7280' },
}

export default function AuditSessionPage() {
  const router      = useRouter()
  const { id }      = router.query
  const { profile } = useProfile()

  const [audit,      setAudit]      = useState<any>(null)
  const [answers,    setAnswers]    = useState<(AuditAnswer & { template: IsoTemplate })[]>([])
  const [notes,      setNotes]      = useState<AuditNote[]>([])
  const [files,      setFiles]      = useState<AuditFile[]>([])
  const [cas,        setCas]        = useState<CorrectiveAction[]>([])
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState<string | null>(null)
  const [completing, setCompleting] = useState(false)

  const [activeTab, setActiveTab] = useState<'checklist'|'notes'|'files'|'photos'|'actions'|'summary'>('checklist')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const [newNote,            setNewNote]            = useState('')
  const [isCritical,         setIsCritical]         = useState(false)
  const [uploadingFile,      setUploadingFile]      = useState(false)
  const [uploadingSitePhoto, setUploadingSitePhoto] = useState(false)
  const [siteCaption,        setSiteCaption]        = useState('')
  const [showCAForm,         setShowCAForm]         = useState(false)
  const [caForm, setCaForm] = useState({
    ref_number: '', finding: '', corrective_action: '',
    responsibility: '', status: 'OPEN' as 'OPEN'|'CLOSED'|'IN_PROGRESS', due_date: '',
  })

  useEffect(() => { if (id) fetchAll() }, [id])

  const fetchAll = async () => {
    const [auditRes, answersRes, notesRes, filesRes, casRes] = await Promise.all([
      supabase.from('audit_list_view').select('*').eq('id', id).single(),
      supabase.from('audit_answers')
        .select('*, template:iso_templates(*)')
        .eq('audit_id', id).order('template(sort_order)'),
      supabase.from('audit_notes').select('*').eq('audit_id', id).order('created_at'),
      supabase.from('audit_files').select('*').eq('audit_id', id).order('created_at'),
      supabase.from('audit_corrective_actions').select('*').eq('audit_id', id).order('created_at'),
    ])
    setAudit(auditRes.data)
    setAnswers((answersRes.data as any) || [])
    setNotes(notesRes.data || [])
    setFiles(filesRes.data || [])
    setCas(casRes.data || [])
    setSiteCaption(auditRes.data?.site_photo_caption || '')
    setLoading(false)
    const sections = new Set<string>(
      ((answersRes.data as any) || []).map((a: any) => a.template?.section || 'General')
    )
    setExpandedSections(sections)
  }

  const grouped: GroupedSection[] = answers.reduce((acc, ans) => {
    const section = ans.template?.section || 'General'
    const existing = acc.find(g => g.section === section)
    if (existing) existing.items.push(ans)
    else acc.push({ section, items: [ans] })
    return acc
  }, [] as GroupedSection[])

  const handleAnswer = useCallback(async (
    answerId: string, status: AnswerStatus, noteText?: string
  ) => {
    setSaving(answerId)
    await supabase.from('audit_answers').update({
      status, notes: noteText ?? undefined,
      answered_at: new Date().toISOString(),
    }).eq('id', answerId)
    setAnswers(prev => prev.map(a =>
      a.id === answerId ? { ...a, status, notes: noteText ?? a.notes } : a
    ))
    setSaving(null)
    updateScore()
  }, [])

  const handleNoteBlur = useCallback(async (answerId: string, noteText: string) => {
    await supabase.from('audit_answers').update({ notes: noteText }).eq('id', answerId)
    setAnswers(prev => prev.map(a => a.id === answerId ? { ...a, notes: noteText } : a))
  }, [])

  const handleFlagToggle = useCallback(async (answerId: string, current: boolean) => {
    await supabase.from('audit_answers').update({ is_flagged: !current }).eq('id', answerId)
    setAnswers(prev => prev.map(a => a.id === answerId ? { ...a, is_flagged: !current } : a))
  }, [])

  const updateScore = async () => {
    const { data } = await supabase.from('audit_answers').select('status').eq('audit_id', id)
    if (!data) return
    const total     = data.filter(a => a.status && a.status !== 'not_applicable').length
    const compliant = data.filter(a => a.status === 'compliant').length
    const nonComp   = data.filter(a => a.status === 'non_compliant').length
    const obs       = data.filter(a => a.status === 'observation').length
    const na        = data.filter(a => a.status === 'not_applicable').length
    const score     = total > 0 ? Math.round((compliant / total) * 10000) / 100 : 0
    await supabase.from('audits').update({
      compliant_count: compliant, non_compliant_count: nonComp,
      observation_count: obs, not_applicable_count: na, compliance_score: score,
    }).eq('id', id)
    setAudit((prev: any) => prev ? {
      ...prev, compliance_score: score,
      compliant_count: compliant, non_compliant_count: nonComp,
      observation_count: obs, not_applicable_count: na,
    } : prev)
  }

  const addNote = async () => {
    if (!newNote.trim()) return
    const { data } = await supabase.from('audit_notes').insert({
      audit_id: id, content: newNote,
      is_critical: isCritical, created_by: profile?.id,
    }).select().single()
    if (data) setNotes(prev => [...prev, data])
    setNewNote(''); setIsCritical(false)
  }

  const deleteNote = async (noteId: string) => {
    await supabase.from('audit_notes').delete().eq('id', noteId)
    setNotes(prev => prev.filter(n => n.id !== noteId))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      alert('File size must be less than 50MB')
      return
    }

    setUploadingFile(true)
    try {
      const path = `${id}/${Date.now()}_${file.name}`

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audit-evidence')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        alert(`Upload failed: ${uploadError.message}`)
        return
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('audit-evidence')
        .getPublicUrl(path)

      // Insert file record
      const { data: fileRecord, error: insertError } = await supabase
        .from('audit_files')
        .insert({
          audit_id: id,
          file_name: file.name,
          file_path: path,
          file_url: urlData.publicUrl,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: profile?.id,
        })
        .select()
        .single()

      if (insertError) {
        console.error('Insert error:', insertError)
        alert(`Error saving file info: ${insertError.message}`)
        return
      }

      if (fileRecord) setFiles(prev => [...prev, fileRecord])
      alert('✓ File uploaded successfully!')
    } catch (error) {
      console.error('Error:', error)
      alert(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploadingFile(false)
      e.target.value = ''
    }
  }

  const handleSitePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('File size must be less than 5MB')
      return
    }

    setUploadingSitePhoto(true)
    try {
      const path = `${id}/site-cover/${Date.now()}_${file.name}`

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audit-evidence')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        alert(`Upload failed: ${uploadError.message}`)
        return
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('audit-evidence')
        .getPublicUrl(path)

      // Update audit record
      const { error: updateError } = await supabase
        .from('audits')
        .update({
          site_photo_url: urlData.publicUrl,
          site_photo_caption: siteCaption,
        })
        .eq('id', id)

      if (updateError) {
        console.error('Update error:', updateError)
        alert(`Update failed: ${updateError.message}`)
        return
      }

      setAudit((prev: any) => ({ ...prev, site_photo_url: urlData.publicUrl }))
      alert('✓ Site photo uploaded successfully!')
    } catch (error) {
      console.error('Error:', error)
      alert(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploadingSitePhoto(false)
      e.target.value = ''
    }
  }

  const saveSiteCaption = async () => {
    await supabase.from('audits').update({ site_photo_caption: siteCaption }).eq('id', id)
    setAudit((prev: any) => ({ ...prev, site_photo_caption: siteCaption }))
  }

  const deleteFile = async (fileId: string, filePath: string) => {
    await supabase.storage.from('audit-evidence').remove([filePath])
    await supabase.from('audit_files').delete().eq('id', fileId)
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const addCA = async () => {
    if (!caForm.finding || !caForm.corrective_action) return
    const { data } = await supabase.from('audit_corrective_actions').insert({
      audit_id: id, ...caForm,
      due_date: caForm.due_date || null,
    }).select().single()
    if (data) setCas(prev => [...prev, data])
    setCaForm({
      ref_number: '', finding: '', corrective_action: '',
      responsibility: '', status: 'OPEN', due_date: '',
    })
    setShowCAForm(false)
  }

  const deleteCA = async (caId: string) => {
    await supabase.from('audit_corrective_actions').delete().eq('id', caId)
    setCas(prev => prev.filter(c => c.id !== caId))
  }

  const updateCAStatus = async (caId: string, status: string) => {
    await supabase.from('audit_corrective_actions').update({ status }).eq('id', caId)
    setCas(prev => prev.map(c => c.id === caId ? { ...c, status: status as any } : c))
  }

  const completeAudit = async () => {
    setCompleting(true)
    const score = audit?.compliance_score || 0
    await supabase.from('audits').update({
      status:     'completed',
      result:     getAutoResult(score),
      risk_level: getAutoRisk(score),
    }).eq('id', id)
    setAudit((prev: any) => prev ? {
      ...prev, status: 'completed',
      result: getAutoResult(score), risk_level: getAutoRisk(score),
    } : prev)
    setCompleting(false)
    setActiveTab('summary')
  }

  const answered = answers.filter(a => a.status).length
  const progress = answers.length > 0 ? Math.round((answered / answers.length) * 100) : 0

  // ── Styles ──
  const card: React.CSSProperties = {
    background: 'white', borderRadius: '1rem',
    border: `1px solid ${theme.border}`,
    boxShadow: shadow.md, padding: '1.5rem',
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.5rem 1rem', borderRadius: '0.625rem', border: 'none',
    cursor: 'pointer', fontFamily: 'inherit',
    fontWeight: active ? '700' : '500', fontSize: '0.8rem',
    transition: 'all 0.2s',
    background: active ? 'white' : 'transparent',
    color:      active ? theme.navy : theme.muted,
    boxShadow:  active ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
  })

  const inp: React.CSSProperties = {
    width: '100%', padding: '0.625rem 0.875rem',
    border: `1px solid ${theme.border}`, borderRadius: '0.625rem',
    fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit',
    background: 'white', boxSizing: 'border-box',
  }

  if (loading) return (
    <Layout title="Audit Session">
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
        <div style={{ width: 40, height: 40, border: `3px solid rgba(201,162,39,0.2)`, borderTopColor: theme.goldDark, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </Layout>
  )

  if (!audit) return (
    <Layout title="Not Found">
      <div style={{ textAlign: 'center', padding: '5rem' }}>
        <p style={{ color: theme.muted }}>Audit not found</p>
        <Link href="/audits" style={{ background: gradient.navy, color: 'white', padding: '0.625rem 1.25rem', borderRadius: '0.625rem', textDecoration: 'none', fontWeight: '600', display: 'inline-block', marginTop: '1rem' }}>
          ← Back
        </Link>
      </div>
    </Layout>
  )

  return (
    <Layout title={`Audit ${audit.audit_number}`}>
      <PageHeader
        title={audit.audit_number}
        subtitle={`${audit.company_name} — ${ISO_STANDARDS[audit.standard as keyof typeof ISO_STANDARDS]?.label}`}
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Audits',    href: '/audits'    },
          { label: audit.audit_number },
        ]}
        action={
          <div style={{ display: 'flex', gap: '0.625rem' }}>
            {audit.status !== 'completed' && (
              <button
                onClick={completeAudit}
                disabled={completing}
                style={{
                  padding: '0.625rem 1.25rem',
                  background: 'linear-gradient(135deg,#16a34a,#15803d)',
                  color: 'white', border: 'none', borderRadius: '0.625rem',
                  cursor: completing ? 'not-allowed' : 'pointer',
                  fontWeight: '700', fontSize: '0.875rem', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  opacity: completing ? 0.7 : 1,
                }}
              >
                {completing ? (
                  <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Completing...</>
                ) : '✓ Complete Audit'}
              </button>
            )}
            <Link href={`/audits/${id}/report`} style={{
              padding: '0.625rem 1.25rem',
              border: `1px solid ${theme.border}`,
              background: 'white', color: theme.navy, borderRadius: '0.625rem',
              textDecoration: 'none', fontWeight: '700', fontSize: '0.875rem',
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            }}>📄 View Report</Link>
          </div>
        }
      />

      {/* ── Info Bar ── */}
      <div style={{ ...card, marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2rem' }}>
          {[
            { label: 'Client',   value: audit.company_name },
            { label: 'Standard', value: ISO_STANDARDS[audit.standard as keyof typeof ISO_STANDARDS]?.label },
            { label: 'Date',     value: formatDate(audit.audit_date) },
            { label: 'Auditor',  value: audit.auditor_name },
          ].map(item => (
            <div key={item.label}>
              <p style={{ fontSize: '0.65rem', color: theme.muted, margin: '0 0 0.2rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700' }}>
                {item.label}
              </p>
              <p style={{ fontSize: '0.875rem', fontWeight: '600', color: theme.navy, margin: 0 }}>
                {item.value}
              </p>
            </div>
          ))}
          <div>
            <p style={{ fontSize: '0.65rem', color: theme.muted, margin: '0 0 0.2rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700' }}>Status</p>
            <Badge value={audit.status} type="status" />
          </div>
          {audit.compliance_score != null && (
            <div>
              <p style={{ fontSize: '0.65rem', color: theme.muted, margin: '0 0 0.2rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700' }}>Score</p>
              <p style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: audit.compliance_score >= 85 ? theme.success : audit.compliance_score >= 70 ? theme.warning : theme.danger }}>
                {audit.compliance_score}%
              </p>
            </div>
          )}
          <div style={{ flex: 1, minWidth: '180px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
              <p style={{ fontSize: '0.65rem', color: theme.muted, margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700' }}>Progress</p>
              <p style={{ fontSize: '0.72rem', color: theme.muted, margin: 0, fontWeight: '600' }}>{answered}/{answers.length}</p>
            </div>
            <div style={{ height: '8px', background: theme.border, borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '9999px', background: gradient.gold, width: `${progress}%`, transition: 'width 0.5s' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'inline-flex', gap: '0.25rem', padding: '0.375rem', background: '#f0f0f0', borderRadius: '0.875rem', marginBottom: '1.5rem', flexWrap: 'wrap' as const }}>
        {([
          { key: 'checklist', label: `📋 Checklist (${answers.length})` },
          { key: 'photos',    label: '📸 Site Photos'                   },
          { key: 'notes',     label: `📝 Notes (${notes.length})`       },
          { key: 'files',     label: `📎 Evidence (${files.length})`    },
          { key: 'actions',   label: `⚡ Actions (${cas.length})`       },
          { key: 'summary',   label: '📊 Summary'                       },
        ] as { key: typeof activeTab; label: string }[]).map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={tabStyle(activeTab === t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════
          TAB: CHECKLIST
      ══════════════════════════════════ */}
      {activeTab === 'checklist' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {grouped.length === 0 && (
            <div style={{ ...card, textAlign: 'center', padding: '4rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
              <p style={{ color: theme.muted, fontWeight: '500' }}>No questions loaded.</p>
              <p style={{ color: theme.muted, fontSize: '0.875rem' }}>Run the ISO seed SQL in Supabase first.</p>
            </div>
          )}
          {grouped.map(group => {
            const isExpanded = expandedSections.has(group.section)
            const gAnswered  = group.items.filter(i => i.status).length
            const gCompliant = group.items.filter(i => i.status === 'compliant').length
            const gTotal     = group.items.filter(i => i.status && i.status !== 'not_applicable').length
            const gScore     = gTotal > 0 ? Math.round((gCompliant / gTotal) * 100) : 0
            const gNonComp   = group.items.filter(i => i.status === 'non_compliant').length

            return (
              <div key={group.section} style={{ ...card, padding: 0, overflow: 'hidden' }}>
                <button
                  onClick={() => setExpandedSections(prev => {
                    const next = new Set(prev)
                    if (next.has(group.section)) next.delete(group.section)
                    else next.add(group.section)
                    return next
                  })}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', padding: '1rem 1.25rem',
                    background: 'none', border: 'none', cursor: 'pointer',
                    borderBottom: isExpanded ? `1px solid ${theme.border}` : 'none',
                    fontFamily: 'inherit',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{ width: 4, height: 28, background: gradient.navy, borderRadius: 2, flexShrink: 0 }} />
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontWeight: '700', color: theme.navy, margin: 0, fontSize: '0.9rem' }}>
                        {group.section}
                      </p>
                      <p style={{ color: theme.muted, fontSize: '0.72rem', margin: 0 }}>
                        {gAnswered}/{group.items.length} answered
                        {gScore > 0 && (
                          <span style={{ marginLeft: '0.5rem', color: gScore >= 85 ? theme.success : gScore >= 70 ? theme.warning : theme.danger, fontWeight: '700' }}>
                            · {gScore}%
                          </span>
                        )}
                        {gNonComp > 0 && (
                          <span style={{ color: theme.danger, marginLeft: '0.5rem' }}>· {gNonComp} NC</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{ width: '70px', height: '6px', background: theme.border, borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '9999px', background: gradient.gold, width: `${group.items.length > 0 ? (gAnswered / group.items.length) * 100 : 0}%` }} />
                    </div>
                    <span style={{ color: theme.muted, fontSize: '0.875rem' }}>{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </button>

                {isExpanded && group.items.map((ans, idx) => (
                  <QuestionRow
                    key={ans.id}
                    answer={ans}
                    index={idx + 1}
                    saving={saving === ans.id}
                    onAnswer={handleAnswer}
                    onNoteBlur={handleNoteBlur}
                    onFlagToggle={handleFlagToggle}
                    disabled={audit.status === 'completed'}
                  />
                ))}
              </div>
            )
          })}
        </div>
      )}

      {/* ══════════════════════════════════
          TAB: SITE PHOTOS
      ══════════════════════════════════ */}
      {activeTab === 'photos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <div style={{ width: 4, height: 18, background: gradient.gold, borderRadius: 2 }} />
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: theme.navy, margin: 0 }}>Site Cover Photo</h3>
            </div>
            <p style={{ color: theme.muted, fontSize: '0.875rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              This photo appears on the <strong>cover page</strong> of the PDF report — just like professional audit reports.
            </p>

            {audit.site_photo_url && (
              <div style={{ marginBottom: '1.5rem', borderRadius: '0.875rem', overflow: 'hidden', border: `1px solid ${theme.border}`, position: 'relative' }}>
                <img src={audit.site_photo_url} alt="Site Cover" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent,rgba(0,0,0,0.7))', padding: '1rem 1.25rem' }}>
                  <p style={{ color: 'white', fontSize: '0.8rem', fontStyle: 'italic', margin: 0 }}>
                    {audit.site_photo_caption || 'Site photo'}
                  </p>
                </div>
              </div>
            )}

            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              border: `2px dashed ${theme.border}`, borderRadius: '0.875rem',
              padding: '2.5rem 2rem', cursor: 'pointer', marginBottom: '1rem',
              transition: 'all 0.2s', background: 'white',
            }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = theme.goldDark; el.style.background = '#fffbeb' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = theme.border; el.style.background = 'white' }}
            >
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleSitePhotoUpload} />
              {uploadingSitePhoto ? (
                <div style={{ width: 32, height: 32, border: `3px solid rgba(201,162,39,0.2)`, borderTopColor: theme.goldDark, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              ) : (
                <>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📸</div>
                  <p style={{ color: theme.navy, fontWeight: '600', margin: '0 0 0.25rem' }}>
                    {audit.site_photo_url ? 'Click to replace photo' : 'Upload site cover photo'}
                  </p>
                  <p style={{ color: theme.muted, fontSize: '0.8rem', margin: 0 }}>JPG, PNG — landscape recommended</p>
                </>
              )}
            </label>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: theme.text, marginBottom: '0.375rem' }}>
                Photo Caption
              </label>
              <div style={{ display: 'flex', gap: '0.625rem' }}>
                <input
                  style={inp}
                  placeholder="e.g. Project Site — Active Operations"
                  value={siteCaption}
                  onChange={e => setSiteCaption(e.target.value)}
                />
                <button onClick={saveSiteCaption} style={{
                  padding: '0.625rem 1.25rem', background: gradient.navy, color: 'white',
                  border: 'none', borderRadius: '0.625rem', cursor: 'pointer',
                  fontWeight: '700', fontFamily: 'inherit', whiteSpace: 'nowrap' as const,
                }}>Save</button>
              </div>
            </div>
          </div>

          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <div style={{ width: 4, height: 18, background: gradient.gold, borderRadius: 2 }} />
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: theme.navy, margin: 0 }}>Report Details</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: theme.text, marginBottom: '0.375rem' }}>Audit Scope</label>
                <input
                  style={inp}
                  placeholder="e.g. Full ISO 9001:2015 Compliance Audit"
                  defaultValue={audit.audit_scope || ''}
                  onFocus={e => e.target.style.borderColor = theme.goldDark}
                  onBlur={async e => {
                    e.target.style.borderColor = theme.border
                    await supabase.from('audits').update({ audit_scope: e.target.value }).eq('id', id)
                    setAudit((prev: any) => ({ ...prev, audit_scope: e.target.value }))
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: theme.text, marginBottom: '0.375rem' }}>Audit Type</label>
                <input
                  style={inp}
                  placeholder="e.g. Gap Analysis & Site Verification"
                  defaultValue={audit.audit_type || 'Gap Analysis & Compliance Audit'}
                  onFocus={e => e.target.style.borderColor = theme.goldDark}
                  onBlur={async e => {
                    e.target.style.borderColor = theme.border
                    await supabase.from('audits').update({ audit_type: e.target.value }).eq('id', id)
                    setAudit((prev: any) => ({ ...prev, audit_type: e.target.value }))
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════
          TAB: NOTES
      ══════════════════════════════════ */}
      {activeTab === 'notes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {audit.status !== 'completed' && (
            <div style={card}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: theme.navy, marginBottom: '1rem' }}>Add Note</h3>
              <textarea
                rows={3}
                placeholder="Write an audit note..."
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                style={{ ...inp, resize: 'none', marginBottom: '0.75rem', lineHeight: 1.6 }}
                onFocus={e => e.target.style.borderColor = theme.goldDark}
                onBlur={e => e.target.style.borderColor = theme.border}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: theme.muted }}>
                  <input type="checkbox" checked={isCritical} onChange={e => setIsCritical(e.target.checked)} />
                  Mark as Critical
                </label>
                <button onClick={addNote} style={{
                  padding: '0.5rem 1.25rem', background: gradient.navy, color: 'white',
                  border: 'none', borderRadius: '0.625rem', cursor: 'pointer',
                  fontWeight: '600', fontFamily: 'inherit',
                }}>+ Add Note</button>
              </div>
            </div>
          )}
          {notes.length === 0 ? (
            <div style={{ ...card, textAlign: 'center', padding: '3rem', color: theme.muted }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📝</div>
              <p>No notes yet</p>
            </div>
          ) : notes.map(note => (
            <div key={note.id} style={{
              ...card, padding: '1rem 1.25rem',
              borderLeft: `4px solid ${note.is_critical ? theme.danger : theme.goldDark}`,
              background: note.is_critical ? '#fff1f2' : 'white',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: theme.text, margin: 0, flex: 1, lineHeight: 1.6 }}>
                  {note.content}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  {note.is_critical && (
                    <span style={{ background: '#fee2e2', color: theme.danger, padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: '700' }}>
                      CRITICAL
                    </span>
                  )}
                  {audit.status !== 'completed' && (
                    <button onClick={() => deleteNote(note.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.muted, fontSize: '1rem', padding: '0.25rem' }}>
                      🗑️
                    </button>
                  )}
                </div>
              </div>
              <p style={{ fontSize: '0.72rem', color: theme.muted, margin: '0.5rem 0 0' }}>
                {formatDateTime(note.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════
          TAB: FILES (Evidence)
      ══════════════════════════════════ */}
      {activeTab === 'files' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {audit.status !== 'completed' && (
            <div style={card}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: theme.navy, marginBottom: '1rem' }}>Upload Evidence</h3>
              <label style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                border: `2px dashed ${theme.border}`, borderRadius: '0.875rem', padding: '2.5rem',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = theme.goldDark; el.style.background = '#fffbeb' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = theme.border; el.style.background = 'transparent' }}
              >
                <input type="file" style={{ display: 'none' }} onChange={handleFileUpload}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" />
                {uploadingFile ? (
                  <div style={{ width: 32, height: 32, border: `3px solid rgba(201,162,39,0.2)`, borderTopColor: theme.goldDark, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                ) : (
                  <>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📎</div>
                    <p style={{ color: theme.navy, fontWeight: '600', margin: '0 0 0.25rem' }}>Click to upload evidence</p>
                    <p style={{ color: theme.muted, fontSize: '0.8rem', margin: 0 }}>PDF, Images, Word, Excel</p>
                  </>
                )}
              </label>
            </div>
          )}
          {files.length === 0 ? (
            <div style={{ ...card, textAlign: 'center', padding: '3rem', color: theme.muted }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📂</div>
              <p>No files uploaded yet</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              {files.map(file => (
                <div key={file.id} style={{ ...card, padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <div style={{ width: 42, height: 42, borderRadius: '0.625rem', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>
                    {file.file_type?.includes('image') ? '🖼️' : file.file_type?.includes('pdf') ? '📕' : '📄'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: '600', color: theme.navy, margin: 0, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.file_name}
                    </p>
                    <p style={{ color: theme.muted, fontSize: '0.75rem', margin: 0 }}>
                      {file.file_size ? formatFileSize(file.file_size) : ''} · {formatDate(file.created_at)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                    <a href={file.file_url} target="_blank" rel="noopener noreferrer"
                      style={{ padding: '0.375rem', borderRadius: '0.375rem', color: theme.muted, textDecoration: 'none', fontSize: '1rem' }}>
                      ⬇️
                    </a>
                    {audit.status !== 'completed' && (
                      <button onClick={() => deleteFile(file.id, file.file_path)}
                        style={{ padding: '0.375rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════
          TAB: CORRECTIVE ACTIONS
      ══════════════════════════════════ */}
      {activeTab === 'actions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 4, height: 18, background: gradient.gold, borderRadius: 2 }} />
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: theme.navy, margin: 0 }}>Corrective Actions</h3>
              </div>
              {audit.status !== 'completed' && (
                <button onClick={() => setShowCAForm(!showCAForm)} style={{
                  padding: '0.5rem 1rem', background: gradient.navy, color: 'white',
                  border: 'none', borderRadius: '0.625rem', cursor: 'pointer',
                  fontWeight: '600', fontSize: '0.8rem', fontFamily: 'inherit',
                }}>+ Add Action</button>
              )}
            </div>

            {showCAForm && (
              <div style={{ background: '#f8f9fa', borderRadius: '0.875rem', padding: '1.25rem', marginBottom: '1.25rem', border: `1px solid ${theme.border}` }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '0.875rem' }}>
                  {[
                    { key: 'ref_number',        label: 'Ref Number',       placeholder: 'CA-01'               },
                    { key: 'responsibility',    label: 'Responsibility',   placeholder: 'Department / Person' },
                    { key: 'finding',           label: 'Finding',          placeholder: 'Describe the finding' },
                    { key: 'corrective_action', label: 'Corrective Action',placeholder: 'Required action'     },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: theme.text, marginBottom: '0.25rem' }}>{f.label}</label>
                      <input
                        style={inp}
                        placeholder={f.placeholder}
                        value={(caForm as any)[f.key]}
                        onChange={e => setCaForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                        onFocus={e => e.target.style.borderColor = theme.goldDark}
                        onBlur={e => e.target.style.borderColor = theme.border}
                      />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: theme.text, marginBottom: '0.25rem' }}>Status</label>
                    <select style={{ ...inp, cursor: 'pointer' }} value={caForm.status}
                      onChange={e => setCaForm(f => ({ ...f, status: e.target.value as any }))}>
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: theme.text, marginBottom: '0.25rem' }}>Due Date</label>
                    <input type="date" style={inp} value={caForm.due_date}
                      onChange={e => setCaForm(f => ({ ...f, due_date: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.625rem' }}>
                  <button onClick={addCA} style={{ padding: '0.625rem 1.25rem', background: gradient.gold, color: theme.navy, border: 'none', borderRadius: '0.625rem', cursor: 'pointer', fontWeight: '700', fontFamily: 'inherit' }}>
                    ✓ Save Action
                  </button>
                  <button onClick={() => setShowCAForm(false)} style={{ padding: '0.625rem 1rem', background: 'white', color: theme.muted, border: `1px solid ${theme.border}`, borderRadius: '0.625rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {cas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: theme.muted }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
                <p>No corrective actions yet</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', borderRadius: '0.75rem', border: `1px solid ${theme.border}` }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', minWidth: '700px' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa', borderBottom: `2px solid ${theme.border}` }}>
                      {['Ref', 'Finding', 'Corrective Action', 'Responsibility', 'Status', ''].map(h => (
                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.65rem', fontWeight: '700', color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cas.map(ca => (
                      <tr key={ca.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: '700', color: theme.goldDark, fontSize: '0.78rem' }}>
                            {ca.ref_number}
                          </span>
                        </td>
                        <td style={{ padding: '0.875rem 1rem', maxWidth: '200px' }}>
                          <p style={{ margin: 0, color: theme.text, fontSize: '0.8rem' }}>{ca.finding}</p>
                        </td>
                        <td style={{ padding: '0.875rem 1rem', maxWidth: '200px' }}>
                          <p style={{ margin: 0, color: theme.text, fontSize: '0.8rem' }}>{ca.corrective_action}</p>
                        </td>
                        <td style={{ padding: '0.875rem 1rem', color: theme.muted, fontSize: '0.8rem' }}>
                          {ca.responsibility}
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          {audit.status !== 'completed' ? (
                            <select
                              value={ca.status}
                              onChange={e => updateCAStatus(ca.id, e.target.value)}
                              style={{
                                padding: '0.25rem 0.5rem', borderRadius: '0.375rem',
                                border: `1px solid ${theme.border}`, fontSize: '0.75rem',
                                cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700',
                                background: ca.status === 'CLOSED' ? '#dcfce7' : ca.status === 'IN_PROGRESS' ? '#dbeafe' : '#fee2e2',
                                color: ca.status === 'CLOSED' ? theme.success : ca.status === 'IN_PROGRESS' ? theme.info : theme.danger,
                              }}
                            >
                              <option value="OPEN">OPEN</option>
                              <option value="IN_PROGRESS">IN PROGRESS</option>
                              <option value="CLOSED">CLOSED</option>
                            </select>
                          ) : (
                            <span style={{
                              padding: '0.2rem 0.625rem', borderRadius: '9999px',
                              fontSize: '0.7rem', fontWeight: '700',
                              background: ca.status === 'CLOSED' ? '#dcfce7' : ca.status === 'IN_PROGRESS' ? '#dbeafe' : '#fee2e2',
                              color: ca.status === 'CLOSED' ? theme.success : ca.status === 'IN_PROGRESS' ? theme.info : theme.danger,
                            }}>{ca.status}</span>
                          )}
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          {audit.status !== 'completed' && (
                            <button onClick={() => deleteCA(ca.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.muted, fontSize: '1rem' }}>🗑️</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════
          TAB: SUMMARY
      ══════════════════════════════════ */}
      {activeTab === 'summary' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div style={card}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: theme.navy, marginBottom: '1.25rem' }}>Score Breakdown</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Compliant',     count: audit.compliant_count      || 0, bg: '#f0fdf4', color: theme.success },
                { label: 'Non-Compliant', count: audit.non_compliant_count  || 0, bg: '#fff1f2', color: theme.danger  },
                { label: 'Observation',   count: audit.observation_count    || 0, bg: '#fffbeb', color: theme.warning },
                { label: 'N/A',           count: audit.not_applicable_count || 0, bg: '#f9fafb', color: theme.muted   },
              ].map(item => (
                <div key={item.label} style={{ background: item.bg, borderRadius: '0.75rem', padding: '1rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '2rem', fontWeight: '800', color: item.color, margin: '0 0 0.25rem' }}>{item.count}</p>
                  <p style={{ fontSize: '0.72rem', color: theme.muted, margin: 0 }}>{item.label}</p>
                </div>
              ))}
            </div>
            {audit.compliance_score != null && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: theme.muted }}>Compliance Score</span>
                  <span style={{ fontSize: '1rem', fontWeight: '800', color: audit.compliance_score >= 85 ? theme.success : audit.compliance_score >= 70 ? theme.warning : theme.danger }}>
                    {audit.compliance_score}%
                  </span>
                </div>
                <div style={{ height: '10px', background: theme.border, borderRadius: '9999px', overflow: 'hidden', marginBottom: '1rem' }}>
                  <div style={{ height: '100%', borderRadius: '9999px', width: `${audit.compliance_score}%`, background: audit.compliance_score >= 85 ? theme.success : audit.compliance_score >= 70 ? theme.warning : theme.danger }} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {audit.result     && <Badge value={audit.result}     type="result" />}
                  {audit.risk_level && <Badge value={audit.risk_level} type="risk"   />}
                </div>
              </>
            )}
          </div>

          <div style={card}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: theme.navy, marginBottom: '1rem' }}>Non-Conformities</h3>
            <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {answers.filter(a => a.status === 'non_compliant' || a.status === 'observation').length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: theme.muted }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                  <p style={{ margin: 0 }}>No non-conformities found!</p>
                </div>
              ) : answers.filter(a => a.status === 'non_compliant' || a.status === 'observation').map(ans => (
                <div key={ans.id} style={{ padding: '0.75rem', background: ans.status === 'non_compliant' ? '#fff1f2' : '#fffbeb', borderRadius: '0.625rem', border: `1px solid ${ans.status === 'non_compliant' ? '#fda4af' : '#fde047'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div>
                      <p style={{ fontSize: '0.78rem', fontWeight: '700', color: theme.text, margin: '0 0 0.2rem' }}>
                        {ans.template?.clause_number} — {ans.template?.clause_title}
                      </p>
                      {ans.notes && <p style={{ fontSize: '0.72rem', color: theme.muted, margin: 0 }}>{ans.notes}</p>}
                    </div>
                    <Badge value={ans.status!} type="answer" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </Layout>
  )
}

// ══════════════════════════════════
// Question Row Component
// ══════════════════════════════════
function QuestionRow({
  answer, index, saving, onAnswer, onNoteBlur, onFlagToggle, disabled,
}: {
  answer:       AuditAnswer & { template: IsoTemplate }
  index:        number
  saving:       boolean
  onAnswer:     (id: string, s: AnswerStatus, n?: string) => void
  onNoteBlur:   (id: string, n: string) => void
  onFlagToggle: (id: string, c: boolean) => void
  disabled:     boolean
}) {
  const [noteText, setNoteText] = useState(answer.notes || '')
  const [showNote, setShowNote] = useState(!!answer.notes)
  const cur = answer.status as AnswerStatus | undefined

  return (
    <div style={{
      padding: '1.25rem',
      borderBottom: `1px solid ${theme.border}`,
      background: cur === 'non_compliant' ? 'rgba(254,241,242,0.5)'
        : cur === 'compliant' ? 'rgba(240,253,244,0.3)' : 'white',
    }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        {/* Clause badge */}
        <div style={{ flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '0.5rem',
            background: 'linear-gradient(135deg,#fef3c7,#fde68a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.65rem', fontWeight: '800', color: '#92400e', fontFamily: 'monospace',
          }}>
            {answer.template?.clause_number?.split('.')[0] || index}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.625rem' }}>
            <div>
              <span style={{ fontFamily: 'monospace', color: theme.goldDark, fontWeight: '800', fontSize: '0.78rem' }}>
                {answer.template?.clause_number}
              </span>
              <span style={{ color: theme.muted, fontSize: '0.78rem', marginLeft: '0.5rem' }}>
                {answer.template?.clause_title}
              </span>
              {answer.template?.is_critical && (
                <span style={{ marginLeft: '0.5rem', background: '#fee2e2', color: theme.danger, padding: '0.08rem 0.4rem', borderRadius: '9999px', fontSize: '0.6rem', fontWeight: '700' }}>
                  CRITICAL
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
              {saving && (
                <div style={{ width: 12, height: 12, border: `2px solid ${theme.goldDark}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              )}
              <button
                onClick={() => onFlagToggle(answer.id, answer.is_flagged)}
                disabled={disabled}
                style={{ background: answer.is_flagged ? '#fff7ed' : 'none', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', borderRadius: '0.375rem', padding: '0.25rem', fontSize: '0.875rem' }}
              >
                {answer.is_flagged ? '🚩' : '⚑'}
              </button>
            </div>
          </div>

          {/* Question text */}
          <p style={{ fontSize: '0.875rem', color: theme.text, marginBottom: '0.875rem', lineHeight: '1.6' }}>
            {answer.template?.question}
          </p>

          {/* Answer buttons */}
          {!disabled && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {(Object.entries(ANSWER_CONFIG) as [AnswerStatus, typeof ANSWER_CONFIG[AnswerStatus]][]).map(([status, cfg]) => {
                const active = cur === status
                return (
                  <button
                    key={status}
                    onClick={() => onAnswer(answer.id, status, noteText || undefined)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.375rem',
                      padding: '0.45rem 0.875rem', borderRadius: '0.625rem',
                      border: `2px solid ${active ? cfg.border : theme.border}`,
                      background: active ? cfg.bg : 'white',
                      color: active ? cfg.color : theme.muted,
                      cursor: 'pointer', fontSize: '0.78rem',
                      fontWeight: active ? '700' : '500',
                      fontFamily: 'inherit', transition: 'all 0.15s',
                      transform: active ? 'scale(0.97)' : 'scale(1)',
                    }}
                  >
                    <span>{cfg.emoji}</span> {cfg.label}
                  </button>
                )
              })}
              <button
                onClick={() => setShowNote(!showNote)}
                style={{
                  padding: '0.45rem 0.875rem', borderRadius: '0.625rem',
                  border: `2px solid ${showNote ? '#93c5fd' : theme.border}`,
                  background: showNote ? '#eff6ff' : 'white',
                  color: showNote ? theme.info : theme.muted,
                  cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'inherit',
                  transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '0.375rem',
                }}
              >
                ✏️ Note
              </button>
            </div>
          )}

          {/* Status badge when completed */}
          {disabled && cur && (
            <div style={{ marginBottom: '0.625rem' }}>
              <Badge value={cur} type="answer" />
            </div>
          )}

          {/* Note textarea */}
          {(showNote || answer.notes) && (
            <textarea
              rows={2}
              placeholder="Add note for this question..."
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              onBlur={() => onNoteBlur(answer.id, noteText)}
              disabled={disabled}
              style={{
                width: '100%', padding: '0.625rem',
                boxSizing: 'border-box' as const,
                border: `1px solid ${theme.border}`, borderRadius: '0.5rem',
                fontSize: '0.8rem', fontFamily: 'inherit', resize: 'none',
                background: disabled ? '#f9fafb' : 'white',
                outline: 'none', marginBottom: '0.5rem',
              }}
              onFocus={e => { if (!disabled) e.target.style.borderColor = theme.goldDark }}
              onBlurCapture={e => e.target.style.borderColor = theme.border}
            />
          )}

          {/* Guidance */}
          {answer.template?.guidance && (
            <p style={{ fontSize: '0.72rem', color: theme.muted, fontStyle: 'italic', margin: 0, borderLeft: `2px solid ${theme.border}`, paddingLeft: '0.5rem' }}>
              💡 {answer.template.guidance}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}