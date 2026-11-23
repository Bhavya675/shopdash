import { Catalog, CatalogStatus } from '../models/catalog.model';

export interface CatalogSummary {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  totalAmount: number;
  averageAmount: number;
}

export function groupByCatalogStatus(items: Catalog[]): Record<CatalogStatus, Catalog[]> {
  const groups: Record<CatalogStatus, Catalog[]> = { active: [], inactive: [], archived: [] };

  for (const item of items) {
    groups[item.status].push(item);
  }

  return groups;
}

export function sumCatalogAmounts(items: Catalog[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

export function averageCatalogAmount(items: Catalog[]): number {
  return items.length === 0 ? 0 : sumCatalogAmounts(items) / items.length;
}

export function topByCatalogAmount(items: Catalog[], count: number): Catalog[] {
  return [...items].sort((first, second) => second.amount - first.amount).slice(0, Math.max(0, count));
}

export function filterCatalogByTag(items: Catalog[], tag: string): Catalog[] {
  const needle = tag.trim().toLowerCase();
  return items.filter((item) => item.tags.includes(needle));
}

export function uniqueCatalogTags(items: Catalog[]): string[] {
  const tags = new Set<string>();

  for (const item of items) {
    for (const tag of item.tags) {
      tags.add(tag);
    }
  }

  return [...tags].sort((first, second) => first.localeCompare(second));
}

export function paginateCatalog(items: Catalog[], page: number, pageSize: number): Catalog[] {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.floor(pageSize));
  const start = (safePage - 1) * safeSize;

  return items.slice(start, start + safeSize);
}

export function chunkCatalog(items: Catalog[], size: number): Catalog[][] {
  const safeSize = Math.max(1, Math.floor(size));
  const chunks: Catalog[][] = [];

  for (let index = 0; index < items.length; index += safeSize) {
    chunks.push(items.slice(index, index + safeSize));
  }

  return chunks;
}

export function summarizeCatalog(items: Catalog[]): CatalogSummary {
  const groups = groupByCatalogStatus(items);

  return {
    total: items.length,
    active: groups.active.length,
    inactive: groups.inactive.length,
    archived: groups.archived.length,
    totalAmount: sumCatalogAmounts(items),
    averageAmount: averageCatalogAmount(items),
  };
}

export function formatCatalogAmount(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatCatalogDate(value: string, locale = 'en-US'): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsed);
}

export function daysSinceCatalogUpdate(item: Catalog, now: Date = new Date()): number {
  const updated = Date.parse(item.updatedAt);

  if (Number.isNaN(updated)) {
    return 0;
  }

  return Math.floor((now.getTime() - updated) / (24 * 60 * 60 * 1000));
}

export function findCatalogStale(items: Catalog[], maxAgeDays: number, now: Date = new Date()): Catalog[] {
  return items.filter((item) => daysSinceCatalogUpdate(item, now) > maxAgeDays);
}

function escapeCsvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toCatalogCsv(items: Catalog[]): string {
  const header = ['id', 'name', 'status', 'amount', 'tags'];
  const rows = items.map((item) =>
    [String(item.id), item.name, item.status, String(item.amount), item.tags.join('|')]
      .map(escapeCsvCell)
      .join(','),
  );

  return [header.join(','), ...rows].join('\n');
}
