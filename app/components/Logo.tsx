import React from 'react';
import Link from 'next/link';

interface LogoProps {
  light?: boolean;
  size?: 'sm' | 'md' | 'lg';
  withTagline?: boolean;
}

const Logo: React.FC<LogoProps> = ({ light = true, size = 'md', withTagline = true }) => {
  const A = "#D4470A";
  const iconSize = size === 'sm' ? 24 : size === 'lg' ? 48 : 32;
  const fontSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;
  const tagSize = size === 'sm' ? 8 : size === 'lg' ? 12 : 10;

  return (
    <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
      {/* Premium Hexagonal Digital Fork Icon */}
      <div style={{ position: 'relative', width: iconSize, height: iconSize, flexShrink: 0 }}>
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Hexagon Background */}
          <path d="M12 2L20.66 7V17L12 22L3.34 17V7L12 2Z" 
            stroke={A} strokeWidth="1.5" strokeLinejoin="round" 
            fill={light ? "rgba(212,71,10,0.05)" : "rgba(212,71,10,0.15)"} 
          />
          {/* Stylized Fork Prongs (Digital Bars) */}
          <path d="M9 7V11C9 12.6569 10.3431 14 12 14C13.6569 14 15 12.6569 15 11V7" 
            stroke={A} strokeWidth="2" strokeLinecap="round" 
          />
          <path d="M12 7V14" stroke={A} strokeWidth="2" strokeLinecap="round" />
          <path d="M12 14V18" stroke={A} strokeWidth="2" strokeLinecap="round" />
          {/* Accent Dot */}
          <circle cx="12" cy="20" r="1" fill={A} />
        </svg>
      </div>

      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span style={{ 
          fontSize: fontSize, 
          fontWeight: 900, 
          letterSpacing: "-.04em", 
          color: light ? "#fff" : "#111",
          display: "flex",
          alignItems: "center"
        }}>
          TEM<span style={{ color: A }}>eat</span>
        </span>
        {withTagline && (
          <span style={{ 
            fontSize: tagSize, 
            fontWeight: 600, 
            letterSpacing: ".05em", 
            color: light ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
            textTransform: "uppercase",
            marginTop: 2
          }}>
            Dijital Menü Sistemi
          </span>
        )}
      </div>
    </Link>
  );
};

export default Logo;
