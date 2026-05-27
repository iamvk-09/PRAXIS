import { useState } from 'react';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function getCellColor(rate) {
  if (rate === null || rate === undefined) return '#1C1C28';
  if (rate === 0)   return '#1C1C28';
  if (rate < 0.5)   return '#3D2F6B';
  if (rate < 0.8)   return '#6B4FBF';
  return '#7C6AF7';
}

function buildCalendarData(completions, days) {
  // Build map: date -> { completed, total }
  const map = {};
  for (const c of completions) {
    if (!map[c.date]) map[c.date] = { completed: 0, total: 0 };
    map[c.date].total += 1;
    if (c.completed) map[c.date].completed += 1;
  }

  // Build array of last `days` dates (most recent last)
  const result = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const info = map[dateStr];
    result.push({
      date: dateStr,
      rate: info ? info.completed / Math.max(info.total, 1) : null,
      label: info
        ? `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${info.completed}/${info.total} habits`
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  }
  return result;
}

export default function StreakCalendar({ completions = [], days = 30 }) {
  const cells = buildCalendarData(completions, days);

  // Pad front to align to week
  const firstDay = cells.length > 0 ? new Date(cells[0].date + 'T00:00:00').getDay() : 0;
  // getDay(): 0=Sun,1=Mon... convert to Mon-first
  const padCount = (firstDay === 0 ? 6 : firstDay - 1);
  const padded = [...Array(padCount).fill(null), ...cells];

  return (
    <div className="streak-calendar">
      <div className="streak-day-labels">
        {DAY_LABELS.map((l, i) => (
          <div key={i} className="streak-day-label">{l}</div>
        ))}
      </div>
      <div className="streak-grid">
        {padded.map((cell, i) =>
          cell === null ? (
            <div key={`pad-${i}`} style={{ aspectRatio: 1 }} />
          ) : (
            <div
              key={cell.date}
              className="streak-cell"
              style={{ background: getCellColor(cell.rate) }}
            >
              <span className="streak-cell-tooltip">{cell.label}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
