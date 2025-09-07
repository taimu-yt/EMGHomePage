import React, { useState } from "react";
import Controls from "./Controls";
import WaveForm from "./WaveForm";
import "bootstrap/dist/css/bootstrap.min.css";

// 固定カラーマップ
const COLORS = [
  "#007bff", // 青
  "#dc3545", // 赤
  "#28a745", // 緑
  "#6f42c1", // 紫
  "#fd7e14", // オレンジ
  "#20c997", // ティール
  "#e83e8c", // ピンク
  "#17a2b8", // 水色
];

export default function App() {
  const [waves, setWaves] = useState([]);
  const [newType, setNewType] = useState("sin");
  const [newAmplitude, setNewAmplitude] = useState(100);
  const [newFrequency, setNewFrequency] = useState(60);
  const [newPhase, setNewPhase] = useState(0);
  const [duration, setDuration] = useState(0.01); // 横軸時間
  const [speed, setSpeed] = useState(0.05);

  const addWave = () => {
    const newWave = {
      id: Date.now(),
      type: newType,
      amplitude: Math.min(Math.max(newAmplitude, 0), 1000),
      frequency: Math.min(Math.max(newFrequency, 0), 1_000_000),
      phase: Math.min(Math.max(newPhase, 0), 360),
      visible: true,
      color: COLORS[waves.length % COLORS.length] // 順番で色を決定
    };
    setWaves([...waves, newWave]);
  };

  const toggleWave = (id) => {
    setWaves(waves.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  };

  const removeWave = (id) => {
    setWaves(waves.filter(w => w.id !== id));
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">波形シミュレーター</h2>

      <Controls
        newType={newType} setNewType={setNewType}
        newAmplitude={newAmplitude} setNewAmplitude={setNewAmplitude}
        newFrequency={newFrequency} setNewFrequency={setNewFrequency}
        newPhase={newPhase} setNewPhase={setNewPhase}
        addWave={addWave}
      />

      <WaveForm
        waves={waves}
        toggleWave={toggleWave}
        removeWave={removeWave}
        duration={duration} setDuration={setDuration}
        speed={speed} setSpeed={setSpeed}
      />
    </div>
  );
}
