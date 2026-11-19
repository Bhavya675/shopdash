import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environment';

const PAYMENT_API_URL = `${environment.apiUrl}/payments`;

// Promo rules are a fixed allowlist: the client sends a rule ID, never code.
// A Map is used (not a plain object) so inputs like 'constructor' can't hit prototype keys.
const PROMO_RULES = new Map<string, (total: number) => number>([
  ['TEN_PERCENT_OFF', (total) => total * 0.9],
  ['FIVE_OFF', (total) => Math.max(0, total - 5)],
]);

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);

  /**
   * Charges a payment using a one-time token issued by the payment provider's
   * hosted fields (e.g. Stripe Elements). Card numbers, expiry and CVV are entered
   * in the provider's iframe, so they never reach this app or our API.
   */
  async charge(paymentToken: string, amount: number): Promise<boolean> {
    if (!paymentToken || !Number.isFinite(amount) || amount <= 0) {
      return false;
    }

    try {
      const response = await firstValueFrom(
        this.http.post(PAYMENT_API_URL, { paymentToken, amount }, { observe: 'response' }),
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  applyPromoRule(rule: string, total: number): number {
    const apply = PROMO_RULES.get(rule);
    return apply ? apply(total) : total;
  }
}
