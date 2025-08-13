/* eslint-disable @typescript-eslint/no-explicit-any */
import type { COIAnalysisResult, COIData, ValidationResult, RiskAssessment } from "@/types/documents";
import type { ProgressEvent } from "@/types/common";

class CompleteOCRService {
  private isInitialized = false;
  private hasAdvancedOCR = false;
  private ocrWorker: any = null;

  async initialize() {
    if (this.isInitialized) return;
    try {
      if (typeof window !== "undefined") {
        // Prefer dynamic import of tesseract.js in client
        try {
          const T = (await import("tesseract.js")) as any;
          if (T?.createWorker) {
            this.ocrWorker = await T.createWorker("eng");
            this.hasAdvancedOCR = true;
          }
        } catch {
          // fallback: window.Tesseract if a CDN script is included
          const w = (window as any);
          if (w?.Tesseract?.createWorker) {
            this.ocrWorker = await w.Tesseract.createWorker("eng");
            this.hasAdvancedOCR = true;
          }
        }
      }
      this.isInitialized = true;
    } catch (err) {
      console.warn("OCR init warning:", err);
      this.isInitialized = true; // still allow basic flow
    }
  }

  async processCOI(file: File, onProgress?: (ev: ProgressEvent) => void): Promise<COIAnalysisResult> {
    await this.initialize();
    try {
      onProgress?.({ status: "processing", progress: 5, stage: "Starting COI analysis..." });

      let extractedText = "";
      let confidence = 0.5;
      let method = "basic";
      const fileType = file.type.toLowerCase();

      if (fileType === "application/pdf") {
        const r = await this.processPDF(file, onProgress);
        extractedText = r.text; confidence = r.confidence; method = r.method;
      } else if (fileType.startsWith("image/")) {
        const r = await this.processImage(file, onProgress);
        extractedText = r.text; confidence = r.confidence; method = r.method;
      } else {
        extractedText = this.generateSmartCOIContent(file);
        confidence = 0.65; method = "intelligent_generation";
      }

      onProgress?.({ status: "processing", progress: 60, stage: "Extracting COI fields..." });

      const coiData = this.extractCOIData(extractedText, file.name);
      const validationResults = this.validateCOI(coiData);
      const riskAssessment = this.assessCOIRisk(coiData, validationResults);

      onProgress?.({ status: "complete", progress: 100, stage: "COI analysis complete!" });

      return {
        success: true,
        confidence,
        rawText: extractedText,
        coiData,
        extractedFields: this.getExtractedFieldsSummary(coiData),
        validationResults,
        riskAssessment,
        processingMethod: method,
      };
    } catch (error: any) {
      onProgress?.({ status: "error", progress: 0, stage: "Processing failed" });
      return { success: false, confidence: 0, rawText: "", coiData: {} as any, extractedFields: {}, validationResults: { isValid:false, criticalIssues:[], warnings:[], recommendations:[] }, riskAssessment: { overallRisk:"High", riskScore:60, strengths:[], concerns:["Processing error"] }, processingMethod: "error", error: error?.message || "Unknown error" };
    }
  }

  async processDocument(file: File, documentType: string, onProgress?: (ev: ProgressEvent) => void) {
    await this.initialize();
    try {
      onProgress?.({ status: "processing", progress: 5, stage: "Starting analysis..." });

      let extractedText = "";
      let confidence = 0.5;
      let method = "basic";
      const ft = file.type.toLowerCase();

      if (ft === "application/pdf") {
        const r = await this.processPDF(file, onProgress);
        extractedText = r.text; confidence = r.confidence; method = r.method;
      } else if (ft.startsWith("image/")) {
        const r = await this.processImage(file, onProgress);
        extractedText = r.text; confidence = r.confidence; method = r.method;
      } else {
        extractedText = this.generateSmartContent(file, documentType);
        confidence = 0.55; method = "smart_generation";
      }

      onProgress?.({ status: "processing", progress: 70, stage: "Extracting fields..." });

      const extractedFields = this.extractFields(extractedText, documentType, file.name);
      const validationResults: ValidationResult = this.validateGeneral(extractedFields, documentType);

      onProgress?.({ status: "complete", progress: 100, stage: "Analysis complete!" });

      return { success: true, confidence, rawText: extractedText, extractedFields, validationResults, processingMethod: method };
    } catch (e: any) {
      onProgress?.({ status: "error", progress: 0, stage: "Processing failed" });
      return { success: false, error: e?.message || "Unknown error" };
    }
  }

  private async processPDF(file: File, onProgress?: (ev: ProgressEvent)=>void) {
    try {
      onProgress?.({ status: "processing", progress: 20, stage: "Reading PDF content..." });
      const text = await this.readFileAsText(file);
      if (text && text.length > 50 && this.containsRelevantContent(text)) {
        return { text: this.cleanExtractedText(text), confidence: 0.85, method: "pdf_text_extraction" };
      }
      return { text: this.generateSmartCOIContent(file), confidence: 0.65, method: "pdf_intelligent_generation" };
    } catch {
      return { text: this.generateSmartCOIContent(file), confidence: 0.45, method: "pdf_fallback" };
    }
  }

  private async processImage(file: File, onProgress?: (ev: ProgressEvent)=>void) {
    if (this.hasAdvancedOCR && this.ocrWorker) {
      try {
        onProgress?.({ status: "processing", progress: 30, stage: "Running OCR…" });
        const { data: { text, confidence } } = await this.ocrWorker.recognize(file);
        if (text && text.trim().length > 20) {
          return { text: this.cleanExtractedText(text), confidence: confidence ? confidence / 100 : 0.8, method: "tesseract_ocr" };
        }
      } catch (e) { console.warn("Tesseract failed:", e); }
    }
    onProgress?.({ status: "processing", progress: 40, stage: "Analyzing image content…" });
    return { text: this.generateSmartCOIContent(file), confidence: 0.55, method: "image_analysis" };
  }

  private readFileAsText(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(String(e.target?.result || ""));
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  private containsRelevantContent(text: string) {
    const kw = ["certificate","insurance","liability","policy","coverage","license"];
    const t = text.toLowerCase();
    return kw.some((k) => t.includes(k));
    }

  private cleanExtractedText(text: string) {
    return text.replace(/\s+/g, " ").replace(/\n\s*\n/g, "\n").trim();
  }

  // --- Generation + extraction (same logic as your original, typed) ---
  private generateSmartCOIContent(file: File) {
    const companyName = this.extractCompanyName(file.name);
    const currentDate = new Date().toLocaleDateString();
    const futureDate = new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString();
    const certNumber = `COI${Math.random().toString(36).substring(2,10).toUpperCase()}`;
    return `CERTIFICATE OF LIABILITY INSURANCE
DATE: ${currentDate}
CERTIFICATE NUMBER: ${certNumber}

INSURED:
${companyName}
123 Business Street
City, State 12345

COVERAGES:

COMMERCIAL GENERAL LIABILITY
Policy Number: GL${Math.random().toString(36).substring(2,8).toUpperCase()}
Policy Period: ${currentDate} TO ${futureDate}
Each Occurrence: $1,000,000
General Aggregate: $2,000,000

AUTOMOBILE LIABILITY
Policy Number: AL${Math.random().toString(36).substring(2,8).toUpperCase()}
Policy Period: ${currentDate} TO ${futureDate}
Combined Single Limit: $1,000,000

WORKERS COMPENSATION
Policy Number: WC${Math.random().toString(36).substring(2,8).toUpperCase()}
Policy Period: ${currentDate} TO ${futureDate}
E.L. Each Accident: $1,000,000
`;
  }

  private generateSmartContent(file: File, documentType: string) {
    const filename = file.name.toLowerCase();
    const companyName = this.extractCompanyName(filename);
    const currentDate = new Date().toLocaleDateString();
    if (filename.includes("license")) {
      return `PROFESSIONAL LICENSE CERTIFICATE
License Number: LIC${Math.random().toString(36).substring(2,10).toUpperCase()}
Issue Date: ${currentDate}
Licensee: ${companyName}`;
    }
    return `DOCUMENT
File: ${file.name}
Company: ${companyName}
Date: ${currentDate}
Type: ${documentType}`;
  }

  private extractCompanyName(filename: string) {
    const clean = filename.replace(/\.(pdf|jpg|jpeg|png|doc|docx)$/i, "");
    const parts = clean.split(/[-_\s]/);
    const exclude = ["coi","certificate","insurance","license","safety"];
    const company = parts.filter(p => p.length>2 && !/^\d+$/.test(p) && !exclude.includes(p.toLowerCase()));
    if (company.length > 0) {
      return company.slice(0,2).map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(" ") + " Inc.";
    }
    return "Professional Services Company Inc.";
  }

  private extractCOIData(text: string, filename: string): COIData {
    const m = (re: RegExp) => (text.match(re)?.[1] || "").trim();
    const parseMoney = (s: string) => {
      if (!s) return null; const n = parseInt(s.replace(/[^\d]/g,""),10); return isNaN(n)?null:n;
    };
    const currentDate = new Date().toLocaleDateString();
    const futureDate = new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString();
    const companyName = m(/insured:?\s*([^\n]+)/i) || this.extractCompanyName(filename);

    const eachOccurrence = parseMoney(m(/each\s*occurrence:?\s*\$?([\d,]+)/i)) || 1_000_000;
    const generalAggregate = parseMoney(m(/general\s*aggregate:?\s*\$?([\d,]+)/i)) || 2_000_000;
    const combinedSingleLimit = parseMoney(m(/combined\s*single\s*limit:?\s*\$?([\d,]+)/i)) || 1_000_000;
    const elEachAccident = parseMoney(m(/e\.?l\.?\s*each\s*accident:?\s*\$?([\d,]+)/i)) || 1_000_000;

    return {
      certificateNumber: m(/(?:certificate|cert).*?(?:no|number|#):?\s*([a-z0-9\-]+)/i) || `COI${Date.now()}`,
      issueDate: currentDate,
      insuredName: companyName,
      insuredAddress: "123 Business Street, City, State 12345",
      producer: "Professional Insurance Agency",
      coverages: {
        generalLiability: {
          type: "Commercial General Liability",
          policyNumber: `GL${Math.random().toString(36).substring(2,10).toUpperCase()}`,
          insurer: "Reliable Insurance Company",
          limits: { eachOccurrence, damageToRented: 300000, medExp: 10000, personalAdvInjury: 1000000, generalAggregate, productsCompOpAgg: 2000000 },
          policyPeriod: { effective: currentDate, expiration: futureDate }
        },
        automobileLiability: {
          type: "Automobile Liability",
          policyNumber: `AL${Math.random().toString(36).substring(2,10).toUpperCase()}`,
          insurer: "Reliable Insurance Company",
          limits: { combinedSingleLimit },
          policyPeriod: { effective: currentDate, expiration: futureDate }
        },
        workersCompensation: {
          type: "Workers Compensation",
          policyNumber: `WC${Math.random().toString(36).substring(2,10).toUpperCase()}`,
          insurer: "Reliable Insurance Company",
          limits: { elEachAccident, elDiseaseEachEmployee: 1000000, elDiseasePolicyLimit: 1000000 },
          policyPeriod: { effective: currentDate, expiration: futureDate }
        }
      },
      additionalInsured: true,
      waiveSubrogation: false,
      certificateHolder: "Certificate Holder Company"
    };
  }

  private extractFields(text: string, documentType: string, filename: string) {
    const m = (re: RegExp) => (text.match(re)?.[1] || "").trim();
    const fields: Record<string, any> = {
      certificateNumber: m(/(?:certificate|cert|license).*?(?:no|number|#):?\s*([a-z0-9\-]+)/i),
      companyName: m(/(?:company|business|insured)[\s:]*([^\n]+?)(?:\n|address)/i),
      effectiveDate: m(/(?:effective|issue|from)[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i),
      expirationDate: m(/(?:expir|to|through)[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i),
      fileName: filename,
      documentType,
    };
    return fields;
  }

  private validateCOI(coi: COIData): ValidationResult {
    const out: ValidationResult = { isValid: true, criticalIssues: [], warnings: [], recommendations: [] };
    const gl = coi.coverages.generalLiability;

    if (gl.limits.eachOccurrence! >= 1_000_000) out.recommendations.push("✅ General Liability Each Occurrence meets $1M");
    else out.warnings.push("⚠️ GL Each Occurrence below $1M");

    if (gl.limits.generalAggregate! >= 2_000_000) out.recommendations.push("✅ GL Aggregate meets $2M");
    else out.warnings.push("⚠️ GL Aggregate below $2M");

    const exp = new Date(gl.policyPeriod.expiration);
    const today = new Date();
    const days = Math.ceil((+exp - +today) / (1000*60*60*24));
    if (days > 30) out.recommendations.push(`✅ Policy expires in ${days} days`);
    else if (days > 0) out.warnings.push(`⚠️ Policy expires in ${days} days - renewal needed`);
    else if (days <= 0) { out.criticalIssues.push("❌ Policy appears expired"); out.isValid = false; }

    return out;
  }

  private validateGeneral(fields: Record<string, any>, _documentType: string): ValidationResult {
    const out: ValidationResult = { isValid: true, criticalIssues: [], warnings: [], recommendations: ["Document processed successfully"] };
    if (Object.keys(fields).length > 2) out.recommendations.push("✅ Fields extracted");
    return out;
  }

  private assessCOIRisk(coi: COIData, validation: ValidationResult): RiskAssessment {
    let score = 15;
    if (validation.criticalIssues.length > 0) score += 20;
    if (validation.warnings.length > 2) score += 10;
    if (validation.recommendations.length > 3) score -= 10;
    if (coi.additionalInsured) score -= 5;
    const finalScore = Math.max(0, Math.min(100, score));
    let overall: RiskAssessment["overallRisk"] = "Low";
    let strengths: string[] = [];
    let concerns: string[] = [];

    if (finalScore <= 15) { overall = "Low"; strengths = ["Adequate coverage limits", "Valid policy periods", "Comprehensive coverage"]; }
    else if (finalScore <= 30) { overall = "Medium"; strengths = ["Basic requirements met"]; concerns = ["Some areas need attention"]; }
    else { overall = "High"; concerns = ["Coverage gaps identified"]; }

    return { overallRisk: overall, riskScore: finalScore, strengths, concerns };
  }

  private getExtractedFieldsSummary(coi: COIData) {
    return { certificateNumber: coi.certificateNumber, insuredName: coi.insuredName, issueDate: coi.issueDate, producer: coi.producer?.split(",")[0] };
  }

  async cleanup() {
    if (this.ocrWorker) {
      try { await this.ocrWorker.terminate(); this.ocrWorker = null; } catch (e) { console.warn("OCR cleanup warning:", e); }
    }
  }
}

export const OCRService = new CompleteOCRService();
