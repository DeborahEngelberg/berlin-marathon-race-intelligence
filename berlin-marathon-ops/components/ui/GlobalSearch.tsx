'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { search, SearchResult } from '@/lib/search';

const sectionLabels: Record<string, string> = {
  'runner-guide': 'Runner Guide',
  'spectator-guide': 'Spectator Guide',
  'viewing-routes': 'Viewing Routes',
  'crossing-map': 'Crossing Map',
  'finish-strategy': 'Finish Strategy',
  'transit': 'Transit',
  'where-to-stay': 'Where to Stay',
  'food': 'Food',
  'common-mistakes': 'Common Mistakes',
};

const typeIcons: Record<string, string> = {
  bullet: '•',
  crossing: '⊕',
  route: '↗',
  failure: '⚠',
  lodging: '🏨',
  restaurant: '🍽',
};

interface Props {
  onNavigate: (section: string) => void;
}

export default function GlobalSearch({ onNavigate }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length >= 2) {
      const r = search(query);
      setResults(r);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search all intel... (⌘K)"
          className="w-full pl-9 pr-8 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {results.map((r) => (
            <button
              key={`${r.type}-${r.id}`}
              onClick={() => {
                onNavigate(r.section);
                setIsOpen(false);
                setQuery('');
              }}
              className="w-full text-left px-4 py-3 hover:bg-[var(--bg-elevated)] border-b border-[var(--border)] last:border-b-0 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{typeIcons[r.type]}</span>
                <span className="font-medium text-sm text-[var(--text)] line-clamp-1">{r.title}</span>
                <span className="ml-auto text-xs px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                  {sectionLabels[r.section] || r.section}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] line-clamp-2 ml-6">{r.text}</p>
            </button>
          ))}
          <div className="px-4 py-2 text-xs text-[var(--text-muted)] bg-[var(--bg-elevated)] rounded-b-lg">
            {results.length} results
          </div>
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full mt-1 w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-lg shadow-xl z-50 p-4 text-center text-sm text-[var(--text-muted)]">
          No results found for &quot;{query}&quot;
        </div>
      )}
    </div>
  );
}
