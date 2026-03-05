'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Clock, AlertTriangle, User } from 'lucide-react';
import BulletCard from '@/components/ui/BulletCard';
import { Bullet, FilterState } from '@/lib/types';
import bulletsData from '@/data/bullets.json';

const SUBSECTIONS = [
  { id: 'start-line-logistics', label: 'Start Line Logistics' },
  { id: 'athletes-village', label: "Athletes' Village Reality" },
  { id: 'security-entry-chokepoints', label: 'Security / Entry Chokepoints' },
  { id: 'toilet-strategy', label: 'Toilet Strategy' },
  { id: 'gear-discard-warmth', label: 'Gear Discard + Warmth Tactics' },
  { id: 'corral-compression', label: 'Corral Compression + Warmup Constraints' },
  { id: 'aid-station-behavior', label: 'Aid Station Behavior + Crowd Management' },
  { id: 'race-psychology', label: 'Race Psychology + "Flat Fast Course" Failure Modes' },
];

interface Props {
  filters: FilterState;
}

function ChecklistGenerator() {
  const [arrivalGoal, setArrivalGoal] = useState('07:30');
  const [riskTolerance, setRiskTolerance] = useState<'low' | 'med' | 'high'>('low');
  const [generated, setGenerated] = useState(false);

  const buffers = {
    low: { security: 30, toilet: 40, gearDrop: 15, corralWalk: 25, preCorral: 15 },
    med: { security: 20, toilet: 30, gearDrop: 10, corralWalk: 20, preCorral: 10 },
    high: { security: 15, toilet: 15, gearDrop: 5, corralWalk: 15, preCorral: 5 },
  };

  const b = buffers[riskTolerance];
  const totalBuffer = b.security + b.toilet + b.gearDrop + b.corralWalk + b.preCorral;

  // Parse arrival time
  const [hours, minutes] = arrivalGoal.split(':').map(Number);
  const arrivalMinutes = hours * 60 + minutes;

  const timeline = [
    { time: arrivalGoal, action: 'Arrive at Athletes\' Village entrance', buffer: `Security screening: ~${b.security} min (Research: security bottleneck peaks 08:00-08:45)`, cite: 'b003' },
    { time: formatTime(arrivalMinutes + b.security), action: 'Clear security → Toilet immediately', buffer: `Toilet wait: ~${b.toilet} min (Research: lines 20-40 min by 08:15)`, cite: 'b001' },
    { time: formatTime(arrivalMinutes + b.security + b.toilet), action: 'Drop gear bag', buffer: `Gear drop: ~${b.gearDrop} min (Research: must drop BEFORE corral entry)`, cite: 'b004' },
    { time: formatTime(arrivalMinutes + b.security + b.toilet + b.gearDrop), action: 'Walk to start corral', buffer: `Corral walk: ~${b.corralWalk} min (Research: village → corral 15-25 min)`, cite: 'b002' },
    { time: formatTime(arrivalMinutes + b.security + b.toilet + b.gearDrop + b.corralWalk), action: 'In corral, warmup', buffer: `Pre-start buffer: ${b.preCorral} min` },
    { time: '09:15', action: 'GUN TIME', buffer: '' },
  ];

  function formatTime(totalMin: number): string {
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  return (
    <div className="card p-4 mb-6">
      <h3 className="font-semibold text-[var(--text)] mb-3 flex items-center gap-2">
        <Clock size={16} className="text-[var(--accent)]" />
        Race Morning Checklist Generator
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Target Arrival Time</label>
          <input
            type="time"
            value={arrivalGoal}
            onChange={(e) => setArrivalGoal(e.target.value)}
            className="w-full px-3 py-2 rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Risk Tolerance</label>
          <div className="flex gap-2">
            {(['low', 'med', 'high'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRiskTolerance(r)}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium border transition-colors ${
                  riskTolerance === r
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                    : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]'
                }`}
              >
                {r === 'low' ? 'Conservative' : r === 'med' ? 'Moderate' : 'Aggressive'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => setGenerated(true)}
        className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-dark)] transition-colors"
      >
        Generate Checklist
      </button>

      {generated && (
        <div className="mt-4 space-y-2">
          <div className="text-xs text-[var(--text-muted)] mb-2">
            Total buffer: {totalBuffer} min | Risk level: {riskTolerance}
          </div>
          {timeline.map((step, i) => (
            <div key={i} className={`flex gap-3 p-3 rounded-lg ${step.action === 'GUN TIME' ? 'bg-[var(--accent)]/10 border border-[var(--accent)]' : 'bg-[var(--bg-elevated)]'}`}>
              <span className="font-mono text-sm font-bold text-[var(--accent)] w-14 flex-shrink-0">{step.time}</span>
              <div>
                <p className={`text-sm font-medium ${step.action === 'GUN TIME' ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}>
                  {step.action}
                </p>
                {step.buffer && (
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{step.buffer}</p>
                )}
              </div>
            </div>
          ))}
          {riskTolerance === 'high' && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
              <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
              <span>Aggressive timing leaves zero margin. Research shows late arrival (&gt;08:30) triggers cascade failure (b025). Consider conservative timing.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function RunnerIntelligence({ filters }: Props) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['start-line-logistics', 'toilet-strategy']));

  const bullets = useMemo(() => {
    let filtered = (bulletsData as Bullet[]).filter(b => b.section === 'runner-intelligence');

    if (filters.audience.length > 0) {
      filtered = filtered.filter(b => filters.audience.includes(b.audience));
    }
    if (filters.label.length > 0) {
      filtered = filtered.filter(b => filters.label.includes(b.label));
    }
    if (filters.confidence.length > 0) {
      filtered = filtered.filter(b => filters.confidence.includes(b.confidence));
    }
    if (filters.languageOrigin.length > 0) {
      filtered = filtered.filter(b => filters.languageOrigin.includes(b.languageOrigin));
    }
    if (filters.recurrenceOnly) {
      filtered = filtered.filter(b => (b.recurrenceCount || 0) >= 3);
    }

    return filtered;
  }, [filters]);

  const toggleSection = (id: string) => {
    const next = new Set(expandedSections);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpandedSections(next);
  };

  return (
    <div>
      {/* Section Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <User size={22} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="section-header">Runner Guide</h2>
        </div>
        <p className="section-description max-w-3xl">
          Everything you need for race morning and course execution. From Athletes&apos; Village logistics and toilet strategy to pacing psychology and aid station tactics, based on what experienced Berlin Marathon runners wish they&apos;d known.
        </p>
        <p className="text-xs text-[var(--text-muted)] mb-3">This helps you: build a race morning timeline, avoid common start-line mistakes, and plan your pacing strategy.</p>
        <div className="flex flex-wrap gap-2">
          {SUBSECTIONS.slice(0, 5).map((sub) => (
            <a key={sub.id} href={`#${sub.id}`} onClick={(e) => { e.preventDefault(); toggleSection(sub.id); document.getElementById(sub.id)?.scrollIntoView({ behavior: 'smooth' }); }} className="text-xs px-2.5 py-1 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors">
              {sub.label}
            </a>
          ))}
        </div>
      </div>

      <ChecklistGenerator />

      {SUBSECTIONS.map(sub => {
        const sectionBullets = bullets.filter(b => b.subsection === sub.id || b.tags.includes(sub.id));
        const isExpanded = expandedSections.has(sub.id);

        return (
          <div key={sub.id} id={sub.id} className="mb-4">
            <button
              onClick={() => toggleSection(sub.id)}
              className="w-full text-left flex items-center gap-2 py-3 px-4 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--border)] transition-colors"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <span className="font-semibold text-sm text-[var(--text)]">{sub.label}</span>
              <span className="ml-auto text-xs text-[var(--text-muted)]">{sectionBullets.length} items</span>
            </button>
            {isExpanded && (
              <div className="mt-2 ml-2">
                {sectionBullets.length > 0 ? (
                  sectionBullets.map(b => <BulletCard key={b.id} bullet={b} />)
                ) : (
                  <p className="text-sm text-[var(--text-muted)] py-4 px-4">No items match current filters for this subsection.</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
