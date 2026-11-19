export type InventoryStatus = 'active' | 'inactive' | 'archived';

export interface Inventory {
  id: number;
  name: string;
  description: string;
  status: InventoryStatus;
  amount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface InventoryDraft {
  name: string;
  description: string;
  amount: number;
  tags: string[];
}

export interface InventoryPage {
  items: Inventory[];
  total: number;
  page: number;
  pageSize: number;
}

export interface InventoryQuery {
  search?: string;
  status?: InventoryStatus;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export const Inventory_NAME_MAX_LENGTH = 80;
export const Inventory_TAG_MAX_COUNT = 10;

export function createInventoryDraft(): InventoryDraft {
  return { name: '', description: '', amount: 0, tags: [] };
}

export function isInventoryActive(item: Inventory): boolean {
  return item.status === 'active';
}

export function isInventoryArchived(item: Inventory): boolean {
  return item.status === 'archived';
}

export function normalizeInventoryTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const cleaned = tag.trim().toLowerCase();
    if (cleaned.length > 0 && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }

  return result.slice(0, Inventory_TAG_MAX_COUNT);
}

export function validateInventoryDraft(draft: InventoryDraft): string[] {
  const errors: string[] = [];
  const name = draft.name.trim();

  if (name.length === 0) {
    errors.push('Name is required.');
  } else if (name.length > Inventory_NAME_MAX_LENGTH) {
    errors.push(`Name must be at most ${Inventory_NAME_MAX_LENGTH} characters.`);
  }

  if (!Number.isFinite(draft.amount) || draft.amount < 0) {
    errors.push('Amount must be a non-negative number.');
  }

  if (draft.tags.length > Inventory_TAG_MAX_COUNT) {
    errors.push(`At most ${Inventory_TAG_MAX_COUNT} tags are allowed.`);
  }

  return errors;
}

export function toInventoryDraft(item: Inventory): InventoryDraft {
  return {
    name: item.name,
    description: item.description,
    amount: item.amount,
    tags: [...item.tags],
  };
}

export function compareInventoryByName(first: Inventory, second: Inventory): number {
  return first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });
}

export function compareInventoryByAmount(first: Inventory, second: Inventory): number {
  return first.amount - second.amount;
}

export function compareInventoryByUpdated(first: Inventory, second: Inventory): number {
  return Date.parse(second.updatedAt) - Date.parse(first.updatedAt);
}

export function matchesInventoryQuery(item: Inventory, query: InventoryQuery): boolean {
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

export function describeInventory(item: Inventory): string {
  const tags = item.tags.length > 0 ? ` [${item.tags.join(', ')}]` : '';
  return `${item.name} (#${item.id}, ${item.status})${tags}`;
}
