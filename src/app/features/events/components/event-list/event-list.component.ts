import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EventCardComponent } from '../event-card/event-card.component';
import { EventService } from '../../services/event.service';
import Event, { ParticipantUser, EventStatus } from '../../../../core/models/event.model';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, FormsModule, EventCardComponent, NavbarComponent],
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.css'
})
export class EventListComponent implements OnInit {
  allEvents: Event[] = [];
  filteredEvents: Event[] = [];
  searchQuery = '';
  loading = false;

  // Participants
  showParticipantsModal = false;
  loadingParticipants = false;
  participants: ParticipantUser[] = [];
  activeEventParticipants: Event | null = null;

  // Invitation modal
  showInviteModal = false;
  inviteUserId: number | null = null;
  inviteRole = 'Attendee';
  invitingEvent: Event | null = null;

  constructor(private eventService: EventService, private router: Router) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.eventService.getAllOrganizedEvents().subscribe({
      next: (response) => {
        this.allEvents = response.data.eventsData;
        this.filteredEvents = [...this.allEvents];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Failed to load events');
      }
    });
  }

  // Search
  onSearchChange(): void {
    const term = this.searchQuery.toLowerCase();
    this.filteredEvents = this.allEvents.filter(e =>
      e.title.toLowerCase().includes(term) ||
      e.location.toLowerCase().includes(term) ||
      e.description.toLowerCase().includes(term) ||
      e.status.toLowerCase().includes(term)
    );
  }

  // Delete
  onDeleteEvent(event: Event): void {
    if (!confirm(`Delete event "${event.title}"?`)) return;

    this.eventService.deleteEvent(event.id).subscribe({
      next: () => {
        this.allEvents = this.allEvents.filter(e => e.id !== event.id);
        this.filteredEvents = this.filteredEvents.filter(e => e.id !== event.id);
        alert("Event deleted");
      }
    });
  }

  // Update Status
  onUpdateStatus(data: { eventId: string; status: EventStatus }): void {
    this.eventService.updateEventStatus(data.eventId, data.status).subscribe({
      next: () => {
        this.allEvents = this.allEvents.map(e => e.id === data.eventId ? { ...e, status: data.status } : e);
        this.filteredEvents = this.filteredEvents.map(e => e.id === data.eventId ? { ...e, status: data.status } : e);
      }
    });
  }

  // View Participants
  onViewParticipants(event: Event): void {
    this.activeEventParticipants = event;
    this.showParticipantsModal = true;
    this.loadingParticipants = true;

    this.eventService.getEventParticipants(event.id).subscribe({
      next: (res) => {
        this.participants = res.data.participantsData;
        this.loadingParticipants = false;
      },
      error: () => {
        this.loadingParticipants = false;
        alert('Failed to load participants');
      }
    });
  }

  closeParticipantsModal(): void {
    this.showParticipantsModal = false;
    this.participants = [];
    this.activeEventParticipants = null;
  }

  // Invitation
  onCreateInvitation(event: Event): void {
    this.invitingEvent = event;
    this.showInviteModal = true;
    this.inviteUserId = null;
    this.inviteRole = 'Attendee';
  }

  sendInvitation(): void {
    if (!this.invitingEvent || !this.inviteUserId) return;

    const inviteData = {
      userId: this.inviteUserId,
      role: this.inviteRole
    };

    this.eventService.inviteUser(this.invitingEvent.id, inviteData).subscribe({
      next: () => {
        alert('Invitation sent!');
        this.showInviteModal = false;
      },
      error: () => alert('Failed to send invitation')
    });
  }
}
