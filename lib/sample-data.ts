// Sample data for testing the new report system

export const sampleReport = {
  id: "sample-1",
  title: "Security & Compliance Audit Report",
  organization: "TechCorp Inc.",
  createdAt: new Date().toISOString(),
  sections: [
    {
      name: "Executive Overview",
      content:
        "This comprehensive audit assessed the organization's security posture and regulatory compliance. The evaluation covered infrastructure, application security, data protection, and operational controls.",
    },
    {
      name: "Assessment Scope",
      content:
        "Scope included: Cloud infrastructure (AWS), Web applications, Database systems, User access controls, Data encryption and protection, Incident response procedures.",
    },
  ],
  findings: [
    {
      id: "1",
      severity: "critical",
      title: "Unencrypted Database Connections",
      description:
        "Database connections are not using encrypted protocols. Data in transit is vulnerable to interception.",
      impact: "Potential data breach affecting all database communications",
      recommendation:
        "Implement TLS/SSL encryption for all database connections immediately",
    },
    {
      id: "2",
      severity: "critical",
      title: "Default Credentials in Production",
      description:
        "Several production systems still use default or hardcoded credentials.",
      impact: "Unauthorized access to critical systems",
      recommendation:
        "Implement secrets management solution (AWS Secrets Manager, HashiCorp Vault). Rotate all credentials.",
    },
    {
      id: "3",
      severity: "high",
      title: "Missing Multi-Factor Authentication",
      description:
        "Admin accounts lack multi-factor authentication enforcement.",
      impact: "Compromised admin accounts could lead to full system compromise",
      recommendation:
        "Deploy MFA for all administrative accounts using TOTP or hardware keys",
    },
    {
      id: "4",
      severity: "high",
      title: "Inadequate Log Retention",
      description:
        "Security logs are retained for only 7 days before deletion.",
      impact: "Inability to investigate security incidents beyond 7 days",
      recommendation:
        "Implement centralized logging with at least 90-day retention. Archive older logs.",
    },
    {
      id: "5",
      severity: "medium",
      title: "Outdated Dependencies",
      description:
        "Several application dependencies have known security vulnerabilities.",
      impact: "Potential exploitation through dependency vulnerabilities",
      recommendation:
        "Update all dependencies to latest patches. Implement automated dependency scanning.",
    },
    {
      id: "6",
      severity: "medium",
      title: "Missing Security Headers",
      description:
        "Web applications lack security headers like CSP, X-Frame-Options.",
      impact: "Increased vulnerability to XSS and clickjacking attacks",
      recommendation:
        "Implement comprehensive security headers across all web applications",
    },
    {
      id: "7",
      severity: "low",
      title: "Documentation Gaps",
      description: "Security procedures documentation is incomplete.",
      impact: "Inconsistent security practices across teams",
      recommendation: "Create comprehensive security documentation and runbooks",
    },
  ],
  metrics: {
    "Total Findings": 7,
    "Critical Issues": 2,
    "High Priority": 2,
    "Medium Priority": 2,
    "Low Priority": 1,
    "Average Response Time": "2.3 hours",
    "Systems Assessed": 12,
    "Data Coverage": "95%",
    "Compliance Score": 62,
  },
};

export const sampleReport2 = {
  id: "sample-2",
  title: "Compliance Assessment Report",
  organization: "HealthTech Solutions",
  createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  sections: [
    {
      name: "HIPAA Compliance",
      content:
        "Healthcare organization assessment against HIPAA requirements. Evaluation focused on Protected Health Information (PHI) handling, access controls, and audit procedures.",
    },
    {
      name: "GDPR Alignment",
      content:
        "Assessment of data privacy practices in compliance with GDPR requirements, including data processing agreements and user rights management.",
    },
  ],
  findings: [
    {
      id: "1",
      severity: "critical",
      title: "Inadequate Data Classification",
      description:
        "PHI is not properly classified and marked in systems. Data handling procedures unclear.",
      impact: "Non-compliance with HIPAA data protection requirements",
      recommendation:
        "Implement data classification framework and label all PHI appropriately",
    },
    {
      id: "2",
      severity: "high",
      title: "Missing Business Associate Agreements",
      description:
        "Third-party service providers lack signed Business Associate Agreements.",
      impact: "Legal liability for data processing violations",
      recommendation:
        "Execute BAAs with all third parties processing PHI before continued engagement",
    },
    {
      id: "3",
      severity: "high",
      title: "Incomplete Audit Trail",
      description:
        "System access logs do not capture all required audit events per HIPAA requirements.",
      impact: "Cannot verify HIPAA compliance or investigate breaches",
      recommendation:
        "Enhance logging to capture all HIPAA-required audit events with timestamps",
    },
    {
      id: "4",
      severity: "medium",
      title: "Outdated Privacy Policy",
      description:
        "Privacy policy not updated for recent policy changes and new data processing.",
      impact: "User notification requirements may not be met",
      recommendation:
        "Review and update privacy policy quarterly. Notify users of material changes.",
    },
  ],
  metrics: {
    "Total Findings": 4,
    "Critical Issues": 1,
    "High Priority": 2,
    "Medium Priority": 1,
    "Standards Evaluated": "HIPAA, GDPR, HITECH",
    "Compliance Score": 74,
    "Corrective Actions": 8,
    "Timeline to Compliance": "3 months",
  },
};
