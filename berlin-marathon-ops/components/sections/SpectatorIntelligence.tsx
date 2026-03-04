'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Eye, AlertTriangle } from 'lucide-react';
import BulletCard from '@/components/ui/BulletCard';
import { Bullet, FilterState } from '@/lib/types';
import bulletsData from '@/data/bullets.json';

const SUBSECTIONS = [
  { id: 'best-viewing-zones', label: 'Best Viewing Zones' },
  { id: 'trap-zones', label: 'Where NOT to Watch / Trap Zones' },
  { id: 'crowd-hotspots', label: 'Crowd Hotspots' },
  { id: 'viewing-strategy', label: 'Viewing Strategy Principles' },
  { id: 'three-view-rule', label: 'Three-View Rule' },
];

interface Props {
  filters: FilterState;
}

export default function SpectatorIntelligence({ filters }: Props) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['best-viewing-zones', 'trap-zones']));

  const bullets = useMemo(() => {
    let filtered = (bulletsData as Bullet[]).filter(b =>
      b.section === 'spectator-intelligence' || (b.audience === 'Spectator' && b.section !== 'runner-intelligence')
    );

    if (filters.audience.length > 0) filtered = filtered.filter(b => filters.audience.includes(b.audience));
    if (filters.label.length > 0) filtered = filtered.filter(b => filters.label.includes(b.label));
    if (filters.confidence.length > 0) filtered = filtered.filter(b => filters.confidence.includes(b.confidence));
    if (filters.languageOrigin.length > 0) filtered = filtered.filter(b => filters.languageOrigin.includes(b.languageOrigin));
    if (filters.recurrenceOnly) filtered = filtered.filter(b => (b.recurrenceCount || 0) >= 3);

    return filtered;
  }, [filters]);

  const toggleSection = (id: string) => {
    const next = new Set(expandedSections);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpandedSections(next);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--text)] mb-2 flex items-center gap-2">
          <Eye size={24} className="text-[var(--accent)]" />
          Spectator Guide
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Tactical viewing strategies, wrong-side traps, and the Three-View Rule.
        </p>
      </div>

      {/* Three-View Rule Explainer */}
      <div className="card p-4 mb-6 border-l-4 border-l-[var(--accent)]">
        <h3 className="font-semibold text-[var(--text)] mb-2 flex items-center gap-2">
          <Eye size={16} className="text-[var(--accent)]" />
          The Three-View Rule
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mb-3">
          Attempting more than 3 viewing positions consistently fails. Transit disruptions, course crossing delays, and crowd density make a 4th move nearly impossible for runners slower than 3:15.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
            <div className="text-green-700 dark:text-green-400 text-xs font-medium mb-1">2 Spots</div>
            <p className="text-xs text-green-600 dark:text-green-300">Maximum comfort. Best for 4:15+ runners. Near-guaranteed success.</p>
          </div>
          <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800">
            <div className="text-yellow-700 dark:text-yellow-400 text-xs font-medium mb-1">3 Spots</div>
            <p className="text-xs text-yellow-600 dark:text-yellow-300">Optimal. Budget 30-40 min transit between spots. Requires U-Bahn planning.</p>
          </div>
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
            <div className="text-red-700 dark:text-red-400 text-xs font-medium mb-1">4+ Spots</div>
            <p className="text-xs text-red-600 dark:text-red-300">Failure-prone. Zero margin for error. Usually results in missing the runner at 1+ spots.</p>
          </div>
        </div>
      </div>

      {/* Wrong-Side Trap Module */}
      <div className="card p-4 mb-6 border-l-4 border-l-red-500">
        <h3 className="font-semibold text-[var(--text)] mb-2 flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-500" />
          Wrong-Side Trap Warning: Potsdamer Platz
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mb-3">
          The course passes on BOTH sides of Potsdamer Platz. Construction zones and course barriers make surface crossing impossible. Spectators who exit at the wrong surface exit lose 20-40 minutes.
        </p>
        <div className="p-3 rounded-lg bg-[var(--bg-elevated)]">
          <p className="text-sm font-medium text-[var(--accent)] mb-1">The Hack:</p>
          <p className="text-sm text-[var(--text)]">
            Use the <span className="font-mono text-xs bg-[var(--bg)] px-1 py-0.5 rounded">Straßenunterführungen der U-Bahnhöfe</span> (U-Bahn station underpasses) at Potsdamer Platz to traverse beneath the race course. Leipziger Platz exit = east of course. Potsdamer Straße exit = west of course.
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            Source: <a href="https://www.rbb24.de/" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">Berlin Marathon Community / rbb24</a>
          </p>
        </div>
      </div>

      {SUBSECTIONS.map(sub => {
        const sectionBullets = bullets.filter(b =>
          b.subsection === sub.id || b.tags.includes(sub.id)
        );
        const isExpanded = expandedSections.has(sub.id);

        return (
          <div key={sub.id} className="mb-4">
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
                  <p className="text-sm text-[var(--text-muted)] py-4 px-4">No items match current filters.</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
