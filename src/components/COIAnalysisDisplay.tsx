"use client";
import { BarChart3, CheckCircle, ChevronDown, FileCheck, Shield, XCircle, AlertTriangle } from "lucide-react";
import { useState } from "react";
import type { COIAnalysisResult } from "../types/documents";

export default function COIAnalysisDisplay({ analysis, className = "" }: { analysis: COIAnalysisResult; className?: string }) {
  const [open, setOpen] = useState({ coverages: true, validation: true, risk: false });

  if (!analysis?.success) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <XCircle className="w-5 h-5 text-red-500 mr-3" />
          <span className="text-red-700">COI analysis failed: {analysis?.error || "Unknown error"}</span>
        </div>
      </div>
    );
  }

  const { coiData, validationResults, riskAssessment, confidence } = analysis;

  const riskClass = (risk: string) =>
    risk === "Low" ? "text-green-600 bg-green-50 border-green-200" :
    risk === "Medium" ? "text-yellow-600 bg-yellow-50 border-yellow-200" :
    risk === "High" ? "text-orange-600 bg-orange-50 border-orange-200" : "text-gray-600 bg-gray-50 border-gray-200";

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-blue-800 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Certificate of Insurance Analysis
          </h3>
          <div className={`px-3 py-1 rounded-full border text-sm font-medium ${riskClass(riskAssessment.overallRisk)}`}>
            {riskAssessment.overallRisk} Risk ({riskAssessment.riskScore}/100)
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><span className="text-blue-600 font-medium">Insured:</span><div className="text-gray-800 text-xs">{coiData.insuredName}</div></div>
          <div><span className="text-blue-600 font-medium">Certificate #:</span><div className="text-gray-800">{coiData.certificateNumber}</div></div>
          <div><span className="text-blue-600 font-medium">Issue Date:</span><div className="text-gray-800">{coiData.issueDate}</div></div>
          <div><span className="text-blue-600 font-medium">Analysis:</span><div className="text-gray-800">{Math.round(confidence * 100)}% confidence</div></div>
        </div>
      </div>

      {/* Coverage Details */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <button onClick={() => setOpen((s) => ({ ...s, coverages: !s.coverages }))}
                className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50">
          <h4 className="font-semibold text-gray-800 flex items-center">
            <FileCheck className="w-4 h-4 mr-2" /> Coverage Details & Amounts
          </h4>
          <ChevronDown className={`w-4 h-4 transition-transform ${open.coverages ? "rotate-180" : ""}`} />
        </button>
        {open.coverages && (
          <div className="px-4 pb-4 border-t border-gray-100">
            <div className="space-y-4 pt-4">
              {Object.entries(coiData.coverages).map(([key, coverage]) => (
                <div key={key} className="bg-gray-50 rounded-lg p-3">
                  <h5 className="font-medium text-gray-800 mb-2">{coverage.type}</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-600">Policy #:</span><div className="font-medium text-blue-600">{coverage.policyNumber}</div></div>
                    <div><span className="text-gray-600">Insurer:</span><div className="font-medium">{coverage.insurer}</div></div>
                    <div><span className="text-gray-600">Effective:</span><div className="font-medium text-green-600">{coverage.policyPeriod.effective}</div></div>
                    <div><span className="text-gray-600">Expires:</span><div className="font-medium text-orange-600">{coverage.policyPeriod.expiration}</div></div>
                  </div>
                  <div className="mt-3">
                    <span className="text-gray-600 text-sm">Coverage Limits:</span>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                      {Object.entries(coverage.limits).map(([limitType, amount]) => (
                        <div key={limitType} className="text-xs">
                          <span className="text-gray-500 capitalize">{limitType.replace(/([A-Z])/g, " $1").trim()}:</span>
                          <div className="font-medium text-green-600">{typeof amount === "number" ? `$${amount.toLocaleString()}` : "Not specified"}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Validation */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <button onClick={() => setOpen((s) => ({ ...s, validation: !s.validation }))}
                className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50">
          <h4 className="font-semibold text-gray-800 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" /> Validation Results & Compliance
            {validationResults.criticalIssues.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">{validationResults.criticalIssues.length} Issues</span>
            )}
          </h4>
          <ChevronDown className={`w-4 h-4 transition-transform ${open.validation ? "rotate-180" : ""}`} />
        </button>
        {open.validation && (
          <div className="px-4 pb-4 border-t border-gray-100">
            <div className="space-y-3 pt-4">
              {validationResults.criticalIssues.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <h5 className="font-medium text-red-800 mb-2 flex items-center">
                    <XCircle className="w-4 h-4 mr-2" /> Critical Issues
                  </h5>
                  <ul className="space-y-1">
                    {validationResults.criticalIssues.map((txt, i) => (
                      <li key={i} className="text-sm text-red-700 flex items-start"><span className="text-red-500 mr-2">•</span>{txt}</li>
                    ))}
                  </ul>
                </div>
              )}
              {validationResults.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <h5 className="font-medium text-yellow-800 mb-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" /> Warnings
                  </h5>
                  <ul className="space-y-1">
                    {validationResults.warnings.map((txt, i) => (
                      <li key={i} className="text-sm text-yellow-700 flex items-start"><span className="text-yellow-500 mr-2">•</span>{txt}</li>
                    ))}
                  </ul>
                </div>
              )}
              {validationResults.recommendations.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <h5 className="font-medium text-green-800 mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" /> Compliance Status
                  </h5>
                  <ul className="space-y-1">
                    {validationResults.recommendations.map((txt, i) => (
                      <li key={i} className="text-sm text-green-700 flex items-start"><span className="text-green-500 mr-2">•</span>{txt}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Risk */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <button onClick={() => setOpen((s) => ({ ...s, risk: !s.risk }))}
                className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50">
          <h4 className="font-semibold text-gray-800 flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" /> Risk Assessment
          </h4>
          <ChevronDown className={`w-4 h-4 transition-transform ${open.risk ? "rotate-180" : ""}`} />
        </button>
        {open.risk && (
          <div className="px-4 pb-4 border-t border-gray-100">
            <div className="space-y-2 pt-4 text-sm text-gray-700">
              {analysis.riskAssessment.strengths.length > 0 && (
                <div>
                  <div className="font-semibold text-green-700 mb-1">Strengths</div>
                  <ul className="list-disc list-inside">
                    {analysis.riskAssessment.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
              {analysis.riskAssessment.concerns.length > 0 && (
                <div className="mt-2">
                  <div className="font-semibold text-yellow-700 mb-1">Concerns</div>
                  <ul className="list-disc list-inside">
                    {analysis.riskAssessment.concerns.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
