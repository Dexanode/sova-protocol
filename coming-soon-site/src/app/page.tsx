"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import AttestationReceipt from "../components/AttestationReceipt";
import SpotlightCard from "../components/SpotlightCard";

const ParticleBg = dynamic(() => import("../components/ParticleBg"), { ssr: false });

/* ── Design tokens ── */
const BLUE    = "#3D6FFF";
const TXT     = "#0A0A0A";
const TXT2    = "#6B7280";
const TXT3    = "#9CA3AF";
const BORDER  = "1px solid rgba(0,0,0,0.08)";
const CARD    = "#F7F7F8";
const CARD_B  = "1px solid rgba(61,111,255,0.2)";

/* ── Inline SVG icons ── */
const IconSoul = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);
const IconAnalyze = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
const IconAttest = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);
const ArrowRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

export default function Home() {
  const [wbt,     setWbt]     = useState(300);
  const [weeks,   setWeeks]   = useState(24);
  const [age,     setAge]     = useState(12);
  const [email,   setEmail]   = useState("");
  const [msg,     setMsg]     = useState("");
  const [msgOk,   setMsgOk]   = useState(false);
  const [busy,    setBusy]    = useState(false);

  const score = Math.min(1000, Math.round(
    100 + Math.min(350, (wbt / 1000) * 350) + Math.min(350, weeks * 14.5) + Math.min(200, age * 16.5)
  ));

  const track = (v: number, mn: number, mx: number) => {
    const p = ((v - mn) / (mx - mn)) * 100;
    return `linear-gradient(to right, ${BLUE} 0%, ${BLUE} ${p}%, #E5E7EB ${p}%, #E5E7EB 100%)`;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim();
    if (!v || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setMsg("Please enter a valid email address."); setMsgOk(false); return;
    }
    setBusy(true); setMsg("");
    setTimeout(() => {
      setBusy(false); setEmail("");
      setMsg("You're in. We'll notify you when SOVA goes live on Whitechain Mainnet.");
      setMsgOk(true);
    }, 900);
  };

  return (
    <div style={{ background: "#fff", minHeight: "100vh", overflowX: "hidden" }}>

      {/* Ambient Glow */}
      <div style={{ position: "fixed", top: -250, left: -200, width: 800, height: 800, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(61,111,255,0.055) 0%, transparent 65%)",
        filter: "blur(80px)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1 }}><ParticleBg /></div>

      {/* ── Nav ── */}
      <header style={{ position: "relative", zIndex: 10, maxWidth: 1100, margin: "0 auto",
        padding: "26px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <img src="/assets/sova-gradient.png" alt="SOVA Protocol"
          style={{ height: 18, width: "auto", objectFit: "contain", display: "block" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 14px",
          borderRadius: 9999, border: "1px solid rgba(0,0,0,0.09)", background: "rgba(255,255,255,0.9)",
          fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: TXT3 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a" }} />
          Whitechain Sepolia Active
        </div>
      </header>

      {/* ══════════════════════════════════════════
          01. HERO — Strategic Alignment & Identity Thesis
      ══════════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 5, maxWidth: 1100, margin: "0 auto",
        padding: "64px 24px 80px", display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 56, alignItems: "center" }}>

        {/* Left — text + form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 14px",
            borderRadius: 9999, border: "1px solid rgba(61,111,255,0.18)", background: "rgba(61,111,255,0.04)",
            fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
            letterSpacing: "0.16em", textTransform: "uppercase", color: BLUE, width: "fit-content" }}>
            Whitechain Reputation Primitive
          </div>

          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800,
            fontSize: "clamp(38px,4.3vw,56px)", letterSpacing: "-0.035em",
            lineHeight: 1.06, color: TXT, margin: 0 }}>
            <span className="clip-reveal">
              <span className="slide-up" style={{ display: "block" }}>Identity proves who you are.</span>
            </span>
            <span className="clip-reveal">
              <span className="slide-up-2" style={{ display: "block",
                backgroundImage: `linear-gradient(90deg,${BLUE} 0%,#6366f1 55%,#8b5cf6 100%)`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Reputation makes it actionable.
              </span>
            </span>
          </h1>

          <p style={{ fontFamily: "var(--font-sans)", fontSize: 16, color: TXT2,
            lineHeight: 1.72, maxWidth: 480, margin: 0 }}>
            SOVA is the verifiable reputation layer for Whitechain L2 — turning WB Soul identities and historical onchain behavior into machine-readable attestations for DeFi, lending, and rewards. Zero additional KYC required.
          </p>

          {/* Waitlist Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 420 }}>
            <form onSubmit={submit} style={{ display: "flex", gap: 6, padding: 5,
              borderRadius: 13, border: "1px solid rgba(0,0,0,0.1)",
              background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <input type="text" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{ flex: 1, background: "transparent", border: "none", outline: "none",
                  padding: "10px 14px", fontSize: 14, color: TXT, fontFamily: "var(--font-sans)" }} />
              <button type="submit" disabled={busy}
                style={{ padding: "10px 22px", borderRadius: 9, border: "none",
                  background: BLUE, color: "#fff", fontFamily: "var(--font-sans)",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  opacity: busy ? 0.6 : 1, whiteSpace: "nowrap" }}>
                {busy ? "Joining…" : "Join Waitlist"}
              </button>
            </form>
            {msg && (
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, textAlign: "center",
                margin: 0, color: msgOk ? "#16a34a" : "#dc2626" }}>{msg}</p>
            )}
          </div>

          {/* Trust pills */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {["WB Soul Native", "3 Smart Contracts Live", "Whitechain Sepolia"].map((t, i) => (
              <span key={t} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {i > 0 && <span style={{ color: "#E5E7EB", fontSize: 12 }}>·</span>}
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10,
                  color: TXT3, letterSpacing: "0.1em", textTransform: "uppercase" }}>{t}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Right — 3D floating attestation receipt */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ perspective: 1200, width: "100%", maxWidth: 330 }}>
            <AttestationReceipt score={820} isHeroPreview />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          02. ECOSYSTEM ARCHITECTURE & GAP ANALYSIS
      ══════════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 5, maxWidth: 960, margin: "0 auto", padding: "0 24px 96px" }}>
        <div style={{ borderRadius: 24, border: CARD_B, background: "linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)",
          padding: "48px 40px", boxShadow: "0 4px 20px rgba(61,111,255,0.04)" }}>
          
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, color: BLUE,
              textTransform: "uppercase", letterSpacing: "0.24em", marginBottom: 10 }}>Ecosystem Alignment</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(24px,3.5vw,34px)",
              letterSpacing: "-0.03em", color: TXT, margin: "0 0 12px" }}>
              Identity without utility is just a credential.
            </h2>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 14.5, color: TXT2, maxWidth: 580, margin: "0 auto", lineHeight: 1.65 }}>
              Whitechain and WhiteBIT provide 5M+ users and WB Soul identity. SOVA provides the machine-readable reputation layer that makes identity actionable for dApps.
            </p>
          </div>

          {/* Stack Pipeline Diagram */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, alignItems: "center", textAlign: "center" }}>
            {[
              { title: "WhiteBIT", sub: "5M+ Users", bg: "#fff" },
              { title: "Whitechain", sub: "Distribution L2", bg: "#fff" },
              { title: "WB Soul", sub: "Identity Anchor", bg: "#fff" },
              { title: "SOVA Engine", sub: "Reputation Layer", bg: "linear-gradient(135deg, #3D6FFF 0%, #6366f1 100%)", color: "#fff" },
              { title: "Whitechain dApps", sub: "Lending, DEX, Drops", bg: "#fff" },
            ].map((item, idx) => (
              <div key={item.title} style={{ display: "flex", flexDirection: "column", gap: 6, padding: "16px 10px",
                borderRadius: 14, border: item.color ? "none" : BORDER, background: item.bg,
                color: item.color || TXT, boxShadow: item.color ? "0 4px 14px rgba(61,111,255,0.25)" : "none" }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 }}>{item.title}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.08em" }}>{item.sub}</span>
              </div>
            ))}
          </div>

          {/* User A vs User B Behavioral Contrast */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 36 }}>
            <div style={{ padding: "24px 24px", borderRadius: 16, background: "#fff", border: BORDER }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: TXT }}>User A (Basic Credential)</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#f97316", background: "rgba(249,115,22,0.1)", padding: "2px 8px", borderRadius: 4 }}>Unrated</span>
              </div>
              <ul style={{ margin: 0, padding: "0 0 0 16px", fontFamily: "var(--font-mono)", fontSize: 12, color: TXT2, lineHeight: 1.8 }}>
                <li>WB Soul Verified ✓</li>
                <li>2 days active onchain</li>
                <li>3 total transactions</li>
                <li>dApp Utility: <span style={{ color: "#9CA3AF" }}>Default high risk</span></li>
              </ul>
            </div>

            <div style={{ padding: "24px 24px", borderRadius: 16, background: "#fff", border: "1px solid rgba(16,185,129,0.3)", boxShadow: "0 2px 10px rgba(16,185,129,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: TXT }}>User B (SOVA Verified)</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#10b981", background: "rgba(16,185,129,0.1)", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>Score: 820 / Elite</span>
              </div>
              <ul style={{ margin: 0, padding: "0 0 0 16px", fontFamily: "var(--font-mono)", fontSize: 12, color: TXT2, lineHeight: 1.8 }}>
                <li>WB Soul Verified ✓</li>
                <li>18 months holding longevity</li>
                <li>47 active weeks & healthy borrow history</li>
                <li>dApp Utility: <span style={{ color: "#10b981", fontWeight: 700 }}>Lower collateral & VIP fee tier</span></li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════
          03. HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 5, maxWidth: 960, margin: "0 auto", padding: "0 24px 96px" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, color: BLUE,
            textTransform: "uppercase", letterSpacing: "0.24em", marginBottom: 12 }}>How it works</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight:800,
            fontSize: "clamp(26px,4vw,38px)", letterSpacing: "-0.03em", color: TXT, margin: 0 }}>
            From identity to composable proof<br />in three steps.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", alignItems: "start", gap: 0 }}>
          {[
            { icon: <IconSoul />,    n: "01", title: "WB Soul Resolution",  body: "Resolves your WB Soul ID and associated wallets into a single behavioral history without extra KYC steps." },
            { icon: <IconAnalyze />, n: "02", title: "Behavioral Scoring",   body: "Analyzes retention, active weeks, holding longevity, and transaction health into a composable 0–1000 SoulScore." },
            { icon: <IconAttest />,  n: "03", title: "Onchain Attestation",  body: "Commits salted, privacy-preserving proofs onchain — callable by any dApp via a single Solidity line." },
          ].map(({ icon, n, title, body }, i) => (
            <>
              <div key={title} style={{ padding: "28px 24px 30px", borderRadius: 18, border: BORDER,
                background: CARD, display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10,
                    background: "rgba(61,111,255,0.07)", display: "flex",
                    alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {icon}
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: TXT3, letterSpacing: "0.1em" }}>{n}</span>
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: TXT, margin: 0 }}>{title}</h3>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: 13.5, color: TXT2, lineHeight: 1.65, margin: 0 }}>{body}</p>
              </div>
              {i < 2 && (
                <div key={`a-${i}`} style={{ display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "0 10px", paddingTop: 20 }}>
                  <ArrowRight />
                </div>
              )}
            </>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          04. INTERACTIVE SIMULATOR
      ══════════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 5, maxWidth: 960, margin: "0 auto", padding: "0 24px 96px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 0,
          borderRadius: 24, border: BORDER, overflow: "hidden" }}>

          {/* Controls */}
          <div style={{ padding: "44px 48px", background: CARD,
            display: "flex", flexDirection: "column", gap: 32, justifyContent: "center" }}>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, color: BLUE,
                textTransform: "uppercase", letterSpacing: "0.24em", marginBottom: 10 }}>Live Simulator</div>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26,
                letterSpacing: "-0.03em", color: TXT, margin: "0 0 8px" }}>
                Simulate your SoulScore
              </h2>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 13.5, color: TXT2,
                margin: 0, lineHeight: 1.6 }}>
                Adjust behavioral parameters to evaluate how SOVA updates onchain credit profiles.
              </p>
            </div>
            {[
              { label: "WBT Balance",        val: wbt,   mn: 10, mx: 1000, unit: `${wbt} WBT`,                           set: setWbt },
              { label: "Active Weeks",       val: weeks, mn: 1,  mx: 52,   unit: `${weeks} active week${weeks !== 1 ? "s" : ""}`, set: setWeeks },
              { label: "Onchain Longevity",  val: age,   mn: 1,  mx: 24,   unit: `${age} month${age !== 1 ? "s" : ""}`,        set: setAge },
            ].map(({ label, val, mn, mx, unit, set }) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between",
                  fontFamily: "var(--font-mono)", fontSize: 11 }}>
                  <span style={{ color: TXT3, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
                  <span style={{ color: TXT, fontWeight: 700 }}>{unit}</span>
                </div>
                <input type="range" min={mn} max={mx} value={val}
                  onChange={e => set(Number(e.target.value))}
                  className="slider" style={{ background: track(val, mn, mx) }} />
              </div>
            ))}
          </div>

          {/* Receipt */}
          <div style={{ padding: "44px 36px", background: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AttestationReceipt score={score} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          05. BUILT FOR — Ecosystem Use Cases
      ══════════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 5, maxWidth: 960, margin: "0 auto", padding: "0 24px 96px" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, color: BLUE,
            textTransform: "uppercase", letterSpacing: "0.24em", marginBottom: 12 }}>Ecosystem Utility</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800,
            fontSize: "clamp(26px,4vw,38px)", letterSpacing: "-0.03em", color: TXT, margin: 0 }}>
            One primitive. Four dApp applications.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {[
            {
              tag: "Lending & Money Markets",
              title: "Risk-Based Collateral Ratios",
              body: "Optimize collateral requirements and borrow rates based on verified historical repayment consistency rather than high uniform liquidations.",
            },
            {
              tag: "DEXs & Liquidity Hubs",
              title: "Sybil-Resistant VIP Fee Tiers",
              body: "Reward loyal Whitechain traders with tiered fee discounts based on long-term retention and ecosystem activity.",
            },
            {
              tag: "Airdrops & Rewards",
              title: "Targeted Ecosystem Rewards",
              body: "Distribute grants and rewards directly to users with proven multi-month retention (e.g. 47 active weeks vs 2-day-old bot accounts).",
            },
            {
              tag: "Solidity Integration",
              title: "1-Line Smart Contract Query",
              body: "Query `uint256 score = sova.getScore(soulId)` directly inside Solidity. Zero middleware, zero offchain oracle delay.",
            },
          ].map(({ tag, title, body }, i) => (
            <SpotlightCard key={tag}
              className="spot-card rounded-[18px]"
              style={{
                background: CARD,
                border: BORDER,
                padding: "32px 30px",
                display: "flex", flexDirection: "column", gap: 14,
                borderRadius: 18,
              }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700,
                color: BLUE, textTransform: "uppercase", letterSpacing: "0.2em", position: "relative", zIndex: 10 }}>
                {tag}
              </span>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18,
                color: TXT, margin: 0, lineHeight: 1.3, position: "relative", zIndex: 10 }}>
                {title}
              </h3>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 13.5, color: TXT2,
                lineHeight: 1.65, margin: 0, position: "relative", zIndex: 10 }}>
                {body}
              </p>
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          06. DEVELOPER INTEGRATION & PROOF
      ══════════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 5, maxWidth: 960, margin: "0 auto", padding: "0 24px 96px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 24 }}>
          
          {/* Left: Code Snippet */}
          <div style={{ borderRadius: 20, border: "1px solid #1E293B", background: "#0F172A", padding: "28px 28px", color: "#F8FAFC" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#94A3B8", letterSpacing: "0.1em" }}>ISOVARegistry.sol</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#38BDF8" }}>Solidity v0.8.20</span>
            </div>
            <pre style={{ fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.7, margin: 0, color: "#E2E8F0", overflowX: "auto" }}>
              <code>{`// dApp Solidity Query Example
import "./ISOVARegistry.sol";

contract LendingPool {
    ISOVARegistry public immutable sova;

    function getBorrowLimit(uint256 soulId) 
        external view returns (uint256) 
    {
        (uint256 score, uint8 status) = 
            sova.getScore(soulId);
            
        if (score >= 750) return 150000; // Tier 1
        return 50000;
    }
}`}</code>
            </pre>
          </div>

          {/* Right: Deployed Smart Contracts */}
          <div style={{ borderRadius: 20, border: BORDER, background: CARD, padding: "28px 28px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.24em", marginBottom: 8 }}>Deployed Infrastructure</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: TXT, margin: "0 0 16px" }}>Whitechain Sepolia Contracts</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { name: "SovaAttestationRegistry", addr: "0x3A6c...f8e2" },
                { name: "SovaTimelockMultisig",   addr: "0x9B1d...a341" },
                { name: "SovaNetworkProof",       addr: "0xC2f4...8b09" },
              ].map(c => (
                <div key={c.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 10, background: "#fff", border: BORDER }}>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: TXT }}>{c.name}</span>
                  <a href="https://testnet.whitechain.io" target="_blank" style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: BLUE, textDecoration: "none" }}>{c.addr} ↗</a>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════
          07. MILESTONE ROADMAP
      ══════════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 5, maxWidth: 960, margin: "0 auto", padding: "0 24px 96px" }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, color: BLUE,
            textTransform: "uppercase", letterSpacing: "0.24em", marginBottom: 12 }}>Roadmap</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800,
            fontSize: "clamp(26px,4vw,38px)", letterSpacing: "-0.03em", color: TXT, margin: 0 }}>
            Roadmap to Whitechain Mainnet.
          </h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0,
          border: BORDER, borderRadius: 18, overflow: "hidden" }}>
          {[
            { n: "00", phase: "Reconnaissance",  status: "Done",    body: "Whitechain Sepolia validated. WB Soul identity contracts mapped. SOVA Registry deployed and verified onchain." },
            { n: "01", phase: "Specification",   status: "Active",  body: "Freezing v0.1 scoring parameters, time-decay weights, and anti-gaming rules in alignment with Whitechain Q3 2026 Testnet." },
            { n: "02", phase: "Smart Contracts", status: "Next",    body: "Deploying SoulReader and ReputationOracle contracts. Full security test coverage & Auditor briefing document." },
            { n: "03", phase: "Data Engine",     status: "Planned", body: "Production WB Soul event indexer. Feature store, scoring pipeline, and GraphQL query API." },
            { n: "04", phase: "Product Release", status: "Planned", body: "Public reputation dashboard, dApp SDK, and reference lending integration." },
            { n: "05", phase: "Mainnet Launch",  status: "Planned", body: "Hacken audit completion and deployment to Whitechain Mainnet for Q4 2026." },
          ].map(({ n, phase, status, body }, i) => {
            const isDone = status === "Done", isActive = status === "Active", isNext = status === "Next";
            const badgeClr = isDone ? "#16a34a" : isActive ? BLUE : isNext ? "#d97706" : "#9CA3AF";
            const badgeBg  = isDone ? "rgba(22,163,74,0.08)" : isActive ? "rgba(61,111,255,0.08)" : isNext ? "rgba(217,119,6,0.08)" : "rgba(0,0,0,0.04)";
            return (
              <div key={n} style={{ display: "grid", gridTemplateColumns: "56px 1fr auto", gap: 24,
                padding: "22px 32px", alignItems: "center",
                background: isActive ? "rgba(61,111,255,0.025)" : "#fff",
                borderBottom: i < 5 ? "1px solid rgba(0,0,0,0.07)" : "none" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 700,
                  color: "rgba(0,0,0,0.07)", lineHeight: 1 }}>{n}</span>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15,
                    color: TXT, marginBottom: 3 }}>{phase}</div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: TXT2,
                    lineHeight: 1.55 }}>{body}</div>
                </div>
                <span style={{ display: "flex", alignItems: "center", gap: 5,
                  fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.12em",
                  color: badgeClr, background: badgeBg, padding: "4px 10px",
                  borderRadius: 5, whiteSpace: "nowrap" }}>
                  {isActive && <span style={{ width: 5, height: 5, borderRadius: "50%", background: BLUE }} />}
                  {status}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          08. FOOTER
      ══════════════════════════════════════════ */}
      <footer style={{ position: "relative", zIndex: 5, borderTop: "1px solid rgba(0,0,0,0.07)",
        background: "#F7F7F8" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 24px 0",
          display: "grid", gridTemplateColumns: "1.4fr 0.6fr", gap: 64, alignItems: "start" }}>

          {/* Brand + columns */}
          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <img src="/assets/sova-gradient.png" alt="SOVA Protocol"
                style={{ height: 16, width: "auto", display: "block",
                  objectFit: "contain", objectPosition: "left" }} />
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: TXT3,
                lineHeight: 1.7, maxWidth: 340, margin: 0 }}>
                The verifiable onchain reputation primitive for Whitechain L2.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 28 }}>
              {[
                { title: "Protocol",   links: [["Whitechain Sepolia", "https://testnet.whitechain.io"], ["Registry Specs", "/docs/architecture"], ["Soulbound ID", "/docs/architecture"]] },
                { title: "Developers", links: [["GitHub", "https://github.com/Dexanode/sova-protocol"], ["Solidity Query API", "/docs/api"], ["Architecture Docs", "/docs/architecture"]] },
                { title: "Community",  links: [["Twitter / X", "https://x.com/sovaprotocol"], ["Telegram", "https://t.me/sovaprotocol"], ["Discord", "https://discord.gg/sovaprotocol"]] },
              ].map(({ title, links }) => (
                <div key={title} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, color: TXT3,
                    textTransform: "uppercase", letterSpacing: "0.2em", margin: 0 }}>{title}</h4>
                  <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 9 }}>
                    {links.map(([label, href]) => (
                      <li key={label}><a href={href} target={href.startsWith("http") ? "_blank" : undefined}
                        style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: TXT2,
                          textDecoration: "none", transition: "color .15s" }}
                        onMouseEnter={e => (e.currentTarget.style.color = TXT)}
                        onMouseLeave={e => (e.currentTarget.style.color = TXT2)}>{label}</a></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* CTA card */}
          <div style={{ borderRadius: 18, padding: "26px 24px 22px",
            border: "1px solid rgba(61,111,255,0.18)", background: "#fff",
            boxShadow: "0 2px 12px rgba(61,111,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#16a34a" }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700,
                color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.18em" }}>Whitechain Sepolia Live</span>
            </div>
            <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16,
              color: TXT, margin: "0 0 10px", lineHeight: 1.35 }}>
              Build reputation-aware dApps.
            </h4>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: TXT2,
              lineHeight: 1.6, margin: "0 0 18px" }}>
              Join the waitlist for early developer access and SDK documentation.
            </p>
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none",
                background: BLUE, color: "#fff", fontFamily: "var(--font-sans)",
                fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "filter .15s" }}
              onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.1)")}
              onMouseLeave={e => (e.currentTarget.style.filter = "brightness(1)")}>
              Join Waitlist
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ maxWidth: 1100, margin: "40px auto 0", padding: "18px 24px 28px",
          borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex",
          justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: TXT3 }}>
            2026 © Sova Protocol, onchain
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <a href="https://github.com/Dexanode/sova-protocol" target="_blank" aria-label="GitHub"
              style={{ color: TXT3, transition: "color .2s", display: "flex" }}
              onMouseEnter={e => (e.currentTarget.style.color = TXT)}
              onMouseLeave={e => (e.currentTarget.style.color = TXT3)}>
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.53 1.03 1.53 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.55-1.11-4.55-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd"/>
              </svg>
            </a>
            <a href="https://x.com/sovaprotocol" target="_blank" aria-label="X"
              style={{ color: TXT3, transition: "color .2s", display: "flex" }}
              onMouseEnter={e => (e.currentTarget.style.color = TXT)}
              onMouseLeave={e => (e.currentTarget.style.color = TXT3)}>
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
