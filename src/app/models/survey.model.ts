export type SurveyStatus = 'active' | 'inactive' | 'archived';

export interface Survey {
  id: number;
  name: string;
  reference: string;
  status: SurveyStatus;
  amount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SurveyDraft {
  name: string;
  reference: string;
  amount: number;
  tags: string[];
}

export interface SurveyPage {
  items: Survey[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SurveyQuery {
  search?: string;
  status?: SurveyStatus;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export const Survey_NAME_MAX_LENGTH = 80;
export const Survey_TAG_MAX_COUNT = 10;

export function createSurveyDraft(): SurveyDraft {
  return { name: '', reference: '', amount: 0, tags: [] };
}

export function isSurveyActive(item: Survey): boolean {
  return item.status === 'active';
}

export function isSurveyArchived(item: Survey): boolean {
  return item.status === 'archived';
}

export function normalizeSurveyTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const cleaned = tag.trim().toLowerCase();
    if (cleaned.length > 0 && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }

  return result.slice(0, Survey_TAG_MAX_COUNT);
}

export function validateSurveyDraft(draft: SurveyDraft): string[] {
  const errors: string[] = [];
  const name = draft.name.trim();

  if (name.length === 0) {
    errors.push('Name is required.');
  } else if (name.length > Survey_NAME_MAX_LENGTH) {
    errors.push(`Name must be at most ${Survey_NAME_MAX_LENGTH} characters.`);
  }

  if (!Number.isFinite(draft.amount) || draft.amount < 0) {
    errors.push('Amount must be a non-negative number.');
  }

  if (draft.tags.length > Survey_TAG_MAX_COUNT) {
    errors.push(`At most ${Survey_TAG_MAX_COUNT} tags are allowed.`);
  }

  return errors;
}

export function toSurveyDraft(item: Survey): SurveyDraft {
  return {
    name: item.name,
    reference: item.reference,
    amount: item.amount,
    tags: [...item.tags],
  };
}

export function compareSurveyByName(first: Survey, second: Survey): number {
  return first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });
}

export function compareSurveyByAmount(first: Survey, second: Survey): number {
  return first.amount - second.amount;
}

export function compareSurveyByUpdated(first: Survey, second: Survey): number {
  return Date.parse(second.updatedAt) - Date.parse(first.updatedAt);
}

export function matchesSurveyQuery(item: Survey, query: SurveyQuery): boolean {
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

export function describeSurvey(item: Survey): string {
  const tags = item.tags.length > 0 ? ` [${item.tags.join(', ')}]` : '';
  return `${item.name} (#${item.id}, ${item.status})${tags}`;
}
