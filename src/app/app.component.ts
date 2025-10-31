import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SignupComponent } from "./features/auth/components/signup/signup.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'EventSchedulingSystem';
}
