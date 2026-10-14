import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventsService } from '../../services/events.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <main class="container">
      <div class="detail-card">
        <p class="loading" *ngIf="loading()">Loading event...</p>
        <p class="error-msg" style="display:block;" *ngIf="error()">{{error()}}
          <a routerLink="/">Back to home</a>
        </p>

        <div class="success-box" *ngIf="success()">
          <h2>Registration successful! 🎉</h2>
          <p>Thank you, {{form.user_name}}! You have registered for <strong>{{event()!.name}}</strong>.</p>
          <p>Tickets: {{form.tickets}} · A confirmation email has been sent to {{form.user_email}}.</p>
          <p style="margin-top:14px;">
            <a class="btn btn-primary" [routerLink]="['/event', event()!.event_id]">← Back to event details</a>
            <a routerLink="/" style="margin-left:10px;">Home</a>
          </p>
        </div>

        <div *ngIf="event() && !success()">
          <h2>Register for: {{event()!.name}}</h2>
          <p class="meta-row">📍 {{event()!.location}} ·
             📅 {{event()!.event_date | date:'EEEE, d MMMM y'}} ·
             🎟 Price: {{event()!.ticket_price}}</p>

          <form class="register-form" (ngSubmit)="submit()">
            <label for="name">Full Name *</label>
            <input type="text" id="name" name="name" [(ngModel)]="form.user_name" required>

            <label for="email">Email *</label>
            <input type="email" id="email" name="email" [(ngModel)]="form.user_email" required>

            <label for="phone">Phone</label>
            <input type="tel" id="phone" name="phone" [(ngModel)]="form.contact_phone" placeholder="Optional">

            <label for="regdate">Registration Date *</label>
            <input type="date" id="regdate" name="regdate" [(ngModel)]="form.registration_date" required>

            <label for="tickets">Number of Tickets *</label>
            <input type="number" id="tickets" name="tickets" [(ngModel)]="form.tickets" min="1" max="10" required>

            <p class="error-msg" style="display:block;" *ngIf="submitError()">{{submitError()}}</p>

            <div class="search-actions">
              <button type="submit" class="btn btn-primary">Complete Registration</button>
              <button type="button" class="btn btn-secondary" (click)="clear()">Clear</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  `
})
export class RegisterComponent implements OnInit {
  event = signal<any | null>(null);
  loading = signal(true);
  error = signal('');
  success = signal(false);
  submitError = signal('');
  eventId = 0;
  form = {
    user_name: '', user_email: '', contact_phone: '',
    registration_date: '', tickets: 1
  };

  constructor(private route: ActivatedRoute, private svc: EventsService) {}

  ngOnInit() {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.eventId) {
      this.error.set('No event specified.');
      this.loading.set(false);
      return;
    }
    this.svc.getEvent(this.eventId).subscribe({
      next: (data) => this.event.set(data),
      error: () => this.error.set('Could not load this event.'),
      complete: () => this.loading.set(false)
    });
  }

  submit() {
    this.submitError.set('');
    if (!this.form.user_name.trim()) { alert('Please enter your full name.'); return; }
    if (!this.form.user_email.trim()) { alert('Please enter your email.'); return; }
    if (!this.form.registration_date) { alert('Please choose a registration date.'); return; }
    if (!this.form.tickets || this.form.tickets < 1) { alert('Please choose at least 1 ticket.'); return; }

    this.svc.register({
      event_id: this.eventId,
      user_name: this.form.user_name.trim(),
      user_email: this.form.user_email.trim(),
      contact_phone: this.form.contact_phone.trim(),
      registration_date: this.form.registration_date,
      tickets: Number(this.form.tickets)
    }).subscribe({
      next: () => this.success.set(true),
      error: (err) => this.submitError.set(err.error?.error || 'Registration failed. Please try again.')
    });
  }

  clear() {
    this.form = { user_name: '', user_email: '', contact_phone: '', registration_date: '', tickets: 1 };
    this.submitError.set('');
  }
}
