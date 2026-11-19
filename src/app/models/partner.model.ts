export type PartnerStatus = 'active' | 'inactive' | 'archived';

export interface Partner {
  id: number;
  name: string;
  notes: string;
  status: PartnerStatus;
  amount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PartnerDraft {
  name: string;
  notes: string;
  amount: number;
  tags: string[];
}

export interface PartnerPage {
  items: Partner[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PartnerQuery {
  search?: string;
  status?: PartnerStatus;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export const Partner_NAME_MAX_LENGTH = 80;
export const Partner_TAG_MAX_COUNT = 10;

export function createPartnerDraft(): PartnerDraft {
  return { name: '', notes: '', amount: 0, tags: [] };
}

export function isPartnerActive(item: Partner): boolean {
  return item.status === 'active';
}

export function isPartnerArchived(item: Partner): boolean {
  return item.status === 'archived';
}

export function normalizePartnerTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const cleaned = tag.trim().toLowerCase();
    if (cleaned.length > 0 && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }

  return result.slice(0, Partner_TAG_MAX_COUNT);
}

export function validatePartnerDraft(draft: PartnerDraft): string[] {
  const errors: string[] = [];
  const name = draft.name.trim();

  if (name.length === 0) {
    errors.push('Name is required.');
  } else if (name.length > Partner_NAME_MAX_LENGTH) {
    errors.push(`Name must be at most ${Partner_NAME_MAX_LENGTH} characters.`);
  }

  if (!Number.isFinite(draft.amount) || draft.amount < 0) {
    errors.push('Amount must be a non-negative number.');
  }

  if (draft.tags.length > Partner_TAG_MAX_COUNT) {
    errors.push(`At most ${Partner_TAG_MAX_COUNT} tags are allowed.`);
  }

  return errors;
}

export function toPartnerDraft(item: Partner): PartnerDraft {
  return {
    name: item.name,
    notes: item.notes,
    amount: item.amount,
    tags: [...item.tags],
  };
}

export function comparePartnerByName(first: Partner, second: Partner): number {
  return first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });
}

export function comparePartnerByAmount(first: Partner, second: Partner): number {
  return first.amount - second.amount;
}

export function comparePartnerByUpdated(first: Partner, second: Partner): number {
  return Date.parse(second.updatedAt) - Date.parse(first.updatedAt);
}

export function matchesPartnerQuery(item: Partner, query: PartnerQuery): boolean {
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

export function describePartner(item: Partner): string {
  const tags = item.tags.length > 0 ? ` [${item.tags.join(', ')}]` : '';
  return `${item.name} (#${item.id}, ${item.status})${tags}`;
}
