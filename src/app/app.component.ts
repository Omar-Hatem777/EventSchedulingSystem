import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SignupComponent } from "./features/auth/components/signup/signup.component";
import { FooterComponent } from "./shared/components/footer/footer.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'EventSchedulingSystem';
}
