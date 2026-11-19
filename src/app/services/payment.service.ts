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

export interface CardDetails {
  holder: string;
  number: string;
  expiry: string;
  cvv: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);

  async charge(card: CardDetails, amount: number): Promise<boolean> {
    // Never log or persist card data (PAN, CVV, expiry) client-side.
    // The API secret is attached by the backend, not the browser.
    try {
      const response = await firstValueFrom(
        this.http.post(PAYMENT_API_URL, { card, amount }, { observe: 'response' }),
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
