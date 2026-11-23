import { Team, TeamStatus } from '../models/team.model';

export interface TeamSummary {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  totalAmount: number;
  averageAmount: number;
}

export function groupByTeamStatus(items: Team[]): Record<TeamStatus, Team[]> {
  const groups: Record<TeamStatus, Team[]> = { active: [], inactive: [], archived: [] };

  for (const item of items) {
    groups[item.status].push(item);
  }

  return groups;
}

export function sumTeamAmounts(items: Team[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

export function averageTeamAmount(items: Team[]): number {
  return items.length === 0 ? 0 : sumTeamAmounts(items) / items.length;
}

export function topByTeamAmount(items: Team[], count: number): Team[] {
  return [...items].sort((first, second) => second.amount - first.amount).slice(0, Math.max(0, count));
}

export function filterTeamByTag(items: Team[], tag: string): Team[] {
  const needle = tag.trim().toLowerCase();
  return items.filter((item) => item.tags.includes(needle));
}

export function uniqueTeamTags(items: Team[]): string[] {
  const tags = new Set<string>();

  for (const item of items) {
    for (const tag of item.tags) {
      tags.add(tag);
    }
  }

  return [...tags].sort((first, second) => first.localeCompare(second));
}

export function paginateTeam(items: Team[], page: number, pageSize: number): Team[] {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.floor(pageSize));
  const start = (safePage - 1) * safeSize;

  return items.slice(start, start + safeSize);
}

export function chunkTeam(items: Team[], size: number): Team[][] {
  const safeSize = Math.max(1, Math.floor(size));
  const chunks: Team[][] = [];

  for (let index = 0; index < items.length; index += safeSize) {
    chunks.push(items.slice(index, index + safeSize));
  }

  return chunks;
}

export function summarizeTeam(items: Team[]): TeamSummary {
  const groups = groupByTeamStatus(items);

  return {
    total: items.length,
    active: groups.active.length,
    inactive: groups.inactive.length,
    archived: groups.archived.length,
    totalAmount: sumTeamAmounts(items),
    averageAmount: averageTeamAmount(items),
  };
}

export function formatTeamAmount(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatTeamDate(value: string, locale = 'en-US'): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsed);
}

export function daysSinceTeamUpdate(item: Team, now: Date = new Date()): number {
  const updated = Date.parse(item.updatedAt);

  if (Number.isNaN(updated)) {
    return 0;
  }

  return Math.floor((now.getTime() - updated) / (24 * 60 * 60 * 1000));
}

export function findTeamStale(items: Team[], maxAgeDays: number, now: Date = new Date()): Team[] {
  return items.filter((item) => daysSinceTeamUpdate(item, now) > maxAgeDays);
}

function escapeCsvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toTeamCsv(items: Team[]): string {
  const header = ['id', 'name', 'status', 'amount', 'tags'];
  const rows = items.map((item) =>
    [String(item.id), item.name, item.status, String(item.amount), item.tags.join('|')]
      .map(escapeCsvCell)
      .join(','),
  );

  return [header.join(','), ...rows].join('\n');
}
