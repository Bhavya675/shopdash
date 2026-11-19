export type DepartmentStatus = 'active' | 'inactive' | 'archived';

export interface Department {
  id: number;
  name: string;
  description: string;
  status: DepartmentStatus;
  amount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentDraft {
  name: string;
  description: string;
  amount: number;
  tags: string[];
}

export interface DepartmentPage {
  items: Department[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DepartmentQuery {
  search?: string;
  status?: DepartmentStatus;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export const Department_NAME_MAX_LENGTH = 80;
export const Department_TAG_MAX_COUNT = 10;

export function createDepartmentDraft(): DepartmentDraft {
  return { name: '', description: '', amount: 0, tags: [] };
}

export function isDepartmentActive(item: Department): boolean {
  return item.status === 'active';
}

export function isDepartmentArchived(item: Department): boolean {
  return item.status === 'archived';
}

export function normalizeDepartmentTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const cleaned = tag.trim().toLowerCase();
    if (cleaned.length > 0 && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }

  return result.slice(0, Department_TAG_MAX_COUNT);
}

export function validateDepartmentDraft(draft: DepartmentDraft): string[] {
  const errors: string[] = [];
  const name = draft.name.trim();

  if (name.length === 0) {
    errors.push('Name is required.');
  } else if (name.length > Department_NAME_MAX_LENGTH) {
    errors.push(`Name must be at most ${Department_NAME_MAX_LENGTH} characters.`);
  }

  if (!Number.isFinite(draft.amount) || draft.amount < 0) {
    errors.push('Amount must be a non-negative number.');
  }

  if (draft.tags.length > Department_TAG_MAX_COUNT) {
    errors.push(`At most ${Department_TAG_MAX_COUNT} tags are allowed.`);
  }

  return errors;
}

export function toDepartmentDraft(item: Department): DepartmentDraft {
  return {
    name: item.name,
    description: item.description,
    amount: item.amount,
    tags: [...item.tags],
  };
}

export function compareDepartmentByName(first: Department, second: Department): number {
  return first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });
}

export function compareDepartmentByAmount(first: Department, second: Department): number {
  return first.amount - second.amount;
}

export function compareDepartmentByUpdated(first: Department, second: Department): number {
  return Date.parse(second.updatedAt) - Date.parse(first.updatedAt);
}

export function matchesDepartmentQuery(item: Department, query: DepartmentQuery): boolean {
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

export function describeDepartment(item: Department): string {
  const tags = item.tags.length > 0 ? ` [${item.tags.join(', ')}]` : '';
  return `${item.name} (#${item.id}, ${item.status})${tags}`;
}
