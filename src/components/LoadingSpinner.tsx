"use client";
import { Loader2 } from "lucide-react";

export default function LoadingSpinner({
  size = "md",
  text = "",
  className = "",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  className?: string;
}) {
  const sizes: Record<string, string> = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8", xl: "w-12 h-12" };
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-3">
        <Loader2 className={`${sizes[size]} animate-spin`} style={{ color: "var(--tg-primary-600)" }} />
        {text ? <p className="text-sm font-medium text-gray-600">{text}</p> : null}
      </div>
    </div>
  );
}
