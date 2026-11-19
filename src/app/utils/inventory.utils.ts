import { Inventory, InventoryStatus } from '../models/inventory.model';

export interface InventorySummary {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  totalAmount: number;
  averageAmount: number;
}

export function groupByInventoryStatus(items: Inventory[]): Record<InventoryStatus, Inventory[]> {
  const groups: Record<InventoryStatus, Inventory[]> = { active: [], inactive: [], archived: [] };

  for (const item of items) {
    groups[item.status].push(item);
  }

  return groups;
}

export function sumInventoryAmounts(items: Inventory[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

export function averageInventoryAmount(items: Inventory[]): number {
  return items.length === 0 ? 0 : sumInventoryAmounts(items) / items.length;
}

export function topByInventoryAmount(items: Inventory[], count: number): Inventory[] {
  return [...items].sort((first, second) => second.amount - first.amount).slice(0, Math.max(0, count));
}

export function filterInventoryByTag(items: Inventory[], tag: string): Inventory[] {
  const needle = tag.trim().toLowerCase();
  return items.filter((item) => item.tags.includes(needle));
}

export function uniqueInventoryTags(items: Inventory[]): string[] {
  const tags = new Set<string>();

  for (const item of items) {
    for (const tag of item.tags) {
      tags.add(tag);
    }
  }

  return [...tags].sort((first, second) => first.localeCompare(second));
}

export function paginateInventory(items: Inventory[], page: number, pageSize: number): Inventory[] {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.floor(pageSize));
  const start = (safePage - 1) * safeSize;

  return items.slice(start, start + safeSize);
}

export function chunkInventory(items: Inventory[], size: number): Inventory[][] {
  const safeSize = Math.max(1, Math.floor(size));
  const chunks: Inventory[][] = [];

  for (let index = 0; index < items.length; index += safeSize) {
    chunks.push(items.slice(index, index + safeSize));
  }

  return chunks;
}

export function summarizeInventory(items: Inventory[]): InventorySummary {
  const groups = groupByInventoryStatus(items);

  return {
    total: items.length,
    active: groups.active.length,
    inactive: groups.inactive.length,
    archived: groups.archived.length,
    totalAmount: sumInventoryAmounts(items),
    averageAmount: averageInventoryAmount(items),
  };
}

export function formatInventoryAmount(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatInventoryDate(value: string, locale = 'en-US'): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsed);
}

export function daysSinceInventoryUpdate(item: Inventory, now: Date = new Date()): number {
  const updated = Date.parse(item.updatedAt);

  if (Number.isNaN(updated)) {
    return 0;
  }

  return Math.floor((now.getTime() - updated) / (24 * 60 * 60 * 1000));
}

export function findInventoryStale(items: Inventory[], maxAgeDays: number, now: Date = new Date()): Inventory[] {
  return items.filter((item) => daysSinceInventoryUpdate(item, now) > maxAgeDays);
}

function escapeCsvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toInventoryCsv(items: Inventory[]): string {
  const header = ['id', 'name', 'status', 'amount', 'tags'];
  const rows = items.map((item) =>
    [String(item.id), item.name, item.status, String(item.amount), item.tags.join('|')]
      .map(escapeCsvCell)
      .join(','),
  );

  return [header.join(','), ...rows].join('\n');
}
