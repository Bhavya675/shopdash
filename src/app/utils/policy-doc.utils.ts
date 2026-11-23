import { PolicyDoc, PolicyDocStatus } from '../models/policy-doc.model';

export interface PolicyDocSummary {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  totalAmount: number;
  averageAmount: number;
}

export function groupByPolicyDocStatus(items: PolicyDoc[]): Record<PolicyDocStatus, PolicyDoc[]> {
  const groups: Record<PolicyDocStatus, PolicyDoc[]> = { active: [], inactive: [], archived: [] };

  for (const item of items) {
    groups[item.status].push(item);
  }

  return groups;
}

export function sumPolicyDocAmounts(items: PolicyDoc[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

export function averagePolicyDocAmount(items: PolicyDoc[]): number {
  return items.length === 0 ? 0 : sumPolicyDocAmounts(items) / items.length;
}

export function topByPolicyDocAmount(items: PolicyDoc[], count: number): PolicyDoc[] {
  return [...items].sort((first, second) => second.amount - first.amount).slice(0, Math.max(0, count));
}

export function filterPolicyDocByTag(items: PolicyDoc[], tag: string): PolicyDoc[] {
  const needle = tag.trim().toLowerCase();
  return items.filter((item) => item.tags.includes(needle));
}

export function uniquePolicyDocTags(items: PolicyDoc[]): string[] {
  const tags = new Set<string>();

  for (const item of items) {
    for (const tag of item.tags) {
      tags.add(tag);
    }
  }

  return [...tags].sort((first, second) => first.localeCompare(second));
}

export function paginatePolicyDoc(items: PolicyDoc[], page: number, pageSize: number): PolicyDoc[] {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.floor(pageSize));
  const start = (safePage - 1) * safeSize;

  return items.slice(start, start + safeSize);
}

export function chunkPolicyDoc(items: PolicyDoc[], size: number): PolicyDoc[][] {
  const safeSize = Math.max(1, Math.floor(size));
  const chunks: PolicyDoc[][] = [];

  for (let index = 0; index < items.length; index += safeSize) {
    chunks.push(items.slice(index, index + safeSize));
  }

  return chunks;
}

export function summarizePolicyDoc(items: PolicyDoc[]): PolicyDocSummary {
  const groups = groupByPolicyDocStatus(items);

  return {
    total: items.length,
    active: groups.active.length,
    inactive: groups.inactive.length,
    archived: groups.archived.length,
    totalAmount: sumPolicyDocAmounts(items),
    averageAmount: averagePolicyDocAmount(items),
  };
}

export function formatPolicyDocAmount(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatPolicyDocDate(value: string, locale = 'en-US'): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsed);
}

export function daysSincePolicyDocUpdate(item: PolicyDoc, now: Date = new Date()): number {
  const updated = Date.parse(item.updatedAt);

  if (Number.isNaN(updated)) {
    return 0;
  }

  return Math.floor((now.getTime() - updated) / (24 * 60 * 60 * 1000));
}

export function findPolicyDocStale(items: PolicyDoc[], maxAgeDays: number, now: Date = new Date()): PolicyDoc[] {
  return items.filter((item) => daysSincePolicyDocUpdate(item, now) > maxAgeDays);
}

function escapeCsvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toPolicyDocCsv(items: PolicyDoc[]): string {
  const header = ['id', 'name', 'status', 'amount', 'tags'];
  const rows = items.map((item) =>
    [String(item.id), item.name, item.status, String(item.amount), item.tags.join('|')]
      .map(escapeCsvCell)
      .join(','),
  );

  return [header.join(','), ...rows].join('\n');
}
