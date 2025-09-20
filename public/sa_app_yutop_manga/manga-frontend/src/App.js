import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import MangaCard from "./components/MangaCard";


export default function App() {
  const [mangaList, setMangaList] = useState([]);
  const [title, setTitle] = useState("");
  const [volume, setVolume] = useState(1);
  const [comment, setComment] = useState("");
  const [url, setUrl] = useState("");

  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editVolume, setEditVolume] = useState(1);
  const [editComment, setEditComment] = useState("");
  const [editUrl, setEditUrl] = useState("");

  const apiBase = "http://localhost:4000";

  const fetchManga = async () => {
    try {
      const res = await fetch(`${apiBase}/manga`);
      const data = await res.json();
      setMangaList(data);
    } catch (err) {
      console.error("Failed to fetch:", err);
    }
  };

  useEffect(() => {
    fetchManga();
  }, []);

  const addManga = async () => {
    if (!title) return;
    await fetch(`${apiBase}/manga`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, volume, comment, url }),
    });
    setTitle(""); setVolume(1); setComment(""); setUrl("");
    fetchManga();
  };

  const deleteManga = async (id) => {
    await fetch(`${apiBase}/manga/${id}`, { method: "DELETE" });
    fetchManga();
  };

  const startEdit = (m) => {
    setEditId(m.id);
    setEditTitle(m.title);
    setEditVolume(m.volume);
    setEditComment(m.comment || "");
    setEditUrl(m.url || "");
  };

  const saveEdit = async () => {
    if (!editId) return;
    await fetch(`${apiBase}/manga/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        volume: editVolume,
        comment: editComment,
        url: editUrl,
      }),
    });
    setEditId(null); setEditTitle(""); setEditVolume(1); setEditComment(""); setEditUrl("");
    fetchManga();
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = mangaList.findIndex((m) => m.id === active.id);
    const newIndex = mangaList.findIndex((m) => m.id === over.id);
    const newList = arrayMove(mangaList, oldIndex, newIndex);
    setMangaList(newList);

    // DBに並び順保存
    const orderList = newList.map((m, index) => ({ id: m.id, order_index: index }));
    try {
      await fetch(`${apiBase}/manga/order`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderList }),
      });
    } catch (err) {
      console.error("Failed to update order:", err);
    }
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4 text-primary">読んだ漫画をまとめようネ</h1>

      {/* 追加フォーム */}
      <div className="card p-3 mb-4">
        <h5>新しい漫画を追加してネ</h5>
        <input className="form-control mb-2" placeholder="タイトル" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="number" className="form-control mb-2" min={1} value={volume} onChange={(e) => setVolume(Number(e.target.value))} />
        <input className="form-control mb-2" placeholder="コメント" value={comment} onChange={(e) => setComment(e.target.value)} />
        <input type="url" className="form-control mb-2" placeholder="URLを追加" value={url} onChange={(e) => setUrl(e.target.value)} />
        <button className="btn btn-primary" onClick={addManga}>追加</button>
      </div>

      {/* 編集フォーム */}
      {editId && (
        <div className="card p-3 mb-4">
          <h5>編集中</h5>
          <input className="form-control mb-2" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
          <input type="number" className="form-control mb-2" min={1} value={editVolume} onChange={(e) => setEditVolume(Number(e.target.value))} />
          <input className="form-control mb-2" value={editComment} onChange={(e) => setEditComment(e.target.value)} />
          <input className="form-control mb-2" value={editUrl} onChange={(e) => setEditUrl(e.target.value)} />
          <button className="btn btn-success me-2" onClick={saveEdit}>保存</button>
          <button className="btn btn-secondary" onClick={() => setEditId(null)}>キャンセル</button>
        </div>
      )}

      {/* ドラッグ可能グリッド */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={mangaList.map((m) => m.id)} strategy={verticalListSortingStrategy}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
            {mangaList.map((m) => (
              <MangaCard key={m.id} manga={m} onEdit={startEdit} onDelete={deleteManga} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
