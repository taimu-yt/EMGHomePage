// src/utils.js
export function generateSineWave(amplitude, frequency, duration = 2, sampleRate = 1000) {
  const data = [];
  const dt = 1 / sampleRate;
  for (let t = 0; t <= duration; t += dt) {
    data.push({ t, y: amplitude * Math.sin(2 * Math.PI * frequency * t) });
  }
  return data;
}
