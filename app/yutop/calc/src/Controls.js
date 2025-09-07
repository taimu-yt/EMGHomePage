import React from "react";

export default function Controls({
  newType, setNewType,
  newAmplitude, setNewAmplitude,
  newFrequency, setNewFrequency,
  newPhase, setNewPhase,
  addWave
}) {
  return (
    <div className="card p-3 mb-4">
      <h5 className="mb-3">新しい関数を追加</h5>
      <div className="row g-3 align-items-end">
        <div className="col-md-2">
          <label className="form-label">関数</label>
          <select className="form-select" value={newType} onChange={e => setNewType(e.target.value)}>
            <option value="sin">sin</option>
            <option value="cos">cos</option>
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">振幅 (0~1000)</label>
          <input type="number" className="form-control"
            value={newAmplitude} min="0" max="1000"
            onChange={e => setNewAmplitude(parseFloat(e.target.value) || 0)} />
        </div>
        <div className="col-md-3">
          <label className="form-label">周波数 [Hz] (0~1M)</label>
          <input type="number" className="form-control"
            value={newFrequency} min="0" max="1000000"
            onChange={e => setNewFrequency(parseFloat(e.target.value) || 0)} />
        </div>
        <div className="col-md-2">
          <label className="form-label">位相 [°] (0~360)</label>
          <input type="number" className="form-control"
            value={newPhase} min="0" max="360"
            onChange={e => setNewPhase(parseFloat(e.target.value) || 0)} />
        </div>
        <div className="col-md-2">
          <button className="btn btn-primary w-100" onClick={addWave}>追加</button>
        </div>
      </div>
    </div>
  );
}
