import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface ReportData {
  audit_number: string
  company_name: string
  standard: string
  compliance_score: number
  audit_date: string
  compliant_count: number
  non_compliant_count: number
  observation_count: number
  executive_summary?: string
  answers: any[]
  notes: any[]
}

/**
 * Generate professional executive summary using Claude AI
 */
export async function generateExecutiveSummary(data: ReportData): Promise<string> {
  const scoreLevel = data.compliance_score >= 90 ? 'Excellent' :
                     data.compliance_score >= 85 ? 'Very Good' :
                     data.compliance_score >= 75 ? 'Good' :
                     data.compliance_score >= 60 ? 'Fair' : 'Needs Improvement'

  const prompt = `You are a professional ISO audit consultant. Generate a professional 2-3 sentence executive summary for an ISO ${data.standard} audit report.

Audit Details:
- Organization: ${data.company_name}
- Standard: ${data.standard}
- Compliance Score: ${data.compliance_score}%
- Overall Level: ${scoreLevel}
- Compliant Items: ${data.compliant_count}
- Non-Compliant Items: ${data.non_compliant_count}
- Observations: ${data.observation_count}

Generate a concise, professional summary that:
1. Describes the audit scope and organization
2. Highlights the compliance score and achievement level
3. Emphasizes key strengths and areas for improvement

Make it suitable for a formal audit report. Write in formal, professional tone.`

  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 250,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  return message.content[0].type === 'text' ? message.content[0].text : ''
}

/**
 * Generate AI-powered compliance recommendations
 */
export async function generateRecommendations(
  data: ReportData,
  nonConformities: any[]
): Promise<string[]> {
  const ncDetails = nonConformities
    .slice(0, 5)
    .map(nc => `- ${nc.template?.clause_number}: ${nc.template?.clause_title}`)
    .join('\n')

  const prompt = `As an ISO audit expert, provide 3-5 specific, actionable recommendations for improving ISO ${data.standard} compliance based on these non-conformities:

${ncDetails}

Current compliance score: ${data.compliance_score}%

Provide recommendations that are:
1. Specific and measurable
2. Prioritized by impact (most important first)
3. Realistic to implement
4. Aligned with ISO standards

Format each recommendation as a clear, concise statement (max 15 words each).`

  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 400,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  return text
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => line.replace(/^[\d\.\-\*]\s*/, '').trim())
    .slice(0, 5)
}

/**
 * Generate AI insights for specific findings
 */
export async function generateFindingInsight(finding: {
  clause_number: string
  clause_title: string
  question: string
}): Promise<string> {
  const prompt = `Provide a 1-sentence professional insight for this ISO audit finding:

Clause: ${finding.clause_number} - ${finding.clause_title}
Question: ${finding.question}

Provide actionable, specific guidance for addressing this. Keep it under 15 words.`

  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 100,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  return message.content[0].type === 'text' ? message.content[0].text : ''
}

/**
 * Generate corrective action suggestions
 */
export async function generateCorrectiveAction(nonConformity: {
  clause_number: string
  clause_title: string
  question: string
  notes?: string
}): Promise<string> {
  const prompt = `Suggest a specific corrective action for this ISO non-conformity:

Clause: ${nonConformity.clause_number} - ${nonConformity.clause_title}
Finding: ${nonConformity.question}
${nonConformity.notes ? `Details: ${nonConformity.notes}` : ''}

Provide one clear, actionable corrective action (max 20 words) that directly addresses the root cause.`

  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 100,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  return message.content[0].type === 'text' ? message.content[0].text : ''
}

/**
 * Generate compliance insights
 */
export async function generateComplianceInsights(data: ReportData): Promise<{
  strengths: string[]
  improvements: string[]
}> {
  const prompt = `Analyze this ISO ${data.standard} audit performance and provide insights:

Score: ${data.compliance_score}%
Compliant: ${data.compliant_count}
Non-Compliant: ${data.non_compliant_count}
Observations: ${data.observation_count}

Provide 2-3 key strengths and 2-3 areas for improvement based on these metrics.

Format as JSON:
{
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"]
}`

  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}'

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { strengths: [], improvements: [] }
  } catch {
    return { strengths: [], improvements: [] }
  }
}
