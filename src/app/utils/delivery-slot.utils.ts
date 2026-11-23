import { DeliverySlot, DeliverySlotStatus } from '../models/delivery-slot.model';

export interface DeliverySlotSummary {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  totalAmount: number;
  averageAmount: number;
}

export function groupByDeliverySlotStatus(items: DeliverySlot[]): Record<DeliverySlotStatus, DeliverySlot[]> {
  const groups: Record<DeliverySlotStatus, DeliverySlot[]> = { active: [], inactive: [], archived: [] };

  for (const item of items) {
    groups[item.status].push(item);
  }

  return groups;
}

export function sumDeliverySlotAmounts(items: DeliverySlot[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

export function averageDeliverySlotAmount(items: DeliverySlot[]): number {
  return items.length === 0 ? 0 : sumDeliverySlotAmounts(items) / items.length;
}

export function topByDeliverySlotAmount(items: DeliverySlot[], count: number): DeliverySlot[] {
  return [...items].sort((first, second) => second.amount - first.amount).slice(0, Math.max(0, count));
}

export function filterDeliverySlotByTag(items: DeliverySlot[], tag: string): DeliverySlot[] {
  const needle = tag.trim().toLowerCase();
  return items.filter((item) => item.tags.includes(needle));
}

export function uniqueDeliverySlotTags(items: DeliverySlot[]): string[] {
  const tags = new Set<string>();

  for (const item of items) {
    for (const tag of item.tags) {
      tags.add(tag);
    }
  }

  return [...tags].sort((first, second) => first.localeCompare(second));
}

export function paginateDeliverySlot(items: DeliverySlot[], page: number, pageSize: number): DeliverySlot[] {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.floor(pageSize));
  const start = (safePage - 1) * safeSize;

  return items.slice(start, start + safeSize);
}

export function chunkDeliverySlot(items: DeliverySlot[], size: number): DeliverySlot[][] {
  const safeSize = Math.max(1, Math.floor(size));
  const chunks: DeliverySlot[][] = [];

  for (let index = 0; index < items.length; index += safeSize) {
    chunks.push(items.slice(index, index + safeSize));
  }

  return chunks;
}

export function summarizeDeliverySlot(items: DeliverySlot[]): DeliverySlotSummary {
  const groups = groupByDeliverySlotStatus(items);

  return {
    total: items.length,
    active: groups.active.length,
    inactive: groups.inactive.length,
    archived: groups.archived.length,
    totalAmount: sumDeliverySlotAmounts(items),
    averageAmount: averageDeliverySlotAmount(items),
  };
}

export function formatDeliverySlotAmount(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatDeliverySlotDate(value: string, locale = 'en-US'): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsed);
}

export function daysSinceDeliverySlotUpdate(item: DeliverySlot, now: Date = new Date()): number {
  const updated = Date.parse(item.updatedAt);

  if (Number.isNaN(updated)) {
    return 0;
  }

  return Math.floor((now.getTime() - updated) / (24 * 60 * 60 * 1000));
}

export function findDeliverySlotStale(items: DeliverySlot[], maxAgeDays: number, now: Date = new Date()): DeliverySlot[] {
  return items.filter((item) => daysSinceDeliverySlotUpdate(item, now) > maxAgeDays);
}

function escapeCsvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toDeliverySlotCsv(items: DeliverySlot[]): string {
  const header = ['id', 'name', 'status', 'amount', 'tags'];
  const rows = items.map((item) =>
    [String(item.id), item.name, item.status, String(item.amount), item.tags.join('|')]
      .map(escapeCsvCell)
      .join(','),
  );

  return [header.join(','), ...rows].join('\n');
}
