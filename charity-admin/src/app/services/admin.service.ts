import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_BASE = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient) {}

  allEvents(): Observable<any[]> {
    return this.http.get<any[]>(`${API_BASE}/api/events/all`);
  }
  categories(): Observable<any[]> {
    return this.http.get<any[]>(`${API_BASE}/api/categories`);
  }
  organisations(): Observable<any[]> {
    return this.http.get<any[]>(`${API_BASE}/api/organisations`);
  }
  getEvent(id: number): Observable<any> {
    return this.http.get<any>(`${API_BASE}/api/admin/events/${id}`);
  }
  create(body: any): Observable<any> {
    return this.http.post<any>(`${API_BASE}/api/events`, body);
  }
  update(id: number, body: any): Observable<any> {
    return this.http.put<any>(`${API_BASE}/api/events/${id}`, body);
  }
  remove(id: number): Observable<any> {
    return this.http.delete<any>(`${API_BASE}/api/events/${id}`);
  }
}
