export type DeliverySlotStatus = 'active' | 'inactive' | 'archived';

export interface DeliverySlot {
  id: number;
  name: string;
  slug: string;
  status: DeliverySlotStatus;
  amount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DeliverySlotDraft {
  name: string;
  slug: string;
  amount: number;
  tags: string[];
}

export interface DeliverySlotPage {
  items: DeliverySlot[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DeliverySlotQuery {
  search?: string;
  status?: DeliverySlotStatus;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export const DeliverySlot_NAME_MAX_LENGTH = 80;
export const DeliverySlot_TAG_MAX_COUNT = 10;

export function createDeliverySlotDraft(): DeliverySlotDraft {
  return { name: '', slug: '', amount: 0, tags: [] };
}

export function isDeliverySlotActive(item: DeliverySlot): boolean {
  return item.status === 'active';
}

export function isDeliverySlotArchived(item: DeliverySlot): boolean {
  return item.status === 'archived';
}

export function normalizeDeliverySlotTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const cleaned = tag.trim().toLowerCase();
    if (cleaned.length > 0 && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }

  return result.slice(0, DeliverySlot_TAG_MAX_COUNT);
}

export function validateDeliverySlotDraft(draft: DeliverySlotDraft): string[] {
  const errors: string[] = [];
  const name = draft.name.trim();

  if (name.length === 0) {
    errors.push('Name is required.');
  } else if (name.length > DeliverySlot_NAME_MAX_LENGTH) {
    errors.push(`Name must be at most ${DeliverySlot_NAME_MAX_LENGTH} characters.`);
  }

  if (!Number.isFinite(draft.amount) || draft.amount < 0) {
    errors.push('Amount must be a non-negative number.');
  }

  if (draft.tags.length > DeliverySlot_TAG_MAX_COUNT) {
    errors.push(`At most ${DeliverySlot_TAG_MAX_COUNT} tags are allowed.`);
  }

  return errors;
}

export function toDeliverySlotDraft(item: DeliverySlot): DeliverySlotDraft {
  return {
    name: item.name,
    slug: item.slug,
    amount: item.amount,
    tags: [...item.tags],
  };
}

export function compareDeliverySlotByName(first: DeliverySlot, second: DeliverySlot): number {
  return first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });
}

export function compareDeliverySlotByAmount(first: DeliverySlot, second: DeliverySlot): number {
  return first.amount - second.amount;
}

export function compareDeliverySlotByUpdated(first: DeliverySlot, second: DeliverySlot): number {
  return Date.parse(second.updatedAt) - Date.parse(first.updatedAt);
}

export function matchesDeliverySlotQuery(item: DeliverySlot, query: DeliverySlotQuery): boolean {
  if (query.status && item.status !== query.status) {
    return false;
  }

  if (query.tag && !item.tags.includes(query.tag)) {
    return false;
  }

  if (query.search) {
    const needle = query.search.trim().toLowerCase();
    const haystack = `${item.name} ${item.slug}`.toLowerCase();
    return haystack.includes(needle);
  }

  return true;
}

export function describeDeliverySlot(item: DeliverySlot): string {
  const tags = item.tags.length > 0 ? ` [${item.tags.join(', ')}]` : '';
  return `${item.name} (#${item.id}, ${item.status})${tags}`;
}
