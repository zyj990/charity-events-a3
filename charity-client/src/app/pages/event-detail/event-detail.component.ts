import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventsService } from '../../services/events.service';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="container">
      <div class="detail-card">
        <p class="loading" *ngIf="loading()">Loading event details...</p>
        <p class="error-msg" style="display:block;" *ngIf="error()">{{error()}}
          <a routerLink="/">Back to home</a>
        </p>

        <div *ngIf="event() as ev">
          <span class="cat">{{ev.category}}</span>
          <h1>{{ev.name}}</h1>
          <p class="meta-row">📍 {{ev.location}}</p>
          <p class="meta-row">📅 {{ev.event_date | date:'EEEE, d MMMM y'}} at {{ev.event_time.slice(0,5)}}</p>
          <p class="meta-row">🏛 Hosted by: <strong>{{ev.organisation}}</strong></p>
          <p class="meta-row">🎟 Ticket price: <strong>{{priceLabel()}}</strong></p>

          <div class="desc">
            <h3 style="margin-bottom:8px;">About this event</h3>
            <p>{{ev.description}}</p>
            <p style="margin-top:10px;"><strong>Purpose:</strong> {{ev.purpose}}</p>
          </div>

          <div>
            <h3 style="margin-bottom:6px;">Fundraising Goal</h3>
            <p class="progress-label">Raised {{ev.raised_amount}} of {{ev.goal_amount}} ({{pct()}}%)</p>
            <div class="progress-bar-wrap">
              <div class="progress-bar" [style.width.%]="pct()">{{pct()}}%</div>
            </div>
          </div>

          <div style="margin-top:28px;">
            <h3 style="margin-bottom:10px;">Registrations ({{ev.registrations.length}})</h3>
            <p class="empty-msg" *ngIf="ev.registrations.length === 0">No registrations yet. Be the first!</p>
            <table class="reg-table" *ngIf="ev.registrations.length > 0">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Phone</th><th>Date</th><th>Tickets</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let r of ev.registrations">
                  <td>{{r.user_name}}</td>
                  <td>{{r.user_email}}</td>
                  <td>{{r.contact_phone || '-'}}</td>
                  <td>{{r.registration_date | date:'yyyy-MM-dd'}}</td>
                  <td>{{r.tickets}}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="margin-top:28px;">
            <a class="btn btn-primary" [routerLink]="['/register', ev.event_id]">Register</a>
            <a routerLink="/" style="margin-left:12px;">← Back to home</a>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .reg-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .reg-table th, .reg-table td { border: 1px solid #e6ddd0; padding: 8px 10px; text-align: left; font-size: 14px; }
    .reg-table th { background: #f6ecd8; color: #06332b; }
  `]
})
export class EventDetailComponent implements OnInit {
  event = signal<any | null>(null);
  loading = signal(true);
  error = signal('');

  pct = computed(() => {
    const ev = this.event();
    if (!ev) return 0;
    const goal = Number(ev.goal_amount), raised = Number(ev.raised_amount);
    return goal > 0 ? Math.min(100, Math.round(raised / goal * 100)) : 0;
  });

  priceLabel = computed(() => {
    const ev = this.event();
    if (!ev) return '';
    return Number(ev.ticket_price) === 0 ? 'Free' : '$' + Number(ev.ticket_price).toFixed(2);
  });

  constructor(private route: ActivatedRoute, private svc: EventsService) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set('No event specified.');
      this.loading.set(false);
      return;
    }
    this.svc.getEvent(id).subscribe({
      next: (data) => this.event.set(data),
      error: () => this.error.set('Could not load this event.'),
      complete: () => this.loading.set(false)
    });
  }
}
