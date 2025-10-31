import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SignupRequest, AuthResponse, LoginRequest } from '../../../core/models/user.model';


@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) { }


  signup(data: SignupRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data);
  }

  /**
   * Login user
   */
  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data);
  }

  /**
   * Verify token (optional - if your backend has this endpoint)
   */
  verifyToken(): Observable<{ valid: boolean; user?: any }> {
    return this.http.get<{ valid: boolean; user?: any }>(`${this.apiUrl}/verify`);
  }

  /**
   * Refresh token (optional - if you implement refresh tokens)
   */
  refreshToken(refreshToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken });
  }
}