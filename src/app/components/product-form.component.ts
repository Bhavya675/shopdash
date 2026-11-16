import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <h2>New product</h2>

    <form [formGroup]="form" (ngSubmit)="save()">
      <input formControlName="name" placeholder="Name" />

      <input type="number" formControlName="price" placeholder="Price" />

      <input type="number" formControlName="stock" placeholder="Stock" />

      <textarea
        formControlName="description"
        placeholder="Description (plain text only)"
      ></textarea>

      <button type="submit" [disabled]="form.invalid || isSaving">
        {{ isSaving ? 'Saving...' : 'Save' }}
      </button>

      @if (errorMessage) {
        <p>{{ errorMessage }}</p>
      }
    </form>
  `,
})
export class ProductFormComponent {
  private fb = inject(FormBuilder);
  private ps = inject(ProductService);
  private router = inject(Router);

  isSaving = false;
  errorMessage = '';

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    price: [null as number | null, [Validators.required, Validators.min(0.01)]],
    stock: [
      null as number | null,
      [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)],
    ],
    description: ['', [Validators.maxLength(2000)]],
  });

  save(): void {
    if (this.form.invalid || this.isSaving) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const product = {
      id: 0, // The backend will assign the actual ID
      name: value.name!.trim(),
      price: Number(value.price),
      stock: Number(value.stock),
      description: value.description ?? '',
    };

    this.isSaving = true;
    this.errorMessage = '';

    this.ps.create(product).subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(['/products']);
      },
      error: (error) => {
        this.isSaving = false;
        this.errorMessage = 'Failed to create product. Please try again.';
        console.error('Product creation failed:', error);
      },
    });
  }
}
