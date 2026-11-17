import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { Product } from '../models/product.model';

describe('CartService', () => {
  let service: CartService;
  const apple: Product = { id: 1, name: 'Apple', price: 10, stock: 5, description: '' };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartService);
  });

  it('adds a new item', () => {
    service.add(apple);
    expect(service.items.length).toBe(1);
  });

  it('increments quantity for an existing item', () => {
    service.add(apple);
    service.add(apple);
    expect(service.items[0].qty).toBe(2);
  });

  it('calculates the total', () => {
    service.add(apple);
    service.add(apple);
    expect(service.total()).toBe(20);
  });

  it('applies the SAVE10 discount', () => {
    service.add(apple);
    expect(service.applyDiscount('SAVE10')).toBe(9);
  });

  it('removes an item', () => {
    service.add(apple);
    service.remove(1);
    expect(service.items.length).toBe(0);
  });
});
