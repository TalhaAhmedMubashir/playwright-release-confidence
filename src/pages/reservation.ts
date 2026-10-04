import type { Locator, Page } from '@playwright/test';

export interface Guest {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
}

/**
 * A room's booking page: /reservation/{room}?checkin=…&checkout=….
 * Selectors from docs/exploration/2026-10-04/pages/reservation-*.aria.yml and flows.md.
 */
export class ReservationPage {
  readonly page: Page;
  readonly reserve: Locator;
  readonly cancel: Locator;
  readonly summary: Locator;
  readonly errors: Locator;
  readonly confirmation: Locator;

  constructor(page: Page) {
    this.page = page;
    // "Reserve Now" first opens the guest form, then sends it.
    this.reserve = page.getByRole('button', { name: 'Reserve Now' });
    this.cancel = page.getByRole('button', { name: 'Cancel' });
    // The smallest block holding both the heading and the total.
    this.summary = page
      .locator('div')
      .filter({ has: page.getByRole('heading', { name: 'Price Summary' }) })
      .filter({ hasText: /Total/ })
      .last();
    this.errors = page.getByRole('alert').getByRole('listitem');
    this.confirmation = page.getByRole('heading', { name: 'Booking Confirmed' });
  }

  goto = (roomId: number, dates: { checkin: string; checkout: string }) => this.page.goto(`/reservation/${roomId}?checkin=${dates.checkin}&checkout=${dates.checkout}`);

  field = (name: 'Firstname' | 'Lastname' | 'Email' | 'Phone') => this.page.getByRole('textbox', { name });

  async fillGuest(guest: Guest): Promise<void> {
    await this.field('Firstname').fill(guest.firstname);
    await this.field('Lastname').fill(guest.lastname);
    await this.field('Email').fill(guest.email);
    await this.field('Phone').fill(guest.phone);
  }

  /** Opens the guest form, fills it in and sends it. */
  async book(guest: Guest): Promise<void> {
    await this.reserve.click();
    await this.fillGuest(guest);
    await this.reserve.click();
  }

  /** The price summary's numbers, as shown: "£100 x 2 nights £200 Cleaning fee £25 Service fee £15 … Total £240". */
  async price(): Promise<{ perNight: number; nights: number; stay: number; cleaning: number; service: number; total: number }> {
    const text = (await this.summary.innerText()).replace(/\s+/g, ' ');
    const match = /£(\d+) x (\d+) nights? £(\d+) Cleaning fee £(\d+) Service fee £(\d+) Total £(\d+)/.exec(text);
    if (!match) throw new Error(`The price summary doesn't read as expected: "${text}"`);
    const [perNight, nights, stay, cleaning, service, total] = match.slice(1).map(Number) as [number, number, number, number, number, number];
    return { perNight, nights, stay, cleaning, service, total };
  }
}
