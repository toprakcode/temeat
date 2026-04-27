"use client";

import React from "react";
import { Order, ServiceRequest } from "@/types";

interface TableGridProps {
  tableCount: number;
  orders: Order[];
  serviceRequests: ServiceRequest[];
  themeColor: string;
  onTableClick: (tableNo: string) => void;
}

export function TableGrid({
  tableCount,
  orders,
  serviceRequests,
  themeColor,
  onTableClick
}: TableGridProps) {
  
  const tables = Array.from({ length: tableCount }, (_, i) => String(i + 1));

  const getTableStatus = (tableNo: string) => {
    const activeRequests = serviceRequests.filter(r => r.table_no === tableNo && r.status === "pending");
    const activeOrders = orders.filter(o => o.table_no === tableNo && o.status !== "completed" && o.status !== "cancelled");

    if (activeRequests.length > 0) return "needs_attention"; // Purple
    if (activeOrders.some(o => o.status === "pending" || o.status === "preparing")) return "occupied"; // Red
    if (activeOrders.some(o => o.status === "ready")) return "ready"; // Blue
    return "free"; // Green
  };

  const statusStyles: Record<string, any> = {
    needs_attention: {
      bg: "rgba(168, 85, 247, 0.1)",
      border: "rgba(168, 85, 247, 0.4)",
      color: "#a855f7",
      label: "İstek Var"
    },
    occupied: {
      bg: "rgba(239, 68, 68, 0.1)",
      border: "rgba(239, 68, 68, 0.4)",
      color: "#ef4444",
      label: "Mutfakta"
    },
    ready: {
      bg: "rgba(59, 130, 246, 0.1)",
      border: "rgba(59, 130, 246, 0.4)",
      color: "#3b82f6",
      label: "Hazır"
    },
    free: {
      bg: "rgba(34, 197, 94, 0.05)",
      border: "rgba(34, 197, 94, 0.1)",
      color: "#22c55e",
      label: "Müsait"
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 16 }}>
      {tables.map(no => {
        const status = getTableStatus(no);
        const style = statusStyles[status];
        
        return (
          <div 
            key={no} 
            onClick={() => onTableClick(no)}
            className="card"
            style={{ 
              padding: "20px 16px", 
              textAlign: "center", 
              cursor: "pointer", 
              background: style.bg, 
              borderColor: style.border,
              transition: "all .2s",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{no}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: style.color, textTransform: "uppercase", letterSpacing: ".05em" }}>
              {style.label}
            </div>
            
            {/* Minimal Indicator */}
            <div style={{ 
              position: "absolute", 
              top: 10, 
              right: 10, 
              width: 8, 
              height: 8, 
              borderRadius: "50%", 
              background: style.color,
              boxShadow: `0 0 10px ${style.color}`
            }} />
          </div>
        );
      })}
    </div>
  );
}
