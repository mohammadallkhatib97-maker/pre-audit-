-- ISO 9001:2015 - Quality Management System Questions
INSERT INTO iso_templates (standard, version, clause_number, clause_title, section, question, guidance, is_critical, sort_order) VALUES
('ISO_9001', '2015', '4.1', 'Understanding the organization and its context', 'Context', 'Has the organization identified external and internal issues relevant to its purpose and strategic direction?', 'Understand the business environment, including market conditions, regulatory requirements, and organizational culture.', true, 1),
('ISO_9001', '2015', '4.2', 'Understanding the needs and expectations of stakeholders', 'Context', 'Has the organization identified stakeholders and their relevant needs and expectations?', 'Stakeholders include customers, employees, regulatory bodies, and suppliers.', true, 2),
('ISO_9001', '2015', '4.3', 'Determining the scope of the QMS', 'Scope', 'Has the organization determined the boundaries and applicability of the Quality Management System?', 'The scope should address the products/services provided and any exclusions with justification.', true, 3),
('ISO_9001', '2015', '4.4', 'Quality Management System and its processes', 'Planning', 'Does the organization have documented information on the QMS and its processes?', 'Processes should be documented and include interactions between them.', true, 4),
('ISO_9001', '2015', '5.1', 'Leadership and commitment', 'Leadership', 'Does top management demonstrate leadership and commitment to the QMS?', 'Leadership should be evident through resource allocation and performance reviews.', true, 5),
('ISO_9001', '2015', '5.2', 'Quality policy', 'Leadership', 'Does the organization have a documented quality policy that is appropriate to the organization?', 'The policy should be communicated and reviewed.', true, 6),
('ISO_9001', '2015', '5.3', 'Organizational roles, responsibilities and authorities', 'Leadership', 'Has the organization defined and communicated responsibilities and authorities relevant to the QMS?', 'Responsibilities should cascade from top management through the organization.', true, 7),
('ISO_9001', '2015', '6.1', 'Actions to address risks and opportunities', 'Planning', 'Has the organization determined risks and opportunities affecting the QMS?', 'Risk assessment should consider internal and external issues.', false, 8),
('ISO_9001', '2015', '6.2', 'Quality objectives and planning to achieve them', 'Planning', 'Has the organization established quality objectives and planning for their achievement?', 'Objectives should be measurable, tracked, and reviewed.', true, 9),
('ISO_9001', '2015', '7.1', 'Resources', 'Support', 'Has the organization determined and provided necessary resources for the QMS?', 'Resources include personnel, infrastructure, environment, and technology.', false, 10),
('ISO_9001', '2015', '7.2', 'Competence', 'Support', 'Does the organization ensure competence of personnel performing work affecting quality?', 'Competence should be maintained through training and documented.', true, 11),
('ISO_9001', '2015', '7.3', 'Awareness', 'Support', 'Is personnel aware of the quality policy and relevant quality objectives?', 'Awareness programs should be documented and effective.', false, 12),
('ISO_9001', '2015', '7.4', 'Communication', 'Support', 'Does the organization have effective internal and external communication about the QMS?', 'Communication should be planned and include feedback mechanisms.', false, 13),
('ISO_9001', '2015', '7.5', 'Documented information', 'Support', 'Does the organization control documented information required for the QMS?', 'Documents should be reviewed, approved, and version controlled.', true, 14),
('ISO_9001', '2015', '8.1', 'Operational planning and control', 'Operation', 'Does the organization have planned processes for providing products and services?', 'Planning should include requirements, resources, and acceptance criteria.', true, 15),
('ISO_9001', '2015', '8.2', 'Determination of requirements for products and services', 'Operation', 'Does the organization determine and review requirements for products/services to be provided?', 'Requirements should be documented and communicated to customers.', true, 16),
('ISO_9001', '2015', '8.3', 'Design and development of products and services', 'Operation', 'Where applicable, has the organization performed design and development processes?', 'Design should include planning, input, output, and verification.', false, 17),
('ISO_9001', '2015', '8.4', 'Control of externally provided processes, products and services', 'Operation', 'Does the organization control processes and services provided by external providers?', 'External providers should be evaluated and monitored for conformance.', true, 18),
('ISO_9001', '2015', '8.5', 'Production and service provision', 'Operation', 'Does the organization control production and service provision under planned conditions?', 'Conditions should include product/service identification and traceability.', true, 19),
('ISO_9001', '2015', '8.6', 'Release of products and services', 'Operation', 'Are products and services released only when requirements are met?', 'Release should be evidenced by documented approval and customer satisfaction.', true, 20),
('ISO_9001', '2015', '8.7', 'Control of nonconforming products and services', 'Operation', 'Does the organization control nonconforming products and services?', 'Nonconformities should be segregated, evaluated, and disposition determined.', true, 21),
('ISO_9001', '2015', '9.1', 'Monitoring, measurement, analysis and evaluation', 'Performance', 'Does the organization monitor and measure the QMS processes?', 'Monitoring should be systematic and include performance indicators.', true, 22),
('ISO_9001', '2015', '9.2', 'Internal audit', 'Performance', 'Does the organization conduct periodic internal audits of the QMS?', 'Audits should be scheduled, planned, and include compliance assessment.', true, 23),
('ISO_9001', '2015', '9.3', 'Management review', 'Performance', 'Does top management review the QMS at planned intervals?', 'Reviews should assess performance, opportunities for improvement, and resource needs.', true, 24),
('ISO_9001', '2015', '10.1', 'General - Improvement', 'Improvement', 'Does the organization address opportunities for improvement?', 'Improvement should be systematic and include process optimization.', false, 25),
('ISO_9001', '2015', '10.2', 'Nonconformity and corrective action', 'Improvement', 'Does the organization address nonconformities through corrective actions?', 'Corrective actions should include root cause analysis and effectiveness check.', true, 26),
('ISO_9001', '2015', '10.3', 'Continual improvement', 'Improvement', 'Does the organization continually improve the QMS?', 'Improvement should be evidence-based and communicated.', false, 27);

-- ISO 14001:2015 - Environmental Management System Questions
INSERT INTO iso_templates (standard, version, clause_number, clause_title, section, question, guidance, is_critical, sort_order) VALUES
('ISO_14001', '2015', '4.1', 'Understanding the organization and its context', 'Context', 'Has the organization identified environmental issues relevant to its operations?', 'Consider internal and external factors affecting environmental performance.', true, 1),
('ISO_14001', '2015', '4.2', 'Understanding the needs and expectations of stakeholders', 'Context', 'Has the organization identified stakeholders and their environmental expectations?', 'Stakeholders include regulators, customers, employees, and communities.', true, 2),
('ISO_14001', '2015', '4.3', 'Determining the scope of the EMS', 'Scope', 'Is the scope of the EMS clearly defined and documented?', 'Scope should identify products, services, and activities included.', true, 3),
('ISO_14001', '2015', '5.1', 'Environmental policy', 'Leadership', 'Does the organization have a documented environmental policy?', 'Policy should commit to regulatory compliance and prevention of pollution.', true, 4),
('ISO_14001', '2015', '6.1', 'Environmental aspects and impacts', 'Planning', 'Has the organization identified its environmental aspects and impacts?', 'Aspects should be evaluated for their significance to the organization.', true, 5),
('ISO_14001', '2015', '6.2', 'Legal and other requirements', 'Planning', 'Does the organization identify and maintain compliance with environmental laws?', 'Legal requirements should be documented and reviewed regularly.', true, 6),
('ISO_14001', '2015', '7.1', 'Resources and support', 'Support', 'Does the organization provide resources for EMS implementation?', 'Resources include personnel, technology, and budget.', false, 7),
('ISO_14001', '2015', '7.2', 'Competence and training', 'Support', 'Are personnel competent and trained in environmental management?', 'Training needs should be identified and documented.', true, 8),
('ISO_14001', '2015', '8.1', 'Operational planning and control', 'Operation', 'Does the organization plan operations to control environmental impacts?', 'Controls should address significant environmental aspects.', true, 9),
('ISO_14001', '2015', '9.1', 'Monitoring and measurement', 'Performance', 'Does the organization monitor environmental performance?', 'Monitoring should include compliance verification.', true, 10),
('ISO_14001', '2015', '9.2', 'Compliance evaluation', 'Performance', 'Does the organization evaluate environmental compliance?', 'Compliance should be assessed regularly and documented.', true, 11),
('ISO_14001', '2015', '10.2', 'Nonconformity and corrective action', 'Improvement', 'Does the organization address environmental nonconformities?', 'Corrective actions should prevent recurrence.', true, 12);

-- ISO 45001:2018 - Occupational Health and Safety Management System Questions
INSERT INTO iso_templates (standard, version, clause_number, clause_title, section, question, guidance, is_critical, sort_order) VALUES
('ISO_45001', '2018', '4.1', 'Understanding the organization and its context', 'Context', 'Has the organization identified relevant factors affecting OH&S?', 'Consider workplace hazards and risks to workers.', true, 1),
('ISO_45001', '2018', '4.2', 'Understanding the needs and expectations of stakeholders', 'Context', 'Has the organization identified worker and stakeholder expectations?', 'Include workers, regulators, and community concerns.', true, 2),
('ISO_45001', '2018', '5.1', 'Leadership and commitment', 'Leadership', 'Does management demonstrate commitment to worker health and safety?', 'Commitment should be evident in decisions and resource allocation.', true, 3),
('ISO_45001', '2018', '5.2', 'OH&S policy', 'Leadership', 'Does the organization have a documented OH&S policy?', 'Policy should include worker participation and hazard elimination.', true, 4),
('ISO_45001', '2018', '5.3', 'Organizational roles, responsibilities and authorities', 'Leadership', 'Are OH&S responsibilities clearly defined and communicated?', 'All levels should understand their OH&S responsibilities.', true, 5),
('ISO_45001', '2018', '6.1', 'Actions to address risks and opportunities', 'Planning', 'Does the organization assess OH&S risks and opportunities?', 'Risk assessment should be systematic and documented.', true, 6),
('ISO_45001', '2018', '6.2', 'Objectives and planning', 'Planning', 'Are OH&S objectives established and communicated?', 'Objectives should be measurable and reviewed regularly.', true, 7),
('ISO_45001', '2018', '7.1', 'Resources', 'Support', 'Are adequate resources provided for OH&S management?', 'Resources include personnel, equipment, and facilities.', false, 8),
('ISO_45001', '2018', '7.2', 'Competence', 'Support', 'Are workers competent and trained in OH&S?', 'Competence should be verified and maintained.', true, 9),
('ISO_45001', '2018', '7.3', 'Worker participation and consultation', 'Support', 'Do workers participate in OH&S decision-making?', 'Participation should be structured and documented.', true, 10),
('ISO_45001', '2018', '8.1', 'Operational planning and control', 'Operation', 'Does the organization control hazardous work activities?', 'Controls should be proportionate to risk levels.', true, 11),
('ISO_45001', '2018', '8.2', 'Elimination of hazards and reduction of OH&S risks', 'Operation', 'Has the organization implemented hierarchy of controls?', 'Controls should follow elimination, substitution, and engineering controls.', true, 12),
('ISO_45001', '2018', '9.1', 'Monitoring, measurement, analysis and evaluation', 'Performance', 'Does the organization monitor OH&S performance?', 'Monitoring should include incident tracking and compliance.', true, 13),
('ISO_45001', '2018', '9.2', 'Internal audit', 'Performance', 'Does the organization conduct OH&S audits?', 'Audits should be planned and independent.', true, 14),
('ISO_45001', '2018', '10.2', 'Incident, nonconformity and corrective action', 'Improvement', 'Does the organization investigate and correct OH&S incidents?', 'Investigation should identify root causes and implement prevention.', true, 15);

-- ISO 27001:2022 - Information Security Management System Questions
INSERT INTO iso_templates (standard, version, clause_number, clause_title, section, question, guidance, is_critical, sort_order) VALUES
('ISO_27001', '2022', '5.1', 'Policies for information security', 'Leadership', 'Has the organization established an information security policy?', 'Policy should define objectives and be communicated to stakeholders.', true, 1),
('ISO_27001', '2022', '5.2', 'Information security roles and responsibilities', 'Leadership', 'Are information security roles and responsibilities defined?', 'All personnel should understand their responsibilities.', true, 2),
('ISO_27001', '2022', '6.1', 'Assessment of information security risks and opportunities', 'Planning', 'Does the organization perform regular information security risk assessments?', 'Assessments should be documented and include asset inventory.', true, 3),
('ISO_27001', '2022', '6.2', 'Information security objectives and planning', 'Planning', 'Are information security objectives established?', 'Objectives should be specific, measurable, and relevant.', true, 4),
('ISO_27001', '2022', '7.1', 'Determination of information security requirements', 'Support', 'Has the organization determined information security requirements?', 'Requirements should address confidentiality, integrity, and availability.', true, 5),
('ISO_27001', '2022', '7.2', 'Information security awareness, education and training', 'Support', 'Does the organization provide information security training?', 'Training should cover threats, safe practices, and incident reporting.', true, 6),
('ISO_27001', '2022', '8.1', 'Physical and environmental security', 'Operation', 'Are physical and environmental security controls implemented?', 'Controls should protect information systems from unauthorized access.', true, 7),
('ISO_27001', '2022', '8.2', 'Access control', 'Operation', 'Are access controls implemented and reviewed?', 'Controls should follow the principle of least privilege.', true, 8),
('ISO_27001', '2022', '8.3', 'Cryptography', 'Operation', 'Where applicable, are cryptographic controls implemented?', 'Encryption should protect sensitive information.', false, 9),
('ISO_27001', '2022', '8.4', 'Physical and logical security of network', 'Operation', 'Is network security managed and monitored?', 'Networks should be segmented and firewalls configured.', true, 10),
('ISO_27001', '2022', '8.5', 'Acquisition, development and maintenance of information systems', 'Operation', 'Are information systems developed with security in mind?', 'Security should be considered in design and development.', true, 11),
('ISO_27001', '2022', '8.6', 'Management of technical vulnerability', 'Operation', 'Are system vulnerabilities identified and managed?', 'Patches should be applied promptly and testing performed.', true, 12),
('ISO_27001', '2022', '8.7', 'Information systems audit considerations', 'Operation', 'Are audit trails maintained for information systems?', 'Logs should record access and changes for forensics.', true, 13),
('ISO_27001', '2022', '9.1', 'Monitoring, measurement, analysis and evaluation', 'Performance', 'Does the organization monitor information security performance?', 'Monitoring should include logs review and incident tracking.', true, 14),
('ISO_27001', '2022', '9.2', 'Internal audit', 'Performance', 'Are information security audits conducted?', 'Audits should be independent and cover all domains.', true, 15);

-- ISO 22000:2018 - Food Safety Management System Questions
INSERT INTO iso_templates (standard, version, clause_number, clause_title, section, question, guidance, is_critical, sort_order) VALUES
('ISO_22000', '2018', '4.1', 'Understanding the organization and its context', 'Context', 'Has the organization identified food safety risks in its context?', 'Consider supply chain and product-specific hazards.', true, 1),
('ISO_22000', '2018', '5.1', 'Leadership and commitment', 'Leadership', 'Does management demonstrate commitment to food safety?', 'Commitment should include resource allocation and policy.', true, 2),
('ISO_22000', '2018', '5.2', 'Food safety policy', 'Leadership', 'Does the organization have a documented food safety policy?', 'Policy should address hazard identification and control.', true, 3),
('ISO_22000', '2018', '6.1', 'Risk assessment and determination of control measures', 'Planning', 'Has the organization performed hazard analysis (HACCP)?', 'Critical control points should be identified and documented.', true, 4),
('ISO_22000', '2018', '6.2', 'Food safety objectives and planning', 'Planning', 'Are food safety objectives established?', 'Objectives should include monitoring parameters.', true, 5),
('ISO_22000', '2018', '7.1', 'Competence and training', 'Support', 'Are food handlers trained in food safety?', 'Training should cover hygiene and contamination prevention.', true, 6),
('ISO_22000', '2018', '7.2', 'Communication', 'Support', 'Is food safety information communicated?', 'Communication should include hazard alerts and supplier notification.', true, 7),
('ISO_22000', '2018', '8.1', 'Operational planning and control', 'Operation', 'Are food safety operations controlled?', 'Controls should address receiving, storage, and handling.', true, 8),
('ISO_22000', '2018', '8.2', 'Control of traceability and product recall', 'Operation', 'Can the organization trace products and perform recalls?', 'Traceability should be maintained and regularly tested.', true, 9),
('ISO_22000', '2018', '8.3', 'Management of externally provided processes', 'Operation', 'Are suppliers evaluated for food safety?', 'Suppliers should have documented agreements and audits.', true, 10),
('ISO_22000', '2018', '9.1', 'Monitoring and measurement', 'Performance', 'Are critical control points monitored?', 'Monitoring should include corrective action documentation.', true, 11),
('ISO_22000', '2018', '9.2', 'Internal audit', 'Performance', 'Are food safety systems audited?', 'Audits should verify HACCP implementation and effectiveness.', true, 12);

-- ISO 50001:2018 - Energy Management System Questions
INSERT INTO iso_templates (standard, version, clause_number, clause_title, section, question, guidance, is_critical, sort_order) VALUES
('ISO_50001', '2018', '4.1', 'Understanding the organization and its context', 'Context', 'Has the organization identified energy-related factors?', 'Consider energy sources and consumption patterns.', true, 1),
('ISO_50001', '2018', '5.1', 'Energy policy', 'Leadership', 'Does the organization have an energy policy?', 'Policy should commit to efficiency and improvement.', true, 2),
('ISO_50001', '2018', '6.1', 'Energy review and energy baseline', 'Planning', 'Has the organization conducted an energy review?', 'Review should establish baseline and identify opportunities.', true, 3),
('ISO_50001', '2018', '6.2', 'Energy objectives and planning', 'Planning', 'Are energy objectives and targets established?', 'Objectives should be measurable and tracked.', true, 4),
('ISO_50001', '2018', '7.1', 'Resources and support', 'Support', 'Are energy management resources adequate?', 'Resources include personnel training and technology.', false, 5),
('ISO_50001', '2018', '7.2', 'Competence', 'Support', 'Are personnel competent in energy management?', 'Training should cover energy systems and efficiency.', true, 6),
('ISO_50001', '2018', '8.1', 'Operational planning and control', 'Operation', 'Are energy-using systems controlled and maintained?', 'Maintenance should optimize energy performance.', true, 7),
('ISO_50001', '2018', '8.2', 'Design of energy-using systems', 'Operation', 'Is energy efficiency considered in design?', 'New systems should meet efficiency standards.', false, 8),
('ISO_50001', '2018', '9.1', 'Monitoring, measurement and analysis', 'Performance', 'Does the organization monitor energy consumption?', 'Monitoring should track progress toward objectives.', true, 9),
('ISO_50001', '2018', '9.2', 'Internal audit', 'Performance', 'Are energy management systems audited?', 'Audits should verify effectiveness of controls.', true, 10),
('ISO_50001', '2018', '10.2', 'Nonconformity and corrective action', 'Improvement', 'Are energy performance nonconformities addressed?', 'Corrective actions should prevent recurrence.', true, 11);
