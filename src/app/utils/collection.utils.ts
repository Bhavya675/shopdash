import { Collection, CollectionStatus } from '../models/collection.model';

export interface CollectionSummary {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  totalAmount: number;
  averageAmount: number;
}

export function groupByCollectionStatus(items: Collection[]): Record<CollectionStatus, Collection[]> {
  const groups: Record<CollectionStatus, Collection[]> = { active: [], inactive: [], archived: [] };

  for (const item of items) {
    groups[item.status].push(item);
  }

  return groups;
}

export function sumCollectionAmounts(items: Collection[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

export function averageCollectionAmount(items: Collection[]): number {
  return items.length === 0 ? 0 : sumCollectionAmounts(items) / items.length;
}

export function topByCollectionAmount(items: Collection[], count: number): Collection[] {
  return [...items].sort((first, second) => second.amount - first.amount).slice(0, Math.max(0, count));
}

export function filterCollectionByTag(items: Collection[], tag: string): Collection[] {
  const needle = tag.trim().toLowerCase();
  return items.filter((item) => item.tags.includes(needle));
}

export function uniqueCollectionTags(items: Collection[]): string[] {
  const tags = new Set<string>();

  for (const item of items) {
    for (const tag of item.tags) {
      tags.add(tag);
    }
  }

  return [...tags].sort((first, second) => first.localeCompare(second));
}

export function paginateCollection(items: Collection[], page: number, pageSize: number): Collection[] {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.floor(pageSize));
  const start = (safePage - 1) * safeSize;

  return items.slice(start, start + safeSize);
}

export function chunkCollection(items: Collection[], size: number): Collection[][] {
  const safeSize = Math.max(1, Math.floor(size));
  const chunks: Collection[][] = [];

  for (let index = 0; index < items.length; index += safeSize) {
    chunks.push(items.slice(index, index + safeSize));
  }

  return chunks;
}

export function summarizeCollection(items: Collection[]): CollectionSummary {
  const groups = groupByCollectionStatus(items);

  return {
    total: items.length,
    active: groups.active.length,
    inactive: groups.inactive.length,
    archived: groups.archived.length,
    totalAmount: sumCollectionAmounts(items),
    averageAmount: averageCollectionAmount(items),
  };
}

export function formatCollectionAmount(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatCollectionDate(value: string, locale = 'en-US'): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsed);
}

export function daysSinceCollectionUpdate(item: Collection, now: Date = new Date()): number {
  const updated = Date.parse(item.updatedAt);

  if (Number.isNaN(updated)) {
    return 0;
  }

  return Math.floor((now.getTime() - updated) / (24 * 60 * 60 * 1000));
}

export function findCollectionStale(items: Collection[], maxAgeDays: number, now: Date = new Date()): Collection[] {
  return items.filter((item) => daysSinceCollectionUpdate(item, now) > maxAgeDays);
}

function escapeCsvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toCollectionCsv(items: Collection[]): string {
  const header = ['id', 'name', 'status', 'amount', 'tags'];
  const rows = items.map((item) =>
    [String(item.id), item.name, item.status, String(item.amount), item.tags.join('|')]
      .map(escapeCsvCell)
      .join(','),
  );

  return [header.join(','), ...rows].join('\n');
}
