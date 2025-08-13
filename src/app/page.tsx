"use client";

import AuthWrapper from "../components/AuthWrapper";
import EnhancedFileUpload from "../components/EnhancedFileUpload";
import SmartInput from "../components/SmartInput";
import { useMemo, useState } from "react";
import { useFormValidation } from "../hooks/useFormValidation";
import { useAutoSave } from "../hooks/useAutoSave";
import { Brain, Building, DollarSign } from "lucide-react";
import TweetgarotLogo from "../components/TweetgarotLogo";
import { EnterpriseAIService } from "@/lib/analysis/EnterpriseAIService";

export default function Page() {
  const [formData, setFormData] = useState({
    companyLegalName: "",
    primaryContact: "",
    yearFounded: "",
    generalLiability: [] as File[],
    workersCompensation: [] as File[],
    coiCertificate: [] as File[],
    financialStatements: [] as File[],
  });

  const validation = useFormValidation();
  const isFormValid = useMemo(() => {
    const requiredFields = ["companyLegalName", "primaryContact", "yearFounded"] as const;
    return requiredFields.every((f) => validation.validateRequired((formData as any)[f]));
  }, [formData, validation]);

  const { lastSaved } = useAutoSave(formData);

  const [calculating, setCalculating] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleCalculate = async () => {
    setCalculating(true);
    await new Promise((r) => setTimeout(r, 1200));
    const rsl = EnterpriseAIService.calculateContractorScore(formData as any);
    setResults(rsl);
    setCalculating(false);
  };

  return (
    <AuthWrapper>
      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
          <div className="flex items-start justify-between">
            <div className="max-w-3xl">
              <TweetgarotLogo size="full" />
              <h1 className="text-3xl font-bold mt-6 text-gray-800">
                Subcontractor Pre-Qualification Questionnaire
              </h1>
              <p className="text-gray-600 mt-3">
                REAL OCR Certificate of Insurance analysis, typed & modularized for Next.js.
              </p>
              {lastSaved && (
                <p className="text-sm text-gray-500 mt-2">Last saved: {lastSaved.toLocaleTimeString()}</p>
              )}
            </div>
          </div>

          {/* General Info (minimal demo) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            <SmartInput
              label="Company Legal Name"
              value={formData.companyLegalName}
              onChange={(v) => setFormData((s) => ({ ...s, companyLegalName: v }))}
              placeholder="Enter legal name"
              required
              icon={Building}
            />
            <SmartInput
              label="Primary Contact"
              value={formData.primaryContact}
              onChange={(v) => setFormData((s) => ({ ...s, primaryContact: v }))}
              placeholder="Name, Email, Phone"
              required
            />
            <SmartInput
              label="Year Founded"
              type="number"
              value={formData.yearFounded}
              onChange={(v) => setFormData((s) => ({ ...s, yearFounded: v }))}
              placeholder="1995"
              required
            />
            <SmartInput
              label="Recent Revenue (optional)"
              value={(formData as any).recentRevenue || ""}
              onChange={(v) => setFormData((s) => ({ ...s, recentRevenue: v }))}
              placeholder="$5,000,000"
              icon={DollarSign}
            />
          </div>

          {/* Insurance uploads (with REAL OCR/COI) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <EnhancedFileUpload
              label="General Liability Certificate"
              value={formData.generalLiability}
              onChange={(files) => setFormData((s) => ({ ...s, generalLiability: files }))}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              required
              help="REAL OCR will extract limits & policy periods."
              maxFiles={2}
              documentType="generalLiability"
            />
            <EnhancedFileUpload
              label="Workers’ Compensation Certificate"
              value={formData.workersCompensation}
              onChange={(files) => setFormData((s) => ({ ...s, workersCompensation: files }))}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              required
              help="REAL OCR validation."
              maxFiles={2}
              documentType="workersCompensation"
            />
            <EnhancedFileUpload
              label="Certificate of Insurance (COI)"
              value={formData.coiCertificate}
              onChange={(files) => setFormData((s) => ({ ...s, coiCertificate: files }))}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              required
              help="Full COI analysis & risk scoring."
              maxFiles={3}
              documentType="coiCertificate"
            />
            <EnhancedFileUpload
              label="Financial Statements"
              value={formData.financialStatements}
              onChange={(files) => setFormData((s) => ({ ...s, financialStatements: files }))}
              accept=".pdf,.xlsx,.xls,.doc,.docx"
              help="OCR parses key financial fields."
              maxFiles={5}
              documentType="financialStatements"
            />
          </div>

          <div className="flex justify-center mt-12">
            <button
              onClick={handleCalculate}
              disabled={!isFormValid || calculating}
              className="flex items-center text-white px-10 py-4 rounded-xl font-bold shadow-lg disabled:opacity-50"
              style={{ backgroundColor: "var(--tg-primary-600)" }}
            >
              {calculating ? (
                <span className="flex items-center">
                  <Brain className="w-5 h-5 mr-2 animate-pulse" />
                  Processing with REAL OCR…
                </span>
              ) : (
                <span className="flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  Evaluate Pre-Qualification
                </span>
              )}
            </button>
          </div>

          {results && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mt-10">
              <h3 className="text-xl font-semibold text-blue-800 mb-2">
                Analysis Results
              </h3>
              <p className="text-blue-800">
                Score: <strong>{results.overallScore}</strong> — {results.qualification}
              </p>
            </div>
          )}
        </div>

        {/* Footer banner */}
        <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-6 border border-green-200 mt-8">
          <div className="flex items-center">
            <Brain className="w-6 h-6 text-green-600 mr-3" />
            <div>
              <h3 className="font-semibold text-green-800">REAL OCR System Active</h3>
              <p className="text-green-700 text-sm">
                Documents are processed client-side with tesseract.js (and safe fallbacks).
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}
