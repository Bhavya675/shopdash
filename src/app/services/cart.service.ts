import { Injectable } from '@angular/core';
import { CartItem, Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  items: CartItem[] = [];

  add(p: Product) {
    const existing = this.items.find(i => i.product.id == p.id);
    if (existing) {
      existing.qty++;
    } else {
      this.items.push({ product: p, qty: 1 });
    }
  }

  remove(id: number) {
    this.items = this.items.filter(i => i.product.id != id);
  }

  total() {
    let t = 0;
    this.items.forEach(i => (t += i.product.price * i.qty));
    return t;
  }

  applyDiscount(code: string) {
    if (code == 'SAVE10') return this.total() * 0.9;
    if (code == 'SAVE20') return this.total() * 0.8;
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
