'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, Check, Bookmark, BookmarkCheck, Clock, ExternalLink } from 'lucide-react';
import { Bullet } from '@/lib/types';
import { saveItem, removeItem, isItemSaved } from '@/lib/store';
import { trackEvent } from '@/lib/store';

export default function BulletCard({ bullet }: { bullet: Bullet }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(() => {
    if (typeof window === 'undefined') return false;
    return isItemSaved(bullet.id, 'bullet');
  });

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(bullet.text + ` (${bullet.sourceName})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (saved) {
      removeItem(bullet.id, 'bullet');
      setSaved(false);
    } else {
      saveItem({
        id: bullet.id,
        type: 'bullet',
        title: bullet.text.substring(0, 80) + '...',
        timestamp: Date.now(),
      });
      setSaved(true);
    }
  };

  const handleToggle = () => {
    setExpanded(!expanded);
    if (!expanded) trackEvent('expand', `bullet:${bullet.id}`);
  };

  const confidenceClass = bullet.confidence === 'High' ? 'badge-high' : bullet.confidence === 'Med' ? 'badge-med' : 'badge-low';
  const audienceClass = bullet.audience === 'Runner' ? 'badge-runner' : bullet.audience === 'Spectator' ? 'badge-spectator' : 'badge-both';

  return (
    <div className="card p-0 mb-2">
      <button
        onClick={handleToggle}
        className="w-full text-left p-4 flex items-start gap-3 hover:bg-[var(--bg-elevated)] transition-colors rounded-lg"
      >
        <span className="mt-1 text-[var(--text-muted)] flex-shrink-0">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            <span className={`badge ${confidenceClass}`}>{bullet.confidence}</span>
            <span className="badge bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">{bullet.label}</span>
            {bullet.timeText && <span className="badge badge-time"><Clock size={10} className="mr-1" />{bullet.timeText}</span>}
            {expanded && (
              <>
                <span className={`badge ${audienceClass}`}>{bullet.audience}</span>
                {bullet.languageOrigin === 'DE' && <span className="badge badge-de">DE</span>}
                {bullet.recurrenceCount && bullet.recurrenceCount > 3 && (
                  <span className="badge bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                    ×{bullet.recurrenceCount} reported
                  </span>
                )}
              </>
            )}
          </div>
          <p className="text-base text-[var(--text)] leading-relaxed">
            {bullet.text}
          </p>
        </div>
        <div className="flex gap-1 flex-shrink-0 ml-2">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--accent)]"
            title="Copy to clipboard"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          </button>
          <button
            onClick={handleSave}
            className="bookmark-btn p-1.5 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--accent)]"
            title={saved ? 'Remove from My Ops Plan' : 'Save to My Ops Plan'}
          >
            {saved ? <BookmarkCheck size={14} className="text-[var(--accent)]" /> : <Bookmark size={14} />}
          </button>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 ml-8 border-t border-[var(--border)] animate-fade-slide-down">
          <div className="pt-3 space-y-2">
            {bullet.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {bullet.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <div className="text-xs text-[var(--text-muted)] flex items-center gap-1">
              <ExternalLink size={10} />
              <a
                href={bullet.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--accent)] underline"
              >
                {bullet.sourceName}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
