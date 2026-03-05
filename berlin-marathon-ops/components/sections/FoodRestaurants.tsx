'use client';

import { useState, useMemo } from 'react';
import restaurantsData from '@/data/restaurants.json';
import { FilterState, Restaurant } from '@/lib/types';
import {
  Utensils,
  Search,
  ExternalLink,
  Clock,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { saveItem, removeItem, isItemSaved } from '@/lib/store';

const restaurants = restaurantsData as Restaurant[];

const PURPOSE_FILTERS = [
  { key: 'carb-load', label: 'Carb Load' },
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'post-race', label: 'Post-Race' },
  { key: 'spectator-hangout', label: 'Spectator Hangout' },
] as const;

const LOCATION_FILTERS = [
  { key: 'near-finish', label: 'Near finish' },
  { key: 'away-from-chaos', label: 'Away from chaos' },
] as const;

const MINIMUM_TARGET = 25;

function confidenceBadge(level: 'High' | 'Med' | 'Low') {
  const styles: Record<string, string> = {
    High: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
    Med: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    Low: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  };
  return (
    <span
      className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full border ${styles[level]}`}
    >
      {level}
    </span>
  );
}

function purposeBadge(tag: string) {
  const labelMap: Record<string, string> = {
    'carb-load': 'Carb Load',
    breakfast: 'Breakfast',
    'post-race': 'Post-Race',
    'pre-race': 'Pre-Race',
    'spectator-hangout': 'Spectator',
  };
  return (
    <span
      key={tag}
      className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
    >
      {labelMap[tag] || tag}
    </span>
  );
}

function CitationList({
  citations,
}: {
  citations: { sourceName: string; sourceUrl: string }[];
}) {
  if (!citations || citations.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {citations.map((c, i) => (
        <a
          key={i}
          href={c.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[10px] text-[var(--accent)] hover:underline"
        >
          <ExternalLink size={10} />
          {c.sourceName}
        </a>
      ))}
    </div>
  );
}

function isMitteNeighborhood(neighborhood: string): boolean {
  return neighborhood.toLowerCase().includes('mitte');
}

function HighlightHours({ text }: { text: string }) {
  if (text.includes('HOURS NOT FOUND')) {
    const parts = text.split('HOURS NOT FOUND');
    return (
      <span>
        {parts[0]}
        <span className="font-semibold text-orange-500">HOURS NOT FOUND</span>
        {parts[1]}
      </span>
    );
  }
  return <span>{text}</span>;
}

export default function FoodRestaurants({
  filters,
}: {
  filters: FilterState;
}) {
  const [activePurposes, setActivePurposes] = useState<Set<string>>(
    new Set()
  );
  const [activeLocations, setActiveLocations] = useState<Set<string>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    const set = new Set<string>();
    restaurants.forEach((r) => {
      if (isItemSaved(r.id, 'restaurant')) set.add(r.id);
    });
    return set;
  });

  const togglePurpose = (key: string) => {
    setActivePurposes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleLocation = (key: string) => {
    setActiveLocations((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSave = (r: Restaurant) => {
    const next = new Set(savedIds);
    if (savedIds.has(r.id)) {
      removeItem(r.id, 'restaurant');
      next.delete(r.id);
    } else {
      saveItem({
        id: r.id,
        type: 'restaurant',
        title: r.name,
        timestamp: Date.now(),
      });
      next.add(r.id);
    }
    setSavedIds(next);
  };

  const filtered = useMemo(() => {
    let result = [...restaurants];

    // Filter by confidence from global FilterState
    if (filters.confidence && filters.confidence.length > 0) {
      result = result.filter((r) => filters.confidence.includes(r.confidence));
    }

    // Filter by purpose tags (multi-select, union)
    if (activePurposes.size > 0) {
      result = result.filter((r) =>
        r.purposeTags.some((tag) => activePurposes.has(tag))
      );
    }

    // Filter by location
    if (activeLocations.size > 0) {
      result = result.filter((r) => {
        const inMitte = isMitteNeighborhood(r.neighborhood);
        if (
          activeLocations.has('near-finish') &&
          activeLocations.has('away-from-chaos')
        ) {
          // Both selected - show all
          return true;
        }
        if (activeLocations.has('near-finish')) return inMitte;
        if (activeLocations.has('away-from-chaos')) return !inMitte;
        return true;
      });
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.neighborhood.toLowerCase().includes(q)
      );
    }

    return result;
  }, [filters.confidence, activePurposes, activeLocations, searchQuery]);

  const showMoreComing = restaurants.length < MINIMUM_TARGET;

  return (
    <div>
      {/* Section Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Utensils size={22} className="text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="section-header">Food &amp; Restaurants</h2>
        </div>
        <p className="section-description max-w-3xl">
          Marathon weekend eating strategy: from carb-loading dinners to race-morning breakfast to post-finish celebration meals. Filtered by purpose and proximity to the course and finish area.
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          {restaurants.length} verified entries
        </p>
      </div>

      {/* More Recommendations Coming Soon */}
      {showMoreComing && (
        <div className="mb-6 rounded-lg border-2 border-orange-400 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={20}
              className="text-orange-500 flex-shrink-0 mt-0.5"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 border border-orange-300 dark:border-orange-700">
                  More Coming Soon
                </span>
              </div>
              <p className="text-sm text-orange-800 dark:text-orange-300">
                More recommendations coming soon. This section currently contains{' '}
                <strong>{restaurants.length}</strong> verified entries out of a
                target of {MINIMUM_TARGET}. Contribute your experience using the feedback form on the
                Support page.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 space-y-3">
        {/* Purpose Filters */}
        <div className="flex flex-wrap gap-2">
          {PURPOSE_FILTERS.map((f) => {
            const active = activePurposes.has(f.key);
            return (
              <button
                key={f.key}
                onClick={() => togglePurpose(f.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  active
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--text)]'
                }`}
              >
                {f.label}
              </button>
            );
          })}
          <span className="w-px h-6 self-center bg-[var(--border)]" />
          {LOCATION_FILTERS.map((f) => {
            const active = activeLocations.has(f.key);
            return (
              <button
                key={f.key}
                onClick={() => toggleLocation(f.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  active
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--text)]'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or neighborhood..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>
      </div>

      {/* Results Count */}
      <p className="text-xs text-[var(--text-muted)] mb-4">
        Showing {filtered.length} of {restaurants.length} entries
      </p>

      {/* Restaurant Cards */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-[var(--text-muted)]">
            No restaurants match the current filters.
          </div>
        )}

        {filtered.map((r) => {
          const isExpanded = expandedIds.has(r.id);
          const isSaved = savedIds.has(r.id);

          return (
            <div
              key={r.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden transition-colors hover:border-[var(--accent)]/30"
            >
              {/* Collapsed Header */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
                onClick={() => toggleExpanded(r.id)}
              >
                <button
                  className="flex-shrink-0 text-[var(--text-muted)]"
                  aria-label={isExpanded ? 'Collapse' : 'Expand'}
                >
                  {isExpanded ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-[var(--text)] truncate">
                      {r.name}
                    </h3>
                    <span className="text-xs text-[var(--text-muted)] flex-shrink-0">
                      {r.neighborhood}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {r.purposeTags.map((tag) => purposeBadge(tag))}
                    {confidenceBadge(r.confidence)}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSave(r);
                  }}
                  className="flex-shrink-0 p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
                  title={isSaved ? 'Remove from saved' : 'Save to plan'}
                >
                  {isSaved ? (
                    <BookmarkCheck
                      size={16}
                      className="text-[var(--accent)]"
                    />
                  ) : (
                    <Bookmark
                      size={16}
                      className="text-[var(--text-muted)]"
                    />
                  )}
                </button>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-[var(--border)] bg-[var(--bg-elevated)]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Station */}
                    <div>
                      <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-0.5">
                        Nearest Station
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {r.station}
                      </p>
                    </div>

                    {/* Hours */}
                    <div>
                      <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-0.5 flex items-center gap-1">
                        <Clock size={10} />
                        Hours
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        <HighlightHours text={r.hoursProofText} />
                      </p>
                    </div>

                    {/* Order Notes */}
                    <div>
                      <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-0.5">
                        What to Order
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {r.orderNotes}
                      </p>
                    </div>

                    {/* Reservation Hack */}
                    <div>
                      <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-0.5">
                        Reservation Hack
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {r.reservationHack}
                      </p>
                    </div>
                  </div>

                  {/* Citations */}
                  <CitationList citations={r.citations} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
