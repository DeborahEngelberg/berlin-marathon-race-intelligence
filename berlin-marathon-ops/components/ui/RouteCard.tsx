'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, Check, Bookmark, BookmarkCheck, MapPin, Train, AlertTriangle, ExternalLink, Navigation } from 'lucide-react';
import { Route } from '@/lib/types';
import { saveItem, removeItem, isItemSaved, trackEvent } from '@/lib/store';

function FeasibilityBadge({ level }: { level: string }) {
  const cls = level === 'High' ? 'badge-high' : level === 'Medium' ? 'badge-med' : 'badge-low';
  return <span className={`badge ${cls}`}>{level} feasibility</span>;
}

export default function RouteCard({ route }: { route: Route }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(() => {
    if (typeof window === 'undefined') return false;
    return isItemSaved(route.id, 'route');
  });

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = [
      route.name,
      `Pace: ${route.paceBand}`,
      `Feasibility: ${route.feasibility}`,
      '',
      ...route.spots.map((s, i) => [
        `Spot ${i + 1}: ${s.name}${s.kmMarker !== undefined ? ` (KM ${s.kmMarker})` : ''}`,
        `  Transit: ${s.station} (${s.lines.join(', ')})`,
        `  Exit: ${s.exitGuidance}`,
        `  Side: ${s.sideGuidance}`,
      ].join('\n')),
      '',
      `Backup: ${route.backupPlan}`,
    ].join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (saved) {
      removeItem(route.id, 'route');
      setSaved(false);
    } else {
      saveItem({ id: route.id, type: 'route', title: route.name, timestamp: Date.now() });
      setSaved(true);
    }
  };

  const handleToggle = () => {
    setExpanded(!expanded);
    if (!expanded) trackEvent('expand', `route:${route.id}`);
  };

  const getGoogleMapsUrl = (spot: { name: string; lat?: number; lng?: number }) => {
    if (spot.lat && spot.lng) {
      return `https://www.google.com/maps?q=${spot.lat},${spot.lng}`;
    }
    return `https://www.google.com/maps/search/${encodeURIComponent(spot.name + ' Berlin')}`;
  };

  return (
    <div className="card p-0 mb-3">
      <button
        onClick={handleToggle}
        className="w-full text-left p-4 flex items-start gap-3 hover:bg-[var(--bg-elevated)] transition-colors rounded-lg"
      >
        <span className="mt-1 text-[var(--text-muted)] flex-shrink-0">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="font-semibold text-[var(--text)]">{route.name}</h3>
            <FeasibilityBadge level={route.feasibility} />
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-[var(--text-secondary)]">
            <span className="badge bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              {route.paceBand}
            </span>
            <span className="text-[var(--text-muted)]">
              {route.spots.length} viewing spots
            </span>
          </div>
          {/* Quick spot overview */}
          <div className="flex flex-wrap items-center gap-1 mt-2 text-xs text-[var(--text-muted)]">
            {route.spots.map((s, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span className="text-[var(--accent)]">&rarr;</span>}
                <span>{s.name.split('(')[0].trim()}</span>
                {s.kmMarker !== undefined && <span className="text-[var(--accent)] font-medium">KM {s.kmMarker}</span>}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0 ml-2">
          <button onClick={handleCopy} className="p-1.5 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-muted)]" title="Copy">
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          </button>
          <button onClick={handleSave} className="p-1.5 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-muted)]" title="Save">
            {saved ? <BookmarkCheck size={14} className="text-[var(--accent)]" /> : <Bookmark size={14} />}
          </button>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-[var(--border)]">
          {/* Spots - Structured Layout */}
          <div className="pt-4 space-y-0">
            {route.spots.map((spot, i) => (
              <div key={i} className="relative">
                {/* Spot Card */}
                <div className="flex gap-3 items-start pb-2">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-sm font-bold shadow-sm">
                      {i + 1}
                    </div>
                    {i < route.spots.length - 1 && (
                      <div className="w-0.5 h-full bg-[var(--border)] mt-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pb-3">
                    {/* Spot Header */}
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">Spot {i + 1}</span>
                      {spot.kmMarker !== undefined && (
                        <span className="text-xs font-mono text-[var(--text-muted)]">KM {spot.kmMarker}</span>
                      )}
                    </div>

                    {/* Location Name */}
                    <h4 className="font-semibold text-sm text-[var(--text)] mb-2">{spot.name}</h4>

                    {/* Transit Info */}
                    <div className="rounded-lg bg-[var(--bg-elevated)] p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Train size={13} className="text-[var(--accent)] flex-shrink-0" />
                        <span className="text-xs font-medium text-[var(--text)]">Transit</span>
                        <span className="text-xs text-[var(--text-secondary)]">{spot.station}</span>
                        <div className="flex gap-1">
                          {spot.lines.map(line => (
                            <span key={line} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-card)] text-[var(--accent)] border border-[var(--border)]">{line}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Navigation size={13} className="text-[var(--text-muted)] flex-shrink-0 mt-0.5" />
                        <span className={`text-xs ${spot.exitGuidance.includes('NOT FOUND') ? 'text-orange-500' : 'text-[var(--text-secondary)]'}`}>
                          {spot.exitGuidance}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin size={13} className="text-[var(--text-muted)] flex-shrink-0 mt-0.5" />
                        <span className={`text-xs ${spot.sideGuidance.includes('NOT FOUND') ? 'text-orange-500' : 'text-[var(--text-secondary)]'}`}>
                          {spot.sideGuidance}
                        </span>
                      </div>
                    </div>

                    <a
                      href={getGoogleMapsUrl(spot)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline mt-2"
                    >
                      <ExternalLink size={10} /> Open in Google Maps
                    </a>
                  </div>
                </div>

                {/* Transit between spots */}
                {i < route.spots.length - 1 && (
                  <div className="ml-[18px] pl-6 pb-3 border-l-2 border-dashed border-[var(--border)]">
                    <div className="flex items-center gap-2 py-1.5 px-3 rounded bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                      <Train size={12} className="text-blue-500" />
                      <span className="text-xs text-blue-700 dark:text-blue-400">
                        Transit to Spot {i + 2}: {route.spots[i + 1].station} ({route.spots[i + 1].lines.join(', ')})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pace Compatibility */}
          <div className="mt-3 p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)]">
            <p className="text-xs font-medium text-[var(--text)] mb-1">Runner Pace Compatibility</p>
            <p className="text-xs text-[var(--text-secondary)]">Designed for runners finishing in <strong className="text-[var(--accent)]">{route.paceBand}</strong>. Transit timing assumes this pace band.</p>
          </div>

          {/* Failure modes */}
          {route.failureModes.length > 0 && (
            <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30">
              <div className="flex items-center gap-1.5 text-red-700 dark:text-red-400 text-xs font-medium mb-2">
                <AlertTriangle size={12} /> Common Mistakes for This Route
              </div>
              <ul className="text-xs text-red-600 dark:text-red-300 space-y-1 list-disc ml-4">
                {route.failureModes.map((fm, i) => <li key={i}>{fm}</li>)}
              </ul>
            </div>
          )}

          {/* Backup plan */}
          <div className="mt-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30">
            <div className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">Backup Plan</div>
            <p className="text-xs text-green-600 dark:text-green-300">{route.backupPlan}</p>
          </div>

          {/* Citations */}
          <div className="mt-3 flex flex-wrap gap-2">
            {route.citations.map((c, i) => (
              <a
                key={i}
                href={c.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)] underline flex items-center gap-0.5"
              >
                <ExternalLink size={9} /> {c.sourceName}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
