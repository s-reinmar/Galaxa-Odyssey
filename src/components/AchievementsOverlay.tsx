import React, { useState, useMemo } from 'react';
import { GameEngine } from '../game/GameEngine';
import { ACHIEVEMENTS, Achievement } from '../types/achievements';
import {
  Trophy,
  Award,
  Skull,
  Zap,
  Shield,
  Flame,
  Star,
  Users,
  Crosshair,
  Target,
  Lock,
  CheckCircle2,
  X,
  Coins,
  Sparkles,
  Rocket,
  Heart,
  Medal,
} from 'lucide-react';

interface AchievementsOverlayProps {
  engine: GameEngine;
  onClose: () => void;
}

export const AchievementsOverlay: React.FC<AchievementsOverlayProps> = ({ engine, onClose }) => {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'unlocked' | 'in_progress'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'combat' | 'survival' | 'progression' | 'mastery'>('all');
  const [inspectBadge, setInspectBadge] = useState<Achievement | null>(null);

  const unlockedCount = engine.getUnlockedCount();
  const totalCount = ACHIEVEMENTS.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  // Total credits earned from achievements
  const totalCreditsEarned = useMemo(() => {
    return ACHIEVEMENTS.reduce((sum, ach) => {
      return engine.isAchievementUnlocked(ach.id) ? sum + ach.rewardCredits : sum;
    }, 0);
  }, [engine]);

  const filteredAchievements = useMemo(() => {
    return ACHIEVEMENTS.filter((ach) => {
      const isUnlocked = engine.isAchievementUnlocked(ach.id);
      if (selectedStatus === 'unlocked' && !isUnlocked) return false;
      if (selectedStatus === 'in_progress' && isUnlocked) return false;
      if (selectedCategory !== 'all' && ach.category !== selectedCategory) return false;
      return true;
    });
  }, [selectedStatus, selectedCategory, engine]);

  const getIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'trophy':
        return <Trophy className={className} />;
      case 'skull':
        return <Skull className={className} />;
      case 'zap':
        return <Zap className={className} />;
      case 'shield':
        return <Shield className={className} />;
      case 'flame':
        return <Flame className={className} />;
      case 'star':
        return <Star className={className} />;
      case 'users':
        return <Users className={className} />;
      case 'crosshair':
        return <Crosshair className={className} />;
      case 'award':
        return <Award className={className} />;
      case 'rocket':
        return <Rocket className={className} />;
      case 'sparkles':
        return <Sparkles className={className} />;
      case 'heart':
        return <Heart className={className} />;
      case 'medal':
        return <Medal className={className} />;
      default:
        return <Target className={className} />;
    }
  };

  const getRarityBadgeStyle = (rarity: Achievement['rarity'], unlocked: boolean) => {
    if (!unlocked) {
      return {
        border: 'border-slate-800',
        bg: 'bg-slate-900/60',
        iconBg: 'bg-slate-800/80 text-slate-500',
        glow: '',
        text: 'text-slate-400',
      };
    }
    switch (rarity) {
      case 'platinum':
        return {
          border: 'border-fuchsia-500/60',
          bg: 'bg-gradient-to-br from-fuchsia-950/40 via-purple-900/20 to-slate-950',
          iconBg: 'bg-gradient-to-tr from-fuchsia-600 to-purple-400 text-white shadow-[0_0_15px_rgba(217,70,239,0.5)]',
          glow: 'shadow-[0_0_15px_rgba(217,70,239,0.2)]',
          text: 'text-fuchsia-300',
        };
      case 'gold':
        return {
          border: 'border-amber-400/60',
          bg: 'bg-gradient-to-br from-amber-950/40 via-yellow-900/20 to-slate-950',
          iconBg: 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)]',
          glow: 'shadow-[0_0_15px_rgba(245,158,11,0.2)]',
          text: 'text-amber-300',
        };
      case 'silver':
        return {
          border: 'border-cyan-400/60',
          bg: 'bg-gradient-to-br from-cyan-950/40 via-blue-900/20 to-slate-950',
          iconBg: 'bg-gradient-to-tr from-cyan-500 to-sky-300 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)]',
          glow: 'shadow-[0_0_15px_rgba(6,182,212,0.2)]',
          text: 'text-cyan-300',
        };
      default: // bronze
        return {
          border: 'border-orange-500/50',
          bg: 'bg-gradient-to-br from-orange-950/40 via-stone-900/20 to-slate-950',
          iconBg: 'bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-[0_0_12px_rgba(234,88,12,0.4)]',
          glow: 'shadow-[0_0_12px_rgba(234,88,12,0.15)]',
          text: 'text-orange-300',
        };
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[840px] max-h-[92vh] flex flex-col bg-slate-900/95 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="relative px-5 py-3.5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(55,245,255,0.4)]">
              <Trophy size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-wide text-cyan-400 font-mono">
                  PILOT BADGES & COMMENDATIONS
                </h2>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800/80 text-cyan-300 font-mono">
                  {unlockedCount}/{totalCount}
                </span>
              </div>
              <p className="text-xs text-slate-400">Milestone achievements, combat honors & tactical career medals</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            title="Close [ESC]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress & Stats Bar */}
        <div className="px-5 py-3 bg-slate-950/70 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex-1 min-w-[200px]">
            <div className="flex justify-between items-center mb-1 text-slate-400 font-mono text-[11px]">
              <span>CAREER COMPLETION</span>
              <span className="text-cyan-300 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-300 font-mono">
            <div className="flex items-center gap-1.5">
              <Coins size={14} className="text-amber-400" />
              <span>
                Earned: <strong className="text-amber-300">+{totalCreditsEarned}</strong> credits
              </span>
            </div>
          </div>
        </div>

        {/* Combined Filter Navigation: Status & Category */}
        <div className="px-5 py-2.5 bg-slate-900/60 border-b border-slate-800/60 flex flex-wrap items-center justify-between gap-2">
          {/* Status buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSelectedStatus('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                selectedStatus === 'all'
                  ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus('unlocked')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                selectedStatus === 'unlocked'
                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unlocked ({unlockedCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus('in_progress')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                selectedStatus === 'in_progress'
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Locked ({totalCount - unlockedCount})
            </button>
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-1 text-[11px] font-mono">
            {(['all', 'combat', 'survival', 'progression', 'mastery'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded capitalize transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-700 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Badges Grid View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 max-h-[50vh] sm:max-h-[55vh]">
          {filteredAchievements.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No badges matching this filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredAchievements.map((ach) => {
                const unlocked = engine.isAchievementUnlocked(ach.id);
                const progress = engine.getProgress(ach.id);
                const style = getRarityBadgeStyle(ach.rarity, unlocked);
                const isSelected = inspectBadge?.id === ach.id;

                return (
                  <div
                    key={ach.id}
                    onClick={() => setInspectBadge(ach)}
                    className={`relative p-3 rounded-xl border transition cursor-pointer select-none ${style.border} ${style.bg} ${style.glow} ${
                      isSelected ? 'ring-2 ring-cyan-400' : 'hover:scale-[1.01]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform ${style.iconBg}`}
                      >
                        {unlocked ? (
                          getIcon(ach.iconName, 'w-5 h-5')
                        ) : (
                          <Lock className="w-4 h-4 text-slate-500" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h3
                            className={`text-xs font-bold truncate ${
                              unlocked ? 'text-slate-100' : 'text-slate-400'
                            }`}
                          >
                            {ach.title}
                          </h3>
                          <span
                            className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border shrink-0 ${
                              unlocked
                                ? `${style.text} border-current/30 bg-black/40`
                                : 'text-slate-600 border-slate-800'
                            }`}
                          >
                            {ach.rarity}
                          </span>
                        </div>

                        <div className="text-[10px] text-cyan-400/90 font-mono font-medium truncate">
                          {ach.subtitle}
                        </div>

                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                          {ach.description}
                        </p>

                        {/* Progress or Completion state */}
                        <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
                          {unlocked ? (
                            <div className="flex items-center gap-1 text-emerald-400">
                              <CheckCircle2 size={12} />
                              <span>COMMISSIONED</span>
                            </div>
                          ) : ach.maxProgress > 1 ? (
                            <div className="flex items-center gap-2 flex-1 mr-3">
                              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-cyan-500 rounded-full"
                                  style={{
                                    width: `${Math.min(100, (progress / ach.maxProgress) * 100)}%`,
                                  }}
                                />
                              </div>
                              <span className="text-slate-400">
                                {progress}/{ach.maxProgress}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500">Locked</span>
                          )}

                          <span className="text-amber-300 font-bold shrink-0">
                            +{ach.rewardCredits} cr
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Inspect Detail Card if Selected */}
        {inspectBadge && (
          <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  getRarityBadgeStyle(inspectBadge.rarity, engine.isAchievementUnlocked(inspectBadge.id)).iconBg
                }`}
              >
                {getIcon(inspectBadge.iconName, 'w-5 h-5')}
              </div>
              <div className="truncate">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200">{inspectBadge.title}</span>
                  <span className="text-[10px] uppercase font-mono text-cyan-400">
                    [{inspectBadge.subtitle}]
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] truncate">{inspectBadge.description}</p>
              </div>
            </div>

            <div className="shrink-0 text-right font-mono">
              <span
                className={`text-[11px] font-bold ${
                  engine.isAchievementUnlocked(inspectBadge.id) ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {engine.isAchievementUnlocked(inspectBadge.id) ? 'COMMISSIONED' : 'IN PROGRESS'}
              </span>
              <div className="text-[10px] text-amber-300">+{inspectBadge.rewardCredits} Credits</div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-2.5 bg-slate-900 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Press B in-game or click outside to dismiss</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-cyan-950/70 border border-cyan-500/40 rounded text-cyan-300 hover:bg-cyan-900/80 transition cursor-pointer font-bold"
          >
            RETURN TO HANGAR
          </button>
        </div>
      </div>
    </div>
  );
};
