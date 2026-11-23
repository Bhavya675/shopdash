export type ImageAssetStatus = 'active' | 'inactive' | 'archived';

export interface ImageAsset {
  id: number;
  name: string;
  slug: string;
  status: ImageAssetStatus;
  amount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ImageAssetDraft {
  name: string;
  slug: string;
  amount: number;
  tags: string[];
}

export interface ImageAssetPage {
  items: ImageAsset[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ImageAssetQuery {
  search?: string;
  status?: ImageAssetStatus;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export const ImageAsset_NAME_MAX_LENGTH = 80;
export const ImageAsset_TAG_MAX_COUNT = 10;

export function createImageAssetDraft(): ImageAssetDraft {
  return { name: '', slug: '', amount: 0, tags: [] };
}

export function isImageAssetActive(item: ImageAsset): boolean {
  return item.status === 'active';
}

export function isImageAssetArchived(item: ImageAsset): boolean {
  return item.status === 'archived';
}

export function normalizeImageAssetTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const cleaned = tag.trim().toLowerCase();
    if (cleaned.length > 0 && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }

  return result.slice(0, ImageAsset_TAG_MAX_COUNT);
}

export function validateImageAssetDraft(draft: ImageAssetDraft): string[] {
  const errors: string[] = [];
  const name = draft.name.trim();

  if (name.length === 0) {
    errors.push('Name is required.');
  } else if (name.length > ImageAsset_NAME_MAX_LENGTH) {
    errors.push(`Name must be at most ${ImageAsset_NAME_MAX_LENGTH} characters.`);
  }

  if (!Number.isFinite(draft.amount) || draft.amount < 0) {
    errors.push('Amount must be a non-negative number.');
  }

  if (draft.tags.length > ImageAsset_TAG_MAX_COUNT) {
    errors.push(`At most ${ImageAsset_TAG_MAX_COUNT} tags are allowed.`);
  }

  return errors;
}

export function toImageAssetDraft(item: ImageAsset): ImageAssetDraft {
  return {
    name: item.name,
    slug: item.slug,
    amount: item.amount,
    tags: [...item.tags],
  };
}

export function compareImageAssetByName(first: ImageAsset, second: ImageAsset): number {
  return first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });
}

export function compareImageAssetByAmount(first: ImageAsset, second: ImageAsset): number {
  return first.amount - second.amount;
}

export function compareImageAssetByUpdated(first: ImageAsset, second: ImageAsset): number {
  return Date.parse(second.updatedAt) - Date.parse(first.updatedAt);
}

export function matchesImageAssetQuery(item: ImageAsset, query: ImageAssetQuery): boolean {
  if (query.status && item.status !== query.status) {
    return false;
  }

  if (query.tag && !item.tags.includes(query.tag)) {
    return false;
  }

  if (query.search) {
    const needle = query.search.trim().toLowerCase();
    const haystack = `${item.name} ${item.slug}`.toLowerCase();
    return haystack.includes(needle);
  }

  return true;
}

export function describeImageAsset(item: ImageAsset): string {
  const tags = item.tags.length > 0 ? ` [${item.tags.join(', ')}]` : '';
  return `${item.name} (#${item.id}, ${item.status})${tags}`;
}
