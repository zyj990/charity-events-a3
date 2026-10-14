import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-wrap">
      <h1 style="color:#06332b;">Charity Events — Administration</h1>

      <div class="msg" [class.success]="msgType()==='success'" [class.error]="msgType()==='error'" *ngIf="msg()">
        {{msg()}}
      </div>

      <h2 style="margin-top:24px;">All Events</h2>
      <p class="loading" *ngIf="loading()">Loading events...</p>
      <table class="admin-table" *ngIf="!loading()">
        <thead>
          <tr><th>ID</th><th>Name</th><th>Date</th><th>Location</th><th>Category</th><th>Status</th><th>Regs</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let ev of events()">
            <td>{{ev.event_id}}</td>
            <td>{{ev.name}}</td>
            <td>{{ev.event_date | date:'yyyy-MM-dd'}} {{ev.event_time.slice(0,5)}}</td>
            <td>{{ev.location}}</td>
            <td>{{ev.category}}</td>
            <td><span class="badge" [class.active]="ev.status==='active'" [class.suspended]="ev.status==='suspended'">{{ev.status}}</span></td>
            <td>{{ev.registration_count}}</td>
            <td class="row-actions">
              <button class="btn-edit" (click)="editEvent(ev)">Edit</button>
              <button class="btn-del" (click)="deleteEvent(ev)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Add new event -->
      <div class="box">
        <h2>Add New Event</h2>
        <div class="form-row">
          <div class="field"><label>Event Name *</label><input [(ngModel)]="add.name"></div>
          <div class="field"><label>Event Date *</label><input type="date" [(ngModel)]="add.event_date"></div>
          <div class="field"><label>Event Time</label><input type="time" [(ngModel)]="add.event_time"></div>
        </div>
        <div class="form-row">
          <div class="field"><label>Location *</label><input [(ngModel)]="add.location"></div>
          <div class="field"><label>Category *</label>
            <select [(ngModel)]="add.category_id">
              <option value="">-- select --</option>
              <option *ngFor="let c of categories()" [value]="c.category_id">{{c.name}}</option>
            </select>
          </div>
          <div class="field"><label>Organisation *</label>
            <select [(ngModel)]="add.organisation_id">
              <option value="">-- select --</option>
              <option *ngFor="let o of organisations()" [value]="o.organisation_id">{{o.name}}</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="field"><label>Ticket Price ($)</label><input type="number" step="0.01" [(ngModel)]="add.ticket_price"></div>
          <div class="field"><label>Goal ($)</label><input type="number" step="0.01" [(ngModel)]="add.goal_amount"></div>
          <div class="field"><label>Raised ($)</label><input type="number" step="0.01" [(ngModel)]="add.raised_amount"></div>
          <div class="field"><label>Status</label>
            <select [(ngModel)]="add.status">
              <option value="active">active</option>
              <option value="suspended">suspended</option>
            </select>
          </div>
        </div>
        <div class="field"><label>Purpose</label><input [(ngModel)]="add.purpose"></div>
        <div class="field"><label>Description</label><textarea rows="3" [(ngModel)]="add.description"></textarea></div>
        <button class="btn btn-primary" style="margin-top:14px;" (click)="saveAdd()">Save Event</button>
      </div>

      <!-- Edit event -->
      <div class="box" *ngIf="edit().id">
        <h2>Edit Event #{{edit().id}}</h2>
        <div class="form-row">
          <div class="field"><label>Event Name *</label><input [(ngModel)]="edit().name"></div>
          <div class="field"><label>Event Date *</label><input type="date" [(ngModel)]="edit().event_date"></div>
          <div class="field"><label>Event Time</label><input type="time" [(ngModel)]="edit().event_time"></div>
        </div>
        <div class="form-row">
          <div class="field"><label>Location *</label><input [(ngModel)]="edit().location"></div>
          <div class="field"><label>Category *</label>
            <select [(ngModel)]="edit().category_id">
              <option *ngFor="let c of categories()" [value]="c.category_id">{{c.name}}</option>
            </select>
          </div>
          <div class="field"><label>Organisation *</label>
            <select [(ngModel)]="edit().organisation_id">
              <option *ngFor="let o of organisations()" [value]="o.organisation_id">{{o.name}}</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="field"><label>Ticket Price ($)</label><input type="number" step="0.01" [(ngModel)]="edit().ticket_price"></div>
          <div class="field"><label>Goal ($)</label><input type="number" step="0.01" [(ngModel)]="edit().goal_amount"></div>
          <div class="field"><label>Raised ($)</label><input type="number" step="0.01" [(ngModel)]="edit().raised_amount"></div>
          <div class="field"><label>Status</label>
            <select [(ngModel)]="edit().status">
              <option value="active">active</option>
              <option value="suspended">suspended</option>
            </select>
          </div>
        </div>
        <div class="field"><label>Purpose</label><input [(ngModel)]="edit().purpose"></div>
        <div class="field"><label>Description</label><textarea rows="3" [(ngModel)]="edit().description"></textarea></div>

        <h3 style="margin-top:18px;">Registrations for this event</h3>
        <p class="empty-msg" *ngIf="editRegs().length === 0">No registrations for this event.</p>
        <table class="admin-table" *ngIf="editRegs().length > 0">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Date</th><th>Tickets</th></tr></thead>
          <tbody>
            <tr *ngFor="let r of editRegs()">
              <td>{{r.user_name}}</td><td>{{r.user_email}}</td><td>{{r.contact_phone || '-'}}</td>
              <td>{{r.registration_date | date:'yyyy-MM-dd'}}</td><td>{{r.tickets}}</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top:14px;">
          <button class="btn btn-primary" (click)="saveEdit()">Save Changes</button>
          <button class="btn btn-secondary" (click)="cancelEdit()">Cancel</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-wrap { max-width: 1100px; margin: 0 auto; padding: 24px; }
    .msg { padding: 12px 16px; border-radius: 8px; margin: 16px 0; }
    .msg.success { background: #dcefe2; color: #0a5c36; border-left: 4px solid #1c7c4a; }
    .msg.error { background: #fbe2e2; color: #8a1f1f; border-left: 4px solid #c0392b; }
    table.admin-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    table.admin-table th, table.admin-table td { border: 1px solid #e6ddd0; padding: 9px 10px; text-align: left; font-size: 14px; }
    table.admin-table th { background: #06332b; color: #fff; }
    .badge { padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
    .badge.active { background: #dcefe2; color: #0a5c36; }
    .badge.suspended { background: #fbe2e2; color: #8a1f1f; }
    .row-actions button { margin-right: 6px; padding: 5px 12px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; }
    .btn-edit { background: #06332b; color: #fff; }
    .btn-del { background: #c0392b; color: #fff; }
    .form-row { display: flex; gap: 16px; flex-wrap: wrap; }
    .form-row > div { flex: 1; min-width: 200px; }
    .field label { display: block; font-weight: 600; margin: 10px 0 4px; }
    .field input, .field select, .field textarea { width: 100%; padding: 8px; box-sizing: border-box; }
    .box { background: #fff; border: 1px solid #e6ddd0; border-radius: 10px; padding: 18px; margin-top: 24px; }
  `]
})
export class AdminComponent implements OnInit {
  events = signal<any[]>([]);
  categories = signal<any[]>([]);
  organisations = signal<any[]>([]);
  loading = signal(true);
  msg = signal('');
  msgType = signal<'success' | 'error'>('success');
  edit = signal<any>({ id: null });
  editRegs = signal<any[]>([]);
  add: any = { status: 'active', ticket_price: 0, goal_amount: 0, raised_amount: 0 };

  constructor(private svc: AdminService) {}

  ngOnInit() {
    this.svc.allEvents().subscribe({
      next: (data) => this.events.set(data),
      error: () => this.flash('error', 'Could not load events. Is the API running?'),
      complete: () => this.loading.set(false)
    });
    this.svc.categories().subscribe({ next: (d) => this.categories.set(d) });
    this.svc.organisations().subscribe({ next: (d) => this.organisations.set(d) });
  }

  flash(type: 'success' | 'error', text: string) {
    this.msgType.set(type);
    this.msg.set(text);
  }

  saveAdd() {
    if (!this.add.name || !this.add.event_date || !this.add.location || !this.add.category_id || !this.add.organisation_id) {
      alert('Please fill in all required fields.');
      return;
    }
    this.svc.create(this.add).subscribe({
      next: () => { this.flash('success', 'Event created successfully.');
        this.add = { status: 'active', ticket_price: 0, goal_amount: 0, raised_amount: 0 };
        this.reload(); },
      error: (err) => this.flash('error', err.error?.error || 'Create failed.')
    });
  }

  editEvent(ev: any) {
    this.svc.getEvent(ev.event_id).subscribe({
      next: (e) => {
        this.edit.set({
          id: e.event_id, name: e.name,
          event_date: String(e.event_date).slice(0, 10),
          event_time: String(e.event_time || '').slice(0, 5),
          location: e.location, category_id: e.category_id, organisation_id: e.organisation_id,
          ticket_price: e.ticket_price, goal_amount: e.goal_amount, raised_amount: e.raised_amount,
          status: e.status, purpose: e.purpose, description: e.description
        });
        this.editRegs.set(e.registrations || []);
      },
      error: () => this.flash('error', 'Event not found.')
    });
  }

  cancelEdit() { this.edit.set({ id: null }); this.editRegs.set([]); }

  saveEdit() {
    const e = this.edit();
    if (!e.name || !e.event_date || !e.location || !e.category_id || !e.organisation_id) {
      alert('Please fill in all required fields.');
      return;
    }
    this.svc.update(e.id, e).subscribe({
      next: () => { this.flash('success', 'Event updated successfully.'); this.cancelEdit(); this.reload(); },
      error: (err) => this.flash('error', err.error?.error || 'Update failed.')
    });
  }

  deleteEvent(ev: any) {
    if (!confirm('Delete "' + ev.name + '"? This cannot be undone.')) return;
    this.svc.remove(ev.event_id).subscribe({
      next: () => { this.flash('success', 'Event deleted.'); this.reload(); },
      error: (err) => this.flash('error', err.error?.error || 'Delete failed.')
    });
  }

  reload() {
    this.svc.allEvents().subscribe({ next: (d) => this.events.set(d) });
  }
}
