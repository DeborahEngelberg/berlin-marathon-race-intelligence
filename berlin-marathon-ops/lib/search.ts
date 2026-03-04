import Fuse from 'fuse.js';
import bulletsData from '@/data/bullets.json';
import crossingsData from '@/data/crossings.json';
import routesData from '@/data/routes.json';
import failuresData from '@/data/failures.json';
import lodgingData from '@/data/lodging.json';
import restaurantsData from '@/data/restaurants.json';

export interface SearchResult {
  id: string;
  type: 'bullet' | 'crossing' | 'route' | 'failure' | 'lodging' | 'restaurant';
  title: string;
  text: string;
  section: string;
  score?: number;
}

// Map old data section IDs to new navigation tab IDs
const sectionToTab: Record<string, string> = {
  'runner-intelligence': 'runner-guide',
  'spectator-intelligence': 'spectator-guide',
  'finish-blueprint': 'finish-strategy',
  'transit-strategy': 'transit',
};

function mapSection(section: string): string {
  return sectionToTab[section] || section;
}

function buildSearchIndex(): SearchResult[] {
  const items: SearchResult[] = [];

  bulletsData.forEach((b: any) => {
    items.push({
      id: b.id,
      type: 'bullet',
      title: b.label + ': ' + b.tags.join(', '),
      text: b.text,
      section: mapSection(b.section),
    });
  });

  crossingsData.forEach((c: any) => {
    items.push({
      id: c.id,
      type: 'crossing',
      title: c.name,
      text: `${c.locationText} ${c.canCrossText} ${c.sideOutcomeText} ${c.trapRiskText} ${c.notes}`,
      section: 'crossing-map',
    });
  });

  routesData.forEach((r: any) => {
    items.push({
      id: r.id,
      type: 'route',
      title: r.name,
      text: `${r.paceBand} ${r.spots.map((s: any) => s.name + ' ' + s.station).join(' ')} ${r.backupPlan}`,
      section: 'viewing-routes',
    });
  });

  failuresData.forEach((f: any) => {
    items.push({
      id: f.id,
      type: 'failure',
      title: f.title,
      text: `${f.whyFails} ${f.veteranFix} ${f.alternatePlan}`,
      section: 'common-mistakes',
    });
  });

  lodgingData.forEach((l: any) => {
    items.push({
      id: l.id,
      type: 'lodging',
      title: l.anchor,
      text: `${l.station || ''} ${l.quietRisk} ${l.avoidWarning}`,
      section: 'where-to-stay',
    });
  });

  restaurantsData.forEach((r: any) => {
    items.push({
      id: r.id,
      type: 'restaurant',
      title: r.name,
      text: `${r.neighborhood} ${r.station} ${r.orderNotes} ${r.reservationHack}`,
      section: 'food',
    });
  });

  return items;
}

let fuseInstance: Fuse<SearchResult> | null = null;
let allItems: SearchResult[] = [];

function getFuse(): Fuse<SearchResult> {
  if (!fuseInstance) {
    allItems = buildSearchIndex();
    fuseInstance = new Fuse(allItems, {
      keys: ['title', 'text'],
      threshold: 0.3,
      includeScore: true,
      minMatchCharLength: 2,
    });
  }
  return fuseInstance;
}

export function search(query: string): SearchResult[] {
  if (!query || query.length < 2) return [];
  const fuse = getFuse();
  return fuse.search(query, { limit: 30 }).map(r => ({
    ...r.item,
    score: r.score,
  }));
}
