import { KnowledgeArticle, KnowledgeArticleStatus } from '../models/knowledge-article.model';

export interface KnowledgeArticleSummary {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  totalAmount: number;
  averageAmount: number;
}

export function groupByKnowledgeArticleStatus(items: KnowledgeArticle[]): Record<KnowledgeArticleStatus, KnowledgeArticle[]> {
  const groups: Record<KnowledgeArticleStatus, KnowledgeArticle[]> = { active: [], inactive: [], archived: [] };

  for (const item of items) {
    groups[item.status].push(item);
  }

  return groups;
}

export function sumKnowledgeArticleAmounts(items: KnowledgeArticle[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

export function averageKnowledgeArticleAmount(items: KnowledgeArticle[]): number {
  return items.length === 0 ? 0 : sumKnowledgeArticleAmounts(items) / items.length;
}

export function topByKnowledgeArticleAmount(items: KnowledgeArticle[], count: number): KnowledgeArticle[] {
  return [...items].sort((first, second) => second.amount - first.amount).slice(0, Math.max(0, count));
}

export function filterKnowledgeArticleByTag(items: KnowledgeArticle[], tag: string): KnowledgeArticle[] {
  const needle = tag.trim().toLowerCase();
  return items.filter((item) => item.tags.includes(needle));
}

export function uniqueKnowledgeArticleTags(items: KnowledgeArticle[]): string[] {
  const tags = new Set<string>();

  for (const item of items) {
    for (const tag of item.tags) {
      tags.add(tag);
    }
  }

  return [...tags].sort((first, second) => first.localeCompare(second));
}

export function paginateKnowledgeArticle(items: KnowledgeArticle[], page: number, pageSize: number): KnowledgeArticle[] {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.floor(pageSize));
  const start = (safePage - 1) * safeSize;

  return items.slice(start, start + safeSize);
}

export function chunkKnowledgeArticle(items: KnowledgeArticle[], size: number): KnowledgeArticle[][] {
  const safeSize = Math.max(1, Math.floor(size));
  const chunks: KnowledgeArticle[][] = [];

  for (let index = 0; index < items.length; index += safeSize) {
    chunks.push(items.slice(index, index + safeSize));
  }

  return chunks;
}

export function summarizeKnowledgeArticle(items: KnowledgeArticle[]): KnowledgeArticleSummary {
  const groups = groupByKnowledgeArticleStatus(items);

  return {
    total: items.length,
    active: groups.active.length,
    inactive: groups.inactive.length,
    archived: groups.archived.length,
    totalAmount: sumKnowledgeArticleAmounts(items),
    averageAmount: averageKnowledgeArticleAmount(items),
  };
}

export function formatKnowledgeArticleAmount(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatKnowledgeArticleDate(value: string, locale = 'en-US'): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsed);
}

export function daysSinceKnowledgeArticleUpdate(item: KnowledgeArticle, now: Date = new Date()): number {
  const updated = Date.parse(item.updatedAt);

  if (Number.isNaN(updated)) {
    return 0;
  }

  return Math.floor((now.getTime() - updated) / (24 * 60 * 60 * 1000));
}

export function findKnowledgeArticleStale(items: KnowledgeArticle[], maxAgeDays: number, now: Date = new Date()): KnowledgeArticle[] {
  return items.filter((item) => daysSinceKnowledgeArticleUpdate(item, now) > maxAgeDays);
}

function escapeCsvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toKnowledgeArticleCsv(items: KnowledgeArticle[]): string {
  const header = ['id', 'name', 'status', 'amount', 'tags'];
  const rows = items.map((item) =>
    [String(item.id), item.name, item.status, String(item.amount), item.tags.join('|')]
      .map(escapeCsvCell)
      .join(','),
  );

  return [header.join(','), ...rows].join('\n');
}
