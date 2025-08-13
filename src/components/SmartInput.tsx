"use client";
import { CheckCircle } from "lucide-react";
import type { ComponentType } from "react";

type SmartInputProps = {
  label: string;
  type?: "text" | "email" | "number" | "date" | "textarea" | "select";
  value: any;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  validation?: (v: string) => boolean;
  help?: string;
  icon?: ComponentType<{ className?: string }>;
  options?: { value: string; label: string }[];
  disabled?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number | string;
};

export default function SmartInput({
  label, type = "text", value, onChange, placeholder,
  required = false, validation, help = "", icon: Icon, options = [],
  disabled = false, min, max, step,
}: SmartInputProps) {
  const isValid = !!value && (!validation || validation(String(value)));
  const base =
    "w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-0 transition-all duration-200";

  if (type === "select") {
    return (
      <div>
        <label className="block text-sm font-semibold mb-3 text-gray-700">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={`${base} ${isValid ? "border-green-300 focus:border-green-500" : "border-gray-300 hover:border-gray-400"} ${disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`}
          >
            <option value="">{placeholder || "Select…"}</option>
            {options.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
          </select>
          {isValid && <CheckCircle className="absolute right-4 top-4 w-5 h-5 text-green-500" />}
        </div>
        {help && <p className="text-xs mt-2 text-gray-500">{help}</p>}
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div>
        <label className="block text-sm font-semibold mb-3 text-gray-700">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          {Icon && <Icon className="absolute left-4 top-4 w-5 h-5 text-gray-400" />}
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            rows={4}
            className={`${base} ${Icon ? "pl-12" : ""} ${isValid ? "border-green-300 focus:border-green-500" : "border-gray-300 hover:border-gray-400"} ${disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`}
          />
          {isValid && <CheckCircle className="absolute right-4 top-4 w-5 h-5 text-green-500" />}
        </div>
        {help && <p className="text-xs mt-2 text-gray-500">{help}</p>}
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-semibold mb-3 text-gray-700">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-4 w-5 h-5 text-gray-400" />}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          min={min as any}
          max={max as any}
          step={step as any}
          className={`${base} ${Icon ? "pl-12" : ""} ${isValid ? "border-green-300 focus:border-green-500" : "border-gray-300 hover:border-gray-400"} ${disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`}
          required={required}
        />
        {isValid && <CheckCircle className="absolute right-4 top-4 w-5 h-5 text-green-500" />}
      </div>
      {help && <p className="text-xs mt-2 text-gray-500">{help}</p>}
    </div>
  );
}
