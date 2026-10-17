import React from 'react';
import type { Achievement } from '../../types/achievements';
import { AchievementCard } from './AchievementCard';

interface AchievementsGridProps {
  achievements: Achievement[];
  selectedId?: string;
  isUnlocked: (id: string) => boolean;
  getProgress: (id: string) => number;
  onSelect: (achievement: Achievement) => void;
}

export const AchievementsGrid: React.FC<AchievementsGridProps> = ({
  achievements,
  selectedId,
  isUnlocked,
  getProgress,
  onSelect,
}) => (
  <div className="flex-1 overflow-y-auto p-4 sm:p-5 max-h-[50vh] sm:max-h-[55vh]">
    {achievements.length === 0 ? (
      <div className="py-12 text-center text-slate-500 text-sm">No badges matching this filter.</div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {achievements.map((ach) => (
          <AchievementCard
            key={ach.id}
            achievement={ach}
            unlocked={isUnlocked(ach.id)}
            progress={getProgress(ach.id)}
            selected={selectedId === ach.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    )}
  </div>
);
