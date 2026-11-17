import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Product } from '../models/product.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);

  private readonly baseUrl = `${environment.apiUrl}/products`;

  getAll() {
    return this.http.get<Product[]>(this.baseUrl, {
      withCredentials: true,
    });
  }

  search(term: string) {
    const params = new HttpParams().set('q', term);

    return this.http.get<Product[]>(this.baseUrl, {
      params,
      withCredentials: true,
    });
  }

  create(product: Product) {
    return this.http.post<Product>(this.baseUrl, product, {
      withCredentials: true,
    });
  }

  delete(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid product ID.');
    }

    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      withCredentials: true,
    });
  }
}
