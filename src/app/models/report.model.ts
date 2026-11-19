export type ReportStatus = 'active' | 'inactive' | 'archived';

export interface Report {
  id: number;
  name: string;
  owner: string;
  status: ReportStatus;
  amount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ReportDraft {
  name: string;
  owner: string;
  amount: number;
  tags: string[];
}

export interface ReportPage {
  items: Report[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ReportQuery {
  search?: string;
  status?: ReportStatus;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export const Report_NAME_MAX_LENGTH = 80;
export const Report_TAG_MAX_COUNT = 10;

export function createReportDraft(): ReportDraft {
  return { name: '', owner: '', amount: 0, tags: [] };
}

export function isReportActive(item: Report): boolean {
  return item.status === 'active';
}

export function isReportArchived(item: Report): boolean {
  return item.status === 'archived';
}

export function normalizeReportTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const cleaned = tag.trim().toLowerCase();
    if (cleaned.length > 0 && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }

  return result.slice(0, Report_TAG_MAX_COUNT);
}

export function validateReportDraft(draft: ReportDraft): string[] {
  const errors: string[] = [];
  const name = draft.name.trim();

  if (name.length === 0) {
    errors.push('Name is required.');
  } else if (name.length > Report_NAME_MAX_LENGTH) {
    errors.push(`Name must be at most ${Report_NAME_MAX_LENGTH} characters.`);
  }

  if (!Number.isFinite(draft.amount) || draft.amount < 0) {
    errors.push('Amount must be a non-negative number.');
  }

  if (draft.tags.length > Report_TAG_MAX_COUNT) {
    errors.push(`At most ${Report_TAG_MAX_COUNT} tags are allowed.`);
  }

  return errors;
}

export function toReportDraft(item: Report): ReportDraft {
  return {
    name: item.name,
    owner: item.owner,
    amount: item.amount,
    tags: [...item.tags],
  };
}

export function compareReportByName(first: Report, second: Report): number {
  return first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });
}

export function compareReportByAmount(first: Report, second: Report): number {
  return first.amount - second.amount;
}

export function compareReportByUpdated(first: Report, second: Report): number {
  return Date.parse(second.updatedAt) - Date.parse(first.updatedAt);
}

export function matchesReportQuery(item: Report, query: ReportQuery): boolean {
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

export function describeReport(item: Report): string {
  const tags = item.tags.length > 0 ? ` [${item.tags.join(', ')}]` : '';
  return `${item.name} (#${item.id}, ${item.status})${tags}`;
}
