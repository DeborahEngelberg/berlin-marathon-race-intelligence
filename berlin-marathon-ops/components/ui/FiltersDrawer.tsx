'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { FilterState } from '@/lib/types';

const AUDIENCES = ['Runner', 'Spectator', 'Both'];
const LABELS = [
  'Runner tactic', 'Spectator tactic', 'Transit strategy',
  'Security reality', 'Failure mode', 'Lodging strategy',
  'Mistake pattern', 'Edge case', 'Walking route', 'Restaurant tactic',
];
const CONFIDENCES = ['High', 'Med', 'Low'];
const LANG_ORIGINS = ['DE', 'EN', 'MIX'];

interface Props {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export default function FiltersDrawer({ filters, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const toggle = (arr: string[], value: string): string[] => {
    return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
  };

  const activeCount =
    filters.audience.length +
    filters.label.length +
    filters.confidence.length +
    filters.languageOrigin.length +
    (filters.recurrenceOnly ? 1 : 0);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
      >
        <Filter size={14} />
        Filters
        {activeCount > 0 && (
          <span className="ml-1 w-5 h-5 rounded-full bg-[var(--accent)] text-white text-xs flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-80 max-w-full h-full bg-[var(--bg-card)] border-l border-[var(--border)] shadow-2xl overflow-y-auto animate-slide-in-right">
            <div className="sticky top-0 bg-[var(--bg-card)] border-b border-[var(--border)] p-4 flex items-center justify-between">
              <h3 className="font-semibold text-[var(--text)]">Filters</h3>
              <div className="flex gap-2">
                {activeCount > 0 && (
                  <button
                    onClick={() => onChange({ audience: [], label: [], confidence: [], recurrenceOnly: false, languageOrigin: [] })}
                    className="text-xs text-[var(--accent)] hover:underline"
                  >
                    Clear all
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text)]">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-5">
              {/* Audience */}
              <div>
                <h4 className="text-xs font-medium text-[var(--text-muted)] uppercase mb-2">Audience</h4>
                <div className="flex flex-wrap gap-1.5">
                  {AUDIENCES.map(a => (
                    <button
                      key={a}
                      onClick={() => onChange({ ...filters, audience: toggle(filters.audience, a) })}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                        filters.audience.includes(a)
                          ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                          : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Label */}
              <div>
                <h4 className="text-xs font-medium text-[var(--text-muted)] uppercase mb-2">Label</h4>
                <div className="flex flex-wrap gap-1.5">
                  {LABELS.map(l => (
                    <button
                      key={l}
                      onClick={() => onChange({ ...filters, label: toggle(filters.label, l) })}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                        filters.label.includes(l)
                          ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                          : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Confidence */}
              <div>
                <h4 className="text-xs font-medium text-[var(--text-muted)] uppercase mb-2">Confidence</h4>
                <div className="flex flex-wrap gap-1.5">
                  {CONFIDENCES.map(c => (
                    <button
                      key={c}
                      onClick={() => onChange({ ...filters, confidence: toggle(filters.confidence, c) })}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                        filters.confidence.includes(c)
                          ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                          : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Origin */}
              <div>
                <h4 className="text-xs font-medium text-[var(--text-muted)] uppercase mb-2">Language Origin</h4>
                <div className="flex flex-wrap gap-1.5">
                  {LANG_ORIGINS.map(lo => (
                    <button
                      key={lo}
                      onClick={() => onChange({ ...filters, languageOrigin: toggle(filters.languageOrigin, lo) })}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                        filters.languageOrigin.includes(lo)
                          ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                          : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]'
                      }`}
                    >
                      {lo === 'DE' ? 'German-source' : lo === 'EN' ? 'English-source' : 'Mixed'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recurrence */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.recurrenceOnly}
                    onChange={() => onChange({ ...filters, recurrenceOnly: !filters.recurrenceOnly })}
                    className="rounded border-[var(--border)] accent-[var(--accent)]"
                  />
                  <span className="text-sm text-[var(--text)]">Show only frequently reported (3+ sources)</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
