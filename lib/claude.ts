import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateReportSummary(reportData: {
  title: string;
  sections: Array<{ name: string; content: string }>;
  metrics: Record<string, any>;
}): Promise<string> {
  const prompt = `Analyze this audit report and provide a concise, professional summary:

Title: ${reportData.title}

Sections:
${reportData.sections.map((s) => `- ${s.name}: ${s.content}`).join("\n")}

Key Metrics:
${JSON.stringify(reportData.metrics, null, 2)}

Provide a 2-3 paragraph executive summary highlighting the most important findings and recommendations.`;

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

export async function generateRecommendations(
  issues: Array<{ title: string; severity: string; description: string }>
): Promise<string> {
  const prompt = `Based on these audit findings, provide actionable recommendations:

${issues.map((i) => `- [${i.severity}] ${i.title}: ${i.description}`).join("\n")}

Format as a prioritized action plan with specific steps and timeline estimates.`;

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 800,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

export async function analyzeCompliance(data: Record<string, any>): Promise<{
  complianceScore: number;
  summary: string;
  gaps: string[];
}> {
  const prompt = `Analyze this data for compliance gaps and provide a detailed assessment:

${JSON.stringify(data, null, 2)}

Respond in JSON format with: complianceScore (0-100), summary (2-3 sentences), and gaps (array of identified compliance gaps).`;

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 600,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "{}";
  try {
    return JSON.parse(text);
  } catch {
    return {
      complianceScore: 0,
      summary: "Unable to parse analysis",
      gaps: [],
    };
  }
}
