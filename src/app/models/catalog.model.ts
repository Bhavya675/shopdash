export type CatalogStatus = 'active' | 'inactive' | 'archived';

export interface Catalog {
  id: number;
  name: string;
  reference: string;
  status: CatalogStatus;
  amount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CatalogDraft {
  name: string;
  reference: string;
  amount: number;
  tags: string[];
}

export interface CatalogPage {
  items: Catalog[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CatalogQuery {
  search?: string;
  status?: CatalogStatus;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export const Catalog_NAME_MAX_LENGTH = 80;
export const Catalog_TAG_MAX_COUNT = 10;

export function createCatalogDraft(): CatalogDraft {
  return { name: '', reference: '', amount: 0, tags: [] };
}

export function isCatalogActive(item: Catalog): boolean {
  return item.status === 'active';
}

export function isCatalogArchived(item: Catalog): boolean {
  return item.status === 'archived';
}

export function normalizeCatalogTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const cleaned = tag.trim().toLowerCase();
    if (cleaned.length > 0 && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }

  return result.slice(0, Catalog_TAG_MAX_COUNT);
}

export function validateCatalogDraft(draft: CatalogDraft): string[] {
  const errors: string[] = [];
  const name = draft.name.trim();

  if (name.length === 0) {
    errors.push('Name is required.');
  } else if (name.length > Catalog_NAME_MAX_LENGTH) {
    errors.push(`Name must be at most ${Catalog_NAME_MAX_LENGTH} characters.`);
  }

  if (!Number.isFinite(draft.amount) || draft.amount < 0) {
    errors.push('Amount must be a non-negative number.');
  }

  if (draft.tags.length > Catalog_TAG_MAX_COUNT) {
    errors.push(`At most ${Catalog_TAG_MAX_COUNT} tags are allowed.`);
  }

  return errors;
}

export function toCatalogDraft(item: Catalog): CatalogDraft {
  return {
    name: item.name,
    reference: item.reference,
    amount: item.amount,
    tags: [...item.tags],
  };
}

export function compareCatalogByName(first: Catalog, second: Catalog): number {
  return first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });
}

export function compareCatalogByAmount(first: Catalog, second: Catalog): number {
  return first.amount - second.amount;
}

export function compareCatalogByUpdated(first: Catalog, second: Catalog): number {
  return Date.parse(second.updatedAt) - Date.parse(first.updatedAt);
}

export function matchesCatalogQuery(item: Catalog, query: CatalogQuery): boolean {
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

export function describeCatalog(item: Catalog): string {
  const tags = item.tags.length > 0 ? ` [${item.tags.join(', ')}]` : '';
  return `${item.name} (#${item.id}, ${item.status})${tags}`;
}
