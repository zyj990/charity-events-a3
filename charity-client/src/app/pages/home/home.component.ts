import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventsService } from '../../services/events.service';
import { WeatherService } from '../../services/weather.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="hero">
      <h1>Together, We Make a Difference</h1>
      <p>Hope Foundation empowers local communities through health and education programs.
         Join our upcoming charity events and help us change lives.</p>
      <p class="hero-contact">Contact us: hello@hopefoundation.org | 02 9123 4567 | 12 King Street, Sydney</p>

      <!-- Weather widget (Open-Meteo) -->
      <div class="weather-box" *ngIf="weather()">
        🌤 <strong>Sydney now:</strong> {{weather().temperature_2m}}°C · {{weatherText()}}
        · Wind {{weather().wind_speed_10m}} km/h
        <span class="weather-src">powered by Open-Meteo</span>
      </div>
    </header>

    <main class="container">
      <h2 class="section-title">Upcoming Charity Events</h2>

      <p class="loading" *ngIf="loading()">Loading events...</p>
      <p class="error-msg" style="display:block;" *ngIf="error()">{{error()}}</p>

      <div class="event-grid">
        <div class="event-card" *ngFor="let ev of events()">
          <span class="cat">{{ev.category}}</span>
          <h3>{{ev.name}}</h3>
          <p class="meta">📅 {{ev.event_date | date:'EEE, d MMM y'}} at {{ev.event_time.slice(0,5)}}</p>
          <p class="meta">📍 {{ev.location}}</p>
          <span class="price" *ngIf="ev.ticket_price == 0">Free</span>
          <span class="price" *ngIf="ev.ticket_price > 0">Price: {{ev.ticket_price}}</span>
          <a class="detail-link" [routerLink]="['/event', ev.event_id]">View details →</a>
        </div>
      </div>

      <p class="empty-msg" *ngIf="!loading() && events().length === 0">No upcoming events at the moment.</p>
    </main>
  `,
  styles: [`
    .weather-box {
      display: inline-block; margin-top: 14px; padding: 8px 18px;
      background: rgba(255,255,255,0.85); border-radius: 999px;
      color: #06332b; font-size: 14px;
    }
    .weather-src { margin-left: 8px; font-size: 11px; opacity: 0.6; }
  `]
})
export class HomeComponent implements OnInit {
  events = signal<any[]>([]);
  loading = signal(true);
  error = signal('');
  weather = signal<any | null>(null);
  weatherText = signal('');

  constructor(private svc: EventsService, private weatherSvc: WeatherService) {}

  ngOnInit() {
    this.svc.getEvents().subscribe({
      next: (data) => this.events.set(data),
      error: () => this.error.set('Could not load events. Is the API server running?'),
      complete: () => this.loading.set(false)
    });

    // Open-Meteo current weather for Sydney
    this.weatherSvc.getSydneyWeather().subscribe({
      next: (data) => {
        this.weather.set(data.current);
        this.weatherText.set(this.weatherSvc.codeToText(data.current.weather_code));
      }
    });
  }
}
//（注：内容由AI生成）
