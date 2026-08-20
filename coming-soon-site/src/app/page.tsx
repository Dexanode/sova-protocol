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
  const [wbt,   setWbt]   = useState(300);
  const [loans, setLoans] = useState(5);
  const [age,   setAge]   = useState(6);
  const [email, setEmail] = useState("");
  const [msg,   setMsg]   = useState("");
  const [msgOk, setMsgOk] = useState(false);
  const [busy,  setBusy]  = useState(false);

  const score = Math.min(1000, Math.round(
    100 + Math.min(300,(wbt/1000)*300) + Math.min(500,loans*40) + Math.min(200,age*15)
  ));

  const track = (v:number,mn:number,mx:number) => {
    const p = ((v-mn)/(mx-mn))*100;
    return `linear-gradient(to right,${BLUE} 0%,${BLUE} ${p}%,#E5E7EB ${p}%,#E5E7EB 100%)`;
  };

  const submit = (e:React.FormEvent) => {
    e.preventDefault();
    const v = email.trim();
    if (!v || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setMsg("Please enter a valid email address."); setMsgOk(false); return;
    }
    setBusy(true); setMsg("");
    setTimeout(() => {
      setBusy(false); setEmail("");
      setMsg("You're in. We'll reach out when SOVA launches.");
      setMsgOk(true);
    }, 900);
  };

  return (
    <div style={{ background:"#fff", minHeight:"100vh", overflowX:"hidden" }}>

      {/* Ambient */}
      <div style={{ position:"fixed", top:-250, left:-200, width:800, height:800, borderRadius:"50%",
        background:"radial-gradient(circle,rgba(61,111,255,0.055) 0%,transparent 65%)",
        filter:"blur(80px)", pointerEvents:"none", zIndex:0 }} />

      <div style={{ position:"relative", zIndex:1 }}><ParticleBg /></div>

      {/* ── Nav ── */}
      <header style={{ position:"relative", zIndex:10, maxWidth:1100, margin:"0 auto",
        padding:"26px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <img src="/assets/sova-gradient.png" alt="SOVA Protocol"
          style={{ height:18, width:"auto", objectFit:"contain", display:"block" }} />
        <div style={{ display:"flex", alignItems:"center", gap:7, padding:"5px 14px",
          borderRadius:9999, border:"1px solid rgba(0,0,0,0.09)", background:"rgba(255,255,255,0.9)",
          fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:TXT3 }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"#16a34a" }} />
          Testnet Live
        </div>
      </header>

      {/* ══════════════════════════════════════════
          01. HERO — split layout, receipt floating right
      ══════════════════════════════════════════ */}
      <section style={{ position:"relative", zIndex:5, maxWidth:1100, margin:"0 auto",
        padding:"72px 24px 80px", display:"grid", gridTemplateColumns:"1fr 1fr",
        gap:64, alignItems:"center" }}>

        {/* Left — text + form */}
        <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"4px 14px",
            borderRadius:9999, border:"1px solid rgba(0,0,0,0.08)",
            fontFamily:"var(--font-mono)", fontSize:10, fontWeight:700,
            letterSpacing:"0.16em", textTransform:"uppercase", color:TXT3, width:"fit-content" }}>
            Onchain Reputation Protocol
          </div>

          <h1 style={{ fontFamily:"var(--font-display)", fontWeight:800,
            fontSize:"clamp(40px,4.5vw,60px)", letterSpacing:"-0.035em",
            lineHeight:1.05, color:TXT, margin:0 }}>
            <span className="clip-reveal">
              <span className="slide-up" style={{ display:"block" }}>Onchain since day one.</span>
            </span>
            <span className="clip-reveal">
              <span className="slide-up-2" style={{ display:"block",
                backgroundImage:`linear-gradient(90deg,${BLUE} 0%,#6366f1 55%,#8b5cf6 100%)`,
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                Now your reputation counts.
              </span>
            </span>
          </h1>

          <p style={{ fontFamily:"var(--font-sans)", fontSize:16, color:TXT2,
            lineHeight:1.72, maxWidth:460, margin:0 }}>
            SOVA turns your transaction history, loan repayments, and token behavior into a
            verifiable, privacy-preserving credit score — native to Whitechain L2.
            No KYC. No bank. Just proof.
          </p>

          {/* Waitlist */}
          <div style={{ display:"flex", flexDirection:"column", gap:8, maxWidth:420 }}>
            <form onSubmit={submit} style={{ display:"flex", gap:6, padding:5,
              borderRadius:13, border:"1px solid rgba(0,0,0,0.1)",
              background:"#fff", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
              <input type="text" value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{ flex:1, background:"transparent", border:"none", outline:"none",
                  padding:"10px 14px", fontSize:14, color:TXT, fontFamily:"var(--font-sans)" }} />
              <button type="submit" disabled={busy}
                style={{ padding:"10px 22px", borderRadius:9, border:"none",
                  background:BLUE, color:"#fff", fontFamily:"var(--font-sans)",
                  fontSize:13, fontWeight:600, cursor:"pointer",
                  opacity:busy?0.6:1, whiteSpace:"nowrap" }}>
                {busy ? "Joining…" : "Join Waitlist"}
              </button>
            </form>
            {msg && (
              <p style={{ fontFamily:"var(--font-mono)", fontSize:11, textAlign:"center",
                margin:0, color:msgOk?"#16a34a":"#dc2626" }}>{msg}</p>
            )}
          </div>

          {/* Trust pills */}
          <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
            {["3 Contracts Deployed","WB Soul Native","Sepolia Testnet"].map((t,i)=>(
              <span key={t} style={{ display:"flex", alignItems:"center", gap:8 }}>
                {i > 0 && <span style={{ color:"#E5E7EB", fontSize:12 }}>·</span>}
                <span style={{ fontFamily:"var(--font-mono)", fontSize:10,
                  color:TXT3, letterSpacing:"0.1em", textTransform:"uppercase" }}>{t}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Right — 3D floating attestation receipt (preview, score fixed at 780) */}
        <div style={{ display:"flex", justifyContent:"center", alignItems:"center" }}>
          <div style={{ perspective:1200, width:"100%", maxWidth:320 }}>
            <AttestationReceipt score={780} isHeroPreview />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          02. HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section style={{ position:"relative", zIndex:5, maxWidth:960, margin:"0 auto", padding:"0 24px 96px" }}>
        <div style={{ textAlign:"center", marginBottom:52 }}>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:9, fontWeight:700, color:BLUE,
            textTransform:"uppercase", letterSpacing:"0.24em", marginBottom:12 }}>How it works</div>
          <h2 style={{ fontFamily:"var(--font-display)", fontWeight:800,
            fontSize:"clamp(26px,4vw,38px)", letterSpacing:"-0.03em", color:TXT, margin:0 }}>
            From wallet to verified score<br />in three steps.
          </h2>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr auto 1fr", alignItems:"start", gap:0 }}>
          {[
            { icon:<IconSoul />,    n:"01", title:"WB Soul Resolution",  body:"We resolve your WB Soul ID and aggregate up to 4 linked wallets into a single, unified identity — no manual input needed." },
            { icon:<IconAnalyze />, n:"02", title:"Behavioral Scoring",   body:"Your transaction history, loan repayments, and token holding patterns are analyzed and converted into a 0–1000 SoulScore." },
            { icon:<IconAttest />,  n:"03", title:"Onchain Attestation",  body:"A salted, privacy-preserving attestation is written to the SOVA Registry — verifiable by any lending protocol via Solidity." },
          ].map(({icon,n,title,body},i)=>(
            <>
              <div key={title} style={{ padding:"28px 24px 30px", borderRadius:18, border:BORDER,
                background:CARD, display:"flex", flexDirection:"column", gap:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:40, height:40, borderRadius:10,
                    background:"rgba(61,111,255,0.07)", display:"flex",
                    alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {icon}
                  </div>
                  <span style={{ fontFamily:"var(--font-mono)", fontSize:10, color:TXT3, letterSpacing:"0.1em" }}>{n}</span>
                </div>
                <h3 style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:17, color:TXT, margin:0 }}>{title}</h3>
                <p style={{ fontFamily:"var(--font-sans)", fontSize:13.5, color:TXT2, lineHeight:1.65, margin:0 }}>{body}</p>
              </div>
              {i < 2 && (
                <div key={`a-${i}`} style={{ display:"flex", alignItems:"center", justifyContent:"center",
                  padding:"0 10px", paddingTop:20 }}>
                  <ArrowRight />
                </div>
              )}
            </>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          03. SIMULATE — split, sliders left + receipt right
      ══════════════════════════════════════════ */}
      <section style={{ position:"relative", zIndex:5, maxWidth:960, margin:"0 auto", padding:"0 24px 96px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1.1fr 0.9fr", gap:0,
          borderRadius:24, border:BORDER, overflow:"hidden" }}>

          {/* Controls */}
          <div style={{ padding:"44px 48px", background:CARD,
            display:"flex", flexDirection:"column", gap:32, justifyContent:"center" }}>
            <div>
              <div style={{ fontFamily:"var(--font-mono)", fontSize:9, fontWeight:700, color:BLUE,
                textTransform:"uppercase", letterSpacing:"0.24em", marginBottom:10 }}>Simulator</div>
              <h2 style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:26,
                letterSpacing:"-0.03em", color:TXT, margin:"0 0 8px" }}>
                Simulate your SoulScore
              </h2>
              <p style={{ fontFamily:"var(--font-sans)", fontSize:13.5, color:TXT2,
                margin:0, lineHeight:1.6 }}>
                Adjust inputs to see how the formula scores your onchain profile in real time.
              </p>
            </div>
            {[
              { label:"WBT Balance",  val:wbt,   mn:10, mx:1000, unit:`${wbt} WBT`,                           set:setWbt },
              { label:"Repaid Loans", val:loans, mn:0,  mx:15,   unit:`${loans} position${loans!==1?"s":""}`, set:setLoans },
              { label:"Account Age",  val:age,   mn:1,  mx:24,   unit:`${age} month${age!==1?"s":""}`,        set:setAge },
            ].map(({label,val,mn,mx,unit,set})=>(
              <div key={label} style={{ display:"flex", flexDirection:"column", gap:8 }}>
                <div style={{ display:"flex", justifyContent:"space-between",
                  fontFamily:"var(--font-mono)", fontSize:11 }}>
                  <span style={{ color:TXT3, textTransform:"uppercase", letterSpacing:"0.1em" }}>{label}</span>
                  <span style={{ color:TXT, fontWeight:700 }}>{unit}</span>
                </div>
                <input type="range" min={mn} max={mx} value={val}
                  onChange={e=>set(Number(e.target.value))}
                  className="slider" style={{ background:track(val,mn,mx) }} />
              </div>
            ))}
          </div>

          {/* Receipt */}
          <div style={{ padding:"44px 36px", background:"#fff",
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <AttestationReceipt score={score} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          04. BUILT FOR — 3 personas
      ══════════════════════════════════════════ */}
      <section style={{ position:"relative", zIndex:5, maxWidth:960, margin:"0 auto", padding:"0 24px 96px" }}>
        <div style={{ textAlign:"center", marginBottom:52 }}>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:9, fontWeight:700, color:BLUE,
            textTransform:"uppercase", letterSpacing:"0.24em", marginBottom:12 }}>Built for</div>
          <h2 style={{ fontFamily:"var(--font-display)", fontWeight:800,
            fontSize:"clamp(26px,4vw,38px)", letterSpacing:"-0.03em", color:TXT, margin:0 }}>
            Reputation that works for everyone.
          </h2>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
          {[
            {
              label:"Lenders",
              headline:"Lend with confidence.",
              body:"Know your borrower's full onchain history before approving a loan — repayment record, wallet age, and holding behavior. Cryptographically verified.",
            },
            {
              label:"Borrowers",
              headline:"Your history earns better rates.",
              body:"Prove your reputation without doxxing your wallet. Your SoulScore travels with your WB Soul ID — unlocking undercollateralized positions based on who you actually are onchain.",
            },
            {
              label:"dApp Builders",
              headline:"One call. Verified reputation.",
              body:"Add reputation checks to your Solidity contracts with a single gas-efficient view call. No oracle. No middleware. Just a score and a verified status.",
            },
          ].map(({label,headline,body},i)=>(
            <SpotlightCard key={label}
              className="spot-card rounded-[18px] p-8 flex flex-col gap-4"
              style={{
                background: i===1 ? "#fff" : CARD,
                border: i===1 ? CARD_B : BORDER,
                boxShadow: i===1 ? "0 4px 20px rgba(61,111,255,0.08)" : "none",
                display:"flex", flexDirection:"column", gap:18, padding:"32px 28px",
                borderRadius:18,
              }}>
              <span style={{ fontFamily:"var(--font-mono)", fontSize:9, fontWeight:700,
                color:BLUE, textTransform:"uppercase", letterSpacing:"0.2em", position:"relative", zIndex:10 }}>
                {label}
              </span>
              <h3 style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:18,
                color:TXT, margin:0, lineHeight:1.3, position:"relative", zIndex:10 }}>
                {headline}
              </h3>
              <p style={{ fontFamily:"var(--font-sans)", fontSize:13.5, color:TXT2,
                lineHeight:1.65, margin:0, flex:1, position:"relative", zIndex:10 }}>
                {body}
              </p>
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          05. LIVE ONCHAIN PROOF
      ══════════════════════════════════════════ */}
      <section style={{ position:"relative", zIndex:5, maxWidth:960, margin:"0 auto", padding:"0 24px 96px" }}>
        <div style={{ borderRadius:20, border:BORDER, background:CARD, overflow:"hidden" }}>
          <div style={{ padding:"28px 36px 22px", borderBottom:"1px solid rgba(0,0,0,0.07)",
            display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontFamily:"var(--font-mono)", fontSize:9, fontWeight:700, color:BLUE,
                textTransform:"uppercase", letterSpacing:"0.24em", marginBottom:8 }}>Verifiable Onchain</div>
              <h2 style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:22,
                letterSpacing:"-0.025em", color:TXT, margin:0 }}>Live on Whitechain Sepolia</h2>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:7, padding:"6px 14px",
              borderRadius:9999, border:"1px solid rgba(22,163,74,0.2)",
              background:"rgba(22,163,74,0.06)" }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:"#16a34a" }} />
              <span style={{ fontFamily:"var(--font-mono)", fontSize:10, fontWeight:700,
                color:"#16a34a", textTransform:"uppercase", letterSpacing:"0.14em" }}>Deployed</span>
            </div>
          </div>
          {[
            { label:"Network",           value:"Whitechain Sepolia  (Chain 1875)", link:null },
            { label:"Registry Contract", value:"0x3A6c...f8e2",                   link:"https://testnet.whitechain.io" },
            { label:"Timelock Multisig", value:"0x9B1d...a341",                   link:"https://testnet.whitechain.io" },
            { label:"Network Proof",     value:"0xC2f4...8b09",                   link:"https://testnet.whitechain.io" },
            { label:"First Deploy Tx",   value:"0xd4e2...90fa",                   link:"https://testnet.whitechain.io" },
          ].map(({label,value,link},i)=>(
            <div key={label} style={{ padding:"18px 36px", display:"flex",
              justifyContent:"space-between", alignItems:"center",
              borderBottom:i<4?"1px solid rgba(0,0,0,0.06)":"none",
              background:i%2===0?"transparent":"rgba(0,0,0,0.015)" }}>
              <span style={{ fontFamily:"var(--font-mono)", fontSize:10, color:TXT3,
                textTransform:"uppercase", letterSpacing:"0.12em" }}>{label}</span>
              {link
                ? <a href={link} target="_blank" style={{ fontFamily:"var(--font-mono)",
                    fontSize:12, color:BLUE, textDecoration:"none" }}>{value} ↗</a>
                : <span style={{ fontFamily:"var(--font-mono)", fontSize:12, color:TXT2 }}>{value}</span>
              }
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          06. ROADMAP — flat list
      ══════════════════════════════════════════ */}
      <section style={{ position:"relative", zIndex:5, maxWidth:960, margin:"0 auto", padding:"0 24px 96px" }}>
        <div style={{ marginBottom:40 }}>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:9, fontWeight:700, color:BLUE,
            textTransform:"uppercase", letterSpacing:"0.24em", marginBottom:12 }}>Roadmap</div>
          <h2 style={{ fontFamily:"var(--font-display)", fontWeight:800,
            fontSize:"clamp(26px,4vw,38px)", letterSpacing:"-0.03em", color:TXT, margin:0 }}>
            What we&apos;re building.
          </h2>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:0,
          border:BORDER, borderRadius:18, overflow:"hidden" }}>
          {[
            { n:"00", phase:"Reconnaissance",  status:"Done",    body:"Whitechain Sepolia validated. WB Soul contracts mapped. SOVA Registry deployed and verified onchain." },
            { n:"01", phase:"Specification",   status:"Active",  body:"Finalizing v0.1 scoring formula, normalization weights, time-decay parameters, and anti-gaming rules." },
            { n:"02", phase:"Smart Contracts", status:"Next",    body:"SoulReader and ReputationOracle contracts. Full test coverage. Auditor briefing document." },
            { n:"03", phase:"Data Engine",     status:"Planned", body:"Production indexer for WB Soul events. Feature store, scoring pipeline, and API." },
            { n:"04", phase:"Product Release", status:"Planned", body:"Reputation dashboard, public query API, and a reference lending integration dApp." },
            { n:"05", phase:"Mainnet",         status:"Planned", body:"Hacken security audit completion. Full deployment to Whitechain Mainnet." },
          ].map(({n,phase,status,body},i)=>{
            const isDone=status==="Done", isActive=status==="Active", isNext=status==="Next";
            const badgeClr = isDone?"#16a34a":isActive?BLUE:isNext?"#d97706":"#9CA3AF";
            const badgeBg  = isDone?"rgba(22,163,74,0.08)":isActive?"rgba(61,111,255,0.08)":isNext?"rgba(217,119,6,0.08)":"rgba(0,0,0,0.04)";
            return (
              <div key={n} style={{ display:"grid", gridTemplateColumns:"56px 1fr auto", gap:24,
                padding:"22px 32px", alignItems:"center",
                background:isActive?"rgba(61,111,255,0.025)":"#fff",
                borderBottom:i<5?"1px solid rgba(0,0,0,0.07)":"none" }}>
                <span style={{ fontFamily:"var(--font-mono)", fontSize:20, fontWeight:700,
                  color:"rgba(0,0,0,0.07)", lineHeight:1 }}>{n}</span>
                <div>
                  <div style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:15,
                    color:TXT, marginBottom:3 }}>{phase}</div>
                  <div style={{ fontFamily:"var(--font-sans)", fontSize:13, color:TXT2,
                    lineHeight:1.55 }}>{body}</div>
                </div>
                <span style={{ display:"flex", alignItems:"center", gap:5,
                  fontFamily:"var(--font-mono)", fontSize:9, fontWeight:700,
                  textTransform:"uppercase", letterSpacing:"0.12em",
                  color:badgeClr, background:badgeBg, padding:"4px 10px",
                  borderRadius:5, whiteSpace:"nowrap" }}>
                  {isActive && <span style={{ width:5, height:5, borderRadius:"50%", background:BLUE }} />}
                  {status}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          07. FOOTER
      ══════════════════════════════════════════ */}
      <footer style={{ position:"relative", zIndex:5, borderTop:"1px solid rgba(0,0,0,0.07)",
        background:"#F7F7F8" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"64px 24px 0",
          display:"grid", gridTemplateColumns:"1.4fr 0.6fr", gap:64, alignItems:"start" }}>

          {/* Brand + columns */}
          <div style={{ display:"flex", flexDirection:"column", gap:40 }}>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <img src="/assets/sova-gradient.png" alt="SOVA Protocol"
                style={{ height:16, width:"auto", display:"block",
                  objectFit:"contain", objectPosition:"left" }} />
              <p style={{ fontFamily:"var(--font-sans)", fontSize:13, color:TXT3,
                lineHeight:1.7, maxWidth:320, margin:0 }}>
                Verifiable onchain reputation for the next generation of decentralised finance.
              </p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:28 }}>
              {[
                { title:"Protocol",   links:[["Whitechain Sepolia","#"],["Registry Specs","#"],["Soulbound ID","#"]] },
                { title:"Developers", links:[["GitHub","https://github.com/Dexanode/sova-protocol"],["Reputation API","#"],["Solidity Docs","#"]] },
                { title:"Community",  links:[["Twitter / X","https://x.com/sovaprotocol"],["Telegram","#"],["Discord","#"]] },
              ].map(({title,links})=>(
                <div key={title} style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <h4 style={{ fontFamily:"var(--font-mono)", fontSize:9, fontWeight:700, color:TXT3,
                    textTransform:"uppercase", letterSpacing:"0.2em", margin:0 }}>{title}</h4>
                  <ul style={{ listStyle:"none", margin:0, padding:0, display:"flex", flexDirection:"column", gap:9 }}>
                    {links.map(([label,href])=>(
                      <li key={label}><a href={href} target={href.startsWith("http")?"_blank":undefined}
                        style={{ fontFamily:"var(--font-sans)", fontSize:13, color:TXT2,
                          textDecoration:"none", transition:"color .15s" }}
                        onMouseEnter={e=>(e.currentTarget.style.color=TXT)}
                        onMouseLeave={e=>(e.currentTarget.style.color=TXT2)}>{label}</a></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* CTA card */}
          <div style={{ borderRadius:18, padding:"26px 24px 22px",
            border:"1px solid rgba(61,111,255,0.18)", background:"#fff",
            boxShadow:"0 2px 12px rgba(61,111,255,0.06)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:14 }}>
              <span style={{ width:5, height:5, borderRadius:"50%", background:"#16a34a" }} />
              <span style={{ fontFamily:"var(--font-mono)", fontSize:9, fontWeight:700,
                color:"#16a34a", textTransform:"uppercase", letterSpacing:"0.18em" }}>Testnet Live</span>
            </div>
            <h4 style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:16,
              color:TXT, margin:"0 0 10px", lineHeight:1.35 }}>
              Be early to onchain reputation.
            </h4>
            <p style={{ fontFamily:"var(--font-sans)", fontSize:13, color:TXT2,
              lineHeight:1.6, margin:"0 0 18px" }}>
              Join the waitlist for early access when we launch on mainnet.
            </p>
            <button onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}
              style={{ width:"100%", padding:"12px 0", borderRadius:10, border:"none",
                background:BLUE, color:"#fff", fontFamily:"var(--font-sans)",
                fontSize:13, fontWeight:600, cursor:"pointer", transition:"filter .15s" }}
              onMouseEnter={e=>(e.currentTarget.style.filter="brightness(1.1)")}
              onMouseLeave={e=>(e.currentTarget.style.filter="brightness(1)")}>
              Join Waitlist
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ maxWidth:1100, margin:"40px auto 0", padding:"18px 24px 28px",
          borderTop:"1px solid rgba(0,0,0,0.06)", display:"flex",
          justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
          <span style={{ fontFamily:"var(--font-mono)", fontSize:11, color:TXT3 }}>
            2026 © Sova Protocol, onchain
          </span>
          <div style={{ display:"flex", alignItems:"center", gap:18 }}>
            <a href="https://github.com/Dexanode/sova-protocol" target="_blank" aria-label="GitHub"
              style={{ color:TXT3, transition:"color .2s", display:"flex" }}
              onMouseEnter={e=>(e.currentTarget.style.color=TXT)}
              onMouseLeave={e=>(e.currentTarget.style.color=TXT3)}>
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.53 1.03 1.53 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.55-1.11-4.55-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd"/>
              </svg>
            </a>
            <a href="https://x.com/sovaprotocol" target="_blank" aria-label="X"
              style={{ color:TXT3, transition:"color .2s", display:"flex" }}
              onMouseEnter={e=>(e.currentTarget.style.color=TXT)}
              onMouseLeave={e=>(e.currentTarget.style.color=TXT3)}>
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
