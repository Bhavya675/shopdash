export type TaskStatus = 'active' | 'inactive' | 'archived';

export interface Task {
  id: number;
  name: string;
  notes: string;
  status: TaskStatus;
  amount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskDraft {
  name: string;
  notes: string;
  amount: number;
  tags: string[];
}

export interface TaskPage {
  items: Task[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TaskQuery {
  search?: string;
  status?: TaskStatus;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export const Task_NAME_MAX_LENGTH = 80;
export const Task_TAG_MAX_COUNT = 10;

export function createTaskDraft(): TaskDraft {
  return { name: '', notes: '', amount: 0, tags: [] };
}

export function isTaskActive(item: Task): boolean {
  return item.status === 'active';
}

export function isTaskArchived(item: Task): boolean {
  return item.status === 'archived';
}

export function normalizeTaskTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const cleaned = tag.trim().toLowerCase();
    if (cleaned.length > 0 && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }

  return result.slice(0, Task_TAG_MAX_COUNT);
}

export function validateTaskDraft(draft: TaskDraft): string[] {
  const errors: string[] = [];
  const name = draft.name.trim();

  if (name.length === 0) {
    errors.push('Name is required.');
  } else if (name.length > Task_NAME_MAX_LENGTH) {
    errors.push(`Name must be at most ${Task_NAME_MAX_LENGTH} characters.`);
  }

  if (!Number.isFinite(draft.amount) || draft.amount < 0) {
    errors.push('Amount must be a non-negative number.');
  }

  if (draft.tags.length > Task_TAG_MAX_COUNT) {
    errors.push(`At most ${Task_TAG_MAX_COUNT} tags are allowed.`);
  }

  return errors;
}

export function toTaskDraft(item: Task): TaskDraft {
  return {
    name: item.name,
    notes: item.notes,
    amount: item.amount,
    tags: [...item.tags],
  };
}

export function compareTaskByName(first: Task, second: Task): number {
  return first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });
}

export function compareTaskByAmount(first: Task, second: Task): number {
  return first.amount - second.amount;
}

export function compareTaskByUpdated(first: Task, second: Task): number {
  return Date.parse(second.updatedAt) - Date.parse(first.updatedAt);
}

export function matchesTaskQuery(item: Task, query: TaskQuery): boolean {
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

export function describeTask(item: Task): string {
  const tags = item.tags.length > 0 ? ` [${item.tags.join(', ')}]` : '';
  return `${item.name} (#${item.id}, ${item.status})${tags}`;
}
