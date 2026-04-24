import React from "react";

export function ModalWrapper({ children, onClick, zIndex }: { children: React.ReactNode; onClick: () => void; zIndex: number }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClick} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.5)", animation: "fadeIn .15s" }} />
      {children}
    </div>
  );
}
