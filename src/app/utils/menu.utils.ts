import { Menu, MenuStatus } from '../models/menu.model';

export interface MenuSummary {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  totalAmount: number;
  averageAmount: number;
}

export function groupByMenuStatus(items: Menu[]): Record<MenuStatus, Menu[]> {
  const groups: Record<MenuStatus, Menu[]> = { active: [], inactive: [], archived: [] };

  for (const item of items) {
    groups[item.status].push(item);
  }

  return groups;
}

export function sumMenuAmounts(items: Menu[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

export function averageMenuAmount(items: Menu[]): number {
  return items.length === 0 ? 0 : sumMenuAmounts(items) / items.length;
}

export function topByMenuAmount(items: Menu[], count: number): Menu[] {
  return [...items].sort((first, second) => second.amount - first.amount).slice(0, Math.max(0, count));
}

export function filterMenuByTag(items: Menu[], tag: string): Menu[] {
  const needle = tag.trim().toLowerCase();
  return items.filter((item) => item.tags.includes(needle));
}

export function uniqueMenuTags(items: Menu[]): string[] {
  const tags = new Set<string>();

  for (const item of items) {
    for (const tag of item.tags) {
      tags.add(tag);
    }
  }

  return [...tags].sort((first, second) => first.localeCompare(second));
}

export function paginateMenu(items: Menu[], page: number, pageSize: number): Menu[] {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.floor(pageSize));
  const start = (safePage - 1) * safeSize;

  return items.slice(start, start + safeSize);
}

export function chunkMenu(items: Menu[], size: number): Menu[][] {
  const safeSize = Math.max(1, Math.floor(size));
  const chunks: Menu[][] = [];

  for (let index = 0; index < items.length; index += safeSize) {
    chunks.push(items.slice(index, index + safeSize));
  }

  return chunks;
}

export function summarizeMenu(items: Menu[]): MenuSummary {
  const groups = groupByMenuStatus(items);

  return {
    total: items.length,
    active: groups.active.length,
    inactive: groups.inactive.length,
    archived: groups.archived.length,
    totalAmount: sumMenuAmounts(items),
    averageAmount: averageMenuAmount(items),
  };
}

export function formatMenuAmount(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatMenuDate(value: string, locale = 'en-US'): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsed);
}

export function daysSinceMenuUpdate(item: Menu, now: Date = new Date()): number {
  const updated = Date.parse(item.updatedAt);

  if (Number.isNaN(updated)) {
    return 0;
  }

  return Math.floor((now.getTime() - updated) / (24 * 60 * 60 * 1000));
}

export function findMenuStale(items: Menu[], maxAgeDays: number, now: Date = new Date()): Menu[] {
  return items.filter((item) => daysSinceMenuUpdate(item, now) > maxAgeDays);
}

function escapeCsvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toMenuCsv(items: Menu[]): string {
  const header = ['id', 'name', 'status', 'amount', 'tags'];
  const rows = items.map((item) =>
    [String(item.id), item.name, item.status, String(item.amount), item.tags.join('|')]
      .map(escapeCsvCell)
      .join(','),
  );

  return [header.join(','), ...rows].join('\n');
}
