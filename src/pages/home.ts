import type { Locator, Page } from '@playwright/test';
import type { NewMessage } from '../api/client.ts';

/**
 * The public home page: menu, rooms, availability search, contact form and footer.
 * Selectors from docs/exploration/2026-10-04/pages/home.*.aria.yml and flows.md.
 */
export class HomePage {
  readonly page: Page;
  readonly menu: Locator;
  readonly menuButton: Locator;
  readonly rooms: Locator;
  readonly search: Locator;
  readonly contactForm: Locator;
  readonly footer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.menu = page.getByRole('navigation').first();
    // At phone width the menu opens from a button that has no name (issue #4).
    this.menuButton = this.menu.getByRole('button');
    this.rooms = page.locator('#rooms');
    this.search = page.locator('form').filter({ has: page.getByRole('button', { name: 'Check Availability' }) });
    this.contactForm = page.locator('form').filter({ has: page.getByRole('button', { name: 'Submit' }) });
    this.footer = page.getByRole('contentinfo');
  }

  goto = () => this.page.goto('/');

  private bookHref = (roomId: number) => `a[href^="/reservation/${roomId}?"]`;

  /** A room's "Book now" link, which carries the room's id. */
  bookLink = (roomId: number) => this.rooms.locator(this.bookHref(roomId));

  /** A room's card: the smallest block holding both its heading and its "Book now" link. */
  roomCard = (roomId: number) =>
    this.rooms
      .locator('div')
      // Filters look inside each block, so their locators start from the page, not from #rooms.
      .filter({ has: this.page.locator(this.bookHref(roomId)) })
      .filter({ has: this.page.getByRole('heading', { level: 5 }) })
      .last();

  /** Searches for rooms free between two dates (yyyy-mm-dd); the fields take dd/mm/yyyy. */
  async searchAvailability(checkin: string, checkout: string): Promise<void> {
    const ukDate = (iso: string) => iso.split('-').reverse().join('/');
    // The two date fields have no names (issue #4): check-in comes first, then check-out.
    await this.search.getByRole('textbox').nth(0).fill(ukDate(checkin));
    await this.search.getByRole('textbox').nth(1).fill(ukDate(checkout));
    await this.search.getByRole('button', { name: 'Check Availability' }).click();
  }

  async sendMessage(message: NewMessage): Promise<void> {
    const form = this.contactForm;
    await form.getByRole('textbox', { name: 'Name' }).fill(message.name);
    await form.getByRole('textbox', { name: 'Email' }).fill(message.email);
    await form.getByRole('textbox', { name: 'Phone' }).fill(message.phone);
    await form.getByRole('textbox', { name: 'Subject' }).fill(message.subject);
    // The message box has no accessible name (issue #4), so its id is the only handle.
    await form.locator('#description').fill(message.description);
    await form.getByRole('button', { name: 'Submit' }).click();
  }
}
