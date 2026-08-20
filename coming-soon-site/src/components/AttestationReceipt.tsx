"use client";
import { useRef, useState } from "react";

interface Props {
  score: number;
  /** If true: auto-floating animation, no hover tilt (for hero preview) */
  isHeroPreview?: boolean;
}

export default function AttestationReceipt({ score, isHeroPreview = false }: Props) {
  const cardRef  = useRef<HTMLDivElement>(null);
  const [rx, setRx] = useState(0);
  const [ry, setRy] = useState(0);
  const [sc, setSc] = useState(1);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isHeroPreview) return;
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRx((r.top + r.height / 2 - e.clientY) / 9);
    setRy((e.clientX - r.left - r.width / 2) / 11);
    setSc(1.035);
  };
  const onLeave = () => { if (isHeroPreview) return; setRx(0); setRy(0); setSc(1); };

  /* ── Status theming ── */
  let statusText  = "STEADY / SOLID";
  let accentColor = "#3D6FFF";
  let glowRgba    = "rgba(61,111,255,0.28)";
  let borderRgba  = "rgba(61,111,255,0.22)";
  const grade     = score >= 750 ? "A+" : score >= 600 ? "B+" : score >= 450 ? "C" : "D";

  if (score <= 450) {
    statusText = "UNDERPERFORM"; accentColor = "#f97316";
    glowRgba = "rgba(249,115,22,0.22)"; borderRgba = "rgba(249,115,22,0.22)";
  } else if (score >= 750) {
    statusText = "ELITE / HIGH"; accentColor = "#10b981";
    glowRgba = "rgba(16,185,129,0.25)"; borderRgba = "rgba(16,185,129,0.28)";
  }

  const wrapStyle: React.CSSProperties = isHeroPreview
    ? { perspective: 1000 }
    : { perspective: 1000, width: "100%", maxWidth: 300, margin: "0 auto" };

  const innerStyle: React.CSSProperties = {
    transformStyle: "preserve-3d",
    transform: isHeroPreview
      ? undefined /* controlled by CSS class */
      : `rotateX(${rx}deg) rotateY(${ry}deg) scale3d(${sc},${sc},${sc})`,
    transition: isHeroPreview ? undefined : "transform 0.15s ease-out",
    background: "#0B0A14",
    border: `1px solid ${borderRgba}`,
    borderRadius: 16,
    padding: "26px 24px 22px",
    fontFamily: "var(--font-mono)",
    cursor: isHeroPreview ? "default" : "crosshair",
    userSelect: "none",
    boxSizing: "border-box" as const,
    position: "relative" as const,
    overflow: "hidden" as const,
    boxShadow: `0 0 0 1px ${borderRgba}, 0 24px 60px ${glowRgba}, 0 4px 16px rgba(0,0,0,0.35)`,
  };

  const ROW = (key: string, val: string, valColor: string, valSize = 11, bold = false) => (
    <div key={key} style={{ display:"grid", gridTemplateColumns:"80px 1fr", gap:10, alignItems:"baseline" }}>
      <span style={{ fontSize:9, color:"rgba(255,255,255,0.22)", letterSpacing:"0.1em", textTransform:"uppercase" }}>{key}</span>
      <span style={{ fontSize:valSize, fontWeight: bold ? 700 : 400, color:valColor, letterSpacing: bold ? "-0.01em" : "0.04em",
        textShadow: bold ? `0 0 14px ${accentColor}60, 0 0 30px ${accentColor}35` : "none" }}>
        {val}
      </span>
    </div>
  );

  const inner = (
    <div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={isHeroPreview ? "receipt-float" : ""}
      style={innerStyle}
    >
      {/* Inner glow */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", borderRadius:"inherit",
        background:`radial-gradient(ellipse 60% 40% at 20% 0%, ${glowRgba.replace("0.28","0.07")}, transparent 70%)` }} />

      {/* Header */}
      <div style={{ transform:"translateZ(10px)", transformStyle:"preserve-3d", marginBottom:18 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <span style={{ fontSize:9, color:"rgba(255,255,255,0.28)", letterSpacing:"0.22em", textTransform:"uppercase", fontFamily:"var(--font-mono)" }}>
            SOVA PROTOCOL
          </span>
          <span style={{ fontSize:9, color:accentColor, letterSpacing:"0.1em", opacity:0.8 }}>v0.1</span>
        </div>
        <div style={{ height:"1px", background:"rgba(255,255,255,0.08)" }} />
      </div>

      {/* Command prompt */}
      <div style={{ transform:"translateZ(8px)", transformStyle:"preserve-3d", marginBottom:18,
        fontSize:11, color:"rgba(255,255,255,0.32)", display:"flex", alignItems:"center", gap:6 }}>
        <span style={{ color:accentColor, fontSize:10 }}>▸</span>
        <span>query --soul WB_SOUL_#4920</span>
      </div>

      {/* Data rows */}
      <div style={{ transform:"translateZ(22px)", transformStyle:"preserve-3d",
        display:"flex", flexDirection:"column", gap:9, marginBottom:18 }}>
        {ROW("SOUL_ID", "WB_SOUL_#4920",   "rgba(255,255,255,0.65)")}
        {ROW("SCORE",   `${score}`,          "#FFFFFF",               24, true)}
        {ROW("GRADE",   grade,               accentColor)}
        {ROW("STATUS",  statusText,          accentColor)}
        {ROW("NETWORK", "WB Sepolia",        "rgba(255,255,255,0.4)")}
        {ROW("BLOCK",   "#19,847,293",       "rgba(255,255,255,0.3)")}
      </div>

      {/* Divider */}
      <div style={{ transform:"translateZ(14px)", transformStyle:"preserve-3d",
        height:"1px", background:"rgba(255,255,255,0.08)", marginBottom:14 }} />

      {/* Verified stamp */}
      <div style={{ transform:"translateZ(28px)", transformStyle:"preserve-3d",
        display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:10, color:"#10b981", letterSpacing:"0.12em", fontFamily:"var(--font-mono)" }}>
          ✓ ATTESTATION VERIFIED
        </span>
        <span className="cursor-blink" style={{ display:"inline-block", width:6, height:12, background:"#10b981", opacity:0.7, marginTop:1 }} />
      </div>
    </div>
  );

  return <div style={wrapStyle}>{inner}</div>;
}
