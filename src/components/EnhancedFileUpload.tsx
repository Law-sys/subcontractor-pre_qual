"use client";

import { useRef, useState } from "react";
import { Upload, FileText, Image as ImageIcon, Shield, Brain, XCircle, Award } from "lucide-react";
import { WorkingFileAnalysisService } from "@/lib/analysis/WorkingFileAnalysisService";
import COIAnalysisDisplay from "./COIAnalysisDisplay";

type Props = {
  label: string;
  value: File[];
  onChange: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  required?: boolean;
  help?: string;
  maxSize?: number;
  maxFiles?: number;
  documentType?: string;
};

const formatFileSize = (bytes: number) => {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const iconFor = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return <FileText className="w-6 h-6 text-red-500" />;
  if (ext === "doc" || ext === "docx") return <FileText className="w-6 h-6 text-blue-500" />;
  if (["jpg", "jpeg", "png"].includes(ext || "")) return <ImageIcon className="w-6 h-6 text-green-500" />;
  return <FileText className="w-6 h-6 text-gray-500" />;
};

export default function EnhancedFileUpload({
  label, value = [], onChange, accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx",
  multiple = true, required = false, help = "", maxSize = 10 * 1024 * 1024, maxFiles = 5,
  documentType = "general",
}: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [fileAnalysis, setFileAnalysis] = useState<Record<string, any>>({});
  const [analyzing, setAnalyzing] = useState<Set<string>>(new Set());
  const [ocrStage, setOcrStage] = useState<Record<string, { status: string; progress: number; stage: string }>>({});
  const pickRef = useRef<HTMLInputElement>(null);

  const validate = (files: FileList) => {
    const errs: string[] = [];
    const ok: File[] = [];
    const allowed = accept.split(",").map((t) => t.trim().toLowerCase());

    Array.from(files).forEach((file) => {
      if (file.size > maxSize) errs.push(`${file.name} is too large. Max ${formatFileSize(maxSize)}`);
      const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
      if (!allowed.includes(ext)) errs.push(`${file.name} is not an allowed file type`);
      if (errs.length === 0) ok.push(file);
    });

    if (value.length + ok.length > maxFiles) errs.push(`Maximum ${maxFiles} files allowed`);
    return { ok, errs };
  };

  const handleFiles = async (files: FileList) => {
    const { ok, errs } = validate(files);
    setErrors(errs);
    if (!ok.length) return;

    onChange([...value, ...ok]);

    ok.forEach(async (file, i) => {
      const id = `${file.name}-${Date.now()}-${i}`;
      setUploadProgress((p) => ({ ...p, [id]: 0 }));
      setAnalyzing((s) => new Set([...Array.from(s), id]));

      // Fake upload progress
      let p = 0;
      const int = setInterval(() => {
        p += Math.random() * 25;
        if (p >= 100) {
          clearInterval(int);
          setTimeout(() => setUploadProgress((prev) => {
            const copy = { ...prev }; delete copy[id]; return copy;
          }), 400);
        }
        setUploadProgress((prev) => ({ ...prev, [id]: Math.min(100, p) }));
      }, 200);

      // Start REAL analysis
      setTimeout(async () => {
        try {
          const onProgress = (pr: any) => setOcrStage((st) => ({ ...st, [id]: pr }));
          const analysis = await WorkingFileAnalysisService.analyzeFile(file, documentType, onProgress);
          setFileAnalysis((fa) => ({ ...fa, [id]: analysis }));
          setOcrStage((st) => { const c = { ...st }; delete c[id]; return c; });
        } catch (e: any) {
          setFileAnalysis((fa) => ({
            ...fa,
            [id]: { error: "Analysis failed: " + (e?.message || "Unknown"), isValid: false, points: 0, fileName: file.name, fileSize: file.size, issues: ["Analysis failed"], recommendations: [] }
          }));
        } finally {
          setAnalyzing((s) => { const n = new Set(s); n.delete(id); return n; });
        }
      }, 800 + Math.random() * 500);
    });
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-semibold text-gray-700">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {Object.keys(fileAnalysis).length > 0 && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              <Award className="w-4 h-4 mr-1" /> Analysis
            </div>
            <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              <Brain className="w-4 h-4 mr-1" /> Real OCR
            </div>
          </div>
        )}
      </div>

      {/* Drop zone */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
          dragOver ? "border-blue-400 bg-blue-50 scale-[1.01]" : "border-gray-300 hover:border-blue-300 hover:bg-gray-50"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files) handleFiles(e.dataTransfer.files); }}
      >
        <input ref={pickRef} type="file" multiple={multiple} accept={accept}
               onChange={(e) => e.target.files && handleFiles(e.target.files)} className="hidden" />
        <div className="flex flex-col items-center">
          <div className={`p-4 rounded-full mb-4 ${dragOver ? "bg-blue-100" : "bg-gray-100"}`}>
            <Upload className={`w-8 h-8 ${dragOver ? "text-blue-600" : "text-gray-500"}`} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {dragOver ? "Drop files here" : "Drag & drop files here"}
          </h3>
          <p className="text-gray-600 mb-3">
            or{" "}
            <button type="button" onClick={() => pickRef.current?.click()} className="text-blue-600 hover:text-blue-700 font-medium underline">
              browse to upload
            </button>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500">
            <span>Supports: {accept.replace(/\./g, "").toUpperCase()}</span><span>•</span>
            <span>Max {formatFileSize(maxSize)} per file</span><span>•</span>
            <span>Up to {maxFiles} files</span><span>•</span>
            <span className="text-green-600 font-medium">🚀 REAL OCR</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="mt-4 space-y-2">
          {Object.entries(uploadProgress).map(([id, prog]) => {
            const fileName = id.split("-")[0];
            const stage = ocrStage[id];
            const isInsuranceDoc = ["generalLiability","workersCompensation","professionalLiability","coiCertificate"].includes(documentType);
            return (
              <div key={id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700">{fileName}</span>
                    <div className="ml-2 flex items-center text-blue-600">
                      {stage?.stage ? (
                        <>
                          {isInsuranceDoc ? <Shield className="w-4 h-4 mr-1 animate-pulse" /> : <Brain className="w-4 h-4 mr-1 animate-pulse" />}
                          <span className="text-xs">{stage.stage}</span>
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 mr-1 animate-pulse" />
                          <span className="text-xs">OCR processing…</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{Math.round(prog)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all duration-300 ${isInsuranceDoc ? "bg-gradient-to-r from-purple-500 to-green-500" : "bg-gradient-to-r from-blue-500 to-green-500"}`}
                       style={{ width: `${prog}%` }}/>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mt-4 space-y-2">
          {errors.map((e, i) => (
            <div key={i} className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <XCircle className="w-5 h-5 text-red-500 mr-3" /> {e}
            </div>
          ))}
        </div>
      )}

      {/* Files list + analysis */}
      {value.length > 0 && (
        <div className="mt-6 space-y-4">
          {value.map((file, idx) => {
            const entry = Object.values(fileAnalysis).find((a: any) => a?.fileName === file.name && a?.fileSize === file.size) as any;
            const isAnalyzing = Object.keys(ocrStage).some((k) => k.includes(file.name));
            const remove = () => onChange(value.filter((_, i) => i !== idx));
            return (
              <div key={`${file.name}-${idx}`} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start flex-1">
                      <div className="mr-3 mt-1">{iconFor(file.name)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500 mb-2">{formatFileSize(file.size)}</p>
                        {isAnalyzing && (
                          <div className="flex items-center text-blue-600 mb-2">
                            <Brain className="w-4 h-4 mr-2 animate-pulse" />
                            <span className="text-sm">OCR analysis in progress…</span>
                          </div>
                        )}
                        {entry && !isAnalyzing && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap text-xs">
                              <span className={`px-2 py-1 rounded-full ${entry.isValid ? "bg-green-100 text-green-800" : entry.confidence > 0.3 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
                                {entry.isValid ? "Document Validated" : "Issues Found"}
                              </span>
                              <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800">Confidence {Math.round((entry.confidence || 0) * 100)}%</span>
                              {entry.coiAnalysis && <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-800">COI</span>}
                              {entry.ocrResults && <span className="px-2 py-1 rounded-full bg-green-100 text-green-800">OCR</span>}
                            </div>
                            {entry.coiAnalysis?.success && (
                              <div className="border-t border-gray-100 mt-2">
                                <COIAnalysisDisplay analysis={entry.coiAnalysis} className="p-2" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <button type="button" onClick={remove} className="text-red-500 hover:text-red-700 p-1 rounded">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {help && <p className="text-xs mt-2 text-gray-500">{help}</p>}
    </div>
  );
}
