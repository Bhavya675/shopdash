export type OfficeStatus = 'active' | 'inactive' | 'archived';

export interface Office {
  id: number;
  name: string;
  reference: string;
  status: OfficeStatus;
  amount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface OfficeDraft {
  name: string;
  reference: string;
  amount: number;
  tags: string[];
}

export interface OfficePage {
  items: Office[];
  total: number;
  page: number;
  pageSize: number;
}

export interface OfficeQuery {
  search?: string;
  status?: OfficeStatus;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export const Office_NAME_MAX_LENGTH = 80;
export const Office_TAG_MAX_COUNT = 10;

export function createOfficeDraft(): OfficeDraft {
  return { name: '', reference: '', amount: 0, tags: [] };
}

export function isOfficeActive(item: Office): boolean {
  return item.status === 'active';
}

export function isOfficeArchived(item: Office): boolean {
  return item.status === 'archived';
}

export function normalizeOfficeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const cleaned = tag.trim().toLowerCase();
    if (cleaned.length > 0 && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }

  return result.slice(0, Office_TAG_MAX_COUNT);
}

export function validateOfficeDraft(draft: OfficeDraft): string[] {
  const errors: string[] = [];
  const name = draft.name.trim();

  if (name.length === 0) {
    errors.push('Name is required.');
  } else if (name.length > Office_NAME_MAX_LENGTH) {
    errors.push(`Name must be at most ${Office_NAME_MAX_LENGTH} characters.`);
  }

  if (!Number.isFinite(draft.amount) || draft.amount < 0) {
    errors.push('Amount must be a non-negative number.');
  }

  if (draft.tags.length > Office_TAG_MAX_COUNT) {
    errors.push(`At most ${Office_TAG_MAX_COUNT} tags are allowed.`);
  }

  return errors;
}

export function toOfficeDraft(item: Office): OfficeDraft {
  return {
    name: item.name,
    reference: item.reference,
    amount: item.amount,
    tags: [...item.tags],
  };
}

export function compareOfficeByName(first: Office, second: Office): number {
  return first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });
}

export function compareOfficeByAmount(first: Office, second: Office): number {
  return first.amount - second.amount;
}

export function compareOfficeByUpdated(first: Office, second: Office): number {
  return Date.parse(second.updatedAt) - Date.parse(first.updatedAt);
}

export function matchesOfficeQuery(item: Office, query: OfficeQuery): boolean {
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

export function describeOffice(item: Office): string {
  const tags = item.tags.length > 0 ? ` [${item.tags.join(', ')}]` : '';
  return `${item.name} (#${item.id}, ${item.status})${tags}`;
}
