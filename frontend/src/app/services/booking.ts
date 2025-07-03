import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import  { Observable } from "rxjs"
import {  Booking, type BookingRequest, BookingStatus } from "../models/booking"


@Injectable({
  providedIn: "root",
})
export class BookingService {
  private readonly API_URL = `http://localhost:4200/bookings`

  constructor(private http: HttpClient) {}

  createBooking(booking: BookingRequest): Observable<Booking> {
    return this.http.post<Booking>(this.API_URL, booking)
  }

  getMyBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.API_URL}/my-bookings`)
  }

  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.API_URL)
  }

  getBookingById(id: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.API_URL}/${id}`)
  }

  updateBookingStatus(id: string, status: BookingStatus, notes?: string): Observable<Booking> {
    return this.http.patch<Booking>(`${this.API_URL}/${id}/status`, { status, notes })
  }

  cancelBooking(id: string, reason: string): Observable<Booking> {
    return this.http.patch<Booking>(`${this.API_URL}/${id}/cancel`, { reason })
  }

  approveBooking(id: string, notes?: string): Observable<Booking> {
    return this.updateBookingStatus(id, BookingStatus.CONFIRMED, notes)
  }

  rejectBooking(id: string, reason: string): Observable<Booking> {
    return this.http.patch<Booking>(`${this.API_URL}/${id}/reject`, { reason })
  }
}
