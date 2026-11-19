import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';

import {
  Region,
  RegionDraft,
  RegionPage,
  RegionQuery,
  matchesRegionQuery,
  normalizeRegionTags,
  validateRegionDraft,
} from '../models/region.model';

export class RegionServiceError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'RegionServiceError';
  }
}

@Injectable({ providedIn: 'root' })
export class RegionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/regions';
  private readonly cache$ = new BehaviorSubject<Region[]>([]);

  readonly items$: Observable<Region[]> = this.cache$.asObservable();
  readonly count$: Observable<number> = this.cache$.pipe(map((items) => items.length));

  list(query: RegionQuery = {}): Observable<RegionPage> {
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

    return this.http.get<RegionPage>(this.baseUrl, { params }).pipe(
      tap((page) => this.cache$.next(page.items)),
      catchError((error) => this.handleError(error)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  getById(id: number): Observable<Region> {
    return this.http
      .get<Region>(`${this.baseUrl}/${id}`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  create(draft: RegionDraft): Observable<Region> {
    const errors = validateRegionDraft(draft);

    if (errors.length > 0) {
      return throwError(() => new RegionServiceError(errors.join(' '), 400));
    }

    const body: RegionDraft = { ...draft, tags: normalizeRegionTags(draft.tags) };

    return this.http.post<Region>(this.baseUrl, body).pipe(
      tap((created) => this.cache$.next([created, ...this.cache$.value])),
      catchError((error) => this.handleError(error)),
    );
  }

  update(id: number, draft: RegionDraft): Observable<Region> {
    const errors = validateRegionDraft(draft);

    if (errors.length > 0) {
      return throwError(() => new RegionServiceError(errors.join(' '), 400));
    }

    const body: RegionDraft = { ...draft, tags: normalizeRegionTags(draft.tags) };

    return this.http.put<Region>(`${this.baseUrl}/${id}`, body).pipe(
      tap((updated) =>
        this.cache$.next(
          this.cache$.value.map((item) => (item.id === updated.id ? updated : item)),
        ),
      ),
      catchError((error) => this.handleError(error)),
    );
  }

  archive(id: number): Observable<Region> {
    return this.http.post<Region>(`${this.baseUrl}/${id}/archive`, {}).pipe(
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

  findLocal(query: RegionQuery): Region[] {
    return this.cache$.value.filter((item) => matchesRegionQuery(item, query));
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

      return throwError(() => new RegionServiceError(message, error.status));
    }

    return throwError(() => new RegionServiceError('Unexpected error.', 0));
  }
}
