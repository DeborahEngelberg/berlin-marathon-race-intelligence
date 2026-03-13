'use client';

import { useState, useMemo } from 'react';
import { Flag, Clock, Users, ChevronDown, ChevronRight, Copy, Check, ExternalLink } from 'lucide-react';
import BulletCard from '@/components/ui/BulletCard';
import bulletsData from '@/data/bullets.json';
import { FilterState, Bullet } from '@/lib/types';

/* ─── Visual Blueprint Steps ─── */
const BLUEPRINT_STEPS = [
  { icon: Flag, label: 'Finish Line', desc: 'Cross the line, timing mat records your chip time' },
  { icon: Flag, label: 'Medal Collection', desc: 'Volunteers drape your finisher medal' },
  { icon: Flag, label: 'Water / Refreshments', desc: 'Hydration, bananas, snacks along the chute' },
  { icon: Flag, label: 'Poncho / Space Blankets', desc: 'Grab a poncho before body temp drops' },
  { icon: Flag, label: 'Gear Bag Pickup', desc: 'Retrieve your bag by bib number zone' },
  { icon: Users, label: 'Meeting Zone (A-Z Signs)', desc: 'Find your pre-agreed letter sign' },
  { icon: Flag, label: 'Exit Routes', desc: 'Channeled paths toward Tiergarten exits' },
  { icon: Flag, label: 'Transit Options', desc: 'U-Bahn / S-Bahn / walking routes out' },
];

/* ─── Hardcoded Timed Items (community-reported) ─── */
const COMMUNITY_TIMED_ITEMS = [
  { text: 'Finish chute walk (line to exit): 5-10 min', timeText: '5-10 min' },
  { text: 'Medal collection: 1-2 min', timeText: '1-2 min' },
  { text: 'Water/refreshment stop: 3-5 min', timeText: '3-5 min' },
  { text: 'Poncho queue peak hours: 10-15 min', timeText: '10-15 min' },
  { text: 'Gear bag retrieval: 5-20 min depending on volume', timeText: '5-20 min' },
  { text: 'Walking to meeting point: 10-25 min', timeText: '10-25 min' },
  { text: 'Cell service degradation: severe for 2+ hours post-peak finish', timeText: '2+ hours' },
  { text: 'Reunion without plan: 45-90 min average', timeText: '45-90 min' },
  { text: 'Medal engraving: 15-30 min if available', timeText: '15-30 min' },
  { text: 'Exit to nearest U-Bahn: 10-15 min walk', timeText: '10-15 min' },
  { text: 'Post-finish food queue at official area: 15-25 min', timeText: '15-25 min' },
  { text: 'Body temperature drops within 10 min of stopping - poncho critical', timeText: '~10 min' },
  { text: 'Total finish-to-meeting time budget: 30-90 min', timeText: '30-90 min' },
  { text: 'Hauptbahnhof walk from finish: ~20 min', timeText: '~20 min' },
  { text: 'Photo area wait (professional): 5-15 min', timeText: '5-15 min' },
];

const COMMUNITY_SOURCE = 'Berlin Marathon Community Reports';
const COMMUNITY_URL = 'https://www.berlin-marathon.com';

/* ─── Reunion Strategy Definitions ─── */
interface ReunionOption {
  id: 'a' | 'b' | 'c';
  title: string;
  subtitle: string;
  planTemplate: string;
}

const REUNION_OPTIONS: ReunionOption[] = [
  {
    id: 'a',
    title: 'Option A: Official Meeting Signs (A-Z) + Fallback',
    subtitle: 'Use the lettered A-Z meeting signs in the designated reunion area',
    planTemplate: `REUNION PLAN A - Official Meeting Signs

Primary meeting point: Letter sign [YOUR LETTER] in the official A-Z meeting zone (Tiergarten, post-finish area).

Instructions for runner:
1. After crossing finish line, collect medal, water, and poncho.
2. Pick up gear bag at your bib-number zone.
3. Walk to the A-Z meeting signs area.
4. Stand at letter [YOUR LETTER] and wait.

Fallback (if not reunited within 30 min):
- Move to Hauptbahnhof main-level food court.
- Sit near the main entrance facing the departure board.

Time budget: Expect 30-60 min from finish to meeting.
Cell service will be severely degraded near the finish - do NOT rely on phone contact.

[Based on BMW Berlin Marathon Spectator Guide & Berlin Marathon Community Reports]`,
  },
  {
    id: 'b',
    title: 'Option B: Meet at Hauptbahnhof Food Court',
    subtitle: 'Skip the chaotic finish area - regroup at the nearby train station',
    planTemplate: `REUNION PLAN B - Hauptbahnhof Food Court

Primary meeting point: Hauptbahnhof main-level food court, near the main entrance facing the departure board.

Instructions for runner:
1. After crossing finish, collect medal + poncho + gear bag.
2. Exit finish area via the western Tiergarten exit.
3. Walk north to Hauptbahnhof (~20 min walk).
4. Head to the main-level food court.

Instructions for spectator:
1. After the runner passes the finish, head directly to Hauptbahnhof.
2. Secure a table at the food court near the main entrance.
3. Stay visible and wait.

Fallback (if not reunited within 60 min):
- Check the information desk at Hauptbahnhof ground floor.

Time budget: Expect 45-75 min from finish to meeting.

[Based on BMW Berlin Marathon Spectator Guide & Berlin Marathon Community Reports]`,
  },
  {
    id: 'c',
    title: 'Option C: Meet at Reichstag Lawn',
    subtitle: 'Open-air landmark meeting point with clear sightlines',
    planTemplate: `REUNION PLAN C - Reichstag Lawn

Primary meeting point: Reichstag building front lawn (Platz der Republik), south-east corner nearest to Brandenburg Gate.

Instructions for runner:
1. After crossing finish, collect medal + poncho + gear bag.
2. Exit finish area and walk north along Ebertstraße toward the Reichstag.
3. Head to the south-east corner of the Reichstag front lawn.

Instructions for spectator:
1. After watching the finish near Brandenburg Gate, walk north to the Reichstag lawn.
2. Position yourself at the south-east corner with clear sightlines.

Fallback (if not reunited within 45 min):
- Move to Hauptbahnhof food court (10 min walk north from Reichstag).

Time budget: Expect 30-50 min from finish to meeting.

[Based on BMW Berlin Marathon Spectator Guide & Berlin Marathon Community Reports]`,
  },
];

/* ─── Component ─── */
export default function FinishBlueprint({ filters }: { filters: FilterState }) {
  const [blueprintExpanded, setBlueprintExpanded] = useState(true);
  const [timedExpanded, setTimedExpanded] = useState(true);
  const [wizardExpanded, setWizardExpanded] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<'a' | 'b' | 'c'>('a');
  const [planCopied, setPlanCopied] = useState(false);

  /* Filter data bullets for timed-reality */
  const timedBullets = useMemo(() => {
    let filtered = (bulletsData as Bullet[]).filter(
      (b) => b.section === 'finish-blueprint' && b.subsection === 'timed-reality'
    );

    if (filters.audience.length > 0) {
      filtered = filtered.filter((b) => filters.audience.includes(b.audience));
    }
    if (filters.label.length > 0) {
      filtered = filtered.filter((b) => filters.label.includes(b.label));
    }
    if (filters.confidence.length > 0) {
      filtered = filtered.filter((b) => filters.confidence.includes(b.confidence));
    }
    if (filters.languageOrigin.length > 0) {
      filtered = filtered.filter((b) => filters.languageOrigin.includes(b.languageOrigin));
    }
    if (filters.recurrenceOnly) {
      filtered = filtered.filter((b) => (b.recurrenceCount || 0) >= 3);
    }

    return filtered;
  }, [filters]);

  /* Citation bullets for reunion wizard */
  const citationBullets = useMemo(() => {
    return (bulletsData as Bullet[]).filter((b) => b.id === 'b012' || b.id === 'b013');
  }, []);

  /* Copy plan to clipboard */
  const handleCopyPlan = async () => {
    const plan = REUNION_OPTIONS.find((o) => o.id === selectedPlan);
    if (!plan) return;
    await navigator.clipboard.writeText(plan.planTemplate);
    setPlanCopied(true);
    setTimeout(() => setPlanCopied(false), 2500);
  };

  const activePlan = REUNION_OPTIONS.find((o) => o.id === selectedPlan)!;

  return (
    <div>
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--text)] mb-2 flex items-center gap-2">
          <Flag size={24} className="text-[var(--accent)]" />
          Finish Line Blueprint
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          What actually happens after you cross the line: the full post-finish sequence, real wait times, and reunion strategies that work.
        </p>
      </div>

      {/* ─── A) Visual Blueprint Stepper ─── */}
      <div className="card mb-6">
        <button
          onClick={() => setBlueprintExpanded(!blueprintExpanded)}
          className="w-full text-left flex items-center gap-2 py-3 px-4 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--border)] transition-colors"
        >
          {blueprintExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span className="font-semibold text-sm text-[var(--text)]">Post-Finish Sequence</span>
          <span className="ml-auto text-xs text-[var(--text-muted)]">{BLUEPRINT_STEPS.length} steps</span>
        </button>

        {blueprintExpanded && (
          <div className="p-4 pt-2 animate-fade-slide-down">
            <div className="relative">
              {BLUEPRINT_STEPS.map((step, i) => {
                const StepIcon = step.icon;
                const isLast = i === BLUEPRINT_STEPS.length - 1;

                return (
                  <div key={i} className="flex gap-4 relative">
                    {/* Vertical connector line */}
                    {!isLast && (
                      <div
                        className="absolute left-[15px] top-[32px] w-0.5 bg-[var(--border)]"
                        style={{ height: 'calc(100% - 8px)' }}
                      />
                    )}

                    {/* Step circle */}
                    <div
                      className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${
                        i === 0
                          ? 'bg-[var(--accent)] text-white'
                          : isLast
                          ? 'bg-green-500 text-white'
                          : 'bg-[var(--bg-elevated)] border-2 border-[var(--border)] text-[var(--text-muted)]'
                      }`}
                    >
                      <StepIcon size={14} />
                    </div>

                    {/* Step content */}
                    <div className="pb-6 flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text)]">{step.label}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{step.desc}</p>
                    </div>

                    {/* Step number */}
                    <span className="text-xs font-mono text-[var(--text-muted)] flex-shrink-0 mt-1">
                      {i + 1}/{BLUEPRINT_STEPS.length}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ─── B) Timed Reality Section ─── */}
      <div className="card mb-6">
        <button
          onClick={() => setTimedExpanded(!timedExpanded)}
          className="w-full text-left flex items-center gap-2 py-3 px-4 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--border)] transition-colors"
        >
          {timedExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <Clock size={16} className="text-[var(--accent)]" />
          <span className="font-semibold text-sm text-[var(--text)]">Timed Reality</span>
          <span className="ml-auto text-xs text-[var(--text-muted)]">
            {timedBullets.length + COMMUNITY_TIMED_ITEMS.length} items
          </span>
        </button>

        {timedExpanded && (
          <div className="p-4 pt-2 space-y-3 animate-fade-slide-down">
            {/* Data-driven bullets rendered via BulletCard */}
            {timedBullets.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
                  From Research Data
                </p>
                {timedBullets.map((b) => (
                  <BulletCard key={b.id} bullet={b} />
                ))}
              </div>
            )}

            {/* Hardcoded community-reported timed items */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide mt-4">
                Community-Reported Timings
              </p>
              {COMMUNITY_TIMED_ITEMS.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)]"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex-shrink-0">
                    <Clock size={14} className="text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text)]">{item.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/10 px-2 py-0.5 rounded">
                        <Clock size={10} />
                        {item.timeText}
                      </span>
                      <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                        <ExternalLink size={10} />
                        <a
                          href={COMMUNITY_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[var(--accent)] underline"
                        >
                          {COMMUNITY_SOURCE}
                        </a>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── C) Reunion Strategy Wizard ─── */}
      <div className="card mb-6">
        <button
          onClick={() => setWizardExpanded(!wizardExpanded)}
          className="w-full text-left flex items-center gap-2 py-3 px-4 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--border)] transition-colors"
        >
          {wizardExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <Users size={16} className="text-[var(--accent)]" />
          <span className="font-semibold text-sm text-[var(--text)]">Reunion Strategy Wizard</span>
        </button>

        {wizardExpanded && (
          <div className="p-4 pt-2 space-y-4 animate-fade-slide-down">
            <p className="text-sm text-[var(--text-secondary)]">
              Choose a reunion strategy. Each generates a copyable plan you can share with your group before race day.
            </p>

            {/* Radio options */}
            <div className="space-y-2">
              {REUNION_OPTIONS.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedPlan === option.id
                      ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                      : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)]/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="reunion-plan"
                    value={option.id}
                    checked={selectedPlan === option.id}
                    onChange={() => setSelectedPlan(option.id)}
                    className="mt-1 accent-[var(--accent)]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text)]">{option.title}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{option.subtitle}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Generated plan display */}
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
                  Generated Plan
                </p>
                <button
                  onClick={handleCopyPlan}
                  className="btn-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 transition-colors"
                >
                  {planCopied ? (
                    <>
                      <Check size={12} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      Copy Plan
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-xs text-[var(--text)] whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto max-h-80 overflow-y-auto">
                {activePlan.planTemplate}
              </pre>
            </div>

            {/* Citations from b012, b013 */}
            {citationBullets.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
                  Supporting Evidence
                </p>
                {citationBullets.map((b) => (
                  <BulletCard key={b.id} bullet={b} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
