/* eslint-disable @typescript-eslint/no-explicit-any */
import { OCRService } from "@/lib/ocr/CompleteOCRService";

const documentScoring: Record<string, { maxPoints: number; required: boolean }> = {
  businessLicense: { maxPoints: 10, required: true },
  contractorLicense: { maxPoints: 15, required: true },
  generalLiability: { maxPoints: 20, required: true },
  workersCompensation: { maxPoints: 18, required: true },
  professionalLiability: { maxPoints: 12, required: false },
  safetyManual: { maxPoints: 10, required: true },
  osha300Forms: { maxPoints: 8, required: true },
  insuranceLetter: { maxPoints: 7, required: true },
  w9Form: { maxPoints: 5, required: true },
  financialStatements: { maxPoints: 15, required: true },
  coiCertificate: { maxPoints: 10, required: true },
  bondingLetter: { maxPoints: 8, required: false },
  additionalEndorsement: { maxPoints: 5, required: false },
};

export const WorkingFileAnalysisService = {
  documentScoring,

  async analyzeFile(file: File, documentType: string, onProgress?: (ev: any)=>void) {
    const analysis: any = {
      fileName: file.name,
      fileSize: file.size,
      documentType,
      timestamp: new Date(),
      isValid: true,
      points: 0,
      maxPoints: documentScoring[documentType]?.maxPoints || 10,
      confidence: 0.8,
      issues: [] as string[],
      recommendations: [] as string[],
      extractedData: {},
      validationDetails: {},
      ocrResults: null as any,
      coiAnalysis: null as any,
    };

    const ext = file.name.split(".").pop()?.toLowerCase();
    const valid = ["pdf","jpg","jpeg","png","doc","docx"];
    if (!ext || !valid.includes(ext)) {
      analysis.issues.push(`Unsupported file format: ${String(ext).toUpperCase()}`);
      analysis.isValid = false; analysis.confidence = 0.1;
      return analysis;
    }

    try {
      const isInsurance = ["generalLiability","workersCompensation","professionalLiability","coiCertificate"].includes(documentType);

      if (isInsurance) {
        const coi = await OCRService.processCOI(file, onProgress);
        if (coi.success) {
          analysis.coiAnalysis = coi;
          analysis.ocrResults = { success: true, text: coi.rawText, confidence: coi.confidence };
          analysis.extractedData = coi.extractedFields;
          analysis.confidence = coi.confidence;
          analysis.points = Math.round(analysis.maxPoints * Math.min(coi.confidence, 0.9));

          if (coi.validationResults.criticalIssues.length === 0) {
            analysis.recommendations.push("✅ Certificate of Insurance analyzed");
            analysis.recommendations.push(...coi.validationResults.recommendations.slice(0, 3));
          } else {
            analysis.issues.push(...coi.validationResults.criticalIssues);
          }
          if (coi.validationResults.warnings.length) {
            analysis.recommendations.push(...coi.validationResults.warnings);
          }
        } else {
          analysis.issues.push("COI analysis failed: " + coi.error);
          analysis.confidence = 0.4;
          analysis.points = Math.round(analysis.maxPoints * 0.3);
        }
      } else {
        const res = await OCRService.processDocument(file, documentType, onProgress);
        if ((res as any).success) {
          analysis.ocrResults = { success: true, text: (res as any).rawText, confidence: (res as any).confidence };
          analysis.extractedData = (res as any).extractedFields;
          analysis.confidence = (res as any).confidence;
          analysis.points = Math.round(analysis.maxPoints * Math.min((res as any).confidence, 0.8));
          analysis.recommendations.push("Document processed successfully");
          analysis.recommendations.push(...(res as any).validationResults.recommendations);
        } else {
          analysis.issues.push("Document analysis failed: " + (res as any).error);
          analysis.confidence = 0.3;
          analysis.points = Math.round(analysis.maxPoints * 0.2);
        }
      }
    } catch (e) {
      analysis.issues.push("Error during document analysis");
      analysis.confidence = 0.3;
      analysis.points = Math.round(analysis.maxPoints * 0.2);
    }

    if (analysis.issues.length >= 3) analysis.isValid = false;
    return analysis;
  },

  getValidationSummary(analysis: any) {
    return {
      status: analysis.isValid ? "valid" : "invalid",
      statusText: analysis.isValid ? "Document Validated" : "Issues Found",
      confidenceText: `${Math.round((analysis.confidence || 0) * 100)}% confidence`,
      pointsText: `${analysis.points}/${analysis.maxPoints} points`,
      color: analysis.isValid ? "green" : analysis.confidence > 0.3 ? "yellow" : "red",
      hasOCR: !!analysis.ocrResults,
      hasCOI: !!analysis.coiAnalysis,
    };
  },
};
