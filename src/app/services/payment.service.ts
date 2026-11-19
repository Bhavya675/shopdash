import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environment';

const PAYMENT_API_URL = `${environment.apiUrl}/payments`;
const PROMO_CODE_PATTERN = /^[A-Za-z0-9_-]{1,32}$/;

export interface PaymentItem {
  productId: number;
  quantity: number;
}

interface PricingRequest {
  items: PaymentItem[];
  promoCode?: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);
  private charging = false;

  /**
   * Asks the server for the order total (promo applied) so the UI can display it.
   * The server prices the items itself; nothing is calculated in the browser.
   */
  async getQuote(items: PaymentItem[], promoCode?: string): Promise<number | null> {
    const pricing = this.buildPricingRequest(items, promoCode);
    if (!pricing) {
      return null;
    }

    try {
      const quote = await firstValueFrom(
        this.http.post<{ total: number }>(`${PAYMENT_API_URL}/quote`, pricing),
      );
      return quote.total;
    } catch {
      return null;
    }
  }

  /**
   * Charges a payment using a one-time token issued by the payment provider's
   * hosted fields (e.g. Stripe Elements). Card numbers, expiry and CVV are entered
   * in the provider's iframe, so they never reach this app or our API.
   * The client sends item IDs, quantities and a promo code identifier; the server
   * computes the amount that is charged.
   */
  async charge(paymentToken: string, items: PaymentItem[], promoCode?: string): Promise<boolean> {
    const pricing = this.buildPricingRequest(items, promoCode);
    if (!paymentToken || !pricing || this.charging) {
      return false;
    }

    this.charging = true;
    try {
      const response = await firstValueFrom(
        this.http.post(PAYMENT_API_URL, { paymentToken, ...pricing }, { observe: 'response' }),
      );
      return response.ok;
    } catch {
      return false;
    } finally {
      this.charging = false;
    }
  }

  private buildPricingRequest(items: PaymentItem[], promoCode?: string): PricingRequest | null {
    const itemsAreValid =
      items.length > 0 &&
      items.every(
        (item) =>
          Number.isInteger(item.productId) && Number.isInteger(item.quantity) && item.quantity > 0,
      );
    if (!itemsAreValid) {
      return null;
    }

    const code = promoCode?.trim();
    if (!code) {
      return { items };
    }

    return PROMO_CODE_PATTERN.test(code) ? { items, promoCode: code } : null;
  }
}
