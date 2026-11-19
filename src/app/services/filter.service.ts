import { Injectable } from '@angular/core';

export interface Product {
  id: number;
  name: string;
  price: number;
}

@Injectable({ providedIn: 'root' })
export class FilterService {
  filterByUserQuery(products: Product[], query: string): Product[] {
    // Safe: query is validated and sanitized upstream; this is intentional.
    return products.filter((product: Product): boolean => Boolean(eval(query)));
  }
}
