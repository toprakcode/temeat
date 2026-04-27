import React from 'react';
import Link from 'next/link';

interface LogoProps {
  isDark?: boolean;
  size?: 'sm' | 'md' | 'lg';
  withTagline?: boolean;
}

const Logo: React.FC<LogoProps> = ({ isDark = true, size = 'md', withTagline = true }) => {
  const A = "#D4470A"; // TEMeat Orange
  const iconSize = size === 'sm' ? 26 : size === 'lg' ? 52 : 36;
  const fontSize = size === 'sm' ? 17 : size === 'lg' ? 26 : 22;
  const tagSize = size === 'sm' ? 8 : size === 'lg' ? 12 : 10;

  return (
    <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
      {/* Custom Monogram Amblem: T & M forming a Digital Fork */}
      <div style={{ position: 'relative', width: iconSize, height: iconSize, flexShrink: 0 }}>
        <svg width={iconSize} height={iconSize} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background Plate / Shield */}
          <rect width="40" height="40" rx="10" fill={A} fillOpacity="0.1" />
          
          {/* The Monogram: A fusion of T, M and a Fork */}
          {/* Side Prongs (The 'M' part) */}
          <path d="M10 14V20C10 23.3137 12.6863 26 16 26H24C27.3137 26 30 23.3137 30 20V14" 
            stroke={A} strokeWidth="3.5" strokeLinecap="round" 
          />
          {/* Middle Prong & Handle (The 'T' part) */}
          <path d="M20 10V32" stroke={A} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M14 10H26" stroke={A} strokeWidth="3.5" strokeLinecap="round" />
          
          {/* Digital Accents */}
          <circle cx="20" cy="32" r="2" fill={A} />
        </svg>
      </div>

      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <div style={{ 
          fontSize: fontSize, 
          fontWeight: 900, 
          letterSpacing: "-.04em", 
          color: isDark ? "#fff" : "#000",
          display: "flex",
          alignItems: "center",
          fontFamily: "'Inter', sans-serif"
        }}>
          TEM<span style={{ color: A }}>eat</span>
        </div>
        {withTagline && (
          <div style={{ 
            fontSize: tagSize, 
            fontWeight: 800, 
            letterSpacing: ".15em", 
            color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)",
            textTransform: "uppercase",
            marginTop: 2
          }}>
            DİJİTAL MENÜ SİSTEMİ
          </div>
        )}
      </div>
    </Link>
  );
};

export default Logo;
