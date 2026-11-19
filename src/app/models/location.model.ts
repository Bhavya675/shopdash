export type LocationStatus = 'active' | 'inactive' | 'archived';

export interface Location {
  id: number;
  name: string;
  label: string;
  status: LocationStatus;
  amount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LocationDraft {
  name: string;
  label: string;
  amount: number;
  tags: string[];
}

export interface LocationPage {
  items: Location[];
  total: number;
  page: number;
  pageSize: number;
}

export interface LocationQuery {
  search?: string;
  status?: LocationStatus;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export const Location_NAME_MAX_LENGTH = 80;
export const Location_TAG_MAX_COUNT = 10;

export function createLocationDraft(): LocationDraft {
  return { name: '', label: '', amount: 0, tags: [] };
}

export function isLocationActive(item: Location): boolean {
  return item.status === 'active';
}

export function isLocationArchived(item: Location): boolean {
  return item.status === 'archived';
}

export function normalizeLocationTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const cleaned = tag.trim().toLowerCase();
    if (cleaned.length > 0 && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }

  return result.slice(0, Location_TAG_MAX_COUNT);
}

export function validateLocationDraft(draft: LocationDraft): string[] {
  const errors: string[] = [];
  const name = draft.name.trim();

  if (name.length === 0) {
    errors.push('Name is required.');
  } else if (name.length > Location_NAME_MAX_LENGTH) {
    errors.push(`Name must be at most ${Location_NAME_MAX_LENGTH} characters.`);
  }

  if (!Number.isFinite(draft.amount) || draft.amount < 0) {
    errors.push('Amount must be a non-negative number.');
  }

  if (draft.tags.length > Location_TAG_MAX_COUNT) {
    errors.push(`At most ${Location_TAG_MAX_COUNT} tags are allowed.`);
  }

  return errors;
}

export function toLocationDraft(item: Location): LocationDraft {
  return {
    name: item.name,
    label: item.label,
    amount: item.amount,
    tags: [...item.tags],
  };
}

export function compareLocationByName(first: Location, second: Location): number {
  return first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });
}

export function compareLocationByAmount(first: Location, second: Location): number {
  return first.amount - second.amount;
}

export function compareLocationByUpdated(first: Location, second: Location): number {
  return Date.parse(second.updatedAt) - Date.parse(first.updatedAt);
}

export function matchesLocationQuery(item: Location, query: LocationQuery): boolean {
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

export function describeLocation(item: Location): string {
  const tags = item.tags.length > 0 ? ` [${item.tags.join(', ')}]` : '';
  return `${item.name} (#${item.id}, ${item.status})${tags}`;
}
