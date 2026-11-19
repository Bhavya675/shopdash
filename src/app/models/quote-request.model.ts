export type QuoteRequestStatus = 'active' | 'inactive' | 'archived';

export interface QuoteRequest {
  id: number;
  name: string;
  description: string;
  status: QuoteRequestStatus;
  amount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface QuoteRequestDraft {
  name: string;
  description: string;
  amount: number;
  tags: string[];
}

export interface QuoteRequestPage {
  items: QuoteRequest[];
  total: number;
  page: number;
  pageSize: number;
}

export interface QuoteRequestQuery {
  search?: string;
  status?: QuoteRequestStatus;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export const QuoteRequest_NAME_MAX_LENGTH = 80;
export const QuoteRequest_TAG_MAX_COUNT = 10;

export function createQuoteRequestDraft(): QuoteRequestDraft {
  return { name: '', description: '', amount: 0, tags: [] };
}

export function isQuoteRequestActive(item: QuoteRequest): boolean {
  return item.status === 'active';
}

export function isQuoteRequestArchived(item: QuoteRequest): boolean {
  return item.status === 'archived';
}

export function normalizeQuoteRequestTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const cleaned = tag.trim().toLowerCase();
    if (cleaned.length > 0 && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }

  return result.slice(0, QuoteRequest_TAG_MAX_COUNT);
}

export function validateQuoteRequestDraft(draft: QuoteRequestDraft): string[] {
  const errors: string[] = [];
  const name = draft.name.trim();

  if (name.length === 0) {
    errors.push('Name is required.');
  } else if (name.length > QuoteRequest_NAME_MAX_LENGTH) {
    errors.push(`Name must be at most ${QuoteRequest_NAME_MAX_LENGTH} characters.`);
  }

  if (!Number.isFinite(draft.amount) || draft.amount < 0) {
    errors.push('Amount must be a non-negative number.');
  }

  if (draft.tags.length > QuoteRequest_TAG_MAX_COUNT) {
    errors.push(`At most ${QuoteRequest_TAG_MAX_COUNT} tags are allowed.`);
  }

  return errors;
}

export function toQuoteRequestDraft(item: QuoteRequest): QuoteRequestDraft {
  return {
    name: item.name,
    description: item.description,
    amount: item.amount,
    tags: [...item.tags],
  };
}

export function compareQuoteRequestByName(first: QuoteRequest, second: QuoteRequest): number {
  return first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });
}

export function compareQuoteRequestByAmount(first: QuoteRequest, second: QuoteRequest): number {
  return first.amount - second.amount;
}

export function compareQuoteRequestByUpdated(first: QuoteRequest, second: QuoteRequest): number {
  return Date.parse(second.updatedAt) - Date.parse(first.updatedAt);
}

export function matchesQuoteRequestQuery(item: QuoteRequest, query: QuoteRequestQuery): boolean {
  if (query.status && item.status !== query.status) {
    return false;
  }

  if (query.tag && !item.tags.includes(query.tag)) {
    return false;
  }

  if (query.search) {
    const needle = query.search.trim().toLowerCase();
    const haystack = `${item.name} ${item.description}`.toLowerCase();
    return haystack.includes(needle);
  }

  return true;
}

export function describeQuoteRequest(item: QuoteRequest): string {
  const tags = item.tags.length > 0 ? ` [${item.tags.join(', ')}]` : '';
  return `${item.name} (#${item.id}, ${item.status})${tags}`;
}
