import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-profile',
  imports: [DatePipe, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfilePage {
  auth = inject(AuthService);
  private usersService = inject(UsersService);
  private toast = inject(ToastService);

  resendLoading = signal(false);

  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';
  passwordLoading = signal(false);

  newEmail = '';
  emailPassword = '';
  emailLoading = signal(false);

  async resendVerification(): Promise<void> {
    this.resendLoading.set(true);
    try {
      await firstValueFrom(this.auth.resendVerification());
      this.toast.success('Email reenviado');
    } catch (err: any) {
      this.toast.error(err.error?.message || 'No se pudo reenviar el email');
    } finally {
      this.resendLoading.set(false);
    }
  }

  async changePassword(): Promise<void> {
    if (this.newPassword !== this.confirmNewPassword) {
      this.toast.error('Las contraseñas no coinciden');
      return;
    }

    this.passwordLoading.set(true);
    try {
      await firstValueFrom(this.usersService.updateMyPassword(this.currentPassword, this.newPassword));
      this.toast.success('Contraseña actualizada');
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmNewPassword = '';
    } catch (err: any) {
      this.toast.error(err.error?.message || 'No se pudo cambiar la contraseña');
    } finally {
      this.passwordLoading.set(false);
    }
  }

  async changeEmail(): Promise<void> {
    this.emailLoading.set(true);
    try {
      await firstValueFrom(this.usersService.updateMyEmail(this.newEmail, this.emailPassword));
      this.toast.success('Email actualizado');
      this.newEmail = '';
      this.emailPassword = '';
      await firstValueFrom(this.auth.me());
    } catch (err: any) {
      this.toast.error(err.error?.message || 'No se pudo cambiar el email');
    } finally {
      this.emailLoading.set(false);
    }
  }
}
