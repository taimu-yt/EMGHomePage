import React, { useRef, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Title, Tooltip, Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function WaveForm({ waves, toggleWave, removeWave, duration, speed, setDuration, setSpeed }) {
  const chartRef = useRef(null);
  const points = 500;
  const tArray = Array.from({ length: points + 1 }, (_, i) => i * duration / points);

  useEffect(() => {
    let animationId;
    let startTime = performance.now();

    const animate = (time) => {
      const elapsed = ((time - startTime) / 1000) * speed * 0.1;

      if (chartRef.current) {
        const chart = chartRef.current;
        const visibleWaves = waves.filter(w => w.visible);

        const maxAmpRaw = visibleWaves.length ? Math.max(...visibleWaves.map(w => w.amplitude)) : 1;
        const maxAmp = Math.round(maxAmpRaw * 1.1 * 1000) / 1000;

        chart.options.scales.y.min = -maxAmp;
        chart.options.scales.y.max = maxAmp;

        chart.data.datasets.forEach((ds, idx) => {
          const w = visibleWaves[idx];
          if (!w) return;
          const phaseRad = (w.phase * Math.PI) / 180;
          ds.data = tArray.map(t => ({
            x: t,
            y: w.amplitude * (
              w.type === "sin"
                ? Math.sin(2 * Math.PI * w.frequency * (t + elapsed) + phaseRad)
                : Math.cos(2 * Math.PI * w.frequency * (t + elapsed) + phaseRad)
            )
          }));
        });

        chart.update("none");
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [waves, tArray, speed, duration]);

  const initDatasets = waves.filter(w => w.visible).map(w => ({
    label: `${w.type} (A:${w.amplitude}, f:${w.frequency}Hz, φ:${w.phase}°)`,
    data: tArray.map(t => ({ x: t, y: 0 })),
    borderColor: w.color,
    backgroundColor: w.color + "33",
    pointRadius: 0,
    fill: false,
    borderWidth: 2,
    tension: 0.3
  }));

  const chartData = { datasets: initDatasets };

  const options = {
    responsive: true,
    plugins: { legend: { display: true } },
    animation: false,
    scales: {
      x: { type: "linear", title: { display: true, text: "時間 (s)" }, min: 0, max: duration },
      y: { min: -1.1, max: 1.1, title: { display: true, text: "振幅" } }
    }
  };

  return (
    <div className="card p-3">
      <div className="row g-3 mb-3">
        <div className="col-auto">
          <label className="form-label">横軸時間 (秒)</label>
          <input type="number" className="form-control" value={duration} step="0.001" min="0.001"
            onChange={e => setDuration(parseFloat(e.target.value))}/>
        </div>
        <div className="col-auto">
          <label className="form-label">速度</label>
          <input type="number" className="form-control" value={speed} step="0.001" min="0"
            onChange={e => setSpeed(parseFloat(e.target.value))}/>
        </div>
      </div>

      <div className="d-flex flex-wrap mb-3 gap-2">
        {waves.map(w => (
          <div key={w.id} className="badge p-2 rounded" style={{ backgroundColor: w.color + "33", color: w.color }}>
            <input className="form-check-input me-1" type="checkbox" checked={w.visible} onChange={() => toggleWave(w.id)} />
            <span>{w.type} A:{w.amplitude} f:{w.frequency}Hz φ:{w.phase}°</span>
            <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => removeWave(w.id)}>削除</button>
          </div>
        ))}
      </div>

      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
}
