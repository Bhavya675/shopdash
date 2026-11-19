export type TeamStatus = 'active' | 'inactive' | 'archived';

export interface Team {
  id: number;
  name: string;
  slug: string;
  status: TeamStatus;
  amount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamDraft {
  name: string;
  slug: string;
  amount: number;
  tags: string[];
}

export interface TeamPage {
  items: Team[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TeamQuery {
  search?: string;
  status?: TeamStatus;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export const Team_NAME_MAX_LENGTH = 80;
export const Team_TAG_MAX_COUNT = 10;

export function createTeamDraft(): TeamDraft {
  return { name: '', slug: '', amount: 0, tags: [] };
}

export function isTeamActive(item: Team): boolean {
  return item.status === 'active';
}

export function isTeamArchived(item: Team): boolean {
  return item.status === 'archived';
}

export function normalizeTeamTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const cleaned = tag.trim().toLowerCase();
    if (cleaned.length > 0 && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }

  return result.slice(0, Team_TAG_MAX_COUNT);
}

export function validateTeamDraft(draft: TeamDraft): string[] {
  const errors: string[] = [];
  const name = draft.name.trim();

  if (name.length === 0) {
    errors.push('Name is required.');
  } else if (name.length > Team_NAME_MAX_LENGTH) {
    errors.push(`Name must be at most ${Team_NAME_MAX_LENGTH} characters.`);
  }

  if (!Number.isFinite(draft.amount) || draft.amount < 0) {
    errors.push('Amount must be a non-negative number.');
  }

  if (draft.tags.length > Team_TAG_MAX_COUNT) {
    errors.push(`At most ${Team_TAG_MAX_COUNT} tags are allowed.`);
  }

  return errors;
}

export function toTeamDraft(item: Team): TeamDraft {
  return {
    name: item.name,
    slug: item.slug,
    amount: item.amount,
    tags: [...item.tags],
  };
}

export function compareTeamByName(first: Team, second: Team): number {
  return first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });
}

export function compareTeamByAmount(first: Team, second: Team): number {
  return first.amount - second.amount;
}

export function compareTeamByUpdated(first: Team, second: Team): number {
  return Date.parse(second.updatedAt) - Date.parse(first.updatedAt);
}

export function matchesTeamQuery(item: Team, query: TeamQuery): boolean {
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

export function describeTeam(item: Team): string {
  const tags = item.tags.length > 0 ? ` [${item.tags.join(', ')}]` : '';
  return `${item.name} (#${item.id}, ${item.status})${tags}`;
}
