import { QuoteRequest, QuoteRequestStatus } from '../models/quote-request.model';

export interface QuoteRequestSummary {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  totalAmount: number;
  averageAmount: number;
}

export function groupByQuoteRequestStatus(items: QuoteRequest[]): Record<QuoteRequestStatus, QuoteRequest[]> {
  const groups: Record<QuoteRequestStatus, QuoteRequest[]> = { active: [], inactive: [], archived: [] };

  for (const item of items) {
    groups[item.status].push(item);
  }

  return groups;
}

export function sumQuoteRequestAmounts(items: QuoteRequest[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

export function averageQuoteRequestAmount(items: QuoteRequest[]): number {
  return items.length === 0 ? 0 : sumQuoteRequestAmounts(items) / items.length;
}

export function topByQuoteRequestAmount(items: QuoteRequest[], count: number): QuoteRequest[] {
  return [...items].sort((first, second) => second.amount - first.amount).slice(0, Math.max(0, count));
}

export function filterQuoteRequestByTag(items: QuoteRequest[], tag: string): QuoteRequest[] {
  const needle = tag.trim().toLowerCase();
  return items.filter((item) => item.tags.includes(needle));
}

export function uniqueQuoteRequestTags(items: QuoteRequest[]): string[] {
  const tags = new Set<string>();

  for (const item of items) {
    for (const tag of item.tags) {
      tags.add(tag);
    }
  }

  return [...tags].sort((first, second) => first.localeCompare(second));
}

export function paginateQuoteRequest(items: QuoteRequest[], page: number, pageSize: number): QuoteRequest[] {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.floor(pageSize));
  const start = (safePage - 1) * safeSize;

  return items.slice(start, start + safeSize);
}

export function chunkQuoteRequest(items: QuoteRequest[], size: number): QuoteRequest[][] {
  const safeSize = Math.max(1, Math.floor(size));
  const chunks: QuoteRequest[][] = [];

  for (let index = 0; index < items.length; index += safeSize) {
    chunks.push(items.slice(index, index + safeSize));
  }

  return chunks;
}

export function summarizeQuoteRequest(items: QuoteRequest[]): QuoteRequestSummary {
  const groups = groupByQuoteRequestStatus(items);

  return {
    total: items.length,
    active: groups.active.length,
    inactive: groups.inactive.length,
    archived: groups.archived.length,
    totalAmount: sumQuoteRequestAmounts(items),
    averageAmount: averageQuoteRequestAmount(items),
  };
}

export function formatQuoteRequestAmount(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatQuoteRequestDate(value: string, locale = 'en-US'): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsed);
}

export function daysSinceQuoteRequestUpdate(item: QuoteRequest, now: Date = new Date()): number {
  const updated = Date.parse(item.updatedAt);

  if (Number.isNaN(updated)) {
    return 0;
  }

  return Math.floor((now.getTime() - updated) / (24 * 60 * 60 * 1000));
}

export function findQuoteRequestStale(items: QuoteRequest[], maxAgeDays: number, now: Date = new Date()): QuoteRequest[] {
  return items.filter((item) => daysSinceQuoteRequestUpdate(item, now) > maxAgeDays);
}

function escapeCsvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toQuoteRequestCsv(items: QuoteRequest[]): string {
  const header = ['id', 'name', 'status', 'amount', 'tags'];
  const rows = items.map((item) =>
    [String(item.id), item.name, item.status, String(item.amount), item.tags.join('|')]
      .map(escapeCsvCell)
      .join(','),
  );

  return [header.join(','), ...rows].join('\n');
}
