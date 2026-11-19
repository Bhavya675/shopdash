export type NewsletterStatus = 'active' | 'inactive' | 'archived';

export interface Newsletter {
  id: number;
  name: string;
  summary: string;
  status: NewsletterStatus;
  amount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NewsletterDraft {
  name: string;
  summary: string;
  amount: number;
  tags: string[];
}

export interface NewsletterPage {
  items: Newsletter[];
  total: number;
  page: number;
  pageSize: number;
}

export interface NewsletterQuery {
  search?: string;
  status?: NewsletterStatus;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export const Newsletter_NAME_MAX_LENGTH = 80;
export const Newsletter_TAG_MAX_COUNT = 10;

export function createNewsletterDraft(): NewsletterDraft {
  return { name: '', summary: '', amount: 0, tags: [] };
}

export function isNewsletterActive(item: Newsletter): boolean {
  return item.status === 'active';
}

export function isNewsletterArchived(item: Newsletter): boolean {
  return item.status === 'archived';
}

export function normalizeNewsletterTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const cleaned = tag.trim().toLowerCase();
    if (cleaned.length > 0 && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }

  return result.slice(0, Newsletter_TAG_MAX_COUNT);
}

export function validateNewsletterDraft(draft: NewsletterDraft): string[] {
  const errors: string[] = [];
  const name = draft.name.trim();

  if (name.length === 0) {
    errors.push('Name is required.');
  } else if (name.length > Newsletter_NAME_MAX_LENGTH) {
    errors.push(`Name must be at most ${Newsletter_NAME_MAX_LENGTH} characters.`);
  }

  if (!Number.isFinite(draft.amount) || draft.amount < 0) {
    errors.push('Amount must be a non-negative number.');
  }

  if (draft.tags.length > Newsletter_TAG_MAX_COUNT) {
    errors.push(`At most ${Newsletter_TAG_MAX_COUNT} tags are allowed.`);
  }

  return errors;
}

export function toNewsletterDraft(item: Newsletter): NewsletterDraft {
  return {
    name: item.name,
    summary: item.summary,
    amount: item.amount,
    tags: [...item.tags],
  };
}

export function compareNewsletterByName(first: Newsletter, second: Newsletter): number {
  return first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });
}

export function compareNewsletterByAmount(first: Newsletter, second: Newsletter): number {
  return first.amount - second.amount;
}

export function compareNewsletterByUpdated(first: Newsletter, second: Newsletter): number {
  return Date.parse(second.updatedAt) - Date.parse(first.updatedAt);
}

export function matchesNewsletterQuery(item: Newsletter, query: NewsletterQuery): boolean {
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

export function describeNewsletter(item: Newsletter): string {
  const tags = item.tags.length > 0 ? ` [${item.tags.join(', ')}]` : '';
  return `${item.name} (#${item.id}, ${item.status})${tags}`;
}
