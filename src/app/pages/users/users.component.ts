import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import type { StaffRole, UserListItem } from '../../core/models/admin.models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit {
  private readonly userService = inject(UserService);

  users = signal<UserListItem[]>([]);
  err = signal<string | null>(null);
  loading = signal(false);

  newEmail = '';
  newPassword = '';
  newName = '';
  newRole: StaffRole = 'SELLER';

  readonly roles: StaffRole[] = ['ADMIN', 'SELLER', 'COLLABORATOR'];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.err.set(null);
    this.userService.list().subscribe({
      next: (rows) => {
        this.users.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.err.set('No se pudieron cargar los usuarios.');
        this.loading.set(false);
      },
    });
  }

  create(): void {
    if (!this.newEmail.trim() || !this.newPassword || !this.newName.trim()) {
      this.err.set('Completa correo, contraseña y nombre.');
      return;
    }
    this.err.set(null);
    this.userService
      .create({
        email: this.newEmail.trim(),
        password: this.newPassword,
        fullName: this.newName.trim(),
        role: this.newRole,
      })
      .subscribe({
        next: () => {
          this.newEmail = '';
          this.newPassword = '';
          this.newName = '';
          this.load();
        },
        error: (e) => this.err.set(e.error?.error ?? 'Error al crear'),
      });
  }

  changeRole(u: UserListItem, role: string): void {
    this.userService.updateRole(u.id, role as StaffRole | 'CUSTOMER').subscribe({
      next: () => this.load(),
      error: (e) => this.err.set(e.error?.error ?? 'Error al actualizar rol'),
    });
  }

  changeAlias(u: UserListItem, alias: string): void {
    this.userService.updateDetails(u.id, { alias: alias.trim() || null }).subscribe({
      next: () => this.load(),
      error: (e) => this.err.set(e.error?.error ?? 'Error al actualizar alias'),
    });
  }

  toggleFreeShipping(u: UserListItem, freeShipping: boolean): void {
    this.userService.updateDetails(u.id, { free_shipping: freeShipping }).subscribe({
      next: () => this.load(),
      error: (e) => this.err.set(e.error?.error ?? 'Error al actualizar free shipping'),
    });
  }
}
