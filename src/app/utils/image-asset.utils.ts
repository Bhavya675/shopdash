import { ImageAsset, ImageAssetStatus } from '../models/image-asset.model';

export interface ImageAssetSummary {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  totalAmount: number;
  averageAmount: number;
}

export function groupByImageAssetStatus(items: ImageAsset[]): Record<ImageAssetStatus, ImageAsset[]> {
  const groups: Record<ImageAssetStatus, ImageAsset[]> = { active: [], inactive: [], archived: [] };

  for (const item of items) {
    groups[item.status].push(item);
  }

  return groups;
}

export function sumImageAssetAmounts(items: ImageAsset[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

export function averageImageAssetAmount(items: ImageAsset[]): number {
  return items.length === 0 ? 0 : sumImageAssetAmounts(items) / items.length;
}

export function topByImageAssetAmount(items: ImageAsset[], count: number): ImageAsset[] {
  return [...items].sort((first, second) => second.amount - first.amount).slice(0, Math.max(0, count));
}

export function filterImageAssetByTag(items: ImageAsset[], tag: string): ImageAsset[] {
  const needle = tag.trim().toLowerCase();
  return items.filter((item) => item.tags.includes(needle));
}

export function uniqueImageAssetTags(items: ImageAsset[]): string[] {
  const tags = new Set<string>();

  for (const item of items) {
    for (const tag of item.tags) {
      tags.add(tag);
    }
  }

  return [...tags].sort((first, second) => first.localeCompare(second));
}

export function paginateImageAsset(items: ImageAsset[], page: number, pageSize: number): ImageAsset[] {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.floor(pageSize));
  const start = (safePage - 1) * safeSize;

  return items.slice(start, start + safeSize);
}

export function chunkImageAsset(items: ImageAsset[], size: number): ImageAsset[][] {
  const safeSize = Math.max(1, Math.floor(size));
  const chunks: ImageAsset[][] = [];

  for (let index = 0; index < items.length; index += safeSize) {
    chunks.push(items.slice(index, index + safeSize));
  }

  return chunks;
}

export function summarizeImageAsset(items: ImageAsset[]): ImageAssetSummary {
  const groups = groupByImageAssetStatus(items);

  return {
    total: items.length,
    active: groups.active.length,
    inactive: groups.inactive.length,
    archived: groups.archived.length,
    totalAmount: sumImageAssetAmounts(items),
    averageAmount: averageImageAssetAmount(items),
  };
}

export function formatImageAssetAmount(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatImageAssetDate(value: string, locale = 'en-US'): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsed);
}

export function daysSinceImageAssetUpdate(item: ImageAsset, now: Date = new Date()): number {
  const updated = Date.parse(item.updatedAt);

  if (Number.isNaN(updated)) {
    return 0;
  }

  return Math.floor((now.getTime() - updated) / (24 * 60 * 60 * 1000));
}

export function findImageAssetStale(items: ImageAsset[], maxAgeDays: number, now: Date = new Date()): ImageAsset[] {
  return items.filter((item) => daysSinceImageAssetUpdate(item, now) > maxAgeDays);
}

function escapeCsvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toImageAssetCsv(items: ImageAsset[]): string {
  const header = ['id', 'name', 'status', 'amount', 'tags'];
  const rows = items.map((item) =>
    [String(item.id), item.name, item.status, String(item.amount), item.tags.join('|')]
      .map(escapeCsvCell)
      .join(','),
  );

  return [header.join(','), ...rows].join('\n');
}
