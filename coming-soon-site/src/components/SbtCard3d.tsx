"use client";
import { useRef, useState } from "react";

interface Props { score: number }

export default function SbtCard3d({ score }: Props) {
  const cardRef  = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const [rx, setRx] = useState(0);
  const [ry, setRy] = useState(0);
  const [sc, setSc] = useState(1);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    const sh = shineRef.current;
    if (!el || !sh) return;
    const r = el.getBoundingClientRect();
    setRx((r.top + r.height / 2 - e.clientY) / 9);
    setRy((e.clientX - r.left - r.width / 2) / 11);
    setSc(1.04);
    sh.style.backgroundPosition = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
  };

  const onLeave = () => {
    setRx(0); setRy(0); setSc(1);
    if (shineRef.current) shineRef.current.style.backgroundPosition = "50% 50%";
  };

  let txt   = "STEADY / SOLID";
  let clr   = "#3D6FFF";
  let glow  = "rgba(61,111,255,0.22)";
  let bdr   = "rgba(61,111,255,0.3)";
  let numGlow = "rgba(61,111,255,0.35)";

  if (score <= 450) {
    txt = "UNDERPERFORM"; clr = "#f97316"; glow = "rgba(249,115,22,0.18)"; bdr = "rgba(249,115,22,0.3)"; numGlow = "rgba(249,115,22,0.3)";
  } else if (score >= 750) {
    txt = "ELITE / HIGH"; clr = "#059669"; glow = "rgba(5,150,105,0.2)"; bdr = "rgba(5,150,105,0.35)"; numGlow = "rgba(5,150,105,0.35)";
  }

  return (
    <div style={{ perspective: 1100, width: "100%", maxWidth: 280 }}>
      <div
        ref={cardRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${rx}deg) rotateY(${ry}deg) scale3d(${sc},${sc},${sc})`,
          transition: "transform 0.15s ease-out, box-shadow 0.15s ease-out",
          position: "relative",
          overflow: "hidden",
          width: "100%",
          height: 172,
          borderRadius: 20,
          border: `1px solid ${bdr}`,
          padding: "22px 22px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          cursor: "default",
          userSelect: "none",
          boxSizing: "border-box",
          background: "linear-gradient(145deg,#111827 0%,#0c0a1a 100%)",
          boxShadow: `0 0 0 1px ${bdr}, 0 16px 40px ${glow}, 0 4px 12px rgba(0,0,0,0.3)`,
        }}
      >
        {/* Shine */}
        <div ref={shineRef} style={{
          position:"absolute", inset:0, pointerEvents:"none", zIndex:2,
          background:"linear-gradient(125deg,transparent 30%,rgba(150,180,255,0.18) 46%,rgba(255,255,255,0.28) 50%,rgba(150,180,255,0.18) 54%,transparent 70%)",
          backgroundSize:"300% 300%", backgroundPosition:"50% 50%",
          transition:"background-position 0.12s ease-out",
        }} />

        {/* Top row */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", transform:"translateZ(28px)", transformStyle:"preserve-3d", position:"relative", zIndex:3 }}>
          <div>
            <div style={{ fontFamily:"var(--font-tech)", fontSize:7, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.18em", lineHeight:1 }}>Reputation Certificate</div>
            <div style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:14, color:"#fff", letterSpacing:"-0.02em", marginTop:3 }}>SOVA PROTOCOL</div>
          </div>
          <div style={{ width:26, height:20, borderRadius:4, background:"linear-gradient(135deg,#fbbf24,#d97706)", flexShrink:0, display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"4px 4px" }}>
            <div style={{ height:1, background:"rgba(0,0,0,0.18)" }} />
            <div style={{ height:1, background:"rgba(0,0,0,0.18)" }} />
          </div>
        </div>

        {/* Score */}
        <div style={{ transform:"translateZ(50px)", transformStyle:"preserve-3d", position:"relative", zIndex:3 }}>
          <div style={{ fontFamily:"var(--font-tech)", fontSize:7, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.18em", lineHeight:1 }}>SoulScore</div>
          <div style={{ fontFamily:"var(--font-tech)", fontWeight:700, fontSize:36, color:"#fff", lineHeight:1, marginTop:2, display:"flex", alignItems:"baseline", gap:4, textShadow:`0 0 20px ${numGlow}, 0 0 40px ${numGlow}` }}>
            {score}
            <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)", fontWeight:400 }}>/ 1000</span>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", transform:"translateZ(32px)", transformStyle:"preserve-3d", position:"relative", zIndex:3 }}>
          <div>
            <div style={{ fontFamily:"var(--font-tech)", fontSize:7, color:"rgba(255,255,255,0.3)", marginBottom:2 }}>SOUL_ID</div>
            <div style={{ fontFamily:"var(--font-tech)", fontSize:9, color:"rgba(255,255,255,0.7)", fontWeight:500 }}>WB_SOUL_#4920</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:"var(--font-tech)", fontSize:7, color:"rgba(255,255,255,0.3)", marginBottom:2 }}>STATUS</div>
            <div style={{ fontFamily:"var(--font-tech)", fontSize:9, fontWeight:700, color:clr, letterSpacing:"0.08em" }}>{txt}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
