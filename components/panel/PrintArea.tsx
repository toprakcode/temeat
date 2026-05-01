"use client";

import React from "react";
import { QRCodeFrame } from "./QRCodeFrame";

interface PrintAreaProps {
  restaurant: any;
  qrColor: string;
  qrBgColor: string;
  qrFrameType: string;
  qrLogoVisible: boolean;
}

export const PrintArea: React.FC<PrintAreaProps> = ({
  restaurant,
  qrColor,
  qrBgColor,
  qrFrameType,
  qrLogoVisible
}) => {
  const planOrder = ["free", "yenimekan", "starter", "pro"];
  const currentPlanIndex = planOrder.indexOf(restaurant?.plan || "free");
  let count = 1;
  if (currentPlanIndex >= planOrder.indexOf("starter")) count = 10;
  if (currentPlanIndex >= planOrder.indexOf("pro")) count = restaurant?.table_count || 20;
  
  const qrBaseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://temeat.com.tr';
  const slugUrl = `${qrBaseUrl}/${restaurant?.slug}`;

  return (
    <div id="print-area" style={{ display: "none" }}>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(3, 1fr)", 
        gap: "30px", 
        padding: "20px",
        background: "#fff"
      }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "center", border: "1px dashed #eee", padding: "15px", borderRadius: "8px" }}>
            <QRCodeFrame 
              value={`${slugUrl}${count === 1 ? "" : `?table=${i+1}`}`} 
              tableNo={i + 1}
              isPrint={true}
              restaurant={restaurant}
              qrColor={qrColor}
              qrBgColor={qrBgColor}
              qrFrameType={qrFrameType}
              qrLogoVisible={qrLogoVisible}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
