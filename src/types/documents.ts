export type PolicyPeriod = { effective: string; expiration: string; };
export type Coverage = {
  type: string;
  policyNumber: string;
  insurer: string;
  limits: Record<string, number | null>;
  policyPeriod: PolicyPeriod;
};

export type COIData = {
  certificateNumber: string;
  issueDate: string;
  insuredName: string;
  insuredAddress: string;
  producer: string;
  coverages: {
    generalLiability: Coverage;
    automobileLiability: Coverage;
    workersCompensation: Coverage;
    [k: string]: Coverage;
  };
  additionalInsured: boolean;
  waiveSubrogation: boolean;
  certificateHolder: string;
};

export type ValidationResult = {
  isValid: boolean;
  criticalIssues: string[];
  warnings: string[];
  recommendations: string[];
};

export type RiskAssessment = {
  overallRisk: "Low"|"Medium"|"High"|"Critical";
  riskScore: number;
  strengths: string[];
  concerns: string[];
  riskFactors?: string[];
};

export type COIAnalysisResult = {
  success: boolean;
  confidence: number;
  rawText: string;
  coiData: COIData;
  extractedFields: Record<string, any>;
  validationResults: ValidationResult;
  riskAssessment: RiskAssessment;
  processingMethod: string;
  error?: string;
};
