import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {AuthService} from '../../../core/services/auth.service';
import {EventListComponent} from '../../../features/events/components/event-list/event-list.component';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  activeTab: string = 'organized';
  notificationsCount: number = 3;
  showNotifications: boolean = false;

  @Output() createEventClick = new EventEmitter<void>();

  constructor(private authService: AuthService) {}

  onCreateEventClick(): void {
    this.createEventClick.emit();
  }

  notifications = [
    { id: 1, message: 'New event registration received', time: '5 min ago', read: false },
    { id: 2, message: 'Event "Summer Festival" starts tomorrow', time: '1 hour ago', read: false },
    { id: 3, message: 'Payment confirmed for "Tech Conference"', time: '2 hours ago', read: true }
  ];

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  markAsRead(notification: any): void {
    notification.read = true;
    this.updateNotificationCount();
  }

  updateNotificationCount(): void {
    this.notificationsCount = this.notifications.filter(n => !n.read).length;
  }

  logout(): void {
    this.authService.logout();
    console.log('Logging out...');
  }
}
