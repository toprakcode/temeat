"use client";

import React from "react";
import QRCode from "react-qr-code";

interface QRCodeFrameProps {
  value: string;
  tableNo?: string | number;
  size?: number;
  id?: string;
  isPrint?: boolean;
  restaurant: any;
  qrColor: string;
  qrBgColor: string;
  qrFrameType: string;
  qrLogoVisible: boolean;
}

export const QRCodeFrame: React.FC<QRCodeFrameProps> = ({
  value,
  tableNo,
  size = 200,
  id,
  isPrint = false,
  restaurant,
  qrColor,
  qrBgColor,
  qrFrameType,
  qrLogoVisible
}) => {
  const isMain = tableNo === undefined;
  const finalSize = isPrint ? 140 : size;
  const logoSize = Math.floor(finalSize * 0.22);
  
  return (
    <div id={id} style={{ 
      position: "relative", 
      padding: qrFrameType === "none" ? 20 : isPrint ? 25 : (isMain ? 40 : 25), 
      background: qrBgColor, 
      borderRadius: qrFrameType === "elegant" ? (isPrint ? 25 : 40) : (isPrint ? 16 : 24), 
      boxShadow: isPrint ? "none" : (isMain ? "0 20px 50px rgba(0,0,0,.3)" : "0 8px 20px rgba(0,0,0,.1)"), 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center",
      border: qrFrameType === "minimal" ? `1px solid ${qrColor}20` : (isPrint ? "1px solid #eee" : "none"),
      width: isPrint ? "180px" : "auto",
      transition: "transform .2s"
    }}>
      {qrFrameType === "elegant" && (
        <div style={{ marginBottom: isPrint ? 15 : (isMain ? 25 : 15), textAlign: "center", width: "100%" }}>
          <div style={{ fontSize: isPrint ? 14 : (isMain ? 20 : 12), fontWeight: 900, color: qrColor, letterSpacing: "0.15em", fontFamily: "serif" }}>{restaurant?.name?.toUpperCase()}</div>
          <div style={{ height: 1.5, width: "60%", background: `linear-gradient(90deg, transparent, ${qrColor}, transparent)`, margin: (isPrint ? 6 : (isMain ? 10 : 6)) + "px auto" }} />
          <div style={{ fontSize: isPrint ? 7 : (isMain ? 9 : 6), color: qrColor, opacity: 0.6, letterSpacing: "0.3em", fontWeight: 700 }}>GURME LEZZET DURAGI</div>
        </div>
      )}

      {qrFrameType === "modern" && (
        <div style={{ position: "absolute", top: isPrint ? -12 : (isMain ? -18 : -12), background: qrColor, color: qrBgColor, padding: isPrint ? "4px 14px" : (isMain ? "8px 24px" : "4px 14px"), borderRadius: isPrint ? 8 : (isMain ? 14 : 8), fontSize: isPrint ? 9 : (isMain ? 12 : 9), fontWeight: 900, boxShadow: isPrint ? "none" : `0 8px 20px ${qrColor}40`, letterSpacing: "0.05em", whiteSpace: "nowrap", zIndex: 2 }}>MENÜYÜ TARA</div>
      )}

      <div style={{ position: "relative", padding: isPrint ? 8 : (isMain ? 12 : 8), background: "#fff", borderRadius: isPrint ? 10 : (isMain ? 16 : 10), boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <QRCode value={value} size={finalSize} fgColor={qrColor} bgColor="#ffffff" level="H" />
        {qrLogoVisible && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: logoSize, height: logoSize, background: "#fff", borderRadius: isPrint ? 6 : (isMain ? 12 : 6), padding: isPrint ? 2 : (isMain ? 4 : 2), display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", overflow: "hidden" }}>
              {restaurant?.logo_url ? (
                <img src={restaurant.logo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: isPrint ? 3 : (isMain ? 6 : 3) }} />
              ) : (
                <div style={{ width: "100%", height: "100%", background: qrColor, borderRadius: isPrint ? 4 : (isMain ? 8 : 4), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: Math.floor(logoSize * 0.5), fontWeight: 900 }}>{restaurant?.name?.[0] || "T"}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {qrFrameType === "minimal" && (
        <div style={{ marginTop: isPrint ? 12 : (isMain ? 20 : 12), textAlign: "center" }}>
          <div style={{ fontSize: isPrint ? 8 : (isMain ? 11 : 8), fontWeight: 700, color: qrColor, letterSpacing: "0.1em" }}>MASA NUMARASI</div>
          <div style={{ fontSize: isPrint ? 14 : (isMain ? 18 : 14), fontWeight: 900, color: qrColor, marginTop: 2 }}>{tableNo || "00"}</div>
        </div>
      )}
      
      {qrFrameType === "modern" && (
        <div style={{ marginTop: isPrint ? 12 : (isMain ? 24 : 12), textAlign: "center", display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ height: 1, width: isMain ? 15 : 10, background: qrColor, opacity: 0.2 }} />
          <div style={{ fontSize: isPrint ? 8 : (isMain ? 11 : 8), fontWeight: 800, color: qrColor, opacity: 0.5, letterSpacing: "0.1em" }}>MASA {tableNo || "00"}</div>
          <div style={{ height: 1, width: isMain ? 15 : 10, background: qrColor, opacity: 0.2 }} />
        </div>
      )}

      {qrFrameType === "elegant" && (
        <div style={{ marginTop: isPrint ? 15 : (isMain ? 28 : 15), display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ fontSize: isPrint ? 8 : (isMain ? 10 : 8), fontWeight: 700, color: qrColor, opacity: 0.5, letterSpacing: "0.2em" }}>MASA {tableNo || "00"}</div>
          <div style={{ width: 3, height: 3, borderRadius: 99, background: qrColor, opacity: 0.3 }} />
        </div>
      )}
      
      {qrFrameType === "none" && !isMain && (
         <div style={{ marginTop: 10, fontSize: 12, fontWeight: 900, color: qrColor }}>MASA {tableNo}</div>
      )}
    </div>
  );
};
