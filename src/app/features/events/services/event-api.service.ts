import { Injectable } from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {
  EventResponse,
  EventsListResponse,
  CreateEvent,
  ParticipantsResponse,
  UpdateEventStatus,
  InviteUserRequest,
  InviteUserResponse,
  EventStatus,
  ResponseStatus,
  UpdateStatusResponse
} from '../../../core/models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventApiService {

  private apiUrl = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) { }

  // Get all events organized by current user
  getOrganizedEvents(): Observable<EventsListResponse> {
    return this.http.get<EventsListResponse>(`${this.apiUrl}/organizer`);
  }

  // Get invited events for current user
  getInvitedEvents(): Observable<EventsListResponse> {
    return this.http.get<EventsListResponse>(`${this.apiUrl}/invited`);
  }

  // Get single event by ID
  getEventById(eventId: string): Observable<EventResponse> {
    return this.http.get<EventResponse>(`${this.apiUrl}/${eventId}`);
  }

  // Create new event
  createEvent(data: CreateEvent): Observable<EventResponse> {
    return this.http.post<EventResponse>(`${this.apiUrl}`, data);
  }

  // Update event
  // updateEvent(eventId: string, data: UpdateEventRequest): Observable<EventResponse> {
  //   return this.http.put<EventResponse>(`${this.apiUrl}/${eventId}`, data);
  // }

  // Update event status if user is going, ....
  updateEventStatus(eventId: string, status: EventStatus): Observable<UpdateStatusResponse> {
    return this.http.patch<UpdateStatusResponse>(`${this.apiUrl}/${eventId}/response`, { status });
  }

  // Respond to an invitation
  respondToInvitation(eventId: string, status: ResponseStatus): Observable<UpdateStatusResponse> {
    return this.http.put<UpdateStatusResponse>(`${this.apiUrl}/${eventId}/response`, { status });
  }


  // Delete event
  deleteEvent(eventId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${eventId}`);
  }

  // Get event participants
  getEventParticipants(eventId: string): Observable<ParticipantsResponse> {
    return this.http.get<ParticipantsResponse>(`${this.apiUrl}/${eventId}/participants`);
  }

  // Invite user to event
  inviteUser(eventId: string, inviteData: InviteUserRequest): Observable<InviteUserResponse> {
    return this.http.post<InviteUserResponse>(`${this.apiUrl}/${eventId}/invite`, inviteData);
  }

  // Search events
  searchEvents(keyword: string): Observable<EventsListResponse> {
    return this.http.get<EventsListResponse>(`${this.apiUrl}/search`, {
      params: { keyword }
    });
  }

}
