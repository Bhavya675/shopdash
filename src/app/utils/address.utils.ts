import { Address, AddressStatus } from '../models/address.model';

export interface AddressSummary {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  totalAmount: number;
  averageAmount: number;
}

export function groupByAddressStatus(items: Address[]): Record<AddressStatus, Address[]> {
  const groups: Record<AddressStatus, Address[]> = { active: [], inactive: [], archived: [] };

  for (const item of items) {
    groups[item.status].push(item);
  }

  return groups;
}

export function sumAddressAmounts(items: Address[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

export function averageAddressAmount(items: Address[]): number {
  return items.length === 0 ? 0 : sumAddressAmounts(items) / items.length;
}

export function topByAddressAmount(items: Address[], count: number): Address[] {
  return [...items].sort((first, second) => second.amount - first.amount).slice(0, Math.max(0, count));
}

export function filterAddressByTag(items: Address[], tag: string): Address[] {
  const needle = tag.trim().toLowerCase();
  return items.filter((item) => item.tags.includes(needle));
}

export function uniqueAddressTags(items: Address[]): string[] {
  const tags = new Set<string>();

  for (const item of items) {
    for (const tag of item.tags) {
      tags.add(tag);
    }
  }

  return [...tags].sort((first, second) => first.localeCompare(second));
}

export function paginateAddress(items: Address[], page: number, pageSize: number): Address[] {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.floor(pageSize));
  const start = (safePage - 1) * safeSize;

  return items.slice(start, start + safeSize);
}

export function chunkAddress(items: Address[], size: number): Address[][] {
  const safeSize = Math.max(1, Math.floor(size));
  const chunks: Address[][] = [];

  for (let index = 0; index < items.length; index += safeSize) {
    chunks.push(items.slice(index, index + safeSize));
  }

  return chunks;
}

export function summarizeAddress(items: Address[]): AddressSummary {
  const groups = groupByAddressStatus(items);

  return {
    total: items.length,
    active: groups.active.length,
    inactive: groups.inactive.length,
    archived: groups.archived.length,
    totalAmount: sumAddressAmounts(items),
    averageAmount: averageAddressAmount(items),
  };
}

export function formatAddressAmount(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatAddressDate(value: string, locale = 'en-US'): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsed);
}

export function daysSinceAddressUpdate(item: Address, now: Date = new Date()): number {
  const updated = Date.parse(item.updatedAt);

  if (Number.isNaN(updated)) {
    return 0;
  }

  return Math.floor((now.getTime() - updated) / (24 * 60 * 60 * 1000));
}

export function findAddressStale(items: Address[], maxAgeDays: number, now: Date = new Date()): Address[] {
  return items.filter((item) => daysSinceAddressUpdate(item, now) > maxAgeDays);
}

function escapeCsvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toAddressCsv(items: Address[]): string {
  const header = ['id', 'name', 'status', 'amount', 'tags'];
  const rows = items.map((item) =>
    [String(item.id), item.name, item.status, String(item.amount), item.tags.join('|')]
      .map(escapeCsvCell)
      .join(','),
  );

  return [header.join(','), ...rows].join('\n');
}
