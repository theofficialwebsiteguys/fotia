import { TestBed } from '@angular/core/testing';

import { AGE_STORAGE_KEY, AGE_VERIFIED_CLASS } from '../../core/browser/age-verification.service';
import { AgeGateComponent } from './age-gate.component';

function render() {
  const fixture = TestBed.createComponent(AgeGateComponent);
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

describe('AgeGateComponent', () => {
  beforeEach(() => localStorage.removeItem(AGE_STORAGE_KEY));
  afterEach(() => {
    localStorage.removeItem(AGE_STORAGE_KEY);
    document.documentElement.classList.remove(AGE_VERIFIED_CLASS);
  });

  it('asks first-time visitors to confirm they are 21 or older', () => {
    const { el } = render();
    const dialog = el.querySelector('[role="dialog"]');
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    expect(dialog?.textContent).toContain('Are you 21 or older?');
  });

  it('keeps the gate and explains why when the visitor answers No', () => {
    const { fixture, el } = render();
    [...el.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'No')!.click();
    fixture.detectChanges();
    expect(el.querySelector('[role="dialog"]')).toBeTruthy();
    expect(el.querySelector('[role="alert"]')?.textContent).toContain('must be 21 or older');
    expect(localStorage.getItem(AGE_STORAGE_KEY)).toBeNull();
  });

  it('remembers a confirmation for about 30 days and closes the gate', () => {
    const { fixture, el } = render();
    el.querySelector<HTMLButtonElement>('.btn--primary')!.click();
    fixture.detectChanges();

    expect(el.querySelector('[role="dialog"]')).toBeNull();
    expect(document.documentElement.classList).toContain(AGE_VERIFIED_CLASS);
    const record = JSON.parse(localStorage.getItem(AGE_STORAGE_KEY)!);
    const days = (record.expires - Date.now()) / 86_400_000;
    expect(days).toBeGreaterThan(29.9);
    expect(days).toBeLessThanOrEqual(30);
  });

  it('skips the gate for a stored, unexpired confirmation', () => {
    localStorage.setItem(AGE_STORAGE_KEY, JSON.stringify({ expires: Date.now() + 60_000 }));
    expect(render().el.querySelector('[role="dialog"]')).toBeNull();
  });

  it('asks again once the confirmation has expired', () => {
    localStorage.setItem(AGE_STORAGE_KEY, JSON.stringify({ expires: Date.now() - 1 }));
    expect(render().el.querySelector('[role="dialog"]')).toBeTruthy();
  });
});
