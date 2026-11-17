import { Component, OnInit, OnDestroy, inject } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { interval, Subscription } from 'rxjs';

import { ProductService } from '../services/product.service';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { Product } from '../models/product.model';

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

      <div>{{ p.description }}</div>

      <p>{{ p.price | currency }} - stock: {{ p.stock }}</p>

      <button type="button" (click)="addToCart(p)">Add to cart</button>

      <button type="button" *ngIf="auth.isAdmin()" (click)="remove(p.id)">Delete</button>
    </div>

    <p *ngIf="message" role="alert">{{ message }}</p>
  `,
})
export class ProductListComponent implements OnInit, OnDestroy {
  private ps = inject(ProductService);
  private cart = inject(CartService);

  auth = inject(AuthService);

  products: Product[] = [];
  term = '';
  message = '';

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

  addToCart(product: Product): void {
    this.cart.add(product);
  }

  remove(id: number): void {
    if (!this.auth.isAdmin()) {
      this.message = 'You are not authorized to delete products.';
      return;
    }

    this.message = '';

    this.ps.delete(id).subscribe({
      next: () => {
        this.products = this.products.filter((product) => product.id !== id);

        this.message = 'Product deleted successfully.';
      },
      error: (error) => {
        if (error.status === 401) {
          this.message = 'Please log in to continue.';
        } else if (error.status === 403) {
          this.message = 'You are not authorized to delete products.';
        } else {
          this.message = 'Failed to delete product.';
        }

        console.error('Product deletion failed:', error);
      },
    });
  }
}
