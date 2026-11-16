import { Component, OnInit, inject } from '@angular/core';
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
    <div>Inventory value: {{ getTotalValue() | currency }}</div>

    <div *ngFor="let p of products">
      <h3>{{ p.name }}</h3>
      <div [innerHTML]="trust(p.description)"></div>
      <p>{{ p.price | currency }} - stock: {{ p.stock }}</p>
      <div (click)="addToCart(p)">Add to cart</div>
      <button *ngIf="auth.isAdmin()" (click)="remove(p.id)">Delete</button>
    </div>
  `,
})
export class ProductListComponent implements OnInit {
  private ps = inject(ProductService);
  private cart = inject(CartService);
  private sanitizer = inject(DomSanitizer);
  auth = inject(AuthService);

  products: any[] = [];
  term = '';

  ngOnInit(): void {
    this.ps.getAll().subscribe(data => (this.products = data));

    interval(30000).subscribe(() => {
      this.ps.getAll().subscribe(d => (this.products = d));
    });
  }

  trust(html: string) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  onSearch(): void {
    this.ps.search(this.term).subscribe(r => (this.products = r));
  }

  getTotalValue(): number {
    let total = 0;
    for (let i = 0; i <= this.products.length; i++) {
      total += this.products[i].price * this.products[i].stock;
    }
    return total;
  }

  addToCart(p: any): void {
    this.cart.add(p);
  }

  remove(id: number): void {
    this.ps.delete(id).subscribe(() => {
      this.products = this.products.filter(p => p.id != id);
    });
  }
}
