export type CollectionStatus = 'active' | 'inactive' | 'archived';

export interface Collection {
  id: number;
  name: string;
  notes: string;
  status: CollectionStatus;
  amount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CollectionDraft {
  name: string;
  notes: string;
  amount: number;
  tags: string[];
}

export interface CollectionPage {
  items: Collection[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CollectionQuery {
  search?: string;
  status?: CollectionStatus;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export const Collection_NAME_MAX_LENGTH = 80;
export const Collection_TAG_MAX_COUNT = 10;

export function createCollectionDraft(): CollectionDraft {
  return { name: '', notes: '', amount: 0, tags: [] };
}

export function isCollectionActive(item: Collection): boolean {
  return item.status === 'active';
}

export function isCollectionArchived(item: Collection): boolean {
  return item.status === 'archived';
}

export function normalizeCollectionTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const cleaned = tag.trim().toLowerCase();
    if (cleaned.length > 0 && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }

  return result.slice(0, Collection_TAG_MAX_COUNT);
}

export function validateCollectionDraft(draft: CollectionDraft): string[] {
  const errors: string[] = [];
  const name = draft.name.trim();

  if (name.length === 0) {
    errors.push('Name is required.');
  } else if (name.length > Collection_NAME_MAX_LENGTH) {
    errors.push(`Name must be at most ${Collection_NAME_MAX_LENGTH} characters.`);
  }

  if (!Number.isFinite(draft.amount) || draft.amount < 0) {
    errors.push('Amount must be a non-negative number.');
  }

  if (draft.tags.length > Collection_TAG_MAX_COUNT) {
    errors.push(`At most ${Collection_TAG_MAX_COUNT} tags are allowed.`);
  }

  return errors;
}

export function toCollectionDraft(item: Collection): CollectionDraft {
  return {
    name: item.name,
    notes: item.notes,
    amount: item.amount,
    tags: [...item.tags],
  };
}

export function compareCollectionByName(first: Collection, second: Collection): number {
  return first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });
}

export function compareCollectionByAmount(first: Collection, second: Collection): number {
  return first.amount - second.amount;
}

export function compareCollectionByUpdated(first: Collection, second: Collection): number {
  return Date.parse(second.updatedAt) - Date.parse(first.updatedAt);
}

export function matchesCollectionQuery(item: Collection, query: CollectionQuery): boolean {
  if (query.status && item.status !== query.status) {
    return false;
  }

  if (query.tag && !item.tags.includes(query.tag)) {
    return false;
  }

  if (query.search) {
    const needle = query.search.trim().toLowerCase();
    const haystack = `${item.name} ${item.notes}`.toLowerCase();
    return haystack.includes(needle);
  }

  return true;
}

export function describeCollection(item: Collection): string {
  const tags = item.tags.length > 0 ? ` [${item.tags.join(', ')}]` : '';
  return `${item.name} (#${item.id}, ${item.status})${tags}`;
}
