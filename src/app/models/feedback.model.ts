export type FeedbackStatus = 'active' | 'inactive' | 'archived';

export interface Feedback {
  id: number;
  name: string;
  summary: string;
  status: FeedbackStatus;
  amount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackDraft {
  name: string;
  summary: string;
  amount: number;
  tags: string[];
}

export interface FeedbackPage {
  items: Feedback[];
  total: number;
  page: number;
  pageSize: number;
}

export interface FeedbackQuery {
  search?: string;
  status?: FeedbackStatus;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export const Feedback_NAME_MAX_LENGTH = 80;
export const Feedback_TAG_MAX_COUNT = 10;

export function createFeedbackDraft(): FeedbackDraft {
  return { name: '', summary: '', amount: 0, tags: [] };
}

export function isFeedbackActive(item: Feedback): boolean {
  return item.status === 'active';
}

export function isFeedbackArchived(item: Feedback): boolean {
  return item.status === 'archived';
}

export function normalizeFeedbackTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const cleaned = tag.trim().toLowerCase();
    if (cleaned.length > 0 && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }

  return result.slice(0, Feedback_TAG_MAX_COUNT);
}

export function validateFeedbackDraft(draft: FeedbackDraft): string[] {
  const errors: string[] = [];
  const name = draft.name.trim();

  if (name.length === 0) {
    errors.push('Name is required.');
  } else if (name.length > Feedback_NAME_MAX_LENGTH) {
    errors.push(`Name must be at most ${Feedback_NAME_MAX_LENGTH} characters.`);
  }

  if (!Number.isFinite(draft.amount) || draft.amount < 0) {
    errors.push('Amount must be a non-negative number.');
  }

  if (draft.tags.length > Feedback_TAG_MAX_COUNT) {
    errors.push(`At most ${Feedback_TAG_MAX_COUNT} tags are allowed.`);
  }

  return errors;
}

export function toFeedbackDraft(item: Feedback): FeedbackDraft {
  return {
    name: item.name,
    summary: item.summary,
    amount: item.amount,
    tags: [...item.tags],
  };
}

export function compareFeedbackByName(first: Feedback, second: Feedback): number {
  return first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });
}

export function compareFeedbackByAmount(first: Feedback, second: Feedback): number {
  return first.amount - second.amount;
}

export function compareFeedbackByUpdated(first: Feedback, second: Feedback): number {
  return Date.parse(second.updatedAt) - Date.parse(first.updatedAt);
}

export function matchesFeedbackQuery(item: Feedback, query: FeedbackQuery): boolean {
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

export function describeFeedback(item: Feedback): string {
  const tags = item.tags.length > 0 ? ` [${item.tags.join(', ')}]` : '';
  return `${item.name} (#${item.id}, ${item.status})${tags}`;
}
