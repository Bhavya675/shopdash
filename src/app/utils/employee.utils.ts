import { Employee, EmployeeStatus } from '../models/employee.model';

export interface EmployeeSummary {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  totalAmount: number;
  averageAmount: number;
}

export function groupByEmployeeStatus(items: Employee[]): Record<EmployeeStatus, Employee[]> {
  const groups: Record<EmployeeStatus, Employee[]> = { active: [], inactive: [], archived: [] };

  for (const item of items) {
    groups[item.status].push(item);
  }

  return groups;
}

export function sumEmployeeAmounts(items: Employee[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

export function averageEmployeeAmount(items: Employee[]): number {
  return items.length === 0 ? 0 : sumEmployeeAmounts(items) / items.length;
}

export function topByEmployeeAmount(items: Employee[], count: number): Employee[] {
  return [...items].sort((first, second) => second.amount - first.amount).slice(0, Math.max(0, count));
}

export function filterEmployeeByTag(items: Employee[], tag: string): Employee[] {
  const needle = tag.trim().toLowerCase();
  return items.filter((item) => item.tags.includes(needle));
}

export function uniqueEmployeeTags(items: Employee[]): string[] {
  const tags = new Set<string>();

  for (const item of items) {
    for (const tag of item.tags) {
      tags.add(tag);
    }
  }

  return [...tags].sort((first, second) => first.localeCompare(second));
}

export function paginateEmployee(items: Employee[], page: number, pageSize: number): Employee[] {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.floor(pageSize));
  const start = (safePage - 1) * safeSize;

  return items.slice(start, start + safeSize);
}

export function chunkEmployee(items: Employee[], size: number): Employee[][] {
  const safeSize = Math.max(1, Math.floor(size));
  const chunks: Employee[][] = [];

  for (let index = 0; index < items.length; index += safeSize) {
    chunks.push(items.slice(index, index + safeSize));
  }

  return chunks;
}

export function summarizeEmployee(items: Employee[]): EmployeeSummary {
  const groups = groupByEmployeeStatus(items);

  return {
    total: items.length,
    active: groups.active.length,
    inactive: groups.inactive.length,
    archived: groups.archived.length,
    totalAmount: sumEmployeeAmounts(items),
    averageAmount: averageEmployeeAmount(items),
  };
}

export function formatEmployeeAmount(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatEmployeeDate(value: string, locale = 'en-US'): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsed);
}

export function daysSinceEmployeeUpdate(item: Employee, now: Date = new Date()): number {
  const updated = Date.parse(item.updatedAt);

  if (Number.isNaN(updated)) {
    return 0;
  }

  return Math.floor((now.getTime() - updated) / (24 * 60 * 60 * 1000));
}

export function findEmployeeStale(items: Employee[], maxAgeDays: number, now: Date = new Date()): Employee[] {
  return items.filter((item) => daysSinceEmployeeUpdate(item, now) > maxAgeDays);
}

function escapeCsvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toEmployeeCsv(items: Employee[]): string {
  const header = ['id', 'name', 'status', 'amount', 'tags'];
  const rows = items.map((item) =>
    [String(item.id), item.name, item.status, String(item.amount), item.tags.join('|')]
      .map(escapeCsvCell)
      .join(','),
  );

  return [header.join(','), ...rows].join('\n');
}
