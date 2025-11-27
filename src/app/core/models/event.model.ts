// Event interface
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  status: EventStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export default Event

// Event status enum
export enum EventStatus {
  ACTIVE = 'Active',
  CANCELLED = 'Cancelled',
  POSTPONED = 'Postponed'
}

// Response status enum (for participants)
export enum ResponseStatus {
  GOING = 'Going',
  NOT_GOING = 'Not Going',
  PENDING = 'Pending'
}

// Create event request
export interface CreateEvent{
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
}

// Update event status
export interface UpdateEventStatus {
  status: EventStatus;
}

// FIXED: Capitalized to match usage
export interface Permissions {
  canManageEvent: boolean;
  canInviteOthers: boolean;
  canDeleteEvent: boolean;
}

export interface Participant {
  userId: string;
  eventId: string;
  role: string;
  status: ResponseStatus;
  invitedAt: string;
  respondedAt: string | null;
  hasResponded: boolean;
  permissions: Permissions;
}

// API Response for single event
export interface EventResponse {
  success: boolean;
  message?: string;
  data: {
    event: Event;
    organizers: Organizer; // Fixed capitalization
  };
}

// API Response for list of events (Get organized Events)
export interface EventsListResponse {
  success: boolean;
  message?: string;
  data: {
    eventsData: Event[];
  };
}

export interface ParticipantUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string | null;
}

export interface ParticipantsResponse {
  success: boolean;
  message: string;
  data: {
    participantsData: ParticipantUser[];
  };
}

// Update status response
export interface UpdateStatusResponse {
  success: boolean;
  message: string;
  data: {
    participant: Participant;
    event: {
      id: number;
      title: string;
      date: string;
      time: string;
      location: string;
    };
    message: string;
  };
}

export interface InviteUserRequest {
  userId: number;
  role: string;
}

// Invite user response
export interface InviteUserResponse {
  success: boolean;
  message: string;
  data: {
    invitation: Participant;
    event: {
      id: number;
      title: string;
      date: string;
      time: string;
      location: string;
    };
    invitedUser: {
      id: number;
      username: string;
      email: string;
      fullName: string;
    };
    invitedBy: {
      id: number;
      role: string;
    };
  };
}


export interface Organizer {
  userID: string;
  eventID: string;
  role: string;
  status: EventStatus;
  invitedAt: string;
  respondedAt: string;
  hasResponded: boolean;
  permissions: Permissions; // Fixed capitalization
}
