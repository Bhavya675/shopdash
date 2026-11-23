export type ScheduleStatus = 'active' | 'inactive' | 'archived';

export interface Schedule {
  id: number;
  name: string;
  label: string;
  status: ScheduleStatus;
  amount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleDraft {
  name: string;
  label: string;
  amount: number;
  tags: string[];
}

export interface SchedulePage {
  items: Schedule[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ScheduleQuery {
  search?: string;
  status?: ScheduleStatus;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export const Schedule_NAME_MAX_LENGTH = 80;
export const Schedule_TAG_MAX_COUNT = 10;

export function createScheduleDraft(): ScheduleDraft {
  return { name: '', label: '', amount: 0, tags: [] };
}

export function isScheduleActive(item: Schedule): boolean {
  return item.status === 'active';
}

export function isScheduleArchived(item: Schedule): boolean {
  return item.status === 'archived';
}

export function normalizeScheduleTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const cleaned = tag.trim().toLowerCase();
    if (cleaned.length > 0 && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }

  return result.slice(0, Schedule_TAG_MAX_COUNT);
}

export function validateScheduleDraft(draft: ScheduleDraft): string[] {
  const errors: string[] = [];
  const name = draft.name.trim();

  if (name.length === 0) {
    errors.push('Name is required.');
  } else if (name.length > Schedule_NAME_MAX_LENGTH) {
    errors.push(`Name must be at most ${Schedule_NAME_MAX_LENGTH} characters.`);
  }

  if (!Number.isFinite(draft.amount) || draft.amount < 0) {
    errors.push('Amount must be a non-negative number.');
  }

  if (draft.tags.length > Schedule_TAG_MAX_COUNT) {
    errors.push(`At most ${Schedule_TAG_MAX_COUNT} tags are allowed.`);
  }

  return errors;
}

export function toScheduleDraft(item: Schedule): ScheduleDraft {
  return {
    name: item.name,
    label: item.label,
    amount: item.amount,
    tags: [...item.tags],
  };
}

export function compareScheduleByName(first: Schedule, second: Schedule): number {
  return first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });
}

export function compareScheduleByAmount(first: Schedule, second: Schedule): number {
  return first.amount - second.amount;
}

export function compareScheduleByUpdated(first: Schedule, second: Schedule): number {
  return Date.parse(second.updatedAt) - Date.parse(first.updatedAt);
}

export function matchesScheduleQuery(item: Schedule, query: ScheduleQuery): boolean {
  if (query.status && item.status !== query.status) {
    return false;
  }

  if (query.tag && !item.tags.includes(query.tag)) {
    return false;
  }

  if (query.search) {
    const needle = query.search.trim().toLowerCase();
    const haystack = `${item.name} ${item.label}`.toLowerCase();
    return haystack.includes(needle);
  }

  return true;
}

export function describeSchedule(item: Schedule): string {
  const tags = item.tags.length > 0 ? ` [${item.tags.join(', ')}]` : '';
  return `${item.name} (#${item.id}, ${item.status})${tags}`;
}
