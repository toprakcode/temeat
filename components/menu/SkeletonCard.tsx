import React from "react";

export function SkeletonCard() {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #EBEBEB", overflow: "hidden", display: "flex", flexDirection: "column", animation: "pulse 1.5s infinite ease-in-out" }}>
      <style>{`@keyframes pulse{0%{opacity:1}50%{opacity:.5}100%{opacity:1}}`}</style>
      <div style={{ width: "100%", paddingTop: "60%", background: "#f0f0f0" }} />
      <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ height: 16, width: "70%", background: "#f0f0f0", borderRadius: 4 }} />
        <div style={{ height: 12, width: "100%", background: "#f5f5f5", borderRadius: 4 }} />
        <div style={{ height: 12, width: "90%", background: "#f5f5f5", borderRadius: 4 }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "auto", paddingTop: 8 }}>
          <div style={{ height: 20, width: 60, background: "#f0f0f0", borderRadius: 4 }} />
          <div style={{ height: 28, width: 70, background: "#f0f0f0", borderRadius: 8 }} />
        </div>
      </div>
    </div>
  );
}
