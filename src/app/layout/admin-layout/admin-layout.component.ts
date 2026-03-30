import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {
  readonly auth = inject(AuthService);

  isAdmin(): boolean {
    return this.auth.hasAnyRole('ADMIN');
  }

  isStaff(): boolean {
    return this.auth.hasAnyRole('ADMIN', 'SELLER', 'COLLABORATOR');
  }

  isOrdersStaff(): boolean {
    return this.auth.hasAnyRole('ADMIN', 'SELLER');
  }
}
