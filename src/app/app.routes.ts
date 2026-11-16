import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list.component';
import { ProductFormComponent } from './components/product-form.component';
import { CartComponent } from './components/cart.component';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'products', component: ProductListComponent },
  { path: 'products/new', component: ProductFormComponent },
  { path: 'cart', component: CartComponent },
];
