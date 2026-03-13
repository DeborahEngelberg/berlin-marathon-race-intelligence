'use client';

import { useState, useMemo } from 'react';
import lodgingData from '@/data/lodging.json';
import { FilterState, LodgingOption } from '@/lib/types';
import { Bed, ExternalLink, Bookmark, BookmarkCheck, Star, AlertTriangle } from 'lucide-react';
import { saveItem, removeItem, isItemSaved } from '@/lib/store';

const lodgings = lodgingData as LodgingOption[];

function scoreValue(level: 'Low' | 'Med' | 'High'): number {
  if (level === 'Low') return 3;
  if (level === 'Med') return 2;
  return 1;
}

function scoreValueInverse(level: 'Low' | 'Med' | 'High'): number {
  if (level === 'Low') return 1;
  if (level === 'Med') return 2;
  return 3;
}

function frictionBadge(level: 'Low' | 'Med' | 'High') {
  const styles: Record<string, string> = {
    Low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
    Med: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    High: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  };
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${styles[level]}`}>
      {level}
    </span>
  );
}

interface PickInputs {
  priority: 'runner' | 'spectator' | 'balanced';
  budget: 'low' | 'medium' | 'high';
  noiseTolerance: 'low' | 'medium' | 'high';
  priorityNeed: 'easy-start' | 'easy-finish' | 'near-nightlife' | 'near-finish-viewing';
}

interface ScoredLodging {
  lodging: LodgingOption;
  score: number;
  explanation: string;
}

function scoreLodgings(inputs: PickInputs): ScoredLodging[] {
  return lodgings
    .map((l) => {
      let score = 0;
      const reasons: string[] = [];

      // Priority weighting
      const friction = scoreValue(l.frictionScore);
      const finish = scoreValueInverse(l.finishScore);
      const mobility = scoreValueInverse(l.mobilityScore);

      if (inputs.priority === 'runner') {
        score += friction * 3;
        score += finish * 1;
        score += mobility * 1;
        reasons.push(`Runner priority: friction=${l.frictionScore} (weighted x3)`);
      } else if (inputs.priority === 'spectator') {
        score += friction * 1;
        score += finish * 1;
        score += mobility * 3;
        reasons.push(`Spectator priority: mobility=${l.mobilityScore} (weighted x3)`);
      } else {
        score += friction * 2;
        score += finish * 2;
        score += mobility * 2;
        reasons.push('Balanced weighting across all factors');
      }

      // Noise tolerance penalty
      if (inputs.noiseTolerance === 'low') {
        if (l.quietRisk.toLowerCase().startsWith('high')) {
          score -= 4;
          reasons.push('Penalized: high quiet risk vs. low noise tolerance');
        } else if (l.quietRisk.toLowerCase().startsWith('med')) {
          score -= 2;
          reasons.push('Minor penalty: medium quiet risk vs. low noise tolerance');
        }
      }

      // Priority need boosts
      if (inputs.priorityNeed === 'easy-start' && l.frictionScore === 'Low') {
        score += 3;
        reasons.push('Boosted: low race-morning friction matches easy start need');
      }
      if (inputs.priorityNeed === 'easy-finish' && l.finishScore === 'High') {
        score += 3;
        reasons.push('Boosted: high finish extraction matches easy finish need');
      }
      if (inputs.priorityNeed === 'near-nightlife') {
        if (l.anchor.includes('Kreuzberg') || l.anchor.includes('Friedrichshain')) {
          score += 3;
          reasons.push('Boosted: neighborhood known for nightlife');
        } else if (l.anchor.includes('Mitte') || l.anchor.includes('Schöneberg')) {
          score += 1;
          reasons.push('Slight boost: some nightlife options nearby');
        }
      }
      if (inputs.priorityNeed === 'near-finish-viewing') {
        if (l.finishScore === 'High') {
          score += 3;
          reasons.push('Boosted: close to finish area for viewing');
        }
      }

      // Avoid warning penalty (if there's a real warning, not "None")
      if (l.avoidWarning && !l.avoidWarning.toLowerCase().startsWith('none')) {
        score -= 1;
        reasons.push('Minor penalty: has avoid-warning advisory');
      }

      return { lodging: l, score, explanation: reasons.join('. ') + '.' };
    })
    .sort((a, b) => b.score - a.score);
}

function CitationList({ citations }: { citations: { sourceName: string; sourceUrl: string }[] }) {
  if (!citations || citations.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {citations.map((c, i) => (
        <a
          key={i}
          href={c.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] text-[var(--accent)] hover:underline"
        >
          <ExternalLink size={10} />
          {c.sourceName}
        </a>
      ))}
    </div>
  );
}

export default function WhereToStay({ filters }: { filters: FilterState }) {
  const [pickInputs, setPickInputs] = useState<PickInputs>({
    priority: 'balanced',
    budget: 'medium',
    noiseTolerance: 'medium',
    priorityNeed: 'easy-start',
  });
  const [showResults, setShowResults] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    const set = new Set<string>();
    lodgings.forEach((l) => {
      if (isItemSaved(l.id, 'lodging')) set.add(l.id);
    });
    return set;
  });

  const recommendations = useMemo(() => {
    if (!showResults) return [];
    return scoreLodgings(pickInputs).slice(0, 3);
  }, [showResults, pickInputs]);

  const toggleSave = (l: LodgingOption) => {
    const next = new Set(savedIds);
    if (savedIds.has(l.id)) {
      removeItem(l.id, 'lodging');
      next.delete(l.id);
    } else {
      saveItem({ id: l.id, type: 'lodging', title: l.anchor, timestamp: Date.now() });
      next.add(l.id);
    }
    setSavedIds(next);
  };

  // Filter lodgings by confidence if applicable (lodgings don't have confidence, so no filter applies from FilterState)
  const displayLodgings = lodgings;

  return (
    <div>
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--text)] mb-2 flex items-center gap-2">
          <Bed size={24} className="text-[var(--accent)]" />
          Where To Stay
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Logistics-ranked neighborhoods: race-morning friction, finish extraction, spectator mobility
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {displayLodgings.length} neighborhoods analyzed
        </p>
      </div>

      {/* Quick Summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10">
          <h4 className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-2">Best for Runners</h4>
          <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
            Stay near Tiergarten or Charlottenburg for low race-morning friction. Short transit to the start, easy gear drop, and quiet sleep.
          </p>
        </div>
        <div className="p-4 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/10">
          <h4 className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wide mb-2">Best for Spectators</h4>
          <p className="text-sm text-purple-800 dark:text-purple-300 leading-relaxed">
            Mitte or Potsdamer Platz area for maximum mobility. Quick access to U-Bahn connections and multiple viewing points along the course.
          </p>
        </div>
        <div className="p-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10">
          <h4 className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wide mb-2">Best for Convenience</h4>
          <p className="text-sm text-green-800 dark:text-green-300 leading-relaxed">
            Hauptbahnhof area balances everything: easy start access, close to finish, good transit connections, and plenty of dining options.
          </p>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block mb-8 overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left py-3 px-3 text-xs font-semibold text-[var(--text-muted)] uppercase">
                Anchor Station / Zone
              </th>
              <th className="text-center py-3 px-3 text-xs font-semibold text-[var(--text-muted)] uppercase">
                Race-Morning Friction
              </th>
              <th className="text-center py-3 px-3 text-xs font-semibold text-[var(--text-muted)] uppercase">
                Finish Extraction
              </th>
              <th className="text-center py-3 px-3 text-xs font-semibold text-[var(--text-muted)] uppercase">
                Spectator Mobility
              </th>
              <th className="text-left py-3 px-3 text-xs font-semibold text-[var(--text-muted)] uppercase">
                Quiet Sleep Risk
              </th>
              <th className="text-left py-3 px-3 text-xs font-semibold text-[var(--text-muted)] uppercase">
                Avoid Warning
              </th>
              <th className="text-center py-3 px-2 text-xs font-semibold text-[var(--text-muted)] uppercase">
                Save
              </th>
            </tr>
          </thead>
          <tbody>
            {displayLodgings.map((l) => {
              const hasWarning = l.avoidWarning && !l.avoidWarning.toLowerCase().startsWith('none');
              const isSaved = savedIds.has(l.id);

              return (
                <tr
                  key={l.id}
                  className="border-b border-[var(--border)] hover:bg-[var(--bg-elevated)] transition-colors"
                >
                  <td className="py-3 px-3">
                    <div className="font-medium text-[var(--text)]">{l.anchor}</div>
                    {l.station && (
                      <div className="text-xs text-[var(--text-muted)] mt-0.5">{l.station}</div>
                    )}
                    <CitationList citations={l.citations} />
                  </td>
                  <td className="py-3 px-3 text-center">{frictionBadge(l.frictionScore)}</td>
                  <td className="py-3 px-3 text-center">{frictionBadge(l.finishScore)}</td>
                  <td className="py-3 px-3 text-center">{frictionBadge(l.mobilityScore)}</td>
                  <td className="py-3 px-3 text-xs text-[var(--text-secondary)]">{l.quietRisk}</td>
                  <td className="py-3 px-3">
                    {hasWarning ? (
                      <div className="flex items-start gap-1.5">
                        <AlertTriangle size={12} className="text-amber-500 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-amber-600 dark:text-amber-400">{l.avoidWarning}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--text-muted)]">{l.avoidWarning}</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={() => toggleSave(l)}
                      className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
                      title={isSaved ? 'Remove from saved' : 'Save to plan'}
                    >
                      {isSaved ? (
                        <BookmarkCheck size={16} className="text-[var(--accent)]" />
                      ) : (
                        <Bookmark size={16} className="text-[var(--text-muted)]" />
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4 mb-8">
        {displayLodgings.map((l) => {
          const hasWarning = l.avoidWarning && !l.avoidWarning.toLowerCase().startsWith('none');
          const isSaved = savedIds.has(l.id);

          return (
            <div
              key={l.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text)]">{l.anchor}</h3>
                  {l.station && (
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{l.station}</p>
                  )}
                </div>
                <button
                  onClick={() => toggleSave(l)}
                  className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors flex-shrink-0"
                  title={isSaved ? 'Remove from saved' : 'Save to plan'}
                >
                  {isSaved ? (
                    <BookmarkCheck size={16} className="text-[var(--accent)]" />
                  ) : (
                    <Bookmark size={16} className="text-[var(--text-muted)]" />
                  )}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center">
                  <p className="text-[11px] text-[var(--text-muted)] uppercase mb-1">Friction</p>
                  {frictionBadge(l.frictionScore)}
                </div>
                <div className="text-center">
                  <p className="text-[11px] text-[var(--text-muted)] uppercase mb-1">Finish</p>
                  {frictionBadge(l.finishScore)}
                </div>
                <div className="text-center">
                  <p className="text-[11px] text-[var(--text-muted)] uppercase mb-1">Mobility</p>
                  {frictionBadge(l.mobilityScore)}
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-[11px] text-[var(--text-muted)] uppercase mb-0.5">Quiet Sleep Risk</p>
                  <p className="text-xs text-[var(--text-secondary)]">{l.quietRisk}</p>
                </div>

                {hasWarning ? (
                  <div className="flex items-start gap-1.5 p-2 rounded bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                    <AlertTriangle size={12} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-amber-600 dark:text-amber-400">{l.avoidWarning}</span>
                  </div>
                ) : (
                  <div>
                    <p className="text-[11px] text-[var(--text-muted)] uppercase mb-0.5">Avoid Warning</p>
                    <p className="text-xs text-[var(--text-muted)]">{l.avoidWarning}</p>
                  </div>
                )}
              </div>

              <CitationList citations={l.citations} />
            </div>
          );
        })}
      </div>

      {/* Pick My Base Tool */}
      <div className="tool-card p-5">
        <h3 className="text-lg font-bold text-[var(--text)] mb-1 flex items-center gap-2">
          <Star size={20} className="text-[var(--accent)]" />
          Pick My Base
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Answer a few questions and we will score the neighborhoods for your situation.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Priority */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] uppercase mb-1">
              Priority
            </label>
            <select
              value={pickInputs.priority}
              onChange={(e) => {
                setPickInputs({ ...pickInputs, priority: e.target.value as PickInputs['priority'] });
                setShowResults(false);
              }}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="runner">Runner (easy start)</option>
              <option value="spectator">Spectator (mobility)</option>
              <option value="balanced">Balanced</option>
            </select>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] uppercase mb-1">
              Budget
            </label>
            <select
              value={pickInputs.budget}
              onChange={(e) => {
                setPickInputs({ ...pickInputs, budget: e.target.value as PickInputs['budget'] });
                setShowResults(false);
              }}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Noise Tolerance */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] uppercase mb-1">
              Noise Tolerance
            </label>
            <select
              value={pickInputs.noiseTolerance}
              onChange={(e) => {
                setPickInputs({ ...pickInputs, noiseTolerance: e.target.value as PickInputs['noiseTolerance'] });
                setShowResults(false);
              }}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="low">Low (need quiet)</option>
              <option value="medium">Medium</option>
              <option value="high">High (don&apos;t care)</option>
            </select>
          </div>

          {/* Priority Need */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] uppercase mb-1">
              Priority Need
            </label>
            <select
              value={pickInputs.priorityNeed}
              onChange={(e) => {
                setPickInputs({ ...pickInputs, priorityNeed: e.target.value as PickInputs['priorityNeed'] });
                setShowResults(false);
              }}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="easy-start">Easy start morning</option>
              <option value="easy-finish">Easy finish extraction</option>
              <option value="near-nightlife">Near nightlife</option>
              <option value="near-finish-viewing">Near finish viewing</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => setShowResults(true)}
          className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
        >
          Find my base
        </button>

        {/* Recommendations */}
        {showResults && recommendations.length > 0 && (
          <div className="mt-6 space-y-4 animate-fade-slide-down">
            <h4 className="text-sm font-semibold text-[var(--text)] uppercase tracking-wide">
              Top Recommendations
            </h4>
            {recommendations.map((rec, index) => {
              const l = rec.lodging;
              const isSaved = savedIds.has(l.id);
              const hasWarning = l.avoidWarning && !l.avoidWarning.toLowerCase().startsWith('none');

              return (
                <div
                  key={l.id}
                  className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)]"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--accent)] text-white text-xs font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <h5 className="text-sm font-semibold text-[var(--text)]">{l.anchor}</h5>
                        {l.station && (
                          <p className="text-xs text-[var(--text-muted)]">{l.station}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSave(l)}
                      className="p-1.5 rounded-lg hover:bg-[var(--bg-card)] transition-colors flex-shrink-0"
                      title={isSaved ? 'Remove from saved' : 'Save to plan'}
                    >
                      {isSaved ? (
                        <BookmarkCheck size={16} className="text-[var(--accent)]" />
                      ) : (
                        <Bookmark size={16} className="text-[var(--text-muted)]" />
                      )}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-[11px] text-[var(--text-muted)]">Friction:</span>
                    {frictionBadge(l.frictionScore)}
                    <span className="text-[11px] text-[var(--text-muted)] ml-1">Finish:</span>
                    {frictionBadge(l.finishScore)}
                    <span className="text-[11px] text-[var(--text-muted)] ml-1">Mobility:</span>
                    {frictionBadge(l.mobilityScore)}
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] mb-2">{rec.explanation}</p>

                  {hasWarning && (
                    <div className="flex items-start gap-1.5 mt-2 p-2 rounded bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                      <AlertTriangle size={12} className="text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-amber-600 dark:text-amber-400">{l.avoidWarning}</span>
                    </div>
                  )}

                  <CitationList citations={l.citations} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
