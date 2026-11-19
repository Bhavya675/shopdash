import { Newsletter, NewsletterStatus } from '../models/newsletter.model';

export interface NewsletterSummary {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  totalAmount: number;
  averageAmount: number;
}

export function groupByNewsletterStatus(items: Newsletter[]): Record<NewsletterStatus, Newsletter[]> {
  const groups: Record<NewsletterStatus, Newsletter[]> = { active: [], inactive: [], archived: [] };

  for (const item of items) {
    groups[item.status].push(item);
  }

  return groups;
}

export function sumNewsletterAmounts(items: Newsletter[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

export function averageNewsletterAmount(items: Newsletter[]): number {
  return items.length === 0 ? 0 : sumNewsletterAmounts(items) / items.length;
}

export function topByNewsletterAmount(items: Newsletter[], count: number): Newsletter[] {
  return [...items].sort((first, second) => second.amount - first.amount).slice(0, Math.max(0, count));
}

export function filterNewsletterByTag(items: Newsletter[], tag: string): Newsletter[] {
  const needle = tag.trim().toLowerCase();
  return items.filter((item) => item.tags.includes(needle));
}

export function uniqueNewsletterTags(items: Newsletter[]): string[] {
  const tags = new Set<string>();

  for (const item of items) {
    for (const tag of item.tags) {
      tags.add(tag);
    }
  }

  return [...tags].sort((first, second) => first.localeCompare(second));
}

export function paginateNewsletter(items: Newsletter[], page: number, pageSize: number): Newsletter[] {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.floor(pageSize));
  const start = (safePage - 1) * safeSize;

  return items.slice(start, start + safeSize);
}

export function chunkNewsletter(items: Newsletter[], size: number): Newsletter[][] {
  const safeSize = Math.max(1, Math.floor(size));
  const chunks: Newsletter[][] = [];

  for (let index = 0; index < items.length; index += safeSize) {
    chunks.push(items.slice(index, index + safeSize));
  }

  return chunks;
}

export function summarizeNewsletter(items: Newsletter[]): NewsletterSummary {
  const groups = groupByNewsletterStatus(items);

  return {
    total: items.length,
    active: groups.active.length,
    inactive: groups.inactive.length,
    archived: groups.archived.length,
    totalAmount: sumNewsletterAmounts(items),
    averageAmount: averageNewsletterAmount(items),
  };
}

export function formatNewsletterAmount(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatNewsletterDate(value: string, locale = 'en-US'): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsed);
}

export function daysSinceNewsletterUpdate(item: Newsletter, now: Date = new Date()): number {
  const updated = Date.parse(item.updatedAt);

  if (Number.isNaN(updated)) {
    return 0;
  }

  return Math.floor((now.getTime() - updated) / (24 * 60 * 60 * 1000));
}

export function findNewsletterStale(items: Newsletter[], maxAgeDays: number, now: Date = new Date()): Newsletter[] {
  return items.filter((item) => daysSinceNewsletterUpdate(item, now) > maxAgeDays);
}

function escapeCsvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toNewsletterCsv(items: Newsletter[]): string {
  const header = ['id', 'name', 'status', 'amount', 'tags'];
  const rows = items.map((item) =>
    [String(item.id), item.name, item.status, String(item.amount), item.tags.join('|')]
      .map(escapeCsvCell)
      .join(','),
  );

  return [header.join(','), ...rows].join('\n');
}
