export type BannerStatus = 'active' | 'inactive' | 'archived';

export interface Banner {
  id: number;
  name: string;
  summary: string;
  status: BannerStatus;
  amount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BannerDraft {
  name: string;
  summary: string;
  amount: number;
  tags: string[];
}

export interface BannerPage {
  items: Banner[];
  total: number;
  page: number;
  pageSize: number;
}

export interface BannerQuery {
  search?: string;
  status?: BannerStatus;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export const Banner_NAME_MAX_LENGTH = 80;
export const Banner_TAG_MAX_COUNT = 10;

export function createBannerDraft(): BannerDraft {
  return { name: '', summary: '', amount: 0, tags: [] };
}

export function isBannerActive(item: Banner): boolean {
  return item.status === 'active';
}

export function isBannerArchived(item: Banner): boolean {
  return item.status === 'archived';
}

export function normalizeBannerTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const cleaned = tag.trim().toLowerCase();
    if (cleaned.length > 0 && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }

  return result.slice(0, Banner_TAG_MAX_COUNT);
}

export function validateBannerDraft(draft: BannerDraft): string[] {
  const errors: string[] = [];
  const name = draft.name.trim();

  if (name.length === 0) {
    errors.push('Name is required.');
  } else if (name.length > Banner_NAME_MAX_LENGTH) {
    errors.push(`Name must be at most ${Banner_NAME_MAX_LENGTH} characters.`);
  }

  if (!Number.isFinite(draft.amount) || draft.amount < 0) {
    errors.push('Amount must be a non-negative number.');
  }

  if (draft.tags.length > Banner_TAG_MAX_COUNT) {
    errors.push(`At most ${Banner_TAG_MAX_COUNT} tags are allowed.`);
  }

  return errors;
}

export function toBannerDraft(item: Banner): BannerDraft {
  return {
    name: item.name,
    summary: item.summary,
    amount: item.amount,
    tags: [...item.tags],
  };
}

export function compareBannerByName(first: Banner, second: Banner): number {
  return first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });
}

export function compareBannerByAmount(first: Banner, second: Banner): number {
  return first.amount - second.amount;
}

export function compareBannerByUpdated(first: Banner, second: Banner): number {
  return Date.parse(second.updatedAt) - Date.parse(first.updatedAt);
}

export function matchesBannerQuery(item: Banner, query: BannerQuery): boolean {
  if (query.status && item.status !== query.status) {
    return false;
  }

  if (query.tag && !item.tags.includes(query.tag)) {
    return false;
  }

  if (query.search) {
    const needle = query.search.trim().toLowerCase();
    const haystack = `${item.name} ${item.summary}`.toLowerCase();
    return haystack.includes(needle);
  }

  return true;
}

export function describeBanner(item: Banner): string {
  const tags = item.tags.length > 0 ? ` [${item.tags.join(', ')}]` : '';
  return `${item.name} (#${item.id}, ${item.status})${tags}`;
}
