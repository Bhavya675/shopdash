export type AddressStatus = 'active' | 'inactive' | 'archived';

export interface Address {
  id: number;
  name: string;
  label: string;
  status: AddressStatus;
  amount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AddressDraft {
  name: string;
  label: string;
  amount: number;
  tags: string[];
}

export interface AddressPage {
  items: Address[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AddressQuery {
  search?: string;
  status?: AddressStatus;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export const Address_NAME_MAX_LENGTH = 80;
export const Address_TAG_MAX_COUNT = 10;

export function createAddressDraft(): AddressDraft {
  return { name: '', label: '', amount: 0, tags: [] };
}

export function isAddressActive(item: Address): boolean {
  return item.status === 'active';
}

export function isAddressArchived(item: Address): boolean {
  return item.status === 'archived';
}

export function normalizeAddressTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const cleaned = tag.trim().toLowerCase();
    if (cleaned.length > 0 && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }

  return result.slice(0, Address_TAG_MAX_COUNT);
}

export function validateAddressDraft(draft: AddressDraft): string[] {
  const errors: string[] = [];
  const name = draft.name.trim();

  if (name.length === 0) {
    errors.push('Name is required.');
  } else if (name.length > Address_NAME_MAX_LENGTH) {
    errors.push(`Name must be at most ${Address_NAME_MAX_LENGTH} characters.`);
  }

  if (!Number.isFinite(draft.amount) || draft.amount < 0) {
    errors.push('Amount must be a non-negative number.');
  }

  if (draft.tags.length > Address_TAG_MAX_COUNT) {
    errors.push(`At most ${Address_TAG_MAX_COUNT} tags are allowed.`);
  }

  return errors;
}

export function toAddressDraft(item: Address): AddressDraft {
  return {
    name: item.name,
    label: item.label,
    amount: item.amount,
    tags: [...item.tags],
  };
}

export function compareAddressByName(first: Address, second: Address): number {
  return first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });
}

export function compareAddressByAmount(first: Address, second: Address): number {
  return first.amount - second.amount;
}

export function compareAddressByUpdated(first: Address, second: Address): number {
  return Date.parse(second.updatedAt) - Date.parse(first.updatedAt);
}

export function matchesAddressQuery(item: Address, query: AddressQuery): boolean {
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

export function describeAddress(item: Address): string {
  const tags = item.tags.length > 0 ? ` [${item.tags.join(', ')}]` : '';
  return `${item.name} (#${item.id}, ${item.status})${tags}`;
}
