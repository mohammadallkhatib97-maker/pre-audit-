export type UserRole    = 'admin' | 'auditor'
export type AuditStatus = 'draft' | 'in_progress' | 'completed' | 'archived'
export type AnswerStatus = 'compliant' | 'non_compliant' | 'observation' | 'not_applicable'
export type IsoStandard = 'ISO_9001' | 'ISO_14001' | 'ISO_45001' | 'ISO_22000' | 'ISO_27001' | 'ISO_50001'
export type RiskLevel   = 'low' | 'medium' | 'high' | 'critical'
export type AuditResult = 'pass' | 'fail' | 'conditional'

export interface Profile {
  id:            string
  full_name:     string
  email:         string
  role:          UserRole
  avatar_url?:   string
  phone?:        string
  title?:        string
  department?:   string
  signature_url?: string
  is_active:     boolean
  created_at:    string
  updated_at:    string
}

export interface AuditClient {
  id:             string
  client_name:    string
  company_name:   string
  industry:       string
  country:        string
  city?:          string
  address?:       string
  email?:         string
  phone?:         string
  website?:       string
  contact_person?: string
  contact_title?: string
  logo_url?:      string
  notes?:         string
  is_active:      boolean
  created_by?:    string
  created_at:     string
  updated_at:     string
}

export interface IsoTemplate {
  id:            string
  standard:      IsoStandard
  version:       string
  clause_number: string
  clause_title:  string
  section:       string
  question:      string
  guidance?:     string
  is_critical:   boolean
  sort_order:    number
  created_at:    string
}

export interface Audit {
  id:                   string
  audit_number:         string
  client_id:            string
  auditor_id:           string
  standard:             IsoStandard
  status:               AuditStatus
  result?:              AuditResult
  risk_level?:          RiskLevel
  audit_date:           string
  audit_end_date?:      string
  location?:            string
  executive_summary?:   string
  key_findings?:        string
  recommendations?:     string
  overall_notes?:       string
  total_questions:      number
  compliant_count:      number
  non_compliant_count:  number
  observation_count:    number
  not_applicable_count: number
  compliance_score?:    number
  auditor_signature_url?: string
  signed_at?:           string
  report_url?:          string
  report_generated_at?: string
  created_at:           string
  updated_at:           string
  // joined
  company_name?:        string
  client_name?:         string
  industry?:            string
  country?:             string
  auditor_name?:        string
  auditor_title?:       string
}

export interface AuditAnswer {
  id:           string
  audit_id:     string
  template_id:  string
  status?:      AnswerStatus
  notes?:       string
  is_flagged:   boolean
  priority:     number
  answered_by?: string
  answered_at?: string
  created_at:   string
  updated_at:   string
  // joined
  template?:    IsoTemplate
}

export interface AuditFile {
  id:           string
  audit_id:     string
  answer_id?:   string
  file_name:    string
  file_path:    string
  file_url:     string
  file_type:    string
  file_size?:   number
  description?: string
  uploaded_by?: string
  created_at:   string
}

export interface AuditNote {
  id:          string
  audit_id:    string
  answer_id?:  string
  content:     string
  is_critical: boolean
  is_internal: boolean
  created_by?: string
  created_at:  string
  updated_at:  string
}

export interface DashboardStats {
  auditor_id:          string
  total_audits:        number
  completed_audits:    number
  in_progress_audits:  number
  draft_audits:        number
  failed_audits:       number
  high_risk_audits:    number
  avg_compliance_score: number
}