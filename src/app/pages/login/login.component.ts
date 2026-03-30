import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  err = signal<string | null>(null);

  submit(): void {
    if (!this.email.trim() || !this.password) {
      this.err.set('Completa correo y contraseña.');
      return;
    }
    this.loading.set(true);
    this.err.set(null);
    this.auth.login(this.email.trim(), this.password).subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigateByUrl('/admin/dashboard');
      },
      error: (e) => {
        this.loading.set(false);
        this.err.set(e.error?.error ?? 'Error al iniciar sesión');
      },
    });
  }
}
