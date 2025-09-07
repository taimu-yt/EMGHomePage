import React, { useRef, useState, useEffect } from "react";
import {
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  differenceInDays,
  differenceInHours,
  addDays,
  addHours,
  format,
  differenceInMinutes,
} from "date-fns";
import { ja } from "date-fns/locale";

function getRange(view, currentDate) {
  if (view === "month") {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = differenceInDays(end, start) + 1;
    const columns = Array.from({ length: days }).map((_, i) => addDays(start, i));
    return { start, end, columns, unit: "day" };
  }
  if (view === "week") {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = differenceInDays(end, start) + 1;
    const columns = Array.from({ length: days }).map((_, i) => addDays(start, i));
    return { start, end, columns, unit: "day" };
  }
  const start = startOfDay(currentDate);
  const end = endOfDay(currentDate);
  const columns = Array.from({ length: 24 }).map((_, i) => addHours(start, i));
  return { start, end, columns, unit: "hour" };
}

export default function Gantt({ tasks, view, currentDate, onTaskClick, editingTaskId, onTaskUpdate }) {
  const range = getRange(view, currentDate);

  const containerRef = useRef(null);
  const gridRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 900));

  useEffect(() => {
    const measure = () => {
      const el = containerRef.current;
      const w = el ? el.clientWidth : (typeof window !== "undefined" ? window.innerWidth : 900);
      setContainerWidth(Math.max(300, w));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // layout
  const leftColumnWidth = 220;
  const colCount = range.columns.length;
  const availableForRight = Math.max(200, containerWidth - leftColumnWidth);
  const minColWidth = range.unit === "hour" ? 60 : 48;
  const desired = availableForRight / Math.max(1, colCount);
  const colWidth = desired < minColWidth ? minColWidth : desired;

  // grid template columns string: left + repeated columns
  const gridTemplateColumns = `${leftColumnWidth}px ${Array.from({ length: colCount }).map(() => `${colWidth}px`).join(" ")}`;

  // visible tasks (within range)
  const rStartMs = range.start.getTime();
  const rEndMs = range.end.getTime();
  const visibleTasks = tasks.filter((t) => {
    try {
      const sMs = parseISO(t.start).getTime();
      const eMs = parseISO(t.end).getTime();
      return eMs >= rStartMs && sMs <= rEndMs;
    } catch {
      return false;
    }
  });

  // helpers to compute start/end column indices (0-based)
  const getStartIndex = (d) => {
    const dt = typeof d === "string" ? parseISO(d) : d;
    if (range.unit === "day") return Math.max(0, differenceInDays(dt, range.start));
    return Math.max(0, Math.floor(differenceInMinutes(dt, range.start) / 60));
  };

  const getEndIndexExclusiveBetter = (d) => {
    const dt = typeof d === "string" ? parseISO(d) : d;
    if (range.unit === "day") return Math.min(colCount, differenceInDays(dt, range.start) + 1);
    return Math.min(colCount, Math.ceil(differenceInMinutes(dt, range.start) / 60) + 1);
  };

  // drag/resize state (preview shown)
  const [previewMap, setPreviewMap] = useState({}); // taskId -> {startIdx, endIdx}
  const draggingRef = useRef(null); // {type, taskId, origStartIdx, origEndIdx, pointerX0}

  useEffect(() => {
    const handleMove = (ev) => {
      if (!draggingRef.current) return;
      ev.preventDefault();
      const { type, taskId, origStartIdx, origEndIdx, pointerX0 } = draggingRef.current;
      const clientX = ev.clientX ?? (ev.touches && ev.touches[0] && ev.touches[0].clientX) ?? 0;
      const gridEl = gridRef.current;
      if (!gridEl) return;
      const gridRect = gridEl.getBoundingClientRect();
      const deltaPx = clientX - pointerX0;
      const deltaCols = Math.round(deltaPx / colWidth);

      let newStart = origStartIdx;
      let newEnd = origEndIdx;
      if (type === "move") {
        newStart = Math.max(0, Math.min(colCount - 1, origStartIdx + deltaCols));
        newEnd = Math.max(newStart + 1, Math.min(colCount, origEndIdx + deltaCols));
      } else if (type === "resize-left") {
        newStart = Math.max(0, Math.min(origEndIdx - 1, origStartIdx + deltaCols));
      } else if (type === "resize-right") {
        newEnd = Math.max(origStartIdx + 1, Math.min(colCount, origEndIdx + deltaCols));
      }

      setPreviewMap((p) => ({ ...p, [taskId]: { startIdx: newStart, endIdx: newEnd } }));
    };

    const handleUp = (ev) => {
      if (!draggingRef.current) return;
      ev.preventDefault();
      const { taskId } = draggingRef.current;
      const preview = previewMap[taskId];
      const t = tasks.find((x) => x.id === taskId);
      if (preview && t) {
        // compute new dates based on preview indices
        let newStartDate, newEndDate;
        if (range.unit === "day") {
          newStartDate = format(addDays(range.start, preview.startIdx), "yyyy-MM-dd");
          // end index is exclusive -> set end to endIdx-1
          newEndDate = format(addDays(range.start, preview.endIdx - 1), "yyyy-MM-dd");
        } else {
          const s = addHours(range.start, preview.startIdx);
          const e = addHours(range.start, preview.endIdx - 1);
          newStartDate = format(s, "yyyy-MM-dd'T'HH':'00");
          newEndDate = format(e, "yyyy-MM-dd'T'HH':'00");
        }
        // call parent update
        onTaskUpdate && onTaskUpdate({ ...t, start: newStartDate, end: newEndDate });
      }

      // clear
      draggingRef.current = null;
      setPreviewMap((p) => {
        const np = { ...p };
        delete np[taskId];
        return np;
      });
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };

    if (draggingRef.current) {
      window.addEventListener("pointermove", handleMove, { passive: false });
      window.addEventListener("pointerup", handleUp, { passive: false });
    }

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [previewMap, tasks, colWidth, onTaskUpdate, range, colCount]);

  // pointer down starter
  const startDrag = (ev, type, taskId, origStartIdx, origEndIdx) => {
    ev.preventDefault();
    const clientX = ev.clientX ?? (ev.touches && ev.touches[0] && ev.touches[0].clientX) ?? 0;
    draggingRef.current = { type, taskId, origStartIdx, origEndIdx, pointerX0: clientX };
    // set initial preview
    setPreviewMap((p) => ({ ...p, [taskId]: { startIdx: origStartIdx, endIdx: origEndIdx } }));
    // ensure listeners are added via effect
  };

  return (
    <div className="gantt-excel" ref={containerRef}>
      <div
        className="excel-grid"
        ref={gridRef}
        style={{
          display: "grid",
          gridTemplateColumns,
          gridAutoRows: "56px",
          border: "1px solid #eee",
          borderRadius: 6,
          overflow: "auto",
        }}
      >
        {/* header: left empty cell */}
        <div className="cell header-left" style={{ borderRight: "1px solid #f0f0f0", background: "#fff" }} />
        {range.columns.map((col, ci) => {
          const day = col.getDay();
          const isSat = day === 6;
          const isSun = day === 0;
          const label = range.unit === "day" ? format(col, "MM/dd (EEE)", { locale: ja }) : format(col, "HH:00");
          return (
            <div
              key={ci}
              className={`cell header ${isSat ? "sat" : isSun ? "sun" : ""}`}
              style={{ borderRight: "1px solid #f4f4f4", textAlign: "center", padding: 8, boxSizing: "border-box" }}
            >
              <div style={{ fontSize: 12, color: isSat ? "#1976d2" : isSun ? "#e53935" : "inherit" }}>{label}</div>
            </div>
          );
        })}

        {/* rows: for each visible task render left title cell + right empty cells then task bar positioned via grid-column */}
        {visibleTasks.map((t, rowIndex) => {
          const start = parseISO(t.start);
          const end = parseISO(t.end);
          const startClamped = start < range.start ? range.start : start;
          const endClamped = end > range.end ? range.end : end;

          const startIdx = getStartIndex(startClamped);
          // compute endIdx exclusive: for day view just +1; for hour view ensure at least 1
          const endIdx =
            range.unit === "day"
              ? Math.min(colCount, differenceInDays(endClamped, range.start) + 1)
              : Math.min(colCount, Math.ceil(differenceInMinutes(endClamped, range.start) / 60) + 1);

          // left title cell
          const isSelected = editingTaskId && editingTaskId === t.id;
          const gridRowIndex = rowIndex + 2; // header is row 1, tasks start at row 2

          return (
            <React.Fragment key={t.id}>
              <div
                className={`cell left-cell ${isSelected ? "selected" : ""}`}
                onClick={() => onTaskClick && onTaskClick(t)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  padding: "8px 12px",
                  borderRight: "1px solid #f4f4f4",
                  boxSizing: "border-box",
                  cursor: "pointer",
                  background: isSelected ? "rgba(25,118,210,0.04)" : "#fff",
                  gridColumn: 1,
                  gridRow: gridRowIndex,
                }}
                title={t.description || ""}
              >
                <div className="left-title" style={{ fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.title}</div>

                {/* members 表示（タイトル列は「タイトル」と「メンバー」のみ） */}
                {Array.isArray(t.members) && t.members.length > 0 && (
                  <div className="left-members" style={{ fontSize: 12, color: "#555", marginTop: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {t.members.join(", ")}
                  </div>
                )}
              </div>

              {/* render right-side empty cells for this row (cells themselves are empty to look like Excel) */}
              {range.columns.map((_, ci) => (
                <div
                  key={ci}
                  className="cell grid-cell"
                  style={{
                    borderRight: "1px solid #f7f7f7",
                    boxSizing: "border-box",
                    gridColumn: ci + 2,
                    gridRow: gridRowIndex,
                  }}
                />
              ))}

              {/* task bar: positioned by gridColumn start/end (grid is 1-based: left column is 1) */}
              <div
                className={`task-bar${isSelected ? " selected" : ""}`}
                style={{
                  gridColumn: `${startIdx + 2} / ${endIdx + 2}`, // data columns start at 2
                  gridRow: gridRowIndex,
                  alignSelf: "center",
                  height: 32,
                  borderRadius: 6,
                  background: t.color,
                  boxShadow: isSelected ? "0 6px 14px rgba(0,0,0,0.12)" : "none",
                  cursor: "pointer",
                  position: "relative",
                }}
                onPointerDown={(e) => {
                  // don't start move if started on handle: handle will call its own
                  const tgt = e.target;
                  if (tgt && typeof HTMLElement !== "undefined" && tgt instanceof HTMLElement && tgt.dataset && tgt.dataset.handle) {
                    return;
                  }
                  startDrag(e, "move", t.id, startIdx, endIdx);
                }}
                onClick={() => onTaskClick && onTaskClick(t)}
                title={`${t.title}\n${t.description || ""}\n${format(start, "yyyy-MM-dd HH:mm", { locale: ja })} - ${format(end, "yyyy-MM-dd HH:mm", { locale: ja })}`}
              >
                <div
                  data-handle="left"
                  onPointerDown={(e) => { e.stopPropagation(); startDrag(e, "resize-left", t.id, startIdx, endIdx); }}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 10,
                    cursor: "ew-resize",
                    zIndex: 6,
                  }}
                />
                <div
                  data-handle="right"
                  onPointerDown={(e) => { e.stopPropagation(); startDrag(e, "resize-right", t.id, startIdx, endIdx); }}
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: 10,
                    cursor: "ew-resize",
                    zIndex: 6,
                  }}
                />
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}