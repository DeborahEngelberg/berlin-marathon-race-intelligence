'use client';

import { useState, useEffect, Fragment } from 'react';
import { Sun, Moon, Menu, X, Home, User, Eye, MapPin, GitBranch, Flag, Train as TrainIcon, Bed, Utensils, AlertTriangle, Heart } from 'lucide-react';
import { getTheme, setTheme as persistTheme, trackEvent } from '@/lib/store';
import { FilterState } from '@/lib/types';
import GlobalSearch from '@/components/ui/GlobalSearch';
import MyOpsPlan from '@/components/ui/MyOpsPlan';
import FiltersDrawer from '@/components/ui/FiltersDrawer';

import Overview from '@/components/sections/Overview';
import RunnerIntelligence from '@/components/sections/RunnerIntelligence';
import SpectatorIntelligence from '@/components/sections/SpectatorIntelligence';
import RoutePlanner from '@/components/sections/RoutePlanner';
import CrossingDatabase from '@/components/sections/CrossingDatabase';
import FinishBlueprint from '@/components/sections/FinishBlueprint';
import TransitStrategy from '@/components/sections/TransitStrategy';
import WhereToStay from '@/components/sections/WhereToStay';
import FoodRestaurants from '@/components/sections/FoodRestaurants';
import FailureModes from '@/components/sections/FailureModes';
import Support from '@/components/sections/Support';

const NAV_GROUPS = [
  {
    label: 'Plan',
    items: [
      { id: 'overview', label: 'Overview', shortLabel: 'Overview', icon: Home },
      { id: 'runner-guide', label: 'Runner Guide', shortLabel: 'Runner', icon: User },
      { id: 'spectator-guide', label: 'Spectator Guide', shortLabel: 'Spectator', icon: Eye },
    ],
  },
  {
    label: 'Navigate',
    items: [
      { id: 'viewing-routes', label: 'Viewing Routes', shortLabel: 'Routes', icon: MapPin },
      { id: 'crossing-map', label: 'Crossing Map', shortLabel: 'Crossings', icon: GitBranch },
      { id: 'transit', label: 'Transit', shortLabel: 'Transit', icon: TrainIcon },
    ],
  },
  {
    label: 'Logistics',
    items: [
      { id: 'finish-strategy', label: 'Finish Strategy', shortLabel: 'Finish', icon: Flag },
      { id: 'where-to-stay', label: 'Where to Stay', shortLabel: 'Stay', icon: Bed },
      { id: 'food', label: 'Food', shortLabel: 'Food', icon: Utensils },
    ],
  },
  {
    label: 'Reference',
    items: [
      { id: 'common-mistakes', label: 'Common Mistakes', shortLabel: 'Mistakes', icon: AlertTriangle },
      { id: 'support', label: 'Support', shortLabel: 'Support', icon: Heart },
    ],
  },
];

const defaultFilters: FilterState = {
  audience: [],
  label: [],
  confidence: [],
  recurrenceOnly: false,
  languageOrigin: [],
};

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [theme, setThemeState] = useState<'dark' | 'light'>('light');
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = getTheme();
    setThemeState(saved);
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setThemeState(next);
    persistTheme(next);
  };

  const navigateToTab = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    trackEvent('navigate', tabId);
    window.scrollTo(0, 0);
  };

  const renderSection = () => {
    switch (activeTab) {
      case 'overview': return <Overview onNavigate={navigateToTab} />;
      case 'runner-guide': return <RunnerIntelligence filters={filters} />;
      case 'spectator-guide': return <SpectatorIntelligence filters={filters} />;
      case 'viewing-routes': return <RoutePlanner filters={filters} />;
      case 'crossing-map': return <CrossingDatabase filters={filters} />;
      case 'finish-strategy': return <FinishBlueprint filters={filters} />;
      case 'transit': return <TransitStrategy filters={filters} />;
      case 'where-to-stay': return <WhereToStay filters={filters} />;
      case 'food': return <FoodRestaurants filters={filters} />;
      case 'common-mistakes': return <FailureModes filters={filters} />;
      case 'support': return <Support />;
      default: return <Overview onNavigate={navigateToTab} />;
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg-card)]">
        {/* Berlin brand stripe */}
        <div className="berlin-stripe" />

        <div className="max-w-7xl mx-auto px-4">
          {/* Top bar */}
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-muted)]"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <button onClick={() => navigateToTab('overview')} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                <div className="flex flex-col leading-none">
                  <span className="text-xs font-extrabold tracking-wide text-[var(--accent)] uppercase heading-display">Berlin Marathon</span>
                  <span className="text-[11px] font-medium text-[var(--text-muted)] tracking-wider uppercase">Race Intelligence</span>
                </div>
              </button>
            </div>

            <div className="flex-1 max-w-md mx-4 hidden md:block">
              <GlobalSearch onNavigate={navigateToTab} />
            </div>

            <div className="flex items-center gap-2">
              <FiltersDrawer filters={filters} onChange={setFilters} />
              <MyOpsPlan />
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <div className="md:hidden pb-2">
            <GlobalSearch onNavigate={navigateToTab} />
          </div>

          {/* Desktop nav — grouped with separators */}
          <nav className="hidden lg:flex items-center -mb-px">
            {NAV_GROUPS.map((group, gi) => (
              <Fragment key={group.label}>
                {gi > 0 && <div className="w-px h-5 bg-[var(--border)] mx-1.5 flex-shrink-0" />}
                <div className="flex items-center">
                  {group.items.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => navigateToTab(tab.id)}
                        className={`px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
                          activeTab === tab.id
                            ? 'border-[var(--accent-gold)] text-[var(--accent)]'
                            : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[var(--border)]'
                        }`}
                      >
                        <Icon size={13} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </Fragment>
            ))}
          </nav>

          {/* Tablet nav — grouped, short labels */}
          <nav className="hidden md:flex lg:hidden items-center -mb-px overflow-x-auto">
            {NAV_GROUPS.map((group, gi) => (
              <Fragment key={group.label}>
                {gi > 0 && <div className="w-px h-4 bg-[var(--border)] mx-1 flex-shrink-0" />}
                <div className="flex items-center">
                  {group.items.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => navigateToTab(tab.id)}
                        className={`px-2 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 flex items-center gap-1 ${
                          activeTab === tab.id
                            ? 'border-[var(--accent-gold)] text-[var(--accent)]'
                            : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text)]'
                        }`}
                      >
                        <Icon size={12} />
                        {tab.shortLabel}
                      </button>
                    );
                  })}
                </div>
              </Fragment>
            ))}
          </nav>
        </div>

        {/* Mobile menu — grouped with section headers */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[var(--border)] bg-[var(--bg-card)] animate-fade-slide-down">
            <nav className="max-w-7xl mx-auto px-4 py-2">
              {NAV_GROUPS.map(group => (
                <div key={group.label}>
                  <p className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold px-3 pt-3 pb-1">
                    {group.label}
                  </p>
                  {group.items.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => navigateToTab(tab.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2.5 ${
                          activeTab === tab.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-[var(--accent)] font-medium'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]'
                        }`}
                      >
                        <Icon size={16} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        {renderSection()}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] mt-8">
        <div className="berlin-stripe" />
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Race-day quick nav */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-5 pb-5 border-b border-[var(--border)]">
            <span className="text-xs uppercase tracking-wider font-semibold text-[var(--text-muted)]">Race Day:</span>
            <button onClick={() => navigateToTab('crossing-map')} className="text-sm text-[var(--accent)] hover:text-[var(--accent-gold)] transition-colors">Crossing Map</button>
            <button onClick={() => navigateToTab('viewing-routes')} className="text-sm text-[var(--accent)] hover:text-[var(--accent-gold)] transition-colors">Viewing Routes</button>
            <button onClick={() => navigateToTab('finish-strategy')} className="text-sm text-[var(--accent)] hover:text-[var(--accent-gold)] transition-colors">Finish Strategy</button>
            <button onClick={() => navigateToTab('transit')} className="text-sm text-[var(--accent)] hover:text-[var(--accent-gold)] transition-colors">Transit</button>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
            <p>
              Berlin Marathon Race Intelligence. Community-driven guide.
              Not affiliated with BMW Berlin-Marathon or SCC Events.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://www.bmw-berlin-marathon.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)]">
                Official BMW Berlin-Marathon
              </a>
              <a href="https://www.bvg.de/en" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)]">
                BVG Transit
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
