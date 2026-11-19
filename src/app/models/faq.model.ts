export type FaqStatus = 'active' | 'inactive' | 'archived';

export interface Faq {
  id: number;
  name: string;
  owner: string;
  status: FaqStatus;
  amount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FaqDraft {
  name: string;
  owner: string;
  amount: number;
  tags: string[];
}

export interface FaqPage {
  items: Faq[];
  total: number;
  page: number;
  pageSize: number;
}

export interface FaqQuery {
  search?: string;
  status?: FaqStatus;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export const Faq_NAME_MAX_LENGTH = 80;
export const Faq_TAG_MAX_COUNT = 10;

export function createFaqDraft(): FaqDraft {
  return { name: '', owner: '', amount: 0, tags: [] };
}

export function isFaqActive(item: Faq): boolean {
  return item.status === 'active';
}

export function isFaqArchived(item: Faq): boolean {
  return item.status === 'archived';
}

export function normalizeFaqTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const cleaned = tag.trim().toLowerCase();
    if (cleaned.length > 0 && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }

  return result.slice(0, Faq_TAG_MAX_COUNT);
}

export function validateFaqDraft(draft: FaqDraft): string[] {
  const errors: string[] = [];
  const name = draft.name.trim();

  if (name.length === 0) {
    errors.push('Name is required.');
  } else if (name.length > Faq_NAME_MAX_LENGTH) {
    errors.push(`Name must be at most ${Faq_NAME_MAX_LENGTH} characters.`);
  }

  if (!Number.isFinite(draft.amount) || draft.amount < 0) {
    errors.push('Amount must be a non-negative number.');
  }

  if (draft.tags.length > Faq_TAG_MAX_COUNT) {
    errors.push(`At most ${Faq_TAG_MAX_COUNT} tags are allowed.`);
  }

  return errors;
}

export function toFaqDraft(item: Faq): FaqDraft {
  return {
    name: item.name,
    owner: item.owner,
    amount: item.amount,
    tags: [...item.tags],
  };
}

export function compareFaqByName(first: Faq, second: Faq): number {
  return first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });
}

export function compareFaqByAmount(first: Faq, second: Faq): number {
  return first.amount - second.amount;
}

export function compareFaqByUpdated(first: Faq, second: Faq): number {
  return Date.parse(second.updatedAt) - Date.parse(first.updatedAt);
}

export function matchesFaqQuery(item: Faq, query: FaqQuery): boolean {
  if (query.status && item.status !== query.status) {
    return false;
  }

  if (query.tag && !item.tags.includes(query.tag)) {
    return false;
  }

  if (query.search) {
    const needle = query.search.trim().toLowerCase();
    const haystack = `${item.name} ${item.owner}`.toLowerCase();
    return haystack.includes(needle);
  }

  return true;
}

export function describeFaq(item: Faq): string {
  const tags = item.tags.length > 0 ? ` [${item.tags.join(', ')}]` : '';
  return `${item.name} (#${item.id}, ${item.status})${tags}`;
}
