export type RegionStatus = 'active' | 'inactive' | 'archived';

export interface Region {
  id: number;
  name: string;
  code: string;
  status: RegionStatus;
  amount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RegionDraft {
  name: string;
  code: string;
  amount: number;
  tags: string[];
}

export interface RegionPage {
  items: Region[];
  total: number;
  page: number;
  pageSize: number;
}

export interface RegionQuery {
  search?: string;
  status?: RegionStatus;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export const Region_NAME_MAX_LENGTH = 80;
export const Region_TAG_MAX_COUNT = 10;

export function createRegionDraft(): RegionDraft {
  return { name: '', code: '', amount: 0, tags: [] };
}

export function isRegionActive(item: Region): boolean {
  return item.status === 'active';
}

export function isRegionArchived(item: Region): boolean {
  return item.status === 'archived';
}

export function normalizeRegionTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const cleaned = tag.trim().toLowerCase();
    if (cleaned.length > 0 && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }

  return result.slice(0, Region_TAG_MAX_COUNT);
}

export function validateRegionDraft(draft: RegionDraft): string[] {
  const errors: string[] = [];
  const name = draft.name.trim();

  if (name.length === 0) {
    errors.push('Name is required.');
  } else if (name.length > Region_NAME_MAX_LENGTH) {
    errors.push(`Name must be at most ${Region_NAME_MAX_LENGTH} characters.`);
  }

  if (!Number.isFinite(draft.amount) || draft.amount < 0) {
    errors.push('Amount must be a non-negative number.');
  }

  if (draft.tags.length > Region_TAG_MAX_COUNT) {
    errors.push(`At most ${Region_TAG_MAX_COUNT} tags are allowed.`);
  }

  return errors;
}

export function toRegionDraft(item: Region): RegionDraft {
  return {
    name: item.name,
    code: item.code,
    amount: item.amount,
    tags: [...item.tags],
  };
}

export function compareRegionByName(first: Region, second: Region): number {
  return first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });
}

export function compareRegionByAmount(first: Region, second: Region): number {
  return first.amount - second.amount;
}

export function compareRegionByUpdated(first: Region, second: Region): number {
  return Date.parse(second.updatedAt) - Date.parse(first.updatedAt);
}

export function matchesRegionQuery(item: Region, query: RegionQuery): boolean {
  if (query.status && item.status !== query.status) {
    return false;
  }

  if (query.tag && !item.tags.includes(query.tag)) {
    return false;
  }

  if (query.search) {
    const needle = query.search.trim().toLowerCase();
    const haystack = `${item.name} ${item.code}`.toLowerCase();
    return haystack.includes(needle);
  }

  return true;
}

export function describeRegion(item: Region): string {
  const tags = item.tags.length > 0 ? ` [${item.tags.join(', ')}]` : '';
  return `${item.name} (#${item.id}, ${item.status})${tags}`;
}
