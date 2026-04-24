import React from "react";

export function BarChart({ 
  data, 
  height = 140, 
  color = "#D4470A", 
  color2 = "#FF6B35" 
}: { 
  data: { day: string; views: number; orders: number }[]; 
  height?: number;
  color?: string;
  color2?: string;
}) {
  const maxViews = Math.max(...data.map(d => d.views), 1);
  const maxIdx = data.reduce((mi, d, i) => d.views > data[mi].views ? i : mi, 0);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
          <div style={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", position: "relative" }}>
            {i === maxIdx && d.views > 0 && (
              <div style={{ position: "absolute", top: -28, left: "50%", transform: "translateX(-50%)", background: color, color: "#fff", fontSize: 9, fontWeight: 700, padding: "3px 7px", borderRadius: 5, whiteSpace: "nowrap" }}>{d.views}</div>
            )}
            <div style={{ width: "100%", height: `${(d.views / maxViews) * 100}%`, minHeight: 4, background: i === maxIdx ? `linear-gradient(to top, ${color}, ${color2})` : "rgba(255,255,255,.07)", borderRadius: "4px 4px 0 0" }} />
          </div>
          <span style={{ fontSize: 10, fontWeight: i === maxIdx ? 700 : 400, color: i === maxIdx ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.25)" }}>{d.day}</span>
        </div>
      ))}
    </div>
  );
}
