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

  // Create event modal
  showCreateEventModal = false;
  creatingEvent = false;
  createEventError: string | null = null;
  validationErrors: string[] = [];
  newEvent = {
    title: '',
    description: '',
    date: '',
    time: '',
    location: ''
  };

  // Toast messages
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' | 'info' = 'info';

  constructor(private eventService: EventService, private router: Router) { }

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.eventService.getAllOrganizedEvents().subscribe({
      next: (response) => {
        console.log('Load events response:', response);
        // Fix: Check if response.data is already the array or if it has eventsData
        if (response.data.eventsData) {
          this.allEvents = response.data.eventsData;
        } else if (Array.isArray(response.data)) {
          this.allEvents = response.data;
        } else {
          this.allEvents = [];
        }
        this.filteredEvents = [...this.allEvents];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.loading = false;
        this.showToastMessage('Failed to load events', 'error');
      }
    });
  }

  // Search
  onSearchChange(): void {
    const term = this.searchQuery.trim();

    if (!term) {
      // If search is empty, show all events
      this.filteredEvents = [...this.allEvents];
      return;
    }

    // Only search if query is at least 2 characters
    if (term.length < 2) {
      return;
    }

    this.loading = true;
    this.eventService.searchEvents(term).subscribe({
      next: (response) => {
        console.log('Search response:', response);
        if (response.success) {
          // Fix: Backend returns response.data directly as array
          if (Array.isArray(response.data)) {
            this.filteredEvents = response.data;
          } else if (response.data.eventsData) {
            this.filteredEvents = response.data.eventsData;
          } else {
            this.filteredEvents = [];
          }
        } else {
          this.filteredEvents = [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Search error:', error);
        this.loading = false;
        // Don't clear results on error, keep showing current events
        // Only show error toast if it's not a validation error (400)
        if (error.status !== 400) {
          this.showToastMessage('Failed to search events', 'error');
        }
      }
    });
  }

  // Delete
  onDeleteEvent(event: Event): void {
    if (!confirm(`Delete event "${event.title}"?`)) return;

    this.eventService.deleteEvent(event.id).subscribe({
      next: () => {
        this.allEvents = this.allEvents.filter(e => e.id !== event.id);
        this.filteredEvents = this.filteredEvents.filter(e => e.id !== event.id);
        this.showToastMessage('Event deleted successfully', 'success');
      },
      error: () => {
        this.showToastMessage('Failed to delete event', 'error');
      }
    });
  }

  // Update Status
  onUpdateStatus(data: { eventId: string; status: EventStatus }): void {
    this.eventService.updateEventStatus(data.eventId, data.status).subscribe({
      next: () => {
        this.allEvents = this.allEvents.map(e => e.id === data.eventId ? { ...e, status: data.status } : e);
        this.filteredEvents = this.filteredEvents.map(e => e.id === data.eventId ? { ...e, status: data.status } : e);
        this.showToastMessage('Event status updated', 'success');
      },
      error: () => {
        this.showToastMessage('Failed to update status', 'error');
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
        console.log('Participants response:', res);
        // Handle different response structures
        let participantsData = [];
        if (res.data.participantsData) {
          participantsData = res.data.participantsData;
        } else if (Array.isArray(res.data)) {
          participantsData = res.data;
        }

        // Map participants to include fullName computed from firstName and lastName
        this.participants = participantsData.map((p: ParticipantUser) => ({
          ...p,
          fullName: `${p.firstName} ${p.lastName}`.trim()
        }));
        console.log('Processed participants:', this.participants);
        this.loadingParticipants = false;
      },
      error: (error) => {
        console.error('Error loading participants:', error);
        this.loadingParticipants = false;
        this.participants = [];
        this.showToastMessage('Failed to load participants', 'error');
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
    if (!this.invitingEvent || !this.inviteUserId) {
      this.showToastMessage('Please enter a valid User ID', 'error');
      return;
    }

    const inviteData = {
      userId: this.inviteUserId,
      role: this.inviteRole
    };

    console.log('Sending invitation:', { eventId: this.invitingEvent.id, inviteData });

    this.eventService.inviteUser(this.invitingEvent.id, inviteData).subscribe({
      next: (response) => {
        console.log('Invitation response:', response);
        this.showToastMessage('Invitation sent successfully!', 'success');
        this.showInviteModal = false;
        this.inviteUserId = null;
        this.inviteRole = 'Attendee';
        this.invitingEvent = null;
      },
      error: (error) => {
        console.error('Invitation error:', error);
        const errorMessage = error?.error?.message || error?.message || 'Failed to send invitation';
        this.showToastMessage(`Failed to send invitation: ${errorMessage}`, 'error');
      }
    });
  }

  // Create Event
  openCreateEventModal(): void {
    console.log('Opening create event modal');
    this.newEvent = {
      title: '',
      description: '',
      date: '',
      time: '',
      location: ''
    };
    this.createEventError = null;
    this.validationErrors = [];
    this.showCreateEventModal = true;
  }

  closeCreateEventModal(): void {
    this.showCreateEventModal = false;
    this.newEvent = {
      title: '',
      description: '',
      date: '',
      time: '',
      location: ''
    };
    this.createEventError = null;
    this.validationErrors = [];
  }

  onCreateEvent(): void {
    if (!this.newEvent.title || !this.newEvent.description || !this.newEvent.date || !this.newEvent.time || !this.newEvent.location) {
      this.showToastMessage('Please fill in all fields', 'error');
      return;
    }

    this.creatingEvent = true;

    console.log('Creating event with data:', this.newEvent);

    this.eventService.createEvent(this.newEvent).subscribe({
      next: (response) => {
        console.log('Event created successfully:', response);
        this.showToastMessage('Event created successfully!', 'success');
        this.closeCreateEventModal();
        // Auto-refresh events after creation
        this.loadEvents();
        this.creatingEvent = false;
      },
      error: (error) => {
        console.error('Error creating event:', error);
        this.creatingEvent = false;

        // Extract validation errors from the API response
        this.createEventError = 'Failed to create event';
        this.validationErrors = [];

        if (error?.error?.errors && Array.isArray(error.error.errors)) {
          this.validationErrors = error.error.errors.map((err: any) => {
            const field = err.field || err.property || err.path || 'Field';
            const message = err.message || err.defaultMessage || 'Invalid value';
            const formattedField = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1').trim();
            return `${formattedField}: ${message}`;
          });
          this.createEventError = 'Validation failed. Please check the errors below:';
        } else if (error?.error?.message) {
          this.createEventError = error.error.message;
        } else if (error?.message) {
          this.createEventError = error.message;
        }
      }
    });
  }

  // Refresh events
  refreshEvents(): void {
    this.searchQuery = '';
    this.loadEvents();
  }

  // Clear errors when user starts editing
  clearErrors(): void {
    if (this.createEventError) {
      this.createEventError = null;
      this.validationErrors = [];
    }
  }

  // Show toast message
  showToastMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 5000);
  }
}