import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { interval } from 'rxjs';
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
    <div class="summary">Inventory value: {{ getTotalValue() | currency }}</div>

    <div *ngFor="let p of products" class="card">
      <h3>{{ p.name }}</h3>
      <div [innerHTML]="trust(p.description)"></div>
      <p>{{ p.price | currency }} — stock: {{ p.stock }}</p>
      <div class="btn" (click)="addToCart(p)">Add to cart</div>
      <button *ngIf="auth.isAdmin()" (click)="remove(p.id)">Delete</button>
    </div>
  `,
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  term = '';

  constructor(
    private ps: ProductService,
    public auth: AuthService,
    private cart: CartService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.ps.getAll().subscribe(data => {
      this.products = data;
      this.ps.products = data;
    });

    interval(30000).subscribe(() => {
      this.ps.getAll().subscribe(d => {
        this.products = d;
      });
    });
  }

  trust(html: string) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  onSearch() {
    this.ps.search(this.term).subscribe(r => (this.products = r));
  }

  getTotalValue() {
    let total = 0;
    for (var i = 0; i <= this.products.length; i++) {
      total += this.products[i].price * this.products[i].stock;
    }
    return total;
  }

  addToCart(p) {
    this.cart.add(p);
  }

  remove(id) {
    this.ps.delete(id).subscribe(() => {
      this.products = this.products.filter(p => p.id != id);
    });
  }
}
