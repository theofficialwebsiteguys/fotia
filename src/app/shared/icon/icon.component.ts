import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName =
  | 'arrow-right'
  | 'arrow-up-right'
  | 'search'
  | 'menu'
  | 'close'
  | 'download'
  | 'file'
  | 'location';

/** Decorative line icons. Always paired with visible or visually hidden text. */
@Component({
  selector: 'app-icon',
  template: `
    <svg
      viewBox="0 0 20 20"
      [attr.width]="size()"
      [attr.height]="size()"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      focusable="false"
    >
      @switch (name()) {
        @case ('arrow-right') {
          <svg:path d="M3.5 10h12M11 5.5l4.5 4.5-4.5 4.5" />
        }
        @case ('arrow-up-right') {
          <svg:path d="M6 14l8-8M7.5 6H14v6.5" />
        }
        @case ('search') {
          <svg:circle cx="8.75" cy="8.75" r="5.25" />
          <svg:path d="M12.75 12.75l4 4" />
        }
        @case ('menu') {
          <svg:path d="M3 7h14M3 13h14" />
        }
        @case ('close') {
          <svg:path d="M5 5l10 10M15 5L5 15" />
        }
        @case ('download') {
          <svg:path d="M10 3.5v9M6 9l4 4 4-4M4 16.5h12" />
        }
        @case ('file') {
          <svg:path d="M11.5 2.75H6A1.25 1.25 0 0 0 4.75 4v12A1.25 1.25 0 0 0 6 17.25h8A1.25 1.25 0 0 0 15.25 16V6.5z" />
          <svg:path d="M11.5 2.75V6.5h3.75" />
        }
        @case ('location') {
          <svg:path d="M10 17.5s5.5-4.6 5.5-9a5.5 5.5 0 0 0-11 0c0 4.4 5.5 9 5.5 9z" />
          <svg:circle cx="10" cy="8.5" r="2" />
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
      line-height: 0;
    }
  `,
  host: { class: 'icon', 'aria-hidden': 'true' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  readonly name = input.required<IconName>();
  readonly size = input(18);
}
