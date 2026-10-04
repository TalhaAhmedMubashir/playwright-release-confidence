import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { z } from 'zod';
import type { Branding, Room } from './schemas.ts';

/** A room as the admin area creates it. */
export interface NewRoom {
  roomName: string;
  type: Room['type'];
  accessible: boolean;
  roomPrice: number;
  features: string[];
  description?: string;
  image?: string;
}

/** A booking as a visitor makes it. */
export interface NewBooking {
  roomid: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  depositpaid?: boolean;
  bookingdates: { checkin: string; checkout: string };
}

/** A contact-form message. */
export interface NewMessage {
  name: string;
  email: string;
  phone: string;
  subject: string;
  description: string;
}

/**
 * The app's REST API, called through its front end (/api/{service}/...) like the browser does.
 * Without a token it is a visitor; with one, the signed-in admin. Every call answers the raw
 * response, so a test can check the status before reading the body.
 */
export class Api {
  private readonly request: APIRequestContext;
  private readonly token: string | undefined;

  constructor(request: APIRequestContext, token?: string) {
    this.request = request;
    this.token = token;
  }

  private send(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, data?: unknown): Promise<APIResponse> {
    return this.request.fetch(`/api${path}`, {
      method,
      data,
      headers: this.token ? { cookie: `token=${this.token}` } : {},
      failOnStatusCode: false,
    });
  }

  get = (path: string) => this.send('GET', path);
  post = (path: string, data: unknown) => this.send('POST', path, data);
  put = (path: string, data: unknown) => this.send('PUT', path, data);
  delete = (path: string) => this.send('DELETE', path);

  rooms = () => this.get('/room');
  room = (id: number) => this.get(`/room/${id}`);
  branding = () => this.get('/branding');
  createBooking = (booking: NewBooking) => this.post('/booking', { depositpaid: false, ...booking });
  createMessage = (message: NewMessage) => this.post('/message', message);
  report = (roomId: number) => this.get(`/report/room/${roomId}`);
  unavailable = (checkin: string, checkout: string) => this.get(`/booking/unavailable?checkin=${checkin}&checkout=${checkout}`);

  // Signed in only.
  createRoom = (room: NewRoom) => this.post('/room', { description: 'A room made by a test.', image: '/images/room1.jpg', ...room });
  deleteRoom = (id: number) => this.delete(`/room/${id}`);
  updateBranding = (branding: Branding) => this.put('/branding', branding);
}

/** Reads a response's body as the given schema; a mismatch fails with Zod's description of it. */
export async function read<T extends z.ZodType>(response: APIResponse, schema: T): Promise<z.infer<T>> {
  return schema.parse(await response.json());
}

/**
 * Signs in and answers the token. The app answers it as a cookie named "token"; a body that
 * carries it works too.
 */
export async function signIn(request: APIRequestContext, credentials: { username: string; password: string }): Promise<string> {
  const response = await request.post('/api/auth/login', { data: credentials, failOnStatusCode: false });
  if (!response.ok()) throw new Error(`Sign-in failed: HTTP ${response.status()}`);
  const fromCookie = response.headersArray().find(({ name, value }) => name.toLowerCase() === 'set-cookie' && value.startsWith('token='));
  const token = fromCookie?.value.slice('token='.length).split(';')[0] ?? ((await response.json().catch(() => ({}))) as { token?: string }).token;
  if (!token) throw new Error('Sign-in answered no token.');
  return token;
}
