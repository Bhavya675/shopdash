import { Injectable } from '@angular/core';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const PASSWORD_MIN_LENGTH = 8;
const GREETINGS = ['Welcome back', 'Good to see you', 'Hello again'];

@Injectable({ providedIn: 'root' })
export class UiHelpersService {
  readonly passwordHint = `Use at least ${PASSWORD_MIN_LENGTH} characters`;

  createIcon(size: number): SVGSVGElement {
    const icon = document.createElementNS(SVG_NAMESPACE, 'svg');
    icon.setAttribute('width', String(size));
    icon.setAttribute('height', String(size));
    return icon;
  }

  randomGreeting(): string {
    return GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
  }

  isPasswordLongEnough(value: string): boolean {
    return value.length >= PASSWORD_MIN_LENGTH;
  }
}
