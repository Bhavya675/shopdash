import { Shift, ShiftStatus } from '../models/shift.model';

export interface ShiftSummary {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  totalAmount: number;
  averageAmount: number;
}

export function groupByShiftStatus(items: Shift[]): Record<ShiftStatus, Shift[]> {
  const groups: Record<ShiftStatus, Shift[]> = { active: [], inactive: [], archived: [] };

  for (const item of items) {
    groups[item.status].push(item);
  }

  return groups;
}

export function sumShiftAmounts(items: Shift[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

export function averageShiftAmount(items: Shift[]): number {
  return items.length === 0 ? 0 : sumShiftAmounts(items) / items.length;
}

export function topByShiftAmount(items: Shift[], count: number): Shift[] {
  return [...items].sort((first, second) => second.amount - first.amount).slice(0, Math.max(0, count));
}

export function filterShiftByTag(items: Shift[], tag: string): Shift[] {
  const needle = tag.trim().toLowerCase();
  return items.filter((item) => item.tags.includes(needle));
}

export function uniqueShiftTags(items: Shift[]): string[] {
  const tags = new Set<string>();

  for (const item of items) {
    for (const tag of item.tags) {
      tags.add(tag);
    }
  }

  return [...tags].sort((first, second) => first.localeCompare(second));
}

export function paginateShift(items: Shift[], page: number, pageSize: number): Shift[] {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.floor(pageSize));
  const start = (safePage - 1) * safeSize;

  return items.slice(start, start + safeSize);
}

export function chunkShift(items: Shift[], size: number): Shift[][] {
  const safeSize = Math.max(1, Math.floor(size));
  const chunks: Shift[][] = [];

  for (let index = 0; index < items.length; index += safeSize) {
    chunks.push(items.slice(index, index + safeSize));
  }

  return chunks;
}

export function summarizeShift(items: Shift[]): ShiftSummary {
  const groups = groupByShiftStatus(items);

  return {
    total: items.length,
    active: groups.active.length,
    inactive: groups.inactive.length,
    archived: groups.archived.length,
    totalAmount: sumShiftAmounts(items),
    averageAmount: averageShiftAmount(items),
  };
}

export function formatShiftAmount(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatShiftDate(value: string, locale = 'en-US'): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsed);
}

export function daysSinceShiftUpdate(item: Shift, now: Date = new Date()): number {
  const updated = Date.parse(item.updatedAt);

  if (Number.isNaN(updated)) {
    return 0;
  }

  return Math.floor((now.getTime() - updated) / (24 * 60 * 60 * 1000));
}

export function findShiftStale(items: Shift[], maxAgeDays: number, now: Date = new Date()): Shift[] {
  return items.filter((item) => daysSinceShiftUpdate(item, now) > maxAgeDays);
}

function escapeCsvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toShiftCsv(items: Shift[]): string {
  const header = ['id', 'name', 'status', 'amount', 'tags'];
  const rows = items.map((item) =>
    [String(item.id), item.name, item.status, String(item.amount), item.tags.join('|')]
      .map(escapeCsvCell)
      .join(','),
  );

  return [header.join(','), ...rows].join('\n');
}
