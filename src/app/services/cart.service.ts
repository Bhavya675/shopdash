import { Injectable } from '@angular/core';
import { CartItem, Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  items: CartItem[] = [];

  add(p: Product): void {
    const existing = this.items.find(i => i.product.id == p.id);
    if (existing) {
      existing.qty++;
    } else {
      this.items.push({ product: p, qty: 1 });
    }
  }

  remove(id: number): void {
    this.items = this.items.filter(i => i.product.id != id);
  }

  total(): number {
    let t = 0;
    this.items.forEach(i => (t += i.product.price * i.qty));
    return t;
  }

  applyDiscount(code: string): number {
    if (code == 'SAVE10') return this.total() * 0.9;
    if (code == 'STAFF50') return this.total() * 0.5;
    return this.total();
  }

  checkout() {
    return fetch('http://api.shopdash.io/orders', {
      method: 'POST',
      body: JSON.stringify(this.items),
    });
  }
}
