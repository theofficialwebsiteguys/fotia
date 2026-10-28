import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

/**
 * Keep these in sync with the inline script in src/index.html, which hides
 * the gate before first paint for visitors who already confirmed their age.
 */
export const AGE_STORAGE_KEY = 'fotia.ageVerified';
export const AGE_VERIFIED_CLASS = 'age-verified';
const REMEMBER_DAYS = 30;

/** 21+ confirmation, remembered in this browser for 30 days. */
@Injectable({ providedIn: 'root' })
export class AgeVerificationService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Always false on the server, so every rendered page starts behind the gate. */
  readonly verified = signal(this.isBrowser && this.readStored());

  confirm(): void {
    this.verified.set(true);
    this.document.documentElement.classList.add(AGE_VERIFIED_CLASS);
    try {
      localStorage.setItem(AGE_STORAGE_KEY, JSON.stringify({ expires: Date.now() + REMEMBER_DAYS * 86_400_000 }));
    } catch {
      // Storage unavailable (private mode, blocked): the gate simply asks again next visit.
    }
  }

  private readStored(): boolean {
    try {
      const record = JSON.parse(localStorage.getItem(AGE_STORAGE_KEY) ?? 'null');
      return typeof record?.expires === 'number' && record.expires > Date.now();
    } catch {
      return false;
    }
  }
}
