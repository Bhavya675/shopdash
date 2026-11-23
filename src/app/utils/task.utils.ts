import { Task, TaskStatus } from '../models/task.model';

export interface TaskSummary {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  totalAmount: number;
  averageAmount: number;
}

export function groupByTaskStatus(items: Task[]): Record<TaskStatus, Task[]> {
  const groups: Record<TaskStatus, Task[]> = { active: [], inactive: [], archived: [] };

  for (const item of items) {
    groups[item.status].push(item);
  }

  return groups;
}

export function sumTaskAmounts(items: Task[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

export function averageTaskAmount(items: Task[]): number {
  return items.length === 0 ? 0 : sumTaskAmounts(items) / items.length;
}

export function topByTaskAmount(items: Task[], count: number): Task[] {
  return [...items].sort((first, second) => second.amount - first.amount).slice(0, Math.max(0, count));
}

export function filterTaskByTag(items: Task[], tag: string): Task[] {
  const needle = tag.trim().toLowerCase();
  return items.filter((item) => item.tags.includes(needle));
}

export function uniqueTaskTags(items: Task[]): string[] {
  const tags = new Set<string>();

  for (const item of items) {
    for (const tag of item.tags) {
      tags.add(tag);
    }
  }

  return [...tags].sort((first, second) => first.localeCompare(second));
}

export function paginateTask(items: Task[], page: number, pageSize: number): Task[] {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.floor(pageSize));
  const start = (safePage - 1) * safeSize;

  return items.slice(start, start + safeSize);
}

export function chunkTask(items: Task[], size: number): Task[][] {
  const safeSize = Math.max(1, Math.floor(size));
  const chunks: Task[][] = [];

  for (let index = 0; index < items.length; index += safeSize) {
    chunks.push(items.slice(index, index + safeSize));
  }

  return chunks;
}

export function summarizeTask(items: Task[]): TaskSummary {
  const groups = groupByTaskStatus(items);

  return {
    total: items.length,
    active: groups.active.length,
    inactive: groups.inactive.length,
    archived: groups.archived.length,
    totalAmount: sumTaskAmounts(items),
    averageAmount: averageTaskAmount(items),
  };
}

export function formatTaskAmount(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatTaskDate(value: string, locale = 'en-US'): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsed);
}

export function daysSinceTaskUpdate(item: Task, now: Date = new Date()): number {
  const updated = Date.parse(item.updatedAt);

  if (Number.isNaN(updated)) {
    return 0;
  }

  return Math.floor((now.getTime() - updated) / (24 * 60 * 60 * 1000));
}

export function findTaskStale(items: Task[], maxAgeDays: number, now: Date = new Date()): Task[] {
  return items.filter((item) => daysSinceTaskUpdate(item, now) > maxAgeDays);
}

function escapeCsvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toTaskCsv(items: Task[]): string {
  const header = ['id', 'name', 'status', 'amount', 'tags'];
  const rows = items.map((item) =>
    [String(item.id), item.name, item.status, String(item.amount), item.tags.join('|')]
      .map(escapeCsvCell)
      .join(','),
  );

  return [header.join(','), ...rows].join('\n');
}
