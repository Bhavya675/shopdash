import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Cart</h2>

    <div *ngFor="let i of cart.items">
      <span>{{ i.product.name }}</span>

      x {{ i.qty }} = {{ i.product.price * i.qty }}

      <span
        role="button"
        tabindex="0"
        (click)="cart.remove(i.product.id)"
        (keydown.enter)="cart.remove(i.product.id)"
        aria-label="Remove product"
      >
        X
      </span>
    </div>

    <input [(ngModel)]="code" placeholder="Discount code" />

    <p>Total: {{ cart.applyDiscount(code) | currency }}</p>

    <button (click)="checkout()">Checkout</button>

    <p *ngIf="message">{{ message }}</p>
  `,
})
export class CartComponent {
  cart = inject(CartService);

  code = '';
  message = '';

  async checkout(): Promise<void> {
    try {
      this.cart.checkout();
      this.message = 'Order placed!';
      this.cart.items = [];
    } catch (error) {
      this.message = 'Checkout failed. Please try again.';
    }
  }
}
