'use client';

import {
  User,
  Eye,
  ArrowRight,
  MapPin,
  GitBranch,
  Flag,
  Train,
  Bed,
  Utensils,
  FileText,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';
import bulletsData from '@/data/bullets.json';
import routesData from '@/data/routes.json';
import crossingsData from '@/data/crossings.json';
import failuresData from '@/data/failures.json';
import lodgingData from '@/data/lodging.json';
import restaurantsData from '@/data/restaurants.json';
import config from '@/data/config.json';

interface Props {
  onNavigate: (tabId: string) => void;
}

const TOOL_TILES = [
  {
    id: 'viewing-routes',
    label: 'Viewing Routes',
    description: 'Pre-planned spectator routes with transit steps',
    icon: MapPin,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  {
    id: 'crossing-map',
    label: 'Crossing Map',
    description: 'Where and how to cross the marathon course',
    icon: GitBranch,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-100 dark:bg-violet-900/30',
  },
  {
    id: 'finish-strategy',
    label: 'Finish Strategy',
    description: 'Post-finish navigation and runner reunion plan',
    icon: Flag,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-100 dark:bg-rose-900/30',
  },
  {
    id: 'transit',
    label: 'Transit Strategy',
    description: 'Which U-Bahn and S-Bahn lines work on race day',
    icon: Train,
    color: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-100 dark:bg-sky-900/30',
  },
  {
    id: 'where-to-stay',
    label: 'Where to Stay',
    description: 'Neighborhoods ranked by race day convenience',
    icon: Bed,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
  },
  {
    id: 'food',
    label: 'Food & Restaurants',
    description: 'Carb loading, breakfast, and post-race meals',
    icon: Utensils,
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
  },
];

export default function Overview({ onNavigate }: Props) {
  const stats = [
    { label: 'Intel entries', value: bulletsData.length },
    { label: 'Viewing routes', value: routesData.length },
    { label: 'Crossings mapped', value: crossingsData.length },
    { label: 'Common mistakes', value: failuresData.length },
    { label: 'Neighborhoods', value: lodgingData.length },
    { label: 'Restaurants', value: restaurantsData.length },
  ];

  return (
    <div>
      {/* Section 1: Hero + Stat Tiles */}
      <div className="mb-14">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text)] mb-3 leading-tight tracking-tight">
          Berlin Marathon<br />
          <span className="text-[var(--accent)]">Race Intelligence</span>
        </h1>
        <p className="text-base sm:text-lg text-[var(--text-secondary)] mb-2 max-w-2xl">
          Community-sourced strategy guide for runners and spectators.
        </p>
        <p className="text-xs text-[var(--text-muted)] mb-8">
          Race day: {config.raceDate} &middot; Start: {config.raceStartTime} &middot; Not affiliated with BMW Berlin-Marathon
        </p>

        {/* Stat tiles */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="stat-tile text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-[var(--accent)]">{s.value}</div>
              <div className="text-[10px] sm:text-xs text-[var(--text-muted)] mt-1 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Choose Your Mission */}
      <div className="mb-14">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)] mb-6">Choose Your Mission</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Runner Card */}
          <div className="card p-6 sm:p-8 border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/60 to-transparent dark:from-blue-950/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <User size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text)]">Runner Guide</h3>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-5 leading-relaxed">
              Race morning logistics, start line timeline, pacing strategy, and finish area navigation.
            </p>
            <div className="flex flex-wrap gap-2 mb-5">
              <button onClick={() => onNavigate('runner-guide')} className="text-xs px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                Runner Intel
              </button>
              <button onClick={() => onNavigate('finish-strategy')} className="text-xs px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                Finish Strategy
              </button>
              <button onClick={() => onNavigate('common-mistakes')} className="text-xs px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                Common Mistakes
              </button>
            </div>
            <button
              onClick={() => onNavigate('runner-guide')}
              className="btn-primary bg-blue-600 hover:bg-blue-700"
            >
              Start Runner Guide <ArrowRight size={14} />
            </button>
          </div>

          {/* Spectator Card */}
          <div className="card p-6 sm:p-8 border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/60 to-transparent dark:from-purple-950/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                <Eye size={24} className="text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text)]">Spectator Guide</h3>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-5 leading-relaxed">
              Where to watch, how to move between spots, course crossings, and reunion planning.
            </p>
            <div className="flex flex-wrap gap-2 mb-5">
              <button onClick={() => onNavigate('spectator-guide')} className="text-xs px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">
                Spectator Intel
              </button>
              <button onClick={() => onNavigate('viewing-routes')} className="text-xs px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">
                Viewing Routes
              </button>
              <button onClick={() => onNavigate('crossing-map')} className="text-xs px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">
                Crossing Map
              </button>
            </div>
            <button
              onClick={() => onNavigate('spectator-guide')}
              className="btn-primary bg-purple-600 hover:bg-purple-700"
            >
              Start Spectator Guide <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: Top 6 Most-Used Tools */}
      <div className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)] mb-6">Most-Used Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOL_TILES.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => onNavigate(tool.id)}
                className="stat-tile text-left flex items-start gap-4 p-5"
              >
                <div className={`w-10 h-10 rounded-lg ${tool.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={20} className={tool.color} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm text-[var(--text)] mb-1">{tool.label}</h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">{tool.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Minimal disclaimer */}
      <p className="text-xs text-[var(--text-muted)] text-center mt-8">
        Community-driven guide. Not affiliated with BMW Berlin-Marathon or SCC Events.
      </p>
    </div>
  );
}
