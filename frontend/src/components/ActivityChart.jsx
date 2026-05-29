import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function getDayLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.toLocaleDateString('en-US', { weekday: 'short' });
  const date = d.getDate();
  return `${day} ${date}`;
}

export default function ActivityChart({ logs }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📊</div>
        <p className="empty-state-text">No data yet — start logging your days!</p>
      </div>
    );
  }

  // Sort ascending
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));

  const labels = sorted.map((l) => getDayLabel(l.date));
  const productive = sorted.map((l) =>
    (l.activities || [])
      .filter((a) => a.type === 'productive')
      .reduce((s, a) => s + (a.duration_minutes || 0), 0)
  );
  const leisure = sorted.map((l) =>
    (l.activities || [])
      .filter((a) => a.type === 'leisure')
      .reduce((s, a) => s + (a.duration_minutes || 0), 0)
  );

  const data = {
    labels,
    datasets: [
      {
        label: 'Productive (min)',
        data: productive,
        backgroundColor: 'rgba(124,106,247,0.7)',
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Leisure (min)',
        data: leisure,
        backgroundColor: 'rgba(251,191,36,0.5)',
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          color: '#9090B0',
          font: { family: 'DM Sans', size: 12 },
          boxWidth: 12,
          borderRadius: 3,
        },
      },
      tooltip: {
        backgroundColor: '#1C1C28',
        titleColor: '#F0F0FF',
        bodyColor: '#9090B0',
        borderColor: '#2A2A3D',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y} minutes`,
        },
      },
    },
    scales: {
      x: {
        stacked: false,
        grid: { display: false },
        ticks: { color: '#9090B0', font: { family: 'DM Sans' } },
        border: { display: false },
      },
      y: {
        stacked: false,
        grid: { color: 'rgba(42,42,61,0.6)' },
        ticks: { color: '#9090B0', font: { family: 'DM Sans' } },
        border: { display: false },
      },
    },
  };

  return <Bar data={data} options={options} />;
}
