export type PolicyDocStatus = 'active' | 'inactive' | 'archived';

export interface PolicyDoc {
  id: number;
  name: string;
  slug: string;
  status: PolicyDocStatus;
  amount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PolicyDocDraft {
  name: string;
  slug: string;
  amount: number;
  tags: string[];
}

export interface PolicyDocPage {
  items: PolicyDoc[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PolicyDocQuery {
  search?: string;
  status?: PolicyDocStatus;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export const PolicyDoc_NAME_MAX_LENGTH = 80;
export const PolicyDoc_TAG_MAX_COUNT = 10;

export function createPolicyDocDraft(): PolicyDocDraft {
  return { name: '', slug: '', amount: 0, tags: [] };
}

export function isPolicyDocActive(item: PolicyDoc): boolean {
  return item.status === 'active';
}

export function isPolicyDocArchived(item: PolicyDoc): boolean {
  return item.status === 'archived';
}

export function normalizePolicyDocTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const cleaned = tag.trim().toLowerCase();
    if (cleaned.length > 0 && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }

  return result.slice(0, PolicyDoc_TAG_MAX_COUNT);
}

export function validatePolicyDocDraft(draft: PolicyDocDraft): string[] {
  const errors: string[] = [];
  const name = draft.name.trim();

  if (name.length === 0) {
    errors.push('Name is required.');
  } else if (name.length > PolicyDoc_NAME_MAX_LENGTH) {
    errors.push(`Name must be at most ${PolicyDoc_NAME_MAX_LENGTH} characters.`);
  }

  if (!Number.isFinite(draft.amount) || draft.amount < 0) {
    errors.push('Amount must be a non-negative number.');
  }

  if (draft.tags.length > PolicyDoc_TAG_MAX_COUNT) {
    errors.push(`At most ${PolicyDoc_TAG_MAX_COUNT} tags are allowed.`);
  }

  return errors;
}

export function toPolicyDocDraft(item: PolicyDoc): PolicyDocDraft {
  return {
    name: item.name,
    slug: item.slug,
    amount: item.amount,
    tags: [...item.tags],
  };
}

export function comparePolicyDocByName(first: PolicyDoc, second: PolicyDoc): number {
  return first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });
}

export function comparePolicyDocByAmount(first: PolicyDoc, second: PolicyDoc): number {
  return first.amount - second.amount;
}

export function comparePolicyDocByUpdated(first: PolicyDoc, second: PolicyDoc): number {
  return Date.parse(second.updatedAt) - Date.parse(first.updatedAt);
}

export function matchesPolicyDocQuery(item: PolicyDoc, query: PolicyDocQuery): boolean {
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

export function describePolicyDoc(item: PolicyDoc): string {
  const tags = item.tags.length > 0 ? ` [${item.tags.join(', ')}]` : '';
  return `${item.name} (#${item.id}, ${item.status})${tags}`;
}
