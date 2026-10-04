import { z } from 'zod';

// The shape of each answer, from the app's own API descriptions (/api/{service}/v3/api-docs, read
// 2026-10-04) and checked against what it answered while exploring. Strict objects: a field that
// appears or disappears is a change worth knowing about.

export const RoomType = z.enum(['Single', 'Twin', 'Double', 'Family', 'Suite']);

export const Room = z.strictObject({
  roomid: z.int().positive(),
  roomName: z.string().min(1),
  type: RoomType,
  accessible: z.boolean(),
  image: z.string(),
  description: z.string(),
  features: z.array(z.string()),
  roomPrice: z.int().min(1).max(999),
});
export type Room = z.infer<typeof Room>;

export const Rooms = z.strictObject({ rooms: z.array(Room) });

export const Branding = z.strictObject({
  name: z.string().min(3).max(100),
  map: z.strictObject({ latitude: z.number(), longitude: z.number() }),
  logoUrl: z.string().min(1),
  description: z.string().min(3).max(500),
  directions: z.string().min(1),
  contact: z.strictObject({ name: z.string().min(3).max(40), phone: z.string().min(1), email: z.email() }),
  address: z.strictObject({
    line1: z.string().min(1),
    line2: z.string().min(1),
    postTown: z.string().min(1),
    county: z.string().min(1),
    postCode: z.string().min(1),
  }),
});
export type Branding = z.infer<typeof Branding>;

export const MessageSummary = z.strictObject({ id: z.int().positive(), name: z.string(), subject: z.string(), read: z.boolean() });
export const Messages = z.strictObject({ messages: z.array(MessageSummary) });
export const Message = z.strictObject({
  messageid: z.int().positive(),
  name: z.string().min(1),
  email: z.email(),
  phone: z.string().min(11).max(21),
  subject: z.string().min(5).max(100),
  description: z.string().min(20).max(2000),
});
export const Count = z.strictObject({ count: z.int().nonnegative() });

const isoDate = z.iso.date();
export const BookingDates = z.strictObject({ checkin: isoDate, checkout: isoDate });

/** What creating a booking answered while exploring: the booking, without the guest's contact details. */
export const CreatedBooking = z.strictObject({
  bookingid: z.int().positive(),
  roomid: z.int().positive(),
  firstname: z.string(),
  lastname: z.string(),
  depositpaid: z.boolean(),
  bookingdates: BookingDates,
});

/** What the booking API's description says creating a booking answers. */
export const DocumentedCreatedBooking = z.strictObject({
  bookingid: z.int().positive(),
  booking: z.strictObject({
    bookingid: z.int().positive().optional(),
    roomid: z.int().positive(),
    firstname: z.string(),
    lastname: z.string(),
    depositpaid: z.boolean(),
    email: z.email(),
    phone: z.string(),
    bookingdates: BookingDates,
  }),
});

export const Unavailable = z.array(z.strictObject({ roomid: z.int().positive() }));

export const Report = z.strictObject({ report: z.array(z.strictObject({ start: isoDate, end: isoDate, title: z.string() })) });

/** Validation failures: the message API answers a list of messages. */
export const MessageErrors = z.array(z.string()).min(1);
/** Validation failures: the booking API answers an object holding the list. */
export const BookingErrors = z.strictObject({ errors: z.array(z.string()).min(1) });
