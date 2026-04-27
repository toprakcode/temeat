import React from "react";

export function BarChart({ 
  data, 
  height = 140, 
  color = "#D4470A", 
}: { 
  data: { day: string; views: number; orders: number }[]; 
  height?: number;
  color?: string;
}) {
  const maxViews = Math.max(...data.map(d => d.views), 1);
  const currentDay = new Date().toLocaleDateString("tr-TR", { weekday: "short" }).replace(".", "");

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "2%", height, width: "100%" }}>
      {data.map((d, i) => {
        const isToday = d.day.toLowerCase() === currentDay.toLowerCase();
        const heightPct = (d.views / maxViews) * 100;
        
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, height: "100%", position: "relative" }}>
            <div style={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", position: "relative" }}>
              
              {/* HOVER TOOLTIP (CSS handled via inline title for simplicity or custom div) */}
              <div className="bar-hover-box" style={{ 
                width: "100%", 
                height: `${heightPct}%`, 
                minHeight: 4, 
                background: isToday 
                  ? `linear-gradient(180deg, ${color} 0%, ${color}aa 100%)` 
                  : "rgba(255,255,255,0.06)", 
                borderRadius: "6px 6px 4px 4px",
                position: "relative",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer",
                boxShadow: isToday ? `0 4px 15px ${color}30` : "none"
              }}>
                {isToday && (
                  <div style={{ 
                    position: "absolute", 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    background: `linear-gradient(0deg, transparent 0%, rgba(255,255,255,0.1) 100%)`,
                    borderRadius: "inherit"
                  }} />
                )}
                {d.views > 0 && (
                  <div style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", fontSize: 9, fontWeight: 700, color: isToday ? color : "rgba(255,255,255,.3)" }}>{d.views}</div>
                )}
              </div>
            </div>
            <span style={{ 
              fontSize: 10, 
              fontWeight: 800, 
              color: isToday ? color : "rgba(255,255,255,0.2)",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>{d.day}</span>
          </div>
        );
      })}
    </div>
  );
}
