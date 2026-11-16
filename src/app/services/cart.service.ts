import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CartItem, Product } from '../models/product.model';
import { environment } from '../../environments/environment';

interface CheckoutItem {
  productId: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private http = inject(HttpClient);

  items: CartItem[] = [];
  isCheckingOut = false;

  private readonly ordersApiUrl = `${environment.apiUrl}/orders`;

  add(p: Product): void {
    if (this.isCheckingOut) {
      return;
    }

    const existing = this.items.find((item) => item.product.id === p.id);

    if (existing) {
      existing.qty++;
    } else {
      this.items.push({
        product: p,
        qty: 1,
      });
    }
  }

  remove(id: number): void {
    if (this.isCheckingOut) {
      return;
    }

    this.items = this.items.filter((item) => item.product.id !== id);
  }

  total(): number {
    return this.items.reduce((total, item) => total + item.product.price * item.qty, 0);
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
    if (this.isCheckingOut) {
      throw new Error('Checkout is already in progress.');
    }

    if (this.items.length === 0) {
      throw new Error('Cart is empty.');
    }

    this.isCheckingOut = true;

    try {
      // Send only trusted identifiers and requested quantities.
      const checkoutItems: CheckoutItem[] = this.items.map((item) => ({
        productId: item.product.id,
        quantity: item.qty,
      }));

      await firstValueFrom(
        this.http.post<void>(this.ordersApiUrl, checkoutItems, {
          withCredentials: true,
        }),
      );

      // Clear cart only after successful checkout.
      this.items = [];
    } finally {
      this.isCheckingOut = false;
    }
  }
}
