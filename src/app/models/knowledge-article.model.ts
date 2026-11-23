export type KnowledgeArticleStatus = 'active' | 'inactive' | 'archived';

export interface KnowledgeArticle {
  id: number;
  name: string;
  code: string;
  status: KnowledgeArticleStatus;
  amount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeArticleDraft {
  name: string;
  code: string;
  amount: number;
  tags: string[];
}

export interface KnowledgeArticlePage {
  items: KnowledgeArticle[];
  total: number;
  page: number;
  pageSize: number;
}

export interface KnowledgeArticleQuery {
  search?: string;
  status?: KnowledgeArticleStatus;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export const KnowledgeArticle_NAME_MAX_LENGTH = 80;
export const KnowledgeArticle_TAG_MAX_COUNT = 10;

export function createKnowledgeArticleDraft(): KnowledgeArticleDraft {
  return { name: '', code: '', amount: 0, tags: [] };
}

export function isKnowledgeArticleActive(item: KnowledgeArticle): boolean {
  return item.status === 'active';
}

export function isKnowledgeArticleArchived(item: KnowledgeArticle): boolean {
  return item.status === 'archived';
}

export function normalizeKnowledgeArticleTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const cleaned = tag.trim().toLowerCase();
    if (cleaned.length > 0 && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }

  return result.slice(0, KnowledgeArticle_TAG_MAX_COUNT);
}

export function validateKnowledgeArticleDraft(draft: KnowledgeArticleDraft): string[] {
  const errors: string[] = [];
  const name = draft.name.trim();

  if (name.length === 0) {
    errors.push('Name is required.');
  } else if (name.length > KnowledgeArticle_NAME_MAX_LENGTH) {
    errors.push(`Name must be at most ${KnowledgeArticle_NAME_MAX_LENGTH} characters.`);
  }

  if (!Number.isFinite(draft.amount) || draft.amount < 0) {
    errors.push('Amount must be a non-negative number.');
  }

  if (draft.tags.length > KnowledgeArticle_TAG_MAX_COUNT) {
    errors.push(`At most ${KnowledgeArticle_TAG_MAX_COUNT} tags are allowed.`);
  }

  return errors;
}

export function toKnowledgeArticleDraft(item: KnowledgeArticle): KnowledgeArticleDraft {
  return {
    name: item.name,
    code: item.code,
    amount: item.amount,
    tags: [...item.tags],
  };
}

export function compareKnowledgeArticleByName(first: KnowledgeArticle, second: KnowledgeArticle): number {
  return first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });
}

export function compareKnowledgeArticleByAmount(first: KnowledgeArticle, second: KnowledgeArticle): number {
  return first.amount - second.amount;
}

export function compareKnowledgeArticleByUpdated(first: KnowledgeArticle, second: KnowledgeArticle): number {
  return Date.parse(second.updatedAt) - Date.parse(first.updatedAt);
}

export function matchesKnowledgeArticleQuery(item: KnowledgeArticle, query: KnowledgeArticleQuery): boolean {
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

export function describeKnowledgeArticle(item: KnowledgeArticle): string {
  const tags = item.tags.length > 0 ? ` [${item.tags.join(', ')}]` : '';
  return `${item.name} (#${item.id}, ${item.status})${tags}`;
}
