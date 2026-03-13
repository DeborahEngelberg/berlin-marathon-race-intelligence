'use client';

import { useState, useMemo } from 'react';
import { Train, AlertTriangle, ChevronDown, ChevronRight, ExternalLink, X, Check } from 'lucide-react';
import BulletCard from '@/components/ui/BulletCard';
import bulletsData from '@/data/bullets.json';
import { FilterState, Bullet } from '@/lib/types';

const SUBSECTIONS = [
  { id: 'u-bahn-reliability', label: 'U-Bahn Reliability' },
  { id: 's-bahn-reliability', label: 'S-Bahn Reliability' },
  { id: 'stations-to-avoid', label: 'Stations to Avoid' },
  { id: 'surface-disruptions', label: 'Surface Transit Disruptions' },
];

const CHEAT_SHEET = [
  {
    from: 'Zoologischer Garten',
    to: 'Potsdamer Platz',
    lines: 'U2',
    guidance: 'U2 direct, 2 stops, ~5 min. Most reliable spectator move.',
  },
  {
    from: 'Alexanderplatz',
    to: 'Brandenburger Tor',
    lines: 'U5',
    guidance: 'U5 direct, 2 stops, ~4 min. Watch exit selection at both ends.',
  },
  {
    from: 'Hauptbahnhof',
    to: 'Potsdamer Platz',
    lines: 'S1/S2',
    guidance: 'S1/S2, 1 stop, ~3 min. Or walk 15 min through Tiergarten.',
  },
  {
    from: 'Hermannplatz',
    to: 'Nollendorfplatz',
    lines: 'U7',
    guidance: 'U7 direct, 5 stops, ~10 min. Course-crossing route through Sch\u00F6neberg.',
  },
  {
    from: 'Mehringdamm',
    to: 'Zoologischer Garten',
    lines: 'U7 \u2192 U2',
    guidance: 'U7 to Nollendorfplatz, transfer U2. Total ~15 min.',
  },
];

const DO_NOT_LIST = [
  'Do NOT plan any spectator move using bus or tram routes',
  'Do NOT exit Alexanderplatz station without checking which exit leads to your desired course side',
  'Do NOT assume you can cross the course at street level after 10:30',
  'Do NOT rely on cell data/GPS for real-time transit info near finish - network congested',
  'Do NOT take the S-Bahn Ring expecting normal station exits - surface exits may be blocked',
];

export default function TransitStrategy({ filters }: { filters: FilterState }) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['u-bahn-reliability', 's-bahn-reliability'])
  );

  const bullets = useMemo(() => {
    let filtered = (bulletsData as Bullet[]).filter(
      (b) => b.section === 'transit-strategy'
    );

    if (filters.audience.length > 0)
      filtered = filtered.filter((b) => filters.audience.includes(b.audience));
    if (filters.label.length > 0)
      filtered = filtered.filter((b) => filters.label.includes(b.label));
    if (filters.confidence.length > 0)
      filtered = filtered.filter((b) => filters.confidence.includes(b.confidence));
    if (filters.languageOrigin.length > 0)
      filtered = filtered.filter((b) => filters.languageOrigin.includes(b.languageOrigin));
    if (filters.recurrenceOnly)
      filtered = filtered.filter((b) => (b.recurrenceCount || 0) >= 3);

    return filtered;
  }, [filters]);

  const toggleSection = (id: string) => {
    const next = new Set(expandedSections);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedSections(next);
  };

  return (
    <div>
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--text)] mb-2">Transit Strategy</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          U-Bahn vs S-Bahn, what works, what fails, and when walking wins
        </p>
      </div>

      {/* Collapsible Subsections */}
      {SUBSECTIONS.map((sub) => {
        const sectionBullets = bullets.filter(
          (b) => b.subsection === sub.id || b.tags.includes(sub.id)
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
              <span className="ml-auto text-xs text-[var(--text-muted)]">
                {sectionBullets.length} items
              </span>
            </button>
            {isExpanded && (
              <div className="mt-2 ml-2 animate-fade-slide-down">
                {sectionBullets.length > 0 ? (
                  sectionBullets.map((b) => <BulletCard key={b.id} bullet={b} />)
                ) : (
                  <p className="text-sm text-[var(--text-muted)] py-4 px-4">
                    No items match current filters.
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Transit Cheat Sheet */}
      <div className="mt-8 mb-8">
        <h3 className="text-lg font-bold text-[var(--text)] mb-4 flex items-center gap-2">
          <Train size={20} className="text-[var(--accent)]" />
          Transit Cheat Sheet
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CHEAT_SHEET.map((route) => (
            <div
              key={`${route.from}-${route.to}`}
              className="card p-4 border-l-4 border-l-[var(--accent)]"
            >
              <div className="flex items-center gap-2 mb-2">
                <Train size={14} className="text-[var(--accent)] flex-shrink-0" />
                <span className="text-sm font-semibold text-[var(--text)]">
                  {route.from}
                </span>
                <span className="text-xs text-[var(--text-muted)]">&rarr;</span>
                <span className="text-sm font-semibold text-[var(--text)]">
                  {route.to}
                </span>
              </div>
              <div className="mb-2">
                <span className="inline-block text-xs font-mono px-2 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--accent)] border border-[var(--border)]">
                  {route.lines}
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">{route.guidance}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Do NOT Do This */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-[var(--text)] mb-4 flex items-center gap-2">
          <AlertTriangle size={20} className="text-red-500" />
          Do NOT Do This
        </h3>
        <div className="space-y-2">
          {DO_NOT_LIST.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800"
            >
              <X size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-400">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* External Links */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-[var(--text)] mb-3">
          Official Marathon Transit Notices
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="https://www.bvg.de/en"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-[var(--accent)] hover:underline"
          >
            <ExternalLink size={14} />
            BVG Marathon Notices
          </a>
          <a
            href="https://www.s-bahn-berlin.de/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-[var(--accent)] hover:underline"
          >
            <ExternalLink size={14} />
            S-Bahn Berlin
          </a>
        </div>
      </div>
    </div>
  );
}
