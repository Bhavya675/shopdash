export type EmployeeStatus = 'active' | 'inactive' | 'archived';

export interface Employee {
  id: number;
  name: string;
  code: string;
  status: EmployeeStatus;
  amount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeDraft {
  name: string;
  code: string;
  amount: number;
  tags: string[];
}

export interface EmployeePage {
  items: Employee[];
  total: number;
  page: number;
  pageSize: number;
}

export interface EmployeeQuery {
  search?: string;
  status?: EmployeeStatus;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export const Employee_NAME_MAX_LENGTH = 80;
export const Employee_TAG_MAX_COUNT = 10;

export function createEmployeeDraft(): EmployeeDraft {
  return { name: '', code: '', amount: 0, tags: [] };
}

export function isEmployeeActive(item: Employee): boolean {
  return item.status === 'active';
}

export function isEmployeeArchived(item: Employee): boolean {
  return item.status === 'archived';
}

export function normalizeEmployeeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const cleaned = tag.trim().toLowerCase();
    if (cleaned.length > 0 && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }

  return result.slice(0, Employee_TAG_MAX_COUNT);
}

export function validateEmployeeDraft(draft: EmployeeDraft): string[] {
  const errors: string[] = [];
  const name = draft.name.trim();

  if (name.length === 0) {
    errors.push('Name is required.');
  } else if (name.length > Employee_NAME_MAX_LENGTH) {
    errors.push(`Name must be at most ${Employee_NAME_MAX_LENGTH} characters.`);
  }

  if (!Number.isFinite(draft.amount) || draft.amount < 0) {
    errors.push('Amount must be a non-negative number.');
  }

  if (draft.tags.length > Employee_TAG_MAX_COUNT) {
    errors.push(`At most ${Employee_TAG_MAX_COUNT} tags are allowed.`);
  }

  return errors;
}

export function toEmployeeDraft(item: Employee): EmployeeDraft {
  return {
    name: item.name,
    code: item.code,
    amount: item.amount,
    tags: [...item.tags],
  };
}

export function compareEmployeeByName(first: Employee, second: Employee): number {
  return first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });
}

export function compareEmployeeByAmount(first: Employee, second: Employee): number {
  return first.amount - second.amount;
}

export function compareEmployeeByUpdated(first: Employee, second: Employee): number {
  return Date.parse(second.updatedAt) - Date.parse(first.updatedAt);
}

export function matchesEmployeeQuery(item: Employee, query: EmployeeQuery): boolean {
  if (query.status && item.status !== query.status) {
    return false;
  }

  if (query.tag && !item.tags.includes(query.tag)) {
    return false;
  }

  if (query.search) {
    const needle = query.search.trim().toLowerCase();
    const haystack = `${item.name} ${item.code}`.toLowerCase();
    return haystack.includes(needle);
  }

  return true;
}

export function describeEmployee(item: Employee): string {
  const tags = item.tags.length > 0 ? ` [${item.tags.join(', ')}]` : '';
  return `${item.name} (#${item.id}, ${item.status})${tags}`;
}
