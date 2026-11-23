export type GalleryStatus = 'active' | 'inactive' | 'archived';

export interface Gallery {
  id: number;
  name: string;
  reference: string;
  status: GalleryStatus;
  amount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GalleryDraft {
  name: string;
  reference: string;
  amount: number;
  tags: string[];
}

export interface GalleryPage {
  items: Gallery[];
  total: number;
  page: number;
  pageSize: number;
}

export interface GalleryQuery {
  search?: string;
  status?: GalleryStatus;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export const Gallery_NAME_MAX_LENGTH = 80;
export const Gallery_TAG_MAX_COUNT = 10;

export function createGalleryDraft(): GalleryDraft {
  return { name: '', reference: '', amount: 0, tags: [] };
}

export function isGalleryActive(item: Gallery): boolean {
  return item.status === 'active';
}

export function isGalleryArchived(item: Gallery): boolean {
  return item.status === 'archived';
}

export function normalizeGalleryTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const cleaned = tag.trim().toLowerCase();
    if (cleaned.length > 0 && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }

  return result.slice(0, Gallery_TAG_MAX_COUNT);
}

export function validateGalleryDraft(draft: GalleryDraft): string[] {
  const errors: string[] = [];
  const name = draft.name.trim();

  if (name.length === 0) {
    errors.push('Name is required.');
  } else if (name.length > Gallery_NAME_MAX_LENGTH) {
    errors.push(`Name must be at most ${Gallery_NAME_MAX_LENGTH} characters.`);
  }

  if (!Number.isFinite(draft.amount) || draft.amount < 0) {
    errors.push('Amount must be a non-negative number.');
  }

  if (draft.tags.length > Gallery_TAG_MAX_COUNT) {
    errors.push(`At most ${Gallery_TAG_MAX_COUNT} tags are allowed.`);
  }

  return errors;
}

export function toGalleryDraft(item: Gallery): GalleryDraft {
  return {
    name: item.name,
    reference: item.reference,
    amount: item.amount,
    tags: [...item.tags],
  };
}

export function compareGalleryByName(first: Gallery, second: Gallery): number {
  return first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });
}

export function compareGalleryByAmount(first: Gallery, second: Gallery): number {
  return first.amount - second.amount;
}

export function compareGalleryByUpdated(first: Gallery, second: Gallery): number {
  return Date.parse(second.updatedAt) - Date.parse(first.updatedAt);
}

export function matchesGalleryQuery(item: Gallery, query: GalleryQuery): boolean {
  if (query.status && item.status !== query.status) {
    return false;
  }

  if (query.tag && !item.tags.includes(query.tag)) {
    return false;
  }

  if (query.search) {
    const needle = query.search.trim().toLowerCase();
    const haystack = `${item.name} ${item.reference}`.toLowerCase();
    return haystack.includes(needle);
  }

  return true;
}

export function describeGallery(item: Gallery): string {
  const tags = item.tags.length > 0 ? ` [${item.tags.join(', ')}]` : '';
  return `${item.name} (#${item.id}, ${item.status})${tags}`;
}
