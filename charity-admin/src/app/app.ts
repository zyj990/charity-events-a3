import { Component } from '@angular/core';
import { AdminComponent } from './pages/admin.component';

@Component({
  imports: [AdminComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  template: '<app-admin />',
})
export class App {}
