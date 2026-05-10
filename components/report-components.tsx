import React from "react";
import { clsx } from "clsx";

// Header Component
export function ReportHeader({
  title,
  subtitle,
  date,
  organization,
}: {
  title: string;
  subtitle?: string;
  date: string;
  organization: string;
}) {
  return (
    <div className="mb-12 border-b-2 border-gradient-to-r from-blue-600 to-purple-600 pb-8">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{title}</h1>
          {subtitle && (
            <p className="text-lg text-gray-600">{subtitle}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Generated on</p>
          <p className="text-sm font-semibold text-gray-700">{date}</p>
        </div>
      </div>
      <p className="text-gray-600 font-medium">{organization}</p>
    </div>
  );
}

// Section Component
export function ReportSection({
  title,
  children,
  icon,
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="mb-8 page-break">
      <div className="flex items-center gap-3 mb-6">
        {icon && <div className="text-blue-600">{icon}</div>}
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

// Finding/Issue Card Component
export function FindingCard({
  severity,
  title,
  description,
  impact,
  recommendation,
}: {
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  impact?: string;
  recommendation?: string;
}) {
  const severityConfig = {
    critical: {
      bg: "bg-red-50",
      border: "border-red-300",
      badge: "bg-red-100 text-red-800",
    },
    high: {
      bg: "bg-orange-50",
      border: "border-orange-300",
      badge: "bg-orange-100 text-orange-800",
    },
    medium: {
      bg: "bg-yellow-50",
      border: "border-yellow-300",
      badge: "bg-yellow-100 text-yellow-800",
    },
    low: {
      bg: "bg-blue-50",
      border: "border-blue-300",
      badge: "bg-blue-100 text-blue-800",
    },
  };

  const config = severityConfig[severity];

  return (
    <div className={clsx("rounded-lg p-4 border-l-4", config.bg, config.border)}>
      <div className="flex items-start gap-3 mb-2">
        <span className={clsx("px-2 py-1 rounded text-xs font-bold", config.badge)}>
          {severity.toUpperCase()}
        </span>
        <h3 className="text-lg font-semibold text-gray-900 flex-1">{title}</h3>
      </div>
      <p className="text-gray-700 mb-3">{description}</p>
      {impact && (
        <div className="mb-3">
          <p className="text-sm font-semibold text-gray-600">Impact:</p>
          <p className="text-sm text-gray-600">{impact}</p>
        </div>
      )}
      {recommendation && (
        <div>
          <p className="text-sm font-semibold text-gray-600">Recommendation:</p>
          <p className="text-sm text-gray-600">{recommendation}</p>
        </div>
      )}
    </div>
  );
}

// Metric Box Component
export function MetricBox({
  label,
  value,
  unit,
  trend,
  color,
}: {
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "neutral";
  color?: "blue" | "green" | "red" | "purple";
}) {
  const colorConfig = {
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
    red: "bg-red-50 border-red-200",
    purple: "bg-purple-50 border-purple-200",
  };

  return (
    <div className={clsx("p-4 rounded-lg border", colorConfig[color || "blue"])}>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </div>
      {trend && (
        <p
          className={clsx("text-xs mt-2", {
            "text-green-600": trend === "up",
            "text-red-600": trend === "down",
            "text-gray-600": trend === "neutral",
          })}
        >
          {trend === "up" && "↑"} {trend === "down" && "↓"}{" "}
          {trend === "neutral" && "→"} Trend
        </p>
      )}
    </div>
  );
}

// Summary Box Component
export function SummaryBox({
  title,
  content,
  highlight,
}: {
  title: string;
  content: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={clsx("p-6 rounded-lg", {
        "bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200":
          highlight,
        "bg-gray-50 border border-gray-200": !highlight,
      })}
    >
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
        {content}
      </p>
    </div>
  );
}

// Table Component
export function ReportTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | number)[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b-2 border-gray-300">
            {headers.map((header, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left font-semibold text-gray-900"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={clsx("border-b border-gray-200", {
                "bg-gray-50": i % 2 === 0,
              })}
            >
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-gray-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Footer Component
export function ReportFooter({
  preparedBy,
  approvedBy,
  date,
}: {
  preparedBy?: string;
  approvedBy?: string;
  date: string;
}) {
  return (
    <div className="mt-12 pt-8 border-t border-gray-300 text-sm text-gray-600">
      <div className="grid grid-cols-3 gap-8 mb-4">
        <div>
          <p className="font-semibold text-gray-900">Prepared By</p>
          <p className="mt-2">{preparedBy || "_______________"}</p>
          <p className="text-xs mt-4">Signature</p>
        </div>
        <div>
          <p className="font-semibold text-gray-900">Approved By</p>
          <p className="mt-2">{approvedBy || "_______________"}</p>
          <p className="text-xs mt-4">Signature</p>
        </div>
        <div>
          <p className="font-semibold text-gray-900">Date</p>
          <p className="mt-2">{date}</p>
        </div>
      </div>
    </div>
  );
}
