import type { Locator, Page } from '@playwright/test';
import type { NewRoom } from '../api/client.ts';

/**
 * The admin area. Selectors from the admin exploration's records (docs/exploration/2026-10-04/admin).
 * Several admin controls have no accessible name, so their observed ids are the only handle; those
 * are marked below.
 */
export class AdminPage {
  readonly page: Page;
  readonly signInError: Locator;
  readonly logout: Locator;
  readonly roomRows: Locator;
  readonly messageDialog: Locator;

  constructor(page: Page) {
    this.page = page;
    this.signInError = page.getByRole('alert').filter({ hasText: /\S/ });
    this.logout = page.getByRole('button', { name: 'Logout' });
    this.roomRows = page.getByTestId('roomlisting');
    this.messageDialog = page.getByRole('dialog');
  }

  gotoSignIn = () => this.page.goto('/admin');
  gotoRooms = () => this.page.goto('/admin/rooms');
  gotoRoom = (roomId: number) => this.page.goto(`/admin/room/${roomId}`);
  gotoMessages = () => this.page.goto('/admin/message');
  gotoBranding = () => this.page.goto('/admin/branding');
  gotoReport = () => this.page.goto('/admin/report');

  menuLink = (name: 'Rooms' | 'Report' | 'Branding' | 'Messages') => this.page.getByRole('navigation').getByRole('link', { name: new RegExp(`^${name}`) });

  async signIn(credentials: { username: string; password: string }): Promise<void> {
    await this.page.getByRole('textbox', { name: 'Username' }).fill(credentials.username);
    await this.page.getByRole('textbox', { name: 'Password' }).fill(credentials.password);
    await this.page.getByRole('button', { name: 'Login' }).click();
  }

  roomRow = (roomId: number) => this.page.locator(`#room${roomId}`);

  /** The create-room row. Its name, type, accessible and price fields have no accessible name: ids only. */
  async createRoom(room: NewRoom): Promise<void> {
    await this.page.locator('#roomName').fill(room.roomName);
    await this.page.locator('#type').selectOption(room.type);
    await this.page.locator('#accessible').selectOption(String(room.accessible));
    await this.page.locator('#roomPrice').fill(String(room.roomPrice));
    for (const feature of room.features) await this.page.getByRole('checkbox', { name: feature }).check();
    await this.page.getByRole('button', { name: 'Create' }).click();
  }

  /** A room's delete icon: an unnamed element whose id is the room's id (no role, no keyboard access). */
  deleteRoom = (roomId: number) => this.page.locator(`.roomDelete[id="${roomId}"]`).click();

  /** On a room's own page: Edit, change the price, Update. The price field is found by its id. */
  async changePrice(price: number): Promise<void> {
    await this.page.getByRole('button', { name: 'Edit' }).click();
    await this.page.locator('#roomPrice').fill(String(price));
    await this.page.getByRole('button', { name: /update/i }).click();
  }

  messageRow = (subject: string) => this.page.getByText(subject, { exact: true });

  brandingField = (placeholderName: string) => this.page.getByRole('textbox', { name: placeholderName });
  saveBranding = () => this.page.getByRole('button', { name: 'Submit' }).click();
}
