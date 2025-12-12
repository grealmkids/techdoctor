import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="login-container">
      <div class="card">
        <h1>Admin Access</h1>
        <p>Restricted to <strong>The Tech Doctor</strong>.</p>
        <button class="btn google-btn" (click)="login()">
          Sign in with Google
        </button>
      </div>
    </div>
  `,
  styles: [`
    .login-container { display: flex; justify-content: center; align-items: center; height: 80vh; }
    .card { text-align: center; padding: 3rem; background: white; border: 1px solid #eee; border-radius: 12px; }
    h1 { font-family: 'DM Serif Display', serif; color: var(--color-primary); }
    .google-btn { margin-top: 1.5rem; background: #DB4437; border-color: #DB4437; color: white; }
    .google-btn:hover { background: #c53929; }
  `]
})
export class LoginComponent {
  constructor(private auth: AuthService) { }
  login() { this.auth.loginWithGoogle(); }
}
