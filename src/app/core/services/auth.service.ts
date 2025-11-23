import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthApiService } from '../../features/auth/services/auth-api.service';
import { SignupRequest, AuthResponse, LoginRequest , User } from '../models/user.model';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // State management
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private authApiService: AuthApiService, private router: Router)
  {
    // Check if user is already logged in on service initialization
    this.checkAuthStatus();
  }


  //Check authentication status on app load
  private checkAuthStatus(): void {
    const token = this.getToken();
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);

        // Optional: Verify token with backend
        // this.verifyToken().subscribe();
      } catch (error) {
        this.logout();
      }
    }
  }

  // Register new user
  signup(data: SignupRequest): Observable<AuthResponse> {
    return this.authApiService.signup(data).pipe(
      tap(response => {
        if (response.success) {
          this.handleAuthSuccess(response);
        }
      })
    );
  }

  // Login user
  login(data: LoginRequest): Observable<AuthResponse> {
    return this.authApiService.login(data).pipe(
      tap(response => {
        if (response.success) {
          this.handleAuthSuccess(response);
        }
      })
    );
  }

  // Handle successful authentication
  private handleAuthSuccess(response: AuthResponse): void {
    const user = response.data.user;
    const token = response.data.token;

    if (user && token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    } else {
      console.error('Auth response is missing user or token:', response);
    }
  }


  // Logout user
  logout(): void {
    // Clear storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Update state
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);

    // Redirect to login
    this.router.navigate(['/login']);
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Verify token (optional)
   */
  verifyToken(): Observable<{ valid: boolean; user?: any }> {
    return this.authApiService.verifyToken().pipe(
      tap(response => {
        if (!response.valid) {
          this.logout();
        }
      })
    );
  }
  
}