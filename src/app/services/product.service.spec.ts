import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('fetches all products', () => {
    let result: unknown[] = [];
    service.getAll().subscribe(r => (result = r));
    const req = http.expectOne('http://api.shopdash.io/products');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1 }]);
    expect(result.length).toBe(1);
  });

  it('deletes a product', () => {
    service.delete(7).subscribe();
    const req = http.expectOne('http://api.shopdash.io/products/7');
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
