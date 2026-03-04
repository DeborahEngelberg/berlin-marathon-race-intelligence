'use client';

import { useState, useEffect } from 'react';
import { ClipboardList, X, Trash2, Download, Copy, Check } from 'lucide-react';
import { getSavedItems, removeItem, clearAllSaved } from '@/lib/store';
import { SavedItem } from '@/lib/types';

export default function MyOpsPlan() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<SavedItem[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setItems(getSavedItems());
    }
  }, [open]);

  const handleRemove = (id: string, type: string) => {
    removeItem(id, type);
    setItems(getSavedItems());
  };

  const handleClearAll = () => {
    if (confirm('Remove all saved items from your Ops Plan?')) {
      clearAllSaved();
      setItems([]);
    }
  };

  const handleExport = async () => {
    const text = items.map(i => `[${i.type.toUpperCase()}] ${i.title}`).join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
      >
        <ClipboardList size={14} />
        <span className="hidden sm:inline">My Ops Plan</span>
        {items.length > 0 && (
          <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-white text-xs flex items-center justify-center">
            {items.length}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-96 max-w-full h-full bg-[var(--bg-card)] border-l border-[var(--border)] shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-[var(--bg-card)] border-b border-[var(--border)] p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[var(--text)]">My Ops Plan</h3>
                <div className="flex gap-2">
                  {items.length > 0 && (
                    <>
                      <button onClick={handleExport} className="p-1.5 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-muted)]" title="Copy all to clipboard">
                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                      </button>
                      <button onClick={handleClearAll} className="p-1.5 rounded hover:bg-[var(--bg-elevated)] text-red-400" title="Clear all">
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                  <button onClick={() => setOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text)]">
                    <X size={18} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {items.length} saved items. Bookmark bullets, routes, and crossings as you browse.
              </p>
            </div>

            <div className="p-4">
              {items.length === 0 ? (
                <div className="text-center py-12 text-[var(--text-muted)]">
                  <ClipboardList size={32} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No items saved yet</p>
                  <p className="text-xs mt-1">Use the bookmark icon on any card to save it here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={`${item.type}-${item.id}`} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--bg-elevated)]">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--bg-card)] text-[var(--text-muted)] uppercase font-mono flex-shrink-0">
                        {item.type}
                      </span>
                      <p className="text-sm text-[var(--text)] flex-1 line-clamp-2">{item.title}</p>
                      <button
                        onClick={() => handleRemove(item.id, item.type)}
                        className="flex-shrink-0 p-1 rounded hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-red-400"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
