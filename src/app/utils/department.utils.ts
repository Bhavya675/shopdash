import { Department, DepartmentStatus } from '../models/department.model';

export interface DepartmentSummary {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  totalAmount: number;
  averageAmount: number;
}

export function groupByDepartmentStatus(items: Department[]): Record<DepartmentStatus, Department[]> {
  const groups: Record<DepartmentStatus, Department[]> = { active: [], inactive: [], archived: [] };

  for (const item of items) {
    groups[item.status].push(item);
  }

  return groups;
}

export function sumDepartmentAmounts(items: Department[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

export function averageDepartmentAmount(items: Department[]): number {
  return items.length === 0 ? 0 : sumDepartmentAmounts(items) / items.length;
}

export function topByDepartmentAmount(items: Department[], count: number): Department[] {
  return [...items].sort((first, second) => second.amount - first.amount).slice(0, Math.max(0, count));
}

export function filterDepartmentByTag(items: Department[], tag: string): Department[] {
  const needle = tag.trim().toLowerCase();
  return items.filter((item) => item.tags.includes(needle));
}

export function uniqueDepartmentTags(items: Department[]): string[] {
  const tags = new Set<string>();

  for (const item of items) {
    for (const tag of item.tags) {
      tags.add(tag);
    }
  }

  return [...tags].sort((first, second) => first.localeCompare(second));
}

export function paginateDepartment(items: Department[], page: number, pageSize: number): Department[] {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.floor(pageSize));
  const start = (safePage - 1) * safeSize;

  return items.slice(start, start + safeSize);
}

export function chunkDepartment(items: Department[], size: number): Department[][] {
  const safeSize = Math.max(1, Math.floor(size));
  const chunks: Department[][] = [];

  for (let index = 0; index < items.length; index += safeSize) {
    chunks.push(items.slice(index, index + safeSize));
  }

  return chunks;
}

export function summarizeDepartment(items: Department[]): DepartmentSummary {
  const groups = groupByDepartmentStatus(items);

  return {
    total: items.length,
    active: groups.active.length,
    inactive: groups.inactive.length,
    archived: groups.archived.length,
    totalAmount: sumDepartmentAmounts(items),
    averageAmount: averageDepartmentAmount(items),
  };
}

export function formatDepartmentAmount(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatDepartmentDate(value: string, locale = 'en-US'): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsed);
}

export function daysSinceDepartmentUpdate(item: Department, now: Date = new Date()): number {
  const updated = Date.parse(item.updatedAt);

  if (Number.isNaN(updated)) {
    return 0;
  }

  return Math.floor((now.getTime() - updated) / (24 * 60 * 60 * 1000));
}

export function findDepartmentStale(items: Department[], maxAgeDays: number, now: Date = new Date()): Department[] {
  return items.filter((item) => daysSinceDepartmentUpdate(item, now) > maxAgeDays);
}

function escapeCsvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toDepartmentCsv(items: Department[]): string {
  const header = ['id', 'name', 'status', 'amount', 'tags'];
  const rows = items.map((item) =>
    [String(item.id), item.name, item.status, String(item.amount), item.tags.join('|')]
      .map(escapeCsvCell)
      .join(','),
  );

  return [header.join(','), ...rows].join('\n');
}
