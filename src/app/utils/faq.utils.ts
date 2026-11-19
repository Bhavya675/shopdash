import { Faq, FaqStatus } from '../models/faq.model';

export interface FaqSummary {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  totalAmount: number;
  averageAmount: number;
}

export function groupByFaqStatus(items: Faq[]): Record<FaqStatus, Faq[]> {
  const groups: Record<FaqStatus, Faq[]> = { active: [], inactive: [], archived: [] };

  for (const item of items) {
    groups[item.status].push(item);
  }

  return groups;
}

export function sumFaqAmounts(items: Faq[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

export function averageFaqAmount(items: Faq[]): number {
  return items.length === 0 ? 0 : sumFaqAmounts(items) / items.length;
}

export function topByFaqAmount(items: Faq[], count: number): Faq[] {
  return [...items].sort((first, second) => second.amount - first.amount).slice(0, Math.max(0, count));
}

export function filterFaqByTag(items: Faq[], tag: string): Faq[] {
  const needle = tag.trim().toLowerCase();
  return items.filter((item) => item.tags.includes(needle));
}

export function uniqueFaqTags(items: Faq[]): string[] {
  const tags = new Set<string>();

  for (const item of items) {
    for (const tag of item.tags) {
      tags.add(tag);
    }
  }

  return [...tags].sort((first, second) => first.localeCompare(second));
}

export function paginateFaq(items: Faq[], page: number, pageSize: number): Faq[] {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.floor(pageSize));
  const start = (safePage - 1) * safeSize;

  return items.slice(start, start + safeSize);
}

export function chunkFaq(items: Faq[], size: number): Faq[][] {
  const safeSize = Math.max(1, Math.floor(size));
  const chunks: Faq[][] = [];

  for (let index = 0; index < items.length; index += safeSize) {
    chunks.push(items.slice(index, index + safeSize));
  }

  return chunks;
}

export function summarizeFaq(items: Faq[]): FaqSummary {
  const groups = groupByFaqStatus(items);

  return {
    total: items.length,
    active: groups.active.length,
    inactive: groups.inactive.length,
    archived: groups.archived.length,
    totalAmount: sumFaqAmounts(items),
    averageAmount: averageFaqAmount(items),
  };
}

export function formatFaqAmount(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatFaqDate(value: string, locale = 'en-US'): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsed);
}

export function daysSinceFaqUpdate(item: Faq, now: Date = new Date()): number {
  const updated = Date.parse(item.updatedAt);

  if (Number.isNaN(updated)) {
    return 0;
  }

  return Math.floor((now.getTime() - updated) / (24 * 60 * 60 * 1000));
}

export function findFaqStale(items: Faq[], maxAgeDays: number, now: Date = new Date()): Faq[] {
  return items.filter((item) => daysSinceFaqUpdate(item, now) > maxAgeDays);
}

function escapeCsvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toFaqCsv(items: Faq[]): string {
  const header = ['id', 'name', 'status', 'amount', 'tags'];
  const rows = items.map((item) =>
    [String(item.id), item.name, item.status, String(item.amount), item.tags.join('|')]
      .map(escapeCsvCell)
      .join(','),
  );

  return [header.join(','), ...rows].join('\n');
}
