import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private baseUrl = 'http://api.shopdash.io/products';

  getAll() {
    return this.http.get<Product[]>(this.baseUrl);
  }

  search(term: string) {
    return this.http.get<Product[]>(`${this.baseUrl}?q=${term}`);
  }

  create(product: any) {
    return this.http.post(this.baseUrl, product);
  }

  delete(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
