/**
 * ISO Templates Seeder Script
 * Run this to add comprehensive ISO standard questions to your Supabase database
 * Usage: node scripts/seed-iso-templates.js
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

const isoTemplates = [
  // ISO 9001:2015 - Quality Management System
  { standard: 'ISO_9001', version: '2015', clause_number: '4.1', clause_title: 'Understanding the organization and its context', section: 'Context', question: 'Has the organization identified external and internal issues relevant to its purpose and strategic direction?', guidance: 'Understand the business environment, including market conditions, regulatory requirements, and organizational culture.', is_critical: true, sort_order: 1 },
  { standard: 'ISO_9001', version: '2015', clause_number: '4.2', clause_title: 'Understanding the needs and expectations of stakeholders', section: 'Context', question: 'Has the organization identified stakeholders and their relevant needs and expectations?', guidance: 'Stakeholders include customers, employees, regulatory bodies, and suppliers.', is_critical: true, sort_order: 2 },
  { standard: 'ISO_9001', version: '2015', clause_number: '4.3', clause_title: 'Determining the scope of the QMS', section: 'Scope', question: 'Has the organization determined the boundaries and applicability of the Quality Management System?', guidance: 'The scope should address the products/services provided and any exclusions with justification.', is_critical: true, sort_order: 3 },
  { standard: 'ISO_9001', version: '2015', clause_number: '4.4', clause_title: 'Quality Management System and its processes', section: 'Planning', question: 'Does the organization have documented information on the QMS and its processes?', guidance: 'Processes should be documented and include interactions between them.', is_critical: true, sort_order: 4 },
  { standard: 'ISO_9001', version: '2015', clause_number: '5.1', clause_title: 'Leadership and commitment', section: 'Leadership', question: 'Does top management demonstrate leadership and commitment to the QMS?', guidance: 'Leadership should be evident through resource allocation and performance reviews.', is_critical: true, sort_order: 5 },
  { standard: 'ISO_9001', version: '2015', clause_number: '5.2', clause_title: 'Quality policy', section: 'Leadership', question: 'Does the organization have a documented quality policy that is appropriate to the organization?', guidance: 'The policy should be communicated and reviewed.', is_critical: true, sort_order: 6 },
  { standard: 'ISO_9001', version: '2015', clause_number: '5.3', clause_title: 'Organizational roles, responsibilities and authorities', section: 'Leadership', question: 'Has the organization defined and communicated responsibilities and authorities relevant to the QMS?', guidance: 'Responsibilities should cascade from top management through the organization.', is_critical: true, sort_order: 7 },
  { standard: 'ISO_9001', version: '2015', clause_number: '6.1', clause_title: 'Actions to address risks and opportunities', section: 'Planning', question: 'Has the organization determined risks and opportunities affecting the QMS?', guidance: 'Risk assessment should consider internal and external issues.', is_critical: false, sort_order: 8 },
  { standard: 'ISO_9001', version: '2015', clause_number: '6.2', clause_title: 'Quality objectives and planning to achieve them', section: 'Planning', question: 'Has the organization established quality objectives and planning for their achievement?', guidance: 'Objectives should be measurable, tracked, and reviewed.', is_critical: true, sort_order: 9 },
  { standard: 'ISO_9001', version: '2015', clause_number: '7.1', clause_title: 'Resources', section: 'Support', question: 'Has the organization determined and provided necessary resources for the QMS?', guidance: 'Resources include personnel, infrastructure, environment, and technology.', is_critical: false, sort_order: 10 },
  { standard: 'ISO_9001', version: '2015', clause_number: '7.2', clause_title: 'Competence', section: 'Support', question: 'Does the organization ensure competence of personnel performing work affecting quality?', guidance: 'Competence should be maintained through training and documented.', is_critical: true, sort_order: 11 },
  { standard: 'ISO_9001', version: '2015', clause_number: '7.3', clause_title: 'Awareness', section: 'Support', question: 'Is personnel aware of the quality policy and relevant quality objectives?', guidance: 'Awareness programs should be documented and effective.', is_critical: false, sort_order: 12 },
  { standard: 'ISO_9001', version: '2015', clause_number: '7.4', clause_title: 'Communication', section: 'Support', question: 'Does the organization have effective internal and external communication about the QMS?', guidance: 'Communication should be planned and include feedback mechanisms.', is_critical: false, sort_order: 13 },
  { standard: 'ISO_9001', version: '2015', clause_number: '7.5', clause_title: 'Documented information', section: 'Support', question: 'Does the organization control documented information required for the QMS?', guidance: 'Documents should be reviewed, approved, and version controlled.', is_critical: true, sort_order: 14 },
  { standard: 'ISO_9001', version: '2015', clause_number: '8.1', clause_title: 'Operational planning and control', section: 'Operation', question: 'Does the organization have planned processes for providing products and services?', guidance: 'Planning should include requirements, resources, and acceptance criteria.', is_critical: true, sort_order: 15 },
  { standard: 'ISO_9001', version: '2015', clause_number: '8.2', clause_title: 'Determination of requirements for products and services', section: 'Operation', question: 'Does the organization determine and review requirements for products/services to be provided?', guidance: 'Requirements should be documented and communicated to customers.', is_critical: true, sort_order: 16 },
  { standard: 'ISO_9001', version: '2015', clause_number: '8.3', clause_title: 'Design and development of products and services', section: 'Operation', question: 'Where applicable, has the organization performed design and development processes?', guidance: 'Design should include planning, input, output, and verification.', is_critical: false, sort_order: 17 },
  { standard: 'ISO_9001', version: '2015', clause_number: '8.4', clause_title: 'Control of externally provided processes, products and services', section: 'Operation', question: 'Does the organization control processes and services provided by external providers?', guidance: 'External providers should be evaluated and monitored for conformance.', is_critical: true, sort_order: 18 },
  { standard: 'ISO_9001', version: '2015', clause_number: '8.5', clause_title: 'Production and service provision', section: 'Operation', question: 'Does the organization control production and service provision under planned conditions?', guidance: 'Conditions should include product/service identification and traceability.', is_critical: true, sort_order: 19 },
  { standard: 'ISO_9001', version: '2015', clause_number: '8.6', clause_title: 'Release of products and services', section: 'Operation', question: 'Are products and services released only when requirements are met?', guidance: 'Release should be evidenced by documented approval and customer satisfaction.', is_critical: true, sort_order: 20 },
  { standard: 'ISO_9001', version: '2015', clause_number: '8.7', clause_title: 'Control of nonconforming products and services', section: 'Operation', question: 'Does the organization control nonconforming products and services?', guidance: 'Nonconformities should be segregated, evaluated, and disposition determined.', is_critical: true, sort_order: 21 },
  { standard: 'ISO_9001', version: '2015', clause_number: '9.1', clause_title: 'Monitoring, measurement, analysis and evaluation', section: 'Performance', question: 'Does the organization monitor and measure the QMS processes?', guidance: 'Monitoring should be systematic and include performance indicators.', is_critical: true, sort_order: 22 },
  { standard: 'ISO_9001', version: '2015', clause_number: '9.2', clause_title: 'Internal audit', section: 'Performance', question: 'Does the organization conduct periodic internal audits of the QMS?', guidance: 'Audits should be scheduled, planned, and include compliance assessment.', is_critical: true, sort_order: 23 },
  { standard: 'ISO_9001', version: '2015', clause_number: '9.3', clause_title: 'Management review', section: 'Performance', question: 'Does top management review the QMS at planned intervals?', guidance: 'Reviews should assess performance, opportunities for improvement, and resource needs.', is_critical: true, sort_order: 24 },
  { standard: 'ISO_9001', version: '2015', clause_number: '10.1', clause_title: 'General - Improvement', section: 'Improvement', question: 'Does the organization address opportunities for improvement?', guidance: 'Improvement should be systematic and include process optimization.', is_critical: false, sort_order: 25 },
  { standard: 'ISO_9001', version: '2015', clause_number: '10.2', clause_title: 'Nonconformity and corrective action', section: 'Improvement', question: 'Does the organization address nonconformities through corrective actions?', guidance: 'Corrective actions should include root cause analysis and effectiveness check.', is_critical: true, sort_order: 26 },
  { standard: 'ISO_9001', version: '2015', clause_number: '10.3', clause_title: 'Continual improvement', section: 'Improvement', question: 'Does the organization continually improve the QMS?', guidance: 'Improvement should be evidence-based and communicated.', is_critical: false, sort_order: 27 },

  // ISO 14001:2015 - Environmental Management System
  { standard: 'ISO_14001', version: '2015', clause_number: '4.1', clause_title: 'Understanding the organization and its context', section: 'Context', question: 'Has the organization identified environmental issues relevant to its operations?', guidance: 'Consider internal and external factors affecting environmental performance.', is_critical: true, sort_order: 1 },
  { standard: 'ISO_14001', version: '2015', clause_number: '4.2', clause_title: 'Understanding the needs and expectations of stakeholders', section: 'Context', question: 'Has the organization identified stakeholders and their environmental expectations?', guidance: 'Stakeholders include regulators, customers, employees, and communities.', is_critical: true, sort_order: 2 },
  { standard: 'ISO_14001', version: '2015', clause_number: '4.3', clause_title: 'Determining the scope of the EMS', section: 'Scope', question: 'Is the scope of the EMS clearly defined and documented?', guidance: 'Scope should identify products, services, and activities included.', is_critical: true, sort_order: 3 },
  { standard: 'ISO_14001', version: '2015', clause_number: '5.1', clause_title: 'Environmental policy', section: 'Leadership', question: 'Does the organization have a documented environmental policy?', guidance: 'Policy should commit to regulatory compliance and prevention of pollution.', is_critical: true, sort_order: 4 },
  { standard: 'ISO_14001', version: '2015', clause_number: '6.1', clause_title: 'Environmental aspects and impacts', section: 'Planning', question: 'Has the organization identified its environmental aspects and impacts?', guidance: 'Aspects should be evaluated for their significance to the organization.', is_critical: true, sort_order: 5 },
  { standard: 'ISO_14001', version: '2015', clause_number: '6.2', clause_title: 'Legal and other requirements', section: 'Planning', question: 'Does the organization identify and maintain compliance with environmental laws?', guidance: 'Legal requirements should be documented and reviewed regularly.', is_critical: true, sort_order: 6 },
  { standard: 'ISO_14001', version: '2015', clause_number: '7.1', clause_title: 'Resources and support', section: 'Support', question: 'Does the organization provide resources for EMS implementation?', guidance: 'Resources include personnel, technology, and budget.', is_critical: false, sort_order: 7 },
  { standard: 'ISO_14001', version: '2015', clause_number: '7.2', clause_title: 'Competence and training', section: 'Support', question: 'Are personnel competent and trained in environmental management?', guidance: 'Training needs should be identified and documented.', is_critical: true, sort_order: 8 },
  { standard: 'ISO_14001', version: '2015', clause_number: '8.1', clause_title: 'Operational planning and control', section: 'Operation', question: 'Does the organization plan operations to control environmental impacts?', guidance: 'Controls should address significant environmental aspects.', is_critical: true, sort_order: 9 },
  { standard: 'ISO_14001', version: '2015', clause_number: '9.1', clause_title: 'Monitoring and measurement', section: 'Performance', question: 'Does the organization monitor environmental performance?', guidance: 'Monitoring should include compliance verification.', is_critical: true, sort_order: 10 },
  { standard: 'ISO_14001', version: '2015', clause_number: '9.2', clause_title: 'Compliance evaluation', section: 'Performance', question: 'Does the organization evaluate environmental compliance?', guidance: 'Compliance should be assessed regularly and documented.', is_critical: true, sort_order: 11 },
  { standard: 'ISO_14001', version: '2015', clause_number: '10.2', clause_title: 'Nonconformity and corrective action', section: 'Improvement', question: 'Does the organization address environmental nonconformities?', guidance: 'Corrective actions should prevent recurrence.', is_critical: true, sort_order: 12 },

  // ISO 45001:2018 - Occupational Health and Safety
  { standard: 'ISO_45001', version: '2018', clause_number: '4.1', clause_title: 'Understanding the organization and its context', section: 'Context', question: 'Has the organization identified relevant factors affecting OH&S?', guidance: 'Consider workplace hazards and risks to workers.', is_critical: true, sort_order: 1 },
  { standard: 'ISO_45001', version: '2018', clause_number: '4.2', clause_title: 'Understanding the needs and expectations of stakeholders', section: 'Context', question: 'Has the organization identified worker and stakeholder expectations?', guidance: 'Include workers, regulators, and community concerns.', is_critical: true, sort_order: 2 },
  { standard: 'ISO_45001', version: '2018', clause_number: '5.1', clause_title: 'Leadership and commitment', section: 'Leadership', question: 'Does management demonstrate commitment to worker health and safety?', guidance: 'Commitment should be evident in decisions and resource allocation.', is_critical: true, sort_order: 3 },
  { standard: 'ISO_45001', version: '2018', clause_number: '5.2', clause_title: 'OH&S policy', section: 'Leadership', question: 'Does the organization have a documented OH&S policy?', guidance: 'Policy should include worker participation and hazard elimination.', is_critical: true, sort_order: 4 },
  { standard: 'ISO_45001', version: '2018', clause_number: '5.3', clause_title: 'Organizational roles, responsibilities and authorities', section: 'Leadership', question: 'Are OH&S responsibilities clearly defined and communicated?', guidance: 'All levels should understand their OH&S responsibilities.', is_critical: true, sort_order: 5 },
  { standard: 'ISO_45001', version: '2018', clause_number: '6.1', clause_title: 'Actions to address risks and opportunities', section: 'Planning', question: 'Does the organization assess OH&S risks and opportunities?', guidance: 'Risk assessment should be systematic and documented.', is_critical: true, sort_order: 6 },
  { standard: 'ISO_45001', version: '2018', clause_number: '6.2', clause_title: 'Objectives and planning', section: 'Planning', question: 'Are OH&S objectives established and communicated?', guidance: 'Objectives should be measurable and reviewed regularly.', is_critical: true, sort_order: 7 },
  { standard: 'ISO_45001', version: '2018', clause_number: '7.1', clause_title: 'Resources', section: 'Support', question: 'Are adequate resources provided for OH&S management?', guidance: 'Resources include personnel, equipment, and facilities.', is_critical: false, sort_order: 8 },
  { standard: 'ISO_45001', version: '2018', clause_number: '7.2', clause_title: 'Competence', section: 'Support', question: 'Are workers competent and trained in OH&S?', guidance: 'Competence should be verified and maintained.', is_critical: true, sort_order: 9 },
  { standard: 'ISO_45001', version: '2018', clause_number: '7.3', clause_title: 'Worker participation and consultation', section: 'Support', question: 'Do workers participate in OH&S decision-making?', guidance: 'Participation should be structured and documented.', is_critical: true, sort_order: 10 },
  { standard: 'ISO_45001', version: '2018', clause_number: '8.1', clause_title: 'Operational planning and control', section: 'Operation', question: 'Does the organization control hazardous work activities?', guidance: 'Controls should be proportionate to risk levels.', is_critical: true, sort_order: 11 },
  { standard: 'ISO_45001', version: '2018', clause_number: '8.2', clause_title: 'Elimination of hazards and reduction of OH&S risks', section: 'Operation', question: 'Has the organization implemented hierarchy of controls?', guidance: 'Controls should follow elimination, substitution, and engineering controls.', is_critical: true, sort_order: 12 },
  { standard: 'ISO_45001', version: '2018', clause_number: '9.1', clause_title: 'Monitoring, measurement, analysis and evaluation', section: 'Performance', question: 'Does the organization monitor OH&S performance?', guidance: 'Monitoring should include incident tracking and compliance.', is_critical: true, sort_order: 13 },
  { standard: 'ISO_45001', version: '2018', clause_number: '9.2', clause_title: 'Internal audit', section: 'Performance', question: 'Does the organization conduct OH&S audits?', guidance: 'Audits should be planned and independent.', is_critical: true, sort_order: 14 },
  { standard: 'ISO_45001', version: '2018', clause_number: '10.2', clause_title: 'Incident, nonconformity and corrective action', section: 'Improvement', question: 'Does the organization investigate and correct OH&S incidents?', guidance: 'Investigation should identify root causes and implement prevention.', is_critical: true, sort_order: 15 },

  // ISO 27001:2022 - Information Security Management
  { standard: 'ISO_27001', version: '2022', clause_number: '5.1', clause_title: 'Policies for information security', section: 'Leadership', question: 'Has the organization established an information security policy?', guidance: 'Policy should define objectives and be communicated to stakeholders.', is_critical: true, sort_order: 1 },
  { standard: 'ISO_27001', version: '2022', clause_number: '5.2', clause_title: 'Information security roles and responsibilities', section: 'Leadership', question: 'Are information security roles and responsibilities defined?', guidance: 'All personnel should understand their responsibilities.', is_critical: true, sort_order: 2 },
  { standard: 'ISO_27001', version: '2022', clause_number: '6.1', clause_title: 'Assessment of information security risks and opportunities', section: 'Planning', question: 'Does the organization perform regular information security risk assessments?', guidance: 'Assessments should be documented and include asset inventory.', is_critical: true, sort_order: 3 },
  { standard: 'ISO_27001', version: '2022', clause_number: '6.2', clause_title: 'Information security objectives and planning', section: 'Planning', question: 'Are information security objectives established?', guidance: 'Objectives should be specific, measurable, and relevant.', is_critical: true, sort_order: 4 },
  { standard: 'ISO_27001', version: '2022', clause_number: '7.1', clause_title: 'Determination of information security requirements', section: 'Support', question: 'Has the organization determined information security requirements?', guidance: 'Requirements should address confidentiality, integrity, and availability.', is_critical: true, sort_order: 5 },
  { standard: 'ISO_27001', version: '2022', clause_number: '7.2', clause_title: 'Information security awareness, education and training', section: 'Support', question: 'Does the organization provide information security training?', guidance: 'Training should cover threats, safe practices, and incident reporting.', is_critical: true, sort_order: 6 },
  { standard: 'ISO_27001', version: '2022', clause_number: '8.1', clause_title: 'Physical and environmental security', section: 'Operation', question: 'Are physical and environmental security controls implemented?', guidance: 'Controls should protect information systems from unauthorized access.', is_critical: true, sort_order: 7 },
  { standard: 'ISO_27001', version: '2022', clause_number: '8.2', clause_title: 'Access control', section: 'Operation', question: 'Are access controls implemented and reviewed?', guidance: 'Controls should follow the principle of least privilege.', is_critical: true, sort_order: 8 },
  { standard: 'ISO_27001', version: '2022', clause_number: '8.3', clause_title: 'Cryptography', section: 'Operation', question: 'Where applicable, are cryptographic controls implemented?', guidance: 'Encryption should protect sensitive information.', is_critical: false, sort_order: 9 },
  { standard: 'ISO_27001', version: '2022', clause_number: '8.4', clause_title: 'Physical and logical security of network', section: 'Operation', question: 'Is network security managed and monitored?', guidance: 'Networks should be segmented and firewalls configured.', is_critical: true, sort_order: 10 },

  // ISO 22000:2018 - Food Safety Management
  { standard: 'ISO_22000', version: '2018', clause_number: '4.1', clause_title: 'Understanding the organization and its context', section: 'Context', question: 'Has the organization identified food safety risks in its context?', guidance: 'Consider supply chain and product-specific hazards.', is_critical: true, sort_order: 1 },
  { standard: 'ISO_22000', version: '2018', clause_number: '5.1', clause_title: 'Leadership and commitment', section: 'Leadership', question: 'Does management demonstrate commitment to food safety?', guidance: 'Commitment should include resource allocation and policy.', is_critical: true, sort_order: 2 },
  { standard: 'ISO_22000', version: '2018', clause_number: '5.2', clause_title: 'Food safety policy', section: 'Leadership', question: 'Does the organization have a documented food safety policy?', guidance: 'Policy should address hazard identification and control.', is_critical: true, sort_order: 3 },
  { standard: 'ISO_22000', version: '2018', clause_number: '6.1', clause_title: 'Risk assessment and determination of control measures', section: 'Planning', question: 'Has the organization performed hazard analysis (HACCP)?', guidance: 'Critical control points should be identified and documented.', is_critical: true, sort_order: 4 },
  { standard: 'ISO_22000', version: '2018', clause_number: '6.2', clause_title: 'Food safety objectives and planning', section: 'Planning', question: 'Are food safety objectives established?', guidance: 'Objectives should include monitoring parameters.', is_critical: true, sort_order: 5 },

  // ISO 50001:2018 - Energy Management System
  { standard: 'ISO_50001', version: '2018', clause_number: '4.1', clause_title: 'Understanding the organization and its context', section: 'Context', question: 'Has the organization identified energy-related factors?', guidance: 'Consider energy sources and consumption patterns.', is_critical: true, sort_order: 1 },
  { standard: 'ISO_50001', version: '2018', clause_number: '5.1', clause_title: 'Energy policy', section: 'Leadership', question: 'Does the organization have an energy policy?', guidance: 'Policy should commit to efficiency and improvement.', is_critical: true, sort_order: 2 },
  { standard: 'ISO_50001', version: '2018', clause_number: '6.1', clause_title: 'Energy review and energy baseline', section: 'Planning', question: 'Has the organization conducted an energy review?', guidance: 'Review should establish baseline and identify opportunities.', is_critical: true, sort_order: 3 },
]

async function seedTemplates() {
  console.log('Starting ISO templates seeder...')

  try {
    // Check if templates already exist
    const { count } = await supabase
      .from('iso_templates')
      .select('*', { count: 'exact', head: true })

     if (typeof count === 'number' && count > 0) {

      console.log(`⚠️  Database already contains ${count} templates. Skipping insert.`)
      console.log('To re-seed, delete existing templates first.')
      return
    }

    // Insert templates in batches
    const batchSize = 50
    for (let i = 0; i < isoTemplates.length; i += batchSize) {
      const batch = isoTemplates.slice(i, i + batchSize)
      const { error } = await supabase.from('iso_templates').insert(batch)

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error)
        throw error
      }

      console.log(`✓ Inserted ${Math.min(batchSize, isoTemplates.length - i)} templates`)
    }

    console.log(`\n✅ Successfully seeded ${isoTemplates.length} ISO templates!`)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

seedTemplates()
