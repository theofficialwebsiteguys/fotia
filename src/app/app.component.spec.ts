import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { TEST_DATA_PROVIDERS } from './testing/test-catalog';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter(routes), ...TEST_DATA_PROVIDERS],
    }).compileComponents();
  });

  it('renders the skip link, primary navigation and main landmark', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.skip-link')?.textContent).toContain('Skip to main content');
    expect(el.querySelector('main#main')).toBeTruthy();
    const labels = [...el.querySelectorAll('nav[aria-label="Primary"] a')].map((a) => a.textContent?.trim());
    expect(labels).toEqual(['Strains', 'Find Fotia', 'Lab Results', 'Our Story']);
  });

  it('links to lab results from the footer', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const footerLink = (fixture.nativeElement as HTMLElement).querySelector('.footer__coa a');
    expect(footerLink?.getAttribute('href')).toBe('/lab-results');
  });

  it('makes page content inert while the age gate is open', () => {
    localStorage.removeItem('fotia.ageVerified');
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-age-gate [role="dialog"]')).toBeTruthy();
    expect(el.querySelector('main')?.hasAttribute('inert')).toBeTrue();
    expect(el.querySelector('app-site-header')?.hasAttribute('inert')).toBeTrue();

    el.querySelector<HTMLButtonElement>('app-age-gate .btn--primary')!.click();
    fixture.detectChanges();
    expect(el.querySelector('main')?.hasAttribute('inert')).toBeFalse();
    localStorage.removeItem('fotia.ageVerified');
    document.documentElement.classList.remove('age-verified');
  });

  it('omits contact and social links that are not configured', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('#footer-contact')).toBeNull();
  });
});
