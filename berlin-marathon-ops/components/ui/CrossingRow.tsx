'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, Check, Bookmark, BookmarkCheck, ExternalLink, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Crossing } from '@/lib/types';
import { saveItem, removeItem, isItemSaved, trackEvent } from '@/lib/store';

const typeLabels: Record<string, string> = {
  'underpass': 'Underpass',
  'bridge': 'Bridge',
  'station-tunnel': 'Station Tunnel',
  'designated-crossing': 'Designated Crossing',
  'road-tunnel': 'Road Tunnel',
};

const typeColors: Record<string, string> = {
  'station-tunnel': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'road-tunnel': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  'underpass': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  'bridge': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  'designated-crossing': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

export default function CrossingRow({ crossing }: { crossing: Crossing }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(() => {
    if (typeof window === 'undefined') return false;
    return isItemSaved(crossing.id, 'crossing');
  });

  const canCross = crossing.canCrossText.startsWith('CAN cross') || crossing.canCrossText.startsWith('CAN ');
  const cantCross = crossing.canCrossText.startsWith("CAN'T");
  const isHighTrap = crossing.trapRiskText.startsWith('HIGH');

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `${crossing.name}\n${crossing.locationText}\nType: ${crossing.type}\n${crossing.canCrossText}\nSide: ${crossing.sideOutcomeText}\nTrap Risk: ${crossing.trapRiskText}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (saved) {
      removeItem(crossing.id, 'crossing');
      setSaved(false);
    } else {
      saveItem({ id: crossing.id, type: 'crossing', title: crossing.name, timestamp: Date.now() });
      setSaved(true);
    }
  };

  const handleToggle = () => {
    setExpanded(!expanded);
    if (!expanded) trackEvent('expand', `crossing:${crossing.id}`);
  };

  return (
    <div className={`card p-0 mb-2 ${isHighTrap ? 'border-red-300 dark:border-red-800' : ''}`}>
      <button
        onClick={handleToggle}
        className="w-full text-left p-4 flex items-start gap-3 hover:bg-[var(--bg-elevated)] transition-colors rounded-lg"
      >
        <span className="mt-1 text-[var(--text-muted)] flex-shrink-0">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-medium text-sm">{crossing.name}</span>
            <span className={`badge ${typeColors[crossing.type] || 'bg-gray-100 text-gray-700'}`}>
              {typeLabels[crossing.type] || crossing.type}
            </span>
            {canCross && <CheckCircle size={14} className="text-green-500" />}
            {cantCross && <XCircle size={14} className="text-red-500" />}
            {isHighTrap && (
              <span className="badge badge-low flex items-center gap-0.5">
                <AlertTriangle size={10} /> High trap risk
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--text-secondary)]">{crossing.locationText}</p>
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
        <div className="px-4 pb-4 border-t border-[var(--border)] ml-8">
          <div className="pt-3 space-y-3 text-sm">
            <div>
              <span className="text-xs font-medium text-[var(--text-muted)] uppercase">Can Cross?</span>
              <p className={`mt-1 text-sm ${cantCross ? 'text-red-500' : 'text-[var(--text)]'}`}>
                {crossing.canCrossText}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-[var(--text-muted)] uppercase">Side Outcome</span>
              <p className={`mt-1 text-sm ${crossing.sideOutcomeText.includes('NOT FOUND') ? 'text-orange-500' : 'text-[var(--text)]'}`}>
                {crossing.sideOutcomeText}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-[var(--text-muted)] uppercase">Trap Risk</span>
              <p className={`mt-1 text-sm ${isHighTrap ? 'text-red-500 font-medium' : 'text-[var(--text)]'}`}>
                {crossing.trapRiskText}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-[var(--text-muted)] uppercase">Nearest Stations</span>
              <p className="mt-1 text-sm text-[var(--text)]">{crossing.nearestStations.join(', ')}</p>
            </div>
            {crossing.notes && (
              <div className="p-3 rounded bg-[var(--bg-elevated)] text-xs text-[var(--text-secondary)] italic">
                {crossing.notes}
              </div>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              <a
                href={crossing.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] underline flex items-center gap-0.5"
              >
                <ExternalLink size={9} /> {crossing.sourceName}
              </a>
              {crossing.lat && crossing.lng && (
                <a
                  href={`https://www.google.com/maps?q=${crossing.lat},${crossing.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--accent)] hover:underline flex items-center gap-0.5"
                >
                  <ExternalLink size={9} /> Open in Google Maps
                </a>
              )}
              <span className={`badge ${crossing.confidence === 'High' ? 'badge-high' : crossing.confidence === 'Med' ? 'badge-med' : 'badge-low'}`}>
                {crossing.confidence} confidence
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
