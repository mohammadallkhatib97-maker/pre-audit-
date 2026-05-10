import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportReportAsPDF(
  elementId: string,
  filename: string = "report.pdf"
) {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error("Element not found");
    }

    // Configure canvas rendering
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      imageTimeout: 30000,
      allowTaint: true,
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgData = canvas.toDataURL("image/png");
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let yPosition = 0;

    // Add pages
    pdf.addImage(imgData, "PNG", 0, yPosition, imgWidth, imgHeight);

    let heightLeft = imgHeight - 297; // A4 height in mm
    while (heightLeft > 0) {
      yPosition = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, yPosition, imgWidth, imgHeight);
      heightLeft -= 297;
    }

    pdf.save(filename);
  } catch (error) {
    console.error("PDF export error:", error);
    throw error;
  }
}

export async function exportReportAsHTML(
  content: string,
  filename: string = "report.html"
) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${filename}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            color: #111827;
            background: white;
            padding: 2rem;
          }
          h1 { font-size: 2.25rem; margin: 1rem 0; color: #1f2937; }
          h2 { font-size: 1.5rem; margin: 0.8rem 0; color: #374151; border-bottom: 2px solid #2563eb; padding-bottom: 0.5rem; }
          h3 { font-size: 1.125rem; margin: 0.6rem 0; color: #4b5563; }
          p { margin: 0.5rem 0; }
          .metric-box { display: inline-block; padding: 1rem; margin: 0.5rem; background: #f0f9ff; border: 1px solid #bfdbfe; border-radius: 0.5rem; }
          .finding { padding: 1rem; margin: 1rem 0; border-left: 4px solid #dc2626; background: #fef2f2; }
          .finding.high { border-left-color: #ea580c; background: #fff7ed; }
          .finding.medium { border-left-color: #eab308; background: #fffbeb; }
          .finding.low { border-left-color: #2563eb; background: #f0f9ff; }
          .severity { font-weight: bold; font-size: 0.875rem; padding: 0.25rem 0.5rem; border-radius: 0.25rem; }
          .severity.critical { background: #fee2e2; color: #991b1b; }
          .severity.high { background: #fed7aa; color: #92400e; }
          .severity.medium { background: #fef08a; color: #713f12; }
          .severity.low { background: #bfdbfe; color: #1e3a8a; }
          table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
          th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background: #f3f4f6; font-weight: 600; }
          tr:nth-child(odd) { background: #fafafa; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
            h2 { page-break-after: avoid; }
            .finding { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
