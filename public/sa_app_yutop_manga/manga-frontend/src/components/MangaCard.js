import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function MangaCard({ manga, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: manga.id });

  const cardStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "0",
    minHeight: "180px",   // 高さは最低限確保、内容が長ければ伸びる
  };

  const dragHandleStyle = {
    cursor: "grab",
    padding: "8px",
    borderBottom: "1px solid #ccc",
    fontWeight: "bold",
    textAlign: "center",
    background: "#f1f1f1",
    borderTopLeftRadius: "8px",
    borderTopRightRadius: "8px",
  };

  const contentStyle = {
    flexGrow: 1,
    padding: "8px",
    overflowWrap: "break-word",  // 長いコメントやURLがはみ出さないように
  };

  const buttonContainerStyle = {
    display: "flex",
    justifyContent: "center",
    padding: "8px",
    gap: "8px",
    borderTop: "1px solid #eee",
    flexShrink: 0, // ボタンが縮まないようにする
  };

  return (
    <div ref={setNodeRef} style={cardStyle}>
      <div {...attributes} {...listeners} style={dragHandleStyle}>
        {manga.title}
      </div>

      <div style={contentStyle}>
        <p>巻数: {manga.volume}</p>
        {manga.comment && <p>{manga.comment}</p>}
        {manga.url && (
          <a href={manga.url} target="_blank" rel="noopener noreferrer">
            保存されているリンクへ↗
          </a>
        )}
      </div>

      <div style={buttonContainerStyle}>
        <button className="btn btn-sm btn-info" onClick={() => onEdit(manga)}>
          編集
        </button>
        <button className="btn btn-sm btn-danger" onClick={() => onDelete(manga.id)}>
          削除
        </button>
      </div>
    </div>
  );
}
