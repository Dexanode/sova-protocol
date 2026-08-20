"use client";
import { useRef, ReactNode, CSSProperties } from "react";

interface Props { children: ReactNode; className?: string; style?: CSSProperties; }

export default function SpotlightCard({ children, className = "", style }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <div ref={ref} onMouseMove={onMove} className={`spot-card ${className}`} style={style}>
      {children}
    </div>
  );
}
