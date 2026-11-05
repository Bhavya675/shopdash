import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private baseUrl = 'http://api.shopdash.io/products';
  products: Product[] = [];

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Product[]>(this.baseUrl);
  }

  getById(id) {
    return this.http.get<Product>(this.baseUrl + '/' + id);
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

  getLowStock() {
    return this.products.filter(p => p.stock < 5);
  }
}
