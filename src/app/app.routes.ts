import { Routes} from '@angular/router';
import { SignupComponent } from './features/auth/components/signup/signup.component';
import { LoginComponent } from './features/auth/components/login/login.component';


export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    
    { path: '**', redirectTo: '/login' }
];
