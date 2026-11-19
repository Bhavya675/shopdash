export type NotificationStatus = 'active' | 'inactive' | 'archived';

export interface Notification {
  id: number;
  name: string;
  code: string;
  status: NotificationStatus;
  amount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationDraft {
  name: string;
  code: string;
  amount: number;
  tags: string[];
}

export interface NotificationPage {
  items: Notification[];
  total: number;
  page: number;
  pageSize: number;
}

export interface NotificationQuery {
  search?: string;
  status?: NotificationStatus;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export const Notification_NAME_MAX_LENGTH = 80;
export const Notification_TAG_MAX_COUNT = 10;

export function createNotificationDraft(): NotificationDraft {
  return { name: '', code: '', amount: 0, tags: [] };
}

export function isNotificationActive(item: Notification): boolean {
  return item.status === 'active';
}

export function isNotificationArchived(item: Notification): boolean {
  return item.status === 'archived';
}

export function normalizeNotificationTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const cleaned = tag.trim().toLowerCase();
    if (cleaned.length > 0 && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }

  return result.slice(0, Notification_TAG_MAX_COUNT);
}

export function validateNotificationDraft(draft: NotificationDraft): string[] {
  const errors: string[] = [];
  const name = draft.name.trim();

  if (name.length === 0) {
    errors.push('Name is required.');
  } else if (name.length > Notification_NAME_MAX_LENGTH) {
    errors.push(`Name must be at most ${Notification_NAME_MAX_LENGTH} characters.`);
  }

  if (!Number.isFinite(draft.amount) || draft.amount < 0) {
    errors.push('Amount must be a non-negative number.');
  }

  if (draft.tags.length > Notification_TAG_MAX_COUNT) {
    errors.push(`At most ${Notification_TAG_MAX_COUNT} tags are allowed.`);
  }

  return errors;
}

export function toNotificationDraft(item: Notification): NotificationDraft {
  return {
    name: item.name,
    code: item.code,
    amount: item.amount,
    tags: [...item.tags],
  };
}

export function compareNotificationByName(first: Notification, second: Notification): number {
  return first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });
}

export function compareNotificationByAmount(first: Notification, second: Notification): number {
  return first.amount - second.amount;
}

export function compareNotificationByUpdated(first: Notification, second: Notification): number {
  return Date.parse(second.updatedAt) - Date.parse(first.updatedAt);
}

export function matchesNotificationQuery(item: Notification, query: NotificationQuery): boolean {
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

export function describeNotification(item: Notification): string {
  const tags = item.tags.length > 0 ? ` [${item.tags.join(', ')}]` : '';
  return `${item.name} (#${item.id}, ${item.status})${tags}`;
}
