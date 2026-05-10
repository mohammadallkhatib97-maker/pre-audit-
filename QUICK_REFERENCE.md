// Quick reference for using the new report system

/**
 * COMPONENT LIBRARY QUICK REFERENCE
 */

// 1. Header - Display title and metadata
<ReportHeader
  title="Audit Report Title"
  subtitle="Optional subtitle"
  date="May 4, 2026"
  organization="Organization Name"
/>

// 2. Section - Main content container
<ReportSection title="Section Title" icon={<IconComponent />}>
  {/* Content goes here */}
</ReportSection>

// 3. Finding Card - Display issues/findings
<FindingCard
  severity="critical" // critical | high | medium | low
  title="Issue Title"
  description="What is the issue?"
  impact="What could happen?" // optional
  recommendation="How to fix it?" // optional
/>

// 4. Metric Box - Show KPIs
<MetricBox
  label="Metric Label"
  value={123}
  unit="%" // optional
  trend="up" // up | down | neutral (optional)
  color="blue" // blue | green | red | purple
/>

// 5. Summary Box - Highlighted text
<SummaryBox
  title="Summary Title"
  content="Summary content here..."
  highlight={true} // makes it blue highlighted
/>

// 6. Table - Display data
<ReportTable
  headers={["Column 1", "Column 2"]}
  rows={[
    ["Value 1", "Value 2"],
    ["Value 3", "Value 4"]
  ]}
/>

// 7. Footer - Signature block
<ReportFooter
  preparedBy="John Doe"
  approvedBy="Jane Smith"
  date="May 4, 2026"
/>

/**
 * CLAUDE AI INTEGRATION
 */

// Generate executive summary
import { generateReportSummary } from '@/lib/claude';

const summary = await generateReportSummary({
  title: "Report Title",
  sections: [{ name: "Section", content: "..." }],
  metrics: { key: value }
});

// Generate recommendations
import { generateRecommendations } from '@/lib/claude';

const recommendations = await generateRecommendations([
  { title: "Issue", severity: "critical", description: "..." }
]);

// Analyze compliance
import { analyzeCompliance } from '@/lib/claude';

const { complianceScore, summary, gaps } = await analyzeCompliance(data);

/**
 * EXPORT FUNCTIONALITY
 */

// Export as PDF
import { exportReportAsPDF } from '@/lib/export';

await exportReportAsPDF('element-id', 'filename.pdf');

// Export as HTML
import { exportReportAsHTML } from '@/lib/export';

await exportReportAsHTML(htmlContent, 'filename.html');

/**
 * API ENDPOINT USAGE
 */

// POST /api/generate-report

// Request:
{
  "reportData": { /* your data */ },
  "type": "summary" // or "recommendations" or "compliance"
}

// Response:
{
  "result": "Generated content..."
}

/**
 * SEVERITY COLORS
 */
// critical  → Red (#dc2626)
// high      → Orange (#ea580c)
// medium    → Yellow (#eab308)
// low       → Blue (#2563eb)

/**
 * COMMON PATTERNS
 */

// Pattern 1: Complete Report Structure
<div className="min-h-screen bg-white p-8">
  <ReportHeader title="..." organization="..." date="..." />
  
  <ReportSection title="Executive Summary">
    <SummaryBox content="..." highlight={true} />
    <div className="grid grid-cols-4 gap-4">
      <MetricBox label="..." value={0} />
      {/* More metrics */}
    </div>
  </ReportSection>
  
  <ReportSection title="Findings">
    {findings.map(f => <FindingCard {...f} />)}
  </ReportSection>
  
  <ReportFooter date="..." />
</div>

// Pattern 2: Get Data with AI
useEffect(() => {
  const load = async () => {
    const data = await fetchReport(id);
    const summary = await generateReportSummary(data);
    setSummary(summary);
  };
  load();
}, [id]);

// Pattern 3: Export Report
const handleExport = async () => {
  try {
    await exportReportAsPDF('report-content', 'report.pdf');
  } catch (err) {
    console.error('Export failed:', err);
  }
};

/**
 * ENVIRONMENT SETUP
 */
// .env.local

ANTHROPIC_API_KEY=your_key_here
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

/**
 * COMMON TASKS
 */

// Task 1: Create new report page
// File: app/reports/v2/[id]/page.tsx
// Use the template in the main report page

// Task 2: Add new component
// File: components/report-components.tsx
// Add your component, export it

// Task 3: Custom AI prompt
// File: lib/claude.ts
// Modify the prompt in the function

// Task 4: Style customization
// Edit class names in component-tsx files
// Tailwind CSS classes are used throughout

/**
 * TROUBLESHOOTING
 */

// Issue: API key not working
// Fix: Check .env.local has ANTHROPIC_API_KEY
// Fix: Verify key at console.anthropic.com

// Issue: Components not rendering
// Fix: Check imports are correct
// Fix: Verify file paths match your structure

// Issue: PDF export empty
// Fix: Ensure element ID exists in DOM
// Fix: Check browser console for errors

// Issue: AI generation slow
// Fix: Normal for Claude API, takes 2-10 seconds
// Fix: Show loading state to users

/**
 * DEPLOYMENT CHECKLIST
 */
// ✅ Environment variables configured
// ✅ Dependencies installed (npm install)
// ✅ API key is secure (not in code)
// ✅ Database connected if needed
// ✅ Auth configured if needed
// ✅ Error handling in place
// ✅ Loading states added
// ✅ Responsive design tested
// ✅ Print/PDF tested
// ✅ Sample data removed/updated

/**
 * PERFORMANCE TIPS
 */
// - Use async/await for AI calls
// - Add loading states
// - Implement error boundaries
// - Cache AI responses if possible
// - Use React Query for data fetching
// - Optimize images in reports
// - Lazy load heavy components

/**
 * SECURITY REMINDERS
 */
// - Never log API keys
// - Use .env.local for secrets
// - Validate user input on API routes
// - Sanitize HTML in exports
// - Check authentication before serving reports
// - Use HTTPS in production
// - Keep dependencies updated
