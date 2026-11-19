import { Store, StoreStatus } from '../models/store.model';

export interface StoreSummary {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  totalAmount: number;
  averageAmount: number;
}

export function groupByStoreStatus(items: Store[]): Record<StoreStatus, Store[]> {
  const groups: Record<StoreStatus, Store[]> = { active: [], inactive: [], archived: [] };

  for (const item of items) {
    groups[item.status].push(item);
  }

  return groups;
}

export function sumStoreAmounts(items: Store[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

export function averageStoreAmount(items: Store[]): number {
  return items.length === 0 ? 0 : sumStoreAmounts(items) / items.length;
}

export function topByStoreAmount(items: Store[], count: number): Store[] {
  return [...items].sort((first, second) => second.amount - first.amount).slice(0, Math.max(0, count));
}

export function filterStoreByTag(items: Store[], tag: string): Store[] {
  const needle = tag.trim().toLowerCase();
  return items.filter((item) => item.tags.includes(needle));
}

export function uniqueStoreTags(items: Store[]): string[] {
  const tags = new Set<string>();

  for (const item of items) {
    for (const tag of item.tags) {
      tags.add(tag);
    }
  }

  return [...tags].sort((first, second) => first.localeCompare(second));
}

export function paginateStore(items: Store[], page: number, pageSize: number): Store[] {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.floor(pageSize));
  const start = (safePage - 1) * safeSize;

  return items.slice(start, start + safeSize);
}

export function chunkStore(items: Store[], size: number): Store[][] {
  const safeSize = Math.max(1, Math.floor(size));
  const chunks: Store[][] = [];

  for (let index = 0; index < items.length; index += safeSize) {
    chunks.push(items.slice(index, index + safeSize));
  }

  return chunks;
}

export function summarizeStore(items: Store[]): StoreSummary {
  const groups = groupByStoreStatus(items);

  return {
    total: items.length,
    active: groups.active.length,
    inactive: groups.inactive.length,
    archived: groups.archived.length,
    totalAmount: sumStoreAmounts(items),
    averageAmount: averageStoreAmount(items),
  };
}

export function formatStoreAmount(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatStoreDate(value: string, locale = 'en-US'): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsed);
}

export function daysSinceStoreUpdate(item: Store, now: Date = new Date()): number {
  const updated = Date.parse(item.updatedAt);

  if (Number.isNaN(updated)) {
    return 0;
  }

  return Math.floor((now.getTime() - updated) / (24 * 60 * 60 * 1000));
}

export function findStoreStale(items: Store[], maxAgeDays: number, now: Date = new Date()): Store[] {
  return items.filter((item) => daysSinceStoreUpdate(item, now) > maxAgeDays);
}

function escapeCsvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toStoreCsv(items: Store[]): string {
  const header = ['id', 'name', 'status', 'amount', 'tags'];
  const rows = items.map((item) =>
    [String(item.id), item.name, item.status, String(item.amount), item.tags.join('|')]
      .map(escapeCsvCell)
      .join(','),
  );

  return [header.join(','), ...rows].join('\n');
}
