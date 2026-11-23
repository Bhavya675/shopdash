export type StoreStatus = 'active' | 'inactive' | 'archived';

export interface Store {
  id: number;
  name: string;
  summary: string;
  status: StoreStatus;
  amount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StoreDraft {
  name: string;
  summary: string;
  amount: number;
  tags: string[];
}

export interface StorePage {
  items: Store[];
  total: number;
  page: number;
  pageSize: number;
}

export interface StoreQuery {
  search?: string;
  status?: StoreStatus;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export const Store_NAME_MAX_LENGTH = 80;
export const Store_TAG_MAX_COUNT = 10;

export function createStoreDraft(): StoreDraft {
  return { name: '', summary: '', amount: 0, tags: [] };
}

export function isStoreActive(item: Store): boolean {
  return item.status === 'active';
}

export function isStoreArchived(item: Store): boolean {
  return item.status === 'archived';
}

export function normalizeStoreTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const cleaned = tag.trim().toLowerCase();
    if (cleaned.length > 0 && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }

  return result.slice(0, Store_TAG_MAX_COUNT);
}

export function validateStoreDraft(draft: StoreDraft): string[] {
  const errors: string[] = [];
  const name = draft.name.trim();

  if (name.length === 0) {
    errors.push('Name is required.');
  } else if (name.length > Store_NAME_MAX_LENGTH) {
    errors.push(`Name must be at most ${Store_NAME_MAX_LENGTH} characters.`);
  }

  if (!Number.isFinite(draft.amount) || draft.amount < 0) {
    errors.push('Amount must be a non-negative number.');
  }

  if (draft.tags.length > Store_TAG_MAX_COUNT) {
    errors.push(`At most ${Store_TAG_MAX_COUNT} tags are allowed.`);
  }

  return errors;
}

export function toStoreDraft(item: Store): StoreDraft {
  return {
    name: item.name,
    summary: item.summary,
    amount: item.amount,
    tags: [...item.tags],
  };
}

export function compareStoreByName(first: Store, second: Store): number {
  return first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });
}

export function compareStoreByAmount(first: Store, second: Store): number {
  return first.amount - second.amount;
}

export function compareStoreByUpdated(first: Store, second: Store): number {
  return Date.parse(second.updatedAt) - Date.parse(first.updatedAt);
}

export function matchesStoreQuery(item: Store, query: StoreQuery): boolean {
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

export function describeStore(item: Store): string {
  const tags = item.tags.length > 0 ? ` [${item.tags.join(', ')}]` : '';
  return `${item.name} (#${item.id}, ${item.status})${tags}`;
}
