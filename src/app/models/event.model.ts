export type EventStatus = 'active' | 'inactive' | 'archived';

export interface Event {
  id: number;
  name: string;
  label: string;
  status: EventStatus;
  amount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EventDraft {
  name: string;
  label: string;
  amount: number;
  tags: string[];
}

export interface EventPage {
  items: Event[];
  total: number;
  page: number;
  pageSize: number;
}

export interface EventQuery {
  search?: string;
  status?: EventStatus;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export const Event_NAME_MAX_LENGTH = 80;
export const Event_TAG_MAX_COUNT = 10;

export function createEventDraft(): EventDraft {
  return { name: '', label: '', amount: 0, tags: [] };
}

export function isEventActive(item: Event): boolean {
  return item.status === 'active';
}

export function isEventArchived(item: Event): boolean {
  return item.status === 'archived';
}

export function normalizeEventTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const cleaned = tag.trim().toLowerCase();
    if (cleaned.length > 0 && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }

  return result.slice(0, Event_TAG_MAX_COUNT);
}

export function validateEventDraft(draft: EventDraft): string[] {
  const errors: string[] = [];
  const name = draft.name.trim();

  if (name.length === 0) {
    errors.push('Name is required.');
  } else if (name.length > Event_NAME_MAX_LENGTH) {
    errors.push(`Name must be at most ${Event_NAME_MAX_LENGTH} characters.`);
  }

  if (!Number.isFinite(draft.amount) || draft.amount < 0) {
    errors.push('Amount must be a non-negative number.');
  }

  if (draft.tags.length > Event_TAG_MAX_COUNT) {
    errors.push(`At most ${Event_TAG_MAX_COUNT} tags are allowed.`);
  }

  return errors;
}

export function toEventDraft(item: Event): EventDraft {
  return {
    name: item.name,
    label: item.label,
    amount: item.amount,
    tags: [...item.tags],
  };
}

export function compareEventByName(first: Event, second: Event): number {
  return first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });
}

export function compareEventByAmount(first: Event, second: Event): number {
  return first.amount - second.amount;
}

export function compareEventByUpdated(first: Event, second: Event): number {
  return Date.parse(second.updatedAt) - Date.parse(first.updatedAt);
}

export function matchesEventQuery(item: Event, query: EventQuery): boolean {
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

export function describeEvent(item: Event): string {
  const tags = item.tags.length > 0 ? ` [${item.tags.join(', ')}]` : '';
  return `${item.name} (#${item.id}, ${item.status})${tags}`;
}
