'use client';

import { SavedItem } from './types';

const STORAGE_KEY = 'berlin-marathon-ops-plan';
const THEME_KEY = 'berlin-marathon-ops-theme';
const ANALYTICS_KEY = 'berlin-marathon-ops-analytics';

export function getSavedItems(): SavedItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveItem(item: SavedItem): void {
  const items = getSavedItems();
  if (!items.find(i => i.id === item.id && i.type === item.type)) {
    items.push(item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
}

export function removeItem(id: string, type: string): void {
  const items = getSavedItems().filter(i => !(i.id === id && i.type === type));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function isItemSaved(id: string, type: string): boolean {
  return getSavedItems().some(i => i.id === id && i.type === type);
}

export function clearAllSaved(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'light';
  try {
    return (localStorage.getItem(THEME_KEY) as 'dark' | 'light') || 'light';
  } catch {
    return 'light';
  }
}

export function setTheme(theme: 'dark' | 'light'): void {
  localStorage.setItem(THEME_KEY, theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// Lightweight local analytics
interface AnalyticsEvent {
  type: string;
  target: string;
  timestamp: number;
  referrer?: string;
}

export function trackEvent(type: string, target: string): void {
  if (typeof window === 'undefined') return;
  try {
    const events: AnalyticsEvent[] = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '[]');
    events.push({
      type,
      target,
      timestamp: Date.now(),
      referrer: document.referrer || undefined,
    });
    // Keep max 1000 events
    if (events.length > 1000) events.splice(0, events.length - 1000);
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(events));
  } catch {
    // silently fail
  }
}

export function exportAnalyticsCSV(): string {
  if (typeof window === 'undefined') return '';
  try {
    const events: AnalyticsEvent[] = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '[]');
    const header = 'timestamp,type,target,referrer\n';
    const rows = events.map(e =>
      `${new Date(e.timestamp).toISOString()},${e.type},"${e.target}","${e.referrer || ''}"`
    ).join('\n');
    return header + rows;
  } catch {
    return '';
  }
}
