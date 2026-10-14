import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Base URL of the Express REST API.
const API_BASE = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class EventsService {
  constructor(private http: HttpClient) {}

  getEvents(): Observable<any[]> {
    return this.http.get<any[]>(`${API_BASE}/api/events`);
  }

  getEvent(id: number): Observable<any> {
    return this.http.get<any>(`${API_BASE}/api/events/${id}`);
  }

  searchEvents(filters: { date?: string; location?: string; category?: string }): Observable<any[]> {
    let params = new HttpParams();
    if (filters.date) params = params.set('date', filters.date);
    if (filters.location) params = params.set('location', filters.location);
    if (filters.category) params = params.set('category', filters.category);
    return this.http.get<any[]>(`${API_BASE}/api/events/search`, { params });
  }

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${API_BASE}/api/categories`);
  }

  register(payload: any): Observable<any> {
    return this.http.post<any>(`${API_BASE}/api/registrations`, payload);
  }
}
