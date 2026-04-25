// SITA OS — CRM Import Quality & Templates Component
// Import quality scoring, downloadable templates, and data validation
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download, FileSpreadsheet, CheckCircle, AlertTriangle, XCircle,
  Star, Sparkles, Eye, BarChart3, Shield, ArrowRight, FileText,
  Users, Building2, TrendingUp, Zap, Info
} from "lucide-react";

// ── Import Templates ──

interface ImportTemplate {
  id: string;
  name: string;
  description: string;
  entity: "contacts" | "companies" | "deals";
  fields: string[];
  icon: React.ReactNode;
  recommended?: boolean;
}

const IMPORT_TEMPLATES: ImportTemplate[] = [
  {
    id: "contacts-standard",
    name: "Contacts — Standard",
    description: "First name, last name, email, phone, company, lifecycle stage, tags",
    entity: "contacts",
    fields: ["first_name", "last_name", "email", "phone", "company", "title", "lifecycle_stage", "source", "tags"],
    icon: <Users className="h-5 w-5 text-primary" />,
    recommended: true,
  },
  {
    id: "contacts-full",
    name: "Contacts — Full",
    description: "All contact fields including address, custom fields, and notes",
    entity: "contacts",
    fields: ["first_name", "last_name", "email", "phone", "company", "title", "lifecycle_stage", "source", "tags", "address", "city", "state", "country", "website", "owner", "notes"],
    icon: <Users className="h-5 w-5 text-blue-400" />,
  },
  {
    id: "companies-standard",
    name: "Companies — Standard",
    description: "Company name, industry, size, domain, phone, revenue",
    entity: "companies",
    fields: ["name", "industry", "size", "domain", "phone", "annual_revenue", "city", "country", "tags"],
    icon: <Building2 className="h-5 w-5 text-purple-400" />,
  },
  {
    id: "deals-standard",
    name: "Deals — Standard",
    description: "Deal title, value, stage, probability, contact, company, close date",
    entity: "deals",
    fields: ["title", "value", "stage", "probability", "contact_name", "company_name", "expected_close_date", "source"],
    icon: <TrendingUp className="h-5 w-5 text-green-400" />,
  },
];

// ── Quality Score Model ──

interface QualityDimension {
  name: string;
  score: number;
  issues: string[];
  weight: number;
}

interface ImportQualityReport {
  overallScore: number;
  grade: "A" | "B" | "C" | "D" | "F";
  dimensions: QualityDimension[];
  totalRows: number;
  validRows: number;
  errorRows: number;
  warningRows: number;
  recommendations: string[];
}

function generateDemoQualityReport(): ImportQualityReport {
  return {
    overallScore: 78,
    grade: "B",
    totalRows: 156,
    validRows: 142,
    errorRows: 5,
    warningRows: 9,
    dimensions: [
      { name: "Completeness", score: 85, issues: ["14 rows missing email", "3 rows missing name"], weight: 0.3 },
      { name: "Format Validity", score: 92, issues: ["2 invalid email formats", "1 invalid phone format"], weight: 0.25 },
      { name: "Uniqueness", score: 65, issues: ["8 potential duplicates detected", "3 exact email matches"], weight: 0.2 },
      { name: "Consistency", score: 72, issues: ["Mixed date formats", "Inconsistent lifecycle stage values"], weight: 0.15 },
      { name: "Freshness", score: 80, issues: ["12 records older than 1 year"], weight: 0.1 },
    ],
    recommendations: [
      "Review 8 potential duplicates before importing",
      "Standardize lifecycle stage values (lead, qualified, customer)",
      "Add missing email addresses for 14 contacts",
      "Use ISO date format (YYYY-MM-DD) for consistency",
    ],
  };
}

const GRADE_CONFIG: Record<string, { color: string; label: string }> = {
  A: { color: "text-green-400", label: "Excellent" },
  B: { color: "text-blue-400", label: "Good" },
  C: { color: "text-yellow-400", label: "Fair" },
  D: { color: "text-orange-400", label: "Needs Work" },
  F: { color: "text-red-400", label: "Poor" },
};

// ── Components ──

export function CRMImportTemplates({ onDownload }: { onDownload?: (templateId: string) => void }) {
  const handleDownload = (template: ImportTemplate) => {
    // Generate CSV content
    const csv = template.fields.join(",") + "\n" + template.fields.map(() => "").join(",");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sita_crm_template_${template.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onDownload?.(template.id);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FileSpreadsheet className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Import Templates</h3>
      </div>
      <p className="text-xs text-muted-foreground">Download a pre-formatted template to ensure your data imports correctly.</p>

      <div className="grid sm:grid-cols-2 gap-3">
        {IMPORT_TEMPLATES.map(tpl => (
          <Card key={tpl.id} className="border-border/50 bg-card/50 hover:border-primary/30 transition-all group cursor-pointer" onClick={() => handleDownload(tpl)}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center shrink-0">
                  {tpl.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{tpl.name}</p>
                    {tpl.recommended && (
                      <Badge className="text-[9px] bg-primary/15 text-primary border-primary/25 h-4 px-1.5">Recommended</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{tpl.description}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">{tpl.fields.length} fields</p>
                </div>
                <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function CRMImportQuality({ showDemo = true }: { showDemo?: boolean }) {
  const [report] = useState<ImportQualityReport | null>(showDemo ? generateDemoQualityReport() : null);

  if (!report) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <BarChart3 className="h-8 w-8 text-muted-foreground/30 mb-2" />
        <p className="text-sm font-medium text-muted-foreground">No quality report available</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Import data to see quality analysis</p>
      </div>
    );
  }

  const gradeConfig = GRADE_CONFIG[report.grade];

  return (
    <div className="space-y-4">
      {/* Score header */}
      <Card className="border-border/50 bg-gradient-to-br from-card to-card/80">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className={`text-4xl font-bold ${gradeConfig.color}`}>{report.grade}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{gradeConfig.label}</p>
            </div>
            <Separator orientation="vertical" className="h-12 bg-border/30" />
            <div className="flex-1 grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-lg font-bold text-green-400">{report.validRows}</p>
                <p className="text-[10px] text-muted-foreground">Valid</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-yellow-400">{report.warningRows}</p>
                <p className="text-[10px] text-muted-foreground">Warnings</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-red-400">{report.errorRows}</p>
                <p className="text-[10px] text-muted-foreground">Errors</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dimensions */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" /> Quality Dimensions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {report.dimensions.map(dim => (
            <div key={dim.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground">{dim.name}</span>
                <span className={`text-xs font-bold ${dim.score >= 80 ? "text-green-400" : dim.score >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                  {dim.score}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${dim.score >= 80 ? "bg-green-500" : dim.score >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{ width: `${dim.score}%` }}
                />
              </div>
              {dim.issues.length > 0 && (
                <div className="mt-1.5 space-y-0.5">
                  {dim.issues.map((issue, i) => (
                    <p key={i} className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <AlertTriangle className="h-2.5 w-2.5 text-yellow-400 shrink-0" /> {issue}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4" /> Advisor Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {report.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-xs text-foreground">{rec}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
