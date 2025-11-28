import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import Event, { ResponseStatus } from '../../../../core/models/event.model';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-invited-events',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './invited-events.component.html',
  styleUrl: './invited-events.component.css'
})
export class InvitedEventsComponent implements OnInit {
  invitedEvents: Event[] = [];
  filteredEvents: Event[] = [];
  searchQuery = '';
  searchFilterType: string = 'keyword'; // Default filter type
  loading = false;

  // Available filter types
  filterTypes = [
    { value: 'keyword', label: 'Keyword' },
    { value: 'startDate', label: 'Start Date' },
    { value: 'endDate', label: 'End Date' },
    { value: 'status', label: 'Status' },
    { value: 'role', label: 'Role' },
    { value: 'userId', label: 'User ID' },
    { value: 'limit', label: 'Limit' },
    { value: 'offset', label: 'Offset' }
  ];
  error: string | null = null;
  successMessage: string | null = null;
  respondingEventId: string | null = null;
  respondedStatus: Record<string, ResponseStatus> = {};
  ResponseStatus = ResponseStatus;
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

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.fetchInvitedEvents();
  }

  fetchInvitedEvents(): void {
    this.loading = true;
    this.error = null;
    this.searchQuery = '';
    this.searchFilterType = 'keyword';

    this.eventService.getInvitedEvents().subscribe({
      next: (response) => {
        this.invitedEvents = response.data.eventsData;
        this.filteredEvents = [...this.invitedEvents];
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load invited events. Please try again.';
        this.loading = false;
      }
    });
  }

  // Search
  onSearchChange(): void {
    const term = this.searchQuery.trim();
    
    if (!term) {
      // If search is empty, show all events
      this.filteredEvents = [...this.invitedEvents];
      return;
    }

    // Build filters object based on selected filter type
    const filters: any = {};
    
    // Set the selected filter value
    if (this.searchFilterType === 'keyword') {
      // Only search if keyword query is at least 2 characters
      if (term.length < 2) {
        return;
      }
      filters.keyword = term;
    } else if (this.searchFilterType === 'startDate') {
      filters.startDate = term;
    } else if (this.searchFilterType === 'endDate') {
      filters.endDate = term;
    } else if (this.searchFilterType === 'status') {
      filters.status = term;
    } else if (this.searchFilterType === 'role') {
      filters.role = term;
    } else if (this.searchFilterType === 'userId') {
      filters.userId = term;
    } else if (this.searchFilterType === 'limit') {
      filters.limit = parseInt(term) || 20;
    } else if (this.searchFilterType === 'offset') {
      filters.offset = parseInt(term) || 0;
    }

    this.loading = true;
    this.eventService.searchEvents(filters).subscribe({
      next: (response) => {
        if (response.success) {
          // Handle different response structures
          if (Array.isArray(response.data)) {
            this.filteredEvents = response.data;
          } else if (response.data.eventsData) {
            this.filteredEvents = response.data.eventsData;
          } else if (response.data.events) {
            this.filteredEvents = response.data.events;
          } else {
            this.filteredEvents = [];
          }
        } else {
          this.filteredEvents = [];
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.filteredEvents = [];
        this.error = 'Failed to search events';
      }
    });
  }

  // Update placeholder based on filter type
  getSearchPlaceholder(): string {
    const filterType = this.filterTypes.find(ft => ft.value === this.searchFilterType);
    if (filterType) {
      return `Search by ${filterType.label}...`;
    }
    return 'Search events...';
  }

  // Update input type based on filter type
  getInputType(): string {
    if (this.searchFilterType === 'startDate' || this.searchFilterType === 'endDate') {
      return 'date';
    } else if (this.searchFilterType === 'userId' || this.searchFilterType === 'limit' || this.searchFilterType === 'offset') {
      return 'number';
    }
    return 'text';
  }

  onRespond(eventId: string, status: ResponseStatus): void {
    this.respondingEventId = eventId;
    this.successMessage = null;
    this.error = null;

    this.eventService.respondToInvitation(eventId, status).subscribe({
      next: () => {
        this.respondedStatus[eventId] = status;
        this.successMessage = `Response saved: ${this.getResponseLabel(status)}`;
        this.respondingEventId = null;
      },
      error: () => {
        this.error = 'Failed to send response. Please try again.';
        this.respondingEventId = null;
      }
    });
  }

  hasResponded(eventId: string): boolean {
    return !!this.respondedStatus[eventId];
  }

  getResponseLabel(status: ResponseStatus): string {
    switch (status) {
      case ResponseStatus.GOING:
        return 'Going';
      case ResponseStatus.MAYBE:
        return 'Maybe';
      case ResponseStatus.NOT_GOING:
        return 'Not Going';
      default:
        return 'Pending';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  openCreateEventModal(): void {
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

  clearErrors(): void {
    if (this.createEventError) {
      this.createEventError = null;
      this.validationErrors = [];
    }
  }

  onCreateEvent(): void {
    if (!this.newEvent.title || !this.newEvent.description || !this.newEvent.date || !this.newEvent.time || !this.newEvent.location) {
      return;
    }

    this.creatingEvent = true;
    this.eventService.createEvent(this.newEvent).subscribe({
      next: (response) => {
        this.successMessage = 'Event created successfully!';
        this.creatingEvent = false;
        this.closeCreateEventModal();
      },
      error: (error) => {
        this.creatingEvent = false;
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
}
