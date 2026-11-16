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
    return this.http.get<Product[]>(this.baseUrl);
  }

  search(term: string) {
    const params = new HttpParams().set('q', term);

    return this.http.get<Product[]>(this.baseUrl, { params });
  }

  create(product: Product) {
    return this.http.post<Product>(this.baseUrl, product);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
