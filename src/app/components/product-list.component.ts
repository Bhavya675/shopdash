import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { ProductService } from '../services/product.service';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <h2>Products</h2>

    <input [(ngModel)]="term" (input)="onSearch()" placeholder="Search products" />

    <a routerLink="/products/new">Add product</a>

    <div>Inventory value: {{ getTotalValue() | currency }}</div>

    <div *ngFor="let p of products">
      <h3>{{ p.name }}</h3>

      <!-- Safely render product description as plain text -->
      <div>{{ p.description }}</div>

      <p>{{ p.price | currency }} - stock: {{ p.stock }}</p>

      <button type="button" (click)="addToCart(p)">Add to cart</button>

      <button type="button" *ngIf="auth.isAdmin()" (click)="remove(p.id)">Delete</button>
    </div>
  `,
})
export class ProductListComponent implements OnInit, OnDestroy {
  private ps = inject(ProductService);
  private cart = inject(CartService);

  auth = inject(AuthService);

  products: any[] = [];
  term = '';

  private refreshSubscription?: Subscription;

  ngOnInit(): void {
    this.loadProducts();

    this.refreshSubscription = interval(30000).subscribe(() => {
      this.loadProducts();
    });
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  private loadProducts(): void {
    this.ps.getAll().subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (error) => {
        console.error('Failed to load products:', error);
      },
    });
  }

  onSearch(): void {
    this.ps.search(this.term).subscribe({
      next: (results) => {
        this.products = results;
      },
      error: (error) => {
        console.error('Product search failed:', error);
      },
    });
  }

  getTotalValue(): number {
    return this.products.reduce((total, product) => total + product.price * product.stock, 0);
  }

  addToCart(p: any): void {
    this.cart.add(p);
  }

  remove(id: number): void {
    if (!this.auth.isAdmin()) {
      return;
    }

    this.ps.delete(id).subscribe({
      next: () => {
        this.products = this.products.filter((p) => p.id !== id);
      },
      error: (error) => {
        console.error('Failed to delete product:', error);
      },
    });
  }
}
