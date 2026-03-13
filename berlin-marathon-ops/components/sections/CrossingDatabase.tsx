'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { GitBranch, Map, List, Search, HelpCircle } from 'lucide-react';
import crossingsData from '@/data/crossings.json';
import CrossingRow from '@/components/ui/CrossingRow';
import { FilterState, Crossing } from '@/lib/types';

const MapView = dynamic(() => import('@/components/ui/MapView'), { ssr: false });

const crossings = crossingsData as Crossing[];

const CROSSING_TYPES = [
  { value: 'station-tunnel', label: 'Station Tunnel', color: 'blue' },
  { value: 'road-tunnel', label: 'Road Tunnel', color: 'purple' },
  { value: 'underpass', label: 'Underpass', color: 'green' },
  { value: 'designated-crossing', label: 'Designated Crossing', color: 'orange' },
  { value: 'bridge', label: 'Bridge', color: 'yellow' },
] as const;

const typeToMapColor: Record<string, string> = {
  'station-tunnel': 'blue',
  'road-tunnel': 'purple',
  'underpass': 'green',
  'designated-crossing': 'orange',
  'bridge': 'yellow',
};

const typePillStyles: Record<string, string> = {
  'station-tunnel': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  'road-tunnel': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  'underpass': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800',
  'designated-crossing': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
  'bridge': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
};

function getAllStations(): string[] {
  const stationSet = new Set<string>();
  crossings.forEach((c) => {
    c.nearestStations.forEach((s) => stationSet.add(s));
  });
  return Array.from(stationSet).sort();
}

export default function CrossingDatabase({ filters }: { filters: FilterState }) {
  const [view, setView] = useState<'map' | 'table'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set());
  const [helperStation, setHelperStation] = useState('');
  const [helperSide, setHelperSide] = useState('');
  const [showHelper, setShowHelper] = useState(false);

  const allStations = useMemo(() => getAllStations(), []);

  const filteredCrossings = useMemo(() => {
    let result = crossings;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.locationText.toLowerCase().includes(q) ||
          c.nearestStations.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (activeTypes.size > 0) {
      result = result.filter((c) => activeTypes.has(c.type));
    }

    if (filters.confidence.length > 0) {
      result = result.filter((c) => filters.confidence.includes(c.confidence));
    }

    return result;
  }, [searchQuery, activeTypes, filters]);

  const mapMarkers = useMemo(() => {
    return filteredCrossings
      .filter((c) => c.lat && c.lng)
      .map((c) => ({
        lat: c.lat!,
        lng: c.lng!,
        label: c.name,
        popup: `<b>${c.name}</b><br/><em>${c.type}</em><br/>${c.locationText}`,
        color: typeToMapColor[c.type] || 'orange',
      }));
  }, [filteredCrossings]);

  const toggleType = (type: string) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const helperResults = useMemo(() => {
    if (!helperStation) return [];
    return crossings.filter((c) =>
      c.nearestStations.some((s) => s === helperStation)
    );
  }, [helperStation]);

  return (
    <div>
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--text)] mb-2 flex items-center gap-2">
          <GitBranch size={24} className="text-[var(--accent)]" />
          Crossing Database
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Berlin spectator superpower — how to cross the marathon course
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {crossings.length} crossings documented
        </p>
      </div>

      {/* View Toggle + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex rounded-lg border border-[var(--border)] overflow-hidden flex-shrink-0">
          <button
            onClick={() => setView('map')}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
              view === 'map'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
            }`}
          >
            <Map size={14} />
            Map
          </button>
          <button
            onClick={() => setView('table')}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
              view === 'table'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
            }`}
          >
            <List size={14} />
            Table
          </button>
        </div>

        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search crossings by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
          />
        </div>
      </div>

      {/* Type Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {CROSSING_TYPES.map((ct) => {
          const isActive = activeTypes.has(ct.value);
          return (
            <button
              key={ct.value}
              onClick={() => toggleType(ct.value)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                isActive
                  ? typePillStyles[ct.value]
                  : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--text-muted)]'
              }`}
            >
              {ct.label}
              {isActive && (
                <span className="ml-1.5">
                  {filteredCrossings.filter((c) => c.type === ct.value).length}
                </span>
              )}
            </button>
          );
        })}
        {activeTypes.size > 0 && (
          <button
            onClick={() => setActiveTypes(new Set())}
            className="px-3 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text)] underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-xs text-[var(--text-muted)] mb-3">
        Showing {filteredCrossings.length} of {crossings.length} crossings
      </p>

      {/* Map View */}
      {view === 'map' && (
        <div className="mb-6">
          {mapMarkers.length > 0 ? (
            <MapView
              markers={mapMarkers}
              center={[52.5096, 13.3761]}
              zoom={12}
              height="400px"
            />
          ) : (
            <div className="p-8 rounded-lg bg-[var(--bg-elevated)] text-center">
              <GitBranch size={32} className="mx-auto mb-3 text-[var(--text-muted)] opacity-40" />
              <p className="text-sm font-medium text-[var(--text)] mb-1">No crossings on map</p>
              <p className="text-xs text-[var(--text-muted)]">Try removing type filters or broadening your search.</p>
            </div>
          )}
          <p className="text-xs text-[var(--text-muted)] mt-2">
            Pin colors: <span className="text-blue-500">blue</span> = station tunnel,{' '}
            <span className="text-purple-500">purple</span> = road tunnel,{' '}
            <span className="text-green-500">green</span> = underpass,{' '}
            <span className="text-orange-500">orange</span> = designated crossing,{' '}
            <span className="text-yellow-500">yellow</span> = bridge
          </p>
        </div>
      )}

      {/* Table View */}
      {view === 'table' && (
        <div className="mb-6">
          {filteredCrossings.length > 0 ? (
            filteredCrossings.map((c) => <CrossingRow key={c.id} crossing={c} />)
          ) : (
            <div className="p-8 rounded-lg bg-[var(--bg-elevated)] text-center">
              <GitBranch size={32} className="mx-auto mb-3 text-[var(--text-muted)] opacity-40" />
              <p className="text-sm font-medium text-[var(--text)] mb-1">No crossings found</p>
              <p className="text-xs text-[var(--text-muted)]">Try a different search term or remove type filters.</p>
            </div>
          )}
        </div>
      )}

      {/* Crossing Decision Helper */}
      <div className="tool-card p-5">
        <button
          onClick={() => setShowHelper(!showHelper)}
          className="w-full text-left flex items-center gap-2"
        >
          <HelpCircle size={16} className="text-[var(--accent)]" />
          <h3 className="font-semibold text-[var(--text)] text-sm">
            Crossing Decision Helper
          </h3>
          <span className="ml-auto text-xs text-[var(--text-muted)]">
            {showHelper ? 'Hide' : 'Show'}
          </span>
        </button>

        {showHelper && (
          <div className="mt-4 space-y-4 animate-fade-slide-down">
            <p className="text-sm text-[var(--text-secondary)]">
              Select a station and desired side to find recommended crossings nearby.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Station Selector */}
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] uppercase mb-1">
                  Station
                </label>
                <select
                  value={helperStation}
                  onChange={(e) => setHelperStation(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                >
                  <option value="">Select a station...</option>
                  {allStations.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Side Selector */}
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] uppercase mb-1">
                  Desired Side
                </label>
                <select
                  value={helperSide}
                  onChange={(e) => setHelperSide(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                >
                  <option value="">Select desired side...</option>
                  <option value="east">East of course</option>
                  <option value="west">West of course</option>
                  <option value="north">North of course</option>
                  <option value="south">South of course</option>
                </select>
              </div>
            </div>

            {/* Helper Results */}
            {helperStation && (
              <div className="space-y-3">
                <h4 className="text-xs font-medium text-[var(--text-muted)] uppercase">
                  Crossings near {helperStation}
                </h4>

                {helperResults.length > 0 ? (
                  helperResults.map((c) => {
                    const isHighTrap = c.trapRiskText.startsWith('HIGH');
                    const cantCross = c.canCrossText.startsWith("CAN'T");
                    const sideUnknown = c.sideOutcomeText.includes('NOT FOUND');

                    return (
                      <div
                        key={c.id}
                        className={`p-3 rounded-lg border ${
                          isHighTrap
                            ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                            : 'border-[var(--border)] bg-[var(--bg-elevated)]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-[var(--text)]">
                              {c.name}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                              {c.type} — {c.locationText}
                            </p>
                          </div>
                          <span
                            className={`badge text-[11px] ${
                              c.confidence === 'High'
                                ? 'badge-high'
                                : c.confidence === 'Med'
                                ? 'badge-med'
                                : 'badge-low'
                            }`}
                          >
                            {c.confidence}
                          </span>
                        </div>

                        <p className={`text-xs mt-2 ${cantCross ? 'text-red-500 font-medium' : 'text-[var(--text-secondary)]'}`}>
                          {c.canCrossText}
                        </p>

                        {helperSide && (
                          <div className="mt-2">
                            {sideUnknown ? (
                              <p className="text-xs text-orange-500 font-medium">
                                Side outcome data incomplete — verify on site.
                              </p>
                            ) : (
                              <p className="text-xs text-[var(--text-secondary)]">
                                <span className="font-medium text-[var(--text)]">Side:</span>{' '}
                                {c.sideOutcomeText}
                              </p>
                            )}
                          </div>
                        )}

                        {isHighTrap && (
                          <p className="text-xs text-red-500 font-medium mt-2">
                            WARNING: {c.trapRiskText}
                          </p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800">
                    <p className="text-sm font-medium text-orange-700 dark:text-orange-400">
                      DATA NOT FOUND — use U-station underpass rule
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">
                      No documented crossings for this station. Default strategy: enter the
                      U-Bahn station and use the underground passages (Stra&szlig;enunterf&uuml;hrungen
                      der U-Bahnh&ouml;fe) to emerge on the desired side of the course.
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-2 italic">
                      Source: Berlin Marathon Community / rbb24 —{' '}
                      <a
                        href="https://www.rbb24.de/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--accent)] hover:underline"
                      >
                        rbb24.de
                      </a>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
