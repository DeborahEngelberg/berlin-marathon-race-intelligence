'use client';

import { Home, User, Eye, MapPin, GitBranch, Flag, Train, Bed, Utensils, AlertTriangle, ArrowRight } from 'lucide-react';

interface Props {
  onNavigate: (tabId: string) => void;
}

const NAV_CARDS = [
  { id: 'runner-guide', label: 'Runner Guide', desc: 'Race morning logistics, aid stations, pacing, and what veterans wish they knew', icon: User, color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
  { id: 'spectator-guide', label: 'Spectator Guide', desc: 'Best viewing zones, wrong-side traps, the Three-View Rule, and crowd strategy', icon: Eye, color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' },
  { id: 'viewing-routes', label: 'Viewing Routes', desc: 'Pre-planned spectator routes with transit, timing, and backup plans', icon: MapPin, color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' },
  { id: 'crossing-map', label: 'Crossing Map', desc: 'How to cross the marathon course using underpasses, tunnels, and station passages', icon: GitBranch, color: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800' },
  { id: 'finish-strategy', label: 'Finish Strategy', desc: 'Post-finish chute, reunion planning, and timed reality of the finish area', icon: Flag, color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' },
];

const TIPS = [
  {
    title: 'The Three-View Rule',
    text: 'Attempting more than 3 viewing positions consistently fails. Transit disruptions, course crossing delays, and crowd density make a 4th move nearly impossible.',
    audience: 'Spectator',
  },
  {
    title: 'Use U-Bahn underpasses to cross the course',
    text: 'The Straßenunterführungen der U-Bahnhöfe (U-Bahn station underpasses) allow you to pass beneath the race course at key locations like Potsdamer Platz.',
    audience: 'Spectator',
  },
  {
    title: 'Arrive at Athletes\' Village by 07:30',
    text: 'Late arrival (after 08:30) triggers a cascade failure: security line 20+ min, toilet lines impossible, gear drop rushed. Build a 30-minute buffer.',
    audience: 'Runner',
  },
  {
    title: 'Do not rely on buses or trams',
    text: 'All surface bus and tram routes crossing the marathon course are rerouted or suspended from approximately 07:00 to 17:00. Use U-Bahn and S-Bahn only.',
    audience: 'Both',
  },
  {
    title: 'Plan your reunion before race day',
    text: 'Cell service near the finish is severely degraded. Without a pre-agreed meeting plan (letter sign + backup location), reunion averages 45 to 90 minutes.',
    audience: 'Both',
  },
  {
    title: 'Don\'t go out too fast',
    text: 'Berlin\'s flat opening kilometers feel fast. 60%+ of first-timers run 15 to 30 sec/km faster than goal pace in the first 5 km. This catches up brutally at km 30 to 35.',
    audience: 'Runner',
  },
];

export default function Overview({ onNavigate }: Props) {
  return (
    <div>
      {/* Hero */}
      <div className="mb-10">
        <div className="mb-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] mb-3 leading-tight">
            Your complete guide to<br />
            <span className="text-[var(--accent)]">race day in Berlin</span>
          </h2>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            Whether you are running the BMW Berlin Marathon or cheering from the sidelines, this guide covers logistics, strategy, and lessons from experienced runners and spectators.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => onNavigate('runner-guide')}
            className="px-5 py-2.5 rounded-lg bg-[var(--accent)] text-white font-semibold text-sm hover:bg-[var(--accent-dark)] transition-colors flex items-center gap-2"
          >
            <User size={16} /> I&apos;m Running
          </button>
          <button
            onClick={() => onNavigate('spectator-guide')}
            className="px-5 py-2.5 rounded-lg border-2 border-[var(--accent)] text-[var(--accent)] font-semibold text-sm hover:bg-[var(--accent)] hover:text-white transition-colors flex items-center gap-2"
          >
            <Eye size={16} /> I&apos;m Spectating
          </button>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="mb-10">
        <h3 className="text-lg font-bold text-[var(--text)] mb-4">Explore the guide</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {NAV_CARDS.map(card => (
            <button
              key={card.id}
              onClick={() => onNavigate(card.id)}
              className={`text-left p-4 rounded-lg border ${card.color} hover:shadow-md transition-all group`}
            >
              <div className="flex items-start gap-3">
                <card.icon size={20} className="text-[var(--accent)] flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-[var(--text)]">{card.label}</span>
                    <ArrowRight size={14} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{card.desc}</p>
                </div>
              </div>
            </button>
          ))}

          {/* Additional links */}
          <button onClick={() => onNavigate('transit')} className="text-left p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] hover:shadow-md transition-all group">
            <div className="flex items-start gap-3">
              <Train size={20} className="text-[var(--accent)] flex-shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-[var(--text)]">Transit</span>
                  <ArrowRight size={14} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-[var(--text-secondary)]">U-Bahn and S-Bahn reliability, stations to avoid, walking alternatives</p>
              </div>
            </div>
          </button>
          <button onClick={() => onNavigate('where-to-stay')} className="text-left p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] hover:shadow-md transition-all group">
            <div className="flex items-start gap-3">
              <Bed size={20} className="text-[var(--accent)] flex-shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-[var(--text)]">Where to Stay</span>
                  <ArrowRight size={14} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-[var(--text-secondary)]">Neighborhood rankings for race-morning friction, finish access, and quiet sleep</p>
              </div>
            </div>
          </button>
          <button onClick={() => onNavigate('food')} className="text-left p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] hover:shadow-md transition-all group">
            <div className="flex items-start gap-3">
              <Utensils size={20} className="text-[var(--accent)] flex-shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-[var(--text)]">Food</span>
                  <ArrowRight size={14} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-[var(--text-secondary)]">Where to eat marathon weekend: carb-loading, breakfast, post-race</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Most Important Tips */}
      <div className="mb-10">
        <h3 className="text-lg font-bold text-[var(--text)] mb-4">Most important tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TIPS.map((tip, i) => (
            <div key={i} className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`badge ${tip.audience === 'Runner' ? 'badge-runner' : tip.audience === 'Spectator' ? 'badge-spectator' : 'badge-both'}`}>
                  {tip.audience}
                </span>
                <h4 className="font-semibold text-sm text-[var(--text)]">{tip.title}</h4>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How to use this guide */}
      <div className="card p-6 mb-6">
        <h3 className="text-lg font-bold text-[var(--text)] mb-3">How to use this guide</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-[var(--text-secondary)]">
          <div>
            <h4 className="font-semibold text-[var(--text)] mb-2 flex items-center gap-2">
              <User size={16} className="text-[var(--accent)]" /> For runners
            </h4>
            <p className="leading-relaxed">
              Start with the <strong>Runner Guide</strong> for race morning logistics, toilet strategy, and pacing advice. Then check <strong>Finish Strategy</strong> to plan your post-race reunion. Use the <strong>Race Morning Checklist Generator</strong> to build a personalized timeline.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-[var(--text)] mb-2 flex items-center gap-2">
              <Eye size={16} className="text-[var(--accent)]" /> For spectators
            </h4>
            <p className="leading-relaxed">
              Start with the <strong>Spectator Guide</strong> for viewing strategy and trap zones. Then pick a <strong>Viewing Route</strong> that matches your runner&apos;s pace. Use the <strong>Crossing Map</strong> to plan how to move between viewing spots. Check <strong>Common Mistakes</strong> to avoid the biggest spectator failures.
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-[var(--text-muted)] text-center">
        This guide is community-driven and not affiliated with BMW Berlin-Marathon or SCC Events.
        All information is sourced from runner and spectator reports, official guides, and local transit authorities.
      </p>
    </div>
  );
}
