import type { TrainRoute } from "./data";

export type SeatClass = "economy" | "business" | "first";

export interface Passenger {
  name: string;
  age: string;
  gender: "male" | "female" | "other";
}

export interface BookingCart {
  route: TrainRoute;
  passengers: Passenger[];
  seatClass: SeatClass;
  date: string;
}

export interface ConfirmedBooking extends BookingCart {
  bookingRef: string;
  bookedAt: string;
  totalAmount: number;
}

export const SEAT_PRICES: Record<SeatClass, number> = {
  economy: 3500,
  business: 8500,
  first: 15000,
};

const STORAGE_KEY = "nrc_bookings";

export function getBookings(): ConfirmedBooking[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveBooking(booking: ConfirmedBooking): void {
  const bookings = getBookings();
  bookings.unshift(booking);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

export function generateRef(): string {
  return "NRC" + Math.random().toString(36).substring(2, 8).toUpperCase();
}
