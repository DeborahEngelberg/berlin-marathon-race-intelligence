'use client';

import { useState, useMemo } from 'react';
import { Map, Filter, RotateCcw, Eye, Footprints, AlertTriangle } from 'lucide-react';
import dynamic from 'next/dynamic';
import RouteCard from '@/components/ui/RouteCard';
import { FilterState, Route } from '@/lib/types';
import routesData from '@/data/routes.json';

const MapView = dynamic(() => import('@/components/ui/MapView'), { ssr: false });

const PACE_BANDS = ['sub-3:00', '3:00-3:30', '3:30-4:15', '4:15+'];
const FEASIBILITY_LEVELS = ['High', 'Medium', 'Low'];

function paceBandMatches(routePace: string, filterPace: string): boolean {
  const normalized = routePace.replace(/\u2013/g, '-');
  if (filterPace === 'sub-3:00') return normalized.includes('sub-3:00');
  if (filterPace === '3:00-3:30') return normalized.includes('3:00-3:30') || normalized === '3:00\u20133:30';
  if (filterPace === '3:30-4:15') return normalized.includes('3:30-4:15') || normalized === '3:30\u20134:15';
  if (filterPace === '4:15+') return normalized.includes('4:15+') || normalized === '4:15+';
  return false;
}

export default function RoutePlanner({ filters }: { filters: FilterState }) {
  const [selectedPaces, setSelectedPaces] = useState<string[]>([]);
  const [selectedFeasibility, setSelectedFeasibility] = useState<string[]>([]);
  const [selectedSpotCount, setSelectedSpotCount] = useState<number | null>(null);
  const [avoidPotsdamer, setAvoidPotsdamer] = useState(false);
  const [minimumWalking, setMinimumWalking] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const allRoutes = routesData as Route[];

  const filteredRoutes = useMemo(() => {
    let result = allRoutes;

    if (selectedPaces.length > 0) {
      result = result.filter(r =>
        selectedPaces.some(pace => paceBandMatches(r.paceBand, pace))
      );
    }

    if (selectedFeasibility.length > 0) {
      result = result.filter(r => selectedFeasibility.includes(r.feasibility));
    }

    if (selectedSpotCount !== null) {
      result = result.filter(r => r.spots.length === selectedSpotCount);
    }

    if (avoidPotsdamer) {
      result = result.filter(r =>
        !r.spots.some(s =>
          s.name.toLowerCase().includes('potsdamer')
        )
      );
    }

    if (minimumWalking) {
      result = result.filter(r => r.spots.length <= 2);
    }

    return result;
  }, [allRoutes, selectedPaces, selectedFeasibility, selectedSpotCount, avoidPotsdamer, minimumWalking]);

  const togglePace = (pace: string) => {
    setSelectedPaces(prev =>
      prev.includes(pace) ? prev.filter(p => p !== pace) : [...prev, pace]
    );
  };

  const toggleFeasibility = (level: string) => {
    setSelectedFeasibility(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const resetFilters = () => {
    setSelectedPaces([]);
    setSelectedFeasibility([]);
    setSelectedSpotCount(null);
    setAvoidPotsdamer(false);
    setMinimumWalking(false);
  };

  const hasActiveFilters =
    selectedPaces.length > 0 ||
    selectedFeasibility.length > 0 ||
    selectedSpotCount !== null ||
    avoidPotsdamer ||
    minimumWalking;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--text)] mb-2 flex items-center gap-2">
          <Map size={24} className="text-[var(--accent)]" />
          Route Planner
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Pre-planned spectator routes with transit directions, viewing spots, and backup plans.
          Each route respects the Three-View Rule.
        </p>
      </div>

      {/* Filter toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text)] mb-4 transition-colors"
      >
        <Filter size={14} />
        {showFilters ? 'Hide Filters' : 'Show Filters'}
        {hasActiveFilters && (
          <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-[var(--accent)] text-white">
            active
          </span>
        )}
      </button>

      {/* Filters panel */}
      {showFilters && (
        <div className="card p-4 mb-6 space-y-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          {/* Pace Band */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-2 uppercase tracking-wide">
              Pace Band
            </label>
            <div className="flex flex-wrap gap-2">
              {PACE_BANDS.map(pace => (
                <button
                  key={pace}
                  onClick={() => togglePace(pace)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    selectedPaces.includes(pace)
                      ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                      : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)]'
                  }`}
                >
                  {pace}
                </button>
              ))}
            </div>
          </div>

          {/* Feasibility */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-2 uppercase tracking-wide">
              Feasibility
            </label>
            <div className="flex flex-wrap gap-2">
              {FEASIBILITY_LEVELS.map(level => (
                <button
                  key={level}
                  onClick={() => toggleFeasibility(level)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    selectedFeasibility.includes(level)
                      ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                      : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)]'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Number of Viewing Spots */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-2 uppercase tracking-wide">
              Number of Views
            </label>
            <div className="flex gap-2">
              {[2, 3].map(count => (
                <button
                  key={count}
                  onClick={() => setSelectedSpotCount(selectedSpotCount === count ? null : count)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1 ${
                    selectedSpotCount === count
                      ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                      : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)]'
                  }`}
                >
                  <Eye size={12} />
                  {count} spots
                </button>
              ))}
            </div>
          </div>

          {/* Toggle switches */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div
                onClick={() => setAvoidPotsdamer(!avoidPotsdamer)}
                className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${
                  avoidPotsdamer ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    avoidPotsdamer ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
              <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1 group-hover:text-[var(--text)]">
                <AlertTriangle size={12} />
                Avoid Potsdamer bottleneck
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer group">
              <div
                onClick={() => setMinimumWalking(!minimumWalking)}
                className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${
                  minimumWalking ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    minimumWalking ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
              <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1 group-hover:text-[var(--text)]">
                <Footprints size={12} />
                Minimum walking
              </span>
            </label>
          </div>

          {/* Reset */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
            >
              <RotateCcw size={12} />
              Reset all filters
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="mb-4 text-sm text-[var(--text-muted)]">
        Showing {filteredRoutes.length} of {allRoutes.length} routes
        {hasActiveFilters && ' (filtered)'}
      </div>

      {/* Route list */}
      {filteredRoutes.length > 0 ? (
        <div className="space-y-6">
          {filteredRoutes.map(route => (
            <div key={route.id}>
              <RouteCard route={route} />
              <div className="mt-2 ml-2">
                <MapView
                  markers={route.spots
                    .filter(s => s.lat !== undefined && s.lng !== undefined)
                    .map((s, i) => ({
                      lat: s.lat!,
                      lng: s.lng!,
                      label: s.name,
                      popup: `${s.station} — ${s.exitGuidance}`,
                      color: i === route.spots.length - 1 ? 'green' : 'orange',
                    }))}
                  connectMarkers={true}
                  height="220px"
                  zoom={12}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <Map size={32} className="mx-auto mb-3 text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-secondary)] mb-2">
            No routes match your current filters.
          </p>
          <button
            onClick={resetFilters}
            className="text-sm text-[var(--accent)] hover:underline"
          >
            Reset filters to see all routes
          </button>
        </div>
      )}
    </div>
  );
}
