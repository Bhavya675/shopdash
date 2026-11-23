import { Region, RegionStatus } from '../models/region.model';

export interface RegionSummary {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  totalAmount: number;
  averageAmount: number;
}

export function groupByRegionStatus(items: Region[]): Record<RegionStatus, Region[]> {
  const groups: Record<RegionStatus, Region[]> = { active: [], inactive: [], archived: [] };

  for (const item of items) {
    groups[item.status].push(item);
  }

  return groups;
}

export function sumRegionAmounts(items: Region[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

export function averageRegionAmount(items: Region[]): number {
  return items.length === 0 ? 0 : sumRegionAmounts(items) / items.length;
}

export function topByRegionAmount(items: Region[], count: number): Region[] {
  return [...items].sort((first, second) => second.amount - first.amount).slice(0, Math.max(0, count));
}

export function filterRegionByTag(items: Region[], tag: string): Region[] {
  const needle = tag.trim().toLowerCase();
  return items.filter((item) => item.tags.includes(needle));
}

export function uniqueRegionTags(items: Region[]): string[] {
  const tags = new Set<string>();

  for (const item of items) {
    for (const tag of item.tags) {
      tags.add(tag);
    }
  }

  return [...tags].sort((first, second) => first.localeCompare(second));
}

export function paginateRegion(items: Region[], page: number, pageSize: number): Region[] {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.floor(pageSize));
  const start = (safePage - 1) * safeSize;

  return items.slice(start, start + safeSize);
}

export function chunkRegion(items: Region[], size: number): Region[][] {
  const safeSize = Math.max(1, Math.floor(size));
  const chunks: Region[][] = [];

  for (let index = 0; index < items.length; index += safeSize) {
    chunks.push(items.slice(index, index + safeSize));
  }

  return chunks;
}

export function summarizeRegion(items: Region[]): RegionSummary {
  const groups = groupByRegionStatus(items);

  return {
    total: items.length,
    active: groups.active.length,
    inactive: groups.inactive.length,
    archived: groups.archived.length,
    totalAmount: sumRegionAmounts(items),
    averageAmount: averageRegionAmount(items),
  };
}

export function formatRegionAmount(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatRegionDate(value: string, locale = 'en-US'): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsed);
}

export function daysSinceRegionUpdate(item: Region, now: Date = new Date()): number {
  const updated = Date.parse(item.updatedAt);

  if (Number.isNaN(updated)) {
    return 0;
  }

  return Math.floor((now.getTime() - updated) / (24 * 60 * 60 * 1000));
}

export function findRegionStale(items: Region[], maxAgeDays: number, now: Date = new Date()): Region[] {
  return items.filter((item) => daysSinceRegionUpdate(item, now) > maxAgeDays);
}

function escapeCsvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toRegionCsv(items: Region[]): string {
  const header = ['id', 'name', 'status', 'amount', 'tags'];
  const rows = items.map((item) =>
    [String(item.id), item.name, item.status, String(item.amount), item.tags.join('|')]
      .map(escapeCsvCell)
      .join(','),
  );

  return [header.join(','), ...rows].join('\n');
}
