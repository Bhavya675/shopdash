import { Schedule, ScheduleStatus } from '../models/schedule.model';

export interface ScheduleSummary {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  totalAmount: number;
  averageAmount: number;
}

export function groupByScheduleStatus(items: Schedule[]): Record<ScheduleStatus, Schedule[]> {
  const groups: Record<ScheduleStatus, Schedule[]> = { active: [], inactive: [], archived: [] };

  for (const item of items) {
    groups[item.status].push(item);
  }

  return groups;
}

export function sumScheduleAmounts(items: Schedule[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

export function averageScheduleAmount(items: Schedule[]): number {
  return items.length === 0 ? 0 : sumScheduleAmounts(items) / items.length;
}

export function topByScheduleAmount(items: Schedule[], count: number): Schedule[] {
  return [...items].sort((first, second) => second.amount - first.amount).slice(0, Math.max(0, count));
}

export function filterScheduleByTag(items: Schedule[], tag: string): Schedule[] {
  const needle = tag.trim().toLowerCase();
  return items.filter((item) => item.tags.includes(needle));
}

export function uniqueScheduleTags(items: Schedule[]): string[] {
  const tags = new Set<string>();

  for (const item of items) {
    for (const tag of item.tags) {
      tags.add(tag);
    }
  }

  return [...tags].sort((first, second) => first.localeCompare(second));
}

export function paginateSchedule(items: Schedule[], page: number, pageSize: number): Schedule[] {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.floor(pageSize));
  const start = (safePage - 1) * safeSize;

  return items.slice(start, start + safeSize);
}

export function chunkSchedule(items: Schedule[], size: number): Schedule[][] {
  const safeSize = Math.max(1, Math.floor(size));
  const chunks: Schedule[][] = [];

  for (let index = 0; index < items.length; index += safeSize) {
    chunks.push(items.slice(index, index + safeSize));
  }

  return chunks;
}

export function summarizeSchedule(items: Schedule[]): ScheduleSummary {
  const groups = groupByScheduleStatus(items);

  return {
    total: items.length,
    active: groups.active.length,
    inactive: groups.inactive.length,
    archived: groups.archived.length,
    totalAmount: sumScheduleAmounts(items),
    averageAmount: averageScheduleAmount(items),
  };
}

export function formatScheduleAmount(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatScheduleDate(value: string, locale = 'en-US'): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsed);
}

export function daysSinceScheduleUpdate(item: Schedule, now: Date = new Date()): number {
  const updated = Date.parse(item.updatedAt);

  if (Number.isNaN(updated)) {
    return 0;
  }

  return Math.floor((now.getTime() - updated) / (24 * 60 * 60 * 1000));
}

export function findScheduleStale(items: Schedule[], maxAgeDays: number, now: Date = new Date()): Schedule[] {
  return items.filter((item) => daysSinceScheduleUpdate(item, now) > maxAgeDays);
}

function escapeCsvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toScheduleCsv(items: Schedule[]): string {
  const header = ['id', 'name', 'status', 'amount', 'tags'];
  const rows = items.map((item) =>
    [String(item.id), item.name, item.status, String(item.amount), item.tags.join('|')]
      .map(escapeCsvCell)
      .join(','),
  );

  return [header.join(','), ...rows].join('\n');
}
