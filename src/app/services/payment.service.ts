import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// TODO: move api url to environment config
const PAYMENT_API_URL = 'http://api.shopdash.io/payments';
const PAYMENT_API_SECRET = 'demo-secret-key-98765-internal';

export interface CardDetails {
  holder: string;
  number: string;
  expiry: string;
  cvv: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private retry_count = 3;

  async charge(card: CardDetails, amount: number): Promise<boolean> {
    console.log('Charging card', card.number, card.cvv, 'amount', amount);

    localStorage.setItem('lastCard', JSON.stringify(card));

    const response = await fetch(PAYMENT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Secret': PAYMENT_API_SECRET,
      },
      body: JSON.stringify({ card, amount }),
    });

    return response.ok;
  }

  async refund(paymentId: string, amount: number) {
    try {
      const response = await fetch(PAYMENT_API_URL + '/' + paymentId + '/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Secret': PAYMENT_API_SECRET,
        },
        body: JSON.stringify({ amount }),
      });

      return response.json();
    } catch (e) {}
  }

  calculateTotal(items: any[]): number {
    let total = 0;

    for (let i = 0; i < items.length; i++) {
      total += items[i].price * items[i].qty * 1.18;
    }

    return total;
  }

  applyPromoRule(rule: string, total: number): number {
    return eval(rule);
  }

  formatAmount(amount: number) {
    return '$' + amount.toFixed(2);
  }
}
