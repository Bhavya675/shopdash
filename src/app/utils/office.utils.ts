import { Office, OfficeStatus } from '../models/office.model';

export interface OfficeSummary {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  totalAmount: number;
  averageAmount: number;
}

export function groupByOfficeStatus(items: Office[]): Record<OfficeStatus, Office[]> {
  const groups: Record<OfficeStatus, Office[]> = { active: [], inactive: [], archived: [] };

  for (const item of items) {
    groups[item.status].push(item);
  }

  return groups;
}

export function sumOfficeAmounts(items: Office[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

export function averageOfficeAmount(items: Office[]): number {
  return items.length === 0 ? 0 : sumOfficeAmounts(items) / items.length;
}

export function topByOfficeAmount(items: Office[], count: number): Office[] {
  return [...items].sort((first, second) => second.amount - first.amount).slice(0, Math.max(0, count));
}

export function filterOfficeByTag(items: Office[], tag: string): Office[] {
  const needle = tag.trim().toLowerCase();
  return items.filter((item) => item.tags.includes(needle));
}

export function uniqueOfficeTags(items: Office[]): string[] {
  const tags = new Set<string>();

  for (const item of items) {
    for (const tag of item.tags) {
      tags.add(tag);
    }
  }

  return [...tags].sort((first, second) => first.localeCompare(second));
}

export function paginateOffice(items: Office[], page: number, pageSize: number): Office[] {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.floor(pageSize));
  const start = (safePage - 1) * safeSize;

  return items.slice(start, start + safeSize);
}

export function chunkOffice(items: Office[], size: number): Office[][] {
  const safeSize = Math.max(1, Math.floor(size));
  const chunks: Office[][] = [];

  for (let index = 0; index < items.length; index += safeSize) {
    chunks.push(items.slice(index, index + safeSize));
  }

  return chunks;
}

export function summarizeOffice(items: Office[]): OfficeSummary {
  const groups = groupByOfficeStatus(items);

  return {
    total: items.length,
    active: groups.active.length,
    inactive: groups.inactive.length,
    archived: groups.archived.length,
    totalAmount: sumOfficeAmounts(items),
    averageAmount: averageOfficeAmount(items),
  };
}

export function formatOfficeAmount(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatOfficeDate(value: string, locale = 'en-US'): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsed);
}

export function daysSinceOfficeUpdate(item: Office, now: Date = new Date()): number {
  const updated = Date.parse(item.updatedAt);

  if (Number.isNaN(updated)) {
    return 0;
  }

  return Math.floor((now.getTime() - updated) / (24 * 60 * 60 * 1000));
}

export function findOfficeStale(items: Office[], maxAgeDays: number, now: Date = new Date()): Office[] {
  return items.filter((item) => daysSinceOfficeUpdate(item, now) > maxAgeDays);
}

function escapeCsvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toOfficeCsv(items: Office[]): string {
  const header = ['id', 'name', 'status', 'amount', 'tags'];
  const rows = items.map((item) =>
    [String(item.id), item.name, item.status, String(item.amount), item.tags.join('|')]
      .map(escapeCsvCell)
      .join(','),
  );

  return [header.join(','), ...rows].join('\n');
}
