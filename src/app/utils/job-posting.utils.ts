import { JobPosting, JobPostingStatus } from '../models/job-posting.model';

export interface JobPostingSummary {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  totalAmount: number;
  averageAmount: number;
}

export function groupByJobPostingStatus(items: JobPosting[]): Record<JobPostingStatus, JobPosting[]> {
  const groups: Record<JobPostingStatus, JobPosting[]> = { active: [], inactive: [], archived: [] };

  for (const item of items) {
    groups[item.status].push(item);
  }

  return groups;
}

export function sumJobPostingAmounts(items: JobPosting[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

export function averageJobPostingAmount(items: JobPosting[]): number {
  return items.length === 0 ? 0 : sumJobPostingAmounts(items) / items.length;
}

export function topByJobPostingAmount(items: JobPosting[], count: number): JobPosting[] {
  return [...items].sort((first, second) => second.amount - first.amount).slice(0, Math.max(0, count));
}

export function filterJobPostingByTag(items: JobPosting[], tag: string): JobPosting[] {
  const needle = tag.trim().toLowerCase();
  return items.filter((item) => item.tags.includes(needle));
}

export function uniqueJobPostingTags(items: JobPosting[]): string[] {
  const tags = new Set<string>();

  for (const item of items) {
    for (const tag of item.tags) {
      tags.add(tag);
    }
  }

  return [...tags].sort((first, second) => first.localeCompare(second));
}

export function paginateJobPosting(items: JobPosting[], page: number, pageSize: number): JobPosting[] {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.floor(pageSize));
  const start = (safePage - 1) * safeSize;

  return items.slice(start, start + safeSize);
}

export function chunkJobPosting(items: JobPosting[], size: number): JobPosting[][] {
  const safeSize = Math.max(1, Math.floor(size));
  const chunks: JobPosting[][] = [];

  for (let index = 0; index < items.length; index += safeSize) {
    chunks.push(items.slice(index, index + safeSize));
  }

  return chunks;
}

export function summarizeJobPosting(items: JobPosting[]): JobPostingSummary {
  const groups = groupByJobPostingStatus(items);

  return {
    total: items.length,
    active: groups.active.length,
    inactive: groups.inactive.length,
    archived: groups.archived.length,
    totalAmount: sumJobPostingAmounts(items),
    averageAmount: averageJobPostingAmount(items),
  };
}

export function formatJobPostingAmount(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatJobPostingDate(value: string, locale = 'en-US'): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsed);
}

export function daysSinceJobPostingUpdate(item: JobPosting, now: Date = new Date()): number {
  const updated = Date.parse(item.updatedAt);

  if (Number.isNaN(updated)) {
    return 0;
  }

  return Math.floor((now.getTime() - updated) / (24 * 60 * 60 * 1000));
}

export function findJobPostingStale(items: JobPosting[], maxAgeDays: number, now: Date = new Date()): JobPosting[] {
  return items.filter((item) => daysSinceJobPostingUpdate(item, now) > maxAgeDays);
}

function escapeCsvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toJobPostingCsv(items: JobPosting[]): string {
  const header = ['id', 'name', 'status', 'amount', 'tags'];
  const rows = items.map((item) =>
    [String(item.id), item.name, item.status, String(item.amount), item.tags.join('|')]
      .map(escapeCsvCell)
      .join(','),
  );

  return [header.join(','), ...rows].join('\n');
}
