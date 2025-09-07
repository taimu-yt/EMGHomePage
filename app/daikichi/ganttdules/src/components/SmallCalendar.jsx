import React, { useState } from "react";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameMonth, isSameDay, subMonths, addMonths } from "date-fns";
import { ja } from "date-fns/locale";

export default function SmallCalendar({ selected, onSelect }) {
  const [monthBase, setMonthBase] = useState(selected || new Date());

  const start = startOfWeek(startOfMonth(monthBase), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(monthBase), { weekStartsOn: 1 });

  const days = [];
  for (let d = start; d <= end; d = addDays(d, 1)) {
    days.push(d);
  }

  return (
    <div className="small-calendar" style={{ width: 220, border: "1px solid #eee", borderRadius: 6, padding: 8, background: "#fff", boxSizing: "border-box" }}>
      <div className="small-cal-nav" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <button type="button" className="small-cal-nav-btn" onClick={() => setMonthBase((m) => subMonths(m, 1))} style={{ border: "none", background: "transparent", cursor: "pointer" }}>◀</button>
        <div style={{ fontWeight: 700 }}>{format(monthBase, "yyyy年M月", { locale: ja })}</div>
        <button type="button" className="small-cal-nav-btn" onClick={() => setMonthBase((m) => addMonths(m, 1))} style={{ border: "none", background: "transparent", cursor: "pointer" }}>▶</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, fontSize: 12, marginBottom: 6 }}>
        {["月","火","水","木","金","土","日"].map((d, i) => (
          <div key={i} style={{ textAlign: "center", color: i === 5 ? "#1976d2" : i === 6 ? "#e53935" : "#555", fontWeight: 600 }}>{d}</div>
        ))}
      </div>

      <div className="small-cal-grid" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {days.map((d, i) => {
          const inMonth = isSameMonth(d, monthBase);
          const isSelected = selected && isSameDay(d, selected);
          return (
            <button
              key={i}
              className="small-cal-day"
              onClick={() => onSelect && onSelect(d)}
              style={{
                padding: 6,
                borderRadius: 4,
                border: isSelected ? "2px solid #4fc3f7" : "1px solid #f0f0f0",
                background: isSelected ? "#e1f5fe" : "#fff",
                color: d.getDay() === 6 ? "#1976d2" : d.getDay() === 0 ? "#e53935" : inMonth ? "#111" : "#bbb",
                cursor: "pointer",
                fontSize: 13,
                boxSizing: "border-box",
              }}
              title={format(d, "yyyy-MM-dd", { locale: ja })}
            >
              {format(d, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}