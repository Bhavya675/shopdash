export type ShiftStatus = 'active' | 'inactive' | 'archived';

export interface Shift {
  id: number;
  name: string;
  owner: string;
  status: ShiftStatus;
  amount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ShiftDraft {
  name: string;
  owner: string;
  amount: number;
  tags: string[];
}

export interface ShiftPage {
  items: Shift[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ShiftQuery {
  search?: string;
  status?: ShiftStatus;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export const Shift_NAME_MAX_LENGTH = 80;
export const Shift_TAG_MAX_COUNT = 10;

export function createShiftDraft(): ShiftDraft {
  return { name: '', owner: '', amount: 0, tags: [] };
}

export function isShiftActive(item: Shift): boolean {
  return item.status === 'active';
}

export function isShiftArchived(item: Shift): boolean {
  return item.status === 'archived';
}

export function normalizeShiftTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const cleaned = tag.trim().toLowerCase();
    if (cleaned.length > 0 && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }

  return result.slice(0, Shift_TAG_MAX_COUNT);
}

export function validateShiftDraft(draft: ShiftDraft): string[] {
  const errors: string[] = [];
  const name = draft.name.trim();

  if (name.length === 0) {
    errors.push('Name is required.');
  } else if (name.length > Shift_NAME_MAX_LENGTH) {
    errors.push(`Name must be at most ${Shift_NAME_MAX_LENGTH} characters.`);
  }

  if (!Number.isFinite(draft.amount) || draft.amount < 0) {
    errors.push('Amount must be a non-negative number.');
  }

  if (draft.tags.length > Shift_TAG_MAX_COUNT) {
    errors.push(`At most ${Shift_TAG_MAX_COUNT} tags are allowed.`);
  }

  return errors;
}

export function toShiftDraft(item: Shift): ShiftDraft {
  return {
    name: item.name,
    owner: item.owner,
    amount: item.amount,
    tags: [...item.tags],
  };
}

export function compareShiftByName(first: Shift, second: Shift): number {
  return first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });
}

export function compareShiftByAmount(first: Shift, second: Shift): number {
  return first.amount - second.amount;
}

export function compareShiftByUpdated(first: Shift, second: Shift): number {
  return Date.parse(second.updatedAt) - Date.parse(first.updatedAt);
}

export function matchesShiftQuery(item: Shift, query: ShiftQuery): boolean {
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

export function describeShift(item: Shift): string {
  const tags = item.tags.length > 0 ? ` [${item.tags.join(', ')}]` : '';
  return `${item.name} (#${item.id}, ${item.status})${tags}`;
}
