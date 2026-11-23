import { Location, LocationStatus } from '../models/location.model';

export interface LocationSummary {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  totalAmount: number;
  averageAmount: number;
}

export function groupByLocationStatus(items: Location[]): Record<LocationStatus, Location[]> {
  const groups: Record<LocationStatus, Location[]> = { active: [], inactive: [], archived: [] };

  for (const item of items) {
    groups[item.status].push(item);
  }

  return groups;
}

export function sumLocationAmounts(items: Location[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

export function averageLocationAmount(items: Location[]): number {
  return items.length === 0 ? 0 : sumLocationAmounts(items) / items.length;
}

export function topByLocationAmount(items: Location[], count: number): Location[] {
  return [...items].sort((first, second) => second.amount - first.amount).slice(0, Math.max(0, count));
}

export function filterLocationByTag(items: Location[], tag: string): Location[] {
  const needle = tag.trim().toLowerCase();
  return items.filter((item) => item.tags.includes(needle));
}

export function uniqueLocationTags(items: Location[]): string[] {
  const tags = new Set<string>();

  for (const item of items) {
    for (const tag of item.tags) {
      tags.add(tag);
    }
  }

  return [...tags].sort((first, second) => first.localeCompare(second));
}

export function paginateLocation(items: Location[], page: number, pageSize: number): Location[] {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.floor(pageSize));
  const start = (safePage - 1) * safeSize;

  return items.slice(start, start + safeSize);
}

export function chunkLocation(items: Location[], size: number): Location[][] {
  const safeSize = Math.max(1, Math.floor(size));
  const chunks: Location[][] = [];

  for (let index = 0; index < items.length; index += safeSize) {
    chunks.push(items.slice(index, index + safeSize));
  }

  return chunks;
}

export function summarizeLocation(items: Location[]): LocationSummary {
  const groups = groupByLocationStatus(items);

  return {
    total: items.length,
    active: groups.active.length,
    inactive: groups.inactive.length,
    archived: groups.archived.length,
    totalAmount: sumLocationAmounts(items),
    averageAmount: averageLocationAmount(items),
  };
}

export function formatLocationAmount(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatLocationDate(value: string, locale = 'en-US'): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsed);
}

export function daysSinceLocationUpdate(item: Location, now: Date = new Date()): number {
  const updated = Date.parse(item.updatedAt);

  if (Number.isNaN(updated)) {
    return 0;
  }

  return Math.floor((now.getTime() - updated) / (24 * 60 * 60 * 1000));
}

export function findLocationStale(items: Location[], maxAgeDays: number, now: Date = new Date()): Location[] {
  return items.filter((item) => daysSinceLocationUpdate(item, now) > maxAgeDays);
}

function escapeCsvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toLocationCsv(items: Location[]): string {
  const header = ['id', 'name', 'status', 'amount', 'tags'];
  const rows = items.map((item) =>
    [String(item.id), item.name, item.status, String(item.amount), item.tags.join('|')]
      .map(escapeCsvCell)
      .join(','),
  );

  return [header.join(','), ...rows].join('\n');
}
