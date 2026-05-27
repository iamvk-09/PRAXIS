import { useState, useEffect } from 'react';
import { getLogs, getTodayLog, getMomentumHistory, getHabitCompletions, getCurrentGoal } from '../api/client';
import { useAuth } from '../context/AuthContext';
import MomentumScore from '../components/MomentumScore';
import ActivityChart from '../components/ActivityChart';
import StreakCalendar from '../components/StreakCalendar';
import GoalCard from '../components/GoalCard';
import InsightPanel from '../components/InsightPanel';
import TrophyRoom from '../components/TrophyRoom';
import AiCoachWidget from '../components/AiCoachWidget';

const moodEmoji = { positive: '😊', neutral: '😐', negative: '😔' };
const energyEmoji = { high: '⚡', medium: '⚖️', low: '🔋' };

export default function Dashboard() {
  const { user } = useAuth();
  const [todayLog, setTodayLog] = useState(null);
  const [logs, setLogs] = useState([]);
  const [momentumHistory, setMomentumHistory] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [todayRes, logsRes, momentumRes, completionsRes, goalRes] = await Promise.allSettled([
          getTodayLog(),
          getLogs(7),
          getMomentumHistory(),
          getHabitCompletions(30),
          getCurrentGoal(),
        ]);

        if (todayRes.status === 'fulfilled') setTodayLog(todayRes.value.data);
        if (logsRes.status === 'fulfilled') setLogs(logsRes.value.data || []);
        if (momentumRes.status === 'fulfilled') setMomentumHistory(momentumRes.value.data || []);
        if (completionsRes.status === 'fulfilled') setCompletions(completionsRes.value.data || []);
        if (goalRes.status === 'fulfilled') setGoal(goalRes.value.data);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Compute current momentum score
  const currentScore = momentumHistory.length > 0
    ? momentumHistory[momentumHistory.length - 1].score
    : null;
  const previousScore = momentumHistory.length > 1
    ? momentumHistory[momentumHistory.length - 2].score
    : null;

  // Weekly habit completion %
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
  const weekStartStr = weekStart.toISOString().split('T')[0];
  const weekCompletions = completions.filter(c => c.date >= weekStartStr);
  const weekPct = weekCompletions.length > 0
    ? Math.round((weekCompletions.filter(c => c.completed).length / weekCompletions.length) * 100)
    : null;

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
          <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '6rem' }}>
      <div className="dash-grid">

        {/* Momentum Score — full width */}
        <MomentumScore score={currentScore ?? 50} previousScore={previousScore} />

        {/* Trophy Room (Gamification) */}
        <TrophyRoom earnedBadges={user?.badges || []} />

        {/* Stats Row */}
        <div className="dash-stats-row">
          <div className="stat-card">
            <div className="stat-value" style={{ color: weekPct >= 50 ? 'var(--success)' : 'var(--text)' }}>
              {weekPct !== null ? `${weekPct}%` : '—'}
            </div>
            <div className="stat-label">This week's habit completion</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {todayLog ? (moodEmoji[todayLog.mood_signal] || '—') : '—'}
            </div>
            <div className="stat-label">
              Today's mood {todayLog?.mood_signal ? `· ${todayLog.mood_signal}` : ''}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {todayLog ? (energyEmoji[todayLog.energy_signal] || '—') : '—'}
            </div>
            <div className="stat-label">
              Today's energy {todayLog?.energy_signal ? `· ${todayLog.energy_signal}` : ''}
            </div>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="card">
          <div className="section-header" style={{ marginBottom: '1.5rem' }}>
            <span className="section-title">7-Day Activity</span>
            <span style={{ color: 'var(--text-sec)', fontSize: '0.8rem' }}>Productive & Leisure minutes</span>
          </div>
          <ActivityChart logs={logs} />
        </div>

        {/* Streak Calendar + Goal Card */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div className="card">
            <div className="section-header" style={{ marginBottom: '1rem' }}>
              <span className="section-title">Habit Streak</span>
              <span style={{ color: 'var(--text-sec)', fontSize: '0.8rem' }}>Last 30 days</span>
            </div>
            <StreakCalendar completions={completions} days={30} />
          </div>
          <GoalCard goal={goal} logs={logs} />
        </div>

        {/* Insight Panel */}
        <InsightPanel logCount={logs.length} />
      </div>

      {/* Floating AI Coach Widget */}
      <AiCoachWidget />
    </div>
  );
}
