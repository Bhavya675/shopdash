import { Partner, PartnerStatus } from '../models/partner.model';

export interface PartnerSummary {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  totalAmount: number;
  averageAmount: number;
}

export function groupByPartnerStatus(items: Partner[]): Record<PartnerStatus, Partner[]> {
  const groups: Record<PartnerStatus, Partner[]> = { active: [], inactive: [], archived: [] };

  for (const item of items) {
    groups[item.status].push(item);
  }

  return groups;
}

export function sumPartnerAmounts(items: Partner[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

export function averagePartnerAmount(items: Partner[]): number {
  return items.length === 0 ? 0 : sumPartnerAmounts(items) / items.length;
}

export function topByPartnerAmount(items: Partner[], count: number): Partner[] {
  return [...items].sort((first, second) => second.amount - first.amount).slice(0, Math.max(0, count));
}

export function filterPartnerByTag(items: Partner[], tag: string): Partner[] {
  const needle = tag.trim().toLowerCase();
  return items.filter((item) => item.tags.includes(needle));
}

export function uniquePartnerTags(items: Partner[]): string[] {
  const tags = new Set<string>();

  for (const item of items) {
    for (const tag of item.tags) {
      tags.add(tag);
    }
  }

  return [...tags].sort((first, second) => first.localeCompare(second));
}

export function paginatePartner(items: Partner[], page: number, pageSize: number): Partner[] {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.floor(pageSize));
  const start = (safePage - 1) * safeSize;

  return items.slice(start, start + safeSize);
}

export function chunkPartner(items: Partner[], size: number): Partner[][] {
  const safeSize = Math.max(1, Math.floor(size));
  const chunks: Partner[][] = [];

  for (let index = 0; index < items.length; index += safeSize) {
    chunks.push(items.slice(index, index + safeSize));
  }

  return chunks;
}

export function summarizePartner(items: Partner[]): PartnerSummary {
  const groups = groupByPartnerStatus(items);

  return {
    total: items.length,
    active: groups.active.length,
    inactive: groups.inactive.length,
    archived: groups.archived.length,
    totalAmount: sumPartnerAmounts(items),
    averageAmount: averagePartnerAmount(items),
  };
}

export function formatPartnerAmount(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatPartnerDate(value: string, locale = 'en-US'): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsed);
}

export function daysSincePartnerUpdate(item: Partner, now: Date = new Date()): number {
  const updated = Date.parse(item.updatedAt);

  if (Number.isNaN(updated)) {
    return 0;
  }

  return Math.floor((now.getTime() - updated) / (24 * 60 * 60 * 1000));
}

export function findPartnerStale(items: Partner[], maxAgeDays: number, now: Date = new Date()): Partner[] {
  return items.filter((item) => daysSincePartnerUpdate(item, now) > maxAgeDays);
}

function escapeCsvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toPartnerCsv(items: Partner[]): string {
  const header = ['id', 'name', 'status', 'amount', 'tags'];
  const rows = items.map((item) =>
    [String(item.id), item.name, item.status, String(item.amount), item.tags.join('|')]
      .map(escapeCsvCell)
      .join(','),
  );

  return [header.join(','), ...rows].join('\n');
}
