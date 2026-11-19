import { Holiday, HolidayStatus } from '../models/holiday.model';

export interface HolidaySummary {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  totalAmount: number;
  averageAmount: number;
}

export function groupByHolidayStatus(items: Holiday[]): Record<HolidayStatus, Holiday[]> {
  const groups: Record<HolidayStatus, Holiday[]> = { active: [], inactive: [], archived: [] };

  for (const item of items) {
    groups[item.status].push(item);
  }

  return groups;
}

export function sumHolidayAmounts(items: Holiday[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

export function averageHolidayAmount(items: Holiday[]): number {
  return items.length === 0 ? 0 : sumHolidayAmounts(items) / items.length;
}

export function topByHolidayAmount(items: Holiday[], count: number): Holiday[] {
  return [...items].sort((first, second) => second.amount - first.amount).slice(0, Math.max(0, count));
}

export function filterHolidayByTag(items: Holiday[], tag: string): Holiday[] {
  const needle = tag.trim().toLowerCase();
  return items.filter((item) => item.tags.includes(needle));
}

export function uniqueHolidayTags(items: Holiday[]): string[] {
  const tags = new Set<string>();

  for (const item of items) {
    for (const tag of item.tags) {
      tags.add(tag);
    }
  }

  return [...tags].sort((first, second) => first.localeCompare(second));
}

export function paginateHoliday(items: Holiday[], page: number, pageSize: number): Holiday[] {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.floor(pageSize));
  const start = (safePage - 1) * safeSize;

  return items.slice(start, start + safeSize);
}

export function chunkHoliday(items: Holiday[], size: number): Holiday[][] {
  const safeSize = Math.max(1, Math.floor(size));
  const chunks: Holiday[][] = [];

  for (let index = 0; index < items.length; index += safeSize) {
    chunks.push(items.slice(index, index + safeSize));
  }

  return chunks;
}

export function summarizeHoliday(items: Holiday[]): HolidaySummary {
  const groups = groupByHolidayStatus(items);

  return {
    total: items.length,
    active: groups.active.length,
    inactive: groups.inactive.length,
    archived: groups.archived.length,
    totalAmount: sumHolidayAmounts(items),
    averageAmount: averageHolidayAmount(items),
  };
}

export function formatHolidayAmount(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatHolidayDate(value: string, locale = 'en-US'): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsed);
}

export function daysSinceHolidayUpdate(item: Holiday, now: Date = new Date()): number {
  const updated = Date.parse(item.updatedAt);

  if (Number.isNaN(updated)) {
    return 0;
  }

  return Math.floor((now.getTime() - updated) / (24 * 60 * 60 * 1000));
}

export function findHolidayStale(items: Holiday[], maxAgeDays: number, now: Date = new Date()): Holiday[] {
  return items.filter((item) => daysSinceHolidayUpdate(item, now) > maxAgeDays);
}

function escapeCsvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toHolidayCsv(items: Holiday[]): string {
  const header = ['id', 'name', 'status', 'amount', 'tags'];
  const rows = items.map((item) =>
    [String(item.id), item.name, item.status, String(item.amount), item.tags.join('|')]
      .map(escapeCsvCell)
      .join(','),
  );

  return [header.join(','), ...rows].join('\n');
}
