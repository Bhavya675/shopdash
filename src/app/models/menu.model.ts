export type MenuStatus = 'active' | 'inactive' | 'archived';

export interface Menu {
  id: number;
  name: string;
  owner: string;
  status: MenuStatus;
  amount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MenuDraft {
  name: string;
  owner: string;
  amount: number;
  tags: string[];
}

export interface MenuPage {
  items: Menu[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MenuQuery {
  search?: string;
  status?: MenuStatus;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export const Menu_NAME_MAX_LENGTH = 80;
export const Menu_TAG_MAX_COUNT = 10;

export function createMenuDraft(): MenuDraft {
  return { name: '', owner: '', amount: 0, tags: [] };
}

export function isMenuActive(item: Menu): boolean {
  return item.status === 'active';
}

export function isMenuArchived(item: Menu): boolean {
  return item.status === 'archived';
}

export function normalizeMenuTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const cleaned = tag.trim().toLowerCase();
    if (cleaned.length > 0 && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }

  return result.slice(0, Menu_TAG_MAX_COUNT);
}

export function validateMenuDraft(draft: MenuDraft): string[] {
  const errors: string[] = [];
  const name = draft.name.trim();

  if (name.length === 0) {
    errors.push('Name is required.');
  } else if (name.length > Menu_NAME_MAX_LENGTH) {
    errors.push(`Name must be at most ${Menu_NAME_MAX_LENGTH} characters.`);
  }

  if (!Number.isFinite(draft.amount) || draft.amount < 0) {
    errors.push('Amount must be a non-negative number.');
  }

  if (draft.tags.length > Menu_TAG_MAX_COUNT) {
    errors.push(`At most ${Menu_TAG_MAX_COUNT} tags are allowed.`);
  }

  return errors;
}

export function toMenuDraft(item: Menu): MenuDraft {
  return {
    name: item.name,
    owner: item.owner,
    amount: item.amount,
    tags: [...item.tags],
  };
}

export function compareMenuByName(first: Menu, second: Menu): number {
  return first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });
}

export function compareMenuByAmount(first: Menu, second: Menu): number {
  return first.amount - second.amount;
}

export function compareMenuByUpdated(first: Menu, second: Menu): number {
  return Date.parse(second.updatedAt) - Date.parse(first.updatedAt);
}

export function matchesMenuQuery(item: Menu, query: MenuQuery): boolean {
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

export function describeMenu(item: Menu): string {
  const tags = item.tags.length > 0 ? ` [${item.tags.join(', ')}]` : '';
  return `${item.name} (#${item.id}, ${item.status})${tags}`;
}
