import React, { useState, useEffect } from "react";
import { addMonths, addWeeks, addDays, format } from "date-fns";
import { ja } from "date-fns/locale";
import Gantt from "./components/Gantt";
import SmallCalendar from "./components/SmallCalendar";
import "./App.css";

export default function App() {
    const [view, setView] = useState("month"); // "month" | "week" | "day"
    const [currentDate, setCurrentDate] = useState(new Date());

    const [tasks, setTasks] = useState([
        { id: 1, title: "企画会議", start: "2025-09-02", end: "2025-09-04", color: "#4caf50", description: "要件確認", members: ["佐藤","鈴木"] },
        { id: 2, title: "実装A", start: "2025-09-03", end: "2025-09-10", color: "#2196f3", description: "主要機能", members: ["田中"] },
        { id: 3, title: "テスト", start: "2025-09-09", end: "2025-09-12", color: "#ff9800", description: "結合テスト", members: ["高橋","斎藤"] },
        { id: 4, title: "デプロイ", start: "2025-09-15", end: "2025-09-15", color: "#e91e63", description: "本番反映", members: ["山田"] },
    ]);

    // 編集中のタスク（null: 追加モード）
    const [editingTask, setEditingTask] = useState(null);

    // フォーム用 state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [membersInput, setMembersInput] = useState(""); // カンマ区切りの入力
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        return d.toISOString().slice(0,10);
    });
    const [startTime, setStartTime] = useState("09:00");
    const [endDate, setEndDate] = useState(() => {
        const d = new Date();
        return d.toISOString().slice(0,10);
    });
    const [endTime, setEndTime] = useState("17:00");
    const [color, setColor] = useState("#4caf50");

    // editingTask が変わったらフォームをプリセット、nullなら初期値に戻す
    useEffect(() => {
        if (editingTask) {
            const s = editingTask.start || "";
            const e = editingTask.end || "";
            const [sDate, sTime] = s.split("T");
            const [eDate, eTime] = e.split("T");
            setTitle(editingTask.title || "");
            setDescription(editingTask.description || "");
            setMembersInput((editingTask.members || []).join(", "));
            setStartDate(sDate || new Date().toISOString().slice(0,10));
            setStartTime(sTime || "09:00");
            setEndDate(eDate || new Date().toISOString().slice(0,10));
            setEndTime(eTime || "17:00");
            setColor(editingTask.color || "#4caf50");
        } else {
            const today = new Date().toISOString().slice(0,10);
            setTitle("");
            setDescription("");
            setMembersInput("");
            setStartDate(today);
            setStartTime("09:00");
            setEndDate(today);
            setEndTime("17:00");
            setColor("#4caf50");
        }
    }, [editingTask]);

    const addTask = (e) => {
        e.preventDefault();
        if (!title.trim()) return window.alert("タイトルを入力してください。");

        const sTime = startTime || "00:00";
        const eTime = endTime || "00:00";
        const startISO = `${startDate}T${sTime}`;
        const endISO = `${endDate}T${eTime}`;

        const members = membersInput
          .split(",")
          .map(m => m.trim())
          .filter(Boolean);

        const newTask = {
            id: Date.now(),
            title: title.trim(),
            description: description.trim(),
            start: startISO,
            end: endISO,
            color,
            members,
        };

        setTasks(prev => [...prev, newTask]);

        // リセット
        setTitle("");
        setDescription("");
        setMembersInput("");
    };

    const updateTask = (e) => {
        e.preventDefault();
        if (!editingTask) return;
        if (!title.trim()) return window.alert("タイトルを入力してください。");

        const sTime = startTime || "00:00";
        const eTime = endTime || "00:00";
        const startISO = `${startDate}T${sTime}`;
        const endISO = `${endDate}T${eTime}`;

        const members = membersInput
          .split(",")
          .map(m => m.trim())
          .filter(Boolean);

        const updated = {
            ...editingTask,
            title: title.trim(),
            description: description.trim(),
            start: startISO,
            end: endISO,
            color,
            members,
        };

        setTasks(prev => prev.map(t => t.id === editingTask.id ? updated : t));
        setEditingTask(null);
    };

    const deleteTask = () => {
        if (!editingTask) return;
        if (!window.confirm("本当に削除しますか？")) return;
        setTasks(prev => prev.filter(t => t.id !== editingTask.id));
        setEditingTask(null);
    };

    const cancelEdit = () => {
        setEditingTask(null);
    };

    // view に応じて前／次移動
    const goPrev = () => {
        setCurrentDate(d => {
            if (view === "month") return addMonths(d, -1);
            if (view === "week") return addWeeks(d, -1);
            return addDays(d, -1);
        });
    };
    const goNext = () => {
        setCurrentDate(d => {
            if (view === "month") return addMonths(d, 1);
            if (view === "week") return addWeeks(d, 1);
            return addDays(d, 1);
        });
    };

    // task update from Gantt (timing changed)
    const handleTaskUpdate = (updated) => {
        setTasks(prev => prev.map(t => t.id === updated.id ? { ...t, ...updated } : t));
        // clear editing if updated while editing
        setEditingTask((et) => (et && et.id === updated.id ? { ...et, ...updated } : et));
    };

    // サイドバー折りたたみ状態
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // layout: sidebar + main content
    return (
        <div className="app">
            <div className={`layout ${sidebarCollapsed ? "collapsed" : ""}`}>
                <aside className="sidebar">
                    {/* 折りたたみボタン（常に表示） */}
                    <div className="sidebar-toggle">
                      <button onClick={() => setSidebarCollapsed(s => !s)} aria-label={sidebarCollapsed ? "展開" : "折りたたむ"}>
                        {sidebarCollapsed ? "▶" : "◀"}
                      </button>
                    </div>

                    <div className="sidebar-section">
                      <div style={{fontWeight:700, marginBottom:6}}>表示切替</div>

                      {/* フル表示のボタン群 */}
                      <div className="view-buttons full-view" style={{display:"flex", flexDirection:"column", gap:6}}>
                        <button onClick={() => setView("month")} className={view==="month"?"active":""}>月</button>
                        <button onClick={() => setView("week")} className={view==="week"?"active":""}>週</button>
                        <button onClick={() => setView("day")} className={view==="day"?"active":""}>日</button>
                      </div>

                      {/* 折りたたみ時に表示するコンパクトなアイコン（テキストを隠す） */}
                      <div className="view-buttons compact-view" style={{display:"none", flexDirection:"column", gap:6, alignItems:"center"}}>
                        <button className={view==="month"?"active":""} onClick={()=>setView("month")} title="月">🗓</button>
                        <button className={view==="week"?"active":""} onClick={()=>setView("week")} title="週">📅</button>
                        <button className={view==="day"?"active":""} onClick={()=>setView("day")} title="日">🕒</button>
                      </div>
                    </div>

                    <div className="sidebar-section">
                      {/* フルナビ（非折りたたみ時） */}
                      <div className="full-nav" style={{display:"block"}}>
                        <div style={{display:"flex", gap:8, alignItems:"center", marginBottom:8}}>
                          <button onClick={goPrev}>◀</button>
                          <div style={{fontWeight:600}} className="nav-date">{format(currentDate, "yyyy年M月d日 (EEE)", { locale: ja })}</div>
                          <button onClick={goNext}>▶</button>
                        </div>
                        <button onClick={() => setCurrentDate(new Date())}>今日</button>
                      </div>

                      {/* 折りたたみ時の簡易ナビ */}
                      <div className="compact-nav" style={{display:"none", textAlign:"center"}}>
                        <div style={{display:"flex", flexDirection:"column", gap:6}}>
                          <button onClick={goPrev} title="前">◀</button>
                          <button onClick={() => setCurrentDate(new Date())} title="今日">今日</button>
                          <button onClick={goNext} title="次">▶</button>
                        </div>
                      </div>
                    </div>

                    <div className="sidebar-section small-calendar-section">
                      <SmallCalendar selected={currentDate} onSelect={(d)=>setCurrentDate(d)} />
                    </div>
                </aside>

                <main className="content">
                    {/* 予定追加／編集フォーム */}
                    <section className="add-form" style={{ marginBottom: 12, padding: 10, border: "1px solid #eee", borderRadius: 6 }}>
                        <form onSubmit={editingTask ? updateTask : addTask} style={{display:"grid", gridTemplateColumns:"repeat(6, 1fr)", gap:8, alignItems:"center"}}>
                            <input type="text" placeholder="タイトル" value={title} onChange={e=>setTitle(e.target.value)} style={{gridColumn:"span 2", padding:6}} />
                            <input type="text" placeholder="メンバー (カンマ区切り)" value={membersInput} onChange={e=>setMembersInput(e.target.value)} style={{padding:6}} />
                            <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} style={{padding:6}} />
                            <input type="time" value={startTime} onChange={e=>setStartTime(e.target.value)} style={{padding:6}} />
                            <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} style={{padding:6}} />
                            <input type="time" value={endTime} onChange={e=>setEndTime(e.target.value)} style={{padding:6}} />

                            <textarea placeholder="説明" value={description} onChange={e=>setDescription(e.target.value)} style={{gridColumn:"1 / span 4", padding:6, minHeight:40}} />

                            <input type="color" value={color} onChange={e=>setColor(e.target.value)} title="色" style={{width:44, height:36, padding:0, border:"none"}} />

                            <div style={{display:"flex", gap:8, alignItems:"center"}}>
                                <button type="submit" className={editingTask ? "btn-update" : "btn-add"} style={{padding:"8px 12px"}}>{editingTask ? "更新" : "追加"}</button>
                                {editingTask && <button type="button" onClick={deleteTask} style={{padding:"8px 12px", background:"#e53935", color:"white"}}>削除</button>}
                                {editingTask && <button type="button" onClick={cancelEdit} style={{padding:"8px 12px"}}>キャンセル</button>}
                            </div>
                        </form>
                    </section>

                    {/* 元の単一グリッド状態に戻す（.gantt-wrap を使わない） */}
                    <div style={{ paddingTop: 6 }}>
                        <Gantt
                          tasks={tasks}
                          view={view}
                          currentDate={currentDate}
                          onTaskClick={(t)=>setEditingTask(t)}
                          editingTaskId={editingTask?.id}
                          onTaskUpdate={handleTaskUpdate}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}