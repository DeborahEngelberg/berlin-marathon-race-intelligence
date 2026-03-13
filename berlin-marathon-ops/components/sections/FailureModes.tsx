'use client';

import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Shield,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  User,
  Eye,
  Users,
} from 'lucide-react';
import failuresData from '@/data/failures.json';
import { FilterState, FailureMode } from '@/lib/types';
import { saveItem, removeItem, isItemSaved } from '@/lib/store';

const failures = failuresData as FailureMode[];

const GROUPS = [
  { key: 'Runner', label: 'Runner Mistakes', icon: User, color: 'text-blue-500', badgeClass: 'badge-runner' },
  { key: 'Spectator', label: 'Spectator Mistakes', icon: Eye, color: 'text-purple-500', badgeClass: 'badge-spectator' },
  { key: 'Both', label: 'Shared Mistakes', icon: Users, color: 'text-indigo-500', badgeClass: 'badge-both' },
] as const;

function formatFailureAsText(f: FailureMode): string {
  const lines = [
    `FAILURE MODE: ${f.title}`,
    `AUDIENCE: ${f.audience}`,
    '',
    `WHY IT HAPPENS:`,
    f.whyFails,
    '',
    `WHAT VETERANS RECOMMEND:`,
    f.veteranFix,
    '',
    `CONCRETE ALTERNATIVE PLAN:`,
    f.alternatePlan,
    '',
    `CITATIONS:`,
    ...f.citations.map((c) => `- ${c.sourceName}: ${c.sourceUrl}`),
  ];
  return lines.join('\n');
}

function FailureCard({
  f,
  isExpanded,
  isSaved,
  isCopied,
  onToggleExpand,
  onToggleSave,
  onCopy,
}: {
  f: FailureMode;
  isExpanded: boolean;
  isSaved: boolean;
  isCopied: boolean;
  onToggleExpand: () => void;
  onToggleSave: () => void;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden transition-colors">
      <button
        onClick={onToggleExpand}
        className="w-full text-left flex items-center gap-3 py-3 px-4 hover:bg-[var(--bg-elevated)] transition-colors"
      >
        <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
        {isExpanded ? (
          <ChevronDown size={16} className="text-[var(--text-muted)] flex-shrink-0" />
        ) : (
          <ChevronRight size={16} className="text-[var(--text-muted)] flex-shrink-0" />
        )}
        <span className="font-semibold text-sm text-[var(--text)] flex-1 min-w-0">
          {f.title}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave();
          }}
          className="flex-shrink-0 p-1 rounded hover:bg-[var(--border)] transition-colors"
          title={isSaved ? 'Remove from saved' : 'Save to plan'}
        >
          {isSaved ? (
            <BookmarkCheck size={16} className="text-[var(--accent)]" />
          ) : (
            <Bookmark size={16} className="text-[var(--text-muted)]" />
          )}
        </button>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 animate-fade-slide-down">
          <div className="rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 p-3">
            <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-1">
              Why it happens
            </p>
            <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
              {f.whyFails}
            </p>
          </div>

          <div className="rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 p-3">
            <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-1 flex items-center gap-1">
              <Shield size={12} />
              What veterans recommend
            </p>
            <p className="text-sm text-green-700 dark:text-green-300 leading-relaxed">
              {f.veteranFix}
            </p>
          </div>

          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 p-3">
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">
              Concrete alternative plan
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
              {f.alternatePlan}
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex flex-wrap items-center gap-2">
              {f.citations.map((c, i) => (
                <a
                  key={i}
                  href={c.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                >
                  <ExternalLink size={10} />
                  {c.sourceName}
                </a>
              ))}
            </div>
            <button
              onClick={onCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[var(--accent)] transition-colors"
            >
              {isCopied ? (
                <>
                  <Check size={12} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={12} />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FailureModes({ filters }: { filters: FilterState }) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    failures.forEach((f) => {
      if (isItemSaved(f.id, 'failure')) initial.add(f.id);
    });
    return initial;
  });

  const grouped = useMemo(() => {
    const map: Record<string, FailureMode[]> = { Runner: [], Spectator: [], Both: [] };
    failures.forEach((f) => {
      if (map[f.audience]) map[f.audience].push(f);
    });
    return map;
  }, []);

  const toggleExpand = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedIds(next);
  };

  const toggleSave = (f: FailureMode) => {
    const next = new Set(savedIds);
    if (savedIds.has(f.id)) {
      removeItem(f.id, 'failure');
      next.delete(f.id);
    } else {
      saveItem({ id: f.id, type: 'failure', title: f.title, timestamp: Date.now() });
      next.add(f.id);
    }
    setSavedIds(next);
  };

  const handleCopy = async (f: FailureMode) => {
    await navigator.clipboard.writeText(formatFailureAsText(f));
    setCopiedId(f.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div>
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--text)] mb-2 flex items-center gap-2">
          <AlertTriangle size={24} className="text-red-500" />
          Common Mistakes
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          The mistakes playbook: what goes wrong and how veterans fix it
        </p>
      </div>

      {/* Grouped by audience */}
      {GROUPS.map((group) => {
        const items = grouped[group.key];
        if (!items || items.length === 0) return null;
        const GroupIcon = group.icon;

        return (
          <div key={group.key} className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <GroupIcon size={18} className={group.color} />
              <h3 className="text-base font-bold text-[var(--text)]">{group.label}</h3>
              <span className={`badge ${group.badgeClass} ml-1`}>{items.length}</span>
            </div>

            <div className="space-y-3">
              {items.map((f) => (
                <FailureCard
                  key={f.id}
                  f={f}
                  isExpanded={expandedIds.has(f.id)}
                  isSaved={savedIds.has(f.id)}
                  isCopied={copiedId === f.id}
                  onToggleExpand={() => toggleExpand(f.id)}
                  onToggleSave={() => toggleSave(f)}
                  onCopy={() => handleCopy(f)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
