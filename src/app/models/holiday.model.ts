export type HolidayStatus = 'active' | 'inactive' | 'archived';

export interface Holiday {
  id: number;
  name: string;
  notes: string;
  status: HolidayStatus;
  amount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface HolidayDraft {
  name: string;
  notes: string;
  amount: number;
  tags: string[];
}

export interface HolidayPage {
  items: Holiday[];
  total: number;
  page: number;
  pageSize: number;
}

export interface HolidayQuery {
  search?: string;
  status?: HolidayStatus;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export const Holiday_NAME_MAX_LENGTH = 80;
export const Holiday_TAG_MAX_COUNT = 10;

export function createHolidayDraft(): HolidayDraft {
  return { name: '', notes: '', amount: 0, tags: [] };
}

export function isHolidayActive(item: Holiday): boolean {
  return item.status === 'active';
}

export function isHolidayArchived(item: Holiday): boolean {
  return item.status === 'archived';
}

export function normalizeHolidayTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const cleaned = tag.trim().toLowerCase();
    if (cleaned.length > 0 && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }

  return result.slice(0, Holiday_TAG_MAX_COUNT);
}

export function validateHolidayDraft(draft: HolidayDraft): string[] {
  const errors: string[] = [];
  const name = draft.name.trim();

  if (name.length === 0) {
    errors.push('Name is required.');
  } else if (name.length > Holiday_NAME_MAX_LENGTH) {
    errors.push(`Name must be at most ${Holiday_NAME_MAX_LENGTH} characters.`);
  }

  if (!Number.isFinite(draft.amount) || draft.amount < 0) {
    errors.push('Amount must be a non-negative number.');
  }

  if (draft.tags.length > Holiday_TAG_MAX_COUNT) {
    errors.push(`At most ${Holiday_TAG_MAX_COUNT} tags are allowed.`);
  }

  return errors;
}

export function toHolidayDraft(item: Holiday): HolidayDraft {
  return {
    name: item.name,
    notes: item.notes,
    amount: item.amount,
    tags: [...item.tags],
  };
}

export function compareHolidayByName(first: Holiday, second: Holiday): number {
  return first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });
}

export function compareHolidayByAmount(first: Holiday, second: Holiday): number {
  return first.amount - second.amount;
}

export function compareHolidayByUpdated(first: Holiday, second: Holiday): number {
  return Date.parse(second.updatedAt) - Date.parse(first.updatedAt);
}

export function matchesHolidayQuery(item: Holiday, query: HolidayQuery): boolean {
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

export function describeHoliday(item: Holiday): string {
  const tags = item.tags.length > 0 ? ` [${item.tags.join(', ')}]` : '';
  return `${item.name} (#${item.id}, ${item.status})${tags}`;
}
