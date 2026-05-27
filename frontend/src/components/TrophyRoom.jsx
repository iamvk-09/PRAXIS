import React from 'react';

const BADGE_DEFINITIONS = [
  { id: 'FIRST_BLOOD', name: 'Initiator', icon: '🔥', desc: 'Started the journey by logging your first day.' },
  { id: 'CONSISTENCY_3', name: 'Momentum Builder', icon: '⚡', desc: 'Logged 3 days in a row.' },
  { id: 'STREAK_MASTER', name: 'Streak Master', icon: '👑', desc: 'Unstoppable! Logged 7 days in a row.' },
  { id: 'EARLY_BIRD', name: 'Early Bird', icon: '🌅', desc: 'Logged an entry before 8:00 AM.' },
  { id: 'IRON_WILL', name: 'Iron Will', icon: '⚔️', desc: 'Logged a high energy workout on a weekend.' },
];

export default function TrophyRoom({ earnedBadges = [] }) {
  return (
    <div className="glass-panel p-6 rounded-2xl w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-xl tracking-wide" style={{ fontFamily: 'Space Grotesk' }}>
          Trophy Room <span className="opacity-50 text-sm ml-2">({earnedBadges.length}/{BADGE_DEFINITIONS.length})</span>
        </h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {BADGE_DEFINITIONS.map((badge) => {
          const isEarned = earnedBadges.includes(badge.id);
          return (
            <div 
              key={badge.id}
              className={`badge-card relative flex flex-col items-center p-4 rounded-xl transition-all duration-500 ${isEarned ? 'earned' : 'locked opacity-40 grayscale'}`}
              style={{
                backgroundColor: isEarned ? 'rgba(124, 106, 247, 0.1)' : 'var(--surface-el)',
                border: `1px solid ${isEarned ? 'var(--primary)' : 'var(--border)'}`,
                boxShadow: isEarned ? '0 0 20px rgba(124,106,247,0.2)' : 'none'
              }}
              title={badge.desc}
            >
              <div 
                className="text-4xl mb-3 filter drop-shadow-lg transition-transform hover:scale-110 cursor-help"
                style={{ filter: isEarned ? 'drop-shadow(0 0 10px var(--primary-h))' : 'none' }}
              >
                {badge.icon}
              </div>
              <div className="text-sm font-bold text-center leading-tight">{badge.name}</div>
              {isEarned && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--primary-h)', boxShadow: '0 0 8px var(--primary-h)' }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
