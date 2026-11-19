import { Injectable } from '@angular/core';

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

  applyPromoRule(rule: string, total: number): number {
    return eval(rule);
  }
}
