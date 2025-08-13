"use client";

export default function TweetgarotLogo({ size = "md", isHeader = false }: { size?: "sm"|"md"|"lg"|"xl"|"full"; isHeader?: boolean; }) {
  const sizes: any = {
    sm: { height: "32px", fontSize: isHeader ? "12px" : "18px" },
    md: { height: isHeader ? "56px" : "48px", fontSize: isHeader ? "14px" : "24px" },
    lg: { height: "64px", fontSize: "28px" },
    xl: { height: "80px", fontSize: "32px" },
    full: { height: "128px", fontSize: "40px" }
  };
  const style = sizes[size];
  return (
    <div className={`${isHeader ? "items-center justify-start" : "flex-col items-center justify-center"} flex`} style={{ height: style.height }}>
      <div style={{
        color: "var(--tg-primary-600)", fontWeight: "bold", fontSize: style.fontSize, lineHeight: 1.2, letterSpacing: "0.5px",
        fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif"
      }}>
        <div style={{ marginBottom: isHeader ? 0 : 4 }}>TWEET/GAROT</div>
        <div style={{ fontSize: `calc(${style.fontSize} * 0.75)`, fontWeight: 600, marginTop: isHeader ? -2 : 0, opacity: 0.9 }}>
          MECHANICAL
        </div>
      </div>
    </div>
  );
}
