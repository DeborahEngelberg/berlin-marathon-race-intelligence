'use client';

import { useState, useEffect } from 'react';
import { User, Eye, MapPin, Clock, Utensils, ArrowRight, X } from 'lucide-react';

const ONBOARDING_KEY = 'berlin-marathon-onboarding-complete';
const MODE_KEY = 'berlin-marathon-user-mode';
const GOAL_KEY = 'berlin-marathon-user-goal';

type UserMode = 'runner' | 'spectator';
type UserGoal = 'race-morning' | 'viewing-plan' | 'travel-logistics' | 'full-recon';

interface GoalOption {
  id: UserGoal;
  label: string;
  description: string;
  recommendedTabs: string[];
}

const RUNNER_GOALS: GoalOption[] = [
  {
    id: 'race-morning',
    label: 'Plan race morning',
    description: 'Start logistics, checklist, gear drop, corral timing',
    recommendedTabs: ['runner-guide', 'finish-strategy', 'common-mistakes'],
  },
  {
    id: 'travel-logistics',
    label: 'Plan travel and food',
    description: 'Where to stay, what to eat, how to get around',
    recommendedTabs: ['where-to-stay', 'food', 'transit'],
  },
  {
    id: 'full-recon',
    label: 'Full recon',
    description: 'Read everything from logistics to course psychology',
    recommendedTabs: ['runner-guide', 'finish-strategy', 'transit', 'common-mistakes'],
  },
];

const SPECTATOR_GOALS: GoalOption[] = [
  {
    id: 'viewing-plan',
    label: 'Plan where to watch',
    description: 'Best spots, viewing routes, course crossings',
    recommendedTabs: ['spectator-guide', 'viewing-routes', 'crossing-map'],
  },
  {
    id: 'travel-logistics',
    label: 'Plan travel and food',
    description: 'Where to stay, what to eat, transit on race day',
    recommendedTabs: ['where-to-stay', 'food', 'transit'],
  },
  {
    id: 'full-recon',
    label: 'Full recon',
    description: 'Read everything from viewing strategy to reunion planning',
    recommendedTabs: ['spectator-guide', 'viewing-routes', 'crossing-map', 'finish-strategy', 'common-mistakes'],
  },
];

const TAB_LABELS: Record<string, string> = {
  'runner-guide': 'Runner Guide',
  'spectator-guide': 'Spectator Guide',
  'viewing-routes': 'Viewing Routes',
  'crossing-map': 'Crossing Map',
  'finish-strategy': 'Finish Strategy',
  'transit': 'Transit Strategy',
  'where-to-stay': 'Where to Stay',
  'food': 'Food & Restaurants',
  'common-mistakes': 'Common Mistakes',
};

interface Props {
  onComplete: (mode: UserMode, recommendedTabs: string[]) => void;
}

export function getOnboardingComplete(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(ONBOARDING_KEY) === 'true';
}

export function getSavedMode(): UserMode | null {
  if (typeof window === 'undefined') return null;
  const val = localStorage.getItem(MODE_KEY);
  return val === 'runner' || val === 'spectator' ? val : null;
}

export function getSavedGoal(): UserGoal | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(GOAL_KEY) as UserGoal | null;
}

export default function OnboardingModal({ onComplete }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedMode, setSelectedMode] = useState<UserMode | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<GoalOption | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getOnboardingComplete()) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const goals = selectedMode === 'runner' ? RUNNER_GOALS : SPECTATOR_GOALS;

  const handleModeSelect = (mode: UserMode) => {
    setSelectedMode(mode);
    setStep(2);
  };

  const handleGoalSelect = (goal: GoalOption) => {
    setSelectedGoal(goal);
  };

  const handleFinish = () => {
    if (!selectedMode || !selectedGoal) return;
    localStorage.setItem(ONBOARDING_KEY, 'true');
    localStorage.setItem(MODE_KEY, selectedMode);
    localStorage.setItem(GOAL_KEY, selectedGoal.id);
    setVisible(false);
    onComplete(selectedMode, selectedGoal.recommendedTabs);
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setVisible(false);
    onComplete('runner', []);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 modal-backdrop" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-content bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] shadow-2xl w-full max-w-lg p-6 sm:p-8 relative">
        {/* Close / Skip */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          title="Skip onboarding"
        >
          <X size={18} />
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`w-8 h-1 rounded-full ${step >= 1 ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`} />
          <div className={`w-8 h-1 rounded-full ${step >= 2 ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`} />
        </div>

        {step === 1 && (
          <>
            <h2 className="text-xl font-bold text-[var(--text)] mb-2">Welcome to Berlin Marathon Intel</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Choose your role so we can show you the most relevant tools first.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleModeSelect('runner')}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-[var(--border)] hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all group"
              >
                <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <User size={28} className="text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-semibold text-[var(--text)]">I&apos;m Running</span>
              </button>
              <button
                onClick={() => handleModeSelect('spectator')}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-[var(--border)] hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all group"
              >
                <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Eye size={28} className="text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm font-semibold text-[var(--text)]">I&apos;m Spectating</span>
              </button>
            </div>
          </>
        )}

        {step === 2 && selectedMode && (
          <>
            <h2 className="text-xl font-bold text-[var(--text)] mb-2">What do you need most?</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              We&apos;ll highlight the best starting points for you.
            </p>
            <div className="space-y-3">
              {goals.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => handleGoalSelect(goal)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedGoal?.id === goal.id
                      ? 'border-[var(--accent)] bg-blue-50 dark:bg-blue-950/20'
                      : 'border-[var(--border)] hover:border-[var(--accent)]/50'
                  }`}
                >
                  <div className="font-semibold text-sm text-[var(--text)]">{goal.label}</div>
                  <div className="text-xs text-[var(--text-secondary)] mt-0.5">{goal.description}</div>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => { setStep(1); setSelectedGoal(null); }}
                className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={!selectedGoal}
                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Show me where to start <ArrowRight size={14} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** Recommended clicks banner shown after onboarding */
export function RecommendedBanner({
  tabs,
  onNavigate,
  onDismiss,
}: {
  tabs: string[];
  onNavigate: (tabId: string) => void;
  onDismiss: () => void;
}) {
  if (tabs.length === 0) return null;

  return (
    <div className="expand-content mb-6 rounded-xl border border-[var(--accent)]/30 bg-blue-50 dark:bg-blue-950/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-[var(--text)]">Recommended for you</p>
        <button
          onClick={onDismiss}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          Dismiss
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tabs.map((tabId) => (
          <button
            key={tabId}
            onClick={() => onNavigate(tabId)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-sm font-medium text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
          >
            {TAB_LABELS[tabId] || tabId}
            <ArrowRight size={12} />
          </button>
        ))}
      </div>
    </div>
  );
}
