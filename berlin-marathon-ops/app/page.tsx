'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Sun,
  Moon,
  Menu,
  X,
  Home,
  User,
  Eye,
  MapPin,
  GitBranch,
  Flag,
  Train as TrainIcon,
  Bed,
  Utensils,
  AlertTriangle,
  Heart,
  ChevronDown,
  Wrench,
  Plane,
} from 'lucide-react';
import { getTheme, setTheme as persistTheme, trackEvent } from '@/lib/store';
import { FilterState } from '@/lib/types';
import GlobalSearch from '@/components/ui/GlobalSearch';
import MyOpsPlan from '@/components/ui/MyOpsPlan';
import FiltersDrawer from '@/components/ui/FiltersDrawer';
import OnboardingModal, {
  RecommendedBanner,
  getOnboardingComplete,
  getSavedMode,
} from '@/components/ui/OnboardingModal';

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

/* ─── Nav structure ────────────────────────────────────────── */

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  children?: { id: string; label: string; icon: React.ElementType }[];
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'runner-guide', label: 'Runner', icon: User },
  { id: 'spectator-guide', label: 'Spectator', icon: Eye },
  {
    id: 'tools-group',
    label: 'Tools',
    icon: Wrench,
    children: [
      { id: 'viewing-routes', label: 'Viewing Routes', icon: MapPin },
      { id: 'crossing-map', label: 'Crossing Map', icon: GitBranch },
      { id: 'finish-strategy', label: 'Finish Strategy', icon: Flag },
    ],
  },
  {
    id: 'travel-group',
    label: 'Travel',
    icon: Plane,
    children: [
      { id: 'where-to-stay', label: 'Where to Stay', icon: Bed },
      { id: 'food', label: 'Food & Restaurants', icon: Utensils },
      { id: 'transit', label: 'Transit Strategy', icon: TrainIcon },
    ],
  },
  { id: 'common-mistakes', label: 'Mistakes', icon: AlertTriangle },
  { id: 'support', label: 'Support', icon: Heart },
];

// Flat list of all navigable tab IDs
const ALL_TAB_IDS = NAV_ITEMS.flatMap((item) =>
  item.children ? item.children.map((c) => c.id) : [item.id]
);

const defaultFilters: FilterState = {
  audience: [],
  label: [],
  confidence: [],
  recurrenceOnly: false,
  languageOrigin: [],
};

function isTabInGroup(groupId: string, activeTab: string): boolean {
  const group = NAV_ITEMS.find((n) => n.id === groupId);
  return !!group?.children?.some((c) => c.id === activeTab);
}

/* ─── Dropdown component ───────────────────────────────────── */

function NavDropdown({
  item,
  activeTab,
  onNavigate,
}: {
  item: NavItem;
  activeTab: string;
  onNavigate: (tabId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = isTabInGroup(item.id, activeTab);
  const Icon = item.icon;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
          isActive
            ? 'border-[var(--accent)] text-[var(--accent)]'
            : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[var(--border)]'
        }`}
      >
        <Icon size={13} />
        {item.label}
        <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && item.children && (
        <div className="nav-dropdown">
          {item.children.map((child) => {
            const ChildIcon = child.icon;
            return (
              <button
                key={child.id}
                onClick={() => {
                  onNavigate(child.id);
                  setOpen(false);
                }}
                className={`w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                  activeTab === child.id
                    ? 'text-[var(--accent)] bg-blue-50 dark:bg-blue-900/15'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]'
                }`}
              >
                <ChildIcon size={14} />
                {child.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Main page ────────────────────────────────────────────── */

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [theme, setThemeState] = useState<'dark' | 'light'>('light');
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<'all' | 'runner' | 'spectator'>('all');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [recommendedTabs, setRecommendedTabs] = useState<string[]>([]);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = getTheme();
    setThemeState(saved);
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Check onboarding
    if (!getOnboardingComplete()) {
      setShowOnboarding(true);
    } else {
      // Restore mode from onboarding
      const savedMode = getSavedMode();
      if (savedMode) {
        setMode(savedMode);
      }
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

  const handleOnboardingComplete = (
    selectedMode: 'runner' | 'spectator',
    tabs: string[]
  ) => {
    setMode(selectedMode);
    setShowOnboarding(false);
    if (tabs.length > 0) {
      setRecommendedTabs(tabs);
      setShowBanner(true);
    }
  };

  const renderSection = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview onNavigate={navigateToTab} />;
      case 'runner-guide':
        return <RunnerIntelligence filters={filters} />;
      case 'spectator-guide':
        return <SpectatorIntelligence filters={filters} />;
      case 'viewing-routes':
        return <RoutePlanner filters={filters} />;
      case 'crossing-map':
        return <CrossingDatabase filters={filters} />;
      case 'finish-strategy':
        return <FinishBlueprint filters={filters} />;
      case 'transit':
        return <TransitStrategy filters={filters} />;
      case 'where-to-stay':
        return <WhereToStay filters={filters} />;
      case 'food':
        return <FoodRestaurants filters={filters} />;
      case 'common-mistakes':
        return <FailureModes filters={filters} />;
      case 'support':
        return <Support />;
      default:
        return <Overview onNavigate={navigateToTab} />;
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg-card)]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          {/* Top bar */}
          <div className="flex items-center justify-between h-14">
            {/* Left: Hamburger + Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-muted)]"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <button
                onClick={() => navigateToTab('overview')}
                className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
              >
                <div className="flex flex-col leading-none">
                  <span className="text-xs font-extrabold tracking-wide text-[var(--accent)] uppercase">
                    Berlin Marathon
                  </span>
                  <span className="text-[10px] font-medium text-[var(--text-muted)] tracking-wider uppercase">
                    Race Intelligence
                  </span>
                </div>
              </button>
            </div>

            {/* Center: Desktop nav */}
            <nav className="hidden lg:flex items-center -mb-px">
              {NAV_ITEMS.map((item) => {
                if (item.children) {
                  return (
                    <NavDropdown
                      key={item.id}
                      item={item}
                      activeTab={activeTab}
                      onNavigate={navigateToTab}
                    />
                  );
                }
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateToTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                      activeTab === item.id
                        ? 'border-[var(--accent)] text-[var(--accent)]'
                        : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[var(--border)]'
                    }`}
                  >
                    <Icon size={13} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Right: Mode toggle + utilities */}
            <div className="flex items-center gap-2">
              {/* Mode Toggle */}
              <div className="hidden sm:flex items-center rounded-lg border border-[var(--border)] overflow-hidden">
                {(['all', 'runner', 'spectator'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setMode(m);
                      trackEvent('mode-toggle', m);
                    }}
                    className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      mode === m
                        ? m === 'runner'
                          ? 'bg-blue-500 text-white'
                          : m === 'spectator'
                          ? 'bg-purple-500 text-white'
                          : 'bg-[var(--accent)] text-white'
                        : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)]'
                    }`}
                  >
                    {m === 'all' ? 'All' : m === 'runner' ? 'Runner' : 'Spectator'}
                  </button>
                ))}
              </div>
              <div className="hidden md:block">
                <GlobalSearch onNavigate={navigateToTab} />
              </div>
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

          {/* Mobile search + mode toggle */}
          <div className="lg:hidden pb-2 space-y-2">
            <div className="md:hidden">
              <GlobalSearch onNavigate={navigateToTab} />
            </div>
            <div className="sm:hidden flex items-center rounded-lg border border-[var(--border)] overflow-hidden">
              {(['all', 'runner', 'spectator'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                    trackEvent('mode-toggle', m);
                  }}
                  className={`flex-1 px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    mode === m
                      ? m === 'runner'
                        ? 'bg-blue-500 text-white'
                        : m === 'spectator'
                        ? 'bg-purple-500 text-white'
                        : 'bg-[var(--accent)] text-white'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)]'
                  }`}
                >
                  {m === 'all' ? 'All' : m === 'runner' ? 'Runner' : 'Spectator'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[var(--border)] bg-[var(--bg-card)]">
            <nav className="max-w-7xl mx-auto px-4 py-2 space-y-0.5">
              {NAV_ITEMS.map((item) => {
                if (item.children) {
                  return (
                    <div key={item.id}>
                      <div className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                        {item.label}
                      </div>
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        return (
                          <button
                            key={child.id}
                            onClick={() => navigateToTab(child.id)}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2.5 ml-2 ${
                              activeTab === child.id
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-[var(--accent)] font-medium'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]'
                            }`}
                          >
                            <ChildIcon size={16} />
                            {child.label}
                          </button>
                        );
                      })}
                    </div>
                  );
                }
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateToTab(item.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2.5 ${
                      activeTab === item.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-[var(--accent)] font-medium'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]'
                    }`}
                  >
                    <Icon size={16} />
                    {item.label === 'Mistakes' ? 'Common Mistakes' : item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        {/* Recommended banner */}
        {showBanner && (
          <RecommendedBanner
            tabs={recommendedTabs}
            onNavigate={navigateToTab}
            onDismiss={() => setShowBanner(false)}
          />
        )}
        {renderSection()}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] mt-8">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
            <p>
              Berlin Marathon Race Intelligence. Community-driven guide. Not
              affiliated with BMW Berlin-Marathon or SCC Events.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://www.bmw-berlin-marathon.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--accent)]"
              >
                Official BMW Berlin-Marathon
              </a>
              <a
                href="https://www.bvg.de/en"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--accent)]"
              >
                BVG Transit
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
