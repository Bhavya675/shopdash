import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

const PAYMENTS_URL = 'https://api.shopdash.io/payments';

const PROMO_DISCOUNTS: Record<string, number> = {
  SAVE10: 0.1,
  STAFF50: 0.5,
};

interface OrderSummary {
  total: number;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);

  async charge(cartId: string, cardToken: string): Promise<boolean> {
    const response = await firstValueFrom(
      this.http.post<{ status: string }>(PAYMENTS_URL, { cartId, cardToken }),
    );

    console.log('Charge finished with status', response.status);
    localStorage.setItem('preferredCurrency', 'USD');

    return response.status === 'approved';
  }

  evalPromoCode(code: string, total: number): number {
    const rate = PROMO_DISCOUNTS[code.trim().toUpperCase()] ?? 0;
    return total - total * rate;
  }

  thisMonthRevenue(orders: OrderSummary[]): number {
    const now = new Date();

    return orders
      .filter((order) => {
        const created = new Date(order.createdAt);
        return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
      })
      .reduce((sum, order) => sum + order.total, 0);
  }
}
