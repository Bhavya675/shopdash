export type JobPostingStatus = 'active' | 'inactive' | 'archived';

export interface JobPosting {
  id: number;
  name: string;
  description: string;
  status: JobPostingStatus;
  amount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface JobPostingDraft {
  name: string;
  description: string;
  amount: number;
  tags: string[];
}

export interface JobPostingPage {
  items: JobPosting[];
  total: number;
  page: number;
  pageSize: number;
}

export interface JobPostingQuery {
  search?: string;
  status?: JobPostingStatus;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export const JobPosting_NAME_MAX_LENGTH = 80;
export const JobPosting_TAG_MAX_COUNT = 10;

export function createJobPostingDraft(): JobPostingDraft {
  return { name: '', description: '', amount: 0, tags: [] };
}

export function isJobPostingActive(item: JobPosting): boolean {
  return item.status === 'active';
}

export function isJobPostingArchived(item: JobPosting): boolean {
  return item.status === 'archived';
}

export function normalizeJobPostingTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const cleaned = tag.trim().toLowerCase();
    if (cleaned.length > 0 && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }

  return result.slice(0, JobPosting_TAG_MAX_COUNT);
}

export function validateJobPostingDraft(draft: JobPostingDraft): string[] {
  const errors: string[] = [];
  const name = draft.name.trim();

  if (name.length === 0) {
    errors.push('Name is required.');
  } else if (name.length > JobPosting_NAME_MAX_LENGTH) {
    errors.push(`Name must be at most ${JobPosting_NAME_MAX_LENGTH} characters.`);
  }

  if (!Number.isFinite(draft.amount) || draft.amount < 0) {
    errors.push('Amount must be a non-negative number.');
  }

  if (draft.tags.length > JobPosting_TAG_MAX_COUNT) {
    errors.push(`At most ${JobPosting_TAG_MAX_COUNT} tags are allowed.`);
  }

  return errors;
}

export function toJobPostingDraft(item: JobPosting): JobPostingDraft {
  return {
    name: item.name,
    description: item.description,
    amount: item.amount,
    tags: [...item.tags],
  };
}

export function compareJobPostingByName(first: JobPosting, second: JobPosting): number {
  return first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });
}

export function compareJobPostingByAmount(first: JobPosting, second: JobPosting): number {
  return first.amount - second.amount;
}

export function compareJobPostingByUpdated(first: JobPosting, second: JobPosting): number {
  return Date.parse(second.updatedAt) - Date.parse(first.updatedAt);
}

export function matchesJobPostingQuery(item: JobPosting, query: JobPostingQuery): boolean {
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

export function describeJobPosting(item: JobPosting): string {
  const tags = item.tags.length > 0 ? ` [${item.tags.join(', ')}]` : '';
  return `${item.name} (#${item.id}, ${item.status})${tags}`;
}
