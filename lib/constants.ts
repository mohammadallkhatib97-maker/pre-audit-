import { IsoStandard } from './types'

export const ISO_STANDARDS: Record<IsoStandard, { label: string; color: string; description: string }> = {
  ISO_9001:  { label: 'ISO 9001',  color: 'blue',   description: 'Quality Management System' },
  ISO_14001: { label: 'ISO 14001', color: 'green',  description: 'Environmental Management System' },
  ISO_45001: { label: 'ISO 45001', color: 'orange', description: 'Occupational Health & Safety' },
  ISO_22000: { label: 'ISO 22000', color: 'red',    description: 'Food Safety Management' },
  ISO_27001: { label: 'ISO 27001', color: 'purple', description: 'Information Security Management' },
  ISO_50001: { label: 'ISO 50001', color: 'yellow', description: 'Energy Management System' },
}

export const INDUSTRIES = [
  'Manufacturing','Food & Beverage','Healthcare','Construction',
  'Information Technology','Finance & Banking','Education',
  'Retail & Commerce','Energy & Utilities','Transportation & Logistics',
  'Hospitality & Tourism','Consulting','Government','Other',
]

export const COUNTRIES = [
  'Jordan','Saudi Arabia','UAE','Kuwait','Qatar','Bahrain',
  'Oman','Egypt','Lebanon','Iraq','Palestine','Syria',
  'United States','United Kingdom','Germany','France','Other',
]

export const RISK_COLORS = {
  low:      'bg-green-100 text-green-700',
  medium:   'bg-yellow-100 text-yellow-700',
  high:     'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
}

export const STATUS_COLORS = {
  draft:       'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  completed:   'bg-green-100 text-green-700',
  archived:    'bg-dark-100 text-dark-500',
}

export const RESULT_COLORS = {
  pass:        'bg-green-100 text-green-700',
  fail:        'bg-red-100 text-red-700',
  conditional: 'bg-yellow-100 text-yellow-700',
}

export const ANSWER_COLORS = {
  compliant:      'bg-green-100 text-green-700 border-green-200',
  non_compliant:  'bg-red-100 text-red-700 border-red-200',
  observation:    'bg-yellow-100 text-yellow-700 border-yellow-200',
  not_applicable: 'bg-gray-100 text-gray-600 border-gray-200',
}