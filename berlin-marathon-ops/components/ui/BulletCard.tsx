'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, Check, Bookmark, BookmarkCheck, Clock, ExternalLink, HelpCircle } from 'lucide-react';
import { Bullet } from '@/lib/types';
import { saveItem, removeItem, isItemSaved } from '@/lib/store';
import { trackEvent } from '@/lib/store';

function BadgeTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={(e) => { e.stopPropagation(); setShow(!show); }}
        className="tooltip-icon ml-0.5"
        aria-label={text}
      >
        ?
      </button>
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--text)] text-[var(--bg)] text-[10px] leading-tight whitespace-nowrap z-50 shadow-lg">
          {text}
        </span>
      )}
    </span>
  );
}

/**
 * Derive a short title from bullet text.
 * Uses the label and first sentence fragment for a meaningful heading.
 */
function deriveTitle(bullet: Bullet): string {
  const text = bullet.text;
  // Try to extract a meaningful first phrase (up to first period, dash, or colon)
  const match = text.match(/^([^.:]{10,80})[.:]/);
  if (match) return match[1].trim();
  // Fallback: first 80 chars
  return text.substring(0, 80).trim() + (text.length > 80 ? '...' : '');
}

/**
 * Derive a "why it matters" from bullet context.
 * This generates contextual importance from the bullet's metadata.
 */
function deriveWhyItMatters(bullet: Bullet): string | null {
  // Time-sensitive bullets
  if (bullet.timeText) {
    return `Time impact: ${bullet.timeText}. Plan accordingly to avoid delays.`;
  }
  // High recurrence = widely reported
  if (bullet.recurrenceCount && bullet.recurrenceCount >= 5) {
    return `Reported by ${bullet.recurrenceCount}+ sources. This is a widely confirmed pattern.`;
  }
  // Failure modes
  if (bullet.label === 'Failure mode') {
    return 'This is a common mistake that catches people off guard. Knowing about it in advance can save your race day.';
  }
  // Security/logistics
  if (bullet.tags.includes('security') || bullet.tags.includes('entry-chokepoints')) {
    return 'Security and entry logistics create bottlenecks. Arriving prepared saves significant time.';
  }
  // Transit
  if (bullet.section === 'transit-strategy') {
    return 'Transit decisions on race day are time-critical. Wrong choices can cost 30+ minutes.';
  }
  return null;
}

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

  const title = deriveTitle(bullet);
  const whyItMatters = deriveWhyItMatters(bullet);

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
          {/* Title */}
          <h4 className="font-semibold text-sm text-[var(--text)] mb-1.5 leading-snug">{title}</h4>
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span className={`badge ${audienceClass}`}>{bullet.audience}</span>
            <span className={`badge ${confidenceClass}`}>{bullet.confidence}<BadgeTooltip text="How well-sourced this intel is (High/Med/Low)" /></span>
            <span className="badge bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">{bullet.label}</span>
            {bullet.languageOrigin === 'DE' && <span className="badge badge-de">DE</span>}
            {bullet.timeText && <span className="badge badge-time"><Clock size={10} className="mr-1" />{bullet.timeText}<BadgeTooltip text="Time-sensitive: affects your schedule" /></span>}
            {bullet.recurrenceCount && bullet.recurrenceCount > 3 && (
              <span className="badge bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                x{bullet.recurrenceCount} reported<BadgeTooltip text="Number of independent sources confirming this" />
              </span>
            )}
          </div>
          {/* Insight (main text) */}
          <p className={`text-sm text-[var(--text-secondary)] ${expanded ? '' : 'line-clamp-2'} leading-relaxed`}>
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
            className="p-1.5 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--accent)]"
            title={saved ? 'Remove from Saved Strategy' : 'Save to Saved Strategy'}
          >
            {saved ? <BookmarkCheck size={14} className="text-[var(--accent)]" /> : <Bookmark size={14} />}
          </button>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 ml-8 border-t border-[var(--border)]">
          <div className="pt-3 space-y-3">
            {/* Why It Matters */}
            {whyItMatters && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">Why it matters</p>
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">{whyItMatters}</p>
              </div>
            )}

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
