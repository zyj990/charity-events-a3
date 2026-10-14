import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EventsService } from '../../services/events.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <main class="container">
      <h2 class="section-title">Search Charity Events</h2>

      <form class="search-form" (ngSubmit)="doSearch()">
        <label for="date">Date</label>
        <input type="date" id="date" name="date" [(ngModel)]="filters.date">

        <label for="location">Location (keyword)</label>
        <input type="text" id="location" name="location" [(ngModel)]="filters.location" placeholder="e.g. Sydney, Park...">

        <label for="category">Category</label>
        <select id="category" name="category" [(ngModel)]="filters.category">
          <option value="">-- All categories --</option>
          <option *ngFor="let c of categories()" [value]="c.category_id">{{c.name}}</option>
        </select>

        <div class="search-actions">
          <button type="submit" class="btn btn-primary">Search</button>
          <button type="button" class="btn btn-secondary" (click)="clearFilters()">Clear Filters</button>
        </div>
      </form>

      <p class="error-msg" style="display:block;" *ngIf="error()">{{error()}}</p>

      <div class="event-grid">
        <div class="event-card" *ngFor="let ev of results()">
          <span class="cat">{{ev.category}}</span>
          <h3>{{ev.name}}</h3>
          <p class="meta">📅 {{ev.event_date | date:'EEE, d MMM y'}} at {{ev.event_time.slice(0,5)}}</p>
          <p class="meta">📍 {{ev.location}}</p>
          <span class="price" *ngIf="ev.ticket_price == 0">Free</span>
          <span class="price" *ngIf="ev.ticket_price > 0">Price: {{ev.ticket_price}}</span>
          <a class="detail-link" [routerLink]="['/event', ev.event_id]">View details →</a>
        </div>
      </div>
      <p class="empty-msg" *ngIf="searched() && results().length === 0">No events match your filters.</p>
    </main>
  `
})
export class SearchComponent implements OnInit {
  categories = signal<any[]>([]);
  results = signal<any[]>([]);
  filters = { date: '', location: '', category: '' };
  error = signal('');
  searched = signal(false);

  constructor(private svc: EventsService) {}

  ngOnInit() {
    this.svc.getCategories().subscribe({
      next: (data) => this.categories.set(data)
    });
  }

  doSearch() {
    this.error.set('');
    this.searched.set(true);
    this.svc.searchEvents(this.filters).subscribe({
      next: (data) => this.results.set(data),
      error: () => this.error.set('Search failed. Is the API server running?')
    });
  }

  clearFilters() {
    this.filters = { date: '', location: '', category: '' };
    this.results.set([]);
    this.searched.set(false);
    this.error.set('');
  }
}
