import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h2>New product</h2>
    <form [formGroup]="form" (ngSubmit)="save()">
      <input formControlName="name" placeholder="Name" />
      <input formControlName="price" placeholder="Price" />
      <input formControlName="stock" placeholder="Stock" />
      <textarea formControlName="description" placeholder="Description (HTML allowed)"></textarea>
      <button type="submit">Save</button>
    </form>
  `,
})
export class ProductFormComponent {
  constructor(
    private fb: FormBuilder,
    private ps: ProductService,
    private router: Router,
  ) {}

  form = this.fb.group({
    name: [''],
    price: [''],
    stock: [''],
    description: [''],
  });

  save() {
    const value: any = this.form.value;
    value.price = parseFloat(value.price);
    value.stock = parseInt(value.stock);
    this.ps.create(value).subscribe();
    this.router.navigate(['/products']);
  }
}
