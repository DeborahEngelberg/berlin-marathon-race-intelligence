'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import failuresData from '@/data/failures.json';
import { FilterState, FailureMode } from '@/lib/types';
import { saveItem, removeItem, isItemSaved } from '@/lib/store';

const failures = failuresData as FailureMode[];

function formatFailureAsText(f: FailureMode): string {
  const lines = [
    `COMMON MISTAKE: ${f.title}`,
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
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle size={22} className="text-red-600 dark:text-red-400" />
          </div>
          <h2 className="section-header">Common Mistakes</h2>
        </div>
        <p className="section-description max-w-3xl">
          The most frequent mistakes runners and spectators make at the Berlin Marathon, and how experienced participants avoid them. Each entry includes what goes wrong, why it happens, and a concrete alternative plan.
        </p>
      </div>

      {/* Failure Cards */}
      <div className="space-y-3">
        {failures.map((f) => {
          const isExpanded = expandedIds.has(f.id);
          const isSaved = savedIds.has(f.id);
          const isCopied = copiedId === f.id;

          return (
            <div
              key={f.id}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden transition-colors"
            >
              {/* Collapsed Header */}
              <button
                onClick={() => toggleExpand(f.id)}
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
                    toggleSave(f);
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

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3">
                  {/* Why it happens */}
                  <div className="rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 p-3">
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-1">
                      Why it happens
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                      {f.whyFails}
                    </p>
                  </div>

                  {/* What veterans recommend */}
                  <div className="rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 p-3">
                    <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <Shield size={12} />
                      What veterans recommend
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 leading-relaxed">
                      {f.veteranFix}
                    </p>
                  </div>

                  {/* Concrete alternative plan */}
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 p-3">
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">
                      Concrete alternative plan
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                      {f.alternatePlan}
                    </p>
                  </div>

                  {/* Citations + Copy */}
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
                      onClick={() => handleCopy(f)}
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
        })}
      </div>
    </div>
  );
}
