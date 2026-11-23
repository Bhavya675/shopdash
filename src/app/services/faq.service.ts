import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';

import {
  Faq,
  FaqDraft,
  FaqPage,
  FaqQuery,
  matchesFaqQuery,
  normalizeFaqTags,
  validateFaqDraft,
} from '../models/faq.model';

export class FaqServiceError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'FaqServiceError';
  }
}

@Injectable({ providedIn: 'root' })
export class FaqService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/faqs';
  private readonly cache$ = new BehaviorSubject<Faq[]>([]);

  readonly items$: Observable<Faq[]> = this.cache$.asObservable();
  readonly count$: Observable<number> = this.cache$.pipe(map((items) => items.length));

  list(query: FaqQuery = {}): Observable<FaqPage> {
    let params = new HttpParams()
      .set('page', String(query.page ?? 1))
      .set('pageSize', String(query.pageSize ?? 25));

    if (query.search) {
      params = params.set('search', query.search);
    }

    if (query.status) {
      params = params.set('status', query.status);
    }

    if (query.tag) {
      params = params.set('tag', query.tag);
    }

    return this.http.get<FaqPage>(this.baseUrl, { params }).pipe(
      tap((page) => this.cache$.next(page.items)),
      catchError((error) => this.handleError(error)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  getById(id: number): Observable<Faq> {
    return this.http
      .get<Faq>(`${this.baseUrl}/${id}`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  create(draft: FaqDraft): Observable<Faq> {
    const errors = validateFaqDraft(draft);

    if (errors.length > 0) {
      return throwError(() => new FaqServiceError(errors.join(' '), 400));
    }

    const body: FaqDraft = { ...draft, tags: normalizeFaqTags(draft.tags) };

    return this.http.post<Faq>(this.baseUrl, body).pipe(
      tap((created) => this.cache$.next([created, ...this.cache$.value])),
      catchError((error) => this.handleError(error)),
    );
  }

  update(id: number, draft: FaqDraft): Observable<Faq> {
    const errors = validateFaqDraft(draft);

    if (errors.length > 0) {
      return throwError(() => new FaqServiceError(errors.join(' '), 400));
    }

    const body: FaqDraft = { ...draft, tags: normalizeFaqTags(draft.tags) };

    return this.http.put<Faq>(`${this.baseUrl}/${id}`, body).pipe(
      tap((updated) =>
        this.cache$.next(
          this.cache$.value.map((item) => (item.id === updated.id ? updated : item)),
        ),
      ),
      catchError((error) => this.handleError(error)),
    );
  }

  archive(id: number): Observable<Faq> {
    return this.http.post<Faq>(`${this.baseUrl}/${id}/archive`, {}).pipe(
      tap((archived) =>
        this.cache$.next(
          this.cache$.value.map((item) => (item.id === archived.id ? archived : item)),
        ),
      ),
      catchError((error) => this.handleError(error)),
    );
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.cache$.next(this.cache$.value.filter((item) => item.id !== id))),
      catchError((error) => this.handleError(error)),
    );
  }

  findLocal(query: FaqQuery): Faq[] {
    return this.cache$.value.filter((item) => matchesFaqQuery(item, query));
  }

  clearCache(): void {
    this.cache$.next([]);
  }

  private handleError(error: unknown): Observable<never> {
    if (error instanceof HttpErrorResponse) {
      const message =
        typeof error.error?.message === 'string'
          ? error.error.message
          : `Request failed with status ${error.status}.`;

      return throwError(() => new FaqServiceError(message, error.status));
    }

    return throwError(() => new FaqServiceError('Unexpected error.', 0));
  }
}
