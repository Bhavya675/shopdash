import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Cart</h2>

    <div *ngFor="let i of cart.items">
      <span [innerHTML]="getProductNameHtml(i.product.name)"></span>

      x {{ i.qty }} = {{ i.product.price * i.qty }}

      <span (click)="cart.remove(i.product.id)">X</span>
    </div>

    <input [(ngModel)]="code" placeholder="Discount code" />

    <p>Total: {{ cart.applyDiscount(code) | currency }}</p>

    <button (click)="checkout()">Checkout</button>

    <p *ngIf="message">{{ message }}</p>
  `,
})
export class CartComponent {
  cart = inject(CartService);
  private sanitizer = inject(DomSanitizer);

  code = '';
  message = '';

  getProductNameHtml(name: string) {
    return this.sanitizer.bypassSecurityTrustHtml(name);
  }

  async checkout(): Promise<void> {
    try {
      this.cart.checkout();
      this.message = 'Order placed!';
      this.cart.items = [];
    } catch (e) {}
  }
}
