import { Notification, NotificationStatus } from '../models/notification.model';

export interface NotificationSummary {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  totalAmount: number;
  averageAmount: number;
}

export function groupByNotificationStatus(items: Notification[]): Record<NotificationStatus, Notification[]> {
  const groups: Record<NotificationStatus, Notification[]> = { active: [], inactive: [], archived: [] };

  for (const item of items) {
    groups[item.status].push(item);
  }

  return groups;
}

export function sumNotificationAmounts(items: Notification[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

export function averageNotificationAmount(items: Notification[]): number {
  return items.length === 0 ? 0 : sumNotificationAmounts(items) / items.length;
}

export function topByNotificationAmount(items: Notification[], count: number): Notification[] {
  return [...items].sort((first, second) => second.amount - first.amount).slice(0, Math.max(0, count));
}

export function filterNotificationByTag(items: Notification[], tag: string): Notification[] {
  const needle = tag.trim().toLowerCase();
  return items.filter((item) => item.tags.includes(needle));
}

export function uniqueNotificationTags(items: Notification[]): string[] {
  const tags = new Set<string>();

  for (const item of items) {
    for (const tag of item.tags) {
      tags.add(tag);
    }
  }

  return [...tags].sort((first, second) => first.localeCompare(second));
}

export function paginateNotification(items: Notification[], page: number, pageSize: number): Notification[] {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.floor(pageSize));
  const start = (safePage - 1) * safeSize;

  return items.slice(start, start + safeSize);
}

export function chunkNotification(items: Notification[], size: number): Notification[][] {
  const safeSize = Math.max(1, Math.floor(size));
  const chunks: Notification[][] = [];

  for (let index = 0; index < items.length; index += safeSize) {
    chunks.push(items.slice(index, index + safeSize));
  }

  return chunks;
}

export function summarizeNotification(items: Notification[]): NotificationSummary {
  const groups = groupByNotificationStatus(items);

  return {
    total: items.length,
    active: groups.active.length,
    inactive: groups.inactive.length,
    archived: groups.archived.length,
    totalAmount: sumNotificationAmounts(items),
    averageAmount: averageNotificationAmount(items),
  };
}

export function formatNotificationAmount(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatNotificationDate(value: string, locale = 'en-US'): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsed);
}

export function daysSinceNotificationUpdate(item: Notification, now: Date = new Date()): number {
  const updated = Date.parse(item.updatedAt);

  if (Number.isNaN(updated)) {
    return 0;
  }

  return Math.floor((now.getTime() - updated) / (24 * 60 * 60 * 1000));
}

export function findNotificationStale(items: Notification[], maxAgeDays: number, now: Date = new Date()): Notification[] {
  return items.filter((item) => daysSinceNotificationUpdate(item, now) > maxAgeDays);
}

function escapeCsvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toNotificationCsv(items: Notification[]): string {
  const header = ['id', 'name', 'status', 'amount', 'tags'];
  const rows = items.map((item) =>
    [String(item.id), item.name, item.status, String(item.amount), item.tags.join('|')]
      .map(escapeCsvCell)
      .join(','),
  );

  return [header.join(','), ...rows].join('\n');
}
