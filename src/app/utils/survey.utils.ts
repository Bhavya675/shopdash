import { Survey, SurveyStatus } from '../models/survey.model';

export interface SurveySummary {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  totalAmount: number;
  averageAmount: number;
}

export function groupBySurveyStatus(items: Survey[]): Record<SurveyStatus, Survey[]> {
  const groups: Record<SurveyStatus, Survey[]> = { active: [], inactive: [], archived: [] };

  for (const item of items) {
    groups[item.status].push(item);
  }

  return groups;
}

export function sumSurveyAmounts(items: Survey[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

export function averageSurveyAmount(items: Survey[]): number {
  return items.length === 0 ? 0 : sumSurveyAmounts(items) / items.length;
}

export function topBySurveyAmount(items: Survey[], count: number): Survey[] {
  return [...items].sort((first, second) => second.amount - first.amount).slice(0, Math.max(0, count));
}

export function filterSurveyByTag(items: Survey[], tag: string): Survey[] {
  const needle = tag.trim().toLowerCase();
  return items.filter((item) => item.tags.includes(needle));
}

export function uniqueSurveyTags(items: Survey[]): string[] {
  const tags = new Set<string>();

  for (const item of items) {
    for (const tag of item.tags) {
      tags.add(tag);
    }
  }

  return [...tags].sort((first, second) => first.localeCompare(second));
}

export function paginateSurvey(items: Survey[], page: number, pageSize: number): Survey[] {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.floor(pageSize));
  const start = (safePage - 1) * safeSize;

  return items.slice(start, start + safeSize);
}

export function chunkSurvey(items: Survey[], size: number): Survey[][] {
  const safeSize = Math.max(1, Math.floor(size));
  const chunks: Survey[][] = [];

  for (let index = 0; index < items.length; index += safeSize) {
    chunks.push(items.slice(index, index + safeSize));
  }

  return chunks;
}

export function summarizeSurvey(items: Survey[]): SurveySummary {
  const groups = groupBySurveyStatus(items);

  return {
    total: items.length,
    active: groups.active.length,
    inactive: groups.inactive.length,
    archived: groups.archived.length,
    totalAmount: sumSurveyAmounts(items),
    averageAmount: averageSurveyAmount(items),
  };
}

export function formatSurveyAmount(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatSurveyDate(value: string, locale = 'en-US'): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsed);
}

export function daysSinceSurveyUpdate(item: Survey, now: Date = new Date()): number {
  const updated = Date.parse(item.updatedAt);

  if (Number.isNaN(updated)) {
    return 0;
  }

  return Math.floor((now.getTime() - updated) / (24 * 60 * 60 * 1000));
}

export function findSurveyStale(items: Survey[], maxAgeDays: number, now: Date = new Date()): Survey[] {
  return items.filter((item) => daysSinceSurveyUpdate(item, now) > maxAgeDays);
}

function escapeCsvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toSurveyCsv(items: Survey[]): string {
  const header = ['id', 'name', 'status', 'amount', 'tags'];
  const rows = items.map((item) =>
    [String(item.id), item.name, item.status, String(item.amount), item.tags.join('|')]
      .map(escapeCsvCell)
      .join(','),
  );

  return [header.join(','), ...rows].join('\n');
}
