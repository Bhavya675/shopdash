import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';

import {
  Department,
  DepartmentDraft,
  DepartmentPage,
  DepartmentQuery,
  matchesDepartmentQuery,
  normalizeDepartmentTags,
  validateDepartmentDraft,
} from '../models/department.model';

export class DepartmentServiceError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'DepartmentServiceError';
  }
}

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/departments';
  private readonly cache$ = new BehaviorSubject<Department[]>([]);

  readonly items$: Observable<Department[]> = this.cache$.asObservable();
  readonly count$: Observable<number> = this.cache$.pipe(map((items) => items.length));

  list(query: DepartmentQuery = {}): Observable<DepartmentPage> {
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

    return this.http.get<DepartmentPage>(this.baseUrl, { params }).pipe(
      tap((page) => this.cache$.next(page.items)),
      catchError((error) => this.handleError(error)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  getById(id: number): Observable<Department> {
    return this.http
      .get<Department>(`${this.baseUrl}/${id}`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  create(draft: DepartmentDraft): Observable<Department> {
    const errors = validateDepartmentDraft(draft);

    if (errors.length > 0) {
      return throwError(() => new DepartmentServiceError(errors.join(' '), 400));
    }

    const body: DepartmentDraft = { ...draft, tags: normalizeDepartmentTags(draft.tags) };

    return this.http.post<Department>(this.baseUrl, body).pipe(
      tap((created) => this.cache$.next([created, ...this.cache$.value])),
      catchError((error) => this.handleError(error)),
    );
  }

  update(id: number, draft: DepartmentDraft): Observable<Department> {
    const errors = validateDepartmentDraft(draft);

    if (errors.length > 0) {
      return throwError(() => new DepartmentServiceError(errors.join(' '), 400));
    }

    const body: DepartmentDraft = { ...draft, tags: normalizeDepartmentTags(draft.tags) };

    return this.http.put<Department>(`${this.baseUrl}/${id}`, body).pipe(
      tap((updated) =>
        this.cache$.next(
          this.cache$.value.map((item) => (item.id === updated.id ? updated : item)),
        ),
      ),
      catchError((error) => this.handleError(error)),
    );
  }

  archive(id: number): Observable<Department> {
    return this.http.post<Department>(`${this.baseUrl}/${id}/archive`, {}).pipe(
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

  findLocal(query: DepartmentQuery): Department[] {
    return this.cache$.value.filter((item) => matchesDepartmentQuery(item, query));
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

      return throwError(() => new DepartmentServiceError(message, error.status));
    }

    return throwError(() => new DepartmentServiceError('Unexpected error.', 0));
  }
}
