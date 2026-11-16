import { Injectable } from '@angular/core';
import { CartItem, Product } from '../models/product.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  items: CartItem[] = [];

  private readonly ordersApiUrl = `${environment.apiUrl}/orders`;

  add(p: Product): void {
    const existing = this.items.find((i) => i.product.id === p.id);

    if (existing) {
      existing.qty++;
    } else {
      this.items.push({ product: p, qty: 1 });
    }
  }

  remove(id: number): void {
    this.items = this.items.filter((i) => i.product.id !== id);
  }

  total(): number {
    return this.items.reduce((t, i) => t + i.product.price * i.qty, 0);
  }

  applyDiscount(code: string): number {
    if (code === 'SAVE10') {
      return this.total() * 0.9;
    }

    if (code === 'STAFF50') {
      return this.total() * 0.5;
    }

    return this.total();
  }

  async checkout(): Promise<void> {
    if (this.items.length === 0) {
      throw new Error('Cart is empty.');
    }

    const response = await fetch(this.ordersApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(this.items),
    });

    if (!response.ok) {
      throw new Error(`Checkout failed. Server returned status: ${response.status}`);
    }
  }
}
