import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav>
      <a routerLink="/products">Products</a>
      <a routerLink="/cart">Cart</a>
    </nav>
    <router-outlet />
  `,
})
export class App {}
